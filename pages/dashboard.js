import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEmails() {
      try {
        const response = await fetch('/api/emails');
        if (!response.ok) throw new Error('Failed to fetch emails');
        const data = await response.json();
        setEmails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEmails();
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div>Loading emails...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Email Dashboard</h1>
      <div className="space-y-4">
        {emails.map((email) => (
          <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="font-medium">{email.subject}</div>
            <div className="text-gray-600">{email.from}</div>
            <div className="text-sm text-gray-500">{new Date(email.date).toLocaleString()}</div>
            <div className="mt-2 text-gray-700">{email.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  );
}