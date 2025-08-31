// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpTotal: { type: Number, default: 250 },
    puzzlesSolved: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    avgTime: { type: String, default: '0:00' },
    dailyStreak: { type: Number, default: 0 },
    difficultyBreakdown: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
    },
    // ✅ New daily solve log for heatmap
    solveLog: [{
        _id: false,
        date: { type: String, required: true }, // e.g. "2025-03-01"
        count: { type: Number, default: 1 }
    }]
});

module.exports = mongoose.model('user', UserSchema);