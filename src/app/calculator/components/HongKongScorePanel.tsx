import { useState } from 'react';
import type { HongKongScoreResult } from '@/types/mahjong';
import { LIMIT_FAN } from '@/lib/scoring';

export default function HongKongScorePanel({ result, isSelfDraw }: { result: HongKongScoreResult; isSelfDraw: boolean }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!result.isValid && result.invalidReason) {
    return (
      <div className="rounded-2xl p-5" style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
        <p className="font-semibold" style={{ color: '#B91C1C' }}>❌ {result.invalidReason}</p>
      </div>
    );
  }

  const atLimit = result.fan >= LIMIT_FAN;
  const headerBg = atLimit ? 'var(--color-jade)' : 'var(--color-ink)';
  const handLabel = result.limitHand
    ? `🏆 ${result.limitHand} — limit hand`
    : atLimit
    ? '🏆 Maximum payout'
    : result.fan === 0
    ? '🐔 Chicken hand (0 fan)'
    : '✅ Valid hand';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--color-cream-dark)' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ background: headerBg, color: '#fff' }}>
        <p className="text-sm font-medium opacity-80 mb-1">{handLabel}</p>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <p className="text-xs opacity-70 mb-0.5">Fan</p>
            <p className="text-4xl font-bold">{result.fan}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">Points</p>
            <p className="text-4xl font-bold">{result.points}</p>
          </div>
          {atLimit && (
            <div className="ml-auto text-right">
              <p className="text-xs opacity-70 mb-0.5">Tier</p>
              <p className="text-xl font-bold">{LIMIT_FAN}+ fan</p>
              <p className="text-xs opacity-60">maximum</p>
            </div>
          )}
        </div>
      </div>

      {/* Minimum fan warning */}
      {!result.meetsMinimum && result.minimumFan > 0 && (
        <div className="px-4 py-2.5 text-xs" style={{ background: '#FEF2F2', borderBottom: '1px solid #FCA5A5', color: '#B91C1C' }}>
          Below the table minimum of {result.minimumFan} fan — at a table playing that minimum you could not declare this win.
        </div>
      )}

      {/* Fan breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <th className="px-4 py-2 text-left font-semibold text-xs" style={{ color: 'var(--color-stone)' }}>Feature</th>
              <th className="px-4 py-2 text-right font-semibold text-xs" style={{ color: 'var(--color-stone)' }}>Fan</th>
            </tr>
          </thead>
          <tbody>
            {result.breakdown.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-sm italic" colSpan={2} style={{ color: 'var(--color-mist)' }}>
                  No scoring features yet — pick your tiles and build your sets.
                </td>
              </tr>
            )}
            {result.breakdown.map((item, i) => (
              <tr
                key={i}
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom: '1px solid var(--color-cream-light)',
                  background: expanded === i ? 'var(--color-cream-light)' : 'transparent',
                }}
              >
                <td className="px-4 py-2" style={{ color: 'var(--color-ink)' }}>
                  <span className="font-medium">{item.label}</span>
                  {item.variantNote && (
                    <span className="ml-1.5 text-xs" style={{ color: 'var(--color-mist)' }}>(variant)</span>
                  )}
                  {expanded === i && (
                    <>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-stone)' }}>{item.explanation}</p>
                      {item.variantNote && (
                        <p className="text-xs mt-1 italic" style={{ color: 'var(--color-dragon-red)' }}>{item.variantNote}</p>
                      )}
                    </>
                  )}
                </td>
                <td className="py-2 px-4 text-right font-mono font-semibold" style={{ color: 'var(--color-jade)' }}>
                  +{item.fan}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fan → points */}
      <div className="px-5 py-3 text-xs" style={{ background: 'var(--color-cream-light)', borderTop: '1px solid var(--color-cream-dark)', color: 'var(--color-stone)' }}>
        <span className="font-mono">
          {result.fan} fan
          {atLimit && ` (${LIMIT_FAN}+ tier)`}
          {' → '}
          <strong style={{ color: 'var(--color-ink)' }}>{result.points} points</strong>
        </span>
      </div>

      {/* Payment */}
      <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-cream-dark)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-mist)' }}>
          Payment — discarder pays all
        </p>
        <div
          className="flex justify-between text-sm py-1.5 px-2 rounded"
          style={isSelfDraw ? { background: 'var(--color-jade-pale)' } : undefined}
        >
          <span style={{ color: 'var(--color-stone)' }}>
            Self-pick — <strong>each</strong> of the 3 players pays
          </span>
          <span className="font-semibold font-mono" style={{ color: 'var(--color-jade)' }}>{result.selfDrawEachPays}</span>
        </div>
        <div
          className="flex justify-between text-sm py-1.5 px-2 rounded"
          style={!isSelfDraw ? { background: 'var(--color-jade-pale)' } : undefined}
        >
          <span style={{ color: 'var(--color-stone)' }}>
            By discard — the <strong>discarder alone</strong> pays
          </span>
          <span className="font-semibold font-mono" style={{ color: 'var(--color-jade)' }}>{result.discardPayerPays}</span>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-mist)' }}>
          Hong Kong scoring has no dealer bonus — the dealer pays and collects the same as everyone else.
        </p>
      </div>
    </div>
  );
}
