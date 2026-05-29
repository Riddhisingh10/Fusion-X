const express = require('express');
const router = express.Router();
const QuestionPaper = require('../models/QuestionPaper');
const PYQ = require('../models/PYQ');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/papers
// @desc    Get all question papers with optional filters
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { year, college, subject, examType } = req.query;
        const query = {};

        if (year) query.year = year;
        if (college) query.college = college;
        if (subject) query.subject = subject;
        if (examType) query.examType = examType;

        const papers = await QuestionPaper.find(query).sort({ createdAt: -1 });
        res.json(papers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/papers
// @desc    Upload a new question paper
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { year, college, subject, examType, fileUrl } = req.body;

        const paper = await QuestionPaper.create({
            year,
            college,
            subject,
            examType,
            fileUrl,
            uploadedBy: req.user.id
        });

        res.status(201).json(paper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/papers/pyqs
// @desc    Get all previous year questions
// @access  Private
router.get('/pyqs', protect, async (req, res) => {
    try {
        const pyqs = await PYQ.find().sort({ createdAt: -1 });
        res.json(pyqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/papers/pyqs
// @desc    Add a new PYQ
// @access  Private (Teacher/Admin)
router.post('/pyqs', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { question, subject, yearsAsked } = req.body;
        const pyq = await PYQ.create({ question, subject, yearsAsked });
        res.status(201).json(pyq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
