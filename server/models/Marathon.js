const mongoose = require('mongoose');

const MarathonSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    venue: String,
    duration: String,
    host: String,
    date: Date,
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming'
    },
    registeredUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    testAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Marathon', MarathonSchema);
