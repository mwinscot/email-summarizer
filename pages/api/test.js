export default function handler(req, res) {
  try {
    const cookieData = req.cookies.gmail_tokens 
      ? JSON.parse(req.cookies.gmail_tokens) 
      : null;
    
    res.status(200).json({
      isAuthenticated: !!cookieData,
      tokenInfo: cookieData ? {
        hasAccessToken: !!cookieData.access_token,
        expiryDate: cookieData.expiry_date
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check auth status' });
  }
}