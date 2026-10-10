'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  function handleLogout() {
    logout();
    setIsLoggedIn(false);
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#faf8f5]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* LOGO — new style */}
        <Link href="/" className="group flex items-baseline gap-1">
          <span className="font-display text-2xl font-medium tracking-tight text-stone-900">
            Home
          </span>
          <span className="font-display text-2xl font-medium tracking-tight text-teal-700">
            Find
          </span>
          <span className="mb-1 ml-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 transition group-hover:scale-125" />
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/properties"
            className="rounded-full px-4 py-2 text-stone-700 transition hover:bg-stone-200/50"
          >
            Properties
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full px-4 py-2 text-stone-700 transition hover:bg-stone-200/50"
          >
            Dashboard
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="ml-2 rounded-full bg-stone-900 px-5 py-2 font-medium text-white transition hover:bg-stone-800"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-full bg-teal-700 px-5 py-2 font-medium text-white transition hover:bg-teal-600"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}