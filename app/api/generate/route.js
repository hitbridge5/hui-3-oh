export async function POST(req) {
  const body = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Build a simple 1-page HVAC website using HTML and Tailwind. Include a hero, services, and contact form.",
          },
        ],
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });

    const json = await response.json();

    // 💥 Return full GPT response directly to browser
    return new Response(JSON.stringify({
      fullResponse: json,
      debug: {
        error: json.error || null,
        choices: json.choices || null,
        firstChoice: json.choices?.[0] || null,
        content: json.choices?.[0]?.message?.content || null,
      },
    }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "GPT fetch failed",
      detail: error.message
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
