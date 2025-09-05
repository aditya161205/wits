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
    // ✅ RENAMED & RESTRUCTURED: This now perfectly matches what the frontend expects.
    // It stores an array of objects, each containing a puzzleId.
    recentlySolved: [{
        _id: false, // We don't need a separate ID for this sub-document
        puzzleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Puzzle' }
    }]
});

module.exports = mongoose.model('user', UserSchema);