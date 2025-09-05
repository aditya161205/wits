const express = require('express');
const router = express.Router();
const Puzzle = require('../models/Puzzle');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route GET api/puzzles
// No changes needed here
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
// No changes needed here
router.post('/', auth, async (req, res) => {
    if (!req.user.isAdmin) return res.status(401).json({ msg: 'Not authorized' });

    try {
        const newPuzzle = new Puzzle({ ...req.body });
        const puzzle = await newPuzzle.save();
        res.json(puzzle);
    } catch (err)
    {
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
        
        // ✅ FIX #1: Restored robust answer checking for both numbers and text.
        const normalize = (val) => val?.toString().trim().toLowerCase();
        let isCorrect = false;

        const numAnswer = parseFloat(puzzle.answer);
        const numUserAnswer = parseFloat(userAnswer);
        if (!isNaN(numAnswer) && !isNaN(numUserAnswer)) {
            isCorrect = numAnswer === numUserAnswer;
        }
        if (!isCorrect) {
            isCorrect = normalize(userAnswer) === normalize(puzzle.answer);
        }

        if (!isCorrect) {
            return res.status(400).json({ msg: 'Incorrect answer' });
        }
        
        // ✅ FIX #2: Added defensive checks to prevent crash from old/bad data.
        // This ensures `user.recentlySolved`, `p`, and `p.puzzleId` exist before calling .toString()
        const alreadySolved = user.recentlySolved && user.recentlySolved.some(
            p => p && p.puzzleId && p.puzzleId.toString() === puzzle._id.toString()
        );

        if (!alreadySolved) {
            puzzle.solvedCount += 1;
            
            user.puzzlesSolved += 1;
            user.xp += (puzzle.xpReward || 100);

            const diffKey = puzzle.difficulty.toLowerCase();
            if (user.difficultyBreakdown.hasOwnProperty(diffKey)) {
                user.difficultyBreakdown[diffKey] += 1;
            }

            // Push an object to the array, not just an ID
            user.recentlySolved.push({ puzzleId: puzzle._id });
            
            await puzzle.save();
        }

        await user.save();
        
        // Return the complete, updated user object.
        res.json(user);

    } catch (err) {
        console.error('Solve Route Error:', err.message);
        res.status(500).send('Server Error');
    }
});


// @route DELETE api/puzzles/:id (Admin only)
// No changes needed here
router.delete('/:id', auth, async (req, res) => {
    if (!req.user.isAdmin) return res.status(401).json({ msg: 'Not authorized' });

    try {
        await Puzzle.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Puzzle removed' });
    } catch (err) {
        console.error('Error deleting puzzle:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
