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
              content: 'You are a frontend developer. Return valid HTML only based on user instruction.'
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
  
      // Clean: extract only valid HTML
      const match = updatedCode.match(/```html\s*([\s\S]*?)```/i);
      if (match) {
        updatedCode = match[1].trim();
      } else {
        updatedCode = updatedCode
          .replace(/^Here is.*?:/i, '')
          .replace(/```/g, '')
          .trim();
      }
  
      res.status(200).json({ updatedCode });
  
    } catch (err) {
      console.error('Preview GPT Error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
  