export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messageId, action } = req.query;
    const tokens = req.cookies.gmail_tokens ? JSON.parse(req.cookies.gmail_tokens) : null;
    
    if (!tokens?.access_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
    let method = 'POST';
    let body = null;

    // Define category label prefixes
    const CATEGORY_PREFIX = 'Label_Category_';
    const CATEGORY_LABELS = {
      notInteresting: `${CATEGORY_PREFIX}NotInteresting`,
      toRead: `${CATEGORY_PREFIX}ToRead`,
      needsAction: `${CATEGORY_PREFIX}NeedsAction`
    };

    switch (action) {
      case 'star':
        url = `${url}/modify`;
        method = 'POST';
        body = { addLabelIds: ['STARRED'] };
        break;
      
      case 'unstar':
        url = `${url}/modify`;
        method = 'POST';
        body = { removeLabelIds: ['STARRED'] };
        break;
      
      case 'trash':
        url = `${url}/trash`;
        break;

      case 'category':
        const { category } = req.body;
        url = `${url}/modify`;
        method = 'POST';

        // First, get existing labels to remove any existing category
        const removeLabels = Object.values(CATEGORY_LABELS);
        
        // If setting a new category, add it to the labels
        const addLabels = category ? [CATEGORY_LABELS[category]] : [];

        body = {
          removeLabelIds: removeLabels,
          addLabelIds: addLabels
        };
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} email`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error performing ${req.query.action}:`, error);
    res.status(500).json({ error: error.message });
  }
}