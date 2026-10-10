import Link from 'next/link';
import { api } from '../lib/api';
import type { PropertyList } from '../types/property';
import PropertyCard from '../components/PropertyCard';

async function getFeaturedProperties() {
  try {
    const result = await api<PropertyList>('/properties?limit=6&sort=newest');
    return result.items;
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await getFeaturedProperties();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1c1917] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(15,118,110,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(217,119,6,0.15),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-32">
          <div className="max-w-3xl">
            <p className="mb-5 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-teal-300 backdrop-blur">
              ★ Trusted by 10,000+ buyers
            </p>
            <h1 className="font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-7xl">
              Find a place<br />
              you'll love to <em className="text-teal-400">call home</em>.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-stone-300">
              Handpicked apartments, villas and commercial spaces across India — with direct owner contact.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="rounded-full bg-teal-600 px-8 py-3.5 font-medium text-white transition hover:bg-teal-500"
              >
                Browse Properties
              </Link>
              <Link
                href="/properties/new"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-medium text-white backdrop-blur transition hover:bg-white/10"
              >
                List a Property
              </Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-10 border-t border-white/10 pt-8">
              <div>
                <p className="font-display text-3xl text-white">50K+</p>
                <p className="mt-1 text-sm text-stone-400">Active Listings</p>
              </div>
              <div>
                <p className="font-display text-3xl text-white">7</p>
                <p className="mt-1 text-sm text-stone-400">Cities</p>
              </div>
              <div>
                <p className="font-display text-3xl text-white">10K+</p>
                <p className="mt-1 text-sm text-stone-400">Happy Buyers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
              Curated for you
            </p>
            <h2 className="font-display mt-2 text-4xl">Featured Properties</h2>
          </div>
          <Link href="/properties" className="text-sm font-medium text-teal-700 hover:underline">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="py-8 text-center text-stone-500">No properties yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* ✅ ABOUT — NEW PROFESSIONAL LAYOUT */}
      <section className="relative overflow-hidden border-y border-stone-200 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            {/* LEFT — Content */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
                Our Story
              </p>
              <h2 className="font-display mt-3 text-4xl leading-tight md:text-5xl">
                Built for the way<br />
                India <em className="text-teal-700">finds home</em>.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-stone-600">
                HomeFind is a modern real estate platform connecting buyers, sellers, and
                renters across India. We make property discovery simple, transparent, and
                fast — with powerful search, verified listings, and direct owner contact.
              </p>

              {/* Feature list */}
              <div className="mt-10 space-y-5">
                {[
                  {
                    icon: '🔍',
                    title: 'Smart Search',
                    desc: 'Filter by city, price, type and bedrooms in milliseconds.'
                  },
                  {
                    icon: '✓',
                    title: 'Verified Listings',
                    desc: 'Every property is owner-verified before it goes live.'
                  },
                  {
                    icon: '⚡',
                    title: 'Direct Contact',
                    desc: 'Reach owners instantly — no middlemen, no delays.'
                  },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900">{f.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-stone-500">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Visual stat cards */}
            <div className="relative">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="card-shadow rounded-2xl bg-teal-50 p-7">
                  <p className="font-display text-5xl text-teal-800">50K+</p>
                  <p className="mt-2 text-sm font-medium text-teal-900/70">
                    Properties listed
                  </p>
                </div>
                <div className="card-shadow mt-0 rounded-2xl bg-amber-50 p-7 sm:mt-10">
                  <p className="font-display text-5xl text-amber-700">7</p>
                  <p className="mt-2 text-sm font-medium text-amber-900/70">
                    Cities covered
                  </p>
                </div>
                <div className="card-shadow rounded-2xl bg-stone-100 p-7 sm:-mt-10">
                  <p className="font-display text-5xl text-stone-800">10K+</p>
                  <p className="mt-2 text-sm font-medium text-stone-600">
                    Happy customers
                  </p>
                </div>
                <div className="card-shadow rounded-2xl bg-stone-900 p-7 text-white">
                  <p className="font-display text-5xl">99%</p>
                  <p className="mt-2 text-sm font-medium text-stone-400">
                    Response rate
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Our People
          </p>
          <h2 className="font-display mt-2 text-4xl">Meet the Team</h2>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {[
            { initial: 'A', name: 'Arjun Kumar', role: 'Founder & CEO' },
            { initial: 'P', name: 'Priya Sharma', role: 'Head of Operations' },
            { initial: 'R', name: 'Rahul Verma', role: 'Lead Engineer' },
          ].map(member => (
            <div
              key={member.name}
              className="card-shadow card-shadow-hover rounded-2xl bg-white p-8 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 font-display text-3xl text-teal-700">
                {member.initial}
              </div>
              <h3 className="font-display mt-5 text-xl">{member.name}</h3>
              <p className="mt-1 text-sm text-stone-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1c1917] py-16 text-stone-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <h3 className="font-display text-2xl text-white">HomeFind</h3>
              <p className="mt-3 text-sm leading-relaxed">
                Find your next home with confidence.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/properties" className="hover:text-teal-400">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-teal-400">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-teal-400">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white">
                Contact
              </h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>support@homefind.com</li>
                <li>+91 98765 43210</li>
                <li>Chennai, India</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-stone-800 pt-6 text-center text-sm">
            © {new Date().getFullYear()} HomeFind. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}