'use client';

import { useEffect, useState } from 'react';

export default function EditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/get-edit-log-all');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load logs:', err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading)
    return <div className="p-6 text-neutral-900 dark:text-neutral-100">Loading logs…</div>;

  if (!logs.length)
    return <div className="p-6 text-neutral-900 dark:text-neutral-100">No logs found.</div>;

  return (
    <div className="p-6 space-y-4 text-neutral-900 dark:text-neutral-100">
      <h2 className="text-2xl font-bold">📝 Edit Log Viewer</h2>
      <ul className="space-y-4">
        {logs.map((log, i) => (
          <li
            key={i}
            className="border p-4 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm"
          >
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {new Date(log.created_at).toLocaleString()}
            </div>
            <div className="text-base font-medium mt-1">{log.instruction}</div>
            <div className="text-xs mt-1">
              <strong>User:</strong>{' '}
              {log.user_id ? log.user_id : <em className="text-red-400 dark:text-red-300">Unknown</em>}
            </div>
            {log.commit_url && (
              <a
                href={log.commit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline text-sm mt-2 inline-block"
              >
                View Commit
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
