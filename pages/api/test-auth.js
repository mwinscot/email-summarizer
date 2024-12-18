// pages/api/test-auth.js
export default async function handler(req, res) {
  console.log('Starting test-auth endpoint');
  
  try {
    let tokens = null;
    let parseError = null;
    
    try {
      tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
      console.log('Cookie parsing attempted');
    } catch (e) {
      parseError = e.message;
      console.error('Token parsing error:', e);
    }
    
    console.log('Environment check starting');
    const envCheck = {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasVercelUrl: !!process.env.VERCEL_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    };
    console.log('Environment variables present:', envCheck);

    console.log('Cookies present:', Object.keys(req.cookies || {}));
    
    res.status(200).json({
      serverTime: new Date().toISOString(),
      cookiesExist: !!req.cookies,
      parseError,
      hasTokens: !!tokens,
      tokenDetails: tokens ? {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        tokenType: tokens.token_type,
        expiryDate: tokens.expiry_date
      } : null,
      environment: envCheck
    });
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      error: 'Auth test failed',
      errorType: error.name,
      errorMessage: error.message,
      serverTime: new Date().toISOString()
    });
  }
}