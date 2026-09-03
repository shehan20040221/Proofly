'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  async function loadProject() {
    const res = await apiFetch(`/api/projects/${id}`);

    if (res.status === 401) {
      router.push('/login');
      return;
    }

    if (!res.ok) {
      setError('Project not found.');
      setLoading(false);
      return;
    }

    const data = await res.json();
    setProject(data);

    // fetch existing files for this project too
    const filesRes = await apiFetch(`/api/files?projectId=${id}`);
    if (filesRes.ok) {
      const filesData = await filesRes.json();
      setFiles(filesData);
    }

    setLoading(false);
  }

  loadProject();
}, [id, router]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-zinc-600 mt-2">{project.description}</p>
      <p className="mt-4 inline-block bg-zinc-100 px-3 py-1 rounded text-sm">
        {project.stage}
      </p>
    </div>
  );
}