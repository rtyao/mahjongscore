# Changelog

All notable changes to Mahjong Score are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

---

## [v0.3.0] - in progress

### Reflection

One of the things I learned about creating a project is that there are so many intricacies with both mahjong, and the website building. I'm understanding slowly how to talk and communicate as part of this project, and I am identifying the gaps in my perception - for a lack of better term, this means what did I not see from before that's a problem now? Having a bird's eye view means you might miss the small details, which I am focusing on to make sure this calculator works well.

---

### What I liked

- The floating tile tray is great. I love it a lot, helps with the functionality. Would love it to be bigger / more visible because it's the same size as the tiles right now, and on the computer it's small. But it does not clip and shows everything which is great.
- Love the clear hand on both the floating tray and the bottom - it helps with the functionality.
- The re-arrangement of the tiles (adding the flower tiles to step 2, merging dragons and winds to form special tiles) is really a great change visually and makes it clearer for the audience. One thing I noticed is that I really like the "All" display view ahead of the "By Suit" section - maybe want to do that first, cuz rn the default is "By Suit" then "All."
- The auto-detect for sets has been great.
- Seems like there was a mini-patch and it did fix the buan-oh problem - it shows the calculations and says "capped at 600" which is so far good.
- Ping-oh explanation for edge cases (where there were more than 1 reason for not getting it) is displayed well.

---

### Scoring & Logic

**Kang - still broken, needs full fix:**

- When a player (regardless if they won) has a kang, the amount of sets to win are the same yet the final tile amount will be +1, so for n kangs (up to 5 cuz 5 sets) total amount of tiles is 16+n, or 17+n for win. Right now, the system does not allow more than 17 tiles to be placed for winning or 16 for losing hand, and cannot detect kang as well - currently says "cannot detect sets."
- Manual grouping does not work either. It just says "what type of set" without putting any tiles into it, so there's nowhere to go from there.

*The root problem: `detectHand` in `handDetection.ts` never attempts kang - only pong and chow. And the "Add group manually" button creates an empty group with no UI to assign tiles into it. Two separate fixes needed.*

**Other logic issues:**

- The system on step 3 still has trouble detecting non-finished hands for losing - a non-winning hand is not computable at the moment. Would be ideal to identify all finished sets and go from there, since it can't detect a hand when losing.
- When a user selects their win condition on step 4, selecting the winning tile is not mandatory for winners. It should be.
- There's a logic gap: currently able to select the winning tile from a concealed set and click "win from discard." Logically, if you steal a tile to win, it is not concealed anymore.
- Auto-detect: wondering about edge cases where multiple chows might get incorrectly detected as a pong - e.g. 1/2/3, 2/3/4, 3/4/5, would it set a pong of 3?
- Can the pair, if it's a 0-pointer, not be displayed in the scoring breakdown?

*Confirmed on the chow edge case - the detection algorithm is greedy and tries pong before chow on every tile. A hand like 1/2/3 + 2/3/4 + 3/4/5 would fail: it tries pong of 3 first, leaves {4,4,5} which can't form a set, and returns null instead of backtracking correctly. Fix: try chow before pong, or restructure the search.*

*The 0-point pair: one-line fix in `scoring.ts` - just filter it from the breakdown if `pts === 0`.*

---

### Step 1 - Setup (QoL)

- Can we put the Chinese wind character for each seat?
- For the dealer role button, maybe make it a checkbox instead. So it will have some variety.
- The score display for dealer vs non-dealer is a little weird. Maybe the dealer score size should be bigger.
- Would like the dealer payout shown regardless of position - it shows how much the dealer pays out to this person.
- Thinking of doing a carousel/rotating choice for seat wind on mobile, but probably later when we push a mobile-friendly update.

*Currently the dealer score only appears if `isDealer` is true. Should always show both so you know the payout in either direction.*

---

### Layout & Structure

- Maybe: can setup and win-con be in the last part? I think users would like to immediately select their tiles, and then all the buttons will be part of it later. So although logically the setup is before the tiles in the game, let them select tiles first and then move towards the scoring adjustments.

*Agreed - step 1 (Setup) and step 4 (Win Conditions) are both configuration. Tiles are the action. Restructuring to: tiles first, then setup + win-con before calculate, would feel more natural.*

---

### Known issues / coming in this update

- Kang support - tile count logic + detection + manual grouping workflow
- Auto-detect chow edge case - greedy pong-first algorithm fails on some valid hands
- Non-winning hand detection
- Concealed set + win from discard validation
- Winning tile required for winning hands
- 0-point pair hidden from breakdown
- Default tile picker view changed to "All"
- Dealer payout always visible
- Chinese wind characters in step 1
- Step reordering - tiles first

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

### What you (Caleb) liked about v0.2
- Calculator works much better, autosort is doing wonders
- Bottom tray and Clear Hand are very useful
- Scoring system is much cleaner
- Ping-oh detection is working well
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
- Small question mark tooltip icons on key controls would help new players (especially Dealer)
- Limit hands not yet implemented - 4 winds (pong/kang of all winds) and 3 dragons are automatic 600
- Buan-oh shows full breakdown then says = 600 - should surface the limit hand status more clearly
- Step 1 Setup feels disconnected from win conditions - could be reorganized so players go straight to picking tiles

### Known issues / coming in next update
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
