export default function handler(req, res) {
    try {
      const cookies = req.cookies || {};
      
      return res.status(200).json({
        message: 'Auth check',
        hasCookies: Object.keys(cookies).length > 0,
        cookieNames: Object.keys(cookies)
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Simple check failed',
        details: error.message
      });
    }
  }