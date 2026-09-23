/**
 * hongkong.ts — Hong Kong Mahjong scoring engine
 *
 * 13 tiles in hand, 14 to win: 4 sets + 1 pair.
 * Source: "Hong Kong Mahjong Rule Sheet" v1.0 (April 2025) by /u/danma.
 *
 * Unlike the Taiwanese engine there are no base points and no tai. A hand's
 * worth is a single fan count, converted to points by a fixed table.
 *
 * TWO RULES FROM THE SHEET THAT SHAPE THIS CODE:
 *
 *   1. "Indented features replace the parent feature."
 *      A stronger hand REPLACES the weaker one in its family; they never stack.
 *      Full Flush (7) replaces Mixed Flush (3).
 *      Big Three Dragons (8) replaces the 1-fan-per-dragon-triplet award.
 *      All Quadruplets (13) / All Concealed Triplets (8) replace All Triplets (3).
 *
 *   2. Mixed Terminals, All Terminals and All Honours state that "3 Fan from
 *      All Triplets is included". Those hands are necessarily all-triplet
 *      hands, so the 3 fan is already inside their printed value. When such a
 *      hand is ALSO an upgraded triplet hand (concealed, or all kongs) only the
 *      amount above 3 is added on top — see applyIncludedTripletFan below.
 *
 * FAN FAMILIES (each family contributes at most one entry):
 *   Set shape:   All Quadruplets 13 > All Concealed Triplets 8 > All Triplets 3
 *                All Sequences 1 (separate branch — a hand is one or the other)
 *   Composition: All Terminals 13 > All Honours 10 > Mixed Terminals 4
 *   Suit:        Full Flush 7 > Mixed Flush 3
 *   Dragons:     Big Three 8 > Small Three 5 > 1 per dragon triplet
 *   Winds:       Big Four 13 > Small Four 6 > 1 per round/seat wind triplet
 *                (a triplet that is both round AND seat wind counts 2)
 *
 * STANDALONE LIMIT HANDS (13 fan, scored on their own):
 *   Thirteen Orphans, Nine Gates
 *
 * STACKING FAN (added on top of the families above):
 *   Seven Pairs 4 (variant-dependent), Self-Pick 1, Concealed Hand 1,
 *   flower and season awards
 *
 * NOT IN THE CALCULATOR (documented in RULES.md instead): these depend on the
 * situation at the table rather than the tiles, so there is nothing in a hand
 * to detect — Kong Replacement, Double Kong Replacement, Robbing the Kong,
 * Moon Under The Sea, and the three Blessings.
 *
 * PAYMENT — the sheet's "New Style" table uses discarder-pays-all:
 *   self-pick   → every other player pays the full points
 *   by discard  → the discarder alone pays double
 *   The dealer has no payout bonus in this system.
 */

import type { CalculatorState, HongKongScoreResult, FanItem, Tile } from '@/types/mahjong';
import { getTile, windToValue } from '../tiles';

// ── Fan → points ──────────────────────────────────────────────────

/** Points for 0..12 fan; 13 or more pays LIMIT_POINTS. */
const FAN_TABLE = [1, 2, 4, 8, 16, 24, 32, 48, 64, 96, 128, 192, 256];
const LIMIT_POINTS = 384;
export const LIMIT_FAN = 13;

export function fanToPoints(fan: number): number {
  if (fan >= LIMIT_FAN) return LIMIT_POINTS;
  return FAN_TABLE[Math.max(0, Math.floor(fan))];
}

// ── Whole-hand shapes, read straight from the tiles ───────────────
// These need no grouping, which also means the player can score them by
// picking tiles alone.

const ORPHAN_IDS = [
  'character-1', 'character-9',
  'bamboo-1', 'bamboo-9',
  'circle-1', 'circle-9',
  'wind-1', 'wind-2', 'wind-3', 'wind-4',
  'dragon-1', 'dragon-2', 'dragon-3',
];

function countById(tileIds: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const id of tileIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}

