import Link from 'next/link';
import MahjongTile from '@/components/MahjongTile';
import { DRAGON_TILES, WIND_TILES, CHARACTER_TILES, BAMBOO_TILES } from '@/lib/tiles';

const HERO_TILES = [
  CHARACTER_TILES[0],  // 1 wan
  CHARACTER_TILES[4],  // 5 wan
  CHARACTER_TILES[8],  // 9 wan
  BAMBOO_TILES[1],     // 2 bamboo (jade)
  BAMBOO_TILES[5],     // 6 bamboo (jade)
  DRAGON_TILES[0],     // red dragon
  DRAGON_TILES[1],     // green dragon
  WIND_TILES[0],       // east
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: 'var(--color-cream-light)' }} className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Decorative tile row */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {HERO_TILES.map((tile) => (
              <MahjongTile key={tile.id} tile={tile} size="sm" />
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--color-ink)' }}>
            Mahjong Score
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-3" style={{ color: 'var(--color-jade)' }}>
            Filipino-Chinese Mahjong
          </p>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--color-stone)' }}>
            Rules, scoring guide, and hand calculator for the 16-tile Taiwanese-style game
            played across the Philippines — and a lot of family dining tables.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/calculator"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-jade)', color: '#fff' }}
            >
              🀄 Calculate a Hand
            </Link>
            <Link
              href="/rules"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-colors"
              style={{ background: 'var(--color-cream)', color: 'var(--color-ink)', border: '1.5px solid var(--color-cream-dark)' }}
            >
              📖 Learn the Rules
            </Link>
          </div>
        </div>
      </section>

      {/* What makes this style different */}
      <section style={{ background: '#fff' }} className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-ink)' }}>
            What is Filipino-Chinese Mahjong?
          </h2>
          <div className="prose max-w-none" style={{ color: 'var(--color-stone)' }}>
            <p className="text-base leading-relaxed mb-4">
              Filipino-Chinese Mahjong (closely related to Taiwanese-style Mahjong) is the dominant style
              played in Philippine Chinese communities. It differs from the more widely known Hong Kong
              style in a few key ways - most notably, you start with{' '}
              <strong style={{ color: 'var(--color-ink)' }}>16 tiles</strong> instead of 13,
              and need 17 to win: 5 sets and a pair.
            </p>
            <p className="text-base leading-relaxed mb-4">
              The scoring system is also quite different. Points come from the types of sets you make -
              pongs (pung), kangs (kong), and even flowers and seasons - and are multiplied by{' '}
              <strong style={{ color: 'var(--color-ink)' }}>tai</strong> (doublers) earned from
              honor tiles and your seat wind.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-mist)' }}>
              [More detail coming - this style has a rich history and we&apos;re still documenting it properly.]
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Starting tiles', value: '16' },
              { label: 'Tiles to win', value: '17' },
              { label: 'Unique tiles', value: '42' },
              { label: 'Sets per hand', value: '5 + pair' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-4 text-center"
                style={{ background: 'var(--color-cream-light)', border: '1px solid var(--color-cream-dark)' }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-jade)' }}>{value}</div>
                <div className="text-xs" style={{ color: 'var(--color-stone)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ background: 'var(--color-cream-light)' }} className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon="📖"
              title="Rules Guide"
              description="From beginner basics to the scoring details unique to this style. Built so a 10-year-old — or a curious Hong Kong player — can follow along."
              href="/rules"
              label="Read the Rules"
            />
            <FeatureCard
              icon="🀄"
              title="Score Calculator"
              description="Enter your winning hand tile by tile. The calculator validates the hand, detects special cases like ping-oh, and shows the full score breakdown."
              href="/calculator"
              label="Try the Calculator"
              highlight
            />
            <FeatureCard
              icon="💚"
              title="About This Project"
              description="This style is dying out. This site is an attempt to document and share it — with help from family, memory, and hopefully you."
              href="/about"
              label="Read More"
            />
          </div>
        </div>
      </section>

      {/* Notice */}
      <section style={{ background: 'var(--color-jade-pale)', borderTop: '1px solid var(--color-cream-dark)' }} className="py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-jade)' }}>
            <strong>A note:</strong> Mahjong is both a regional and familial culture that varies from household to household.
            This site covers the Taiwanese/Filipino-Chinese style played in the Philippines — different from other Filipino
            and Hong Kong styles. Take any rule with a grain of salt and{' '}
            <Link href="/suggest" className="underline font-medium">let us know if something&apos;s off</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon, title, description, href, label, highlight = false,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col"
      style={{
        background: highlight ? 'var(--color-jade)' : '#fff',
        border: highlight ? 'none' : '1px solid var(--color-cream-dark)',
        color: highlight ? '#fff' : 'var(--color-ink)',
      }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: highlight ? 'rgba(255,255,255,0.85)' : 'var(--color-stone)' }}>
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex items-center text-sm font-semibold gap-1 transition-opacity hover:opacity-80"
        style={{ color: highlight ? '#fff' : 'var(--color-jade)' }}
      >
        {label} →
      </Link>
    </div>
  );
}
