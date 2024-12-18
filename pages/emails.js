import { google } from 'googleapis';

export default async function handler(req, res) {
  const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
  
  if (!tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/auth/callback`
  );

  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });

        const headers = fullMessage.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const date = headers.find(h => h.name === 'Date')?.value;

        return {
          id: message.id,
          subject,
          from,
          date,
          snippet: fullMessage.data.snippet
        };
      })
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching emails:', error);
    if (error.code === 401) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  }
}