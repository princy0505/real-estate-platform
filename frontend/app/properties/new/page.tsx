'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function NewPropertyPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    location: '',
    propertyType: 'APARTMENT',
    price: '',
    bedrooms: '2',
    bathrooms: '2',
    areaSqft: '1000',
    image: ''
  });

  const update = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const property = await api<{ id: string }>('/properties', {
        method: 'POST',
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
      router.push(`/properties/${property.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to create listing');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* HEADER */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link
            href="/properties"
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            ← Back to properties
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-teal-700">
            New Listing
          </p>
          <h1 className="font-display mt-2 text-4xl text-stone-900">
            List your property
          </h1>
          <p className="mt-2 max-w-xl text-sm text-stone-500">
            Fill in the details below. Your listing will be published instantly and visible to all buyers.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <form
          onSubmit={submit}
          className="card-shadow space-y-10 rounded-3xl border border-stone-200 bg-white p-8"
        >
          {/* Section: Basic Info */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                1
              </div>
              <h3 className="font-display text-lg text-stone-800">Basic Information</h3>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Property Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Spacious 2BHK with sea view"
                  className="field"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Property Type
                </label>
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
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Area (sqft)
                </label>
                <input
                  required
                  type="number"
                  placeholder="1000"
                  className="field"
                  value={form.areaSqft}
                  onChange={e => update('areaSqft', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Description
                </label>
                <textarea
                  required
                  placeholder="Describe the property, amenities, nearby landmarks..."
                  className="field min-h-32"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="border-t border-stone-200 pt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                2
              </div>
              <h3 className="font-display text-lg text-stone-800">Location</h3>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  City
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mumbai"
                  className="field"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Area / Locality
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Bandra West"
                  className="field"
                  value={form.location}
                  onChange={e => update('location', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: Details */}
          <div className="border-t border-stone-200 pt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                3
              </div>
              <h3 className="font-display text-lg text-stone-800">Property Details</h3>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Price (₹)
                </label>
                <input
                  required
                  type="number"
                  placeholder="5000000"
                  className="field"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Bedrooms
                </label>
                <input
                  required
                  type="number"
                  placeholder="2"
                  className="field"
                  value={form.bedrooms}
                  onChange={e => update('bedrooms', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                  Bathrooms
                </label>
                <input
                  required
                  type="number"
                  placeholder="2"
                  className="field"
                  value={form.bathrooms}
                  onChange={e => update('bathrooms', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section: Image */}
          <div className="border-t border-stone-200 pt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                4
              </div>
              <h3 className="font-display text-lg text-stone-800">Cover Image</h3>
            </div>
            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-stone-500">
                Image URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="field"
                value={form.image}
                onChange={e => update('image', e.target.value)}
              />
              <p className="mt-2 text-xs text-stone-400">
                Paste a direct image URL. Leave empty to use placeholder.
              </p>
            </div>
          </div>

          {/* Error */}
          {message && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
            <p className="text-sm text-stone-500">
              Your listing will go live immediately after publishing.
            </p>
            <div className="flex gap-3">
              <Link
                href="/properties"
                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-teal-700 px-8 py-3 text-sm font-medium text-white transition hover:bg-teal-600 disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}