import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import type { Property } from '../../../types/property';
import PropertyCard from '../../../components/PropertyCard';

export const revalidate = 60;
async function getProperty(id: string) {
  try {
    return await api<Property>(`/properties/${id}`);
  } catch {
    return null;
  }
}

function PropertyJsonLd({ property }: { property: Property }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      streetAddress: property.location,
    },
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: 'Property not found' };

  return {
    title: `${property.title} | HomeFind`,
    description: `${property.propertyType} in ${property.location}, ${property.city}. ${property.bedrooms ?? '-'} bedrooms, ${property.areaSqft} sqft.`
  };
}

export default async function PropertyDetails({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const similar = await api<Property[]>(`/properties/${id}/similar`).catch(() => []);

  return (
    <>
      <PropertyJsonLd property={property} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link href="/properties" className="text-sm text-blue-600">← Back to properties</Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-slate-200">
            {property.images[0] ? (
              <img src={property.images[0]} alt={property.title} className="h-[420px] w-full object-cover" />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-slate-400">No image</div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-600">{property.propertyType}</p>
            <h1 className="mt-2 text-4xl font-bold">{property.title}</h1>
            <p className="mt-2 text-slate-500">{property.location}, {property.city}</p>
            <p className="mt-6 text-3xl font-bold">₹{Number(property.price).toLocaleString('en-IN')}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white p-4 text-center shadow-sm"><b>{property.bedrooms ?? '-'}</b><span className="block text-xs text-slate-500">Bedrooms</span></div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm"><b>{property.bathrooms ?? '-'}</b><span className="block text-xs text-slate-500">Bathrooms</span></div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm"><b>{property.areaSqft}</b><span className="block text-xs text-slate-500">Sqft</span></div>
            </div>

            <p className="mt-8 leading-7 text-slate-600">{property.description}</p>

            <div className="mt-8 rounded-2xl border bg-white p-5">
              <p className="text-sm text-slate-500">Listed by</p>
              <p className="mt-1 font-semibold">{property.ownerName}</p>
              <Link href="/login" className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white">
                Contact Owner
              </Link>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold">Similar Properties</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map(item => <PropertyCard key={item.id} property={item} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
