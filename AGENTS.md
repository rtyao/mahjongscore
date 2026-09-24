<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project notes for future Claude sessions

Read this before making changes. It encodes decisions and context that are not obvious from the code.

## What this project is

**Mahjong Score** (mahjongscore.me, not yet deployed) documents and preserves the Filipino-Chinese (Taiwanese-derived) Mahjong variant played in Philippine Chinese communities. Two purposes: (1) a rules guide, (2) a hand score calculator — the main feature. Repo: github.com/rtyao/mahjongscore.

Since v0.3.0 the site covers **two styles**: Filipino-Chinese (the project's reason for existing) and Hong Kong (added so the site is useful to more players before launch). They share tiles and the hand-building UI and nothing else.

**The user (Caleb, GitHub: rtyao)** is new to web development, knows Python but not JS/TS. Explain things plainly; don't assume he can read React. He cares a lot about honest, personal changelogs and patch notes.

**Where each style's rules come from — do not mix these up:**
- **Filipino-Chinese**: his grandma and relatives. They are the source of truth, not the internet. This style is not documented anywhere online. Never "correct" a rule based on other Mahjong variants; ask him instead.
- **Hong Kong**: the *Hong Kong Mahjong Rule Sheet* v1.0 (April 2025) by /u/danma, which he supplied. That sheet is the source of truth for HK. Where it is ambiguous, the ambiguity is recorded under "What's Still Unconfirmed" in RULES.md rather than guessed at.

## Non-negotiable working rules

1. **No `Co-Authored-By: Claude` trailers in commits.** Caleb explicitly asked (2026-06-20).
2. **Node is in nvm, not PATH.** Prefix every npm/node command:
   `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"`
3. **Before pushing: `npm run build` (type-checks everything) AND `npm test` (scoring regression tests). Both must pass.**
4. **Every scoring rule change updates 4 places together:** the engine in `src/lib/scoring/` (+ its header comment), `scripts/scoring-tests.ts`, `RULES.md`, `src/app/rules/page.tsx`. RULES.md is the human-readable source Caleb edits and reads on GitHub.
5. **Changelogs are double-entry:** `CHANGELOG.md` (developer) and the `RELEASES` array in `src/app/changelog/page.tsx` (website). Caleb writes personal "what I liked / didn't like" notes — preserve his voice, don't paraphrase them away.
6. Use CSS variables (`var(--color-jade)` etc., defined in `src/app/globals.css`) for brand colors, not Tailwind color classes.

## Architecture (small on purpose)

- `src/types/mahjong.ts` — all types. `CalculatorState` in → `calculateScore()` → `ScoreResult` out. `ScoreResult` is a union discriminated by `style`, so narrow on it before touching style-specific fields. `HAND_SIZE` holds each style's tile counts — read it instead of hardcoding 16/17/13/14.
- `src/lib/tiles.ts` — the 42 unique tile definitions. Only file to touch for tile data.
- `src/lib/scoring/index.ts` — dispatches on `state.style`. Call `calculateScore` from UI code.
- `src/lib/scoring/taiwanese.ts` — points × tai engine. Limit hands are detected over `CompletedSet[]` (one representative tile per set — valid because pongs/kangs/pairs are all one tile; chows need whole-set reasoning, see `isAllTerminals` for the pattern).
- `src/lib/scoring/hongkong.ts` — fan engine. Its header comment explains the two combination rules that shape the whole file (stronger hands *replace* weaker ones in their family; terminal/honour hands already include All Triplets' 3 fan). Suit and composition are read from the raw tile list, not from groups, so they score before the hand is grouped. Seven Pairs / Thirteen Orphans / Nine Gates are recognised from tiles alone via `hasStandaloneShape`.
- Each engine's header comment is a complete spec of that style's scoring.
- `src/lib/handDetection.ts` — backtracking auto-grouper, shared by both styles. Tries chow before pong deliberately (greedy pong-first fails on overlapping runs like 1/2/3+2/3/4+3/4/5).
- `src/app/calculator/CalculatorClient.tsx` — state + layout only; UI pieces live in `src/app/calculator/components/` (TilePickerGrid, HandTray, GroupCard, ScoreDisplay → TaiwaneseScorePanel | HongKongScorePanel).
- `src/components/MahjongTile.tsx` — ALL tile rendering goes through this one component. Planned: swap its internals to friend-designed SVG/image tiles; the rest of the site won't change.

## Each scoring system in one paragraph

**Taiwanese.** Base points from sets (honor/terminal pong 1, suited pong 0.5, ×2 concealed, kang = pong×4, chow 0, special pair 0.5) plus flowers/seasons (1 each) plus win bonuses (self-draw/pair/kanchan +0.5, all-pong hand +1). Then `(ceil(pts×4/10)×10 + 20) × 2^tai`, floor 50 (go-ki-si-pa), cap 600 (buan-oh); dealer always double. Tai (+1 each): dragon pong, own-wind pong, own flower/season, complete flower or season set, half flush. Base points = 0 → ping-oh, flat 300/600 (blessings outrank it). Flat bonuses paid separately: kang 100/200/400 (revealed/hidden/TTS), self-draw 100, flower/season set 100. Automatic buan-oh: blessing of heaven/earth, full flush, all terminals, big/small winds, big three dragons, 4 kangs, all 8 bonus tiles, 4 tai.

**Hong Kong.** No base points, no tai — just fan, summed and read off a table (0 fan=1 pt … 12=256, 13+=384). Families each contribute one entry, stronger replacing weaker: shape (All Quadruplets 13 > All Concealed Triplets 8 > All Triplets 3, or All Sequences 1), composition (All Terminals 13 > All Honours 10 > Mixed Terminals 4), suit (Full Flush 7 > Mixed Flush 3), dragons (Big Three 8 > Small Three 5 > 1 each), winds (Big Four 13 > Small Four 6 > 1 per round/seat wind, 2 if both). Stacking on top: Seven Pairs 4, Self-Pick 1, Concealed Hand 1, flower awards. Standalone 13-fan hands: Thirteen Orphans, Nine Gates. Payment is discarder-pays-all — self-pick means all three pay the points, a discard means the discarder alone pays double. **No dealer bonus in HK.** Six situational fan (Robbing the Kong, Moon Under The Sea, both Kong Replacements, three Blessings) are documented in RULES.md but deliberately absent from the calculator — Caleb decided they belong in the rulebook since nothing in the tiles reveals them.

## Open questions / known gaps (as of v0.3.0, September 2026)

- **No open rule questions.** All-honours (Filipino-Chinese, now buan-oh), HK flower stacking (a flat 2 fan) and All Sequences conditions (none — as written) were all confirmed by Caleb on 2026-09-21. The resolved list is at the foot of RULES.md.
- **Not deployed.** No GitHub Pages/Vercel config yet. Needs `output: 'export'` consideration for static hosting. This is the biggest missing piece.
- Formspree form ID on /suggest is a placeholder — the form doesn't send.
- Manual kang grouping UI: "+ Add group manually" creates an empty group with no way to add tiles into it (known bug since v0.2.0).
- Auto-detect fails on 16-tile non-winning hands (only handles complete winning shapes).
- Git identity is wrong (`admin@Mon-ordi-et-pas-le-tien.local`) — Caleb should run `git config --global user.name/user.email`.
- Tile art: friends will design tile images; swap inside `MahjongTile.tsx` when ready.
- Share-a-hand (encode hand in URL) — wanted, not built.

## Process that works with Caleb

- He brings rule clarifications in batches after family conversations. Ask clarifying questions about edge cases (e.g. "does that bonus stack with X?") — this has caught real ambiguities every time.
- Version bumps get a changelog entry (both places), a git tag is nice-to-have (v0.1.0 exists).
- When something was wrong (like the flower-set tai being +2 instead of +1 from v0.1.0 to v0.2.2), say so plainly in the changelog — he values honesty about mistakes over polish.
