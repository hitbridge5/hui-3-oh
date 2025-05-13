'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession().then(({ data, error }) => {
      if (error) {
        console.error("Auth error:", error.message);
        router.push('/?error=auth');
      } else {
        console.log("Session established:", data);
        router.push('/');
      }
    });
  }, []);

  return <p className="p-6 text-center">Logging you in...</p>;
}
