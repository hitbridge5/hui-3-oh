export async function logGptEdit({
    source, // "site" or "hui"
    repo,
    filePath,
    instruction,
    gptOutput,
    commitUrl
  }) {
    try {
      const res = await fetch('https://<YOUR_PROJECT_ID>.supabase.co/rest/v1/gpt_edit_logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          source,
          repo,
          file_path: filePath,
          instruction,
          gpt_output: gptOutput,
          commit_url: commitUrl
        })
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to log GPT edit:", errorText);
      }
    } catch (err) {
      console.error("Log insert failed:", err.message);
    }
  }
  