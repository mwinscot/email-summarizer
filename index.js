const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user');
const { authorize, listMessages } = require('./pages/api/auth/gmail');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Email Summarizer API is running!' });
});

// User model test route
app.get('/api/users/test', async (req, res) => {
  try {
    // Create a test user
    const testUser = new User({
      email: 'test@example.com',
      googleId: 'test123',
      name: 'Test User'
    });

    // Save to database
    await testUser.save();

    // Fetch all users
    const users = await User.find({});

    res.json({
      message: 'User model test successful',
      testUser,
      totalUsers: users.length,
      users
    });
  } catch (error) {
    console.error('User test error:', error);
    res.status(500).json({
      message: 'User test failed',
      error: error.message
    });
  }
});

async function main() {
  const auth = await authorize();
  await listMessages(auth);
}

main().catch(console.error);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;