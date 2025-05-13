import { logGptEdit } from '../../lib/logGptEdit';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { filePath, instruction } = req.body;
    const repo = 'hitbridge5/hui-3-oh'; // <-- replace with your actual HUI repo
    const branch = 'master'; // or 'dev', depending on your flow
  
    const githubToken = process.env.GITHUB_TOKEN;
  
    try {
      // 1. Fetch file content from GitHub
      const githubUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
console.log('GITHUB_TOKEN (truncated):', process.env.GITHUB_TOKEN?.slice(0, 6));

const fileResponse = await fetch(githubUrl, {
  headers: {
    Authorization: `Bearer ${githubToken}`,
    Accept: 'application/vnd.github.v3.raw',
  },
});

if (!fileResponse.ok) {
  const errorText = await fileResponse.text();
  console.error('GitHub API Error:', errorText);
  throw new Error('Failed to fetch file from GitHub');
}

  
      const currentCode = await fileResponse.text();
  
      // 2. Send to GPT for editing
      const messages = [
        { role: 'system', content: 'You are a senior React developer helping with code edits.' },
        { role: 'user', content: `Here is the code from ${filePath}:\n\n${currentCode}\n\nInstruction: ${instruction}` }
      ];
  
      const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature: 0.3,
        }),
      });
  
      const gptData = await gptRes.json();
      let updatedCode = gptData.choices[0].message.content || '';

// Extract only what's inside ```html ... ```
const match = updatedCode.match(/```html\s*([\s\S]*?)```/i);

if (match) {
  updatedCode = match[1].trim();
} else {
  // Remove markdown and filler if no html block was found
  updatedCode = updatedCode
    .replace(/^Here is.*?:/i, '')
    .replace(/```/g, '')
    .trim();
}
  
      if (!updatedCode) throw new Error('No response from GPT');
  
      // 3. Get file SHA for update
      const metaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`, {
        headers: { Authorization: `Bearer ${githubToken}` }
      });
      const { sha } = await metaRes.json();
  
      // 4. Push updated code to GitHub
const commitRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${githubToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: `GPT edit: ${instruction}`,
    content: Buffer.from(updatedCode).toString('base64'),
    sha,
    branch,
  }),
});
const commitData = await commitRes.json();

await logGptEdit({
  source: 'hui',
  repo,
  filePath,
  instruction,
  gptOutput: gptReply,
  commitUrl: commitData?.commit?.html_url || null
});

// ✅ Only one call to .json()
const commitData = await commitRes.json();

// ✅ Log to Supabase
await logGptEdit({
  source: 'site',
  repo,
  filePath,
  instruction,
  gptOutput: updatedCode,
  commitUrl: commitData?.commit?.html_url || null
});

if (!commitRes.ok) throw new Error('Failed to commit update to GitHub');

console.log('Updated Code:', updatedCode.slice(0, 100) + '...');
console.log('GitHub PUT response status:', commitRes.status);
console.log('GitHub response:', commitData); // reuse the same parsed JSON

res.status(200).json({ message: 'File updated successfully', updatedCode });
