'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DESIGNER');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!res.ok) {
      setError('Registration failed — email may already be in use.');
      return;
    }

    router.push('/login');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Register</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 w-full" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="border p-2 w-full" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="border p-2 w-full" required />

      <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 w-full">
        <option value="DESIGNER">Designer</option>
        <option value="CLIENT">Client</option>
      </select>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" className="bg-black text-white p-2 w-full rounded">Register</button>
    </form>
  );
}