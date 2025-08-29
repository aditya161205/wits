// server/server.js
require('dotenv').config();
const express = require('express');
const cors =require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('Wits API is running'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/puzzles', require('./routes/puzzles'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));