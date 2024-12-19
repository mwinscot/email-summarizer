export default function handler(req, res) {
  try {
    const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
    
    res.status(200).json({
      hasTokens: !!tokens,
      tokenDetails: tokens ? {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date
      } : null,
      allCookies: Object.keys(req.cookies)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check auth status',
      details: error.message
    });
  }
}