import { google } from 'googleapis';

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/auth/callback`
  );

  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    
    res.setHeader('Set-Cookie', `gmail_tokens=${JSON.stringify(tokens)}; Path=/; HttpOnly; Secure; SameSite=Strict`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.redirect('/error');
  }
}