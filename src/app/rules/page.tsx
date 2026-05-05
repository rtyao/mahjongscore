import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rules — Mahjong Score',
  description: 'Learn Filipino-Chinese Mahjong rules — from beginner basics to the scoring details unique to this style.',
};

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{ background: 'var(--color-cream-light)', border: '1.5px dashed var(--color-cream-dark)' }}
    >
      <h3 className="font-semibold mb-1" style={{ color: 'var(--color-stone)' }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--color-mist)' }}>{description}</p>
      <span
        className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: 'var(--color-cream)', color: 'var(--color-stone)' }}
      >
        In progress
      </span>
    </div>
  );
}

export default function RulesPage() {
  return (
    <div style={{ background: 'var(--color-cream-light)' }} className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Rules</h1>
          <p className="text-base" style={{ color: 'var(--color-stone)' }}>
            Start here if you&apos;re new to Mahjong, or jump to the Filipino-Chinese specifics.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['General Mahjong', 'Filipino-Chinese Style'].map((tab, i) => (
            <div
              key={tab}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: i === 0 ? 'var(--color-jade)' : 'var(--color-cream)',
                color: i === 0 ? '#fff' : 'var(--color-stone)',
                border: i === 0 ? 'none' : '1px solid var(--color-cream-dark)',
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* General Mahjong */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>General Mahjong</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-stone)' }}>
            New to Mahjong? Think of it like poker — but instead of cards, you draw and discard tiles,
            and you&apos;re building hand combinations. Everyone plays simultaneously.
          </p>

          <PlaceholderSection
            title="The Tiles"
            description="Characters (萬), Bamboo (條), Circles (餅), Winds, Dragons, Flowers & Seasons — all 42 unique tile types explained with visuals."
          />
          <PlaceholderSection
            title="The Three Combinations"
            description="Pong (3 of a kind), Chow (a run of 3 in the same suit), and Kang (4 of a kind) — the building blocks of every hand."
          />
          <PlaceholderSection
            title="How a Round Works"
            description="Dealing, drawing, discarding, stealing tiles, declaring Mahjong — the full flow of a round."
          />
          <PlaceholderSection
            title="Winning"
            description="How to win: 5 complete sets and a pair. What happens after someone wins."
          />
        </section>

        {/* Filipino-Chinese style */}
        <section>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Filipino-Chinese Style</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-stone)' }}>
            The Taiwanese-derived style played in Philippine Chinese communities.
            If you know Hong Kong Mahjong, this is what&apos;s different.
          </p>

          <PlaceholderSection
            title="16 Tiles — 5 Sets + a Pair"
            description="You start with 16 tiles and need 17 to win. Each hand has 5 sets plus one pair — compared to 13/14 in Hong Kong style."
          />
          <PlaceholderSection
            title="Scoring Overview"
            description="How points are calculated: pongs, kangs, terminals, honor tiles, the tai (multiplier) system, and the formula."
          />
          <PlaceholderSection
            title="Special Hands"
            description="Ping-oh (all-run hand), Buan-oh (limit hand at 600/1200), and the special hands that score automatically as limit hands."
          />
          <PlaceholderSection
            title="Flowers & Seasons"
            description="Bonus tiles that add points, your own flower/season adds a multiplier, and completing the full set is a kang bonus."
          />
          <PlaceholderSection
            title="Payment & Dealer Rules"
            description="How winnings are distributed, the dealer double rule, and loser-to-loser payments."
          />
        </section>

        {/* CTA */}
        <div
          className="mt-10 rounded-2xl p-6 text-center"
          style={{ background: 'var(--color-jade-pale)', border: '1px solid var(--color-jade)' }}
        >
          <p className="font-medium mb-1" style={{ color: 'var(--color-jade)' }}>Rules content is being added</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-stone)' }}>
            We&apos;re documenting this carefully — cross-referencing with family and memory.
            If you know a rule that&apos;s missing or wrong, please help.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/suggest"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--color-jade)', color: '#fff' }}
            >
              Suggest a Correction
            </Link>
            <Link
              href="/calculator"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#fff', color: 'var(--color-jade)', border: '1px solid var(--color-jade)' }}
            >
              Try the Calculator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
