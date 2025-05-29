import { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { logGptEdit } from '../../src/utils/logGptEdit.js';

export default function EditorComponent() {
  const [code, setCode] = useState('<div>Hello World</div>');
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState({});
  const [showPreview, setShowPreview] = useState(true);

  async function sendToGPT(currentCode, instruction) {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful web developer assistant. Make clean code updates based on user instructions.',
      },
      {
        role: 'user',
        content: `Here is the current code:\n\n${currentCode}\n\nInstruction: ${instruction}`,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('❌ OpenAI error:', data.error);
      return 'Error: ' + data.error.message;
    }

    return data.choices[0].message.content;
  }

  const handleUpdate = async () => {
    setLoading(true);
    const updated = await sendToGPT(code, instruction);
    setCode(updated);

    const userData = { user: { id: '00000000-0000-0000-0000-000000000001' } };

    await logGptEdit({
      user_id: userData.user.id,
      repo: 'hitbridge5/client-electrician-site',
      file_path: 'index.html',
      instruction,
      gpt_output: updated,
      commit_url: '',
      commit_sha: '',
    });

    setLoading(false);
  };

  const handleGenerateImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://crevsaromipwyvuaqonh.functions.supabase.co/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-api-key': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          hero_image: 'A modern HVAC business hero image with a technician and van',
          services_image: 'Icons representing HVAC repair, installation, and maintenance',
          about_image: 'A professional HVAC team at work with tools and vehicles',
          contact_image: 'Clean call-to-action or contact form layout with phone icon',
        }),
      });

      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('❌ Error calling generate-images:', err);
    } finally {
      setLoading(false);
    }
  };

  const injectImagesIntoCode = () => {
    let updated = code;

    if (images.hero_image) {
      updated = updated.replace(/<img[^>]*hero[^>]*>/i, `<img src="${images.hero_image}" alt="hero image" />`);
    }
    if (images.services_image) {
      updated = updated.replace(/<img[^>]*services[^>]*>/i, `<img src="${images.services_image}" alt="services image" />`);
    }
    if (images.about_image) {
      updated = updated.replace(/<img[^>]*about[^>]*>/i, `<img src="${images.about_image}" alt="about image" />`);
    }
    if (images.contact_image) {
      updated = updated.replace(/<img[^>]*contact[^>]*>/i, `<img src="${images.contact_image}" alt="contact image" />`);
    }

    setCode(updated);
  };

  const sharedButtonStyle = {
    border: '1px solid #6b7280',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    minWidth: '200px',
    flexGrow: 1
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <textarea
          className="w-full border p-2 mb-2"
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
  type="text"
  placeholder="Enter instruction (e.g. 'Make it responsive')"
  value={instruction}
  onChange={(e) => setInstruction(e.target.value)}
  style={{
    width: '100%',
    padding: '0.5rem',
    marginTop: '1.25rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    backgroundColor: '#40414f',
    border: '1px solid #6b7280',
    color: 'white'
  }}
/>


        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            style={{ ...sharedButtonStyle, backgroundColor: '#3b82f6' }}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Thinking…' : 'Update with GPT'}
          </button>

          <button
            style={{ ...sharedButtonStyle, backgroundColor: '#8b5cf6' }}
            onClick={handleGenerateImages}
            disabled={loading}
          >
            {loading ? 'Generating…' : 'Generate Section Images'}
          </button>

          <button
            style={{ ...sharedButtonStyle, backgroundColor: '#10b981' }}
            onClick={injectImagesIntoCode}
            disabled={loading || !Object.keys(images).length}
          >
            Inject Images Into Preview
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1rem' }}>
          <button
            style={{ ...sharedButtonStyle, backgroundColor: '#9ca3af', color: 'black' }}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Show HTML Code' : 'Show Live Preview'}
          </button>

          <button
            style={{ ...sharedButtonStyle, backgroundColor: '#9ca3af', color: 'black' }}
            onClick={() => {
              const newWindow = window.open('', '_blank');
              newWindow?.document.write(code);
              newWindow?.document.close();
            }}
          >
            Open in New Tab
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">
            {showPreview ? 'Live Preview' : 'HTML Code'}
          </h3>
          {showPreview ? (
            <div
              className="border border-gray-300 rounded p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: code }}
            />
          ) : (
            <pre className="border border-gray-300 rounded p-4 bg-gray-100 whitespace-pre-wrap text-sm">
              {code}
            </pre>
          )}
        </div>

        {Object.keys(images).length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Generated Section Images</h3>
            {Object.entries(images).map(([key, url]) => (
              <div key={key}>
                <p className="font-semibold capitalize">{key.replace('_', ' ')}:</p>
                <img src={url} alt={key} className="w-full max-w-xl rounded border" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
