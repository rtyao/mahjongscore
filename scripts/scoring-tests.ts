/**
 * Scoring engine regression tests.
 * Run with: npm test  (or: npx tsx scripts/scoring-tests.ts)
 *
 * Every rule confirmed by family (Taiwanese) or taken from the HK rule sheet
 * should have a test here. When a rule changes, update the test alongside
 * RULES.md and the engine.
 */
import { calculateTaiwanese } from '../src/lib/scoring/taiwanese';
import { calculateHongKong, fanToPoints } from '../src/lib/scoring/hongkong';
import type { CalculatorState, TileGroup, HongKongScoreResult } from '../src/types/mahjong';

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
  return {
    style: 'taiwanese',
    seatWind: 'east',
    isMahjong: true,
    isSelfDraw: false,
    instances,
    groups,
    flowers: [],
    seasons: [],
    isDealer: false,
    blessing: 'none',
    roundWind: 'east',
    isConcealedHand: false,
    minimumFan: 3,
    ...overrides,
  };
}

/** Loose tiles with no grouping — for hands recognised by shape alone. */
function mkLooseHK(tileIds: string[], overrides: Partial<CalculatorState> = {}): CalculatorState {
  const state = mkState([], { style: 'hongkong', ...overrides });
  state.instances = tileIds.map(tileId => ({ instanceId: `i${uid++}`, tileId, isWinningTile: false }));
  return state;
}

