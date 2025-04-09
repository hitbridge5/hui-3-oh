export async function POST(req) {
    const body = await req.json();
  
    const prompt = `
      Build a clean, responsive small business website in HTML and Tailwind CSS.
      Business Type: ${body.businessType}
      Goal: ${body.websiteGoal}
      Style: ${body.designStyle}
      Notes: ${body.customNotes || "None"}
      Use semantic markup, clean layout, and no external dependencies.
    `;
  
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional web developer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });
  
    const json = await response.json();
    const generatedCode = json.choices?.[0]?.message?.content || "No output.";
  
    return new Response(JSON.stringify({ code: generatedCode }), {
      headers: { "Content-Type": "application/json" },
    });
  }