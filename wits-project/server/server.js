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

// ## START: UPDATED CORS CONFIGURATION ##
// This explicitly allows your custom domain to make requests to your API.
const corsOptions = {
  origin: 'https://wits-puzzles.com',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// ## END: UPDATED CORS CONFIGURATION ##

// Define API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/puzzles', require('./routes/puzzles'));
app.use('/api/users', require('./routes/users'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
  });
} else {
    app.get('/', (req, res) => res.send('API Running'));
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));