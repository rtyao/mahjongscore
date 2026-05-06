# Changelog

All notable changes to Mahjong Score are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

---

## [v0.1.0] — 2026-05-05 — First Build

### The honest version
This is a first pass. The bones are right, the design direction is set,
and the scoring engine works. A lot of things need polish.

### What's in this version

**Scoring engine**
- Full point calculation: pongs, kangs, chows, pairs, flowers, seasons
- Tai (multiplier) system: dragons, own wind, own flower/season, complete sets
- Formula: `(points × 4, rounded up to 10) + 20 × 2^tai`
- Ping-oh detection (base points = 0 → flat 300/600)
- Buan-oh cap (≥600 → limit hand)
- Go-ki-si-pa floor (< 50 → minimum 50/100)
- Kang flat bonuses: revealed (+100), hidden am-kang (+200), TTS (+400)
- Zi-mo (self-draw) flat bonus (+100) and point bonus (+0.5)
- Win-by-pair and kanchan (middle tile) bonuses
- Flower/season complete set bonus (+2 tai + flat 100 each)
- Near ping-oh detection and explanation

**Calculator UI**
- Tile picker grid (Characters, Bamboo, Circles, Winds, Dragons)
- Count badges — shows how many of each tile are in hand
- Group builder — set type (Pong/Chow/Kang/Pair), concealed toggle, kang type
- Tap any tile to mark it as the ★ winning tile
- Flower/season picker (separate from main hand)
- Seat wind selector (East/South/West/North)
- Dealer toggle
- Mahjong / self-draw toggles
- Score panel with breakdown table
- Tap any row in the breakdown to see the rule that applied
- Near ping-oh notice when applicable

**Pages**
- Home with hero tiles, intro text, quick stats, feature cards
- Rules page (structure only — content is all placeholder)
- About page
- Suggest a Correction page (Formspree form, GitHub Issues link)
- Navbar (desktop + mobile hamburger)
- Footer with disclaimer

**Design**
- Jade (#4A8C6F) + Porcelain blue (#3A6B9F) + Cream (#FAF6EE) palette
- MahjongTile component renders all 42 unique tiles:
  - Characters: Chinese numerals (一二三四五六七八九) in dark red
  - Bamboo: stick segments in correct colors (jade hand tiles are green; 1-bamboo is a bird)
  - Circles: dot grid in blue
  - Winds/Dragons: Chinese characters, color-coded
  - White dragon: blue border tile
  - Flowers/Seasons: Chinese character + English abbreviation

### What's missing / known issues

- Rules page content is entirely placeholder — no actual rule text yet
- Tile art is text/shape-based; no illustrated tile designs yet
- No share-a-hand feature (URL encoding)
- No hand auto-detection (must manually assign tiles to sets)
- CalculatorClient.tsx is too long (430 lines) — needs splitting
- Formspree form ID is a placeholder — suggestions form doesn't send yet
- No GitHub Pages deployment configured yet
- No domain set up yet (mahjongscore.me)
- Missing scoring rules: mixed flush, full flush, full limit hand list, four-kang rule
- Blessing of Heaven/Earth not implemented
- Special hands (all-dragons, all-winds) not auto-detected yet

### What I liked about v0.1
- The color palette came out exactly right
- Scoring engine is solid — the formula, ping-oh detection, and flat bonuses work correctly
- The breakdown table with tappable rules is the right UX direction
- MahjongTile renders clearly at all sizes

### What I didn't like about v0.1
- Hand builder is too manual — need auto-grouping from a tile pool
- The tile visuals are functional but not beautiful yet
- Rules page is all placeholder — most important content gap
- Mobile experience needs testing and tuning
- No way to share a hand result

---

*Earlier history: initial project scaffolded with `create-next-app`, GitHub repo created, authentication configured.*
