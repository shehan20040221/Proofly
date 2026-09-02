'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import FileUpload from '@/components/FileUpload';

const STAGES = ['BRIEFING', 'DRAFT', 'REVISION', 'APPROVED'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

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
      setLoading(false);
    }

    loadProject();
  }, [id, router]);

  async function handleStageChange(newStage: string) {
    setUpdating(true);

    const res = await apiFetch(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: newStage }),
    });

    if (res.ok) {
      const updated = await res.json();
      setProject(updated);
    }

    setUpdating(false);
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-zinc-600 mt-2">{project.description}</p>

      <div className="mt-4">
        <label className="text-sm text-zinc-500 block mb-1">Stage</label>
        <select
          value={project.stage}
          onChange={(e) => handleStageChange(e.target.value)}
          disabled={updating}
          className="border p-2 rounded"
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Mockups</h2>
        <FileUpload projectId={id as string} onUploaded={(file) => setFiles([...files, file])} />

        <div className="mt-4 grid grid-cols-2 gap-4">
          {files.map((file) => (
            <img key={file.id} src={file.fileUrl} alt="Mockup" className="rounded border" />
          ))}
        </div>
      </div>
    </div>
  );
}