// server/routes/puzzles.js
const express = require('express');
const router = express.Router();
const Puzzle = require('../models/Puzzle');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route GET api/puzzles
router.get('/', async (req, res) => {
    try {
        const puzzles = await Puzzle.find().sort({ _id: -1 });
        res.json(puzzles);
    } catch (err) {
        console.error('Error fetching puzzles:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/puzzles (Admin only)
router.post('/', auth, async (req, res) => {
    if (!req.user.isAdmin) return res.status(401).json({ msg: 'Not authorized' });

    try {
        const newPuzzle = new Puzzle({ ...req.body });
        const puzzle = await newPuzzle.save();
        res.json(puzzle);
    } catch (err) {
        console.error('Error adding puzzle:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/puzzles/:id/solve
router.post('/:id/solve', auth, async (req, res) => {
    try {
        const puzzle = await Puzzle.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!puzzle || !user) return res.status(404).json({ msg: 'Not found' });

        const { userAnswer } = req.body;
        if (!userAnswer) return res.status(400).json({ msg: 'Answer is required' });

        // Normalize function for string comparison
        const normalize = (val) => val?.toString().trim().toLowerCase();

        let isCorrect = false;

        // Try numeric comparison first
        const numAnswer = parseFloat(puzzle.answer);
        const numUserAnswer = parseFloat(userAnswer);

        if (!isNaN(numAnswer) && !isNaN(numUserAnswer)) {
            isCorrect = numAnswer === numUserAnswer;
        }

        // Then text comparison (case insensitive)
        if (!isCorrect) {
            isCorrect = normalize(userAnswer) === normalize(puzzle.answer);
        }

        if (!isCorrect) {
            return res.status(400).json({ msg: 'Incorrect answer' });
        }

        // ✅ Check if puzzle already solved
        const alreadySolved = user.solveLog?.some(
            (entry) => entry.puzzleId?.toString() === puzzle._id.toString()
        );

        // Award XP only if not solved before
        if (!alreadySolved) {
            puzzle.solvedCount = (puzzle.solvedCount || 0) + 1;
            await puzzle.save();

            user.puzzlesSolved = (user.puzzlesSolved || 0) + 1;
            user.xp = (user.xp || 0) + 100;

            const diffKey = puzzle.difficulty?.toLowerCase() || 'easy';
            user.difficultyBreakdown[diffKey] = (user.difficultyBreakdown[diffKey] || 0) + 1;
        }

        // ✅ Always mark the solve in solveLog by DAY
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

        const logEntry = user.solveLog.find(l => l.date === dateKey);
        if (logEntry) {
            logEntry.count += 1;
        } else {
            user.solveLog.push({ date: dateKey, count: 1 });
        }

        await user.save();

        res.json({ msg: 'Correct!', user, puzzle, alreadySolved });
    } catch (err) {
        console.error('Solve Route Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route DELETE api/puzzles/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
    if (!req.user.isAdmin) return res.status(401).json({ msg: 'Not authorized' });

    try {
        const puzzle = await Puzzle.findById(req.params.id);
        if (!puzzle) return res.status(404).json({ msg: 'Puzzle not found' });

        await Puzzle.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Puzzle removed' });
    } catch (err) {
        console.error('Error deleting puzzle:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;