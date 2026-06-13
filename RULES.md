# Filipino-Chinese Mahjong Rules

The Taiwanese-derived style played in Philippine Chinese communities.
This is the source document for the rules. Edit this file to update rules — the website mirrors this content.

> **Heads up:** Rules vary by household. These are based on family memory. If something is wrong or missing, open an [Issue](https://github.com/rtyao/mahjongscore/issues) or use the suggestion form on the site.

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
- You cannot win on a tile you just used to complete a kang

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
5. **Floor at 50** (Go-ki-si-pa) — hands under 50 are bumped to 50
6. **Cap at 600** (Buan-oh) — hands at or over 600 are capped at 600
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

### Ping-oh — the all-run hand

If your base points total zero (all chows, non-scoring pair, no flowers/seasons, no special win condition), the formula is skipped entirely.

**Ping-oh pays a flat 300 / 600 for dealer.**

### Buan-oh — limit hands (600 / 1,200 for dealer)

The following hands automatically pay the maximum:

| Hand | Description |
|---|---|
| **All flowers + all seasons** | All 8 bonus tiles |
| **Full flush** | Entire hand is one suit, no honor tiles |
| **All terminals** | Every tile is a 1 or 9 only |
| **Big winds** | Pong of all 4 winds |
| **Small winds** | Pong of 3 winds (one must be your own seat wind) + pair of the 4th wind |
| **Big three dragons** | Pong of all 3 dragons |
| **Four kangs** | 4 declared kangs in one hand |
| **4 tai** | Any hand reaching 4 tai |

> **All honor tiles** (all winds + dragons, no suited tiles) — no consensus yet. Will update when confirmed.

---

## Score Floor & Cap

| Name | Amount | Notes |
|---|---|---|
| **Go-ki-si-pa** (minimum) | 50 / 100 dealer | Any hand under 50 is bumped to 50 |
| **Buan-oh** (maximum) | 600 / 1,200 dealer | Any hand at or over 600 is capped |

---

## Protective Rules

When a player is close to a big win, other players have restrictions:

- **3 kangs on the table**: other players may only discard tiles that are already visible — already discarded or in open sets on the table
- **3 tai**: other players may not discard dragons or the seat wind of the 3-tai player (these could give a 4th tai and trigger buan-oh)

---

## What's Still Unconfirmed

- All honor tiles hand (all winds + all dragons) — limit hand or not?

---

*Last updated: June 2026. Source: family knowledge. To suggest a correction, open an [Issue](https://github.com/rtyao/mahjongscore/issues).*
