export async function POST(req) {
  const body = await req.json();

  console.log("📦 Incoming request body:", body);
  console.log("🔑 OpenAI key present?", !!process.env.OPENAI_API_KEY);

  // Catch missing key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is missing.");
    return new Response(JSON.stringify({ code: "Missing OpenAI API key." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  const prompt = `
    Build a clean, responsive small business website using HTML and Tailwind CSS.
    Business Type: ${body.businessType}
    Goal: ${body.websiteGoal}
    Style: ${body.designStyle}
    Notes: ${body.customNotes || "None"}
    Use semantic markup and no external dependencies.
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
          { role: "system", content: "You are a professional web developer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const json = await response.json();
    console.log("🧠 GPT raw response:", JSON.stringify(json, null, 2));

    const generatedCode = json.choices?.[0]?.message?.content || "No output from GPT.";

    return new Response(JSON.stringify({ code: generatedCode }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("🔥 Error calling GPT:", error);
    return new Response(JSON.stringify({ code: "GPT error occurred." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}