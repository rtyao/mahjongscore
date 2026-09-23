import type { ScoreResult } from '@/types/mahjong';
import TaiwaneseScorePanel from './TaiwaneseScorePanel';
import HongKongScorePanel from './HongKongScorePanel';

/** Renders whichever score panel matches the result's style. */
export default function ScoreDisplay({
  result, isDealer, isSelfDraw,
}: {
  result: ScoreResult;
  isDealer: boolean;
  isSelfDraw: boolean;
}) {
  return result.style === 'hongkong'
    ? <HongKongScorePanel result={result} isSelfDraw={isSelfDraw} />
    : <TaiwaneseScorePanel result={result} isDealer={isDealer} />;
}
