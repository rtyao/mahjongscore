# Changelog

All notable changes to Mahjong Score are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

---

## [v0.2.1] - 2026-05-08 - Logic fixes & step reorder

### Reflection

One of the things I learned about creating a project is that there are so many intricacies with both mahjong, and the website building. I'm understanding slowly how to talk and communicate as part of this project, and I am identifying the gaps in my perception - for a lack of better term, this means what did I not see from before that's a problem now? Having a bird's eye view means you might miss the small details, which I am focusing on to make sure this calculator works well.

### What changed

**Calculator**
- Steps reordered - tiles first (step 1), build sets (step 2), then setup + win conditions (steps 3-4)
- Seat wind buttons now show Chinese characters (東南西北) above the English label
- Dealer changed from two-button toggle to a checkbox
- Score panel always shows both values - your score and what the other side pays, regardless of role

**Scoring**
- 0-point pairs no longer shown in the score breakdown
- Winning tile is now required before you can calculate a winning hand
- Blocked a logic contradiction: can't mark a winning tile as concealed and also claim win by discard

**Hand detection**
- Kang (4-of-a-kind) now detected by auto-detect - hands with kangs (17+n tiles) will resolve correctly
- Fixed greedy detection bug: overlapping run hands like 1/2/3 + 2/3/4 + 3/4/5 now sort correctly instead of failing

*The chow edge case was a priority sort problem - the algorithm was trying pong before chow on every tile, so three 3s would "consume" the 3s as a pong and leave {4,4,5} with no valid decomposition. Swapping to chow-first fixed it.*

### What Claude noticed can improve (still open)
- Manual kang grouping still needs a UI solution - "Add group manually" still creates an empty group with no way to put tiles into it
- Auto-detect still fails on 16-tile non-winning hands
- Limit hands not yet implemented

### What you (Caleb) noticed can improve (still open)
- Tray is small on desktop, could be more visible
- Near ping-oh currently only shows one reason when multiple apply
- Limit hands: 4 winds and all-dragon hands should auto-score at 600
- Non-winning hand detection - should identify finished sets and show partial scoring

---

## [v0.2.0] - 2026-05-05 - Calculator UX Overhaul

### What changed

**Calculator - major UX improvements**
- Floating hand tray at bottom of screen - shows all tiles in hand with live x/17 counter
- Each tile in the tray has a red x to remove it directly
- Flowers and seasons moved into Step 2 tile picker - no longer a separate section
- "By Suit / All" toggle now actually works (All is now the default view)
- Winds and Dragons combined into one "Special Tiles" row
- Auto-detect sets button - one tap sorts your hand into groups using the hand detection engine
- Chows removed from scoring breakdown (they score 0 - no reason to show them)
- Group size validation - mismatched groups no longer silently produce wrong scores
- Tile spacing tightened throughout
- "Reset" renamed to "Clear Hand"
- Quick guide updated to match new 6-step flow

### What Claude liked about v0.2
- Auto-detect dramatically reduces friction - hand setup went from 6+ manual steps to 3
- Floating tray solves the "what's in my hand" problem cleanly
- Scoring engine held up with no regressions after the refactor
- Removing chows from the breakdown makes it much easier to read

### What Claude noticed can improve
- Manual kang grouping is still broken - "+ Add group manually" creates an empty group with no way to put tiles in it
- Kang tile count logic needs updating - a hand with n kangs has 17+n tiles total
- Auto-detect still fails on 16-tile non-winning hands
- Hydration mismatch from browser extensions (cosmetic, but worth fixing)
- Tray tile badges clip on top edge - needs padding fix
- *Auto-detect chow edge case: greedy pong-first algorithm fails on hands like 1/2/3 + 2/3/4 + 3/4/5 - tries pong of 3, can't resolve remainder, returns null*
- *0-point pairs showing in breakdown even when they contribute nothing*

### What you (Caleb) liked about v0.2
- Calculator works much better, autosort is doing wonders
- Bottom tray and Clear Hand are very useful
- Scoring system is much cleaner
- Ping-oh detection is working well - edge cases where more than 1 reason applies are displayed well
- By Suit / All toggle change is great

### What you (Caleb) noticed can improve
- Floating tray tiles are cut off on the top edge
- Tray is small on desktop, could be more visible
- Calculator cannot accept kangs in the tile count - n kangs means 16+n tiles total (17+n if winning)
- Manual grouping button does nothing - empty group with no way to add tiles
- Logic inconsistency - can mark a winning tile from a concealed set and also set win by discard; those contradict each other
- Winning tile marking is optional but should probably be required for winning hands
- Auto-detect shows an error for 16-tile non-winning hands - should still be able to sort
- "Clear Hand" should also be on the floating tray
- Winds and Dragons could share one row
- Near ping-oh message only mentions the first reason when multiple conditions apply
- Step 1 seat wind buttons could show Chinese characters alongside English
- Dealer role button could be a checkbox - and should show the payout for both sides regardless of role
- Small question mark tooltip icons on key controls would help new players (especially Dealer)
- Limit hands not yet implemented - 4 winds (pong/kang of all winds) and 3 dragons are automatic 600
- Buan-oh shows full breakdown then says = 600 - should surface the limit hand status more clearly
- Step 1 Setup feels disconnected from win conditions - could be reorganized so players go straight to picking tiles

### Known issues - carried into v0.2.1
- Kang support (tile count logic + manual grouping workflow)
- Limit hands - 4 winds, all dragons
- Concealed set validation vs. win by discard
- Winning tile requirement for winning hands
- Auto-detect for 16-tile non-winning hands

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
