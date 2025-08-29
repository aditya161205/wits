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

        // First try numeric comparison
        const numAnswer = parseFloat(puzzle.answer);
        const numUserAnswer = parseFloat(userAnswer);

        if (!isNaN(numAnswer) && !isNaN(numUserAnswer)) {
            isCorrect = numAnswer === numUserAnswer;
        }

        // If not numeric, check case-insensitive string comparison
        if (!isCorrect) {
            isCorrect = normalize(userAnswer) === normalize(puzzle.answer);
        }

        if (!isCorrect) {
            return res.status(400).json({ msg: 'Incorrect answer' });
        }

        // Ensure user fields exist
        if (!Array.isArray(user.recentlySolved)) user.recentlySolved = [];
        if (!user.difficultyBreakdown) user.difficultyBreakdown = {};

        const alreadySolved = user.recentlySolved.some(
            (p) => p?.puzzleId?.toString() === puzzle._id.toString()
        );

        if (!alreadySolved) {
            // Update puzzle stats
            puzzle.solvedCount = (puzzle.solvedCount || 0) + 1;
            await puzzle.save();

            // Update user stats
            user.puzzlesSolved = (user.puzzlesSolved || 0) + 1;
            user.xp = (user.xp || 0) + 100;

            const diffKey = puzzle.difficulty?.toLowerCase() || 'easy';
            user.difficultyBreakdown[diffKey] = (user.difficultyBreakdown[diffKey] || 0) + 1;

            // Update recently solved list
            user.recentlySolved.unshift({
                puzzleId: puzzle._id,
                title: puzzle.title,
                category: puzzle.category,
                difficulty: puzzle.difficulty,
            });
            if (user.recentlySolved.length > 5) user.recentlySolved.pop();

            await user.save();
        }

        res.json({ msg: 'Correct!', user, puzzle });
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
