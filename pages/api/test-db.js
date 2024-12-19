// pages/api/test-db.js
import { testConnection } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.status(200).json({ status: 'Connected to MongoDB successfully' });
    } else {
      res.status(500).json({ error: 'Failed to connect to MongoDB' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error testing MongoDB connection', details: error.message });
  }
}