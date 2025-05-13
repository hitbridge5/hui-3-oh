'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const SeoPanel = dynamic(() => import('./SeoPanel'), { ssr: false });

export default function EditorComponent() {
  const [code, setCode] = useState('<div>Hello World</div>');
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendToGPT(currentCode, instruction) {
    const response = await fetch('/api/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentCode, instruction }),
    });

    const data = await response.json();
    return data.updatedCode;
  }

  const handleUpdate = async () => {
    setLoading(true);
    const updated = await sendToGPT(code, instruction);
    setCode(updated);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <textarea
        className="w-full border p-2"
        rows={10}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <input
        className="w-full border p-2"
        type="text"
        placeholder="Enter instruction (e.g. 'Make it responsive')"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleUpdate}
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Update with GPT'}
      </button>

      {/* SEO Panel */}
      {code && <SeoPanel html={code} />}
    </div>
  );
}
