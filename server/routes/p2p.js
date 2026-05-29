const express = require('express');
const router = express.Router();
const P2PSession = require('../models/P2PSession');
const { protect } = require('../middleware/auth');

// @route   GET /api/p2p
// @desc    Get all P2P sessions
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const sessions = await P2PSession.find({ status: 'Scheduled' })
            .populate('tutor', 'name')
            .sort({ time: 1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/p2p
// @desc    Create a new P2P session (as tutor)
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { topic, time, venue, maxStudents } = req.body;

        const session = await P2PSession.create({
            tutor: req.user.id,
            tutorName: req.user.name,
            topic,
            time,
            venue,
            maxStudents
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/p2p/:id/register
// @desc    Register for a P2P session
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
    try {
        const session = await P2PSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.registeredStudents.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already registered' });
        }

        if (session.registeredStudents.length >= session.maxStudents) {
            return res.status(400).json({ message: 'Session is full' });
        }

        session.registeredStudents.push(req.user.id);
        await session.save();

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
