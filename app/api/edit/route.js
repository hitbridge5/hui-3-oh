export async function POST(req) {
    const { html, instruction } = await req.json();
  
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ code: "Missing OpenAI API key." }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  
    const prompt = `
  You are a web developer. You will receive an HTML document and a user instruction.
  Apply the instruction to the HTML and return ONLY the modified HTML. Do not explain.
  
  Instruction:
  "${instruction}"
  
  Original HTML:
  ${html}
  `;
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106",
          messages: [
            { role: "system", content: "You are a professional frontend developer. Always return complete HTML only." },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 1600,
        }),
      });
  
      const json = await response.json();
      const updatedHtml = json.choices?.[0]?.message?.content;
  
      if (!updatedHtml) {
        return new Response(JSON.stringify({ code: "No changes returned by GPT." }), {
          headers: { "Content-Type": "application/json" },
          status: 500,
        });
      }
  
      return new Response(JSON.stringify({ code: updatedHtml }), {
        headers: { "Content-Type": "application/json" },
      });
  
    } catch (error) {
      console.error("🔥 GPT edit error:", error.message);
      return new Response(JSON.stringify({ code: "Error during edit.", error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  }
  