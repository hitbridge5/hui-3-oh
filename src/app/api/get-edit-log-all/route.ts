import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://crevsaromipwyvuaqonh.supabase.co/rest/v1/gpt_edit_logs?select=*', {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
      }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
