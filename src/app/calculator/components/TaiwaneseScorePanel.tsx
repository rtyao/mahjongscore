import { useState } from 'react';
import type { TaiwaneseScoreResult } from '@/types/mahjong';

export default function TaiwaneseScorePanel({ result, isDealer }: { result: TaiwaneseScoreResult; isDealer: boolean }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!result.isValid && result.invalidReason) {
    return (
      <div className="rounded-2xl p-5" style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
        <p className="font-semibold" style={{ color: '#B91C1C' }}>❌ {result.invalidReason}</p>
      </div>
    );
  }

  const headerBg = result.isPingOh
    ? 'var(--color-porcelain)'
    : result.isBuanOh
    ? 'var(--color-jade)'
    : 'var(--color-ink)';

  const handLabel = result.isPingOh
    ? '🀄 Ping-oh 平胡 — All-run hand!'
    : result.isBuanOh
    ? `🏆 ${result.specialHand ?? 'Buan-oh 滿胡 — Limit hand!'}`
    : result.isMinimumHand
    ? '🐔 Go-ki-si-pa 五起四趴 — Minimum win'
    : '✅ Valid hand';

  // Formula intermediate values, shown at the bottom of the panel
  const rounded = Math.ceil(result.basePoints * 4 / 10) * 10;
  const beforeTai = rounded + 20;
  const rawTotal = Math.round(beforeTai * Math.pow(2, result.tai));

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--color-cream-dark)' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ background: headerBg, color: '#fff' }}>
        <p className="text-sm font-medium opacity-80 mb-1">{handLabel}</p>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <p className="text-xs opacity-70 mb-0.5">{isDealer ? 'Your score (dealer)' : 'Your score'}</p>
            <p className="text-4xl font-bold">{isDealer ? result.dealerScore : result.finalScore}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">{isDealer ? 'Each non-dealer pays' : 'Dealer pays you'}</p>
            <p className="text-2xl font-bold">{isDealer ? result.finalScore : result.dealerScore}</p>
          </div>
          {result.tai > 0 && (
            <div className="ml-auto text-right">
              <p className="text-xs opacity-70 mb-0.5">Tai</p>
              <p className="text-2xl font-bold">×{Math.pow(2, result.tai)}</p>
              <p className="text-xs opacity-60">{result.tai} tai</p>
            </div>
          )}
        </div>
      </div>

      {/* Near ping-oh notice */}
      {result.nearPingOh && (
        <div className="px-4 py-2.5 text-xs" style={{ background: 'var(--color-jade-pale)', borderBottom: '1px solid var(--color-jade)', color: 'var(--color-jade)' }}>
          Almost ping-oh — only non-zero because of {result.nearPingOhReason ?? 'a bonus'}.
        </div>
      )}

      {/* Breakdown table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', background: 'var(--color-cream-light)' }}>
              <th className="px-4 py-2 text-left font-semibold text-xs" style={{ color: 'var(--color-stone)' }}>Set</th>
              <th className="px-2 py-2 text-right font-semibold text-xs" style={{ color: 'var(--color-stone)' }}>Pts</th>
              <th className="px-2 py-2 text-right font-semibold text-xs" style={{ color: 'var(--color-stone)' }}>Tai</th>
            </tr>
          </thead>
          <tbody>
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
                  {expanded === i && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-stone)' }}>
                      {item.explanation}
                    </p>
                  )}
                </td>
                <td className="py-2 px-2 text-right font-mono" style={{ color: item.points > 0 ? 'var(--color-jade)' : 'var(--color-mist)' }}>
                  {item.points > 0 ? `+${item.points}` : '—'}
                </td>
                <td className="py-2 px-2 text-right font-mono" style={{ color: item.tai > 0 ? 'var(--color-porcelain)' : 'var(--color-mist)' }}>
                  {item.tai > 0 ? `+${item.tai}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formula */}
      {!result.isPingOh && (
        <div className="px-5 py-3 text-xs" style={{ background: 'var(--color-cream-light)', borderTop: '1px solid var(--color-cream-dark)', color: 'var(--color-stone)' }}>
          {result.isBuanOh ? (
            <span className="font-mono">
              {result.specialHand && !result.specialHand.startsWith('Buan')
                ? 'Limit hand - scores maximum '
                : `Calculated: ${rawTotal} - exceeds limit, capped at `}
              <strong style={{ color: 'var(--color-jade)' }}>600</strong>
            </span>
          ) : (
            <span className="font-mono">
              ({result.basePoints} × 4 → {rounded}) + 20 = {beforeTai}
              {result.tai > 0 && ` × 2^${result.tai} (${Math.pow(2, result.tai)}x)`}
              {' = '}
              <strong style={{ color: 'var(--color-ink)' }}>{result.finalScore}</strong>
            </span>
          )}
        </div>
      )}

      {/* Flat bonuses */}
      {result.flatBonuses.length > 0 && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--color-cream-dark)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-mist)' }}>
            Flat bonuses (each player pays separately)
          </p>
          {result.flatBonuses.map((b, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span style={{ color: 'var(--color-stone)' }}>{b.label}</span>
              <span className="font-semibold font-mono" style={{ color: 'var(--color-jade)' }}>+{b.amount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
