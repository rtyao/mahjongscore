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
    version: 'v0.3.0',
    date: 'September 2026',
    status: 'current',
    summary: 'Hong Kong style added. The Filipino-Chinese style is why this site exists, but Hong Kong is the version most people mean when they say "mahjong" — so the calculator now scores both.',
    liked: [
      'Two separate engines is far clearer than one engine full of mode flags',
      'Seven Pairs and Thirteen Orphans are read straight from your tiles, sidestepping the broken manual-grouping UI',
      'Keeping situational fan out of the calculator kept the win-conditions step short',
      'Regression tests grew from 14 to 59, covering both styles',
    ],
    didntLike: [
      'The rules page is getting long — jump links help, but it may want real tabs',
      'Manual kang grouping is still broken, now in two styles instead of one',
      'Still not deployed',
    ],
    added: [
      'Hong Kong fan engine: hand shape, suit, terminals/honours, dragons, winds, flowers, win actions',
      'Fan → points table (0 fan = 1 point through 13+ fan = 384)',
      'Discarder-pays-all payment: self-pick means all three pay, a discard means the discarder alone pays double',
      'Replacement rules: stronger hands replace the weaker one in their family instead of stacking',
      'Seven Pairs, Thirteen Orphans and Nine Gates recognised from tiles alone — no grouping needed',
      'Table minimum fan setting (none / 1 / 3) with a warning when a hand falls below it',
      'Style switcher at the top of the calculator; tile counter adapts to 17 or 14',
      'Hong Kong setup shows round wind and table minimum, and hides the dealer box — HK has no dealer bonus',
      'Full Hong Kong section on the Rules page and in RULES.md, with jump links',
      'Scoring split into separate Taiwanese and Hong Kong engines',
    ],
    missing: [
      'Deployment — the last thing between this and people actually using it',
      'Rules page tabs instead of one long scroll',
      'Kang grouping UI bug (carried from v0.2.1)',
      'Auto-detect for non-winning hands (carried from v0.2.1)',
      'All honors hand, Filipino-Chinese — still no family consensus',
    ],
  },
  {
    version: 'v0.2.2',
    date: 'June 2026',
    status: 'past',
    summary: 'Clarification patch. Got to talk with family — grandma and relatives filled in a lot of gaps. Real rules are now published, and the scoring engine was corrected to match.',
    liked: [
      'Family knowledge filled in gaps that no online documentation covers',
      'RULES.md solves GitHub readability — anyone can read and edit rules without knowing React',
      'Flower/season tai bug was significant and quietly wrong since v0.1.0 — good catch',
      'Limit hands (small winds, big winds, big three dragons) now fully implemented',
    ],
    didntLike: [
      'Still no consensus on all-honors hand (all winds + all dragons)',
      'Blessing of Heaven/Earth still unconfirmed for this style',
      'Rules page is functional but not visually polished yet',
      'Site still not deployed publicly',
    ],
    added: [
      'Rules page: full content replacing all placeholders — tiles, sets, formula, tai, limit hands, protective rules',
      'RULES.md: human-readable rules document on GitHub',
      'Scoring fix: flower/season complete set corrected from +2 tai to +1 tai',
      'Scoring: half flush = +1 tai',
      'Scoring: all pong hand = +1 base point',
      'Limit hands: full flush, all terminals, small winds, big winds, big three dragons',
      'Limit hands: four kangs, all flowers + all seasons, 4 tai',
      'Protective rules documented: 3-kang and 3-tai restrictions',
    ],
    missing: [
      'All honors hand (all winds + all dragons) — no consensus yet',
      'Blessing of Heaven / Earth — unconfirmed for this style',
      'Rules page visual polish',
      'Deployment (GitHub Pages or Vercel)',
      'Kang grouping UI bug (carried from v0.2.1)',
      'Auto-detect for 16-tile non-winning hands (carried from v0.2.1)',
    ],
  },
  {
    version: 'v0.2.1',
    date: 'May 2026',
    status: 'past',
    summary: 'Logic fixes and step reorder. Learned that having a bird\'s eye view means missing small details — this patch was about finding and fixing those.',
    liked: [
      'Steps reordered: tiles first, then sets, then setup — much more logical flow',
      'Seat wind buttons now show Chinese characters (東南西北)',
      'Score panel shows both values regardless of dealer role',
      'Kang hands (17+n tiles) now resolve correctly in auto-detect',
      'Greedy chow detection bug fixed — overlapping runs like 1/2/3 + 2/3/4 + 3/4/5 now work',
    ],
    didntLike: [
      'Manual kang grouping still broken — creates empty group with no way to add tiles',
      'Auto-detect still fails on 16-tile non-winning hands',
      'Limit hands still not implemented at this point',
    ],
    added: [
      'Step reorder: tile picker (step 1) → build sets (step 2) → setup + win (steps 3–4)',
      'Seat wind selector: Chinese characters above English label',
      'Dealer changed from two-button toggle to a checkbox',
      'Score panel always shows both score values regardless of role',
      '0-point pairs no longer shown in score breakdown',
      'Winning tile now required before calculating a winning hand',
      'Blocked logic contradiction: concealed set + win by discard now mutually exclusive',
      'Kang detection: hands with n kangs (17+n tiles) now auto-detect correctly',
      'Fixed greedy chow bug: pong-first algorithm reordered to chow-first',
    ],
    missing: [
      'Manual kang grouping UI',
      'Limit hands (big/small winds, all dragons, etc.)',
      'Auto-detect for 16-tile non-winning hands',
    ],
  },
  {
    version: 'v0.2.0',
    date: 'May 2026',
    status: 'past',
    summary: 'Calculator UX overhaul. Auto-detect sets, floating hand tray, and a much cleaner flow. The hand builder went from "too manual" to actually usable.',
    liked: [
      'Auto-detect dramatically reduces friction — hand setup went from 6+ manual steps to 3',
      'Floating tray solves the "what\'s in my hand" problem cleanly',
      'Scoring engine held up with no regressions after the refactor',
      'Removing chows from the breakdown makes scores much easier to read',
      'Bottom tray and Clear Hand are very useful',
      'By Suit / All toggle finally works — All is now the default',
    ],
    didntLike: [
      'Manual kang grouping still broken — empty group, no way to add tiles',
      'Tray tiles were cut off on the top edge',
      'Auto-detect chow edge case: greedy pong-first algorithm failed on overlapping runs',
      'Calculator could not accept kangs in tile count',
      '0-point pairs still showing in breakdown',
    ],
    added: [
      'Floating hand tray at bottom of screen with live x/17 tile counter',
      'Remove tile directly from tray with red × button',
      'Flowers and seasons moved into step 2 tile picker',
      '"By Suit / All" toggle — All is now the default view',
      'Winds and Dragons combined into one Special Tiles row',
      'Auto-detect sets button — one tap sorts hand into groups',
      'Chows removed from scoring breakdown',
      'Group size validation — mismatched groups no longer produce wrong scores',
      '"Reset" renamed to "Clear Hand"',
      'Quick guide updated to match new 6-step flow',
    ],
    missing: [
      'Manual kang grouping',
      'Kang tile count logic (n kangs = 16+n tiles)',
      'Concealed set vs. win-by-discard validation',
      'Winning tile requirement for winning hands',
      'Auto-detect for 16-tile non-winning hands',
      'Limit hands',
    ],
  },
  {
    version: 'v0.1.0',
    date: 'May 2026',
    status: 'past',
    summary: 'First build. Structure and design direction are set, scoring engine works. A lot of things weren\'t visible until actually using it.',
    liked: [
      'Color palette came out exactly right — jade, porcelain blue, cream',
      'Scoring engine is solid: formula, ping-oh detection, flat bonuses all work',
      'Breakdown table with tappable rule explanations is the right direction',
      'MahjongTile renders clearly at all sizes and for all suit types',
    ],
    didntLike: [
      'Hand builder too manual — no auto-grouping',
      'Tile visuals functional but not beautiful (want illustrated SVGs)',
      'Rules page entirely placeholder — biggest content gap',
      'Design felt too minimalistic — Mahjong is lively, the site should feel that way',
      'No way to share a hand result',
    ],
    added: [
      'Full scoring engine: points, tai multipliers, ping-oh, buan-oh, go-ki-si-pa',
      'Kang bonuses (revealed +100, hidden +200, TTS +400) tracked separately',
      'Zi-mo, win-by-pair, and kanchan bonuses',
      'Flower/season complete set bonus (was +2 tai — corrected in v0.2.2)',
      'Calculator: tile picker, group builder, winning tile marker',
      'Home, Rules (placeholder), About, Suggest pages',
      'Responsive navbar and footer with disclaimer',
    ],
    missing: [
      'Rules page content',
      'Illustrated tile art',
      'Share-a-hand feature',
      'Auto-grouping',
      'Full limit hand list',
      'Deployment and domain',
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
