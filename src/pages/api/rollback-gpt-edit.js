import { getLastGptEditLog } from '../../lib/getLastGptEditLog';
import { logGptEdit } from '../../lib/logGptEdit';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { repo, filePath } = req.body;
  const githubToken = process.env.GITHUB_TOKEN;
  const branch = 'main';

  try {
    const lastLog = await getLastGptEditLog({ repo, filePath });

    if (!lastLog?.commit_sha || !lastLog?.gpt_output) {
      throw new Error('No rollback data found for this file');
    }

    // Get SHA of the current live version from GitHub
    const metaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${githubToken}` }
    });

    const { sha } = await metaRes.json();

    const encoded = Buffer.from(lastLog.gpt_output).toString('base64');

    const commitRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Rollback to SHA ${lastLog.commit_sha}`,
        content: encoded,
        sha,
        branch
      })
    });

    const commitData = await commitRes.json();

    // Log rollback action
    await logGptEdit({
      source: 'rollback',
      repo,
      filePath,
      instruction: `Rollback to SHA ${lastLog.commit_sha}`,
      gptOutput: lastLog.gpt_output,
      commitUrl: commitData?.commit?.html_url || null,
      commitSha: commitData?.commit?.sha || null
    });

    res.status(200).json({
      message: 'Rollback successful',
      commitUrl: commitData?.commit?.html_url || null
    });

  } catch (err) {
    console.error('Rollback error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
