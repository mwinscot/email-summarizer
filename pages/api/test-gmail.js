import { getGmailClient } from '../../utils/gmail';

export default async function handler(req, res) {
  try {
    const { accessToken, refreshToken } = req.cookies;
    
    if (!accessToken || !refreshToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gmail = await getGmailClient(accessToken, refreshToken);
    
    // Just try to list labels as a simple test
    const response = await gmail.users.labels.list({
      userId: 'me'
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Gmail test error:', error);
    res.status(500).json({
      error: 'Gmail test failed',
      details: error.message
    });
  }
}