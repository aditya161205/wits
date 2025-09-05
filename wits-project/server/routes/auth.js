const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

      // Check if the user should be an admin
      const isAdmin = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();


      user = new User({
        email: email.toLowerCase(),
        password,
        isAdmin,
        puzzlesSolved: 0,
        xp: 0,
        difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
        recentlySolved: [],
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = { user: { id: user.id, isAdmin: user.isAdmin } };

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

      const payload = { user: { id: user.id, isAdmin: user.isAdmin } };

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




/**
 * @route   POST api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // For security, we don't reveal if the user exists or not.
            // The frontend will show a generic "email has been sent" message either way.
            return res.status(200).json({ msg: 'Reset email process initiated.' });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Store the hashed token and its expiration date (1 hour) in the database
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();

        // Create the full reset URL for the email
        const resetUrl = `${process.env.SITE_URL}/resetpassword?token=${resetToken}`;

        // Configure the email transporter (using environment variables)
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT, 10),
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Define email content
        const mailOptions = {
            from: `"Wits Puzzle App" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Your Password Reset Request',
            html: `
                <p>Hello,</p>
                <p>You requested a password reset for your Wits account. Please click the link below to set a new password:</p>
                <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link will expire in one hour.</p>
                <p>If you did not request this, please ignore this email.</p>
            `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'Reset email sent.' });

    } catch (err) {
        console.error('Forgot Password Error:', err.message);
        res.status(500).send('Server Error');
    }
});


/**
 * @route   POST api/auth/reset-password
 * @desc    Reset password using the token
 * @access  Public
 */
router.post('/reset-password', [
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { token, password } = req.body;

        // Find the user with a matching and non-expired token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
        }

        // Set the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined; // Clear the token
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ msg: 'Password has been reset successfully.' });

    } catch (err) {
        console.error('Reset Password Error:', err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;