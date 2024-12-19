export default async function handler(req, res) {
  console.log('Starting email fetch...');
  
  try {
    const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
    
    if (!tokens?.access_token) {
      console.log('No access token found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('Fetching from Gmail API...');
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log('Gmail API Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gmail API Error:', errorData);
      throw new Error(`Gmail API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Messages found:', data.messages?.length || 0);

    const emails = await Promise.all(
      (data.messages || []).map(async (message) => {
        const emailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Accept': 'application/json'
            }
          }
        );
        
        const emailData = await emailResponse.json();
        const headers = emailData.payload.headers;
        
        return {
          id: emailData.id,
          subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
          from: headers.find(h => h.name === 'From')?.value || 'Unknown',
          date: headers.find(h => h.name === 'Date')?.value,
          snippet: emailData.snippet
        };
      })
    );

    console.log('Successfully processed emails');
    res.status(200).json(emails);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: error.message });
  }
}