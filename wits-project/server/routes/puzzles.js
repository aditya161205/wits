const express = require('express');
const router = express.Router();
const Puzzle = require('../models/Puzzle');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route GET api/puzzles
router.get('/', async (req, res) => {
    try {
        const puzzles = await Puzzle.find().sort({_id: -1});
        res.json(puzzles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route POST api/puzzles (Admin only)
router.post('/', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.status(401).json({ msg: 'Not authorized' });
    try {
        const newPuzzle = new Puzzle({ ...req.body });
        const puzzle = await newPuzzle.save();
        res.json(puzzle);
    } catch(err) {
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

        if (userAnswer.trim().toLowerCase() !== puzzle.answer.toLowerCase()) {
            return res.status(400).json({ msg: 'Incorrect answer' });
        }
        
        // --- UPDATED LOGIC ---
        const alreadySolved = user.recentlySolved.some(p => p.puzzleId.toString() === puzzle._id.toString());
        
        if (!alreadySolved) {
            // Update puzzle's solved count
            puzzle.solvedCount += 1;
            await puzzle.save();
            
            // Update user stats
            user.puzzlesSolved += 1;
            user.xp += 100;
            user.difficultyBreakdown[puzzle.difficulty.toLowerCase()] += 1;
            user.recentlySolved.unshift({ 
                puzzleId: puzzle._id, 
                title: puzzle.title, 
                category: puzzle.category, 
                difficulty: puzzle.difficulty 
            });
            if (user.recentlySolved.length > 5) user.recentlySolved.pop();
            
            await user.save();
        }
        
        // Return both updated puzzle and user
        res.json({ msg: 'Correct!', user, puzzle });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- NEW ROUTE ---
// @route DELETE api/puzzles/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
    if (!req.user.isAdmin) return res.status(401).json({ msg: 'Not authorized' });
    try {
        const puzzle = await Puzzle.findById(req.params.id);
        if (!puzzle) return res.status(404).json({ msg: 'Puzzle not found' });

        await Puzzle.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Puzzle removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;