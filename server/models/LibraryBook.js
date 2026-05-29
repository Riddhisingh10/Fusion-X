const mongoose = require('mongoose');

const LibraryBookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: String,
    isbn: String,
    status: {
        type: String,
        enum: ['Available', 'Borrowed', 'Reserved'],
        default: 'Available'
    },
    borrowedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dueDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LibraryBook', LibraryBookSchema);
