const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * @route   POST api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const isAdmin = email.toLowerCase() === 'admin@wits.com';

      user = new User({
        email: email.toLowerCase(),
        password,
        isAdmin,
        puzzlesSolved: 0,
        xp: 0,
        xpTotal: 250,
        level: 1,
        currentStreak: 0,
        dailyStreak: 0,
        avgTime: '0:00',
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        recentlySolved: [],
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          isAdmin: user.isAdmin,
        },
      };

      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' }, (err, token) => {
        if (err) throw err;
        return res.json({ token });
      });
    } catch (err) {
      console.error('Register Error:', err.message);
      return res.status(500).send('Server Error');
    }
  }
);

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
          isAdmin: user.isAdmin,
        },
      };

      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' }, (err, token) => {
        if (err) throw err;
        return res.json({ token });
      });
    } catch (err) {
      console.error('Login Error:', err.message);
      return res.status(500).send('Server Error');
    }
  }
);

/**
 * @route   GET api/auth
 * @desc    Get logged-in user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json(user);
  } catch (err) {
    console.error('Auth GET Error:', err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
