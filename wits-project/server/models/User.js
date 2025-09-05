const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    xp: { type: Number, default: 0 },
    puzzlesSolved: { type: Number, default: 0 },
    difficultyBreakdown: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
    },
    recentlySolved: [{
        _id: false,
        puzzleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Puzzle' }
    }],
 
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

module.exports = mongoose.model('user', UserSchema);