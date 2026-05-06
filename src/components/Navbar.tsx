'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/rules', label: 'Rules' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/about', label: 'About' },
  { href: '/suggest', label: 'Suggest' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header style={{ background: 'var(--color-cream-light)', borderBottom: '1px solid var(--color-cream-dark)' }}>
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-base tracking-tight"
          style={{ color: 'var(--color-ink)' }}
          onClick={() => setOpen(false)}
        >
          <span style={{ color: 'var(--color-jade)', fontSize: '1.25rem' }}>🀄</span>
          <span>Mahjong Score</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: active ? 'var(--color-jade)' : 'var(--color-stone)',
                    background: active ? 'var(--color-jade-pale)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Calculator CTA (desktop) */}
        <Link
          href="/calculator"
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--color-jade)', color: '#fff' }}
        >
          Calculate Hand
        </Link>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md"
          style={{ color: 'var(--color-stone)' }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            ) : (
              <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }} className="md:hidden">
          <ul className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="block px-3 py-2 rounded-md text-sm font-medium"
                    style={{
                      color: active ? 'var(--color-jade)' : 'var(--color-stone)',
                      background: active ? 'var(--color-jade-pale)' : 'transparent',
                    }}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="/calculator"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-center"
                style={{ background: 'var(--color-jade)', color: '#fff' }}
                onClick={() => setOpen(false)}
              >
                Calculate Hand
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
