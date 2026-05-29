const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['PDF', 'Image', 'Video'],
        default: 'PDF'
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Teacher Note', 'Best Student Note'],
        required: true
    },
    verifiedBy: String,
    fileUrl: String,
    subject: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', NoteSchema);
