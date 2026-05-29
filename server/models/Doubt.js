const mongoose = require('mongoose');

const DoubtSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    askedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved', 'Pending'],
        default: 'Open'
    },
    answer: String,
    answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Doubt', DoubtSchema);
