import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GmailTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emails, setEmails] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus(null);

    try {
      const response = await fetch('/api/emails?folder=inbox&limit=5');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Raw API response:', data);
      setEmails(data);
      setConnectionStatus('success');
    } catch (error) {
      console.error('Connection test error:', error);
      setError(error.message);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gmail Connection Test</h1>
        <Button
          onClick={testConnection}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <RefreshCcw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Test Connection
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Error: {error}
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'success' && (
        <Alert>
          <AlertDescription className="text-green-600">
            Successfully connected to Gmail!
          </AlertDescription>
        </Alert>
      )}

      {emails && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Latest Emails (First 5)</h2>
          <div className="space-y-4">
            {emails.map((email, index) => (
              <div key={email.messageId || index} className="border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify({
                    messageId: email.messageId,
                    subject: email.subject,
                    from: email.from,
                    date: email.date,
                    folder: email.folder
                  }, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Check the browser console for complete API response details.</p>
      </div>
    </div>
  );
};

export default GmailTest;