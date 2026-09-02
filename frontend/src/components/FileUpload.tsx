'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function FileUpload({ projectId, onUploaded }: { projectId: string; onUploaded: (file: any) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Step 1: get a signature from our backend
      const signRes = await apiFetch('/api/files/sign');
      const { timestamp, signature, cloudName, apiKey } = await signRes.json();

      // Step 2: upload directly to Cloudinary using that signature
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'proofly');

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error('Upload to Cloudinary failed');
      }

      // Step 3: tell our backend to save this as a File record
      const saveRes = await apiFetch('/api/files', {
        method: 'POST',
        body: JSON.stringify({ projectId, fileUrl: cloudinaryData.secure_url }),
      });

      const savedFile = await saveRes.json();
      onUploaded(savedFile);
    } catch (err) {
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p className="text-sm text-zinc-500">Uploading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}