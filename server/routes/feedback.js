const express = require('express');
const router = express.Router();
const { feedbackValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', protect, feedbackValidation, async (req, res) => {
    try {
        const { text, category } = req.body;
        
        // Mock feedback logging/storage
        console.log(`[Feedback Received] User: ${req.user._id}, Category: ${category}, Content: ${text}`);

        res.status(201).json({
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
