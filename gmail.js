const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

// Load client secrets from a local file.
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    await getNewToken(oAuth2Client);
  }
  return oAuth2Client;
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  // After visiting the URL, the user will get a code to enter here
  // Implement a way to capture the code and exchange it for tokens
}

async function listMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
  const messages = res.data.messages || [];
  for (const message of messages) {
    const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
    console.log(`Message snippet: ${msg.data.snippet}`);
  }
}

module.exports = {
  authorize,
  listMessages,
};
