# Contributing to Mahjong Score

Thanks for wanting to help. Here's what you need to know.

---

## What we need most right now

**1. Rule verification and content (no coding required)**
The Rules pages are placeholder. If you play Filipino-Chinese Mahjong (Taiwanese style, as played in the Philippines), your knowledge is the most valuable thing you can contribute. Specifically:

- Mixed flush and full flush scoring
- Full list of limit hands
- Regional or house rule variations
- Whether four kangs = automatic max win
- The complete flower/season kang rules

Open an [Issue](https://github.com/rtyao/mahjongscore/issues) with what you know, or use the suggestion form on the site.

**2. Tile art**
The current tiles are text/shape-based. We'd love illustrated SVG tiles — clean, readable, matching the jade/cream aesthetic. See `src/components/MahjongTile.tsx` for how tiles are rendered.

**3. Bug reports**
If the calculator gives you the wrong score, open an Issue with: your seat, your hand (list the tiles), whether you won, and what score you expected vs. got.

---

## Running the project

```bash
git clone https://github.com/rtyao/mahjongscore.git
cd mahjongscore
npm install
npm run dev
```

Node 18+ required. Uses Next.js 16, TypeScript, Tailwind CSS v4.

---

## Code overview

The important files for contributors:

### `src/types/mahjong.ts`
All TypeScript types. Start here if you want to understand the data model.
- `Tile` — a unique tile type (e.g. "3 bamboo", "East wind")
- `TileInstance` — one specific copy of a tile in a hand
- `TileGroup` — a set (pong/kang/chow/pair) made of tile instances
- `CalculatorState` — the full state of the calculator
- `ScoreResult` — the output of the scoring engine

### `src/lib/tiles.ts`
Definitions for all 42 unique tiles and helper functions.
To add or modify a tile, this is the only file you touch.

### `src/lib/scoring.ts`
The scoring engine. Pure functions — no UI, no state. Input: `CalculatorState`. Output: `ScoreResult`.
The algorithm:
1. Score each set (pong/kang/chow/pair) for points and tai
2. Score flowers and seasons
3. Apply win condition bonuses (self-draw, win-by-pair, kanchan)
4. Detect ping-oh (base points = 0)
5. Apply formula: `(points × 4, rounded up to 10) + 20 × 2^tai`
6. Cap at 600 (buan-oh) or floor at 50 (go-ki-si-pa)
7. Collect flat bonuses (kang types, zi-mo) — these are separate from the formula

### `src/lib/handDetection.ts`
Auto-grouping: given a list of tile IDs, find a valid 5-set + 1-pair arrangement.
Uses backtracking — tries pairs first, then recursively finds sets.

### `src/components/MahjongTile.tsx`
Renders a single tile visually. Props: `tile`, `size`, `selected`, `winning`, `concealed`, `onClick`.
Each suit renders differently — bamboo uses stick shapes, circles use dots, everything else uses Chinese characters.

### `src/app/calculator/CalculatorClient.tsx`
The main calculator page. Client component (all state lives here).
Note: this file is long (400+ lines) and will be split into sub-components in a future version.

---

## Design system

Colors (defined in `src/app/globals.css` as CSS variables):
- `--color-jade` (#4A8C6F) — primary action, highlights
- `--color-porcelain` (#3A6B9F) — secondary, concealed state, info
- `--color-cream-light` (#FAF6EE) — page backgrounds
- `--color-cream` (#F5E4C8) — section backgrounds, borders
- `--color-ink` (#2C2214) — primary text
- `--color-stone` (#6B6357) — secondary text
- `--color-mist` (#A8A09A) — placeholder, inactive

Use CSS variables (`style={{ color: 'var(--color-jade)' }}`) rather than Tailwind color classes for brand colors, since we're on Tailwind v4 with a custom theme.

---

## Branches

- `main` — stable, what's on the live site
- `dev` — active development (use this for PRs)
- `feat/xyz` — feature branches, merge into `dev`

---

## Submitting changes

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-thing`
3. Make your changes
4. Run `npm run build` — it must pass with no TypeScript errors
5. Open a pull request against `dev`

Please include in your PR description:
- What you changed and why
- If it's a scoring rule change: your source or reasoning
- Screenshots if it's a visual change

---

## Questions

Open an Issue or use the suggestion form on the site. No question is too small — this style of Mahjong is not well-documented anywhere, so even "I think this rule is different" is worth raising.
