export async function POST(req) {
  const body = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ code: "Missing OpenAI API key." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  const prompt = `
    Build a responsive 1-page website using HTML and Tailwind CSS only.
    Business Type: ${body.businessType}
    Goal: ${body.websiteGoal}
    Style: ${body.designStyle}
    Notes: ${body.customNotes || "None"}
    Return only the complete HTML content, no explanation.
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-1106", // faster and more stable than default
        messages: [
          {
            role: "system",
            content: "You are a web developer. Only return complete HTML files using Tailwind CSS.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1600,
      }),
    });

    const json = await response.json();

    const generatedCode = json.choices?.[0]?.message?.content;

    console.log("✅ GPT Output:", generatedCode);

    if (!generatedCode) {
      return new Response(JSON.stringify({ code: "GPT responded with no usable content." }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ code: generatedCode }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("🔥 GPT error:", error.message);
    return new Response(JSON.stringify({ code: "Error generating content.", error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
