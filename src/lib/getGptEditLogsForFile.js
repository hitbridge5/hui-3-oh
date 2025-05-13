export async function getGptEditLogsForFile({ repo, filePath }) {
    const res = await fetch(`https://crevsaromipwyvuaqonh.supabase.co/rest/v1/gpt_edit_logs?repo=eq.${repo}&file_path=eq.${filePath}&order=created_at.desc`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch logs: ${err}`);
    }
  
    return await res.json();
  }
  