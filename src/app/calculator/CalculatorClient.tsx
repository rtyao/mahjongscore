'use client';

import { useState, useCallback, useId } from 'react';
import type { CalculatorState, TileGroup, TileInstance, WindDirection, KangType } from '@/types/mahjong';
import { getTile, ALL_TILES, CHARACTER_TILES, BAMBOO_TILES, CIRCLE_TILES, WIND_TILES, DRAGON_TILES, FLOWER_TILES, SEASON_TILES, windToValue } from '@/lib/tiles';
import { calculateScore } from '@/lib/scoring';
import MahjongTile from '@/components/MahjongTile';
import type { Tile } from '@/types/mahjong';

const WIND_LABELS: Record<WindDirection, string> = { east: 'East', south: 'South', west: 'West', north: 'North' };
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

// Count how many instances of a tileId are in the hand (non-flower/season)
function countInHand(instances: TileInstance[], tileId: string): number {
  return instances.filter(i => i.tileId === tileId).length;
}

// ── Tile Grid (picker) ────────────────────────────────────────────
function TileGrid({
  instances,
  onAdd,
  onRemove,
}: {
  instances: TileInstance[];
  onAdd: (tile: Tile) => void;
  onRemove: (tile: Tile) => void;
}) {
  const [view, setView] = useState<'suit' | 'all'>('suit');

  const groups = [
    { label: 'Characters 萬', tiles: CHARACTER_TILES },
    { label: 'Bamboo 條', tiles: BAMBOO_TILES },
    { label: 'Circles 餅', tiles: CIRCLE_TILES },
    { label: 'Winds 風', tiles: WIND_TILES },
    { label: 'Dragons 龍', tiles: DRAGON_TILES },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-stone)' }}>Add Tiles</h3>
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
        {groups.map(({ label, tiles }) => (
          <div key={label} style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
            <div className="px-3 py-1.5 text-xs font-semibold" style={{ background: 'var(--color-cream)', color: 'var(--color-stone)' }}>
              {label}
            </div>
            <div className="px-2 py-2 flex flex-wrap gap-1.5" style={{ background: '#fff' }}>
              {tiles.map(tile => {
                const count = countInHand(instances, tile.id);
                const maxed = count >= tile.maxCount;
                return (
                  <div key={tile.id} className="relative flex flex-col items-center gap-0.5">
                    <MahjongTile
                      tile={tile}
                      size="sm"
                      count={count > 0 ? count : undefined}
                      onClick={maxed ? undefined : () => onAdd(tile)}
                      className={maxed ? 'opacity-30' : ''}
                    />
                    {count > 0 && (
                      <button
                        onClick={() => onRemove(tile)}
                        className="text-xs rounded px-1 leading-none"
                        style={{ color: 'var(--color-stone)', background: 'var(--color-cream)' }}
                        title="Remove one"
                      >
                        −
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Flower / Season picker ────────────────────────────────────────
function BonusTilePicker({
  flowers, seasons,
  onToggleFlower, onToggleSeason,
}: {
  flowers: number[]; seasons: number[];
  onToggleFlower: (v: number) => void;
  onToggleSeason: (v: number) => void;
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-stone)' }}>Flowers &amp; Seasons</p>
      <div className="flex flex-wrap gap-2">
        {FLOWER_TILES.map(t => (
          <MahjongTile
            key={t.id}
            tile={t}
            size="sm"
            selected={flowers.includes(t.value)}
            onClick={() => onToggleFlower(t.value)}
          />
        ))}
        {SEASON_TILES.map(t => (
          <MahjongTile
            key={t.id}
            tile={t}
            size="sm"
            selected={seasons.includes(t.value)}
            onClick={() => onToggleSeason(t.value)}
          />
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--color-mist)' }}>
        Tap to add/remove. Highlighted = in hand.
      </p>
    </div>
  );
}

// ── Group card ────────────────────────────────────────────────────
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
      {/* Tiles row */}
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {tiles.map((inst) => {
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

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Set type */}
        <select
          value={group.type}
          onChange={e => onSetType(group.id, e.target.value as TileGroup['type'])}
          className="text-xs px-2 py-1 rounded-md border font-medium"
          style={{ borderColor: 'var(--color-cream-dark)', background: 'var(--color-cream-light)', color: 'var(--color-ink)' }}
        >
          <option value="incomplete">— Set type —</option>
          <option value="chow">Chow (run)</option>
          <option value="pong">Pong (3 of a kind)</option>
          <option value="kang">Kang (4 of a kind)</option>
          <option value="pair">Pair</option>
        </select>

        {/* Concealed toggle */}
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

        {/* Kang type */}
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

        {/* Winning tile hint */}
        {tiles.length > 0 && (
          <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
            {hasWinning ? '★ winning tile marked' : 'tap a tile to mark as winning'}
          </span>
        )}

        {/* Remove */}
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
        <p className="font-semibold text-red-700">❌ {result.invalidReason}</p>
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
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs opacity-70 mb-0.5">Score</p>
            <p className="text-4xl font-bold">{result.finalScore}</p>
          </div>
          <div>
            <p className="text-xs opacity-70 mb-0.5">Dealer pays</p>
            <p className="text-2xl font-bold">{result.dealerScore}</p>
          </div>
          {result.tai > 0 && (
            <div>
              <p className="text-xs opacity-70 mb-0.5">Tai</p>
              <p className="text-2xl font-bold">×2<sup>{result.tai}</sup> = ×{Math.pow(2, result.tai)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Near ping-oh notice */}
      {result.nearPingOh && (
        <div className="px-5 py-2.5 text-sm" style={{ background: 'var(--color-porcelain-pale)', color: 'var(--color-porcelain)', borderBottom: '1px solid var(--color-cream-dark)' }}>
          ℹ️ Almost ping-oh — {result.nearPingOhReason} pushed this to a scored hand.
        </div>
      )}

      {/* Breakdown */}
      <div style={{ background: '#fff' }}>
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-mist)' }}>Score Breakdown</p>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--color-mist)' }} className="text-xs">
                <th className="text-left pb-2 font-medium">Set / Bonus</th>
                <th className="text-right pb-2 font-medium w-12">Pts</th>
                <th className="text-right pb-2 font-medium w-12">Tai</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((item, i) => (
                <tr
                  key={i}
                  className="border-t cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: 'var(--color-cream-dark)' }}
                  onClick={() => setExpanded(expanded === String(i) ? null : String(i))}
                >
                  <td className="py-2 pr-2" style={{ color: 'var(--color-ink)' }}>
                    <span>{item.label}</span>
                    {expanded === String(i) && (
                      <p className="text-xs mt-1 leading-relaxed rounded-md p-2" style={{ color: 'var(--color-porcelain)', background: 'var(--color-porcelain-pale)' }}>
                        💡 {item.explanation}
                      </p>
                    )}
                  </td>
                  <td className="py-2 text-right font-mono" style={{ color: item.points > 0 ? 'var(--color-jade)' : 'var(--color-mist)' }}>
                    {item.points > 0 ? `+${item.points}` : '—'}
                  </td>
                  <td className="py-2 text-right font-mono" style={{ color: item.tai > 0 ? 'var(--color-porcelain)' : 'var(--color-mist)' }}>
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
            <span className="font-mono">
              ({result.basePoints} × 4 → {Math.ceil(result.basePoints * 4 / 10) * 10}) + 20 = {Math.ceil(result.basePoints * 4 / 10) * 10 + 20}
              {result.tai > 0 && ` × 2^${result.tai} (${Math.pow(2, result.tai)}x)`}
              {' = '}
              <strong style={{ color: 'var(--color-ink)' }}>{result.finalScore}</strong>
            </span>
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
    </div>
  );
}

// ── Main Calculator ───────────────────────────────────────────────
export default function CalculatorClient() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const [result, setResult] = useState<ReturnType<typeof calculateScore> | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const totalHandTiles = state.instances.length;
  const neededTiles = state.isMahjong ? 17 : 'any';

  const addTile = useCallback((tile: Tile) => {
    const current = state.instances.filter(i => i.tileId === tile.id).length;
    if (current >= tile.maxCount) return;

    const instanceId = uid();
    // Find a group to add to, or create a new one
    // Auto-grouping: put into a group that has <3 of the same tile (for pong) or create new
    let targetGroupId: string | null = null;

    // Find an incomplete group with the same tileId
    const partialGroup = state.groups.find(g => {
      if (g.type === 'incomplete' || g.type === 'chow') return false;
      const groupTileId = state.instances.find(i => i.instanceId === g.instanceIds[0])?.tileId;
      if (groupTileId !== tile.id) return false;
      if (g.type === 'pair' && g.instanceIds.length < 2) return true;
      if (g.type === 'pong' && g.instanceIds.length < 3) return true;
      if (g.type === 'kang' && g.instanceIds.length < 4) return true;
      return false;
    });

    if (partialGroup) {
      targetGroupId = partialGroup.id;
    } else {
      // Create a new group
      const newGroup: TileGroup = {
        id: uid(),
        type: 'incomplete',
        concealed: false,
        kangType: 'revealed',
        instanceIds: [],
      };
      setState(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));
      targetGroupId = newGroup.id;
    }

    const newInstance: TileInstance = { instanceId, tileId: tile.id, groupId: targetGroupId, isWinningTile: false };

    setState(prev => ({
      ...prev,
      instances: [...prev.instances, newInstance],
      groups: prev.groups.map(g =>
        g.id === targetGroupId
          ? { ...g, instanceIds: [...g.instanceIds, instanceId] }
          : g
      ),
    }));
    setResult(null);
  }, [state]);

  const removeTile = useCallback((tile: Tile) => {
    // Remove the last instance of this tile
    const last = [...state.instances].reverse().find(i => i.tileId === tile.id);
    if (!last) return;

    setState(prev => ({
      ...prev,
      instances: prev.instances.filter(i => i.instanceId !== last.instanceId),
      groups: prev.groups
        .map(g => ({ ...g, instanceIds: g.instanceIds.filter(id => id !== last.instanceId) }))
        .filter(g => g.instanceIds.length > 0),
    }));
    setResult(null);
  }, [state]);

  const addGroup = () => {
    const newGroup: TileGroup = { id: uid(), type: 'incomplete', concealed: false, kangType: 'revealed', instanceIds: [] };
    setState(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));
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
    setResult(calculateScore(state));
  };

  const reset = () => {
    setState(INITIAL_STATE);
    setResult(null);
  };

  return (
    <div style={{ background: 'var(--color-cream-light)' }} className="min-h-screen">
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

            {/* Step 1: Setup */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 1 — Setup</h2>
              <div className="flex flex-wrap gap-5">
                {/* Seat wind */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>Your Seat</p>
                  <div className="flex gap-1.5">
                    {(['east', 'south', 'west', 'north'] as WindDirection[]).map(w => (
                      <button
                        key={w}
                        onClick={() => { setState(p => ({ ...p, seatWind: w })); setResult(null); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: state.seatWind === w ? 'var(--color-jade)' : 'var(--color-cream)',
                          color: state.seatWind === w ? '#fff' : 'var(--color-stone)',
                          border: `1px solid ${state.seatWind === w ? 'var(--color-jade)' : 'var(--color-cream-dark)'}`,
                        }}
                      >
                        {WIND_LABELS[w]}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Dealer */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>Role</p>
                  <div className="flex gap-1.5">
                    {[false, true].map(isD => (
                      <button
                        key={String(isD)}
                        onClick={() => { setState(p => ({ ...p, isDealer: isD })); setResult(null); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: state.isDealer === isD ? 'var(--color-jade)' : 'var(--color-cream)',
                          color: state.isDealer === isD ? '#fff' : 'var(--color-stone)',
                          border: `1px solid ${state.isDealer === isD ? 'var(--color-jade)' : 'var(--color-cream-dark)'}`,
                        }}
                      >
                        {isD ? 'Dealer' : 'Non-dealer'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Tile picker */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 2 — Pick Tiles</h2>
              <TileGrid instances={state.instances} onAdd={addTile} onRemove={removeTile} />

              {/* Tile count */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--color-stone)' }}>
                  Hand tiles: <strong style={{ color: totalHandTiles === 17 ? 'var(--color-jade)' : 'var(--color-ink)' }}>{totalHandTiles}</strong>
                  {state.isMahjong && <span style={{ color: 'var(--color-mist)' }}> / 17 needed for mahjong</span>}
                </p>
                <button
                  onClick={addGroup}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{ background: 'var(--color-cream)', color: 'var(--color-stone)', border: '1px solid var(--color-cream-dark)' }}
                >
                  + Add empty group
                </button>
              </div>
            </section>

            {/* Step 3: Groups */}
            {state.groups.length > 0 && (
              <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
                <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 3 — Organise Sets</h2>
                <p className="text-xs mb-4" style={{ color: 'var(--color-stone)' }}>
                  Set each group&apos;s type. Tap a tile to mark it as your ★ winning tile.
                </p>
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
              </section>
            )}

            {/* Flowers & Seasons */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Flowers &amp; Seasons</h2>
              <BonusTilePicker
                flowers={state.flowers}
                seasons={state.seasons}
                onToggleFlower={toggleFlower}
                onToggleSeason={toggleSeason}
              />
            </section>

            {/* Step 4: Win conditions */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 4 — Win Conditions</h2>
              <div className="flex flex-wrap gap-5">
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>Mahjong (did you win)?</p>
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
                        {v ? '✅ Yes — Mahjong!' : '❌ No — Losing hand'}
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

            {/* Calculate */}
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
                Reset
              </button>
            </div>
          </div>

          {/* Right column: Score display */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {result ? (
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
                    <li>Pick tiles from the grid</li>
                    <li>Set each group type (Pong / Chow / Kang / Pair)</li>
                    <li>Tap your winning tile to mark it ★</li>
                    <li>Add any flowers or seasons</li>
                    <li>Mark win condition, then calculate</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
