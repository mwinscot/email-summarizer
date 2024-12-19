// pages/api/setup-labels.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
      
      if (!tokens?.access_token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
  
      const CATEGORY_LABELS = [
        {
          name: 'Category_NotInteresting',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        },
        {
          name: 'Category_ToRead',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        },
        {
          name: 'Category_NeedsAction',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      ];
  
      // Get existing labels
      const labelsResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });
  
      if (!labelsResponse.ok) {
        throw new Error('Failed to fetch labels');
      }
  
      const existingLabels = await labelsResponse.json();
      const existingLabelNames = existingLabels.labels.map(label => label.name);
  
      // Create missing labels
      const createLabelPromises = CATEGORY_LABELS
        .filter(label => !existingLabelNames.includes(label.name))
        .map(label => 
          fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(label)
          })
        );
  
      await Promise.all(createLabelPromises);
  
      res.status(200).json({ success: true, message: 'Labels created successfully' });
    } catch (error) {
      console.error('Error setting up labels:', error);
      res.status(500).json({ error: error.message });
    }
  }