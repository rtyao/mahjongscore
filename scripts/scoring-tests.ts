/**
 * Scoring engine regression tests.
 * Run with: npm test  (or: npx tsx scripts/scoring-tests.ts)
 *
 * Every rule confirmed by family should have a test here. When a rule
 * changes, update the test alongside RULES.md and scoring.ts.
 */
import { calculateScore } from '../src/lib/scoring';
import type { CalculatorState, TileGroup } from '../src/types/mahjong';

let uid = 0;
let passed = 0;
let failed = 0;

function mkState(specs: [TileGroup['type'], string[]][], overrides: Partial<CalculatorState> = {}): CalculatorState {
  const groups: TileGroup[] = [];
  const instances: CalculatorState['instances'] = [];
  for (const [type, tileIds] of specs) {
    const inst = tileIds.map(tileId => ({ instanceId: `i${uid++}`, tileId, isWinningTile: false }));
    groups.push({ id: `g${uid++}`, type, concealed: false, kangType: 'revealed', instanceIds: inst.map(i => i.instanceId) });
    instances.push(...inst);
  }
  // Default: first tile is the winning tile (edge of first chow — no kanchan/pair bonus)
  if (instances.length > 0) instances[0].isWinningTile = true;
  return { seatWind: 'east', isDealer: false, isMahjong: true, isSelfDraw: false, blessing: 'none', instances, groups, flowers: [], seasons: [], ...overrides };
}

