import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'Missing HTML input' }, { status: 400 });
    }

    const prompt = `
You are an SEO assistant. Analyze the following HTML content and generate:
1. A title tag (max 60 characters),
2. A meta description (max 160 characters),
3. A list of 5 relevant SEO keywords.

Return the response in this exact JSON format:
{
  "title": "...",
  "description": "...",
  "keywords": ["...", "...", "...", "...", "..."]
}

HTML:
${html}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const rawOutput = completion.choices[0].message.content?.trim() || '{}';

    let seo;
    try {
      seo = JSON.parse(rawOutput);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON from model', raw: rawOutput },
        { status: 500 }
      );
    }

    return NextResponse.json(seo);
  } catch (err: any) {
    console.error('[generate-seo] Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
