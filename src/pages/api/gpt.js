export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { currentCode, instruction } = req.body;
  
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful web developer assistant. Make clean code updates based on user instructions.',
      },
      {
        role: 'user',
        content: `Here is the current code:\n\n${currentCode}\n\nInstruction: ${instruction}`,
      },
    ];
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature: 0.3,
        }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        console.error(data.error);
        return res.status(500).json({ error: data.error.message });
      }
  
      const gptReply = data.choices[0].message.content;
      res.status(200).json({ updatedCode: gptReply });
  
    } catch (error) {
      console.error('GPT API Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  