/**
 * Scoring entry point. Dispatches to the engine for the selected style.
 *
 * The two engines share tiles and hand-building but nothing else: Taiwanese
 * scores base points multiplied by tai, Hong Kong counts fan and reads a
 * payout table. Each returns its own result shape, discriminated by `style`.
 */
import type { CalculatorState, ScoreResult } from '@/types/mahjong';
import { calculateTaiwanese } from './taiwanese';
import { calculateHongKong } from './hongkong';

export function calculateScore(state: CalculatorState): ScoreResult {
  return state.style === 'hongkong'
    ? calculateHongKong(state)
    : calculateTaiwanese(state);
}

export { calculateTaiwanese } from './taiwanese';
export { calculateHongKong, fanToPoints, hasStandaloneShape, LIMIT_FAN } from './hongkong';
