'use client';

import { useState } from 'react';

export type Filters = {
  search: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  bedrooms: string;
  sort: string;
};

export default function PropertyFilters({
  initial,
  onApply
}: {
  initial: Filters;
  onApply: (filters: Filters) => void;
}) {
  const [filters, setFilters] = useState(initial);
  const set = (key: keyof Filters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <input className="rounded-lg border px-3 py-2" placeholder="Search city, location..." value={filters.search} onChange={e => set('search', e.target.value)} />
        <input className="rounded-lg border px-3 py-2" placeholder="City" value={filters.city} onChange={e => set('city', e.target.value)} />
        <input className="rounded-lg border px-3 py-2" type="number" placeholder="Min budget" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} />
        <input className="rounded-lg border px-3 py-2" type="number" placeholder="Max budget" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
        <select className="rounded-lg border px-3 py-2" value={filters.propertyType} onChange={e => set('propertyType', e.target.value)}>
          <option value="">Any type</option>
          <option value="APARTMENT">Apartment</option>
          <option value="VILLA">Villa</option>
          <option value="HOUSE">House</option>
          <option value="PLOT">Plot</option>
          <option value="OFFICE">Office</option>
          <option value="SHOP">Shop</option>
        </select>
        <select className="rounded-lg border px-3 py-2" value={filters.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
          <option value="">Any bedrooms</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
        </select>
        <select className="rounded-lg border px-3 py-2" value={filters.sort} onChange={e => set('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <button
          onClick={() => onApply(filters)}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}
