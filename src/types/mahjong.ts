export type Suit = 'character' | 'bamboo' | 'circle' | 'wind' | 'dragon' | 'flower' | 'season';
export type WindDirection = 'east' | 'south' | 'west' | 'north';
export type SetType = 'pong' | 'kang' | 'chow' | 'pair';
export type KangType = 'revealed' | 'hidden' | 'tts';

/** The two rule systems the calculator supports. */
export type MahjongStyle = 'taiwanese' | 'hongkong';

export interface Tile {
  id: string;
  suit: Suit;
  value: number;
  chineseChar: string;
  englishLabel: string;
  isTerminal: boolean;
  isHonor: boolean;
  maxCount: number;
}

export interface TileInstance {
  instanceId: string;
  tileId: string;
  isWinningTile: boolean;
}

export interface TileGroup {
  id: string;
  type: SetType | 'incomplete';
  concealed: boolean;
  kangType: KangType;
  instanceIds: string[];
}

// ── Taiwanese / Filipino-Chinese result ───────────────────────────

export interface ScoreBreakdownItem {
  label: string;
  points: number;
  tai: number;
  explanation: string;
}

export interface FlatBonus {
  label: string;
  amount: number;
}

export interface TaiwaneseScoreResult {
  style: 'taiwanese';
  isValid: boolean;
  invalidReason?: string;
  isPingOh: boolean;
  isBuanOh: boolean;
  isMinimumHand: boolean;
  basePoints: number;
  tai: number;
  finalScore: number;
  dealerScore: number;
  breakdown: ScoreBreakdownItem[];
  flatBonuses: FlatBonus[];
  nearPingOh: boolean;
  nearPingOhReason?: string;
  specialHand?: string;
}

// ── Hong Kong result ──────────────────────────────────────────────

export interface FanItem {
  label: string;
  fan: number;
  explanation: string;
  /** Set when a rule is not played at every table. */
  variantNote?: string;
}

export interface HongKongScoreResult {
  style: 'hongkong';
  isValid: boolean;
  invalidReason?: string;
  fan: number;
  /** Points from the fan table. Capped at the 13+ tier (384). */
  points: number;
  /** Self-pick: every player pays this. */
  selfDrawEachPays: number;
  /** Win by discard: the discarder alone pays this (2x points). */
  discardPayerPays: number;
  breakdown: FanItem[];
  /** Name of the 13-fan limit hand, when one applies. */
  limitHand?: string;
  minimumFan: number;
  meetsMinimum: boolean;
}

export type ScoreResult = TaiwaneseScoreResult | HongKongScoreResult;

// ── Calculator state ──────────────────────────────────────────────

export type Blessing = 'none' | 'heaven' | 'earth';

export interface CalculatorState {
  style: MahjongStyle;

  // Shared by both styles
  seatWind: WindDirection;
  isMahjong: boolean;
  isSelfDraw: boolean;
  instances: TileInstance[];
  groups: TileGroup[];
  flowers: number[];
  seasons: number[];

  // Taiwanese only
  isDealer: boolean;
  blessing: Blessing;

  // Hong Kong only
  roundWind: WindDirection;
  isConcealedHand: boolean;
  minimumFan: number;
}

/** Tiles in a complete hand, before counting the extra tile each kang adds. */
export const HAND_SIZE: Record<MahjongStyle, { concealed: number; winning: number; sets: number }> = {
  taiwanese: { concealed: 16, winning: 17, sets: 5 },
  hongkong: { concealed: 13, winning: 14, sets: 4 },
};
