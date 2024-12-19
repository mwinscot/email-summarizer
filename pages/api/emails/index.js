import { getGmailClient, fetchEmails } from '../../../utils/gmail';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { accessToken, refreshToken } = req.cookies;
      
      if (!accessToken || !refreshToken) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const gmail = await getGmailClient(accessToken, refreshToken);
      const { folder = 'inbox', search = '' } = req.query;
      let query = search;
      
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