export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { prompt } = await request.json();

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OPENAI RAW RESPONSE:', JSON.stringify(data, null, 2));

    const result = data.choices?.[0]?.text || 'No result';
    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GPT API ERROR:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate templates' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