function test(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}  ${detail}`); }
}

function section(name: string) {
  console.log(`\n${name}`);
}

/** Fan awarded for a breakdown entry whose label starts with the given text. */
function fanFor(result: HongKongScoreResult, labelPrefix: string): number {
  return result.breakdown
    .filter(i => i.label.startsWith(labelPrefix))
    .reduce((sum, i) => sum + i.fan, 0);
}

function hasEntry(result: HongKongScoreResult, labelPrefix: string): boolean {
  return result.breakdown.some(i => i.label.startsWith(labelPrefix));
}

const c = (a: string, b: string, d: string) => [a, b, d];

// ═══════════════════════════════════════════════════════════════════
section('Taiwanese / Filipino-Chinese');
// ═══════════════════════════════════════════════════════════════════

const pingOh = mkState([
  ['chow', c('character-1', 'character-2', 'character-3')],
  ['chow', c('character-4', 'character-5', 'character-6')],
  ['chow', c('bamboo-2', 'bamboo-3', 'bamboo-4')],
  ['chow', c('circle-5', 'circle-6', 'circle-7')],
  ['chow', c('circle-1', 'circle-2', 'circle-3')],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r1 = calculateTaiwanese(pingOh);
test('ping-oh: all chows + plain pair = flat 300/600', r1.isPingOh && r1.finalScore === 300 && r1.dealerScore === 600);

const r2 = calculateTaiwanese({ ...pingOh, blessing: 'earth' });
test('blessing of earth outranks ping-oh = buan-oh 600', !r2.isPingOh && r2.isBuanOh && r2.finalScore === 600);

const r2b = calculateTaiwanese({ ...pingOh, blessing: 'heaven', isDealer: true });
test('blessing of heaven = buan-oh', r2b.isBuanOh && r2b.finalScore === 600);

const dragons = mkState([
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pong', ['dragon-2', 'dragon-2', 'dragon-2']],
  ['pong', ['dragon-3', 'dragon-3', 'dragon-3']],
  ['chow', c('character-1', 'character-2', 'character-3')],
  ['chow', c('character-4', 'character-5', 'character-6')],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r3 = calculateTaiwanese(dragons);
test('big three dragons = buan-oh', r3.isBuanOh && (r3.specialHand ?? '').includes('dragons'), r3.specialHand);

const smallWinds = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['wind-3', 'wind-3', 'wind-3']],
  ['chow', c('character-1', 'character-2', 'character-3')],
  ['chow', c('character-4', 'character-5', 'character-6')],
  ['pair', ['wind-4', 'wind-4']],
]);
const r4 = calculateTaiwanese(smallWinds);
test('small winds (3 wind pongs incl. own seat + 4th wind pair) = buan-oh', r4.isBuanOh && (r4.specialHand ?? '').includes('Small winds'), r4.specialHand);

const bigWinds = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['wind-3', 'wind-3', 'wind-3']],
  ['pong', ['wind-4', 'wind-4', 'wind-4']],
  ['chow', c('character-1', 'character-2', 'character-3')],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r5 = calculateTaiwanese(bigWinds);
test('big winds (all 4 wind pongs) = buan-oh', r5.isBuanOh && (r5.specialHand ?? '').includes('Big winds'), r5.specialHand);

const fullFlushTW = mkState([
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['chow', c('bamboo-4', 'bamboo-5', 'bamboo-6')],
  ['chow', c('bamboo-7', 'bamboo-8', 'bamboo-9')],
  ['pong', ['bamboo-2', 'bamboo-2', 'bamboo-2']],
  ['pong', ['bamboo-8', 'bamboo-8', 'bamboo-8']],
  ['pair', ['bamboo-5', 'bamboo-5']],
]);
const r6 = calculateTaiwanese(fullFlushTW);
test('full flush = buan-oh', r6.isBuanOh && (r6.specialHand ?? '').includes('Full flush'), r6.specialHand);

const allTerminalsTW = mkState([
  ['pong', ['character-1', 'character-1', 'character-1']],
  ['pong', ['character-9', 'character-9', 'character-9']],
  ['pong', ['bamboo-1', 'bamboo-1', 'bamboo-1']],
  ['pong', ['circle-9', 'circle-9', 'circle-9']],
  ['pong', ['circle-1', 'circle-1', 'circle-1']],
  ['pair', ['bamboo-9', 'bamboo-9']],
]);
const r7 = calculateTaiwanese(allTerminalsTW);
test('all terminals = buan-oh', r7.isBuanOh && (r7.specialHand ?? '').includes('terminals'), r7.specialHand);

const fakeTerminals = mkState([
  ['chow', c('character-1', 'character-2', 'character-3')],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['chow', c('circle-1', 'circle-2', 'circle-3')],
  ['chow', c('character-1', 'character-2', 'character-3')],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['pair', ['circle-9', 'circle-9']],
]);
const r8 = calculateTaiwanese(fakeTerminals);
test('1-2-3 chows do NOT count as all terminals', !(r8.specialHand ?? '').includes('terminals'), r8.specialHand);

const halfFlushTW = mkState([
  ['pong', ['character-2', 'character-2', 'character-2']],
  ['pong', ['character-5', 'character-5', 'character-5']],
  ['pong', ['character-8', 'character-8', 'character-8']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['character-3', 'character-3', 'character-3']],
  ['pair', ['character-6', 'character-6']],
]);
const r9 = calculateTaiwanese(halfFlushTW);
test('half flush = +1 tai; all pong hand = +1 pt', r9.tai === 1 && r9.basePoints === 4, `pts=${r9.basePoints} tai=${r9.tai}`);

const flowerHand = calculateTaiwanese({ ...pingOh, flowers: [1, 2, 3, 4] });
test('complete flower set = +1 tai (not +2)', flowerHand.tai === 2 && flowerHand.basePoints === 4, `pts=${flowerHand.basePoints} tai=${flowerHand.tai}`);
test('flower kang flat bonus = 100', flowerHand.flatBonuses.some(b => b.amount === 100 && b.label.toLowerCase().includes('flower')));

const bothSets = calculateTaiwanese({ ...pingOh, flowers: [1, 2, 3, 4], seasons: [1, 2, 3, 4] });
test('all flowers + all seasons = buan-oh', bothSets.isBuanOh && (bothSets.specialHand ?? '').includes('flowers'), bothSets.specialHand);

const r10 = calculateTaiwanese({ ...pingOh, isSelfDraw: true });
test('go-ki-si-pa floor: sub-50 hand scores 50', r10.isMinimumHand && r10.finalScore === 50, `score=${r10.finalScore}`);

// All honours: only winds and dragons, no suited tiles at all.
const allHonoursTW = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pong', ['dragon-2', 'dragon-2', 'dragon-2']],
  ['pong', ['wind-3', 'wind-3', 'wind-3']],
  ['pair', ['dragon-3', 'dragon-3']],
]);
const r11 = calculateTaiwanese(allHonoursTW);
test('all honours = buan-oh', r11.isBuanOh && r11.finalScore === 600, `score=${r11.finalScore} hand=${r11.specialHand}`);

// A hand with any suited tile is not all honours.
const nearlyAllHonours = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pong', ['dragon-2', 'dragon-2', 'dragon-2']],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['pair', ['dragon-3', 'dragon-3']],
]);
const r12 = calculateTaiwanese(nearlyAllHonours);
test('one suited set means the hand is not all honours',
  !(r12.specialHand ?? '').includes('All honours'), r12.specialHand);

// ═══════════════════════════════════════════════════════════════════
section('Hong Kong — fan table');
// ═══════════════════════════════════════════════════════════════════

test('fan table: 0 fan = 1 point', fanToPoints(0) === 1);
test('fan table: 3 fan = 8 points', fanToPoints(3) === 8);
test('fan table: 6 fan = 32 points', fanToPoints(6) === 32);
test('fan table: 12 fan = 256 points', fanToPoints(12) === 256);
test('fan table: 13 fan = 384 points (limit)', fanToPoints(13) === 384);
test('fan table: 20 fan still 384 (capped)', fanToPoints(20) === 384);

// ═══════════════════════════════════════════════════════════════════
section('Hong Kong — set shape');
// ═══════════════════════════════════════════════════════════════════

const hkAllSeq = mkState([
  ['chow', c('character-1', 'character-2', 'character-3')],
  ['chow', c('character-4', 'character-5', 'character-6')],
  ['chow', c('bamboo-2', 'bamboo-3', 'bamboo-4')],
  ['chow', c('circle-5', 'circle-6', 'circle-7')],
  ['pair', ['bamboo-8', 'bamboo-8']],
], { style: 'hongkong' });
const h1 = calculateHongKong(hkAllSeq);
test('All Sequences = 1 fan', fanFor(h1, 'All Sequences') === 1, `fan=${h1.fan}`);
test('No Flowers or Seasons = 1 fan', fanFor(h1, 'No Flowers') === 1);
test('All Sequences hand total = 2 fan → 4 points', h1.fan === 2 && h1.points === 4, `fan=${h1.fan} pts=${h1.points}`);

const hkAllTriplets = mkState([
  ['pong', ['character-2', 'character-2', 'character-2']],
  ['pong', ['character-5', 'character-5', 'character-5']],
  ['pong', ['bamboo-3', 'bamboo-3', 'bamboo-3']],
  ['pong', ['circle-7', 'circle-7', 'circle-7']],
  ['pair', ['bamboo-8', 'bamboo-8']],
], { style: 'hongkong' });
const h2 = calculateHongKong(hkAllTriplets);
test('All Triplets = 3 fan', fanFor(h2, 'All Triplets') === 3, `fan=${h2.fan}`);

const h3 = calculateHongKong({ ...hkAllTriplets, isConcealedHand: true, isSelfDraw: true });
test('All Concealed Triplets = 8 fan, replaces All Triplets',
  fanFor(h3, 'All Concealed Triplets') === 8 && !hasEntry(h3, 'All Triplets'), `fan=${h3.fan}`);

const h3b = calculateHongKong({ ...hkAllTriplets, isConcealedHand: true, isSelfDraw: false });
test('concealed triplets won by discard on a non-pair set stays All Triplets (3)',
  fanFor(h3b, 'All Triplets') === 3 && !hasEntry(h3b, 'All Concealed Triplets'));

const hkAllKongs = mkState([
  ['kang', ['character-2', 'character-2', 'character-2', 'character-2']],
  ['kang', ['character-5', 'character-5', 'character-5', 'character-5']],
  ['kang', ['bamboo-3', 'bamboo-3', 'bamboo-3', 'bamboo-3']],
  ['kang', ['circle-7', 'circle-7', 'circle-7', 'circle-7']],
  ['pair', ['bamboo-8', 'bamboo-8']],
], { style: 'hongkong' });
const h4 = calculateHongKong(hkAllKongs);
test('All Quadruplets = 13 fan → 384 points',
  fanFor(h4, 'All Quadruplets') === 13 && h4.points === 384, `fan=${h4.fan} pts=${h4.points}`);

// ═══════════════════════════════════════════════════════════════════
section('Hong Kong — suit and composition');
// ═══════════════════════════════════════════════════════════════════

const hkMixedFlush = mkState([
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['chow', c('bamboo-4', 'bamboo-5', 'bamboo-6')],
  ['chow', c('bamboo-7', 'bamboo-8', 'bamboo-9')],
  ['pong', ['dragon-3', 'dragon-3', 'dragon-3']],
  ['pair', ['bamboo-5', 'bamboo-5']],
], { style: 'hongkong' });
const h5 = calculateHongKong(hkMixedFlush);
test('Mixed Flush = 3 fan', fanFor(h5, 'Mixed Flush') === 3, `fan=${h5.fan}`);

const hkFullFlush = mkState([
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['chow', c('bamboo-4', 'bamboo-5', 'bamboo-6')],
  ['chow', c('bamboo-7', 'bamboo-8', 'bamboo-9')],
  ['pong', ['bamboo-2', 'bamboo-2', 'bamboo-2']],
  ['pair', ['bamboo-5', 'bamboo-5']],
], { style: 'hongkong' });
const h6 = calculateHongKong(hkFullFlush);
test('Full Flush = 7 fan, replaces Mixed Flush',
  fanFor(h6, 'Full Flush') === 7 && !hasEntry(h6, 'Mixed Flush'), `fan=${h6.fan}`);

// character-1, character-9, wind-4, dragon-1 triplets + circle-9 pair.
// Seat and round are both East, so the North triplet earns no wind fan.
const hkMixedTerminals = mkState([
  ['pong', ['character-1', 'character-1', 'character-1']],
  ['pong', ['character-9', 'character-9', 'character-9']],
  ['pong', ['wind-4', 'wind-4', 'wind-4']],
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pair', ['circle-9', 'circle-9']],
], { style: 'hongkong' });
const h7 = calculateHongKong(hkMixedTerminals);
test('Mixed Terminals = 4 fan', fanFor(h7, 'Mixed Terminals') === 4, `fan=${h7.fan}`);
test('Mixed Terminals absorbs the 3 fan from All Triplets', !hasEntry(h7, 'All Triplets'));
test('Mixed Terminals hand = 4 + dragon 1 + no-flowers 1 = 6 fan', h7.fan === 6, `fan=${h7.fan}`);

const hkAllHonours = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pong', ['dragon-2', 'dragon-2', 'dragon-2']],
  ['pair', ['dragon-3', 'dragon-3']],
], { style: 'hongkong' });
const h8 = calculateHongKong(hkAllHonours);
test('All Honours = 10 fan', fanFor(h8, 'All Honours') === 10, `fan=${h8.fan}`);
test('All Honours absorbs All Triplets', !hasEntry(h8, 'All Triplets'));
test('All Honours does not also claim a flush', !hasEntry(h8, 'Mixed Flush') && !hasEntry(h8, 'Full Flush'));

// ═══════════════════════════════════════════════════════════════════
section('Hong Kong — dragons and winds');
// ═══════════════════════════════════════════════════════════════════

const hkBigDragons = mkState([
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pong', ['dragon-2', 'dragon-2', 'dragon-2']],
  ['pong', ['dragon-3', 'dragon-3', 'dragon-3']],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['pair', ['bamboo-5', 'bamboo-5']],
], { style: 'hongkong' });
const h9 = calculateHongKong(hkBigDragons);
test('Big Three Dragons = 8 fan, replaces per-dragon awards',
  fanFor(h9, 'Big Three Dragons') === 8 && !hasEntry(h9, 'Triplet of Red'), `fan=${h9.fan}`);

const hkSmallDragons = mkState([
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['pong', ['dragon-2', 'dragon-2', 'dragon-2']],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['chow', c('bamboo-4', 'bamboo-5', 'bamboo-6')],
  ['pair', ['dragon-3', 'dragon-3']],
], { style: 'hongkong' });
const h10 = calculateHongKong(hkSmallDragons);
test('Small Three Dragons = 5 fan', fanFor(h10, 'Small Three Dragons') === 5, `fan=${h10.fan}`);

const hkOneDragon = mkState([
  ['pong', ['dragon-1', 'dragon-1', 'dragon-1']],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['chow', c('bamboo-4', 'bamboo-5', 'bamboo-6')],
  ['chow', c('circle-4', 'circle-5', 'circle-6')],
  ['pair', ['bamboo-8', 'bamboo-8']],
], { style: 'hongkong' });
const h11 = calculateHongKong(hkOneDragon);
test('single dragon triplet = 1 fan', fanFor(h11, 'Triplet of Red Dragon') === 1, `fan=${h11.fan}`);

const hkBigWinds = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['wind-3', 'wind-3', 'wind-3']],
  ['pong', ['wind-4', 'wind-4', 'wind-4']],
  ['pair', ['bamboo-5', 'bamboo-5']],
], { style: 'hongkong' });
const h12 = calculateHongKong(hkBigWinds);
test('Big Four Winds = 13 fan → 384 points',
  fanFor(h12, 'Big Four Winds') === 13 && h12.points === 384, `fan=${h12.fan}`);

const hkSmallWinds = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['pong', ['wind-2', 'wind-2', 'wind-2']],
  ['pong', ['wind-3', 'wind-3', 'wind-3']],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['pair', ['wind-4', 'wind-4']],
], { style: 'hongkong' });
const h13 = calculateHongKong(hkSmallWinds);
test('Small Four Winds = 6 fan', fanFor(h13, 'Small Four Winds') === 6, `fan=${h13.fan}`);

// East seat, East round: the East triplet is both, so it counts 2 fan.
const hkDoubleWind = mkState([
  ['pong', ['wind-1', 'wind-1', 'wind-1']],
  ['chow', c('bamboo-1', 'bamboo-2', 'bamboo-3')],
  ['chow', c('bamboo-4', 'bamboo-5', 'bamboo-6')],
  ['chow', c('circle-4', 'circle-5', 'circle-6')],
  ['pair', ['bamboo-8', 'bamboo-8']],
], { style: 'hongkong', seatWind: 'east', roundWind: 'east' });
const h14 = calculateHongKong(hkDoubleWind);
test('triplet that is both round and seat wind = 2 fan', fanFor(h14, 'Triplet of East') === 2, `fan=${h14.fan}`);

const h15 = calculateHongKong({ ...hkDoubleWind, roundWind: 'south' });
test('triplet of seat wind only = 1 fan', fanFor(h15, 'Triplet of East') === 1, `fan=${h15.fan}`);

const h16 = calculateHongKong({ ...hkDoubleWind, seatWind: 'south', roundWind: 'south' });
test('triplet of a wind that is neither round nor seat = 0 fan', fanFor(h16, 'Triplet of East') === 0, `fan=${h16.fan}`);

// ═══════════════════════════════════════════════════════════════════
section('Hong Kong — shapes recognised without grouping');
// ═══════════════════════════════════════════════════════════════════

const orphanTiles = [
  'character-1', 'character-9', 'bamboo-1', 'bamboo-9', 'circle-1', 'circle-9',
  'wind-1', 'wind-2', 'wind-3', 'wind-4', 'dragon-1', 'dragon-2', 'dragon-3',
  'dragon-3',
];
const h17 = calculateHongKong(mkLooseHK(orphanTiles));
test('Thirteen Orphans = 13 fan → 384 points',
  h17.limitHand === 'Thirteen Orphans' && h17.fan === 13 && h17.points === 384, `fan=${h17.fan}`);

const nineGatesTiles = [
  'bamboo-1', 'bamboo-1', 'bamboo-1', 'bamboo-2', 'bamboo-3', 'bamboo-4',
  'bamboo-5', 'bamboo-6', 'bamboo-7', 'bamboo-8', 'bamboo-9', 'bamboo-9', 'bamboo-9',
  'bamboo-5',
];
const h18 = calculateHongKong(mkLooseHK(nineGatesTiles));
test('Nine Gates = 13 fan → 384 points',
  h18.limitHand === 'Nine Gates' && h18.points === 384, `fan=${h18.fan} limit=${h18.limitHand}`);

const sevenPairTiles = [
  'bamboo-1', 'bamboo-1', 'bamboo-3', 'bamboo-3', 'bamboo-5', 'bamboo-5',
  'circle-2', 'circle-2', 'circle-4', 'circle-4', 'wind-1', 'wind-1',
  'dragon-2', 'dragon-2',
];
const h19 = calculateHongKong(mkLooseHK(sevenPairTiles));
test('Seven Pairs = 4 fan', fanFor(h19, 'Seven Pairs') === 4, `fan=${h19.fan}`);
test('Seven Pairs carries a variant note', h19.breakdown.some(i => i.label === 'Seven Pairs' && !!i.variantNote));

// Four of a kind is not two pairs.
const fourOfAKindTiles = [
  'bamboo-1', 'bamboo-1', 'bamboo-1', 'bamboo-1', 'bamboo-3', 'bamboo-3',
  'circle-2', 'circle-2', 'circle-4', 'circle-4', 'wind-1', 'wind-1',
  'dragon-2', 'dragon-2',
];
const h20 = calculateHongKong(mkLooseHK(fourOfAKindTiles));
test('four of a kind does not count as two pairs', !hasEntry(h20, 'Seven Pairs'));

// ═══════════════════════════════════════════════════════════════════
section('Hong Kong — win actions, flowers, payment');
// ═══════════════════════════════════════════════════════════════════

const h21 = calculateHongKong({ ...hkAllSeq, isSelfDraw: true, isConcealedHand: true });
test('Self-Pick = 1 fan', fanFor(h21, 'Self-Pick') === 1);
test('Concealed Hand = 1 fan', fanFor(h21, 'Concealed Hand') === 1);

const h22 = calculateHongKong({ ...hkAllSeq, flowers: [1], seasons: [] });
test('seat flower (East seat holds flower 1) = 1 fan', fanFor(h22, 'Seat Flower') === 1, `fan=${h22.fan}`);
test('a hand with bonus tiles loses the No Flowers fan', !hasEntry(h22, 'No Flowers'));

const h23 = calculateHongKong({ ...hkAllSeq, flowers: [2], seasons: [] });
test("another player's flower scores nothing", fanFor(h23, 'Seat Flower') === 0);

const h24 = calculateHongKong({ ...hkAllSeq, flowers: [1, 2, 3, 4], seasons: [] });
test('All Flowers = 2 fan', fanFor(h24, 'All Flowers') === 2, `fan=${h24.fan}`);

// Confirmed: the award is a flat 2 for completing either group, not 2 per group.
const h24b = calculateHongKong({ ...hkAllSeq, flowers: [1, 2, 3, 4], seasons: [1, 2, 3, 4] });
test('all flowers AND all seasons is still a flat 2 fan, not 4',
  fanFor(h24b, 'All Flowers and All Seasons') === 2, `fan=${h24b.fan}`);

const h25 = calculateHongKong({ ...hkAllSeq, flowers: [1, 2, 3, 4], seasons: [1, 2, 3, 4] });
test('Eight Flowers = 8 fan', fanFor(h25, 'Eight Flowers') === 8, `fan=${h25.fan}`);

// Payment: discarder pays double, self-pick is paid by each player.
const h26 = calculateHongKong(hkMixedFlush);
test('self-pick payment equals the point value', h26.selfDrawEachPays === h26.points);
test('discard payment is double the point value', h26.discardPayerPays === h26.points * 2);

// Table minimum
const h27 = calculateHongKong({ ...hkAllSeq, minimumFan: 3 });
test('2-fan hand flagged below a 3-fan table minimum', h27.fan === 2 && !h27.meetsMinimum, `fan=${h27.fan}`);
const h28 = calculateHongKong({ ...hkAllSeq, minimumFan: 0 });
test('same hand passes at a 0-fan minimum', h28.meetsMinimum);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
