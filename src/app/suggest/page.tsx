import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suggest a Correction — Mahjong Score',
};

export default function SuggestPage() {
  return (
    <div style={{ background: 'var(--color-cream-light)' }} className="min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>
          Suggest a Correction
        </h1>
        <p className="text-base mb-8 leading-relaxed" style={{ color: 'var(--color-stone)' }}>
          If something&apos;s wrong, missing, or your grandma disagrees with anything on this site —
          please let us know.
        </p>

        <form
          action="https://formspree.io/f/placeholder"
          method="POST"
          className="flex flex-col gap-5"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink)' }}>
              Name <span style={{ color: 'var(--color-mist)' }}>(optional)</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{
                background: '#fff',
                border: '1.5px solid var(--color-cream-dark)',
                color: 'var(--color-ink)',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink)' }}>
              Email <span style={{ color: 'var(--color-mist)' }}>(optional — if you want a reply)</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
              style={{
                background: '#fff',
                border: '1.5px solid var(--color-cream-dark)',
                color: 'var(--color-ink)',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-ink)' }}>
              Your suggestion or correction <span style={{ color: '#C53030' }}>*</span>
            </label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="What's wrong, missing, or different from how you play?"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 resize-y"
              style={{
                background: '#fff',
                border: '1.5px solid var(--color-cream-dark)',
                color: 'var(--color-ink)',
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-jade)', color: '#fff' }}
          >
            Send Suggestion
          </button>
        </form>

        <div
          className="mt-8 rounded-xl p-4 text-sm"
          style={{ background: 'var(--color-cream)', border: '1px solid var(--color-cream-dark)', color: 'var(--color-stone)' }}
        >
          <p className="font-medium mb-1" style={{ color: 'var(--color-ink)' }}>More technical? Use GitHub Issues.</p>
          <p className="mb-3">
            If you&apos;re comfortable with GitHub, you can open an issue directly on the repo —
            useful for detailed rule discussions, corrections with references, or if you want to contribute code.
          </p>
          <a
            href="https://github.com/rtyao/mahjongscore/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium underline"
            style={{ color: 'var(--color-jade)' }}
          >
            Open a GitHub Issue ↗
          </a>
        </div>
      </div>
    </div>
  );
}
