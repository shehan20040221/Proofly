'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Notification {
  id: string;
  projectId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const res = await apiFetch('/api/notifications');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
    }
  }

  async function markRead(id: string) {
    const res = await apiFetch(`/api/notifications/${id}`, {
      method: 'PATCH',
    });

    if (res.ok) {
      const updated = await res.json();
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded hover:bg-zinc-100"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-30 max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="p-4 text-sm text-zinc-500">No notifications yet.</p>
          )}

          {notifications.map((n) => (
            <Link
              key={n.id}
              href={`/projects/${n.projectId}`}
              onClick={() => !n.read && markRead(n.id)}
              className={`block p-3 border-b text-sm hover:bg-zinc-50 ${
                n.read ? 'text-zinc-500' : 'font-medium'
              }`}
            >
              {n.message}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}