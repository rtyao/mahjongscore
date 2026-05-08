'use client';

import { useState, useCallback } from 'react';
import type { CalculatorState, TileGroup, TileInstance, WindDirection, KangType } from '@/types/mahjong';
import { getTile, CHARACTER_TILES, BAMBOO_TILES, CIRCLE_TILES, WIND_TILES, DRAGON_TILES, FLOWER_TILES, SEASON_TILES } from '@/lib/tiles';
import { calculateScore } from '@/lib/scoring';
import { detectHand } from '@/lib/handDetection';
import MahjongTile from '@/components/MahjongTile';
import type { Tile } from '@/types/mahjong';

const WIND_LABELS: Record<WindDirection, string> = { east: 'East', south: 'South', west: 'West', north: 'North' };
const WIND_CHARS: Record<WindDirection, string> = { east: '東', south: '南', west: '西', north: '北' };
const INITIAL_STATE: CalculatorState = {
  seatWind: 'east',
  isDealer: false,
  isMahjong: true,
  isSelfDraw: false,
  instances: [],
  groups: [],
  flowers: [],
  seasons: [],
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function countInHand(instances: TileInstance[], tileId: string): number {
  return instances.filter(i => i.tileId === tileId).length;
}

// ── Tile Picker (suits + flowers/seasons merged) ──────────────────
function TilePickerGrid({
  instances, flowers, seasons,
  onAdd, onRemove, onToggleFlower, onToggleSeason,
}: {
  instances: TileInstance[];
  flowers: number[];
  seasons: number[];
  onAdd: (tile: Tile) => void;
  onRemove: (tile: Tile) => void;
  onToggleFlower: (v: number) => void;
  onToggleSeason: (v: number) => void;
}) {
  const [view, setView] = useState<'suit' | 'all'>('all');

  const suitGroups = [
    { label: 'Characters 萬', tiles: CHARACTER_TILES },
    { label: 'Bamboo 條', tiles: BAMBOO_TILES },
    { label: 'Circles 餅', tiles: CIRCLE_TILES },
    { label: 'Special Tiles - Winds 風 & Dragons 龍', tiles: [...WIND_TILES, ...DRAGON_TILES] },
  ];

  function renderSuitTile(tile: Tile) {
    const count = countInHand(instances, tile.id);
    const maxed = count >= tile.maxCount;
    return (
      <div key={tile.id} className="relative">
        <MahjongTile
          tile={tile}
          size="sm"
          count={count > 0 ? count : undefined}
          onClick={maxed ? undefined : () => onAdd(tile)}
          className={maxed ? 'opacity-30 cursor-not-allowed' : ''}
        />
        {count > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(tile); }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-bold z-10"
            style={{ fontSize: 9, background: 'var(--color-stone)', color: '#fff', lineHeight: 1 }}
            title="Remove one"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  const bonusRow = (
    <div>
      <div className="px-3 py-1.5 text-xs font-semibold" style={{ background: 'var(--color-cream)', color: 'var(--color-stone)' }}>
        Flowers 花 & Seasons 季{' '}
        <span className="font-normal" style={{ color: 'var(--color-mist)' }}>— tap to add/remove</span>
      </div>
      <div className="px-2 py-2 flex flex-wrap gap-1" style={{ background: '#fff' }}>
        {FLOWER_TILES.map(t => (
          <MahjongTile key={t.id} tile={t} size="sm" selected={flowers.includes(t.value)} onClick={() => onToggleFlower(t.value)} />
        ))}
        {SEASON_TILES.map(t => (
          <MahjongTile key={t.id} tile={t} size="sm" selected={seasons.includes(t.value)} onClick={() => onToggleSeason(t.value)} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-end mb-3">
        <div className="flex gap-1 text-xs">
          {(['suit', 'all'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-2 py-1 rounded font-medium transition-colors"
              style={{
                background: view === v ? 'var(--color-jade)' : 'var(--color-cream)',
                color: view === v ? '#fff' : 'var(--color-stone)',
                border: '1px solid var(--color-cream-dark)',
              }}
            >
              {v === 'suit' ? 'By Suit' : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-cream-dark)' }}>
        {view === 'suit' ? (
          <>
            {suitGroups.map(({ label, tiles }) => (
              <div key={label} style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                <div className="px-3 py-1.5 text-xs font-semibold" style={{ background: 'var(--color-cream)', color: 'var(--color-stone)' }}>
                  {label}
                </div>
                <div className="px-2 py-2 flex flex-wrap gap-1" style={{ background: '#fff' }}>
                  {tiles.map(renderSuitTile)}
                </div>
              </div>
            ))}
            <div>{bonusRow}</div>
          </>
        ) : (
          <>
            <div className="px-2 py-2 flex flex-wrap gap-1" style={{ background: '#fff' }}>
              {[...CHARACTER_TILES, ...BAMBOO_TILES, ...CIRCLE_TILES, ...WIND_TILES, ...DRAGON_TILES].map(renderSuitTile)}
            </div>
            <div style={{ borderTop: '1px solid var(--color-cream-dark)' }}>{bonusRow}</div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Hand Tray (sticky bottom) ─────────────────────────────────────
function HandTray({
  instances, flowers, seasons, isMahjong, kangCount,
  onRemoveInstance, onToggleFlower, onToggleSeason, onReset,
}: {
  instances: TileInstance[];
  flowers: number[];
  seasons: number[];
  isMahjong: boolean;
  kangCount: number;
  onRemoveInstance: (id: string) => void;
  onToggleFlower: (v: number) => void;
  onToggleSeason: (v: number) => void;
  onReset: () => void;
}) {
  const tileCount = instances.length;
  const target = (isMahjong ? 17 : 16) + kangCount;
  const atTarget = tileCount === target;
  const overTarget = tileCount > target;
  const bonusCount = flowers.length + seasons.length;
  const sorted = [...instances].sort((a, b) => a.tileId.localeCompare(b.tileId));

  return (
    <div
      className="sticky bottom-0 z-40"
      style={{
        background: 'rgba(250,246,238,0.97)',
        borderTop: '1.5px solid var(--color-cream-dark)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div className="max-w-5xl mx-auto px-3 pt-3 pb-2">
        {/* Bonus tile row */}
        {bonusCount > 0 && (
          <div className="flex gap-1 flex-wrap mb-2 pb-1.5" style={{ borderBottom: '1px dashed var(--color-cream-dark)' }}>
            {FLOWER_TILES.filter(t => flowers.includes(t.value)).map(t => (
              <div key={t.id} className="relative">
                <MahjongTile tile={t} size="xs" selected onClick={() => onToggleFlower(t.value)} />
              </div>
            ))}
            {SEASON_TILES.filter(t => seasons.includes(t.value)).map(t => (
              <div key={t.id} className="relative">
                <MahjongTile tile={t} size="xs" selected onClick={() => onToggleSeason(t.value)} />
              </div>
            ))}
          </div>
        )}

        {/* Main tile row + counter + clear */}
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-0.5 pt-2 pb-1" style={{ minWidth: 'max-content' }}>
              {sorted.length === 0 ? (
                <span className="text-xs py-2 italic" style={{ color: 'var(--color-mist)' }}>
                  Tap tiles above to build your hand
                </span>
              ) : (
                sorted.map(inst => {
                  const tile = getTile(inst.tileId);
                  return (
                    <div key={inst.instanceId} className="relative flex-shrink-0">
                      <MahjongTile tile={tile} size="xs" winning={inst.isWinningTile} />
                      <button
                        onClick={() => onRemoveInstance(inst.instanceId)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-bold z-10"
                        style={{ fontSize: 9, background: '#ef4444', color: '#fff', lineHeight: 1 }}
                        title="Remove tile"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Counter + clear */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div
              className="px-2.5 py-1 rounded-lg font-bold text-sm"
              style={{
                background: atTarget ? 'var(--color-jade)' : overTarget ? '#ef4444' : 'var(--color-cream)',
                color: atTarget || overTarget ? '#fff' : 'var(--color-stone)',
                border: `1px solid ${atTarget ? 'var(--color-jade)' : overTarget ? '#ef4444' : 'var(--color-cream-dark)'}`,
                minWidth: 52,
                textAlign: 'center',
              }}
            >
              {tileCount}/{target}
            </div>
            {bonusCount > 0 && (
              <div className="text-xs" style={{ color: 'var(--color-mist)', textAlign: 'center' }}>
                +{bonusCount} bonus
              </div>
            )}
            {(instances.length > 0 || flowers.length > 0 || seasons.length > 0) && (
              <button
                onClick={onReset}
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: 'var(--color-cream)', color: 'var(--color-stone)', border: '1px solid var(--color-cream-dark)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Group Card ────────────────────────────────────────────────────
function GroupCard({
  group, instances,
  onSetType, onToggleConcealed, onSetKangType,
  onMarkWinning, onRemoveGroup,
}: {
  group: TileGroup;
  instances: TileInstance[];
  onSetType: (id: string, type: TileGroup['type']) => void;
  onToggleConcealed: (id: string) => void;
  onSetKangType: (id: string, kt: KangType) => void;
  onMarkWinning: (groupId: string, instanceId: string) => void;
  onRemoveGroup: (id: string) => void;
}) {
  const tiles = group.instanceIds
    .map(iid => instances.find(i => i.instanceId === iid))
    .filter(Boolean) as TileInstance[];

  const hasWinning = tiles.some(t => t.isWinningTile);

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: group.concealed ? 'var(--color-porcelain-pale)' : '#fff',
        border: `1.5px solid ${group.concealed ? 'var(--color-porcelain)' : 'var(--color-cream-dark)'}`,
      }}
    >
      <div className="flex gap-1 flex-wrap mb-2.5">
        {tiles.map(inst => {
          const tile = getTile(inst.tileId);
          return (
            <MahjongTile
              key={inst.instanceId}
              tile={tile}
              size="sm"
              winning={inst.isWinningTile}
              concealed={group.concealed}
              onClick={() => onMarkWinning(group.id, inst.instanceId)}
            />
          );
        })}
        {tiles.length === 0 && (
          <span className="text-xs italic" style={{ color: 'var(--color-mist)' }}>empty group</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={group.type}
          onChange={e => onSetType(group.id, e.target.value as TileGroup['type'])}
          className="text-xs px-2 py-1 rounded-md border font-medium"
          style={{ borderColor: 'var(--color-cream-dark)', background: 'var(--color-cream-light)', color: 'var(--color-ink)' }}
        >
          <option value="incomplete">— Set type —</option>
          <option value="chow">Chow (run of 3)</option>
          <option value="pong">Pong (3 of a kind)</option>
          <option value="kang">Kang (4 of a kind)</option>
          <option value="pair">Pair</option>
        </select>

        {(group.type === 'pong' || group.type === 'kang') && (
          <button
            onClick={() => onToggleConcealed(group.id)}
            className="text-xs px-2 py-1 rounded-md border font-medium transition-colors"
            style={{
              borderColor: group.concealed ? 'var(--color-porcelain)' : 'var(--color-cream-dark)',
              background: group.concealed ? 'var(--color-porcelain)' : 'var(--color-cream-light)',
              color: group.concealed ? '#fff' : 'var(--color-stone)',
            }}
          >
            {group.concealed ? '🔒 Concealed' : '🔓 Revealed'}
          </button>
        )}

        {group.type === 'kang' && (
          <select
            value={group.kangType}
            onChange={e => onSetKangType(group.id, e.target.value as KangType)}
            className="text-xs px-2 py-1 rounded-md border font-medium"
            style={{ borderColor: 'var(--color-cream-dark)', background: 'var(--color-cream-light)', color: 'var(--color-ink)' }}
          >
            <option value="revealed">Revealed kang (+100)</option>
            <option value="hidden">Hidden kang (+200)</option>
            <option value="tts">Starting kang (+400)</option>
          </select>
        )}

        {tiles.length > 0 && (
          <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
            {hasWinning ? '★ winning tile marked' : 'tap a tile to mark as winning'}
          </span>
        )}

        <button
          onClick={() => onRemoveGroup(group.id)}
          className="ml-auto text-xs px-2 py-1 rounded-md border"
          style={{ borderColor: 'var(--color-cream-dark)', color: 'var(--color-stone)', background: 'var(--color-cream-light)' }}
        >
          ✕ Remove
        </button>
      </div>
    </div>
  );
}

// ── Score Display ─────────────────────────────────────────────────
function ScoreDisplay({ result, isDealer }: { result: ReturnType<typeof calculateScore>; isDealer: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);

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
    ? '🀄 Ping-oh — All-run hand!'
    : result.isBuanOh
    ? '🏆 Buan-oh — Limit hand!'
    : result.isMinimumHand
    ? '🐔 Go-ki-si-pa — Minimum win'
    : '✅ Valid hand';

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
                onClick={() => setExpanded(expanded === `${i}` ? null : `${i}`)}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom: '1px solid var(--color-cream-light)',
                  background: expanded === `${i}` ? 'var(--color-cream-light)' : 'transparent',
                }}
              >
                <td className="px-4 py-2" style={{ color: 'var(--color-ink)' }}>
                  <span className="font-medium">{item.label}</span>
                  {expanded === `${i}` && (
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
              Calculated: {Math.round((Math.ceil(result.basePoints * 4 / 10) * 10 + 20) * Math.pow(2, result.tai))} - exceeds limit, capped at{' '}
              <strong style={{ color: 'var(--color-jade)' }}>600</strong>
            </span>
          ) : (
            <span className="font-mono">
              ({result.basePoints} × 4 → {Math.ceil(result.basePoints * 4 / 10) * 10}) + 20 = {Math.ceil(result.basePoints * 4 / 10) * 10 + 20}
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

// ── Main Calculator ───────────────────────────────────────────────
export default function CalculatorClient() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const [result, setResult] = useState<ReturnType<typeof calculateScore> | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [detectError, setDetectError] = useState<string | null>(null);

  const addTile = useCallback((tile: Tile) => {
    setState(prev => {
      const current = prev.instances.filter(i => i.tileId === tile.id).length;
      if (current >= tile.maxCount) return prev;
      return {
        ...prev,
        instances: [...prev.instances, { instanceId: uid(), tileId: tile.id, groupId: null, isWinningTile: false }],
      };
    });
    setResult(null);
    setCalcError(null);
  }, []);

  const removeTile = useCallback((tile: Tile) => {
    setState(prev => {
      const last = [...prev.instances].reverse().find(i => i.tileId === tile.id);
      if (!last) return prev;
      return {
        ...prev,
        instances: prev.instances.filter(i => i.instanceId !== last.instanceId),
        groups: prev.groups
          .map(g => ({ ...g, instanceIds: g.instanceIds.filter(id => id !== last.instanceId) }))
          .filter(g => g.instanceIds.length > 0),
      };
    });
    setResult(null);
  }, []);

  const removeInstance = useCallback((instanceId: string) => {
    setState(prev => ({
      ...prev,
      instances: prev.instances.filter(i => i.instanceId !== instanceId),
      groups: prev.groups
        .map(g => ({ ...g, instanceIds: g.instanceIds.filter(id => id !== instanceId) }))
        .filter(g => g.instanceIds.length > 0),
    }));
    setResult(null);
  }, []);

  const autoDetect = () => {
    const tileIds = state.instances.map(i => i.tileId);
    const minTiles = state.isMahjong ? 17 : 16;
    if (tileIds.length < minTiles) {
      setDetectError(`Need at least ${minTiles} tiles to auto-detect - you have ${tileIds.length}`);
      return;
    }
    // For hands with kangs, total tiles will be minTiles + n (one extra per kang). Allow any count >= minTiles.
    const handResult = detectHand(tileIds);
    if (!handResult) {
      setDetectError("Couldn't find a valid hand — check your tiles or group manually");
      return;
    }
    setDetectError(null);

    const usedInstanceIds = new Set<string>();
    const newGroups: TileGroup[] = [];

    for (const set of handResult.sets) {
      const groupInstanceIds: string[] = [];
      for (const tileId of set.tileIds) {
        const inst = state.instances.find(i => i.tileId === tileId && !usedInstanceIds.has(i.instanceId));
        if (inst) { groupInstanceIds.push(inst.instanceId); usedInstanceIds.add(inst.instanceId); }
      }
      newGroups.push({ id: uid(), type: set.type as TileGroup['type'], concealed: false, kangType: 'revealed', instanceIds: groupInstanceIds });
    }

    const pairInstanceIds: string[] = [];
    for (const tileId of handResult.pair.tileIds) {
      const inst = state.instances.find(i => i.tileId === tileId && !usedInstanceIds.has(i.instanceId));
      if (inst) { pairInstanceIds.push(inst.instanceId); usedInstanceIds.add(inst.instanceId); }
    }
    newGroups.push({ id: uid(), type: 'pair', concealed: false, kangType: 'revealed', instanceIds: pairInstanceIds });

    setState(prev => ({
      ...prev,
      instances: prev.instances.map(i => ({ ...i, isWinningTile: false })),
      groups: newGroups,
    }));
    setResult(null);
  };

  const addGroup = () => {
    setState(prev => ({
      ...prev,
      groups: [...prev.groups, { id: uid(), type: 'incomplete', concealed: false, kangType: 'revealed', instanceIds: [] }],
    }));
  };

  const setGroupType = (groupId: string, type: TileGroup['type']) => {
    setState(prev => ({ ...prev, groups: prev.groups.map(g => g.id === groupId ? { ...g, type } : g) }));
    setResult(null);
  };

  const toggleConcealed = (groupId: string) => {
    setState(prev => ({ ...prev, groups: prev.groups.map(g => g.id === groupId ? { ...g, concealed: !g.concealed } : g) }));
    setResult(null);
  };

  const setKangType = (groupId: string, kt: KangType) => {
    setState(prev => ({ ...prev, groups: prev.groups.map(g => g.id === groupId ? { ...g, kangType: kt } : g) }));
    setResult(null);
  };

  const markWinningTile = (groupId: string, instanceId: string) => {
    setState(prev => ({
      ...prev,
      instances: prev.instances.map(i => ({
        ...i,
        isWinningTile: i.instanceId === instanceId ? !i.isWinningTile : false,
      })),
    }));
    setResult(null);
  };

  const removeGroup = (groupId: string) => {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    setState(prev => ({
      ...prev,
      instances: prev.instances.filter(i => !group.instanceIds.includes(i.instanceId)),
      groups: prev.groups.filter(g => g.id !== groupId),
    }));
    setResult(null);
  };

  const toggleFlower = (val: number) => {
    setState(prev => ({
      ...prev,
      flowers: prev.flowers.includes(val) ? prev.flowers.filter(v => v !== val) : [...prev.flowers, val],
    }));
    setResult(null);
  };

  const toggleSeason = (val: number) => {
    setState(prev => ({
      ...prev,
      seasons: prev.seasons.includes(val) ? prev.seasons.filter(v => v !== val) : [...prev.seasons, val],
    }));
    setResult(null);
  };

  const calculate = () => {
    if (state.instances.length > 0 && state.groups.length === 0) {
      setCalcError('Run "Auto-detect sets" first, then calculate.');
      return;
    }
    if (state.isMahjong) {
      const winningInst = state.instances.find(i => i.isWinningTile);
      if (!winningInst) {
        setCalcError('Tap your winning tile to mark it ★ before calculating.');
        return;
      }
      if (!state.isSelfDraw) {
        const winningGroup = state.groups.find(g => g.instanceIds.includes(winningInst.instanceId));
        if (winningGroup?.concealed) {
          setCalcError('Winning tile is in a concealed set, but win by discard is selected. If you stole the tile to win, the set is revealed - uncheck concealed, or switch to self-draw.');
          return;
        }
      }
    }
    setCalcError(null);
    setResult(calculateScore(state));
  };

  const reset = () => {
    setState(INITIAL_STATE);
    setResult(null);
    setCalcError(null);
    setDetectError(null);
  };

  return (
    <div style={{ background: 'var(--color-cream-light)', paddingBottom: '100px' }} className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Hand Calculator</h1>
          <p className="text-sm" style={{ color: 'var(--color-stone)' }}>
            Filipino-Chinese Mahjong · 16 tiles · 5 sets + 1 pair
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-5">

            {/* Step 1: Pick tiles */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 1 - Pick Your Tiles</h2>
              <TilePickerGrid
                instances={state.instances}
                flowers={state.flowers}
                seasons={state.seasons}
                onAdd={addTile}
                onRemove={removeTile}
                onToggleFlower={toggleFlower}
                onToggleSeason={toggleSeason}
              />
            </section>

            {/* Step 2: Build sets */}
            {state.instances.length > 0 && (
              <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
                <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 2 - Build Your Sets</h2>
                <p className="text-xs mb-4" style={{ color: 'var(--color-stone)' }}>
                  Hit Auto-detect to sort your hand automatically. Then tap any tile to mark it ★ as your winning tile. For kangs or concealeds, adjust manually.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={autoDetect}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-jade)', color: '#fff' }}
                  >
                    Auto-detect sets
                  </button>
                  <button
                    onClick={addGroup}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--color-cream)', color: 'var(--color-stone)', border: '1px solid var(--color-cream-dark)' }}
                  >
                    + Add group manually
                  </button>
                </div>

                {detectError && (
                  <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C' }}>
                    {detectError}
                  </div>
                )}

                {state.groups.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {state.groups.map(group => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        instances={state.instances}
                        onSetType={setGroupType}
                        onToggleConcealed={toggleConcealed}
                        onSetKangType={setKangType}
                        onMarkWinning={markWinningTile}
                        onRemoveGroup={removeGroup}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Step 3: Setup */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 3 - Setup</h2>
              <div className="flex flex-wrap gap-5">
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>Your Seat</p>
                  <div className="flex gap-1.5">
                    {(['east', 'south', 'west', 'north'] as WindDirection[]).map(w => (
                      <button
                        key={w}
                        onClick={() => { setState(p => ({ ...p, seatWind: w })); setResult(null); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex flex-col items-center leading-tight"
                        style={{
                          background: state.seatWind === w ? 'var(--color-jade)' : 'var(--color-cream)',
                          color: state.seatWind === w ? '#fff' : 'var(--color-stone)',
                          border: `1px solid ${state.seatWind === w ? 'var(--color-jade)' : 'var(--color-cream-dark)'}`,
                        }}
                      >
                        <span className="text-base">{WIND_CHARS[w]}</span>
                        <span className="text-xs">{WIND_LABELS[w]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>Role</p>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={state.isDealer}
                      onChange={e => { setState(p => ({ ...p, isDealer: e.target.checked })); setResult(null); }}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--color-jade)' }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Dealer</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Step 4: Win conditions */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 4 - Win Conditions</h2>
              <div className="flex flex-wrap gap-5">
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>Did you win?</p>
                  <div className="flex gap-1.5">
                    {[true, false].map(v => (
                      <button
                        key={String(v)}
                        onClick={() => { setState(p => ({ ...p, isMahjong: v, isSelfDraw: v ? p.isSelfDraw : false })); setResult(null); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: state.isMahjong === v ? 'var(--color-jade)' : 'var(--color-cream)',
                          color: state.isMahjong === v ? '#fff' : 'var(--color-stone)',
                          border: `1px solid ${state.isMahjong === v ? 'var(--color-jade)' : 'var(--color-cream-dark)'}`,
                        }}
                      >
                        {v ? '✅ Yes - Mahjong!' : '❌ No - Losing hand'}
                      </button>
                    ))}
                  </div>
                </div>

                {state.isMahjong && (
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>Self-draw (Zi-mo)?</p>
                    <div className="flex gap-1.5">
                      {[false, true].map(v => (
                        <button
                          key={String(v)}
                          onClick={() => { setState(p => ({ ...p, isSelfDraw: v })); setResult(null); }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            background: state.isSelfDraw === v ? 'var(--color-porcelain)' : 'var(--color-cream)',
                            color: state.isSelfDraw === v ? '#fff' : 'var(--color-stone)',
                            border: `1px solid ${state.isSelfDraw === v ? 'var(--color-porcelain)' : 'var(--color-cream-dark)'}`,
                          }}
                        >
                          {v ? '🤚 Self-draw (+0.5 + 100 flat)' : 'Stolen discard'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Calculate / Reset */}
            <div className="flex gap-3">
              <button
                onClick={calculate}
                className="flex-1 py-3.5 rounded-xl font-bold text-base transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-jade)', color: '#fff' }}
              >
                🀄 Calculate Score
              </button>
              <button
                onClick={reset}
                className="px-4 py-3.5 rounded-xl font-medium text-sm"
                style={{ background: 'var(--color-cream)', color: 'var(--color-stone)', border: '1px solid var(--color-cream-dark)' }}
              >
                Clear Hand
              </button>
            </div>
          </div>

          {/* Right column: Score display */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {calcError ? (
              <div className="rounded-2xl p-5" style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                <p className="font-semibold" style={{ color: '#B91C1C' }}>❌ {calcError}</p>
              </div>
            ) : result ? (
              <ScoreDisplay result={result} isDealer={state.isDealer} />
            ) : (
              <div className="rounded-2xl p-6 text-center" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
                <p className="text-4xl mb-3">🀄</p>
                <p className="font-medium mb-1" style={{ color: 'var(--color-ink)' }}>Score appears here</p>
                <p className="text-sm" style={{ color: 'var(--color-mist)' }}>
                  Build your hand, then click Calculate.
                </p>
                <div className="mt-5 pt-4 text-left text-xs" style={{ borderTop: '1px solid var(--color-cream-dark)', color: 'var(--color-stone)' }}>
                  <p className="font-semibold mb-2">Quick guide:</p>
                  <ol className="flex flex-col gap-1.5 list-decimal list-inside">
                    <li>Choose your seat wind</li>
                    <li>Pick all 17 tiles (flowers/seasons too)</li>
                    <li>Hit Auto-detect sets</li>
                    <li>Tap your winning tile to mark it ★</li>
                    <li>Adjust kangs or concealeds if needed</li>
                    <li>Set win condition, then calculate</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating hand tray */}
      <HandTray
        instances={state.instances}
        flowers={state.flowers}
        seasons={state.seasons}
        isMahjong={state.isMahjong}
        kangCount={state.groups.filter(g => g.type === 'kang').length}
        onRemoveInstance={removeInstance}
        onToggleFlower={toggleFlower}
        onToggleSeason={toggleSeason}
        onReset={reset}
      />
    </div>
  );
}
