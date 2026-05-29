const { body, validationResult } = require('express-validator');

// Common request validation interceptor
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return a generic error to prevent exposing internal schema configurations
        return res.status(400).json({ 
            message: 'Validation failed: Invalid input data provided.' 
        });
    }
    next();
};

const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .escape(),
    body('email')
        .trim()
        .toLowerCase()
        // Must match @college.edu pattern
        .matches(/^[a-zA-Z0-9._%+-]+@college\.edu$/),
    body('password')
        // Must be at least 8 characters with complexity: uppercase, lowercase, digit, and special char
        .isLength({ min: 8 })
        .matches(/[a-z]/)
        .matches(/[A-Z]/)
        .matches(/[0-9]/)
        .matches(/[^a-zA-Z0-9]/),
    validateRequest
];

const loginValidation = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail(),
    body('password')
        .notEmpty(),
    validateRequest
];

const feedbackValidation = [
    body('text')
        .trim()
        .isLength({ max: 500 })
        // Enforce no HTML tags to prevent HTML/XSS injection
        .custom((value) => {
            const htmlTagRegex = /<[^>]*>/;
            if (htmlTagRegex.test(value)) {
                throw new Error('HTML tags are not allowed');
            }
            return true;
        })
        .escape(),
    body('category')
        .trim()
        .notEmpty()
        .escape(),
    validateRequest
];

module.exports = {
    registerValidation,
    loginValidation,
    feedbackValidation
};
