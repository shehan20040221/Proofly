'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await apiFetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        const projectsRes = await apiFetch('/api/projects');
        if (!projectsRes.ok) {
          setError('Could not load your projects. Try refreshing.');
        } else {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong loading the dashboard.');
      } finally {
        setChecking(false);
      }
    }

    loadData();
  }, [router]);

  if (checking) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-20 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-zinc-600">Role: {user?.role}</p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          {user?.role === 'DESIGNER' && (
            <Link href="/projects/new" className="bg-black text-white px-4 py-2 rounded">
              + New Project
            </Link>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {!error && projects.length === 0 && (
        <p className="text-zinc-500">No projects yet.</p>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block border p-4 rounded hover:bg-zinc-50"
          >
            <h2 className="font-semibold">{project.title}</h2>
            <p className="text-sm text-zinc-500">{project.stage}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}