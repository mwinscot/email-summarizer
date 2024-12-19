import { useState, useEffect } from 'react';
import { MailIcon, StarIcon, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Format the date nicely
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Format the sender's name/email
  const formatSender = (from) => {
    const match = from.match(/"?([^"<]*)"?\s*<?([^>]*)>?/);
    return match ? (match[1] || match[2]) : from;
  };

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="text-red-500 rounded-lg p-4 bg-red-50">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Dashboard</h1>
        <button 
          onClick={fetchEmails} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-gray-600">Loading emails...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEmail(email)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatSender(email.from)}</span>
                    {email.isStarred && (
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <div className="font-medium text-gray-900">{email.subject}</div>
                  <div className="text-sm text-gray-600 mt-1">{email.snippet}</div>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(email.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedEmail.subject}</h2>
              <button 
                onClick={() => setSelectedEmail(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <div>From: {selectedEmail.from}</div>
              <div>Date: {formatDate(selectedEmail.date)}</div>
            </div>
            <div className="prose max-w-none">
              {selectedEmail.snippet}
            </div>
          </div>
        </div>
      )}
    </div>
  ); // End of return
}