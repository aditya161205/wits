const express = require('express');
const router = express.Router();
const Puzzle = require('../models/Puzzle');
const User = require('../models/User');
const auth = require('../middleware/auth');


const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });


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
        const {
            title,
            category,
            difficulty,
            question,
            answer,
            explanation,
            hints,
            timeLimit,
            featured,
            xpReward,
            tags
        } = req.body;

        const newPuzzle = new Puzzle({
            title,
            category,
            difficulty,
            question,
            answer,
            explanation,
            hints,
            timeLimit,
            featured,
            xpReward,
            tags
        });

        const puzzle = await newPuzzle.save();
        res.json(puzzle);
    } catch (err) {
        console.error('Error adding puzzle:', err.message);
        res.status(500).send('Server Error');
    }
});


// =================================================================
// START: NEW CODE FOR GEMINI
// =================================================================

// 3. This is your new AI endpoint to handle explanations
router.post('/explain', async (req, res) => {
    try {
        const { type, questionText, solutionCode } = req.body;

        let prompt = "";

        if (type === 'question') {
            prompt = `You are a helpful teaching assistant for a programming interview prep website. A user needs clarification on a puzzle. Explain the puzzle's goal, inputs, and expected outputs in a simple way. Here is the puzzle: "${questionText}"`;
        } else if (type === 'solution') {
            prompt = `You are an expert code reviewer. A user wants to understand a solution. Explain the provided code step-by-step, describe the logic, and analyze its time and space complexity. Here is the puzzle: "${questionText}". Here is the solution code: \`\`\`${solutionCode}\`\`\``;
        } else {
            return res.status(400).json({ error: 'Invalid explanation type.' });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const explanation = response.text();

        res.json({ explanation });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to get explanation." });
    }
});

// =================================================================
// END: NEW CODE FOR GEMINI
// =================================================================


// @route POST api/puzzles/:id/solve
router.post('/:id/solve', auth, async (req, res) => {
    try {
        const puzzle = await Puzzle.findById(req.params.id);
        const user = await User.findById(req.user.id);

        if (!puzzle || !user) return res.status(404).json({ msg: 'Not found' });

        const { userAnswer } = req.body;
        if (!userAnswer) return res.status(400).json({ msg: 'Answer is required' });

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

        const alreadySolved = user.recentlySolved && user.recentlySolved.some(
            p => p && p.puzzleId && p.puzzleId.toString() === puzzle._id.toString()
        );

        if (!alreadySolved) {
            puzzle.solvedCount += 1;

            user.puzzlesSolved += 1;
            user.xp += puzzle.xpReward;

            const diffKey = puzzle.difficulty.toLowerCase();
            if (user.difficultyBreakdown.hasOwnProperty(diffKey)) {
                user.difficultyBreakdown[diffKey] += 1;
            }

            user.recentlySolved.push({ puzzleId: puzzle._id });
            await puzzle.save();
        }

        await user.save();
        res.json(user);

    } catch (err) {
        console.error('Solve Route Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route DELETE api/puzzles/:id
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