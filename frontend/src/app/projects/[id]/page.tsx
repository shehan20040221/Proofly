'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import FileUpload from '@/components/FileUpload';
import ImageProofer from '@/components/ImageProofer';
import InvoicePDF from '@/components/InvoicePDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

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
  const [invoice, setInvoice] = useState<any>(null);

  async function loadComments(fileId: string) {
    const res = await apiFetch(`/api/comments?fileId=${fileId}`);
    if (res.ok) {
      const data = await res.json();
      setCommentsByFile((prev) => ({ ...prev, [fileId]: data }));
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await apiFetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setCurrentUser(meData.user);

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

        const filesRes = await apiFetch(`/api/files?projectId=${id}`);
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          setFiles(filesData);

          for (const file of filesData) {
            loadComments(file.id);
          }
        }

        const invoiceRes = await apiFetch(`/api/invoices/${id}`);
        if (invoiceRes.ok) {
          const invoiceData = await invoiceRes.json();
          setInvoice(invoiceData);
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong loading the project.');
      } finally {
        setLoading(false);
      }
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
    <div className="max-w-2xl mx-auto mt-20 px-4">
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
          {files.length === 0 && (
            <p className="text-zinc-500 text-sm">
              {isDesigner ? 'Upload your first mockup above.' : 'No mockups uploaded yet.'}
            </p>
          )}

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

      {invoice && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Invoice</h2>
          <p className="text-2xl font-bold mb-2">${Number(invoice.total).toFixed(2)}</p>

          <PDFDownloadLink
            document={
              <InvoicePDF
                projectTitle={project.title}
                items={invoice.items}
                total={Number(invoice.total)}
              />
            }
            fileName={`invoice-${project.title}.pdf`}
            className="inline-block bg-black text-white px-4 py-2 rounded text-sm"
          >
            {({ loading }) => (loading ? 'Preparing PDF...' : 'Download Invoice PDF')}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
}