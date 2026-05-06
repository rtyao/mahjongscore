# Changelog

All notable changes to Mahjong Score are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

---

## [v0.1.0] - 2026-05-05 - First Build

### The honest version
This is my first time setting this up, and to be honest I'm okay with the direction so far, structure and design. The machine works, but for me I think there's a lot of good items that I wasn't aware of/in my perspective until I saw it.

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
- Count badges - shows how many of each tile are in hand
- Group builder - set type (Pong/Chow/Kang/Pair), concealed toggle, kang type
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
- Rules page (structure only - content is all placeholder)
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

- Rules page content is entirely placeholder - no actual rule text yet
- Tile art is text/shape-based; no illustrated tile designs yet
- No share-a-hand feature (URL encoding)
- No hand auto-detection (must manually assign tiles to sets)
- CalculatorClient.tsx is too long (430 lines) - needs splitting
- Formspree form ID is a placeholder - suggestions form doesn't send yet
- No GitHub Pages deployment configured yet
- No domain set up yet (mahjongscore.me)
- Missing scoring rules: mixed flush, full flush, full limit hand list, four-kang rule
- Blessing of Heaven/Earth not implemented
- Special hands (all-dragons, all-winds) not auto-detected yet

### What I liked about v0.1
- Scoring engine is solid - the formula, ping-oh detection, and flat bonuses work correctly
- The breakdown table with tappable rules is the right UX direction
- MahjongTile renders clearly at all sizes
- Structure is great start so far, and it would have burned through three of my five brain cells to know how to arrange everything

### What I didn't like about v0.1
– I wanted the aesthetics and design to be cutesy and easy to understand, and while the colors were spot on, maybe it might need a redesign. It doesn't feel very human at the moment, and too minimalistic for enjoyment. Mahjong is fun, it's lively. Like you complain, you yell, you laugh, and so I want to make it more welcoming.
- Want to rewrite the text and descriptions to be more me. There are also grammar / spacing errors 
- The step 2 pick tiles has two items not working- the by suit/all, and add empty group (what is this?)
  - How do I fix the tile spacing? It feels a little too distant from each other when irl the tiles stack and align very nicely with each other
  - I would like to have a floating tray of the tiles that moves with the scroll of the page- how do you know what your tiles are? Can they be displayed and add a tile counter amount given that you shouldn't have less than 16 tiles.
- Flowers and seasons should be in the step 2, they are part of the full mahjong tileset. On the tray they can be maybe displayed smaller and above the row of tiles in hand
- Can I remove tiles easier? Not from step 3 but maybe putting a small x on the tile itself to remove
- Cannot clear hand quickly
- Hand builder is too manual - need auto-grouping from a tile pool
  - In addition to this, the current state of tiles is manually assigning each and every one of them a role. In step 3, it asks to organize the sets, without recognizing that it should have auto-sorted. The individual marking as pong/kang/chow can lead to some inconsistent scoring. If I mark three items as pong it currently scores them all as different pongs.
  - System does not detect winning through middle tile of chow
- Chows should not be displayed on the scoring
- The tile visuals are functional but not beautiful yet
- Rules page is all placeholder - most important content gap
- Mobile experience needs testing and tuning
- No way to share a hand result
- Too long of a scroll for the calculator. Need to find a way to be mobile friendly as well.

---

*Earlier history: initial project scaffolded with `create-next-app`, GitHub repo created, authentication configured.*
