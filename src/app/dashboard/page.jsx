'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { logGptEdit } from '../../lib/logGptEdit';  // Adjust the path if needed

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);  // Added avatarUrl state
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, avatar_url')  // Fetch both role and avatar_url
        .eq('id', user.id)
        .single();

      if (profile) {
        setRole(profile.role);
        setAvatarUrl(profile.avatar_url);  // Set avatar URL
      } else {
        console.error('No profile found:', error);
      }

      // Example of calling logGptEdit (pass user_id and avatar_url)
      logGptEdit({
        source: 'example_source',
        repo: 'example_repo',
        filePath: 'example_path',
        instruction: 'example_instruction',
        gptOutput: 'example_output',
        commitUrl: 'example_commit_url',
        commitSha: 'example_commit_sha',
        user_id: user.id,
        avatar_url: profile.avatar_url  // Pass avatar URL here
      });
    };

    loadUser();
  }, [router]);

  if (!user || !role || !avatarUrl) return <p>Loading...</p>;

  return (
    <main style={{ padding: 40 }}>
      <h1>Welcome, {user.email}</h1>
      <p>Your role is: <strong>{role}</strong></p>
      {role === 'admin' && (
        <div>
          <h2>Admin Panel</h2>
          <p>You have elevated access.</p>
        </div>
      )}

      <button onClick={async () => {
        await supabase.auth.signOut();
        router.push('/login');
      }}>
        Log Out
      </button>
    </main>
  );
}
