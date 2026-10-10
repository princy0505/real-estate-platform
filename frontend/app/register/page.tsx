'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

type AuthResponse = {
  user: { id: string; name: string; email: string };
  accessToken: string;
  refreshToken: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      saveAuth(data);
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border bg-white p-7 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Create account</h1>
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Full name" className="field" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
          <input required type="email" placeholder="Email" className="field" value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
          <input required minLength={8} type="password" placeholder="Password (8+ characters)" className="field" value={form.password} onChange={e => setForm({...form,password:e.target.value})} />
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white">
            {loading ? 'Creating...' : 'Create account'}
          </button>
          <p className="text-center text-sm text-slate-500">Already registered? <Link href="/login" className="text-blue-600">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
