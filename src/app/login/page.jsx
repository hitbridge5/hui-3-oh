'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  // 👇 Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: 10 }}
        />
        <button type="submit">Log In</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  );
}
