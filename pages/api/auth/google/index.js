// pages/api/auth/google/index.js
import { getAuthUrl } from '../../../../utils/gmail';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const url = getAuthUrl();
    res.status(200).json({ url });
  }
}

// pages/api/auth/google/callback.js
import { getTokens } from '../../../../utils/gmail';
import { setTokenCookie } from '../../../../utils/auth'; // You'll need to implement this

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { code } = req.query;
      const tokens = await getTokens(code);
      
      // Store tokens securely (implement this based on your auth system)
      await setTokenCookie(res, tokens);
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('/error?message=auth_failed');
    }
  }
}

// pages/api/emails/index.js
import { getGmailClient, fetchEmails } from '../../../utils/gmail';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { accessToken, refreshToken } = req.cookies; // Implement secure token storage/retrieval
      
      if (!accessToken || !refreshToken) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const gmail = await getGmailClient(accessToken, refreshToken);
      
      const { folder = 'inbox', search = '' } = req.query;
      let query = search;
      
      // Add folder-specific queries
      switch (folder) {
        case 'inbox':
          query += ' in:inbox';
          break;
        case 'trash':
          query += ' in:trash';
          break;
        case 'archive':
          query += ' -in:inbox -in:trash';
          break;
      }

      const emails = await fetchEmails(gmail, query);
      res.status(200).json(emails);
    } catch (error) {
      console.error('Email fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  }
}

// pages/api/emails/[messageId]/[action].js
import { getGmailClient } from '../../../../utils/gmail';

export default async function handler(req, res) {
  if (req.method === 'PATCH') {
    try {
      const { messageId, action } = req.query;
      const { accessToken, refreshToken } = req.cookies;
      
      if (!accessToken || !refreshToken) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const gmail = await getGmailClient(accessToken, refreshToken);
      
      switch (action) {
        case 'star':
          await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
              addLabelIds: ['STARRED'],
            },
          });
          break;
          
        case 'unstar':
          await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
              removeLabelIds: ['STARRED'],
            },
          });
          break;
          
        case 'move':
          const { folder } = req.body;
          let addLabelIds = [];
          let removeLabelIds = [];
          
          if (folder === 'trash') {
            await gmail.users.messages.trash({
              userId: 'me',
              id: messageId,
            });
          } else if (folder === 'inbox') {
            await gmail.users.messages.untrash({
              userId: 'me',
              id: messageId,
            });
            addLabelIds.push('INBOX');
          } else if (folder === 'archive') {
            removeLabelIds.push('INBOX');
          }
          
          if (addLabelIds.length || removeLabelIds.length) {
            await gmail.users.messages.modify({
              userId: 'me',
              id: messageId,
              requestBody: { addLabelIds, removeLabelIds },
            });
          }
          break;
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Email ${action} error:`, error);
      res.status(500).json({ error: `Failed to ${action} email` });
    }
  }
}