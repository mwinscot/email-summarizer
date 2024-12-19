export default async function handler(req, res) {
    try {
      // Log all cookies for debugging
      console.log('All cookies:', req.cookies);
  
      // Check for Gmail tokens
      const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
  
      return res.status(200).json({
        authenticated: !!tokens,
        tokenDetails: tokens ? {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiryDate: tokens.expiry_date
        } : null,
        allCookies: Object.keys(req.cookies || {})
      });
    } catch (error) {
      console.error('Auth test error:', error);
      return res.status(500).json({
        error: 'Auth test failed',
        message: error.message
      });
    }
  }