const express = require('express');
const router = express.Router();
const Marathon = require('../models/Marathon');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/marathons
// @desc    Get all marathons
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const marathons = await Marathon.find().sort({ date: -1 });
        res.json(marathons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/marathons
// @desc    Create a new marathon
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { topic, venue, duration, host, date } = req.body;

        const marathon = await Marathon.create({
            topic,
            venue,
            duration,
            host,
            date
        });

        res.status(201).json(marathon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/marathons/:id/register
// @desc    Register for a marathon
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
    try {
        const marathon = await Marathon.findById(req.params.id);

        if (!marathon) {
            return res.status(404).json({ message: 'Marathon not found' });
        }

        if (marathon.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already registered' });
        }

        marathon.registeredUsers.push(req.user.id);
        await marathon.save();

        res.json(marathon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
