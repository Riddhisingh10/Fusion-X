const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/doubts
// @desc    Get all doubts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, subject } = req.query;
        const query = {};
        if (status) query.status = status;
        if (subject) query.subject = subject;

        const doubts = await Doubt.find(query)
            .populate('askedBy', 'name')
            .populate('answeredBy', 'name')
            .sort({ createdAt: -1 });
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/doubts
// @desc    Ask a new doubt
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { question, subject } = req.body;

        const doubt = await Doubt.create({
            question,
            subject,
            askedBy: req.user.id
        });

        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/doubts/:id/answer
// @desc    Answer a doubt
// @access  Private (Teacher/Admin)
router.put('/:id/answer', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { answer } = req.body;
        const doubt = await Doubt.findById(req.params.id);

        if (!doubt) {
            return res.status(404).json({ message: 'Doubt not found' });
        }

        doubt.answer = answer;
        doubt.answeredBy = req.user.id;
        doubt.status = 'Resolved';
        await doubt.save();

        res.json(doubt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
