'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackend = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/health`);
        
        if (!res.ok) {
          throw new Error(`Backend responded with status ${res.status}`);
        }

        const data = await res.json();
        setResponse(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBackend();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-zinc-100 dark:from-black dark:to-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
          Fullstack Test
        </h1>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg max-w-md">
          {loading && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Calling backend...
            </p>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400">
              <p className="font-semibold mb-2">❌ Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {response && (
            <div className="text-left">
              <p className="font-semibold text-green-600 dark:text-green-400 mb-4">
                ✅ Backend Response Received
              </p>
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded font-mono text-sm text-black dark:text-white">
                <p>Status: <span className="font-bold">{response.status}</span></p>
                <p>Message: <span className="font-bold">{response.message}</span></p>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
            <p>Frontend (Next.js port 3000) → Backend (Express port 4000)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