function isThirteenOrphans(tileIds: string[]): boolean {
  if (tileIds.length !== 14) return false;
  const counts = countById(tileIds);
  if (counts.size !== 13) return false;
  return ORPHAN_IDS.every(id => (counts.get(id) ?? 0) >= 1);
}

/** Seven DIFFERENT pairs — four of a kind does not count as two pairs. */
function isSevenPairs(tileIds: string[]): boolean {
  if (tileIds.length !== 14) return false;
  const counts = countById(tileIds);
  if (counts.size !== 7) return false;
  return [...counts.values()].every(n => n === 2);
}

/** 1112345678999 of one suit, plus any 14th tile of that same suit. */
function isNineGates(tiles: Tile[]): boolean {
  if (tiles.length !== 14) return false;
  if (tiles.some(t => t.isHonor || t.suit === 'flower' || t.suit === 'season')) return false;
  if (new Set(tiles.map(t => t.suit)).size !== 1) return false;
  const byValue = new Map<number, number>();
  for (const t of tiles) byValue.set(t.value, (byValue.get(t.value) ?? 0) + 1);
  if ((byValue.get(1) ?? 0) < 3) return false;
  if ((byValue.get(9) ?? 0) < 3) return false;
  for (let v = 2; v <= 8; v++) if ((byValue.get(v) ?? 0) < 1) return false;
  return true;
}

/**
 * True when the tiles alone form a hand that scores without being grouped
 * into sets. The calculator uses this to skip its "group your hand first"
 * and "mark your winning tile" prompts, neither of which applies here.
 */
export function hasStandaloneShape(tileIds: string[]): boolean {
  const tiles = tileIds
    .map(id => { try { return getTile(id); } catch { return null; } })
    .filter((t): t is Tile => t !== null);
  return isThirteenOrphans(tileIds) || isNineGates(tiles) || isSevenPairs(tileIds);
}

// ── Set analysis ──────────────────────────────────────────────────

interface CompletedSet {
  type: 'pong' | 'kang' | 'chow' | 'pair';
  tile: Tile;
}

function getCompletedSets(state: CalculatorState): CompletedSet[] {
  const sets: CompletedSet[] = [];
  for (const group of state.groups) {
    if (group.type === 'incomplete' || group.instanceIds.length === 0) continue;
    const tileId = state.instances.find(i => i.instanceId === group.instanceIds[0])?.tileId;
    if (!tileId) continue;
    try {
      sets.push({ type: group.type, tile: getTile(tileId) });
    } catch { /* unknown tile id — skip */ }
  }
  return sets;
}

// ── Main scoring function ─────────────────────────────────────────

