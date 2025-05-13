'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/utils/supabase/client';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyAccess = async () => {
      if (loading) return;

      if (!user) {
        router.replace('/');
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data?.role !== 'admin') {
        router.replace('/unauthorized');
        return;
      }

      setAuthorized(true);
    };

    verifyAccess();
  }, [user, loading]);

  if (!authorized) return <p className="p-6">Checking authorization...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p className="mt-2">You are authorized as an admin.</p>
    </div>
  );
}
