import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rules — Mahjong Score',
  description: 'Learn Filipino-Chinese Mahjong rules — from beginner basics to the scoring details unique to this style.',
};

/* ─── tiny layout helpers ─────────────────────────────────────── */

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold mt-12 mb-1" style={{ color: 'var(--color-ink)' }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: 'var(--color-ink)' }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-stone)' }}>
      {children}
    </p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 mb-4"
      style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}
    >
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-4 py-3 mb-4 text-sm leading-relaxed"
      style={{ background: 'var(--color-jade-pale)', border: '1px solid var(--color-jade)', color: 'var(--color-jade)' }}
    >
      {children}
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-4 py-3 mb-4 text-sm leading-relaxed"
      style={{ background: 'var(--color-cream)', border: '1px solid var(--color-cream-dark)', color: 'var(--color-stone)' }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-8" style={{ borderTop: '1px solid var(--color-cream-dark)' }} />;
}

interface Row { label: string; value: string; note?: string }
function ScoreTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-lg overflow-hidden mb-3" style={{ border: '1px solid var(--color-cream-dark)' }}>
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-baseline justify-between px-4 py-2.5 text-sm gap-4"
          style={{
            background: i % 2 === 0 ? '#fff' : 'var(--color-cream-light)',
            borderBottom: i < rows.length - 1 ? '1px solid var(--color-cream-dark)' : undefined,
          }}
        >
          <span style={{ color: 'var(--color-stone)' }}>{row.label}</span>
          <span className="font-semibold text-right shrink-0" style={{ color: 'var(--color-ink)' }}>
            {row.value}
            {row.note && (
              <span className="ml-2 font-normal text-xs" style={{ color: 'var(--color-mist)' }}>
                {row.note}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed mb-1.5">
      <span style={{ color: 'var(--color-jade)', flexShrink: 0 }}>—</span>
      <span style={{ color: 'var(--color-stone)' }}>{children}</span>
    </li>
  );
}

/* ─── page ────────────────────────────────────────────────────── */

