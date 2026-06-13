/**
 * scoring.ts — Filipino-Chinese Mahjong scoring engine
 *
 * FORMULA (applied in calculateScore):
 *   1. Sum base points from each set, flowers, seasons, and win bonuses
 *   2. rawScore = ceil(basePoints × 4 / 10) × 10   (round up to nearest 10)
 *   3. score = rawScore + 20  (if mahjong win)
 *   4. score = score × 2^tai  (tai = multiplier count)
 *   5. Floor at 50 (go-ki-si-pa), cap at 600 (buan-oh)
 *   6. Flat bonuses (kang types, zi-mo) are added AFTER and paid separately by each player
 *
 * SPECIAL CASE — ping-oh: if basePoints === 0, skip formula → 300 flat (600 for dealer)
 *
 * BASE POINTS per set:
 *   Honor/terminal pong:  1 pt (×2 if concealed)
 *   Suited pong:          0.5 pt (×2 if concealed)
 *   Kang = pong score × 4
 *   Chow:                 0 pt always
 *   Pair:                 0.5 pt if dragon, own wind, or terminal; else 0
 *   Flower/season:        1 pt each
 *   All pong hand:        +1 pt to hand total (no chows in any set)
 *
 * TAI (multipliers) — each tai doubles the score (×2^n total):
 *   Any dragon pong/kang:           +1 tai
 *   Own wind pong/kang:             +1 tai
 *   Own flower tile:                +1 tai
 *   Own season tile:                +1 tai
 *   Complete flower set (×4):       +1 tai
 *   Complete season set (×4):       +1 tai
 *   Half flush (one suit + honors): +1 tai
 *   4 tai total:                    → automatic buan-oh
 *
 * FLAT BONUSES (each player pays separately, outside the formula):
 *   Revealed kang:  +100
 *   Hidden kang:    +200
 *   TTS kang:       +400 (held all 4 from the deal)
 *   Complete flower/season set: +100 each
 *   Self-draw (zi-mo): +100
 *
 * LIMIT HANDS (automatic buan-oh, 600 / 1200 for dealer):
 *   All flowers + all seasons (8 bonus tiles total)
 *   Full flush (one suit, no honors)
 *   All terminals (only 1s and 9s)
 *   Big winds (pong all 4 winds)
 *   Small winds (3 wind pongs incl. own seat wind + pair of 4th wind)
 *   Big three dragons (pong all 3 dragons)
 *   Four kangs
 *   4 tai (score naturally exceeds 600 via formula)
 */

import type { CalculatorState, ScoreResult, ScoreBreakdownItem, FlatBonus, KangType, Tile } from '@/types/mahjong';
import { getTile, windToValue } from './tiles';

// ── Base scoring helpers ──────────────────────────────────────────

function getPongBasePoints(tileId: string): number {
  const tile = getTile(tileId);
  if (tile.isHonor || tile.isTerminal) return 1;
  return 0.5;
}

function getSetPoints(tileId: string, type: 'pong' | 'kang', concealed: boolean): number {
  let base = getPongBasePoints(tileId);
  if (concealed) base *= 2;
  if (type === 'kang') base *= 4;
  return base;
}

function getSetTai(tileId: string, seatWindValue: number): number {
  const tile = getTile(tileId);
  if (tile.suit === 'dragon') return 1;
  if (tile.suit === 'wind' && tile.value === seatWindValue) return 1;
  return 0;
}

function getPairPoints(tileId: string, seatWindValue: number): number {
  const tile = getTile(tileId);
  if (tile.suit === 'dragon') return 0.5;
  if (tile.suit === 'wind' && tile.value === seatWindValue) return 0.5;
  if (tile.isTerminal) return 0.5;
  return 0;
}

function kangTypeLabel(kt: KangType): string {
  return { revealed: 'Revealed Kang', hidden: 'Hidden Kang (Am Kang)', tts: 'Starting Kang (TTS)' }[kt];
}

function kangFlatAmount(kt: KangType): number {
  return { revealed: 100, hidden: 200, tts: 400 }[kt];
}

function pongExplanation(tileId: string, concealed: boolean, tai: number, seatWindValue: number): string {
  const tile = getTile(tileId);
  const parts: string[] = [];
  if (tile.isHonor) parts.push('Honor tile = 1 pt base');
  else if (tile.isTerminal) parts.push('Terminal (1 or 9) = 1 pt base');
  else parts.push('Suited tile = 0.5 pt base');
  if (concealed) parts.push('concealed ×2');
  if (tai > 0) {
    if (tile.suit === 'dragon') parts.push('dragon = 1 tai (×2 multiplier)');
    else parts.push(`your wind = 1 tai (×2 multiplier)`);
  }
  return parts.join(' · ');
}

