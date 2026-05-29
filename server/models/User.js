const mongoose = require('mongoose');
const { hashPassword, verifyPassword } = require('../utils/crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    usn: {
        type: String,
        sparse: true
    },
    college: String,
    curriculum: String,
    term: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (err) {
        next(err);
    }
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await verifyPassword(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
