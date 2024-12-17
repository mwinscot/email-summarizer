require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(express.json());

// ...existing code...

app.use('/auth', authRoutes);

// Protected route example
app.get('/protected', authMiddleware, (req, res) => {
    res.send('This is a protected route');
});

// ...existing code...

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => app.listen(3000, () => console.log('Server running on port 3000')))
    .catch(err => console.error(err));
