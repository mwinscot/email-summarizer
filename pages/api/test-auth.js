// pages/api/test-auth.js
export default async function handler(req, res) {
    try {
      const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
      
      res.json({
        hasTokens: !!tokens,
        tokenDetails: tokens ? {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          tokenType: tokens.token_type,
          expiryDate: tokens.expiry_date
        } : null,
        environment: {
          hasClientId: !!process.env.GOOGLE_CLIENT_ID,
          hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
          hasVercelUrl: !!process.env.VERCEL_URL,
          nodeEnv: process.env.NODE_ENV
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Auth test failed',
        details: error.message
      });
    }
  }