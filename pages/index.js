import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    fetch('/api/users/test')
      .then(res => res.json())
      .then(data => {
        setStatus(`API working! Total users: ${data.totalUsers}`);
      })
      .catch(err => {
        setStatus('Error connecting to API');
        console.error(err);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Email Summarizer</h1>
      <p>{status}</p>
    </div>
  );
}