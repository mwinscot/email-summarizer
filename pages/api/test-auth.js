// pages/api/test-auth.js
export default function handler(req, res) {
  try {
    // Simple environment check
    const envStatus = {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasVercelUrl: !!process.env.VERCEL_URL
    };

    // Basic response
    res.status(200).json({
      status: 'ok',
      time: new Date().toISOString(),
      env: envStatus
    });
  } catch (error) {
    res.status(500).json({
      error: 'Basic test failed',
      message: error.message
    });
  }
}