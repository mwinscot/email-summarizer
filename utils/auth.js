import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/auth/google/callback`
);

// Gmail API scopes we need
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels'
];

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

export async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function getGmailClient(accessToken, refreshToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  return google.gmail({ version: 'v1', auth });
}

export async function fetchEmails(gmail, query = '') {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20
    });

    const messages = response.data.messages || [];
    return await Promise.all(messages.map(message => fetchEmailDetails(gmail, message.id)));
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

async function fetchEmailDetails(gmail, messageId) {
  try {
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    const headers = message.data.payload.headers;
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Parse from field
    const fromHeader = getHeader('from');
    const fromMatch = fromHeader.match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
    const from = {
      name: fromMatch ? fromMatch[1] || '' : '',
      email: fromMatch ? fromMatch[2] || fromHeader : fromHeader
    };

    // Parse to field
    const toHeader = getHeader('to');
    const to = toHeader.split(',').map(addr => {
      const match = addr.trim().match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
      return {
        name: match ? match[1] || '' : '',
        email: match ? match[2] || addr.trim() : addr.trim()
      };
    });

    // Get message body
    let body = '';
    let snippet = message.data.snippet || '';

    if (message.data.payload.parts) {
      const textPart = message.data.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    } else if (message.data.payload.body.data) {
      body = Buffer.from(message.data.payload.body.data, 'base64').toString();
    }

    return {
      messageId: message.data.id,
      threadId: message.data.threadId,
      subject: getHeader('subject'),
      from,
      to,
      date: new Date(getHeader('date')),
      summary: snippet,
      snippet: snippet,
      body,
      isStarred: message.data.labelIds?.includes('STARRED') || false,
      folder: getFolderFromLabels(message.data.labelIds)
    };
  } catch (error) {
    console.error(`Error fetching email ${messageId}:`, error);
    throw error;
  }
}

function getFolderFromLabels(labelIds = []) {
  if (labelIds.includes('TRASH')) return 'trash';
  if (labelIds.includes('INBOX')) return 'inbox';
  return 'archive';
}