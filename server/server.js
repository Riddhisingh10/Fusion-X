const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();

// 1. Helmet Security Headers Configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://*.googleapis.com", "https://*.google.com", "https://www.google-analytics.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.googleapis.com", "https://*.google.com"],
            connectSrc: ["'self'", "https://api.connectprep.in", "http://localhost:5001", "ws://localhost:*", "wss://localhost:*"],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year (365 days) in seconds
        includeSubDomains: true,
        preload: true
    }
}));

// 2. CORS Configuration (Strict whitelist - credentials: true, no '*' in prod)
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://connectprep.in']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, postman, or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// 3. NoSQL Injection Prevention
app.use(mongoSanitize());

// Request Parsers with limits to prevent DOS attacks
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 4. Tiered Rate Limiting Configuration
// Helper to construct rate limiters with standardized error responses
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true, // Return rate limit info in standard Headers
        legacyHeaders: false, // Disable older headers
        handler: (req, res, next, options) => {
            const retryAfter = Math.ceil(options.windowMs / 1000);
            res.status(429).json({
                message: `${message}. Please try again after ${Math.ceil(retryAfter / 60)} minutes.`,
                retryAfterSeconds: retryAfter
            });
        }
    });
};

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = createRateLimiter(
    15 * 60 * 1000, 
    100, 
    'Too many requests from this IP'
);
app.use(globalLimiter);

// Auth rate limiter: max 5 requests per 15 minutes per IP
const authLimiter = createRateLimiter(
    15 * 60 * 1000, 
    5, 
    'Too many login/registration attempts'
);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// File upload rate limiter: max 10 uploads per hour per IP
const fileUploadLimiter = createRateLimiter(
    60 * 60 * 1000, 
    10, 
    'File upload limit exceeded'
);
// Apply limit to POST requests for note and paper uploads
app.use('/api/papers', (req, res, next) => {
    if (req.method === 'POST') {
        return fileUploadLimiter(req, res, next);
    }
    next();
});
app.use('/api/notes', (req, res, next) => {
    if (req.method === 'POST') {
        return fileUploadLimiter(req, res, next);
    }
    next();
});

// Feedback submission rate limiter: max 3 per hour per IP
const feedbackLimiter = createRateLimiter(
    60 * 60 * 1000, 
    3, 
    'Feedback submission limit exceeded'
);
app.use('/api/feedback', feedbackLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/marathons', require('./routes/marathons'));
app.use('/api/p2p', require('./routes/p2p'));
app.use('/api/library', require('./routes/library'));
app.use('/api/results', require('./routes/results'));
app.use('/api/doubts', require('./routes/doubts'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/feedback', require('./routes/feedback'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Connect & Prep API is running securely' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
