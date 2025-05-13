'use client';

import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  // Role-based redirect after login
  useEffect(() => {
    const fetchRoleAndRedirect = async () => {
      if (!user) return;
      console.log('User ID:', user.id);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch role:', error.message);
        return;
      }

      const role = data?.role;

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'em') {
        router.push('/em');
      } else {
        router.push('/unauthorized');
      }
    };

    fetchRoleAndRedirect();
  }, [user]);

  const sendMagicLink = async () => {
    if (!email) return;

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    setStatus(error ? 'Error: ' + error.message : 'Magic link sent! Check your email.');
  };

  if (loading) {
    return <p className="text-center p-6">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-white p-6 dark:bg-black">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">HUI Admin Panel</h1>

      {user ? (
        <>
          <p className="text-black dark:text-white mb-4">Signed in as: {user.email}</p>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded mb-6 hover:bg-red-700"
          >
            Sign out
          </button>
        </>
      ) : (
        <div className="p-4 space-y-2 max-w-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMagicLink();
            }}
            placeholder="Enter your work email"
            className="border border-gray-300 px-4 py-2 rounded w-full text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-600 dark:placeholder-gray-400"
          />
          <button
            onClick={sendMagicLink}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            Send Magic Link
          </button>
          {status && <p className="text-sm text-black dark:text-gray-300">{status}</p>}
        </div>
      )}
    </main>
  );
}
