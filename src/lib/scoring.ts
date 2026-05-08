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
 *
 * TAI (multipliers) — each tai doubles the score (×2^n total):
 *   Any dragon pong/kang:     +1 tai
 *   Own wind pong/kang:       +1 tai
 *   Own flower tile:          +1 tai
 *   Own season tile:          +1 tai
 *   Complete flower set (×4): +2 tai
 *   Complete season set (×4): +2 tai
 *
 * FLAT BONUSES (each player pays separately, outside the formula):
 *   Revealed kang:  +100
 *   Hidden kang:    +200
 *   TTS kang:       +400 (held all 4 from the deal)
 *   Complete flower/season set: +100
 *   Self-draw (zi-mo): +100
 */

import type { CalculatorState, ScoreResult, ScoreBreakdownItem, FlatBonus, KangType } from '@/types/mahjong';
import { getTile, windToValue } from './tiles';

// Honor (winds/dragons) and terminal (1 or 9) pongs are worth 1 pt; suited middle tiles are 0.5 pt
function getPongBasePoints(tileId: string): number {
  const tile = getTile(tileId);
  if (tile.isHonor || tile.isTerminal) return 1;
  return 0.5;
}

// Kang = pong score × 4. Concealed always doubles the pong base first.
function getSetPoints(tileId: string, type: 'pong' | 'kang', concealed: boolean): number {
  let base = getPongBasePoints(tileId);
  if (concealed) base *= 2;
  if (type === 'kang') base *= 4;
  return base;
}

// Tai earned from a pong/kang: dragons always give 1; winds give 1 only if it's your seat wind
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
  const base = getPongBasePoints(tileId);
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

  // Flowers
  for (const flowerVal of state.flowers) {
    basePoints += 1;
    const isOwn = flowerVal === seatWindValue;
    if (isOwn) tai += 1;
    breakdown.push({ label: `Flower ${flowerVal}${isOwn ? ' ★' : ''}`, points: 1, tai: isOwn ? 1 : 0, explanation: isOwn ? 'Your own flower = 1 pt + 1 tai.' : 'Flower tile = 1 pt.' });
  }
  if (state.flowers.length === 4) {
    tai += 2;
    flatBonuses.push({ label: 'Complete flower set', amount: 100 });
    breakdown.push({ label: 'Complete flower set!', points: 0, tai: 2, explanation: 'All 4 flowers: +2 tai + 100 cash bonus from each player.' });
  }

  // Seasons
  for (const seasonVal of state.seasons) {
    basePoints += 1;
    const isOwn = seasonVal === seatWindValue;
    if (isOwn) tai += 1;
    breakdown.push({ label: `Season ${seasonVal}${isOwn ? ' ★' : ''}`, points: 1, tai: isOwn ? 1 : 0, explanation: isOwn ? 'Your own season = 1 pt + 1 tai.' : 'Season tile = 1 pt.' });
  }
  if (state.seasons.length === 4) {
    tai += 2;
    flatBonuses.push({ label: 'Complete season set', amount: 100 });
    breakdown.push({ label: 'Complete season set!', points: 0, tai: 2, explanation: 'All 4 seasons: +2 tai + 100 cash bonus from each player.' });
  }

  // Self-draw bonus
  if (state.isMahjong && state.isSelfDraw) {
    basePoints += 0.5;
    flatBonuses.push({ label: 'Self-draw (Zi-mo)', amount: 100 });
    breakdown.push({ label: 'Self-draw (Zi-mo)', points: 0.5, tai: 0, explanation: 'Drawing your own winning tile: +0.5 pts + 100 flat bonus from each player.' });
  }

  // Ping-oh: all base points = 0 (implies all chows, non-scoring pair, no flowers, no self-draw, no win bonuses)
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

  // Formula: (base × 4, round up to nearest 10) + 20 if mahjong, then × 2^tai
  const step1 = Math.ceil((basePoints * 4) / 10) * 10;
  const step2 = state.isMahjong ? step1 + 20 : step1;
  const step3 = step2 * Math.pow(2, tai);

  const isBuanOh = state.isMahjong && step3 >= 600;
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
    const winningGroup2 = winningGroup;
    if (winningGroup2?.type === 'pair') reasons.push('win-by-pair bonus');
    const winningInChow = winningGroup2?.type === 'chow' && winningInstanceId
      ? winningGroup2.instanceIds.indexOf(winningInstanceId) === 1
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
