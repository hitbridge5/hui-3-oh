'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function SiteGptEditPanel() {
  const { user } = useAuth();

  const [siteRepo, setSiteRepo] = useState('hitbridge5/client-electrician-site');
  const [filePath, setFilePath] = useState('index.html');
  const [instruction, setInstruction] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(true);
  const [viewMode, setViewMode] = useState('preview');
  const [previewPayload, setPreviewPayload] = useState(null);
  const [versionLogs, setVersionLogs] = useState([]);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);

    const payload = {
      siteRepo,
      filePath,
      instruction,
      user_id: user?.id || null
    };

    try {
      const endpoint = previewOnly ? '/api/preview-site-gpt-edit' : '/api/site-gpt-edit';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setResponse(data);
      if (previewOnly) setPreviewPayload(payload);

      const logsRes = await fetch('/api/get-edit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: siteRepo, filePath })
      });

      const logs = await logsRes.json();
      setVersionLogs(logs);

    } catch (err) {
      setResponse({ error: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const openPreviewWindow = () => {
    if (!response?.updatedCode) return;
    const previewWindow = window.open('', '_blank', 'width=375,height=667,resizable=yes');
    if (!previewWindow) {
      alert('Popup blocked. Please allow popups for this site.');
      return;
    }
    previewWindow.document.open();
    previewWindow.document.write(response.updatedCode);
    previewWindow.document.close();
  };

  return (
    <div className="p-6 bg-white text-black shadow-md rounded-lg max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Client Site Editor</h2>
        {user && (
          <div className="text-sm text-right">
            <div>{user.email}</div>
            <div className="text-gray-500 text-xs">UID: {user.id}</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Site Repo</label>
          <input
            className="w-full border p-2 rounded text-black bg-white"
            value={siteRepo}
            onChange={(e) => setSiteRepo(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">File Path</label>
          <input
            className="w-full border p-2 rounded text-black bg-white"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Instruction</label>
          <textarea
            className="w-full border p-2 rounded text-black bg-white"
            rows={4}
            placeholder="e.g. Add a footer that says '© 2025 All rights reserved.'"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="font-medium">Preview Only</label>
          <input
            type="checkbox"
            checked={previewOnly}
            onChange={() => setPreviewOnly(!previewOnly)}
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading || !instruction.trim()}
        >
          {loading
            ? (previewOnly ? 'Previewing...' : 'Submitting...')
            : (previewOnly ? 'Preview Update' : 'Submit Update')}
        </button>

        {response?.updatedCode && (
          <div className="mt-4 space-y-4">
            <div className="flex space-x-2">
              <button
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setViewMode(viewMode === 'code' ? 'preview' : 'code')}
              >
                {viewMode === 'code' ? 'Show Preview' : 'Show Code'}
              </button>
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={openPreviewWindow}
              >
                View in Window
              </button>
            </div>

            {viewMode === 'code' ? (
              <pre className="mt-2 p-2 bg-white border overflow-x-auto whitespace-pre-wrap text-sm">
                {response.updatedCode}
              </pre>
            ) : (
              <div
                className="mt-2 p-4 border rounded bg-white"
                dangerouslySetInnerHTML={{ __html: response.updatedCode }}
              />
            )}

            {previewOnly && previewPayload && (
              <button
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={async () => {
                  const confirmed = window.confirm('Are you sure you want to submit this edit?');
                  if (!confirmed) return;
                  setLoading(true);
                  try {
                    const res = await fetch('/api/site-gpt-edit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...previewPayload, user_id: user?.id || null }),
                    });
                    const result = await res.json();
                    setResponse(result);
                    setPreviewOnly(false);

                    const logsRes = await fetch('/api/get-edit-log', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ repo: siteRepo, filePath })
                    });
                    const logs = await logsRes.json();
                    setVersionLogs(logs);
                  } catch (err) {
                    setResponse({ error: 'Commit failed' });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Submit This Preview
              </button>
            )}
          </div>
        )}

        {response?.commitUrl && (
          <p className="mt-2">
            View update: <a href={response.commitUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{response.commitUrl}</a>
          </p>
        )}

        <hr className="my-4" />
        <div className="space-y-2">
          <p className="font-medium text-gray-700">Version Control</p>
          {versionLogs.length > 0 && (
            <>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={async () => {
                  const confirmRollback = window.confirm('Rollback the last update? This will overwrite the file.');
                  if (!confirmRollback) return;
                  setLoading(true);
                  try {
                    await fetch('/api/rollback-gpt-edit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ siteRepo, filePath })
                    });

                    const previewRes = await fetch('/api/preview-site-gpt-edit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ siteRepo, filePath })
                    });

                    const previewData = await previewRes.json();
                    setResponse(previewData);
                  } catch (err) {
                    setResponse({ error: 'Rollback failed' });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Rollback to Last Update
              </button>

              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-600">Edit History</h4>
                <ul className="text-sm space-y-1">
                  {versionLogs.map((log, i) => (
                    <li key={i} className="border rounded p-2 bg-gray-50">
                      <p><strong>{new Date(log.created_at).toLocaleString()}</strong></p>
                      <p className="text-gray-800">{log.instruction}</p>
                      {log.commit_url && (
                        <button
                          onClick={() => {
                            const win = window.open('', '_blank', 'width=375,height=667,resizable=yes');
                            win.document.open();
                            win.document.write(log.gpt_output);
                            win.document.close();
                          }}
                          className="text-blue-600 underline"
                        >
                          View
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
