'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Comment {
  id: string;
  posX: number;
  posY: number;
  text: string;
  resolved: boolean;
  author: { name: string };
}

export default function ImageProofer({
  fileId,
  imageUrl,
  comments,
  onCommentAdded,
  onCommentUpdated,
}: {
  fileId: string;
  imageUrl: string;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
  onCommentUpdated: (comment: Comment) => void;
}) {
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);

  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;

    setPendingPin({ x: relativeX, y: relativeY });
    setOpenCommentId(null);
  }

  async function submitComment() {
    if (!pendingPin || !commentText.trim()) return;

    const res = await apiFetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        fileId,
        posX: pendingPin.x,
        posY: pendingPin.y,
        text: commentText,
      }),
    });

    if (res.ok) {
      const newComment = await res.json();
      onCommentAdded(newComment);
      setPendingPin(null);
      setCommentText('');
    }
  }

  async function toggleResolved(comment: Comment) {
    const res = await apiFetch(`/api/comments/${comment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ resolved: !comment.resolved }),
    });

    if (res.ok) {
      const updated = await res.json();
      onCommentUpdated(updated);
    }
  }

  return (
    <div className="relative inline-block">
      <img
        src={imageUrl}
        alt="Mockup"
        onClick={handleImageClick}
        className="rounded border cursor-crosshair max-w-full"
      />

      {/* existing saved pins — clicking one opens its detail panel */}
      {comments.map((comment) => (
        <div key={comment.id}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpenCommentId(openCommentId === comment.id ? null : comment.id);
              setPendingPin(null);
            }}
            title={`${comment.author.name}: ${comment.text}`}
            className={`absolute w-4 h-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
              comment.resolved ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ left: `${comment.posX * 100}%`, top: `${comment.posY * 100}%` }}
          />

          {openCommentId === comment.id && (
            <div
              className="absolute bg-white border rounded p-2 shadow-lg w-64 z-20"
              style={{
                left: `${comment.posX * 100}%`,
                top: `${comment.posY * 100}%`,
                marginTop: '12px',
              }}
            >
              <p className="text-xs text-zinc-500">{comment.author.name}</p>
              <p className="text-sm mt-1">{comment.text}</p>
              <button
                onClick={() => toggleResolved(comment)}
                className={`text-xs mt-2 px-2 py-1 rounded ${
                  comment.resolved ? 'bg-zinc-200' : 'bg-green-600 text-white'
                }`}
              >
                {comment.resolved ? 'Mark unresolved' : 'Mark resolved'}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* pin currently being placed, not saved yet */}
      {pendingPin && (
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pendingPin.x * 100}%`, top: `${pendingPin.y * 100}%` }}
        />
      )}

      {pendingPin && (
        <div
          className="absolute bg-white border rounded p-2 shadow-lg w-64 z-20"
          style={{
            left: `${pendingPin.x * 100}%`,
            top: `${pendingPin.y * 100}%`,
            marginTop: '12px',
          }}
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Leave feedback..."
            className="border p-1 w-full text-sm"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2 mt-1">
            <button onClick={submitComment} className="bg-black text-white text-xs px-2 py-1 rounded">
              Add
            </button>
            <button onClick={() => setPendingPin(null)} className="text-xs px-2 py-1 text-zinc-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}