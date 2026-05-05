export type Suit = 'character' | 'bamboo' | 'circle' | 'wind' | 'dragon' | 'flower' | 'season';
export type WindDirection = 'east' | 'south' | 'west' | 'north';
export type SetType = 'pong' | 'kang' | 'chow' | 'pair';
export type KangType = 'revealed' | 'hidden' | 'tts';

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
  groupId: string | null;
  isWinningTile: boolean;
}

export interface TileGroup {
  id: string;
  type: SetType | 'incomplete';
  concealed: boolean;
  kangType: KangType;
  instanceIds: string[];
}

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

export interface ScoreResult {
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

export interface CalculatorState {
  seatWind: WindDirection;
  isDealer: boolean;
  isMahjong: boolean;
  isSelfDraw: boolean;
  instances: TileInstance[];
  groups: TileGroup[];
  flowers: number[];
  seasons: number[];
}
