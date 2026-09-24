# Mahjong Rules

This is the source document for the rules. Edit this file to update them — the website mirrors this content.

Two styles are covered:

- **Filipino-Chinese** (Taiwanese-derived, played in Philippine Chinese communities) — 16 tiles, 5 sets + a pair, scored as base points multiplied by tai.
- **Hong Kong** — 13 tiles, 4 sets + a pair, scored as a single fan count read off a payout table.

Everything from *The Tiles* down to *Winning* applies to both. After that each style has its own section.

**Contents**

- [The Tiles](#the-tiles) · [The Four Set Types](#the-four-set-types) · [How a Round Works](#how-a-round-works) · [Winning](#winning)
- [Filipino-Chinese Style](#filipino-chinese-style--whats-different)
- [Hong Kong Style](#hong-kong-style)

> **Heads up:** Rules vary by household and by table. The Filipino-Chinese rules here come from family memory. The Hong Kong rules follow the *Hong Kong Mahjong Rule Sheet* v1.0 (April 2025) by /u/danma. If something is wrong or missing, open an [Issue](https://github.com/rtyao/mahjongscore/issues) or use the suggestion form on the site.

---

## The Tiles

144 tiles total across 7 categories:

| Category | Tiles | Copies |
|---|---|---|
| Characters (萬 / Wan) | 1–9 | 4 each = 36 |
| Bamboo (條 / Tiao) | 1–9 | 4 each = 36 |
| Circles (餅 / Bing) | 1–9 | 4 each = 36 |
| Winds (East 東, South 南, West 西, North 北) | 4 types | 4 each = 16 |
| Dragons (Red 中, Green 發, White 白) | 3 types | 4 each = 12 |
| Flowers (梅蘭菊竹) | 4 tiles | 1 each = 4 |
| Seasons (春夏秋冬) | 4 tiles | 1 each = 4 |

- **Suited tiles**: Characters, Bamboo, Circles — numbered 1–9
- **Honor tiles**: Winds and Dragons — no number, cannot form sequences
- **Terminals**: The 1 and 9 of any suit — score the same as honor tiles
- **Flowers/Seasons**: Bonus tiles — kept aside, draw a replacement when you receive one

---

## The Four Set Types

| Set | Description |
|---|---|
| **Chow (順)** | 3 consecutive tiles of the same suit. Not available for winds/dragons. |
| **Pong (碰)** | 3 identical tiles. |
| **Kang (槓)** | 4 identical tiles. Draw an extra tile from the back of the wall. Earns a flat bonus. |
| **Pair (對)** | 2 identical tiles. Exactly one needed to complete a hand. |

A complete hand = **5 sets + 1 pair = 17 tiles**.

---

## How a Round Works

1. Dealer shuffles and deals **16 tiles** to each player
2. Set aside any flowers/seasons you received — draw replacement tiles for each one
3. Dealer draws a 17th tile to start the round
4. Each turn: draw from the wall, then discard one tile face-up
5. **Stealing a discard**: if a discard completes a set in your hand, you may steal it, lay the set face-up, then discard. Chows: left player only. Pongs/Kangs: anyone.
6. **Declaring Kang**: if you draw the 4th tile of a set you hold, declare kang, draw a bonus tile from the back wall, then discard
7. **Winning**: declare Mahjong when you have 5 complete sets + 1 pair

---

## Winning

- **Self-draw (Zi-mo / 自摸)**: you draw your winning tile — all three players pay you
- **Win on discard**: only the player who discarded pays you
- **Robbing the kang**: if another player adds a drawn tile to their revealed pong to declare a kang, and that tile is your winning tile, you may steal it and declare Mahjong
- **No minimum hand**: anyone can win on anything — there is no minimum score required to declare Mahjong. The go-ki-si-pa floor (50) is the base score for the smallest wins.

---

## Filipino-Chinese Style — What's Different

- **Hand size**: 16 tiles dealt, 17 to win (Hong Kong style is 13/14)
- **Tai system**: multipliers that double the score
- **More limit hands** than Hong Kong style

---

## The Scoring Formula

1. Add up all base points from sets, flowers, seasons, and win bonuses
2. `rawScore = ceil(basePoints × 4 / 10) × 10` — round up to nearest 10
3. Add 20 (the Mahjong win bonus)
4. Multiply by `2^tai` — each tai doubles the score
5. **Floor at 50** (Go-ki-si-pa 五起四趴) — hands under 50 are bumped to 50
6. **Cap at 600** (Buan-oh 滿胡) — hands at or over 600 are capped at 600
7. Flat bonuses are paid **separately** by each player, on top of the formula score

**Dealer rule**: the dealer (East wind) always pays and receives **double**.
- Dealer wins → all 3 players pay the dealer score
- Non-dealer wins → dealer pays doubled score, other two pay normal score
- Self-draw → all 3 players pay the winner

---

## Base Points

### Sets

| Set | Points | Concealed |
|---|---|---|
| Honor pong (wind or dragon) | 1 pt | ×2 = 2 pts |
| Terminal pong (1 or 9) | 1 pt | ×2 = 2 pts |
| Suited pong (2–8) | 0.5 pt | ×2 = 1 pt |
| Kang | pong pts ×4 | concealed doubles the pong base first |
| Chow | 0 pts | — |
| Pair: dragon, own wind, or terminal | 0.5 pts | — |
| Pair: any other tile | 0 pts | — |

### Flowers & Seasons

- Any flower or season tile: **1 pt each**

### Win Bonuses

| Condition | Points |
|---|---|
| Self-draw (Zi-mo) | +0.5 pts |
| Win by completing the pair | +0.5 pts |
| Win by middle tile of a sequence (Kanchan) | +0.5 pts |

### Hand Bonus

| Condition | Points |
|---|---|
| All pong hand (every set is a pong or kang, no chows) | +1 pt to hand total |

---

## Tai — Multipliers

Each tai **doubles** the score. 1 tai = ×2, 2 tai = ×4, 3 tai = ×8, 4 tai = automatic buan-oh.

| Condition | Tai |
|---|---|
| Dragon pong or kang | +1 tai |
| Own wind pong or kang | +1 tai |
| Own flower tile | +1 tai |
| Own season tile | +1 tai |
| Complete flower set — flower kang (all 4 flowers) | +1 tai |
| Complete season set — season kang (all 4 seasons) | +1 tai |
| Half flush (one suit + honor tiles) | +1 tai |
| 4 tai total | → automatic buan-oh |

> Own flower/season: flower #1 = East, #2 = South, #3 = West, #4 = North. Same for seasons.

---

## Flat Bonuses

Paid **separately** by each player, not part of the formula.

### Kang types

| Type | Bonus per player |
|---|---|
| Revealed kang (stole a tile to complete it) | +100 |
| Hidden kang / Am Kang (all 4 from your hand) | +200 |
| Starting kang / TTS (held all 4 from the deal) | +400 |

### Other flat bonuses

| Condition | Bonus per player |
|---|---|
| Self-draw (Zi-mo) | +100 |
| Complete flower set (flower kang) | +100 |
| Complete season set (season kang) | +100 |

---

## Flowers & Seasons

- Flower and season tiles are bonus tiles — set them aside, draw replacements
- **1 pt each** toward base points
- **Own flower/season** (matching your seat number): +1 tai
- **All 4 flowers** = flower kang: +1 tai + 100 flat per player
- **All 4 seasons** = season kang: +1 tai + 100 flat per player
- **All 4 flowers AND all 4 seasons** = automatic buan-oh + 200 flat (two kang bonuses). The player who completes the 8th tile may declare an immediate win.

---

## Special Hands & Limit Hands

### Ping-oh 平胡 — the all-run hand

If your base points total zero (all chows, non-scoring pair, no flowers/seasons, no special win condition), the formula is skipped entirely.

**Ping-oh pays a flat 300 / 600 for dealer.**

### Buan-oh 滿胡 — limit hands (600 / 1,200 for dealer)

The following hands automatically pay the maximum:

| Hand | Description |
|---|---|
| **Blessing of Heaven** | Dealer wins with their opening hand (first draw) |
| **Blessing of Earth** | Winning on the dealer's very first discard |
| **All flowers + all seasons** | All 8 bonus tiles |
| **Full flush** | Entire hand is one suit, no honor tiles |
| **All terminals** | Every tile is a 1 or 9 only |
| **Big winds** | Pong of all 4 winds |
| **Small winds** | Pong of 3 winds (one must be your own seat wind) + pair of the 4th wind |
| **Big three dragons** | Pong of all 3 dragons |
| **Four kangs** | 4 declared kangs in one hand |
| **All honours** | Only winds and dragons — no suited tiles at all |
| **4 tai** | Any hand reaching 4 tai |

---

## Score Floor & Cap

| Name | Amount | Notes |
|---|---|---|
| **Go-ki-si-pa 五起四趴** (minimum) | 50 / 100 dealer | Any hand under 50 is bumped to 50 |
| **Buan-oh 滿胡** (maximum) | 600 / 1,200 dealer | Any hand at or over 600 is capped |

---

## Protective Rules

When a player is close to a big win, other players have restrictions:

- **3 kangs on the table**: other players may only discard tiles that are already visible — already discarded or in open sets on the table
- **3 tai**: other players may not discard dragons or the seat wind of the 3-tai player (these could give a 4th tai and trigger buan-oh)

---

## Hong Kong Style

A different game from the Filipino-Chinese style, not a variation on it. The tiles are the same; almost nothing else is.

| | Filipino-Chinese | Hong Kong |
|---|---|---|
| Hand | 16 tiles, 17 to win — 5 sets + pair | 13 tiles, 14 to win — 4 sets + pair |
| Scoring | base points × tai multipliers | a single fan count |
| Payout | formula, floored at 50 and capped at 600 | fan read off a fixed table |
| Dealer | pays and collects **double** | **no bonus** — pays and collects like everyone else |
| Losing to a discard | the discarder pays your score | the discarder pays **double**, and pays alone |
| Round wind | not used | a triplet of it scores fan |
| Kong bonus | flat 100 / 200 / 400 | none |
| Concealed | doubles that set's points | 1 fan for the whole hand |

### How fan becomes points

Add up the fan for every feature your hand matches, then read across:

| Fan | Points | Fan | Points |
|---|---|---|---|
| 0 | 1 | 7 | 48 |
| 1 | 2 | 8 | 64 |
| 2 | 4 | 9 | 96 |
| 3 | 8 | 10 | 128 |
| 4 | 16 | 11 | 192 |
| 5 | 24 | 12 | 256 |
| 6 | 32 | 13+ | 384 |

**Paying out** — this table uses *discarder pays all*:

- **Self-pick**: all three other players each pay you the point value.
- **Won on a discard**: only the player who discarded pays, and they pay **double**.

A hand of 0 fan is a *chicken hand* (雞和) and is worth 1 point. Many tables set a **minimum fan** — commonly 3 — below which you are not allowed to declare a win at all. Agree on this before you start.

### Two rules that decide how fan combine

1. **A stronger hand replaces the weaker one in its family; they never stack.** Full Flush replaces Mixed Flush. Big Three Dragons replaces the per-dragon award. All Concealed Triplets replaces All Triplets.
2. **Mixed Terminals, All Terminals and All Honours already include All Triplets' 3 fan.** Those hands are all-triplet hands by definition, so the 3 fan is baked into their printed value — do not add it again.

Unless a rule says otherwise, triplets and kongs are interchangeable.

### Hand shape

| Fan | Hand | Meaning |
|---|---|---|
| 1 | All Sequences (平和) | Every set is a sequence. Worth only 1 fan, which on its own is usually below a table's minimum — see the note on minimum fan above |
| 3 | All Triplets (對對和) | Every set is a triplet or kong |
| 8 | ↳ All Concealed Triplets | All triplets, no tiles taken from other players. Only when you self-pick, or the discard completed your pair |
| 13 | ↳ All Quadruplets | All four sets are kongs |

### Suit

| Fan | Hand | Meaning |
|---|---|---|
| 3 | Mixed Flush (混一色) | One suit plus honour tiles |
| 7 | ↳ Full Flush (清一色) | One suit and nothing else |

### Terminals and honours

| Fan | Hand | Meaning |
|---|---|---|
| 4 | Mixed Terminals | Only ones, nines and honours (includes All Triplets' 3 fan) |
| 13 | ↳ All Terminals | Only ones and nines (includes All Triplets' 3 fan) |
| 10 | All Honours | Only honour tiles (includes All Triplets' 3 fan) |

### Dragons

| Fan | Hand | Meaning |
|---|---|---|
| 1 each | Dragon triplet | A triplet of dragons, scored per triplet |
| 5 | ↳ Small Three Dragons | Two dragon triplets and a pair of the third |
| 8 | ↳ Big Three Dragons | Triplets of all three dragons |

### Winds

| Fan | Hand | Meaning |
|---|---|---|
| 1 each | Round wind / seat wind triplet | A triplet that is both the round wind **and** your seat wind counts 2 fan |
| 6 | ↳ Small Four Winds | Three wind triplets and a pair of the fourth |
| 13 | ↳ Big Four Winds | Triplets of all four winds |

### Flowers and seasons

| Fan | Hand |
|---|---|
| 1 | No flowers or seasons at all |
| 1 each | A flower or season matching your seat number |
| 2 | All four flowers, or all four seasons — a flat 2, so holding both still scores 2 |
| 3 | Seven bonus tiles — you may declare an immediate win on the seventh |
| 8 | All eight bonus tiles — you may declare an immediate win on the eighth |

Seat numbering is the same as the Filipino-Chinese style: East is 1, South 2, West 3, North 4.

### Win actions

| Fan | Action | Meaning |
|---|---|---|
| 1 | Self-Pick (自摸) | You drew your winning tile from the wall |
| 1 | Concealed Hand (門前清) | You took no tiles from other players |
| 1 | Robbing the Kong (搶槓) | You won by interrupting another player upgrading a pong to a kong with your winning tile |
| 1 | Moon Under The Sea (海底撈月) | Your winning tile was the last tile in the wall, or the last discard |
| 2 | ↳ Win by Kong Replacement (槓上開花) | Your winning tile was the replacement drawn after calling a kong |
| 9 | ↳ Double Kong Replacement | You called a kong, called a second kong on the replacement, then won on that second replacement |

### Special hands

| Fan | Hand | Meaning |
|---|---|---|
| 13 | Blessing of Heaven (天和) | As dealer, your starting hand already wins |
| 13 | Blessing of Earth (地和) | As a non-dealer, you win on the dealer's first discard |
| 13 | Blessing of Man (人和) | As a non-dealer, you win on your first turn with a self-pick |
| 13 | Nine Gates (九蓮寶燈) | 1112345678999 of one suit, plus a 14th tile of that suit |
| 13 | Thirteen Orphans (十三么) | One of each terminal, wind and dragon, plus a 14th matching one of them |
| 4 | Seven Pairs (七對子) | Seven **different** pairs — four of a kind is not two pairs. Stacks with All Honours, Mixed Flush and Full Flush. *Only played at some tables.* |

### What the calculator does and doesn't cover

The calculator scores everything it can read off your tiles. Six fan depend on what happened at the table rather than on the hand itself, so there is nothing to detect — **Robbing the Kong, Moon Under The Sea, Win by Kong Replacement, Double Kong Replacement, and the three Blessings**. If one of those applies, add its fan to the calculator's total yourself.

Seven Pairs, Thirteen Orphans and Nine Gates are recognised from your tiles alone, so you do not need to group them into sets first.

---

## What's Still Unconfirmed

Nothing outstanding right now. Previously open questions, all since resolved:

- ~~All honour tiles (Filipino-Chinese) — limit hand or not?~~ **Confirmed buan-oh.**
- ~~Whether "All Flowers or All Seasons" awards 2 fan once or per group.~~ **Confirmed a flat 2.**
- ~~Whether All Sequences needs the extra conditions some HK tables add.~~ **Confirmed as written: all sets are sequences, 1 fan.**

---

*Last updated: September 21, 2026. Sources: family knowledge (Filipino-Chinese) and the Hong Kong Mahjong Rule Sheet v1.0 by /u/danma (Hong Kong). To suggest a correction, open an [Issue](https://github.com/rtyao/mahjongscore/issues).*