function test(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}  ${detail}`); }
}

// ── Ping-oh ────────────────────────────────────────────────────────
const pingOh = mkState([
  ['chow', ['character-1', 'character-2', 'character-3']],
  ['chow', ['character-4', 'character-5', 'character-6']],
  ['chow', ['bamboo-2', 'bamboo-3', 'bamboo-4']],
  ['chow', ['circle-5', 'circle-6', 'circle-7']],
  ['chow', ['circle-1', 'circle-2', 'circle-3']],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r1 = calculateScore(pingOh);
test('ping-oh: all chows + plain pair = flat 300/600', r1.isPingOh && r1.finalScore === 300 && r1.dealerScore === 600);

// ── Blessings ──────────────────────────────────────────────────────
const r2 = calculateScore({ ...pingOh, blessing: 'earth' });
test('blessing of earth outranks ping-oh = buan-oh 600', !r2.isPingOh && r2.isBuanOh && r2.finalScore === 600);

const r2b = calculateScore({ ...pingOh, blessing: 'heaven', isDealer: true });
test('blessing of heaven = buan-oh', r2b.isBuanOh && r2b.finalScore === 600);

// ── Limit hands ────────────────────────────────────────────────────
const dragons = mkState([
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pong', ['dragon-2', 'dragon-2', 'dragon-2']],
  ['pong', ['dragon-3', 'dragon-3', 'dragon-3']],
  ['chow', ['character-1', 'character-2', 'character-3']],
  ['chow', ['character-4', 'character-5', 'character-6']],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r3 = calculateScore(dragons);
test('big three dragons = buan-oh', r3.isBuanOh && (r3.specialHand ?? '').includes('dragons'), r3.specialHand);

const smallWinds = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['wind-3', 'wind-3', 'wind-3']],
  ['chow', ['character-1', 'character-2', 'character-3']],
  ['chow', ['character-4', 'character-5', 'character-6']],
  ['pair', ['wind-4', 'wind-4']],
]);
const r4 = calculateScore(smallWinds);
test('small winds (3 wind pongs incl. own seat + 4th wind pair) = buan-oh', r4.isBuanOh && (r4.specialHand ?? '').includes('Small winds'), r4.specialHand);

const bigWinds = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['wind-3', 'wind-3', 'wind-3']],
  ['pong', ['wind-4', 'wind-4', 'wind-4']],
  ['chow', ['character-1', 'character-2', 'character-3']],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r5 = calculateScore(bigWinds);
test('big winds (all 4 wind pongs) = buan-oh', r5.isBuanOh && (r5.specialHand ?? '').includes('Big winds'), r5.specialHand);

const fullFlush = mkState([
  ['chow', ['bamboo-1', 'bamboo-2', 'bamboo-3']],
  ['chow', ['bamboo-4', 'bamboo-5', 'bamboo-6']],
  ['chow', ['bamboo-7', 'bamboo-8', 'bamboo-9']],
  ['pong', ['bamboo-2', 'bamboo-2', 'bamboo-2']],
  ['pong', ['bamboo-8', 'bamboo-8', 'bamboo-8']],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r6 = calculateScore(fullFlush);
test('full flush = buan-oh', r6.isBuanOh && (r6.specialHand ?? '').includes('Full flush'), r6.specialHand);

const allTerminals = mkState([
  ['pong', ['character-1', 'character-1', 'character-1']],
  ['pong', ['character-9', 'character-9', 'character-9']],
  ['pong', ['bamboo-1', 'bamboo-1', 'bamboo-1']],
  ['pong', ['circle-9', 'circle-9', 'circle-9']],
  ['pong', ['circle-1', 'circle-1', 'circle-1']],
  ['pair', ['bamboo-9', 'bamboo-9']],
]);
const r7 = calculateScore(allTerminals);
test('all terminals = buan-oh', r7.isBuanOh && (r7.specialHand ?? '').includes('terminals'), r7.specialHand);

// Regression: chows starting at 1 contain non-terminals — must NOT be all-terminals
const fakeTerminals = mkState([
  ['chow', ['character-1', 'character-2', 'character-3']],
  ['chow', ['bamboo-1', 'bamboo-2', 'bamboo-3']],
  ['chow', ['circle-1', 'circle-2', 'circle-3']],
  ['chow', ['character-1', 'character-2', 'character-3']],
  ['chow', ['bamboo-1', 'bamboo-2', 'bamboo-3']],
  ['pair', ['circle-9', 'circle-9']],
]);
const r8 = calculateScore(fakeTerminals);
test('1-2-3 chows do NOT count as all terminals', !(r8.specialHand ?? '').includes('terminals'), r8.specialHand);

// ── Tai & point rules ─────────────────────────────────────────────
const halfFlush = mkState([
  ['pong', ['character-2', 'character-2', 'character-2']],
  ['pong', ['character-5', 'character-5', 'character-5']],
  ['pong', ['character-8', 'character-8', 'character-8']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['character-3', 'character-3', 'character-3']],
  ['pair', ['character-6', 'character-6']],
]);
const r9 = calculateScore(halfFlush);
// 4 suited pongs (2) + non-seat wind pong (1) + all-pong (+1) + win-by-... winning tile is in first pong = no bonus. = 4, tai 1
test('half flush = +1 tai; all pong hand = +1 pt', r9.tai === 1 && r9.basePoints === 4, `pts=${r9.basePoints} tai=${r9.tai}`);

const flowerHand = calculateScore({ ...pingOh, flowers: [1, 2, 3, 4] });
// 4 flower pts; own flower (east=1) +1 tai; flower kang +1 tai (NOT +2 — fixed in v0.2.2)
test('complete flower set = +1 tai (not +2)', flowerHand.tai === 2 && flowerHand.basePoints === 4, `pts=${flowerHand.basePoints} tai=${flowerHand.tai}`);
test('flower kang flat bonus = 100', flowerHand.flatBonuses.some(b => b.amount === 100 && b.label.toLowerCase().includes('flower')));

const bothSets = calculateScore({ ...pingOh, flowers: [1, 2, 3, 4], seasons: [1, 2, 3, 4] });
test('all flowers + all seasons = buan-oh', bothSets.isBuanOh && (bothSets.specialHand ?? '').includes('flowers'), bothSets.specialHand);

// ── Floor and cap ─────────────────────────────────────────────────
const tiny = mkState([
  ['chow', ['character-1', 'character-2', 'character-3']],
  ['chow', ['character-4', 'character-5', 'character-6']],
  ['chow', ['bamboo-2', 'bamboo-3', 'bamboo-4']],
  ['chow', ['circle-5', 'circle-6', 'circle-7']],
  ['chow', ['circle-1', 'circle-2', 'circle-3']],
  ['pair', ['bamboo-5', 'bamboo-5']],
], { isSelfDraw: true });
const r10 = calculateScore(tiny);
// self-draw 0.5 pts → not ping-oh; (0.5×4→10)+20=30 → floored to 50
test('go-ki-si-pa floor: sub-50 hand scores 50', r10.isMinimumHand && r10.finalScore === 50, `score=${r10.finalScore}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
