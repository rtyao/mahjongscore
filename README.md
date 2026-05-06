# Mahjong Score

**Filipino-Chinese Mahjong: Rules, Scoring & Hand Calculator**

A web resource for the 16-tile Taiwanese-derived Mahjong style played in the Filipino-Chinese community, and not very well documented online. Built to preserve it.

🀄 **Live site:** [mahjongscore.me](https://mahjongscore.me) *(domain pending)*
📋 **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## What This Is

Most Mahjong resources online cover Hong Kong or Japanese Riichi style. This site covers the **Filipino-Chinese variant** — also called Taiwanese-style — which differs in key ways:

- You start with **16 tiles** and need 17 to win (5 sets + 1 pair)
- The scoring system uses **points + tai (multipliers)** rather than fan
- Flowers and seasons add individual points, and your own tile adds a tai
- Like HK style, there are limit and special hands, however they are slightly different. In addition, minimum scoring hands are given a flat payout.
- The banker pays and receives **double**

---

## Features

- **Score Calculator** — build a hand tile by tile, get the full score breakdown with rule explanations
- **Ping-oh detection** — automatically detects all-run hands (and near-misses)
- **Limit hand detection** — buan-oh threshold, minimum hand floor
- **Flat bonus tracking** — kang bonuses, self-draw bonuses shown separately
- **Rules pages** — in progress, beginner-friendly

---

## Running Locally

You need Node.js (v18+). If you use nvm: `nvm use 24` or similar.

```bash
git clone https://github.com/rtyao/mahjongscore.git
cd mahjongscore
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:
```bash
npm run build
npm run start
```

---

## Project Structure

```
src/
├── types/
│   └── mahjong.ts          # All TypeScript types (Tile, TileGroup, ScoreResult, etc.)
├── lib/
│   ├── tiles.ts            # All 42 unique tile definitions + helper functions
│   ├── scoring.ts          # The scoring engine — points, tai, formula, special hands
│   └── handDetection.ts    # Hand validation and auto-grouping algorithm
├── components/
│   ├── MahjongTile.tsx     # Visual tile component (renders all suit types)
│   ├── Navbar.tsx          # Responsive navigation
│   └── Footer.tsx          # Footer with links
└── app/
    ├── page.tsx            # Home
    ├── calculator/         # Score calculator (main feature)
    ├── rules/              # Rules guide (in progress)
    ├── about/              # About the project
    └── suggest/            # Suggestion / correction form
```

---

## Tech Stack

| Thing | What |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + CSS variables |
| Hosting | GitHub Pages (static export) |
| Forms | [Formspree](https://formspree.io) (contact/suggestions) |

No backend. Everything runs in the browser.

---

## Contributing

All contributions welcome — code, rule corrections, translations, tile art.

**If you know this Mahjong style and something is wrong:** open an [Issue](https://github.com/rtyao/mahjongscore/issues) or use the [suggestion form](https://mahjongscore.me/suggest) on the site.

**If you want to contribute code:** see [CONTRIBUTING.md](./CONTRIBUTING.md).

**Rules content** is the highest-value contribution right now. See the "In progress" sections on the Rules page — any verified information about:
- Mixed flush / full flush scoring
- Full list of limit hands
- Four-kang rule
- Regional variations

---

## Status

This project is **actively in development**. Content is being verified with family and is not guaranteed to be complete or accurate for every household's rules. See the [Changelog](./CHANGELOG.md) for version history.

---

## License

MIT — use it, fork it, build on it.
