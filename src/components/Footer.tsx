import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-cream)', borderTop: '1px solid var(--color-cream-dark)', color: 'var(--color-stone)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: 'var(--color-jade)' }}>🀄</span>
              <span className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>Mahjong Score</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              Built to preserve the Filipino-Chinese Mahjong style — the 16-tile game played across the Philippines.
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--color-mist)' }}>
              Mahjong is both a regional and familial culture that varies from household to household.
              This site covers the Taiwanese/Filipino-Chinese style played in the Philippines,
              which differs from other Filipino and Hong Kong styles.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <Link href="/rules" className="hover:underline" style={{ color: 'var(--color-stone)' }}>Rules</Link>
            <Link href="/calculator" className="hover:underline" style={{ color: 'var(--color-stone)' }}>Calculator</Link>
            <Link href="/about" className="hover:underline" style={{ color: 'var(--color-stone)' }}>About</Link>
            <Link href="/suggest" className="hover:underline" style={{ color: 'var(--color-stone)' }}>Suggest a Correction</Link>
            <a
              href="https://github.com/rtyao/mahjongscore"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--color-stone)' }}
            >
              GitHub ↗
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 text-xs" style={{ borderTop: '1px solid var(--color-cream-dark)', color: 'var(--color-mist)' }}>
          Content is ongoing and verified with family — if something looks wrong,{' '}
          <Link href="/suggest" className="underline" style={{ color: 'var(--color-stone)' }}>
            please let us know
          </Link>.
        </div>
      </div>
    </footer>
  );
}
