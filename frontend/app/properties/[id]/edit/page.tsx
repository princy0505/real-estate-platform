'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import type { Property } from '../../../../types/property';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    location: '',
    propertyType: 'APARTMENT',
    price: '',
    bedrooms: '',
    bathrooms: '',
    areaSqft: '',
    image: ''
  });

  // Load existing property
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const p = await api<Property>(`/properties/${params.id}`);
        setForm({
          title: p.title,
          description: p.description,
          city: p.city,
          location: p.location,
          propertyType: p.propertyType,
          price: String(p.price),
          bedrooms: String(p.bedrooms ?? ''),
          bathrooms: String(p.bathrooms ?? ''),
          areaSqft: String(p.areaSqft),
          image: p.images[0] ?? ''
        });
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Property not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const update = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api(`/properties/${params.id}`, {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          city: form.city,
          location: form.location,
          propertyType: form.propertyType,
          price: Number(form.price),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          areaSqft: Number(form.areaSqft),
          images: form.image ? [form.image] : []
        })
      });
      router.push(`/properties/${params.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-slate-500">Loading property...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/dashboard"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold">Edit Property</h1>
      <p className="mt-1 text-slate-500">Update your property details.</p>

      <form
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
      >
        {[
          ['title', 'Title'],
          ['city', 'City'],
          ['location', 'Location'],
          ['price', 'Price'],
          ['areaSqft', 'Area in sqft'],
          ['image', 'Image URL']
        ].map(([key, label]) => (
          <input
            key={key}
            required={key !== 'image'}
            type={['price', 'areaSqft'].includes(key) ? 'number' : 'text'}
            placeholder={label}
            className="field"
            value={(form as any)[key]}
            onChange={e => update(key, e.target.value)}
          />
        ))}

        <textarea
          required
          placeholder="Description"
          className="field min-h-32"
          value={form.description}
          onChange={e => update('description', e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <select
            className="field"
            value={form.propertyType}
            onChange={e => update('propertyType', e.target.value)}
          >
            <option>APARTMENT</option>
            <option>VILLA</option>
            <option>HOUSE</option>
            <option>PLOT</option>
            <option>OFFICE</option>
            <option>SHOP</option>
          </select>

          <input
            className="field"
            type="number"
            placeholder="Bedrooms"
            value={form.bedrooms}
            onChange={e => update('bedrooms', e.target.value)}
          />

          <input
            className="field"
            type="number"
            placeholder="Bathrooms"
            value={form.bathrooms}
            onChange={e => update('bathrooms', e.target.value)}
          />
        </div>

        {message && (
          <p className="rounded-lg bg-red-50 p-3 text-red-700">{message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Update Property'}
          </button>

          <Link
            href={`/properties/${params.id}`}
            className="rounded-lg border px-6 py-3 font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}