import React, { useState, useEffect } from 'react';
import { Inbox, RefreshCcw, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

const EmailDashboard = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/emails', { withCredentials: true });
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Email Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <RefreshCcw className="animate-spin h-6 w-6" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Email List */}
          <div className="border rounded p-4">
            <h2 className="text-xl mb-4">Emails</h2>
            <div className="space-y-2">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => handleEmailSelect(email)}
                >
                  <div className="font-medium">{email.from}</div>
                  <div className="text-sm text-gray-600">{email.subject}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Detail */}
          <div className="border rounded p-4">
            <h2 className="text-xl mb-4">Email Content</h2>
            {selectedEmail ? (
              <div>
                <h3 className="font-medium">{selectedEmail.subject}</h3>
                <p className="text-sm text-gray-600 mt-2">From: {selectedEmail.from}</p>
                <div className="mt-4" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
              </div>
            ) : (
              <p className="text-gray-500">Select an email to view its content</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDashboard;