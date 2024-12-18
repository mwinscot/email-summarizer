import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    console.log('Starting email fetch process');
    
    // Parse tokens with error handling
    let tokens;
    try {
      tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
      console.log('Tokens present:', !!tokens);
    } catch (e) {
      console.error('Token parsing error:', e);
      return res.status(401).json({ error: 'Invalid token format' });
    }
  
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      vercelUrl: process.env.VERCEL_URL,
    });

    const redirectUri = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/auth/callback`;
    console.log('Redirect URI:', redirectUri);

    // Initialize OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    oauth2Client.setCredentials(tokens);
    console.log('OAuth client initialized');

    // Initialize Gmail API
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    console.log('Gmail client initialized');

    // List messages
    console.log('Fetching message list');
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    if (!response.data.messages) {
      console.log('No messages found');
      return res.json([]);
    }

    console.log(`Found ${response.data.messages.length} messages`);

    // Fetch full message details
    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        try {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });

          const headers = fullMessage.data.payload.headers;
          return {
            id: message.id,
            subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
            from: headers.find(h => h.name === 'From')?.value || 'Unknown Sender',
            date: headers.find(h => h.name === 'Date')?.value,
            snippet: fullMessage.data.snippet
          };
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error);
          return {
            id: message.id,
            error: 'Failed to fetch message details',
            errorMessage: error.message
          };
        }
      })
    );

    console.log('Successfully processed all messages');
    res.json(messages);

  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      code: error.code,
    });

    if (error.code === 401) {
      return res.status(401).json({ 
        error: 'Token expired or invalid',
        details: error.message
      });
    }

    return res.status(500).json({ 
      error: 'Failed to fetch emails',
      details: error.message,
      type: error.name
    });
  }
}