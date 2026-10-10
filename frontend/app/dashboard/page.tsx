'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import type { Property, PropertyList } from '../../types/property';

export default function DashboardPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const [form, setForm] = useState({
    title: '', description: '', city: '', location: '',
    propertyType: 'APARTMENT', price: '', bedrooms: '2',
    bathrooms: '2', areaSqft: '1000', image: ''
  });

  // Load my listings
  useEffect(() => {
    async function loadMyListings() {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('accessToken');

        if (!token || !userId) {
          router.push('/login');
          return;
        }

        const result = await api<PropertyList>(`/properties?ownerId=${userId}&limit=50`);
        setMyListings(result.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingListings(false);
      }
    }
    loadMyListings();
  }, [router]);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  async function deleteProperty(id: string) {
    if (!confirm('Delete this listing?')) return;
    try {
      await api(`/properties/${id}`, { method: 'DELETE', auth: true });
      setMyListings(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* PAGE HEADER */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Your Dashboard
          </p>
          <h1 className="font-display mt-2 text-4xl text-stone-900">
            Manage your listings
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            View, edit and create properties under your account.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* MY LISTINGS */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl text-stone-900">My Listings</h2>
            {!loadingListings && myListings.length > 0 && (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
                {myListings.length} properties
              </span>
            )}
          </div>

          {loadingListings ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5">
                  <div className="h-4 w-2/3 rounded bg-stone-200" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-stone-200" />
                </div>
              ))}
            </div>
          ) : myListings.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-2xl">
                🏠
              </div>
              <p className="font-display mt-5 text-xl text-stone-800">No listings yet</p>
              <p className="mt-2 text-sm text-stone-500">
                Create your first property below.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myListings.map(p => (
                <div
                  key={p.id}
                  className="card-shadow card-shadow-hover flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5"
                >
                  {/* ✅ CLICKABLE AREA — Click to view detail */}
                  <Link
                    href={`/properties/${p.id}`}
                    className="flex flex-1 items-center gap-4 rounded-xl transition hover:bg-stone-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-lg">
                      🏢
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{p.title}</p>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {p.city} · ₹{Number(p.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2">
                    <Link
                      href={`/properties/${p.id}/edit`}
                      className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteProperty(p.id)}
                      className="rounded-full bg-red-50 px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CREATE FORM */}
        <section>
          <div className="mb-6">
            <h2 className="font-display text-2xl text-stone-900">Create New Listing</h2>
            <p className="mt-1 text-sm text-stone-500">
              Fill in the details below to publish your property.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="card-shadow space-y-8 rounded-3xl border border-stone-200 bg-white p-8"
          >
            {/* Section: Basic Info */}
            <div>
              <h3 className="font-display text-lg text-stone-800">Basic Information</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Property title"
                  className="field"
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                />
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
              <textarea
                required
                placeholder="Describe the property..."
                className="field mt-4 min-h-32"
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
            </div>

            {/* Section: Location */}
            <div className="border-t border-stone-200 pt-8">
              <h3 className="font-display text-lg text-stone-800">Location</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="City"
                  className="field"
                  value={form.city}
                  onChange={e => update('city', e.target.value)}
                />
                <input
                  required
                  type="text"
                  placeholder="Area / Locality"
                  className="field"
                  value={form.location}
                  onChange={e => update('location', e.target.value)}
                />
              </div>
            </div>

            {/* Section: Details */}
            <div className="border-t border-stone-200 pt-8">
              <h3 className="font-display text-lg text-stone-800">Property Details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-4">
                <input
                  required
                  type="number"
                  placeholder="Price (₹)"
                  className="field"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                />
                <input
                  required
                  type="number"
                  placeholder="Bedrooms"
                  className="field"
                  value={form.bedrooms}
                  onChange={e => update('bedrooms', e.target.value)}
                />
                <input
                  required
                  type="number"
                  placeholder="Bathrooms"
                  className="field"
                  value={form.bathrooms}
                  onChange={e => update('bathrooms', e.target.value)}
                />
                <input
                  required
                  type="number"
                  placeholder="Area (sqft)"
                  className="field"
                  value={form.areaSqft}
                  onChange={e => update('areaSqft', e.target.value)}
                />
              </div>
            </div>

            {/* Section: Image */}
            <div className="border-t border-stone-200 pt-8">
              <h3 className="font-display text-lg text-stone-800">Image</h3>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="field mt-4"
                value={form.image}
                onChange={e => update('image', e.target.value)}
              />
            </div>

            {/* Submit */}
            {message && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {message}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-stone-200 pt-6">
              <p className="text-sm text-stone-500">
                All fields are required except image.
              </p>
              <button
                type="submit"
                className="rounded-full bg-teal-700 px-8 py-3 font-medium text-white transition hover:bg-teal-600"
              >
                Publish Listing
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}