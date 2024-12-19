import { getTokensFromCookies } from '../../../utils/auth';

export default async function handler(req, res) {
  try {
    const tokens = getTokensFromCookies(req.cookies);
    
    res.status(200).json({
      isAuthenticated: !!tokens,
      tokenInfo: tokens ? {
        hasAccessToken: !!tokens.access_token,
        expiryDate: tokens.expiry_date
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check auth status' });
  }
}