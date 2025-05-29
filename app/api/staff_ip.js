let staffIps = {}; // Temporary in-memory storage, replace with DB later

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, ipAddress, remove } = req.body;

    if (remove) {
      // Remove IP from the list
      if (staffIps[userId]) {
        staffIps[userId] = staffIps[userId].filter(ip => ip !== ipAddress);
      }
    } else {
      // Add IP to the list
      if (!staffIps[userId]) {
        staffIps[userId] = [];
      }
      staffIps[userId].push(ipAddress);
    }

    res.status(200).json({ userId, allowed_ips: staffIps[userId] || [] });
  } else if (req.method === 'GET') {
    const { userId } = req.query;
    res.status(200).json({ allowed_ips: staffIps[userId] || [] });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
