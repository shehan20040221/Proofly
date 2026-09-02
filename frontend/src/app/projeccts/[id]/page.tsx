'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import FileUpload from '@/components/FileUpload';
import ImageProofer from '@/components/ImageProofer';

const STAGES = ['BRIEFING', 'DRAFT', 'REVISION', 'APPROVED'];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [commentsByFile, setCommentsByFile] = useState<Record<string, any[]>>({});

  async function loadComments(fileId: string) {
    const res = await apiFetch(`/api/comments?fileId=${fileId}`);
    if (res.ok) {
      const data = await res.json();
      setCommentsByFile((prev) => ({ ...prev, [fileId]: data }));
    }
  }

  useEffect(() => {
    async function loadData() {
      // fetch who's logged in first
      const meRes = await apiFetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      // then fetch the project itself
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

      // fetch existing files for this project
      const filesRes = await apiFetch(`/api/files?projectId=${id}`);
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setFiles(filesData);

        // fetch comments for each file
        for (const file of filesData) {
          loadComments(file.id);
        }
      }

      setLoading(false);
    }

    loadData();
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

  const isDesigner = currentUser?.id === project.designerId;

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

        {isDesigner && (
          <FileUpload
            projectId={id as string}
            onUploaded={(file) => setFiles([...files, file])}
          />
        )}

        <div className="mt-4 flex flex-col gap-6">
          {files.map((file) => (
            <ImageProofer
              key={file.id}
              fileId={file.id}
              imageUrl={file.fileUrl}
              comments={commentsByFile[file.id] || []}
              onCommentAdded={(comment) =>
                setCommentsByFile((prev) => ({
                  ...prev,
                  [file.id]: [...(prev[file.id] || []), comment],
                }))
              }
              onCommentUpdated={(updatedComment) =>
                setCommentsByFile((prev) => ({
                  ...prev,
                  [file.id]: (prev[file.id] || []).map((c) =>
                    c.id === updatedComment.id ? updatedComment : c
                  ),
                }))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}