export async function POST(req) {
    const { prompt } = await req.json();
  
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), { status: 500 });
    }
  
    try {
      const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size: "1024x576", // You can adjust the size as needed
        }),
      });
  
      const data = await dalleRes.json();
  
      const imageUrl = data?.data?.[0]?.url;
  
      if (!imageUrl) {
        return new Response(JSON.stringify({ error: "No image returned from DALL·E" }), { status: 500 });
      }
  
      return new Response(JSON.stringify({ imageUrl }));
    } catch (err) {
      return new Response(JSON.stringify({ error: "DALL·E request failed", detail: err.message }), {
        status: 500,
      });
    }
  }
  