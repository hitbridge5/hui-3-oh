'use client';
import { useState } from 'react';

export default function SeoPanel({ html }: { html: string }) {
  const [seo, setSeo] = useState<{ title: string; description: string; keywords: string[] } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSeo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setSeo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <button
        onClick={generateSeo}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Generating SEO...' : 'Add SEO'}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {seo && (
        <div className="mt-4 text-sm">
          <h3 className="font-bold">SEO Generated:</h3>
          <p><strong>Title:</strong> {seo.title}</p>
          <p><strong>Description:</strong> {seo.description}</p>
          <p><strong>Keywords:</strong> {seo.keywords.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
