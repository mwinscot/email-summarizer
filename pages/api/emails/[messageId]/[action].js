import { getGmailClient } from '../../../../utils/gmail';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Email ${action} error:`, error);
    res.status(500).json({ error: `Failed to ${action} email` });
  }
}