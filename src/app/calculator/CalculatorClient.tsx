'use client';

import { useState, useCallback } from 'react';
import type { CalculatorState, ScoreResult, TileGroup, Tile, WindDirection, KangType, Blessing } from '@/types/mahjong';
import { calculateScore } from '@/lib/scoring';
import { detectHand } from '@/lib/handDetection';
import TilePickerGrid from './components/TilePickerGrid';
import HandTray from './components/HandTray';
import GroupCard from './components/GroupCard';
import ScoreDisplay from './components/ScoreDisplay';

const WIND_LABELS: Record<WindDirection, string> = { east: 'East', south: 'South', west: 'West', north: 'North' };
const WIND_CHARS: Record<WindDirection, string> = { east: '東', south: '南', west: '西', north: '北' };

const BLESSING_OPTIONS: { value: Blessing; label: string; hint: string }[] = [
  { value: 'none', label: 'None', hint: 'Normal win' },
  { value: 'heaven', label: '☀️ Heaven', hint: 'Dealer wins on opening hand' },
  { value: 'earth', label: '🌱 Earth', hint: "Won on dealer's first discard" },
];

const INITIAL_STATE: CalculatorState = {
  seatWind: 'east',
  isDealer: false,
  isMahjong: true,
  isSelfDraw: false,
  blessing: 'none',
  instances: [],
  groups: [],
  flowers: [],
  seasons: [],
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CalculatorClient() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [detectError, setDetectError] = useState<string | null>(null);

  // Any change to the hand invalidates the last calculated score
  const update = useCallback((updater: (prev: CalculatorState) => CalculatorState) => {
    setState(updater);
    setResult(null);
  }, []);

  const addTile = useCallback((tile: Tile) => {
    update(prev => {
      const current = prev.instances.filter(i => i.tileId === tile.id).length;
      if (current >= tile.maxCount) return prev;
      return {
        ...prev,
        instances: [...prev.instances, { instanceId: uid(), tileId: tile.id, isWinningTile: false }],
      };
    });
    setCalcError(null);
  }, [update]);

  // Removes an instance and drops it from any group; empty groups are pruned
  const removeInstances = useCallback((instanceIds: string[]) => {
    update(prev => ({
      ...prev,
      instances: prev.instances.filter(i => !instanceIds.includes(i.instanceId)),
      groups: prev.groups
        .map(g => ({ ...g, instanceIds: g.instanceIds.filter(id => !instanceIds.includes(id)) }))
        .filter(g => g.instanceIds.length > 0),
    }));
  }, [update]);

  const removeTile = useCallback((tile: Tile) => {
    const last = [...state.instances].reverse().find(i => i.tileId === tile.id);
    if (last) removeInstances([last.instanceId]);
  }, [state.instances, removeInstances]);

  const autoDetect = () => {
    const tileIds = state.instances.map(i => i.tileId);
    const minTiles = state.isMahjong ? 17 : 16;
    if (tileIds.length < minTiles) {
      setDetectError(`Need at least ${minTiles} tiles to auto-detect - you have ${tileIds.length}`);
      return;
    }
    // Hands with kangs have minTiles + n tiles (one extra per kang), so any count >= minTiles is allowed
    const handResult = detectHand(tileIds);
    if (!handResult) {
      setDetectError("Couldn't find a valid hand — check your tiles or group manually");
      return;
    }
    setDetectError(null);

    // Map each detected set's tile ids back to unused hand instances
    const usedInstanceIds = new Set<string>();
    const claimInstances = (ids: string[]): string[] =>
      ids.flatMap(tileId => {
        const inst = state.instances.find(i => i.tileId === tileId && !usedInstanceIds.has(i.instanceId));
        if (!inst) return [];
        usedInstanceIds.add(inst.instanceId);
        return [inst.instanceId];
      });

    const newGroups: TileGroup[] = [
      ...handResult.sets.map(set => ({
        id: uid(),
        type: set.type as TileGroup['type'],
        concealed: false,
        kangType: 'revealed' as KangType,
        instanceIds: claimInstances(set.tileIds),
      })),
      {
        id: uid(),
        type: 'pair' as const,
        concealed: false,
        kangType: 'revealed' as KangType,
        instanceIds: claimInstances(handResult.pair.tileIds),
      },
    ];

    update(prev => ({
      ...prev,
      instances: prev.instances.map(i => ({ ...i, isWinningTile: false })),
      groups: newGroups,
    }));
  };

  const addGroup = () => {
    setState(prev => ({
      ...prev,
      groups: [...prev.groups, { id: uid(), type: 'incomplete', concealed: false, kangType: 'revealed', instanceIds: [] }],
    }));
  };

  const patchGroup = (groupId: string, patch: Partial<TileGroup>) => {
    update(prev => ({ ...prev, groups: prev.groups.map(g => g.id === groupId ? { ...g, ...patch } : g) }));
  };

  const markWinningTile = (_groupId: string, instanceId: string) => {
    update(prev => ({
      ...prev,
      instances: prev.instances.map(i => ({
        ...i,
        isWinningTile: i.instanceId === instanceId ? !i.isWinningTile : false,
      })),
    }));
  };

  const removeGroup = (groupId: string) => {
    const group = state.groups.find(g => g.id === groupId);
    if (group) removeInstances(group.instanceIds);
  };

  const toggleBonus = (key: 'flowers' | 'seasons') => (val: number) => {
    update(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val],
    }));
  };
  const toggleFlower = toggleBonus('flowers');
  const toggleSeason = toggleBonus('seasons');

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
      if (state.blessing === 'heaven' && !state.isDealer) {
        setCalcError('Blessing of Heaven is a dealer-only win (winning on your opening hand). Check the Dealer box, or pick Blessing of Earth.');
        return;
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
                        onSetType={(id, type) => patchGroup(id, { type })}
                        onToggleConcealed={id => patchGroup(id, { concealed: !state.groups.find(g => g.id === id)?.concealed })}
                        onSetKangType={(id, kangType) => patchGroup(id, { kangType })}
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
                        onClick={() => update(p => ({ ...p, seatWind: w }))}
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
                      onChange={e => update(p => ({ ...p, isDealer: e.target.checked }))}
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
                        onClick={() => update(p => ({ ...p, isMahjong: v, isSelfDraw: v ? p.isSelfDraw : false, blessing: v ? p.blessing : 'none' }))}
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
                          onClick={() => update(p => ({ ...p, isSelfDraw: v }))}
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

                {state.isMahjong && (
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>
                      Blessing? <span className="font-normal" style={{ color: 'var(--color-mist)' }}>(rare first-turn win — automatic buan-oh)</span>
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {BLESSING_OPTIONS.map(({ value, label, hint }) => (
                        <button
                          key={value}
                          onClick={() => update(p => ({ ...p, blessing: value }))}
                          title={hint}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            background: state.blessing === value ? 'var(--color-jade)' : 'var(--color-cream)',
                            color: state.blessing === value ? '#fff' : 'var(--color-stone)',
                            border: `1px solid ${state.blessing === value ? 'var(--color-jade)' : 'var(--color-cream-dark)'}`,
                          }}
                        >
                          {label}
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
        onRemoveInstance={id => removeInstances([id])}
        onToggleFlower={toggleFlower}
        onToggleSeason={toggleSeason}
        onReset={reset}
      />
    </div>
  );
}
