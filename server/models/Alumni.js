const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    batch: Number,
    company: String,
    role: String,
    email: String,
    linkedIn: String,
    isAvailableForMentorship: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alumni', AlumniSchema);
