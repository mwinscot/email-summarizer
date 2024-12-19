import { listEmails } from '../../utils/gmail';

export default async function handler(req, res) {
  try {
    const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
    
    if (!tokens?.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const emails = await listEmails(tokens.access_token);
    res.status(200).json(emails);
  } catch (error) {
    console.error('Gmail test error:', error);
    res.status(500).json({ error: error.message });
  }
}