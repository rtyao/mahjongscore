import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Changelog — Mahjong Score',
  description: 'Version history and patch notes for Mahjong Score.',
};

interface Release {
  version: string;
  date: string;
  status: 'current' | 'past';
  summary: string;
  liked: string[];
  didntLike: string[];
  added: string[];
  missing: string[];
}

const RELEASES: Release[] = [
  {
    version: 'v0.1.0',
    date: 'May 2026',
    status: 'current',
    summary: 'First build. The bones are right, the scoring engine works, and the design direction is set. A lot of things still need polish.',
    liked: [
      'Color palette came out exactly right — jade, porcelain blue, cream',
      'Scoring engine is solid: formula, ping-oh detection, flat bonuses all work',
      'Breakdown table with tappable rule explanations is the right direction',
      'MahjongTile renders clearly at all sizes and for all suit types',
    ],
    didntLike: [
      'Hand builder is too manual — need a smarter tile pool approach',
      'Tile visuals are functional but not beautiful yet (want illustrated SVGs)',
      'Rules page is entirely placeholder — biggest content gap',
      'Mobile experience untested and likely needs tuning',
      'No way to share a hand result',
    ],
    added: [
      'Full scoring engine: points, tai multipliers, ping-oh, buan-oh, go-ki-si-pa',
      'Kang bonuses (revealed +100, hidden +200, TTS +400) tracked separately from formula',
      'Zi-mo (self-draw) detection and flat bonus',
      'Win-by-pair and kanchan (middle tile) bonuses',
      'Flower/season complete set bonus (+2 tai + flat 100)',
      'Calculator: tile picker by suit, group builder, winning tile marker',
      'Home page with hero tiles, stats, and feature cards',
      'Rules, About, Suggest pages (structure only)',
      'Responsive navbar and footer',
      'Disclaimer about regional and household rule variation',
    ],
    missing: [
      'Rules page content (all placeholder)',
      'Illustrated tile art',
      'Share-a-hand feature',
      'Auto-grouping from a tile pool',
      'Missing scoring rules: mixed flush, full flush, four-kang, full limit hand list',
      'Blessing of Heaven / Earth',
      'Special hand auto-detection (all-dragons, all-winds)',
      'GitHub Pages deployment',
      'Domain (mahjongscore.me)',
    ],
  },
];

function Badge({ children, color }: { children: React.ReactNode; color: 'jade' | 'stone' }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: color === 'jade' ? 'var(--color-jade-pale)' : 'var(--color-cream)',
        color: color === 'jade' ? 'var(--color-jade)' : 'var(--color-stone)',
        border: `1px solid ${color === 'jade' ? 'var(--color-jade)' : 'var(--color-cream-dark)'}`,
      }}
    >
      {children}
    </span>
  );
}

function Section({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-mist)' }}>
        {title}
      </h4>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span style={{ color: accent, flexShrink: 0 }}>—</span>
            <span style={{ color: 'var(--color-stone)' }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChangelogPage() {
  return (
    <div style={{ background: 'var(--color-cream-light)' }} className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Changelog</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-stone)' }}>
            Version history for Mahjong Score. Honest patch notes — what worked, what didn&apos;t,
            what&apos;s next. Full history also on{' '}
            <a
              href="https://github.com/rtyao/mahjongscore/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: 'var(--color-jade)' }}
            >
              GitHub
            </a>.
          </p>
        </div>

        {/* Releases */}
        <div className="flex flex-col gap-10">
          {RELEASES.map((release) => (
            <article key={release.version}>
              {/* Version header */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-ink)' }}>{release.version}</h2>
                <Badge color={release.status === 'current' ? 'jade' : 'stone'}>
                  {release.status === 'current' ? 'Current' : 'Past'}
                </Badge>
                <span className="text-sm" style={{ color: 'var(--color-mist)' }}>{release.date}</span>
              </div>

              {/* Summary */}
              <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--color-stone)' }}>
                {release.summary}
              </p>

              {/* What I liked / didn't like */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 p-4 rounded-xl" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
                <Section title="What I liked" items={release.liked} accent="var(--color-jade)" />
                <Section title="What I didn't like" items={release.didntLike} accent="var(--color-dragon-red)" />
              </div>

              {/* Added / Missing */}
              <div className="flex flex-col gap-5 p-4 rounded-xl" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
                <Section title="What's in this version" items={release.added} accent="var(--color-jade)" />
                <div style={{ borderTop: '1px solid var(--color-cream-dark)', paddingTop: '1.25rem' }}>
                  <Section title="Known gaps / coming next" items={release.missing} accent="var(--color-stone)" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--color-cream-dark)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--color-stone)' }}>
            Found something wrong? Want to contribute?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/suggest"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--color-jade)', color: '#fff' }}
            >
              Suggest a Correction
            </Link>
            <a
              href="https://github.com/rtyao/mahjongscore/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--color-cream)', color: 'var(--color-stone)', border: '1px solid var(--color-cream-dark)' }}
            >
              GitHub Issues ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
