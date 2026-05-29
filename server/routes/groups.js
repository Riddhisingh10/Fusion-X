const express = require('express');
const router = express.Router();
const StudyGroup = require('../models/StudyGroup');
const { protect } = require('../middleware/auth');

// @route   GET /api/groups
// @desc    Get all study groups
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const groups = await StudyGroup.find({ isActive: true })
            .populate('host', 'name')
            .sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/groups
// @desc    Create a new study group
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, topic, venue, time } = req.body;

        const group = await StudyGroup.create({
            name,
            topic,
            venue,
            time,
            host: req.user.id,
            hostName: req.user.name,
            members: [req.user.id]
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/groups/:id/join
// @desc    Join a study group
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        if (group.members.length >= group.maxMembers) {
            return res.status(400).json({ message: 'Group is full' });
        }

        group.members.push(req.user.id);
        await group.save();

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
