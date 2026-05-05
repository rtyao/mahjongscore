import type { Tile, Suit } from '@/types/mahjong';
import { getTile, getTileBySuitValue } from './tiles';

interface GroupResult {
  type: 'pong' | 'chow';
  tileIds: string[];
}

interface HandResult {
  sets: GroupResult[];
  pair: GroupResult;
}

function removeTiles(arr: string[], toRemove: string[]): string[] {
  const copy = [...arr];
  for (const id of toRemove) {
    const idx = copy.indexOf(id);
    if (idx !== -1) copy.splice(idx, 1);
  }
  return copy;
}

function findSets(tileIds: string[]): GroupResult[] | null {
  if (tileIds.length === 0) return [];

  const sorted = [...tileIds].sort();
  const firstId = sorted[0];
  const first = getTile(firstId);

  // Try pong first
  const matching = sorted.filter(id => id === firstId);
  if (matching.length >= 3) {
    const remaining = removeTiles(sorted, [firstId, firstId, firstId]);
    const rest = findSets(remaining);
    if (rest !== null) return [{ type: 'pong', tileIds: [firstId, firstId, firstId] }, ...rest];
  }

  // Try chow (only for suited non-honor tiles)
  if (!first.isHonor && first.suit !== 'flower' && first.suit !== 'season') {
    const mid = getTileBySuitValue(first.suit as Suit, first.value + 1);
    const end = getTileBySuitValue(first.suit as Suit, first.value + 2);
    if (mid && end) {
      const midId = mid.id;
      const endId = end.id;
      if (sorted.includes(midId) && sorted.includes(endId)) {
        const remaining = removeTiles(sorted, [firstId, midId, endId]);
        const rest = findSets(remaining);
        if (rest !== null) return [{ type: 'chow', tileIds: [firstId, midId, endId] }, ...rest];
      }
    }
  }

  return null;
}

export function detectHand(tileIds: string[]): HandResult | null {
  const sorted = [...tileIds].sort();
  const unique = [...new Set(sorted)];

  for (const pairTileId of unique) {
    const occurrences = sorted.filter(id => id === pairTileId);
    if (occurrences.length < 2) continue;

    const remaining = removeTiles(sorted, [pairTileId, pairTileId]);
    const sets = findSets(remaining);
    if (sets !== null) {
      return {
        sets,
        pair: { type: 'pong', tileIds: [pairTileId, pairTileId] },
      };
    }
  }

  return null;
}

export function isValidChow(suit: Suit, startValue: number): boolean {
  return ['character', 'bamboo', 'circle'].includes(suit) && startValue >= 1 && startValue <= 7;
}
