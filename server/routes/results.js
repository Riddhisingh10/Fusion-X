const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/results
// @desc    Get current user's results
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.id }).sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/results
// @desc    Add a new result (Teacher/Admin)
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { studentId, type, title, score, status, weakAreas, feedback } = req.body;

        const result = await Result.create({
            student: studentId,
            type,
            title,
            score,
            status,
            weakAreas,
            feedback
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
