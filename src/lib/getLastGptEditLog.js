export async function getLastGptEditLog({ repo, filePath }) {
    const res = await fetch(`https://<YOUR_PROJECT_ID>.supabase.co/rest/v1/gpt_edit_logs?repo=eq.${repo}&file_path=eq.${filePath}&order=created_at.desc&limit=1`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch last log: ${err}`);
    }
  
    const data = await res.json();
    return data[0]; // most recent entry
  }
  