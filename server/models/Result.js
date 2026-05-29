const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Semester', 'Marathon', 'Quiz'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    score: String,
    status: {
        type: String,
        enum: ['Pass', 'Fail', 'Distinction', 'Excellent'],
        default: 'Pass'
    },
    weakAreas: [String],
    feedback: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Result', ResultSchema);
