const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(express.json()); // Add this to parse JSON bodies

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });

// Import the User model from schema.js
const User = require('./schema');

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/api/users', async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the request body
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log('Checking if user exists'); // Log before checking user
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    console.log('Creating user'); // Log before creating user
    const user = await User.create({ name, email, password });
    return res.status(201).json({ message: 'User Created successfully', user });
  } catch (error) {
    console.error('Error:', error); // Log the error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
