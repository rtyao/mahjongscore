import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rules — Mahjong Score',
  description: 'Learn Filipino-Chinese Mahjong rules — from beginner basics to the scoring details unique to this style.',
};

/* ─── tiny layout helpers ─────────────────────────────────────── */

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-2xl font-bold mt-12 mb-1" style={{ color: 'var(--color-ink)', scrollMarginTop: '1rem' }}>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-ink)' }}>Rules</h1>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-stone)' }}>
            Two styles, sharing one set of tiles. <strong>Filipino-Chinese</strong> is the Taiwanese-derived
            style played in Philippine Chinese communities and passed down through families.
            <strong> Hong Kong</strong> is a different game with a smaller hand and its own scoring.
            The general rules below apply to both.
          </p>

          {/* Jump links */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { href: '#general', label: 'General Mahjong' },
              { href: '#filipino-chinese', label: 'Filipino-Chinese' },
              { href: '#hong-kong', label: 'Hong Kong' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: 'var(--color-cream)', color: 'var(--color-stone)', border: '1px solid var(--color-cream-dark)' }}
              >
                {label}
              </a>
            ))}
          </div>

          <Warn>
            <strong>Heads up:</strong> Mahjong rules vary by household and by table. The Filipino-Chinese
            rules are as we know them, cross-referenced with family memory. The Hong Kong rules follow
            the <em>Hong Kong Mahjong Rule Sheet</em> v1.0 by /u/danma. If something is wrong or missing, please{' '}
            <Link href="/suggest" style={{ color: 'var(--color-jade)', textDecoration: 'underline' }}>suggest a correction</Link>.
          </Warn>
        </div>

        {/* ── GENERAL MAHJONG ───────────────────────────────────── */}
        <H2 id="general">General Mahjong</H2>
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
            <Li><strong>Robbing the kang:</strong> if another player adds a drawn tile to their revealed pong to declare a kang, and that tile is your winning tile, you may steal it and declare Mahjong.</Li>
            <Li><strong>No minimum hand:</strong> anyone can win on anything — there is no minimum score to declare Mahjong. The smallest wins are simply floored at 50 (go-ki-si-pa).</Li>
          </ul>
        </Card>

        <Divider />

        {/* ── FILIPINO-CHINESE STYLE ────────────────────────────── */}
        <H2 id="filipino-chinese">Filipino-Chinese Style</H2>
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
            <Li><strong>Blessing of Heaven</strong> — the dealer wins with their opening hand (first draw).</Li>
            <Li><strong>Blessing of Earth</strong> — winning on the dealer&apos;s very first discard.</Li>
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

        {/* ── HONG KONG STYLE ───────────────────────────────────── */}
        <H2 id="hong-kong">Hong Kong Style</H2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-stone)' }}>
          A different game from the Filipino-Chinese style rather than a variation on it.
          The tiles are the same; almost nothing else is. You hold 13 tiles and win with 14,
          and a hand&apos;s worth is one number — its fan count.
        </p>

        <Card>
          <H3>What&apos;s different</H3>
          <ScoreTable rows={[
            { label: 'Hand size', value: '13 → 14', note: '4 sets + a pair' },
            { label: 'Scoring', value: 'fan only', note: 'no base points, no tai' },
            { label: 'Payout', value: 'fan table', note: 'a fixed lookup, not a formula' },
            { label: 'Dealer bonus', value: 'none', note: 'the dealer pays and collects like everyone else' },
            { label: 'Losing to a discard', value: 'discarder pays double', note: 'and pays alone' },
            { label: 'Round wind', value: 'used', note: 'a triplet of it scores fan' },
            { label: 'Kong bonus', value: 'none', note: 'no flat payments' },
            { label: 'Concealed hand', value: '1 fan', note: 'scored once for the whole hand, not per set' },
          ]} />
        </Card>

        <Card>
          <H3>How fan becomes points</H3>
          <P>
            Add up the fan for every feature your hand matches, then read the total across this table.
          </P>
          <ScoreTable rows={[
            { label: '0 fan — chicken hand (雞和)', value: '1 pt' },
            { label: '1 fan', value: '2 pts' },
            { label: '2 fan', value: '4 pts' },
            { label: '3 fan', value: '8 pts' },
            { label: '4 fan', value: '16 pts' },
            { label: '5 fan', value: '24 pts' },
            { label: '6 fan', value: '32 pts' },
            { label: '7 fan', value: '48 pts' },
            { label: '8 fan', value: '64 pts' },
            { label: '9 fan', value: '96 pts' },
            { label: '10 fan', value: '128 pts' },
            { label: '11 fan', value: '192 pts' },
            { label: '12 fan', value: '256 pts' },
            { label: '13+ fan — limit', value: '384 pts' },
          ]} />
          <Note>
            <strong>Discarder pays all.</strong> On a self-pick, all three other players each pay you the point value.
            If you won on a discard, only the player who discarded pays — and they pay double.
          </Note>
          <P>
            Many tables set a <strong>minimum fan</strong>, commonly 3, below which you may not declare a win at all.
            Agree on this before you start — the calculator lets you set it.
          </P>
        </Card>

        <Card>
          <H3>Two rules that decide how fan combine</H3>
          <ul className="mb-2">
            <Li>
              <strong>A stronger hand replaces the weaker one in its family — they never stack.</strong>{' '}
              Full Flush replaces Mixed Flush. Big Three Dragons replaces the per-dragon award.
              All Concealed Triplets replaces All Triplets. In the tables below, an arrow (↳) marks a replacement.
            </Li>
            <Li>
              <strong>Mixed Terminals, All Terminals and All Honours already include All Triplets&apos; 3 fan.</strong>{' '}
              Those hands are all-triplet hands by definition, so the 3 fan is baked into the printed value. Don&apos;t add it twice.
            </Li>
          </ul>
          <P>Unless a rule says otherwise, triplets and kongs are interchangeable.</P>
        </Card>

        <Card>
          <H3>Hand shape</H3>
          <ScoreTable rows={[
            { label: 'All Sequences (平和)', value: '1 fan', note: 'every set is a sequence' },
            { label: 'All Triplets (對對和)', value: '3 fan', note: 'every set is a triplet or kong' },
            { label: '↳ All Concealed Triplets', value: '8 fan', note: 'no tiles taken from others; self-pick, or the discard completed your pair' },
            { label: '↳ All Quadruplets', value: '13 fan', note: 'all four sets are kongs' },
          ]} />
        </Card>

        <Card>
          <H3>Suit, terminals and honours</H3>
          <ScoreTable rows={[
            { label: 'Mixed Flush (混一色)', value: '3 fan', note: 'one suit plus honours' },
            { label: '↳ Full Flush (清一色)', value: '7 fan', note: 'one suit and nothing else' },
            { label: 'Mixed Terminals', value: '4 fan', note: 'only ones, nines and honours' },
            { label: '↳ All Terminals', value: '13 fan', note: 'only ones and nines' },
            { label: 'All Honours', value: '10 fan', note: 'only honour tiles' },
          ]} />
        </Card>

        <Card>
          <H3>Dragons and winds</H3>
          <ScoreTable rows={[
            { label: 'Dragon triplet', value: '1 fan each', note: 'scored per triplet' },
            { label: '↳ Small Three Dragons', value: '5 fan', note: 'two dragon triplets + pair of the third' },
            { label: '↳ Big Three Dragons', value: '8 fan', note: 'triplets of all three dragons' },
            { label: 'Round wind / seat wind triplet', value: '1 fan each', note: 'a triplet that is both counts 2 fan' },
            { label: '↳ Small Four Winds', value: '6 fan', note: 'three wind triplets + pair of the fourth' },
            { label: '↳ Big Four Winds', value: '13 fan', note: 'triplets of all four winds' },
          ]} />
        </Card>

        <Card>
          <H3>Flowers & seasons</H3>
          <ScoreTable rows={[
            { label: 'No flowers or seasons at all', value: '1 fan' },
            { label: 'Flower or season matching your seat', value: '1 fan each', note: 'East 1, South 2, West 3, North 4' },
            { label: 'All four flowers, or all four seasons', value: '2 fan' },
            { label: 'Seven bonus tiles', value: '3 fan', note: 'you may declare an immediate win on the seventh' },
            { label: 'All eight bonus tiles', value: '8 fan', note: 'you may declare an immediate win on the eighth' },
          ]} />
        </Card>

        <Card>
          <H3>Win actions</H3>
          <ScoreTable rows={[
            { label: 'Self-Pick (自摸)', value: '1 fan', note: 'you drew your winning tile from the wall' },
            { label: 'Concealed Hand (門前清)', value: '1 fan', note: 'you took no tiles from other players' },
            { label: 'Robbing the Kong (搶槓)', value: '1 fan', note: 'won by interrupting a pong being upgraded to a kong' },
            { label: 'Moon Under The Sea (海底撈月)', value: '1 fan', note: 'your winning tile was the last in the wall, or the last discard' },
            { label: '↳ Win by Kong Replacement (槓上開花)', value: '2 fan', note: 'you won on the replacement tile drawn after a kong' },
            { label: '↳ Double Kong Replacement', value: '9 fan', note: 'two kongs in a row, winning on the second replacement' },
          ]} />
        </Card>

        <Card>
          <H3>Special hands</H3>
          <ScoreTable rows={[
            { label: 'Blessing of Heaven (天和)', value: '13 fan', note: 'as dealer, your starting hand already wins' },
            { label: 'Blessing of Earth (地和)', value: '13 fan', note: "as a non-dealer, you win on the dealer's first discard" },
            { label: 'Blessing of Man (人和)', value: '13 fan', note: 'as a non-dealer, you win on your first turn with a self-pick' },
            { label: 'Nine Gates (九蓮寶燈)', value: '13 fan', note: '1112345678999 of one suit, plus a 14th of that suit' },
            { label: 'Thirteen Orphans (十三么)', value: '13 fan', note: 'one of each terminal, wind and dragon, plus a 14th matching one' },
            { label: 'Seven Pairs (七對子)', value: '4 fan', note: 'seven different pairs — four of a kind is not two pairs' },
          ]} />
          <Warn>
            <strong>Seven Pairs is not played at every table.</strong> It stacks with All Honours,
            Mixed Flush and Full Flush where it is played. Check before counting it.
          </Warn>
        </Card>

        <Card>
          <H3>What the calculator covers</H3>
          <P>
            The calculator scores everything it can read off your tiles. Six fan depend on what happened
            at the table rather than on the hand itself, so there is nothing in the tiles to detect:
          </P>
          <ul className="mb-3">
            <Li>Robbing the Kong</Li>
            <Li>Moon Under The Sea</Li>
            <Li>Win by Kong Replacement, and Double Kong Replacement</Li>
            <Li>Blessing of Heaven, Earth and Man</Li>
          </ul>
          <P>
            If one of those applies to your hand, add its fan to the calculator&apos;s total yourself.
          </P>
          <Note>
            Seven Pairs, Thirteen Orphans and Nine Gates are recognised from your tiles alone —
            you don&apos;t need to group them into sets first.
          </Note>
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
