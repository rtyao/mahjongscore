import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Mahjong Score',
};

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--color-cream-light)' }} className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-ink)' }}>About This Project</h1>

        <div className="flex flex-col gap-6 text-base leading-relaxed" style={{ color: 'var(--color-stone)' }}>
          <p>
            I grew up playing Mahjong — not the Hong Kong style most people know online, but the
            Taiwanese-derived style that&apos;s standard in the Filipino-Chinese community. Sixteen tiles.
            A completely different scoring system. House rules that vary from table to table.
          </p>

          <p>
            The problem: almost nothing about this style is documented clearly online. If you search
            for Mahjong rules, you get Hong Kong or Japanese Riichi. If you search for Filipino Mahjong,
            you get a different variant again. The style I grew up with — the one my grandma taught me —
            barely exists on the internet.
          </p>

          <p style={{ color: 'var(--color-ink)', fontStyle: 'italic' }}>
            So I built this.
          </p>

          <p>
            The rules on this site come from memory, family games, and conversations with my grandmother.
            The scoring methodology is the core of what makes this style distinctive — and it&apos;s
            what the calculator is built around.
          </p>

          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--color-jade-pale)', border: '1px solid var(--color-jade)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-jade)' }}>
              <strong>A note on accuracy:</strong> This style varies between households and communities.
              I&apos;m still learning what&apos;s standard vs. what&apos;s our house rules.
              If you play this style and something here looks wrong — please tell me.
              That&apos;s the whole point.
            </p>
          </div>

          <p>
            This site is open-source. If you want to contribute rules, corrections, or code,
            the GitHub repo is open. If you just want to flag something, the suggestion form works too.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="https://github.com/rtyao/mahjongscore"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl font-medium text-sm"
            style={{ background: 'var(--color-ink)', color: '#fff' }}
          >
            View on GitHub ↗
          </a>
          <Link
            href="/suggest"
            className="px-4 py-2.5 rounded-xl font-medium text-sm"
            style={{ background: 'var(--color-jade)', color: '#fff' }}
          >
            Suggest a Correction
          </Link>
          <Link
            href="/calculator"
            className="px-4 py-2.5 rounded-xl font-medium text-sm"
            style={{ background: 'var(--color-cream)', color: 'var(--color-ink)', border: '1px solid var(--color-cream-dark)' }}
          >
            Try the Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
