import { logGptEdit } from '../../lib/logGptEdit';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await logGptEdit({
    source: 'test',
    repo: 'test-repo',
    filePath: 'index.html',
    instruction: 'Test instruction for Supabase logging',
    gptOutput: '<h1>Hello World</h1>',
    commitUrl: 'https://github.com/your-org/test-repo/commit/abc123'
  });

  res.status(200).json({ message: 'Log inserted!' });
}
