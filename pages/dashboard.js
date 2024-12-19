import { useState, useEffect } from 'react';
import { MailIcon, StarIcon, RefreshCw, Trash2 } from 'lucide-react';

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
    // Set up labels if they don't exist
    fetch('/api/setup-labels', { method: 'POST' });
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const formatSender = (from) => {
    const match = from.match(/"?([^"<]*)"?\s*<?([^>]*)>?/);
    return match ? (match[1] || match[2]) : from;
  };

  const handleCategoryChange = async (messageId, category) => {
    try {
      const response = await fetch(`/api/emails/${messageId}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category })
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // Refresh emails to get updated data
      await fetchEmails();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleAction = async (messageId, action) => {
    try {
      const response = await fetch(`/api/emails/${messageId}/${action}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} email`);
      }

      await fetchEmails();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const getEmailsByCategory = (category) => {
    return emails.filter(email => email.category === category);
  };

  const EmailCard = ({ email }) => (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
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
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(email.date)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(email.messageId, email.isStarred ? 'unstar' : 'star');
              }}
              className="text-gray-400 hover:text-yellow-400"
            >
              <StarIcon className={`h-5 w-5 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </button>
            <select 
              value={email.category || ''}
              onChange={(e) => {
                e.stopPropagation();
                handleCategoryChange(email.messageId, e.target.value || null);
              }}
              className="text-sm border rounded p-1"
            >
              <option value="">Uncategorized</option>
              <option value="notInteresting">Not Interesting</option>
              <option value="toRead">To Read</option>
              <option value="needsAction">Needs Action</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const CategorySection = ({ title, category, emails }) => (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid gap-4">
        {emails.length > 0 ? (
          emails.map(email => (
            <EmailCard 
              key={email.messageId} 
              email={email}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center py-4">
            No emails in this category
          </div>
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-4">
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
        <div className="space-y-8">
          <CategorySection 
            title="Needs Action" 
            category="needsAction"
            emails={getEmailsByCategory('needsAction')}
          />
          <CategorySection 
            title="To Read" 
            category="toRead"
            emails={getEmailsByCategory('toRead')}
          />
          <CategorySection 
            title="Not Interesting" 
            category="notInteresting"
            emails={getEmailsByCategory('notInteresting')}
          />
          <CategorySection 
            title="Uncategorized" 
            category={null}
            emails={emails.filter(email => !email.category)}
          />
        </div>
      )}
    </div>
  );
}