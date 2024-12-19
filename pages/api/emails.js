export default async function handler(req, res) {
  try {
    // Replace this with your actual logic to fetch emails
    const emails = [
      {
        id: 1,
        subject: 'Welcome to Email Summarizer',
        from: 'no-reply@emailsummarizer.com',
        date: new Date().toISOString(),
        snippet: 'Thank you for signing up for Email Summarizer...',
      },
      // Add more email objects as needed
    ];

    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
}
