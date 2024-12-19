import { getTokens } from '../../../../utils/gmail';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    const redirectUri = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/auth/google/callback`;
    
    const tokens = await getTokens(code, redirectUri);
    
    // Set cookie
    res.setHeader('Set-Cookie', `gmail_tokens=${JSON.stringify(tokens)}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    
    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect('/error?message=auth_failed');
  }
}