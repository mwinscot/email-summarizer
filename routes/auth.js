const express = require('express');
const router = express.Router();
const User = require('../models/user');
let bcrypt;
try {
    bcrypt = require('bcrypt');
} catch (error) {
    console.error('bcrypt module is not installed. Please run "npm install bcrypt".');
    process.exit(1);
}
let jwt;
try {
    jwt = require('jsonwebtoken');
} catch (error) {
    console.error('jsonwebtoken module is not installed. Please run "npm install jsonwebtoken".');
    process.exit(1);
}

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

module.exports = router;
