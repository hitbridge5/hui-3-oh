'use client';

import { useState } from 'react';

export default function Sidebar({ onTemplatesGenerated, onSelectTemplate, templates }) {
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [includesForm, setIncludesForm] = useState(false);
  const [tagline, setTagline] = useState('');
  const [services, setServices] = useState('');
  const [description, setDescription] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  


  async function generateTemplates() {
    if (!industry.trim() || !businessName.trim()) {
      alert('Business name and industry are required.');
      return;
    }

    setLoading(true);

    const prompt = `
You are a website layout engine.

Create a full HTML5 homepage for this business:
- Business Name: ${businessName.trim()}
- Industry: ${industry.trim()}
- Tagline: ${tagline.trim()}
- Services: ${services.trim()}
- Description: ${description.trim()}
${referenceUrl.trim() ? `- Reference Website: ${referenceUrl.trim()}` : ''}

Requirements:
- Use full valid HTML: <html>, <head>, <style>, and <body>
- Creative layout using CSS Grid or Flexbox
- Include header, nav, main content, and footer
- Add at least 2 relevant images using:
  <img src="https://source.unsplash.com/800x400/?${industry.trim()}" />
  <img src="https://source.unsplash.com/600x400/?${industry.trim()},interior" />
- Use at least one background image via inline CSS
- Include internal <style> with animation (hover/fade/scroll)
- Make layout feel customized to the business type

Important:
- DO NOT include markdown, code blocks, or comments
- Return ONLY raw HTML.
`;

    try {
      const layouts = [];

      for (let i = 0; i < 3; i++) {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        layouts.push(data.result);
      }

      onTemplatesGenerated(layouts);
    } catch (error) {
      console.error('Template generation failed:', error);
    }

    setLoading(false);
  }

  return (
    <div className="w-64 bg-gray-200 p-4 text-black border-r border-gray-400 overflow-auto">
      <h2 className="font-bold text-lg mb-4">Sidebar</h2>

      <input
        type="text"
        placeholder="Business name"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
      />

      <input
        type="text"
        placeholder="Industry"
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
        className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
      />

      <input
        type="text"
        placeholder="Website tagline"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
      />

      <textarea
        placeholder="Service list (comma-separated)"
        value={services}
        onChange={(e) => setServices(e.target.value)}
        className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
        rows={2}
      />

      <textarea
        placeholder="Business description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
        rows={3}
      />

      <input
        type="text"
        placeholder="Reference site URL (optional)"
        value={referenceUrl}
        onChange={(e) => setReferenceUrl(e.target.value)}
        className="w-full mb-3 p-2 border border-gray-300 rounded text-sm"
      />
<div className="mb-3">
  <label className="flex items-center text-sm">
    <input
      type="checkbox"
      className="mr-2"
      checked={includesForm}
      onChange={(e) => setIncludesForm(e.target.checked)}
    />
    This site includes a form
  </label>
</div>

      <button
        className={`w-full px-4 py-2 rounded ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        onClick={generateTemplates}
        disabled={loading}
      >
        {loading ? 'HUI is generating templates...' : 'Generate Templates'}
      </button>

      {templates.length > 0 && !loading && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-sm">Select a Template:</h3>
          {templates.map((template, index) => (
            <button
              key={index}
              onClick={() => onSelectTemplate(template)}
              className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm hover:bg-gray-100 text-left"
            >
              Template {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
