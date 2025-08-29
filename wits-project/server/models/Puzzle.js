// server/models/Puzzle.js
const mongoose = require('mongoose');
const PuzzleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    hints: [String],
    timeLimit: { type: Number, required: true },
    solvedCount: { type: Number, default: 0 },
    successRate: { type: Number, default: 80 },
    avgTime: { type: String, default: '5m 0s' },
    featured: { type: Boolean, default: false }
});
module.exports = mongoose.model('puzzle', PuzzleSchema);