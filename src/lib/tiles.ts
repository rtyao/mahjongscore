import type { Tile, Suit, WindDirection } from '@/types/mahjong';

const CHARACTER_CHARS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

function makeSuited(suit: Suit, chars: string[], english: string): Tile[] {
  return Array.from({ length: 9 }, (_, i) => ({
    id: `${suit}-${i + 1}`,
    suit,
    value: i + 1,
    chineseChar: chars[i],
    englishLabel: `${i + 1} ${english}`,
    isTerminal: i === 0 || i === 8,
    isHonor: false,
    maxCount: 4,
  }));
}

const ALL_TILES_ARRAY: Tile[] = [
  ...makeSuited('character', CHARACTER_CHARS, 'Wan'),
  // Bamboo uses number chars for 2-9; 1 is the bird tile
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `bamboo-${i + 1}`,
    suit: 'bamboo' as Suit,
    value: i + 1,
    chineseChar: i === 0 ? '雀' : String(i + 1),
    englishLabel: `${i + 1} Bamboo`,
    isTerminal: i === 0 || i === 8,
    isHonor: false,
    maxCount: 4,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `circle-${i + 1}`,
    suit: 'circle' as Suit,
    value: i + 1,
    chineseChar: String(i + 1),
    englishLabel: `${i + 1} Circle`,
    isTerminal: i === 0 || i === 8,
    isHonor: false,
    maxCount: 4,
  })),
  // Winds: value 1=East 2=South 3=West 4=North
  { id: 'wind-1', suit: 'wind', value: 1, chineseChar: '東', englishLabel: 'East', isTerminal: false, isHonor: true, maxCount: 4 },
  { id: 'wind-2', suit: 'wind', value: 2, chineseChar: '南', englishLabel: 'South', isTerminal: false, isHonor: true, maxCount: 4 },
  { id: 'wind-3', suit: 'wind', value: 3, chineseChar: '西', englishLabel: 'West', isTerminal: false, isHonor: true, maxCount: 4 },
  { id: 'wind-4', suit: 'wind', value: 4, chineseChar: '北', englishLabel: 'North', isTerminal: false, isHonor: true, maxCount: 4 },
  // Dragons: 1=Red(中) 2=Green(發) 3=White(白)
  { id: 'dragon-1', suit: 'dragon', value: 1, chineseChar: '中', englishLabel: 'Red Dragon', isTerminal: false, isHonor: true, maxCount: 4 },
  { id: 'dragon-2', suit: 'dragon', value: 2, chineseChar: '發', englishLabel: 'Green Dragon', isTerminal: false, isHonor: true, maxCount: 4 },
  { id: 'dragon-3', suit: 'dragon', value: 3, chineseChar: '白', englishLabel: 'White Dragon', isTerminal: false, isHonor: true, maxCount: 4 },
  // Flowers: 1=梅(Plum) 2=蘭(Orchid) 3=菊(Chrysanthemum) 4=竹(Bamboo Plant)
  { id: 'flower-1', suit: 'flower', value: 1, chineseChar: '梅', englishLabel: 'Plum', isTerminal: false, isHonor: false, maxCount: 1 },
  { id: 'flower-2', suit: 'flower', value: 2, chineseChar: '蘭', englishLabel: 'Orchid', isTerminal: false, isHonor: false, maxCount: 1 },
  { id: 'flower-3', suit: 'flower', value: 3, chineseChar: '菊', englishLabel: 'Chrysanthemum', isTerminal: false, isHonor: false, maxCount: 1 },
  { id: 'flower-4', suit: 'flower', value: 4, chineseChar: '竹', englishLabel: 'Bamboo Plant', isTerminal: false, isHonor: false, maxCount: 1 },
  // Seasons: 1=春(Spring) 2=夏(Summer) 3=秋(Autumn) 4=冬(Winter)
  { id: 'season-1', suit: 'season', value: 1, chineseChar: '春', englishLabel: 'Spring', isTerminal: false, isHonor: false, maxCount: 1 },
  { id: 'season-2', suit: 'season', value: 2, chineseChar: '夏', englishLabel: 'Summer', isTerminal: false, isHonor: false, maxCount: 1 },
  { id: 'season-3', suit: 'season', value: 3, chineseChar: '秋', englishLabel: 'Autumn', isTerminal: false, isHonor: false, maxCount: 1 },
  { id: 'season-4', suit: 'season', value: 4, chineseChar: '冬', englishLabel: 'Winter', isTerminal: false, isHonor: false, maxCount: 1 },
];

const TILE_MAP: Record<string, Tile> = {};
ALL_TILES_ARRAY.forEach(t => { TILE_MAP[t.id] = t; });

export const ALL_TILES = ALL_TILES_ARRAY;
export const CHARACTER_TILES = ALL_TILES_ARRAY.filter(t => t.suit === 'character');
export const BAMBOO_TILES = ALL_TILES_ARRAY.filter(t => t.suit === 'bamboo');
export const CIRCLE_TILES = ALL_TILES_ARRAY.filter(t => t.suit === 'circle');
export const WIND_TILES = ALL_TILES_ARRAY.filter(t => t.suit === 'wind');
export const DRAGON_TILES = ALL_TILES_ARRAY.filter(t => t.suit === 'dragon');
export const FLOWER_TILES = ALL_TILES_ARRAY.filter(t => t.suit === 'flower');
export const SEASON_TILES = ALL_TILES_ARRAY.filter(t => t.suit === 'season');

export function getTile(id: string): Tile {
  const tile = TILE_MAP[id];
  if (!tile) throw new Error(`Unknown tile: ${id}`);
  return tile;
}

export function getTileBySuitValue(suit: Suit, value: number): Tile | undefined {
  return ALL_TILES_ARRAY.find(t => t.suit === suit && t.value === value);
}

export function windToValue(wind: WindDirection): number {
  return { east: 1, south: 2, west: 3, north: 4 }[wind];
}

export function windLabel(wind: WindDirection): string {
  return { east: 'East', south: 'South', west: 'West', north: 'North' }[wind];
}

// Jade hand tiles: 2,3,4,6,8 bamboo + Green Dragon
export function isJadeHandTile(tileId: string): boolean {
  return ['bamboo-2', 'bamboo-3', 'bamboo-4', 'bamboo-6', 'bamboo-8', 'dragon-2'].includes(tileId);
}
