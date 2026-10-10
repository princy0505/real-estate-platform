import Link from 'next/link';
import type { Property } from '../types/property';

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="h-48 overflow-hidden bg-slate-200">
        {property.images[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No image</div>
        )}
      </div>
      <div className="p-5">
        <p className="mb-1 text-sm text-blue-600">{property.propertyType}</p>
        <h3 className="line-clamp-1 text-lg font-semibold">{property.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{property.location}, {property.city}</p>
        <p className="mt-3 text-xl font-bold">₹{Number(property.price).toLocaleString('en-IN')}</p>
        <div className="mt-3 flex gap-4 text-sm text-slate-600">
          <span>{property.bedrooms ?? '-'} Beds</span>
          <span>{property.bathrooms ?? '-'} Baths</span>
          <span>{property.areaSqft} sqft</span>
        </div>
      </div>
    </Link>
  );
}
