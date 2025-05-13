export async function logGptEdit({
  source,
  repo,
  filePath,
  instruction,
  gptOutput,
  commitUrl,
  commitSha,
  user_id,
  avatar_url
}) {
  try {
    const res = await fetch('https://crevsaromipwyvuaqonh.supabase.co/rest/v1/gpt_edit_logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        source,
        repo,
        file_path: filePath,
        instruction,
        gpt_output: gptOutput,
        commit_url: commitUrl,
        commit_sha: commitSha,
        user_id,
        avatar_url
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to log GPT edit:", errorText);
    }
  } catch (err) {
    console.error("Log insert failed:", err);
  }
}
