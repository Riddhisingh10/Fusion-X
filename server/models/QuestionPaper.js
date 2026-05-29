const mongoose = require('mongoose');

const QuestionPaperSchema = new mongoose.Schema({
    year: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        enum: ['Internal 1', 'Internal 2', 'Internal 3', 'Semester End Exam', 'Quiz'],
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

QuestionPaperSchema.index({ year: 1, subject: 1, examType: 1 });

module.exports = mongoose.model('QuestionPaper', QuestionPaperSchema);
