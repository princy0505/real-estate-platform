'use client';

import { useEffect, useState } from 'react';
import PropertyCard from '../../components/PropertyCard';
import PropertyFilters, { Filters } from '../../components/PropertyFilters';
import { api } from '../../lib/api';
import type { PropertyList } from '../../types/property';

const initial: Filters = {
  search: '', city: '', minPrice: '', maxPrice: '',
  propertyType: '', bedrooms: '', sort: 'newest'
};

function buildQuery(filters: Filters, cursor?: string) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (cursor) params.set('cursor', cursor);
  return `?${params.toString()}`;
}

export default function PropertiesPage() {
  const [filters, setFilters] = useState(initial);
  const [data, setData] = useState<PropertyList>({ items: [], nextCursor: null });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  async function load(nextCursor?: string, append = false) {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');

    try {
      const result = await api<PropertyList>(`/properties${buildQuery(filters, nextCursor)}`);
      setData(prev => append
        ? { items: [...prev.items, ...result.items], nextCursor: result.nextCursor }
        : result
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load properties');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* PAGE HEADER — Simple heading, no dark hero */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <h1 className="font-display text-3xl text-stone-900 md:text-4xl">
            All Properties
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Browse verified listings across India
          </p>
        </div>
      </section>

   
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="card-shadow rounded-2xl border border-stone-200 bg-white p-6">
          <PropertyFilters
            initial={filters}
            onApply={f => { setFilters(f); setTimeout(() => load(), 0); }}
          />
        </div>
      </section>

  
      <section className="mx-auto max-w-6xl px-4 pb-16">
    
        {!loading && !error && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-800">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                {data.items.length === 0
                  ? 'No properties'
                  : `${data.items.length}${data.nextCursor ? '+' : ''} properties`}
              </span>
              {filters.city && (
                <span className="text-sm text-stone-500">
                  in <span className="font-medium text-stone-700">{filters.city}</span>
                </span>
              )}
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-widest text-stone-400">
                Sort
              </span>
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price ↑' },
                { value: 'price_desc', label: 'Price ↓' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const next = { ...filters, sort: opt.value as Filters['sort'] };
                    setFilters(next);
                    setTimeout(() => load(), 0);
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    filters.sort === opt.value
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

      
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-10 text-center">
            <div className="text-4xl">⚠️</div>
            <p className="mt-4 font-display text-2xl text-red-800">Something went wrong</p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={() => load()}
              className="mt-6 rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

    
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <div className="h-52 bg-stone-200" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-2/3 rounded bg-stone-200" />
                  <div className="h-3 w-1/2 rounded bg-stone-200" />
                  <div className="h-6 w-1/3 rounded bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        
        {!loading && !error && data.items.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white py-24 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-3xl">
              🏠
            </div>
            <h3 className="font-display mt-6 text-3xl">No properties found</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
              We couldn't find any listings matching your filters. Try adjusting your search or clear all filters.
            </p>
            <button
              onClick={() => { setFilters(initial); setTimeout(() => load(), 0); }}
              className="mt-8 rounded-full bg-teal-700 px-7 py-3 text-sm font-medium text-white transition hover:bg-teal-600"
            >
              Clear all filters
            </button>
          </div>
        )}

     
        {!loading && !error && data.items.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

          
            {data.nextCursor && (
              <div className="mt-14 flex justify-center">
                <button
                  onClick={() => load(data.nextCursor!, true)}
                  disabled={loadingMore}
                  className="group rounded-full bg-stone-900 px-8 py-3.5 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Load more
                      <span className="transition group-hover:translate-x-1">→</span>
                    </span>
                  )}
                </button>
              </div>
            )}

            {!data.nextCursor && data.items.length > 12 && (
              <div className="mt-14 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-stone-300" />
                <span className="text-sm text-stone-400">You've reached the end</span>
                <span className="h-px w-12 bg-stone-300" />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}