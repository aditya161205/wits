require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to the database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/puzzles', require('./routes/puzzles'));
app.use('/api/users', require('./routes/users'));

// Serve a basic response for the root URL
app.get('/', (req, res) => res.send('API Running'));

// Start the server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));