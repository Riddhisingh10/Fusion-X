const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/attendance
// @desc    Get current user's attendance
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const attendance = await Attendance.find({ student: req.user.id }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/attendance/summary
// @desc    Get course-wise attendance summary for current user
// @access  Private
router.get('/summary', protect, async (req, res) => {
    try {
        const summary = await Attendance.aggregate([
            { $match: { student: req.user._id } },
            {
                $group: {
                    _id: { courseCode: '$courseCode', courseName: '$courseName' },
                    total: { $sum: 1 },
                    present: {
                        $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    courseCode: '$_id.courseCode',
                    courseName: '$_id.courseName',
                    total: 1,
                    present: 1,
                    percentage: {
                        $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 0]
                    }
                }
            }
        ]);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/attendance
// @desc    Mark attendance (teacher/admin only)
// @access  Private (Teacher/Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { studentId, courseCode, courseName, date, status, term, curriculum } = req.body;

        const attendance = await Attendance.create({
            student: studentId,
            courseCode,
            courseName,
            date,
            status,
            term,
            curriculum,
            markedBy: req.user.id
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