export function calculateHongKong(state: CalculatorState): HongKongScoreResult {
  const seat = windToValue(state.seatWind);
  const round = windToValue(state.roundWind);
  const breakdown: FanItem[] = [];

  function push(label: string, fan: number, explanation: string, variantNote?: string) {
    if (fan > 0) breakdown.push({ label, fan, explanation, variantNote });
  }

  function finish(limitHand?: string): HongKongScoreResult {
    const fan = breakdown.reduce((sum, item) => sum + item.fan, 0);
    const points = fanToPoints(fan);
    return {
      style: 'hongkong',
      isValid: true,
      fan,
      points,
      selfDrawEachPays: points,
      discardPayerPays: points * 2,
      breakdown,
      limitHand,
      minimumFan: state.minimumFan,
      meetsMinimum: fan >= state.minimumFan,
    };
  }

  const handTiles = state.instances
    .map(i => { try { return getTile(i.tileId); } catch { return null; } })
    .filter((t): t is Tile => t !== null);
  const tileIds = handTiles.map(t => t.id);

  // Standalone limit hands pay the maximum on their own, so they short-circuit.
  if (state.isMahjong && isThirteenOrphans(tileIds)) {
    push('Thirteen Orphans', LIMIT_FAN, 'One of each terminal, wind and dragon, plus a 14th tile matching one of the other thirteen.');
    return finish('Thirteen Orphans');
  }
  if (state.isMahjong && isNineGates(handTiles)) {
    push('Nine Gates', LIMIT_FAN, '1112345678999 of a single suit, plus a 14th tile of the same suit.');
    return finish('Nine Gates');
  }

  const sets = getCompletedSets(state);
  const melds = sets.filter(s => s.type !== 'pair');
  const pairs = sets.filter(s => s.type === 'pair');
  let limitHand: string | undefined;

  // ── Set shape ───────────────────────────────────────────────────
  const winningInstanceId = state.instances.find(i => i.isWinningTile)?.instanceId;
  const wonOnPair = winningInstanceId
    ? state.groups.find(g => g.instanceIds.includes(winningInstanceId))?.type === 'pair'
    : false;

  const hasMelds = melds.length > 0;
  const allSequences = hasMelds && melds.every(s => s.type === 'chow');
  const allTriplets = hasMelds && melds.every(s => s.type === 'pong' || s.type === 'kang');
  const allQuadruplets = hasMelds && melds.every(s => s.type === 'kang');
  // The sheet restricts this to self-pick, or a discard that completed the pair —
  // any other discard means the final triplet used another player's tile.
  const allConcealedTriplets = allTriplets && state.isConcealedHand && (state.isSelfDraw || wonOnPair);

  let shapeFan = 0;
  let shapeLabel = '';
  let shapeExplanation = '';
  if (allQuadruplets) {
    shapeFan = 13; shapeLabel = 'All Quadruplets';
    shapeExplanation = 'Every set is a kong. Replaces All Triplets.';
  } else if (allConcealedTriplets) {
    shapeFan = 8; shapeLabel = 'All Concealed Triplets';
    shapeExplanation = 'Every set is a triplet with no tiles taken from other players. Replaces All Triplets.';
  } else if (allTriplets) {
    shapeFan = 3; shapeLabel = 'All Triplets';
    shapeExplanation = 'Every set is a triplet or a kong.';
  } else if (allSequences) {
    shapeFan = 1; shapeLabel = 'All Sequences';
    shapeExplanation = 'Every set is a sequence.';
  }

  // ── Composition: terminals and honours ──────────────────────────
  const hasTiles = handTiles.length > 0;
  const suited = handTiles.filter(t => !t.isHonor);
  const suitsUsed = new Set(suited.map(t => t.suit));

  const allHonours = hasTiles && suited.length === 0;
  const allTerminals = hasTiles && handTiles.every(t => t.isTerminal);
  const mixedTerminals = hasTiles && !allTerminals && !allHonours
    && handTiles.every(t => t.isTerminal || t.isHonor);

  let compositionFan = 0;
  if (allTerminals) {
    compositionFan = 13;
    limitHand = 'All Terminals';
    push('All Terminals', 13, 'Your hand contains only ones and nines. The 3 fan from All Triplets is included.');
  } else if (allHonours) {
    compositionFan = 10;
    push('All Honours', 10, 'Your hand contains only honour tiles. The 3 fan from All Triplets is included.');
  } else if (mixedTerminals) {
    compositionFan = 4;
    push('Mixed Terminals', 4, 'Your hand contains only ones, nines and honours. The 3 fan from All Triplets is included.');
  }

  // Rule 2 from the header: those hands already contain All Triplets' 3 fan, so
  // an upgraded triplet hand only adds the amount above 3.
  if (compositionFan > 0 && (allTriplets || allQuadruplets || allConcealedTriplets)) {
    const excess = shapeFan - 3;
    if (excess > 0) {
      push(`${shapeLabel} (above the 3 fan already counted)`, excess,
        `${shapeExplanation} The basic 3 fan is already inside the composition score above, so only the extra ${excess} fan is added here.`);
    }
  } else {
    push(shapeLabel, shapeFan, shapeExplanation);
  }
  if (allQuadruplets && shapeFan === 13) limitHand ??= 'All Quadruplets';

  // ── Suit ────────────────────────────────────────────────────────
  if (hasTiles && suited.length > 0 && suitsUsed.size === 1) {
    const honourCount = handTiles.length - suited.length;
    if (honourCount === 0) {
      push('Full Flush', 7, 'Your hand contains only one suit. Replaces Mixed Flush.');
    } else {
      push('Mixed Flush', 3, 'Your hand contains only one suit plus honours.');
    }
  }

  // ── Dragons ─────────────────────────────────────────────────────
  const dragonMelds = melds.filter(s => s.tile.suit === 'dragon');
  const dragonPair = pairs.find(p => p.tile.suit === 'dragon');
  if (dragonMelds.length === 3) {
    push('Big Three Dragons', 8, 'Triplets of all three dragons. Replaces the per-dragon award.');
  } else if (dragonMelds.length === 2 && dragonPair) {
    push('Small Three Dragons', 5, 'Two dragon triplets and a pair of the third dragon. Replaces the per-dragon award.');
  } else {
    for (const d of dragonMelds) {
      push(`Triplet of ${d.tile.englishLabel}`, 1, 'A triplet of dragon tiles scores 1 fan each.');
    }
  }

  // ── Winds ───────────────────────────────────────────────────────
  const windMelds = melds.filter(s => s.tile.suit === 'wind');
  const windPair = pairs.find(p => p.tile.suit === 'wind');
  if (windMelds.length === 4) {
    limitHand ??= 'Big Four Winds';
    push('Big Four Winds', 13, 'Triplets of all four winds. Replaces the per-wind award.');
  } else if (windMelds.length === 3 && windPair) {
    push('Small Four Winds', 6, 'Three wind triplets and a pair of the fourth wind. Replaces the per-wind award.');
  } else {
    for (const w of windMelds) {
      const isRound = w.tile.value === round;
      const isSeat = w.tile.value === seat;
      const fan = (isRound ? 1 : 0) + (isSeat ? 1 : 0);
      if (fan === 0) continue;
      const why = isRound && isSeat
        ? 'This triplet is both the round wind and your seat wind, so it counts 2 fan.'
        : isRound ? 'A triplet of the round wind scores 1 fan.' : 'A triplet of your seat wind scores 1 fan.';
      push(`Triplet of ${w.tile.englishLabel}`, fan, why);
    }
  }

  // ── Seven Pairs ─────────────────────────────────────────────────
  if (isSevenPairs(tileIds)) {
    push('Seven Pairs', 4, 'Seven different pairs. Stacks with All Honours, Mixed Flush and Full Flush.',
      'Only played at some tables — check before counting it.');
  }

  // ── Win actions ─────────────────────────────────────────────────
  if (state.isMahjong && state.isSelfDraw) {
    push('Self-Pick', 1, 'You drew your own winning tile from the wall.');
  }
  if (state.isMahjong && state.isConcealedHand) {
    push('Concealed Hand', 1, 'You took no tiles from other players on the way to winning.');
  }

  // ── Flowers and seasons ─────────────────────────────────────────
  const bonusCount = state.flowers.length + state.seasons.length;
  if (bonusCount === 0) {
    push('No Flowers or Seasons', 1, 'A hand with no bonus tiles scores 1 fan.');
  } else {
    if (state.flowers.includes(seat)) {
      push('Seat Flower', 1, 'The flower matching your seat number scores 1 fan.');
    }
    if (state.seasons.includes(seat)) {
      push('Seat Season', 1, 'The season matching your seat number scores 1 fan.');
    }
    if (state.flowers.length === 4) {
      push('All Flowers', 2, 'Holding all four flowers scores 2 fan.');
    }
    if (state.seasons.length === 4) {
      push('All Seasons', 2, 'Holding all four seasons scores 2 fan.');
    }
    if (bonusCount === 7) {
      push('Seven Flowers', 3, 'Seven bonus tiles. You may also declare an immediate win on the seventh.');
    } else if (bonusCount === 8) {
      push('Eight Flowers', 8, 'All eight bonus tiles. You may also declare an immediate win on the eighth.');
    }
  }

  // limitHand names an actual 13-fan hand. A hand that merely reaches 13 fan by
  // stacking still pays the maximum, which the score panel reads off `fan`.
  return finish(limitHand);
}
