import React, { useState, useEffect } from 'react';
import { Inbox, RefreshCcw, Search, Star, Trash, Archive, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EmailDashboard = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [folder, setFolder] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  const LoginButton = () => {
    const handleLogin = async () => {
      try {
        const response = await fetch('/api/auth/google');
        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        console.error('Failed to get auth URL:', error);
      }
    };
  
    return (
      <Button onClick={handleLogin} className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Connect Gmail Account
      </Button>
    );
  };
  
  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        folder,
        search: searchQuery,
      }).toString();
      
      const response = await fetch(`/api/emails?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch emails');
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      setError('Failed to fetch emails. Please try again.');
      console.error('Error fetching emails:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, [folder]);

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  const handleEmailAction = async (action, email) => {
    try {
      let endpoint;
      let method = 'PATCH';
      const updates = {};

      switch (action) {
        case 'star':
          updates.isStarred = !email.isStarred;
          endpoint = `/api/emails/${email.messageId}/star`;
          break;
        case 'archive':
          updates.folder = 'archive';
          endpoint = `/api/emails/${email.messageId}/move`;
          break;
        case 'trash':
          updates.folder = 'trash';
          endpoint = `/api/emails/${email.messageId}/move`;
          break;
        case 'restore':
          updates.folder = 'inbox';
          endpoint = `/api/emails/${email.messageId}/move`;
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error(`Failed to ${action} email`);
      
      if (action === 'trash' || action === 'archive') {
        if (selectedEmail?.messageId === email.messageId) {
          setSelectedEmail(null);
        }
      }
      fetchEmails();
    } catch (error) {
      console.error(`Error ${action} email:`, error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmails();
  };

  const formatEmailAddress = (from) => {
    return from.name ? `${from.name} <${from.email}>` : from.email;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Email Dashboard</h1>
        <Button
          onClick={fetchEmails}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox">Inbox</SelectItem>
            <SelectItem value="archive">Archive</SelectItem>
            <SelectItem value="trash">Trash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <RefreshCcw className="animate-spin h-6 w-6" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Email List */}
          <div className="border rounded-lg shadow-sm">
            <div className="space-y-1 p-2">
              {emails.map((email) => (
                <div
                  key={email.messageId}
                  className={`p-3 rounded-md cursor-pointer transition-colors
                    ${selectedEmail?.messageId === email.messageId ? 'bg-gray-100' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => handleEmailSelect(email)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{formatEmailAddress(email.from)}</span>
                        {email.isStarred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                      </div>
                      <div className="text-sm text-gray-600">{email.subject}</div>
                      <div className="text-sm text-gray-500 mt-1">{email.snippet}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(email.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Detail */}
          <div className="border rounded-lg shadow-sm">
            {selectedEmail ? (
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-medium">{selectedEmail.subject}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmailAction('star', selectedEmail)}
                    >
                      <Star className={`h-4 w-4 ${selectedEmail.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    {folder === 'inbox' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmailAction('archive', selectedEmail)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    {folder !== 'trash' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmailAction('trash', selectedEmail)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                    {folder !== 'inbox' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmailAction('restore', selectedEmail)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <div>From: {formatEmailAddress(selectedEmail.from)}</div>
                  <div>To: {selectedEmail.to.map(formatEmailAddress).join(', ')}</div>
                  <div>Date: {new Date(selectedEmail.date).toLocaleString()}</div>
                </div>
                <div className="prose max-w-none">
                  <h4 className="text-lg font-medium mb-2">Summary</h4>
                  <p className="text-gray-700">{selectedEmail.summary}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an email to view its content</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDashboard;