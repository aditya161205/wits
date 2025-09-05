const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
require('dotenv').config();


const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/puzzles', require('./routes/puzzles'));
app.use('/api/users', require('./routes/users'));

// --- THIS IS THE CRUCIAL PART ---
// Serve static assets (the built React app) in production
if (process.env.NODE_ENV === 'production') {
  // Set the static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // For any request that doesn't match an API route, send back the React app's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
} else {
    app.get('/', (req, res) => res.send('API Running'));
}
// --------------------------------

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
