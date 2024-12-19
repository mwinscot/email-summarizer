import dbConnect from '../../../utils/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Create a test user
    const testUser = new User({
      email: 'test@example.com',
      googleId: 'test123',
      name: 'Test User'
    });

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
}