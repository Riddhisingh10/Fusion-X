const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { protect } = require('../middleware/auth');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { registerValidation, loginValidation } = require('../middleware/validation');

// Cookie options helper
const getCookieOptions = () => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Enforce SSL/HTTPS in production, allow HTTP in development
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    };
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
    try {
        const { name, email, password, role, usn } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({ name, email, password, role, usn });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt
        });

        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, getCookieOptions());

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                usn: user.usn
            },
            accessToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get tokens
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check role if provided
        if (role && user.role !== role) {
            return res.status(401).json({ message: 'Invalid role for this account' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt
        });

        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, getCookieOptions());

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                usn: user.usn
            },
            accessToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/refresh
// @desc    Get new access token using refresh token (with rotation)
// @access  Public
router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        // Verify refresh token signature
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        // Look up refresh token in MongoDB
        const storedToken = await RefreshToken.findOne({ token }).populate('user');
        if (!storedToken) {
            return res.status(401).json({ message: 'Refresh token not recognized or revoked' });
        }

        // Check if token has expired
        if (new Date() > storedToken.expiresAt) {
            await RefreshToken.deleteOne({ token });
            res.clearCookie('refreshToken', getCookieOptions());
            return res.status(401).json({ message: 'Refresh token has expired' });
        }

        const user = storedToken.user;
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Generate new tokens (Rotation!)
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Delete old refresh token from database
        await RefreshToken.deleteOne({ token });

        // Save new refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await RefreshToken.create({
            token: newRefreshToken,
            user: user._id,
            expiresAt
        });

        // Set new refresh token in HttpOnly cookie
        res.cookie('refreshToken', newRefreshToken, getCookieOptions());

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                usn: user.usn
            },
            accessToken: newAccessToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user & revoke refresh token
// @access  Public
router.post('/logout', async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            // Delete token from MongoDB
            await RefreshToken.deleteOne({ token });
        }

        // Clear cookie
        res.clearCookie('refreshToken', getCookieOptions());
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
