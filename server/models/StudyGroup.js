const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    venue: String,
    time: String,
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hostName: String,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxMembers: {
        type: Number,
        default: 20
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudyGroup', StudyGroupSchema);
