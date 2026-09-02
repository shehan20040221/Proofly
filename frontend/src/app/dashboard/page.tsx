'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const res = await apiFetch('/api/auth/me');

      if (!res.ok) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setChecking(false);
    }

    checkAuth();
  }, [router]);

  if (checking) return <p className="text-center mt-20">Checking login status...</p>;

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p className="text-zinc-600">Role: {user.role}</p>
    </div>
  );
}