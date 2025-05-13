import { getGptEditLogsForFile } from '../../lib/getGptEditLogsForFile';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { repo, filePath } = req.body;
  try {
    const logs = await getGptEditLogsForFile({ repo, filePath });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
