<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project notes for future Claude sessions

Read this before making changes. It encodes decisions and context that are not obvious from the code.

## What this project is

**Mahjong Score** (mahjongscore.me, not yet deployed) documents and preserves the Filipino-Chinese (Taiwanese-derived) Mahjong variant played in Philippine Chinese communities. Two purposes: (1) a rules guide, (2) a hand score calculator — the main feature. Repo: github.com/rtyao/mahjongscore.

**The user (Caleb, GitHub: rtyao)** is new to web development, knows Python but not JS/TS. Explain things plainly; don't assume he can read React. He cares a lot about honest, personal changelogs and patch notes. The rules come from his grandma and relatives — they are the source of truth, not the internet. This style is not documented anywhere online. Never "correct" a rule based on other Mahjong variants.

## Non-negotiable working rules

1. **No `Co-Authored-By: Claude` trailers in commits.** Caleb explicitly asked (2026-06-20).
2. **Node is in nvm, not PATH.** Prefix every npm/node command:
   `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"`
3. **Before pushing: `npm run build` (type-checks everything) AND `npm test` (scoring regression tests). Both must pass.**
4. **Every scoring rule change updates 4 places together:** `src/lib/scoring.ts` (+ its header comment), `scripts/scoring-tests.ts`, `RULES.md`, `src/app/rules/page.tsx`. RULES.md is the human-readable source Caleb edits and reads on GitHub.
5. **Changelogs are double-entry:** `CHANGELOG.md` (developer) and the `RELEASES` array in `src/app/changelog/page.tsx` (website). Caleb writes personal "what I liked / didn't like" notes — preserve his voice, don't paraphrase them away.
6. Use CSS variables (`var(--color-jade)` etc., defined in `src/app/globals.css`) for brand colors, not Tailwind color classes.

## Architecture (small on purpose)

- `src/types/mahjong.ts` — all types. `CalculatorState` in → `calculateScore()` → `ScoreResult` out.
- `src/lib/tiles.ts` — the 42 unique tile definitions. Only file to touch for tile data.
- `src/lib/scoring.ts` — pure scoring engine, no UI. The header comment is a complete spec of the scoring system. Limit hands are detected over `CompletedSet[]` (one representative tile per set — valid because pongs/kangs/pairs are all one tile; chows need whole-set reasoning, see `isAllTerminals` for the pattern).
- `src/lib/handDetection.ts` — backtracking auto-grouper. Tries chow before pong deliberately (greedy pong-first fails on overlapping runs like 1/2/3+2/3/4+3/4/5).
- `src/app/calculator/CalculatorClient.tsx` — state + layout only; UI pieces live in `src/app/calculator/components/` (TilePickerGrid, HandTray, GroupCard, ScoreDisplay).
- `src/components/MahjongTile.tsx` — ALL tile rendering goes through this one component. Planned: swap its internals to friend-designed SVG/image tiles; the rest of the site won't change.

## Scoring system in one paragraph

Base points from sets (honor/terminal pong 1, suited pong 0.5, ×2 concealed, kang = pong×4, chow 0, special pair 0.5) plus flowers/seasons (1 each) plus win bonuses (self-draw/pair/kanchan +0.5, all-pong hand +1). Then `(ceil(pts×4/10)×10 + 20) × 2^tai`, floor 50 (go-ki-si-pa), cap 600 (buan-oh); dealer always double. Tai (+1 each): dragon pong, own-wind pong, own flower/season, complete flower or season set, half flush. Base points = 0 → ping-oh, flat 300/600 (blessings outrank it). Flat bonuses paid separately: kang 100/200/400 (revealed/hidden/TTS), self-draw 100, flower/season set 100. Automatic buan-oh: blessing of heaven/earth, full flush, all terminals, big/small winds, big three dragons, 4 kangs, all 8 bonus tiles, 4 tai.

## Open questions / known gaps (as of v0.2.2, June 2026)

- **All honors hand** (all winds+dragons): family has no consensus yet — intentionally NOT implemented. Ask Caleb, don't guess.
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
