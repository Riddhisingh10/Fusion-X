const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/notes
// @desc    Get all notes
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { category, subject } = req.query;
        const query = {};

        if (category) query.category = category;
        if (subject) query.subject = subject;

        const notes = await Note.find(query).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/notes
// @desc    Upload a new note
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { title, type, author, category, verifiedBy, fileUrl, subject } = req.body;

        const note = await Note.create({
            title,
            type,
            author,
            category,
            verifiedBy,
            fileUrl,
            subject,
            uploadedBy: req.user.id
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
