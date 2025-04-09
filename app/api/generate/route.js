export async function POST(req) {
  const body = await req.json();

  console.log("📦 Incoming request body:", body);
  console.log("🔑 OpenAI key present?", !!process.env.OPENAI_API_KEY);

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ code: "Missing OpenAI API key." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  const prompt = `
    Create a professional small business website layout using HTML and Tailwind CSS only.
    Business Type: ${body.businessType}
    Goal: ${body.websiteGoal}
    Style: ${body.designStyle}
    Notes: ${body.customNotes || "None"}
    Use semantic HTML5, no external JS or CSS, and style the page with Tailwind.
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a web developer that returns HTML and Tailwind code only. No explanations." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1800,
      }),
    });

    const json = await response.json();
    console.log("🧠 GPT raw response:", JSON.stringify(json, null, 2));

    const generatedCode = json.choices?.[0]?.message?.content;

    if (!generatedCode) {
      console.error("⚠️ GPT response missing content field.");
      return new Response(JSON.stringify({ code: "GPT response was empty." }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ code: generatedCode }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("🔥 GPT fetch error:", error);
    return new Response(JSON.stringify({ code: "GPT error occurred." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

