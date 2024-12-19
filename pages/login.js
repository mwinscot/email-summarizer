import { useEffect, useState } from 'react';

export default function Login() {
  const [authUrl, setAuthUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/google')
      .then(res => res.json())
      .then(data => setAuthUrl(data.url))
      .catch(err => setError('Failed to get auth URL'));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Email Login</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : authUrl ? (
        <a 
          href={authUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect Gmail Account
        </a>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}