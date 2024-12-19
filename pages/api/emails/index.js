// pages/api/emails/index.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
    
    if (!tokens?.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Fetch emails with their labels
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    const data = await response.json();
    
    // Fetch full details for each email
    const emailPromises = data.messages.map(async (message) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });
      
      if (!detailResponse.ok) {
        throw new Error(`Failed to fetch email ${message.id}`);
      }

      const emailData = await detailResponse.json();

        // Let's log the labels to see what we have
      console.log('Email labels:', emailData.labelIds);
      
      // Get category from labels
      let category = null;
      if (emailData.labelIds) {
        if (emailData.labelIds.includes('Label_Category_NotInteresting')) category = 'notInteresting';
        else if (emailData.labelIds.includes('Label_Category_ToRead')) category = 'toRead';
        else if (emailData.labelIds.includes('Label_Category_NeedsAction')) category = 'needsAction';
      }

      // Extract headers we need
      const headers = emailData.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      return {
        id: emailData.id,
        messageId: emailData.id,
        threadId: emailData.threadId,
        labelIds: emailData.labelIds || [],
        snippet: emailData.snippet,
        subject,
        from,
        date,
        category,
        isStarred: emailData.labelIds?.includes('STARRED') || false
      };
    });

    const emails = await Promise.all(emailPromises);
    res.status(200).json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: error.message });
  }
}