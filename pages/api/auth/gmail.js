// utils/gmail.js
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // e.g. "http://localhost:3000/api/auth/google/callback"
);

// Gmail API scope for reading emails
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

async function getGmailClient(accessToken, refreshToken) {
  const auth = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.gmail({ version: 'v1', auth });
}

async function fetchEmails(gmail, query = '') {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    const emailDetails = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });
        return parseEmail(email.data);
      })
    );

    return emailDetails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

function parseEmail(emailData) {
  const headers = emailData.payload.headers;
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  // Get email body
  let body = '';
  if (emailData.payload.parts) {
    const textPart = emailData.payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString();
    }
  } else if (emailData.payload.body.data) {
    body = Buffer.from(emailData.payload.body.data, 'base64').toString();
  }

  // Parse from field
  const fromHeader = getHeader('from');
  const fromMatch = fromHeader.match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
  const from = {
    name: fromMatch ? fromMatch[1] || '' : '',
    email: fromMatch ? fromMatch[2] || fromHeader : fromHeader,
  };

  // Parse to field
  const toHeader = getHeader('to');
  const to = toHeader.split(',').map(addr => {
    const match = addr.trim().match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/);
    return {
      name: match ? match[1] || '' : '',
      email: match ? match[2] || addr.trim() : addr.trim(),
    };
  });

  return {
    messageId: emailData.id,
    threadId: emailData.threadId,
    subject: getHeader('subject'),
    from,
    to,
    date: new Date(getHeader('date')),
    snippet: emailData.snippet,
    summary: body.substring(0, 200), // We can enhance this with better summarization
    isStarred: emailData.labelIds?.includes('STARRED') || false,
    folder: getFolderFromLabels(emailData.labelIds),
  };
}

function getFolderFromLabels(labelIds = []) {
  if (labelIds.includes('TRASH')) return 'trash';
  if (labelIds.includes('INBOX')) return 'inbox';
  return 'archive';
}

module.exports = {
  getAuthUrl,
  getTokens,
  getGmailClient,
  fetchEmails,
};