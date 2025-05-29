import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [userId, setUserId] = useState('');
  const [newIp, setNewIp] = useState('');
  const [allowedIps, setAllowedIps] = useState([]);

  useEffect(() => {
    if (!userId) return;
    // Fetch IPs for the staff user
    fetch(`/api/staff_ip/${userId}`)
      .then(res => res.json())
      .then(data => setAllowedIps(data.allowed_ips || []));
  }, [userId]);

  const handleAddIp = () => {
    if (!newIp) return;
    // Add new IP for the user
    fetch('/api/staff_ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ipAddress: newIp })
    }).then(res => res.json()).then(() => {
      setAllowedIps([...allowedIps, newIp]);
      setNewIp('');
    });
  };

  return (
    <div>
      <h1>Admin Panel - Manage Staff IPs</h1>
      <div>
        <label>User ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>
      <div>
        <label>Add IP Address</label>
        <input
          type="text"
          value={newIp}
          onChange={(e) => setNewIp(e.target.value)}
        />
        <button onClick={handleAddIp}>Add IP</button>
      </div>
      <div>
        <h2>Allowed IPs</h2>
        <ul>
          {allowedIps.map((ip) => (
            <li key={ip}>{ip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
