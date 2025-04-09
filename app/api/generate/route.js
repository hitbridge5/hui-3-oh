export async function POST(req) {
  const body = await req.json();

  console.log("📥 Incoming form data:", body);
  console.log("🔑 OpenAI key exists:", !!process.env.OPENAI_API_KEY);

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ code: "Missing OpenAI API key." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  // Basic fallback if something comes in empty
  const fallback = "Build a basic HVAC website with Tailwind, including a hero, service list, and contact form.";

  const prompt = `
    Build a responsive 1-page website using HTML and Tailwind CSS only.
    Business Type: ${body.businessType || "HVAC"}
    Goal: ${body.websiteGoal || "Lead generation"}
    Style: ${body.designStyle || "Clean & Professional"}
    Notes: ${body.customNotes || "Include a contact form"}
    Return only the full HTML code. No extra text or commentary.
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
          { role: "system", content: "You are a professional frontend web developer." },
          { role: "user", content: prompt.trim() || fallback },
        ],
        temperature: 0.4,
        max_tokens: 1600,
      }),
    });

    const json = await response.json();

    console.log("🧠 GPT Response JSON:", JSON.stringify(json, null, 2));

    const html = json.choices?.[0]?.message?.content;

    if (!html) {
      console.error("⚠️ GPT returned no usable content.");
      return new Response(JSON.stringify({ code: "GPT returned empty content." }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ code: html }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("🔥 GPT error:", error.message);
    return new Response(JSON.stringify({ code: "Error from GPT call.", error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
