'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function AuthButtons() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage('Login failed. Try again.');
    } else {
      setMessage('Check your email for a magic link.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div className="p-4">
        <p>Signed in as: {user.email}</p>
        <button onClick={handleLogout} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <input
        type="email"
        placeholder="Enter your work email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 px-4 py-2 rounded w-full"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Send Magic Link
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
