import { supabase } from '../../supabaseClient.js';

export async function logGptEdit({
  user_id,
  repo,
  file_path,
  instruction,
  gpt_output,
  commit_url,
  commit_sha,
}) {
  const { data, error } = await supabase.from('gpt_edit_logs').insert([
    {
      user_id,
      repo,
      file_path,
      instruction,
      gpt_output,
      commit_url,
      commit_sha,
      source: 'hui-three-oh', // 🟢 Required field to satisfy NOT NULL constraint
    },
  ]);

  if (error) {
    console.error('❌ Error logging GPT edit:', error);
  } else {
    console.log('✅ GPT edit logged:', data);
  }

  return { data, error };
}
