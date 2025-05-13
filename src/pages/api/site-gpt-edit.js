import { logGptEdit } from '../../lib/logGptEdit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteRepo, filePath, instruction } = req.body;
  const githubToken = process.env.GITHUB_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  const branch = 'main';

  try {
    const fileRes = await fetch(`https://api.github.com/repos/${siteRepo}/contents/${filePath}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3.raw'
      }
    });

    if (!fileRes.ok) {
      const err = await fileRes.text();
      throw new Error(`GitHub read failed: ${err}`);
    }

    const currentCode = await fileRes.text();

    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a frontend developer. Return only valid HTML for the requested change.'
          },
          {
            role: 'user',
            content: `Here is the code from ${filePath}:\n\n${currentCode}\n\nInstruction: ${instruction}`
          }
        ],
        temperature: 0.3
      })
    });

    const gptData = await gptRes.json();
    let updatedCode = gptData.choices[0].message.content || '';

    const match = updatedCode.match(/```html\s*([\s\S]*?)```/i);
    if (match) {
      updatedCode = match[1].trim();
    } else {
      updatedCode = updatedCode
        .replace(/^Here is.*?:/i, '')
        .replace(/```/g, '')
        .trim();
    }

    const metaRes = await fetch(`https://api.github.com/repos/${siteRepo}/contents/${filePath}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`
      }
    });

    const { sha } = await metaRes.json();

    const commitRes = await fetch(`https://api.github.com/repos/${siteRepo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `GPT edit: ${instruction}`,
        content: Buffer.from(updatedCode).toString('base64'),
        sha,
        branch
      })
    });

    const commitData = await commitRes.json();

    await logGptEdit({
      source: 'site',
      repo: siteRepo,
      filePath,
      instruction,
      gptOutput: updatedCode,
      commitUrl: commitData?.commit?.html_url || null,
      commitSha: commitData?.commit?.sha || null
    });

    res.status(200).json({
      message: 'File updated successfully',
      updatedCode,
      commitUrl: commitData?.commit?.html_url || null
    });

  } catch (err) {
    console.error('Site GPT Edit Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
