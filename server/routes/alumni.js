const express = require('express');
const router = express.Router();
const Alumni = require('../models/Alumni');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/alumni
// @desc    Get all alumni
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { company, batch } = req.query;
        const query = {};
        if (company) query.company = company;
        if (batch) query.batch = parseInt(batch);

        const alumni = await Alumni.find(query).sort({ batch: -1 });
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/alumni
// @desc    Add a new alumni (Admin)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, batch, company, role, email, linkedIn, isAvailableForMentorship } = req.body;

        const alumni = await Alumni.create({
            name,
            batch,
            company,
            role,
            email,
            linkedIn,
            isAvailableForMentorship
        });

        res.status(201).json(alumni);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