function kangExplanation(tileId: string, concealed: boolean, tai: number, seatWindValue: number): string {
  return `Kang = pong points ×4. ${pongExplanation(tileId, concealed, tai, seatWindValue)}`;
}

function pairExplanation(tileId: string, seatWindValue: number): string {
  const tile = getTile(tileId);
  if (tile.suit === 'dragon') return 'Dragon pair = 0.5 pts.';
  if (tile.suit === 'wind' && tile.value === seatWindValue) return 'Your own wind pair = 0.5 pts.';
  if (tile.isTerminal) return 'Terminal pair (1 or 9) = 0.5 pts.';
  return 'Non-special pair = 0 pts.';
}

// ── Special hand detection ────────────────────────────────────────

function getGroupTileObj(state: CalculatorState, group: { instanceIds: string[] }): Tile | null {
  const tileId = state.instances.find(i => i.instanceId === group.instanceIds[0])?.tileId;
  if (!tileId) return null;
  try { return getTile(tileId); } catch { return null; }
}

function isAllPongHand(state: CalculatorState): boolean {
  return state.groups
    .filter(g => g.type !== 'incomplete' && g.instanceIds.length > 0)
    .every(g => g.type === 'pong' || g.type === 'kang' || g.type === 'pair');
}

type FlushType = 'none' | 'half' | 'full';
function detectFlush(state: CalculatorState): FlushType {
  const groups = state.groups.filter(g => g.type !== 'incomplete' && g.instanceIds.length > 0);
  const tiles = groups.map(g => getGroupTileObj(state, g)).filter((t): t is Tile => t !== null);
  const suitedTiles = tiles.filter(t => t.suit === 'character' || t.suit === 'bamboo' || t.suit === 'circle');
  if (suitedTiles.length === 0) return 'none';
  const suits = new Set(suitedTiles.map(t => t.suit));
  if (suits.size > 1) return 'none';
  const hasHonors = tiles.some(t => t.suit === 'wind' || t.suit === 'dragon');
  return hasHonors ? 'half' : 'full';
}

function isAllTerminals(state: CalculatorState): boolean {
  const groups = state.groups.filter(g => g.type !== 'incomplete' && g.instanceIds.length > 0);
  const tiles = groups.map(g => getGroupTileObj(state, g)).filter((t): t is Tile => t !== null);
  return tiles.length > 0 && tiles.every(t => t.isTerminal);
}

function countKangs(state: CalculatorState): number {
  return state.groups.filter(g => g.type === 'kang').length;
}

function isBigThreeDragons(state: CalculatorState): boolean {
  const dragonPongs = state.groups.filter(g => {
    if (g.type !== 'pong' && g.type !== 'kang') return false;
    return getGroupTileObj(state, g)?.suit === 'dragon';
  });
  return dragonPongs.length === 3;
}

function isBigWinds(state: CalculatorState): boolean {
  const windPongs = state.groups.filter(g => {
    if (g.type !== 'pong' && g.type !== 'kang') return false;
    return getGroupTileObj(state, g)?.suit === 'wind';
  });
  return windPongs.length === 4;
}

function isSmallWinds(state: CalculatorState, seatWindValue: number): boolean {
  const windPongs = state.groups.filter(g => {
    if (g.type !== 'pong' && g.type !== 'kang') return false;
    return getGroupTileObj(state, g)?.suit === 'wind';
  });
  if (windPongs.length !== 3) return false;
  const hasOwnWind = windPongs.some(g => getGroupTileObj(state, g)?.value === seatWindValue);
  if (!hasOwnWind) return false;
  const pairGroup = state.groups.find(g => g.type === 'pair');
  if (!pairGroup) return false;
  const pairTile = getGroupTileObj(state, pairGroup);
  const pongWindValues = new Set(windPongs.map(g => getGroupTileObj(state, g)?.value));
  return pairTile?.suit === 'wind' && !pongWindValues.has(pairTile.value);
}

// ── Main scoring function ─────────────────────────────────────────

