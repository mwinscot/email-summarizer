// pages/api/emails/[messageId]/category.js
import dbConnect from '../../../../lib/mongodb';
import Email from '../../../../models/Email';

export default async function handler(req, res) {
  const { messageId } = req.query;
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { category } = req.body;
    
    // Validate category
    if (category && !['notInteresting', 'toRead', 'needsAction'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const updatedEmail = await Email.findOneAndUpdate(
      { messageId }, // Using messageId directly from the URL
      { 
        category,
        lastModified: new Date()
      },
      { new: true, upsert: false }
    );

    if (!updatedEmail) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({ error: 'Failed to update email category' });
  }
}