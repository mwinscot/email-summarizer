import { useState, useEffect } from 'react';
import { MailIcon, StarIcon, RefreshCw, CheckSquare } from 'lucide-react';

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [categories, setCategories] = useState({
    notInteresting: new Set(),
    toRead: new Set(),
    needsAction: new Set()
  });

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

  const handleCategoryChange = (emailId, category) => {
    setCategories(prev => {
      const newCategories = {
        notInteresting: new Set(prev.notInteresting),
        toRead: new Set(prev.toRead),
        needsAction: new Set(prev.needsAction)
      };
      
      // Remove from all categories first
      Object.values(newCategories).forEach(set => set.delete(emailId));
      
      // Add to selected category
      if (category) {
        newCategories[category].add(emailId);
      }
      
      return newCategories;
    });
  };

  const getEmailsByCategory = (category) => {
    return emails.filter(email => categories[category].has(email.id));
  };

  const EmailCard = ({ email, category }) => (
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
          <select 
            value={category || ''}
            onChange={(e) => handleCategoryChange(email.id, e.target.value || null)}
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
  );

  const CategorySection = ({ title, category, emails }) => (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid gap-4">
        {emails.map(email => (
          <EmailCard 
            key={email.id} 
            email={email} 
            category={category}
          />
        ))}
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
            category=""
            emails={emails.filter(email => 
              !categories.notInteresting.has(email.id) &&
              !categories.toRead.has(email.id) &&
              !categories.needsAction.has(email.id)
            )}
          />
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
  );
}