export function calculateScore(state: CalculatorState): ScoreResult {
  const seatWindValue = windToValue(state.seatWind);
  const breakdown: ScoreBreakdownItem[] = [];
  const flatBonuses: FlatBonus[] = [];
  let basePoints = 0;
  let tai = 0;

  // Find the group that contains the winning tile
  const winningInstanceId = state.instances.find(i => i.isWinningTile)?.instanceId;
  const winningGroup = winningInstanceId
    ? state.groups.find(g => g.instanceIds.includes(winningInstanceId))
    : undefined;

  for (const group of state.groups) {
    if (group.type === 'incomplete' || group.instanceIds.length === 0) continue;
    const tileId = state.instances.find(i => i.instanceId === group.instanceIds[0])?.tileId;
    if (!tileId) continue;

    if (group.type === 'chow') {
      if (group.instanceIds.length !== 3) continue;
      let kanchan = false;
      if (winningGroup?.id === group.id && winningInstanceId) {
        const pos = group.instanceIds.indexOf(winningInstanceId);
        kanchan = pos === 1;
      }
      if (kanchan) {
        basePoints += 0.5;
        breakdown.push({ label: 'Won with middle tile (Kanchan)', points: 0.5, tai: 0, explanation: 'Winning by completing the middle of a sequence adds 0.5 points.' });
      }
      continue;
    }

    if (group.type === 'pong') {
      if (group.instanceIds.length !== 3) continue;
      const pts = getSetPoints(tileId, 'pong', group.concealed);
      const t = getSetTai(tileId, seatWindValue);
      basePoints += pts;
      tai += t;
      breakdown.push({ label: `Pong of ${getTile(tileId).englishLabel}${group.concealed ? ' (concealed)' : ''}`, points: pts, tai: t, explanation: pongExplanation(tileId, group.concealed, t, seatWindValue) });
    }

    if (group.type === 'kang') {
      if (group.instanceIds.length !== 4) continue;
      const pts = getSetPoints(tileId, 'kang', group.concealed);
      const t = getSetTai(tileId, seatWindValue);
      basePoints += pts;
      tai += t;
      breakdown.push({ label: `Kang of ${getTile(tileId).englishLabel}${group.concealed ? ' (concealed)' : ''}`, points: pts, tai: t, explanation: kangExplanation(tileId, group.concealed, t, seatWindValue) });
      flatBonuses.push({ label: kangTypeLabel(group.kangType), amount: kangFlatAmount(group.kangType) });
    }

    if (group.type === 'pair') {
      if (group.instanceIds.length !== 2) continue;
      const pts = getPairPoints(tileId, seatWindValue);
      basePoints += pts;
      if (pts > 0) breakdown.push({ label: `Pair of ${getTile(tileId).englishLabel}`, points: pts, tai: 0, explanation: pairExplanation(tileId, seatWindValue) });
      if (winningGroup?.id === group.id) {
        basePoints += 0.5;
        breakdown.push({ label: 'Won with pair', points: 0.5, tai: 0, explanation: 'Completing the pair as the winning tile adds 0.5 points.' });
      }
    }
  }

  // All pong hand bonus
  if (state.isMahjong && isAllPongHand(state)) {
    basePoints += 1;
    breakdown.push({ label: 'All pong hand', points: 1, tai: 0, explanation: 'Every set is a pong or kang (no chows) — +1 base point.' });
  }

  // Half flush
  const flushType = detectFlush(state);
  if (flushType === 'half') {
    tai += 1;
    breakdown.push({ label: 'Half flush', points: 0, tai: 1, explanation: 'All suited tiles are the same suit, plus honor tiles — +1 tai.' });
  }

  // Flowers
  for (const flowerVal of state.flowers) {
    basePoints += 1;
    const isOwn = flowerVal === seatWindValue;
    if (isOwn) tai += 1;
    breakdown.push({ label: `Flower ${flowerVal}${isOwn ? ' ★' : ''}`, points: 1, tai: isOwn ? 1 : 0, explanation: isOwn ? 'Your own flower = 1 pt + 1 tai.' : 'Flower tile = 1 pt.' });
  }
  const hasAllFlowers = state.flowers.length === 4;
  if (hasAllFlowers) {
    tai += 1;
    flatBonuses.push({ label: 'Complete flower set (flower kang)', amount: 100 });
    breakdown.push({ label: 'Complete flower set! (flower kang)', points: 0, tai: 1, explanation: 'All 4 flowers (flower kang): +1 tai + 100 flat bonus from each player.' });
  }

  // Seasons
  for (const seasonVal of state.seasons) {
    basePoints += 1;
    const isOwn = seasonVal === seatWindValue;
    if (isOwn) tai += 1;
    breakdown.push({ label: `Season ${seasonVal}${isOwn ? ' ★' : ''}`, points: 1, tai: isOwn ? 1 : 0, explanation: isOwn ? 'Your own season = 1 pt + 1 tai.' : 'Season tile = 1 pt.' });
  }
  const hasAllSeasons = state.seasons.length === 4;
  if (hasAllSeasons) {
    tai += 1;
    flatBonuses.push({ label: 'Complete season set (season kang)', amount: 100 });
    breakdown.push({ label: 'Complete season set! (season kang)', points: 0, tai: 1, explanation: 'All 4 seasons (season kang): +1 tai + 100 flat bonus from each player.' });
  }

  // Self-draw bonus
  if (state.isMahjong && state.isSelfDraw) {
    basePoints += 0.5;
    flatBonuses.push({ label: 'Self-draw (Zi-mo)', amount: 100 });
    breakdown.push({ label: 'Self-draw (Zi-mo)', points: 0.5, tai: 0, explanation: 'Drawing your own winning tile: +0.5 pts + 100 flat bonus from each player.' });
  }

  // Ping-oh: base points = 0 → flat 300/600
  const isPingOh = state.isMahjong && basePoints === 0;
  if (isPingOh) {
    return {
      isValid: true,
      isPingOh: true,
      isBuanOh: false,
      isMinimumHand: false,
      basePoints: 0,
      tai: 0,
      finalScore: 300,
      dealerScore: 600,
      breakdown,
      flatBonuses,
      nearPingOh: false,
      specialHand: 'Ping-oh (All-run hand) — 300 / 600',
    };
  }

  // Limit hand detection — checked in priority order
  let specialHand: string | undefined;
  if (state.isMahjong) {
    if (hasAllFlowers && hasAllSeasons)          specialHand = 'All flowers + all seasons — automatic buan-oh';
    else if (flushType === 'full')               specialHand = 'Full flush — automatic buan-oh';
    else if (isAllTerminals(state))              specialHand = 'All terminals — automatic buan-oh';
    else if (isBigWinds(state))                  specialHand = 'Big winds — automatic buan-oh';
    else if (isSmallWinds(state, seatWindValue)) specialHand = 'Small winds — automatic buan-oh';
    else if (isBigThreeDragons(state))           specialHand = 'Big three dragons — automatic buan-oh';
    else if (countKangs(state) >= 4)             specialHand = 'Four kangs — automatic buan-oh';
  }

  if (specialHand) {
    return {
      isValid: true,
      isPingOh: false,
      isBuanOh: true,
      isMinimumHand: false,
      basePoints,
      tai,
      finalScore: 600,
      dealerScore: 1200,
      breakdown,
      flatBonuses,
      nearPingOh: false,
      specialHand,
    };
  }

  // Formula: (base × 4, round up to nearest 10) + 20 if mahjong, then × 2^tai
  const step1 = Math.ceil((basePoints * 4) / 10) * 10;
  const step2 = state.isMahjong ? step1 + 20 : step1;
  const step3 = step2 * Math.pow(2, tai);

  // 4 tai always results in ≥600 naturally, but guard explicitly
  const isBuanOh = state.isMahjong && (step3 >= 600 || tai >= 4);
  const isMinimumHand = state.isMahjong && step3 < 50 && step3 > 0;

  const finalScore = isBuanOh ? 600 : isMinimumHand ? 50 : Math.round(step3);
  const dealerScore = finalScore * 2;

  // Near ping-oh detection
  let nearPingOh = false;
  let nearPingOhReason: string | undefined;
  const allSetsAreChowsOrPair = state.groups.every(g => g.type === 'chow' || g.type === 'pair' || g.type === 'incomplete');
  if (!isPingOh && allSetsAreChowsOrPair && basePoints > 0 && basePoints <= 1.5) {
    nearPingOh = true;
    const reasons: string[] = [];
    if (state.flowers.length > 0 || state.seasons.length > 0) reasons.push('bonus tile(s)');
    if (state.isSelfDraw) reasons.push('self-draw');
    if (winningGroup?.type === 'pair') reasons.push('win-by-pair bonus');
    const winningInChow = winningGroup?.type === 'chow' && winningInstanceId
      ? winningGroup.instanceIds.indexOf(winningInstanceId) === 1
      : false;
    if (winningInChow) reasons.push('kanchan bonus');
    nearPingOhReason = reasons.length > 0 ? reasons.join(' and ') : 'a scoring bonus';
  }

  return {
    isValid: true,
    isPingOh: false,
    isBuanOh,
    isMinimumHand,
    basePoints,
    tai,
    finalScore,
    dealerScore,
    breakdown,
    flatBonuses,
    nearPingOh,
    nearPingOhReason,
  };
}
