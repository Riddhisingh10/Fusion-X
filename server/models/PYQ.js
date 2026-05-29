const mongoose = require('mongoose');

const PYQSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    yearsAsked: [{
        type: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PYQ', PYQSchema);