export default function RulesPage() {
  return (
    <div style={{ background: 'var(--color-cream-light)' }} className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Rules</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-stone)' }}>
            Filipino-Chinese Mahjong as played in Philippine Chinese communities —
            the Taiwanese-derived style passed down through families. This page covers
            the general game first, then the specifics of this style.
          </p>
          <Warn>
            <strong>Heads up:</strong> Mahjong rules vary by household. These are the rules as we know them —
            cross-referenced with family memory. If something is wrong or missing, please{' '}
            <Link href="/suggest" style={{ color: 'var(--color-jade)', textDecoration: 'underline' }}>suggest a correction</Link>.
          </Warn>
        </div>

        {/* ── GENERAL MAHJONG ───────────────────────────────────── */}
        <H2>General Mahjong</H2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-stone)' }}>
          New to Mahjong? Think of it like a card game — you draw and discard tiles each turn,
          building a complete hand. Everyone plays simultaneously. First to complete wins.
        </p>

        {/* Tiles */}
        <Card>
          <H3>The Tiles</H3>
          <P>
            There are <strong>144 tiles</strong> in a standard set. You play with all of them.
            There are 42 unique tile types across 7 categories:
          </P>
          <ScoreTable rows={[
            { label: 'Characters (萬 / Wan)', value: '1 – 9', note: '4 copies each = 36 tiles' },
            { label: 'Bamboo (條 / Tiao)', value: '1 – 9', note: '4 copies each = 36 tiles' },
            { label: 'Circles (餅 / Bing)', value: '1 – 9', note: '4 copies each = 36 tiles' },
            { label: 'Winds (East, South, West, North)', value: '4 types', note: '4 copies each = 16 tiles' },
            { label: 'Dragons (Red 中, Green 發, White 白)', value: '3 types', note: '4 copies each = 12 tiles' },
            { label: 'Flowers (梅蘭菊竹)', value: '4 tiles', note: '1 of each = 4 tiles' },
            { label: 'Seasons (春夏秋冬)', value: '4 tiles', note: '1 of each = 4 tiles' },
          ]} />
          <P>
            Characters, Bamboo, and Circles are the <em>suited tiles</em> — 1 through 9, like a
            numbered suit. Winds and Dragons are <em>honor tiles</em> — they have no number value
            and can only form pongs or kangs (not sequences). Flowers and Seasons are bonus tiles
            — you keep them aside and draw replacement tiles when you get them.
          </P>
          <P>
            The 1 and 9 of each suit are called <em>terminals</em>. In scoring,
            terminals behave like honor tiles — they&apos;re worth more than middle tiles.
          </P>
        </Card>

        {/* Sets */}
        <Card>
          <H3>The Four Set Types</H3>
          <P>Your hand is made up of sets. There are four types:</P>
          <ul className="mb-3">
            <Li>
              <strong>Chow (順 / Shun)</strong> — a run of 3 consecutive tiles in the same suit.
              Example: 3-4-5 of Bamboo. Only works for the three suited suits (not winds or dragons).
            </Li>
            <Li>
              <strong>Pong (碰 / Peng)</strong> — 3 identical tiles. Example: three East winds.
            </Li>
            <Li>
              <strong>Kang (槓 / Gang)</strong> — 4 identical tiles. Earns a flat bonus paid by all players.
              When you declare a kang, you draw an extra tile from the back of the wall.
            </Li>
            <Li>
              <strong>Pair (對 / Dui)</strong> — 2 identical tiles. You need exactly one pair to complete a hand.
              The pair is the &quot;head&quot; — the last piece that doesn&apos;t form a set of 3 or 4.
            </Li>
          </ul>
          <P>A complete winning hand has exactly 5 sets (any combination of chows, pongs, kangs) plus 1 pair.</P>
        </Card>

        {/* How a round works */}
        <Card>
          <H3>How a Round Works</H3>
          <ul className="mb-2">
            <Li>The dealer shuffles and deals <strong>16 tiles</strong> to each player.</Li>
            <Li>Immediately set aside any flowers or seasons you received — they go in your bonus area. Draw replacement tiles from the wall for each one.</Li>
            <Li>The dealer draws one extra tile (their 17th) to start the round.</Li>
            <Li>On your turn: draw a tile from the wall, then discard one tile face-up into the center.</Li>
            <Li>
              <strong>Stealing a discard:</strong> if another player discards a tile that completes a set in your hand,
              you can &quot;steal&quot; it. Call out the set type, lay the set face-up in front of you, then discard a tile.
              Chows can only be stolen from the player to your left.
              Pongs and kangs can be stolen from anyone.
            </Li>
            <Li>If you draw a tile that gives you 4 of a kind, you may declare a kang. Draw a bonus tile from the back wall, then discard.</Li>
            <Li><strong>Winning (Mahjong):</strong> when you have 5 complete sets and a pair, declare Mahjong. You can win on your own draw or on another player&apos;s discard.</Li>
          </ul>
        </Card>

        {/* Winning */}
        <Card>
          <H3>Winning</H3>
          <P>
            To win, you need <strong>5 sets + 1 pair = 17 tiles total</strong> (16 in hand + the winning tile).
            The winning tile either completes your last set or completes your pair.
          </P>
          <ul className="mb-2">
            <Li><strong>Self-draw (Zi-mo / 自摸):</strong> you draw your winning tile from the wall. All three other players pay you.</Li>
            <Li><strong>Win on discard:</strong> another player discards your winning tile. Only that player pays you.</Li>
          </ul>
          <P>Note: you generally cannot win on a tile you just stole to make a kang (robbing the kang is a special exception discussed below).</P>
        </Card>

        <Divider />

        {/* ── FILIPINO-CHINESE STYLE ────────────────────────────── */}
        <H2>Filipino-Chinese Style</H2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-stone)' }}>
          The Taiwanese-derived style played in Philippine Chinese communities.
          The biggest difference from Hong Kong Mahjong is the hand size, the scoring formula, and the tai system.
        </p>

        {/* Hand structure */}
        <Card>
          <H3>Hand Structure — 16 Tiles</H3>
          <P>
            You are dealt <strong>16 tiles</strong> and need <strong>17 to win</strong>
            — one more than Hong Kong style (13/14). Everything else about hand structure is the same:
            5 sets + 1 pair.
          </P>
        </Card>

        {/* Scoring formula */}
        <Card>
          <H3>The Scoring Formula</H3>
          <P>
            Every hand that wins goes through this formula. Points come from your sets; tai are multipliers.
          </P>
          <ol className="mb-3 flex flex-col gap-1.5">
            {[
              'Add up all base points from your sets, flowers, seasons, and any win bonuses.',
              'rawScore = round base points × 4 up to the nearest 10.',
              'Add 20 (the Mahjong win bonus).',
              'Multiply by 2 for each tai you have. (1 tai = ×2, 2 tai = ×4, 3 tai = ×8, etc.)',
              'Floor at 50 — if the result is under 50, it counts as 50. This is called Go-ki-si-pa.',
              'Cap at 600 — if the result is 600 or over, it counts as 600. This is called Buan-oh (limit hand).',
              'Flat bonuses (kang types, self-draw, complete flower/season set) are added on top and paid separately by each player.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--color-jade)', color: '#fff', marginTop: '1px' }}
                >
                  {i + 1}
                </span>
                <span style={{ color: 'var(--color-stone)' }}>{step}</span>
              </li>
            ))}
          </ol>
          <Note>
            <strong>Dealer rule:</strong> the dealer (East wind) always pays and receives double. If a dealer wins,
            all three players pay the dealer score. If a non-dealer wins, the dealer pays the doubled score and the other two pay the normal score.
          </Note>
        </Card>

        {/* Base points */}
        <Card>
          <H3>Base Points</H3>
          <P>Base points come from your sets, flowers, seasons, and win conditions.</P>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-mist)' }}>Sets</p>
          <ScoreTable rows={[
            { label: 'Honor pong — winds or dragons', value: '1 pt', note: '×2 if concealed' },
            { label: 'Terminal pong — 1 or 9 of any suit', value: '1 pt', note: '×2 if concealed' },
            { label: 'Suited pong — 2 through 8', value: '0.5 pt', note: '×2 if concealed' },
            { label: 'Kang', value: 'pong pts ×4', note: 'concealed doubles the pong base first' },
            { label: 'Chow — any sequence', value: '0 pts', note: 'sequences score nothing' },
            { label: 'Pair — dragon, own wind, or terminal', value: '0.5 pts', note: '' },
            { label: 'Pair — any other tile', value: '0 pts', note: '' },
          ]} />

          <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4" style={{ color: 'var(--color-mist)' }}>Flowers & Seasons</p>
          <ScoreTable rows={[
            { label: 'Any flower or season tile', value: '1 pt each', note: '' },
          ]} />

          <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4" style={{ color: 'var(--color-mist)' }}>Win bonuses</p>
          <ScoreTable rows={[
            { label: 'Self-draw (Zi-mo)', value: '+0.5 pts', note: 'also earns +100 flat bonus' },
            { label: 'Win by completing the pair', value: '+0.5 pts', note: '' },
            { label: 'Win by middle tile of a sequence (Kanchan)', value: '+0.5 pts', note: 'e.g. win on the 5 to complete 4-5-6' },
          ]} />

          <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4" style={{ color: 'var(--color-mist)' }}>Hand bonus</p>
          <ScoreTable rows={[
            { label: 'All pong hand — every set is a pong or kang, no chows', value: '+1 pt', note: 'added to the hand total once' },
          ]} />
        </Card>

        {/* Tai multipliers */}
        <Card>
          <H3>Tai — Multipliers</H3>
          <P>
            Each tai <strong>doubles</strong> the score. 1 tai = ×2. 2 tai = ×4. 3 tai = ×8. 4 tai = automatic buan-oh.
          </P>
          <ScoreTable rows={[
            { label: 'Dragon pong or kang', value: '+1 tai', note: 'any dragon' },
            { label: 'Own wind pong or kang', value: '+1 tai', note: 'your seat wind only' },
            { label: 'Own flower tile', value: '+1 tai', note: 'flower matching your seat number' },
            { label: 'Own season tile', value: '+1 tai', note: 'season matching your seat number' },
            { label: 'Complete flower set (flower kang)', value: '+1 tai', note: 'all 4 flowers' },
            { label: 'Complete season set (season kang)', value: '+1 tai', note: 'all 4 seasons' },
            { label: 'Half flush — one suit + honor tiles', value: '+1 tai', note: '' },
            { label: '4 tai total', value: 'automatic buan-oh', note: 'max win regardless of point total' },
          ]} />
          <Note>
            Own flower and own season: flower #1 belongs to East, #2 to South, #3 to West, #4 to North. Same numbering for seasons.
          </Note>
        </Card>

        {/* Flat bonuses */}
        <Card>
          <H3>Flat Bonuses</H3>
          <P>
            These are paid <strong>separately</strong> by each player — they are not part of the main scoring formula.
            Every player at the table pays the winner this amount directly.
          </P>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-mist)' }}>Kang types</p>
          <ScoreTable rows={[
            { label: 'Revealed kang — stole a tile to complete the kang', value: '+100 each', note: '' },
            { label: 'Hidden kang (Am Kang) — all 4 tiles were in your hand', value: '+200 each', note: '' },
            { label: 'Starting kang (TTS) — held all 4 from the initial deal', value: '+400 each', note: '' },
          ]} />

          <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4" style={{ color: 'var(--color-mist)' }}>Other</p>
          <ScoreTable rows={[
            { label: 'Self-draw (Zi-mo)', value: '+100 each', note: '' },
            { label: 'Complete flower set (flower kang)', value: '+100 each', note: '' },
            { label: 'Complete season set (season kang)', value: '+100 each', note: '' },
          ]} />
        </Card>

        {/* Flowers & Seasons */}
        <Card>
          <H3>Flowers & Seasons</H3>
          <P>
            Flowers and Seasons are bonus tiles — you keep them face-up in front of you (they don&apos;t count toward your 5 sets + pair)
            and draw replacement tiles when you receive them.
          </P>
          <ul className="mb-3">
            <Li>There are 4 flower tiles (梅蘭菊竹) and 4 season tiles (春夏秋冬). There is only one of each.</Li>
            <Li>Each flower or season tile is worth <strong>1 base point</strong>.</Li>
            <Li>Your <strong>own flower or season</strong> (the one that matches your seat number) earns <strong>+1 tai</strong>.</Li>
            <Li>If you collect <strong>all 4 flowers</strong>, this is a <em>flower kang</em>: <strong>+1 tai + 100 flat</strong> from each player.</Li>
            <Li>If you collect <strong>all 4 seasons</strong>, this is a <em>season kang</em>: <strong>+1 tai + 100 flat</strong> from each player.</Li>
            <Li>
              If you collect <strong>all 4 flowers AND all 4 seasons</strong> (8 bonus tiles total):
              this is an <strong>automatic buan-oh</strong> (limit hand) plus <strong>+200 flat</strong> (two kang bonuses paid by each player).
              The player who completes the 8th tile may choose to declare an immediate win.
            </Li>
          </ul>
        </Card>

        {/* Special / limit hands */}
        <Card>
          <H3>Special Hands & Limit Hands</H3>
          <P>Some hands skip the formula entirely or automatically cap at the maximum.</P>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-mist)' }}>Ping-oh — the all-run hand</p>
          <P>
            If your base points total zero (all chows, no scoring pair, no flowers or seasons, no special win condition),
            the formula is skipped entirely. Ping-oh pays a flat <strong>300 / 600 for dealer</strong>.
          </P>

          <p className="text-xs font-semibold uppercase tracking-wide mb-2 mt-4" style={{ color: 'var(--color-mist)' }}>Buan-oh — limit hands (600 / 1,200 for dealer)</p>
          <P>The following hands automatically pay the maximum, regardless of the formula:</P>
          <ul className="mb-3">
            <Li><strong>Full flush</strong> — entire hand (all 5 sets + pair) is one suit, no honor tiles.</Li>
            <Li><strong>All terminals</strong> — every tile in the hand is a 1 or 9 (only terminal tiles, no other numbers or honors).</Li>
            <Li><strong>Small winds</strong> — pong of 3 winds (one must be your own seat wind) + pair of the 4th wind.</Li>
            <Li><strong>Big winds</strong> — all 4 winds as pongs.</Li>
            <Li><strong>Big three dragons</strong> — all 3 dragons as pongs.</Li>
            <Li><strong>4 tai</strong> — reaching 4 tai automatically caps the hand at buan-oh.</Li>
            <Li><strong>4 kangs</strong> — having 4 kangs declared in one hand is an automatic buan-oh.</Li>
            <Li><strong>All flowers + all seasons</strong> — collecting all 8 bonus tiles is an automatic buan-oh.</Li>
          </ul>
          <Warn>
            <strong>All honor tiles</strong> (all winds and dragons, no suited tiles) — no consensus on this one yet.
            We&apos;ll update when confirmed.
          </Warn>
        </Card>

        {/* Protective rules */}
        <Card>
          <H3>Protective Rules</H3>
          <P>
            When a player is close to winning big, other players have restrictions on what they can discard.
          </P>
          <ul className="mb-2">
            <Li>
              <strong>3 kangs on the table:</strong> once a player has 3 declared kangs,
              other players may only discard tiles that are <em>already visible</em> — tiles that have already been discarded
              or are in open sets on the table. You cannot freely discard from your hand.
            </Li>
            <Li>
              <strong>3 tai:</strong> once a player reaches 3 tai, other players may not discard
              dragons or the seat wind of the 3-tai player — these tiles could give them a 4th tai and trigger buan-oh.
            </Li>
          </ul>
        </Card>

        {/* Go-ki-si-pa / Buan-oh summary */}
        <Card>
          <H3>Score Floor & Cap</H3>
          <ScoreTable rows={[
            { label: 'Go-ki-si-pa — minimum score', value: '50 / 100 dealer', note: 'any hand under 50 is bumped to 50' },
            { label: 'Buan-oh — maximum score', value: '600 / 1,200 dealer', note: 'any hand at or over 600 is capped' },
          ]} />
        </Card>

        <Divider />

        {/* CTA */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--color-jade-pale)', border: '1px solid var(--color-jade)' }}
        >
          <p className="font-medium mb-1" style={{ color: 'var(--color-jade)' }}>
            Something wrong or missing?
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-stone)' }}>
            These rules are based on family knowledge and may vary from your household.
            If you know a rule differently, please help us get it right.
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
