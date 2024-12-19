export default async function handler(req, res) {
  try {
    const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
    
    if (!tokens?.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch list of messages
    const listResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      }
    );

    if (!listResponse.ok) {
      throw new Error('Failed to fetch message list');
    }

    const { messages } = await listResponse.json();

    // Fetch details for each message
    const emails = await Promise.all(
      messages.map(async (message) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
          {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`
            }
          }
        );

        const emailData = await detailResponse.json();
        const headers = emailData.payload.headers;
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

        return {
          id: emailData.id,
          threadId: emailData.threadId,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          date: getHeader('Date'),
          snippet: emailData.snippet,
          isStarred: emailData.labelIds?.includes('STARRED') || false
        };
      })
    );

    res.status(200).json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: error.message });
  }
}