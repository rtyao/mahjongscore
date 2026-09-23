'use client';

import { useState, useCallback } from 'react';
import type { CalculatorState, ScoreResult, TileGroup, Tile, WindDirection, KangType, Blessing, MahjongStyle } from '@/types/mahjong';
import { HAND_SIZE } from '@/types/mahjong';
import { calculateScore, hasStandaloneShape } from '@/lib/scoring';
import { detectHand } from '@/lib/handDetection';
import TilePickerGrid from './components/TilePickerGrid';
import HandTray from './components/HandTray';
import GroupCard from './components/GroupCard';
import ScoreDisplay from './components/ScoreDisplay';

const WIND_LABELS: Record<WindDirection, string> = { east: 'East', south: 'South', west: 'West', north: 'North' };
const WIND_CHARS: Record<WindDirection, string> = { east: '東', south: '南', west: '西', north: '北' };
const WINDS: WindDirection[] = ['east', 'south', 'west', 'north'];

const STYLES: { value: MahjongStyle; name: string; chinese: string; blurb: string }[] = [
  { value: 'taiwanese', name: 'Filipino-Chinese', chinese: '台灣麻將', blurb: '16 tiles · 5 sets + pair · points × tai' },
  { value: 'hongkong', name: 'Hong Kong', chinese: '香港麻雀', blurb: '13 tiles · 4 sets + pair · fan' },
];

const BLESSING_OPTIONS: { value: Blessing; label: string; hint: string }[] = [
  { value: 'none', label: 'None', hint: 'Normal win' },
  { value: 'heaven', label: '☀️ Heaven', hint: 'Dealer wins on opening hand' },
  { value: 'earth', label: '🌱 Earth', hint: "Won on dealer's first discard" },
];

const MINIMUM_FAN_OPTIONS = [0, 1, 3];

const INITIAL_STATE: CalculatorState = {
  style: 'taiwanese',
  seatWind: 'east',
  isMahjong: true,
  isSelfDraw: false,
  instances: [],
  groups: [],
  flowers: [],
  seasons: [],
  // Taiwanese only
  isDealer: false,
  blessing: 'none',
  // Hong Kong only
  roundWind: 'east',
  isConcealedHand: false,
  minimumFan: 3,
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Small labelled row of toggle buttons, used throughout the setup steps. */
function ButtonRow<T extends string | number | boolean>({
  label, hint, options, value, onChange, accent = 'var(--color-jade)',
}: {
  label: string;
  hint?: string;
  options: { value: T; label: string; sub?: string; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-stone)' }}>
        {label}
        {hint && <span className="font-normal" style={{ color: 'var(--color-mist)' }}> {hint}</span>}
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {options.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              title={opt.title}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex flex-col items-center leading-tight"
              style={{
                background: active ? accent : 'var(--color-cream)',
                color: active ? '#fff' : 'var(--color-stone)',
                border: `1px solid ${active ? accent : 'var(--color-cream-dark)'}`,
              }}
            >
              {opt.sub ? <><span className="text-base">{opt.sub}</span><span className="text-xs">{opt.label}</span></> : opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CalculatorClient() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [detectError, setDetectError] = useState<string | null>(null);

  const isHK = state.style === 'hongkong';
  const sizes = HAND_SIZE[state.style];
  const kangCount = state.groups.filter(g => g.type === 'kang').length;
  const tileTarget = (state.isMahjong ? sizes.winning : sizes.concealed) + kangCount;

  // Any change to the hand invalidates the last calculated score
  const update = useCallback((updater: (prev: CalculatorState) => CalculatorState) => {
    setState(updater);
    setResult(null);
  }, []);

  /** Switching style keeps your tiles but drops the groups, since the two
   *  styles build a different number of sets. */
  const setStyle = (style: MahjongStyle) => {
    if (style === state.style) return;
    update(prev => ({ ...prev, style, groups: [], instances: prev.instances.map(i => ({ ...i, isWinningTile: false })) }));
    setCalcError(null);
    setDetectError(null);
  };

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

  // Removes instances and drops them from any group; empty groups are pruned
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
    const minTiles = state.isMahjong ? sizes.winning : sizes.concealed;
    if (tileIds.length < minTiles) {
      setDetectError(`Need at least ${minTiles} tiles to auto-detect — you have ${tileIds.length}`);
      return;
    }
    // Hands with kongs hold minTiles + n tiles, so any count at or above the
    // minimum is allowed.
    const handResult = detectHand(tileIds);
    if (!handResult) {
      const extra = isHK && hasStandaloneShape(tileIds)
        ? ' — but this hand scores as a special shape, so you can calculate without grouping.'
        : ' — check your tiles or group manually.';
      setDetectError(`Couldn't sort this into ${sizes.sets} sets and a pair${extra}`);
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
    const tileIds = state.instances.map(i => i.tileId);
    // Seven Pairs, Thirteen Orphans and Nine Gates score straight from the
    // tiles, so they skip the grouping and winning-tile prompts.
    const standalone = isHK && hasStandaloneShape(tileIds);

    if (state.instances.length > 0 && state.groups.length === 0 && !standalone) {
      setCalcError('Run "Auto-detect sets" first, then calculate.');
      return;
    }
    if (state.isMahjong && !standalone) {
      const winningInst = state.instances.find(i => i.isWinningTile);
      if (!winningInst) {
        setCalcError('Tap your winning tile to mark it ★ before calculating.');
        return;
      }
      if (!isHK && !state.isSelfDraw) {
        const winningGroup = state.groups.find(g => g.instanceIds.includes(winningInst.instanceId));
        if (winningGroup?.concealed) {
          setCalcError('Winning tile is in a concealed set, but win by discard is selected. If you stole the tile to win, the set is revealed — uncheck concealed, or switch to self-draw.');
          return;
        }
      }
      if (!isHK && state.blessing === 'heaven' && !state.isDealer) {
        setCalcError('Blessing of Heaven is a dealer-only win (winning on your opening hand). Check the Dealer box, or pick Blessing of Earth.');
        return;
      }
    }
    setCalcError(null);
    setResult(calculateScore(state));
  };

  const reset = () => {
    setState({ ...INITIAL_STATE, style: state.style });
    setResult(null);
    setCalcError(null);
    setDetectError(null);
  };

  return (
    <div style={{ background: 'var(--color-cream-light)', paddingBottom: '100px' }} className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>Hand Calculator</h1>
          <p className="text-sm" style={{ color: 'var(--color-stone)' }}>
            {isHK
              ? 'Hong Kong Mahjong · 13 tiles · 4 sets + 1 pair'
              : 'Filipino-Chinese Mahjong · 16 tiles · 5 sets + 1 pair'}
          </p>
        </div>

        {/* Style switcher */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-mist)' }}>
            Mahjong style
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STYLES.map(s => {
              const active = state.style === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className="text-left px-4 py-3 rounded-xl transition-colors"
                  style={{
                    background: active ? 'var(--color-jade)' : 'var(--color-cream-light)',
                    border: `1.5px solid ${active ? 'var(--color-jade)' : 'var(--color-cream-dark)'}`,
                    color: active ? '#fff' : 'var(--color-ink)',
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs" style={{ opacity: active ? 0.85 : 0.6 }}>{s.chinese}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: active ? '#fff' : 'var(--color-stone)', opacity: active ? 0.85 : 1 }}>
                    {s.blurb}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-2.5" style={{ color: 'var(--color-mist)' }}>
            Switching keeps your tiles but clears the sets, since the two styles build a different number of them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-5">

            {/* Step 1: Pick tiles */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 1 — Pick Your Tiles</h2>
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
                <h2 className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 2 — Build Your Sets</h2>
                <p className="text-xs mb-4" style={{ color: 'var(--color-stone)' }}>
                  Hit Auto-detect to sort your hand into {sizes.sets} sets and a pair. Then tap any tile to mark it ★ as your winning tile.
                  {isHK
                    ? ' Seven Pairs, Thirteen Orphans and Nine Gates are recognised from your tiles alone — no grouping needed.'
                    : ' For kangs or concealed sets, adjust manually.'}
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
                        style={state.style}
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
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 3 — Setup</h2>
              <div className="flex flex-wrap gap-5">
                <ButtonRow
                  label="Your seat"
                  value={state.seatWind}
                  onChange={w => update(p => ({ ...p, seatWind: w }))}
                  options={WINDS.map(w => ({ value: w, label: WIND_LABELS[w], sub: WIND_CHARS[w] }))}
                />

                {isHK ? (
                  <>
                    <ButtonRow
                      label="Round wind"
                      value={state.roundWind}
                      onChange={w => update(p => ({ ...p, roundWind: w }))}
                      accent="var(--color-porcelain)"
                      options={WINDS.map(w => ({ value: w, label: WIND_LABELS[w], sub: WIND_CHARS[w] }))}
                    />
                    <ButtonRow
                      label="Table minimum"
                      hint="(fan needed to declare)"
                      value={state.minimumFan}
                      onChange={n => update(p => ({ ...p, minimumFan: n }))}
                      options={MINIMUM_FAN_OPTIONS.map(n => ({
                        value: n,
                        label: n === 0 ? 'None' : `${n} fan`,
                        title: n === 0 ? 'Any winning hand counts' : `Need at least ${n} fan to declare a win`,
                      }))}
                    />
                  </>
                ) : (
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
                )}
              </div>
              {isHK && (
                <p className="text-xs mt-4" style={{ color: 'var(--color-mist)' }}>
                  There is no dealer setting here because Hong Kong scoring has no dealer bonus — the dealer pays and collects like everyone else.
                </p>
              )}
            </section>

            {/* Step 4: Win conditions */}
            <section className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-cream-dark)' }}>
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-mist)' }}>Step 4 — Win Conditions</h2>
              <div className="flex flex-wrap gap-5">
                <ButtonRow
                  label="Did you win?"
                  value={state.isMahjong}
                  onChange={v => update(p => ({
                    ...p,
                    isMahjong: v,
                    isSelfDraw: v ? p.isSelfDraw : false,
                    blessing: v ? p.blessing : 'none',
                    isConcealedHand: v ? p.isConcealedHand : false,
                  }))}
                  options={[
                    { value: true, label: '✅ Yes — Mahjong!' },
                    { value: false, label: '❌ No — Losing hand' },
                  ]}
                />

                {state.isMahjong && (
                  <ButtonRow
                    label={isHK ? 'Self-pick (Zi Mo)?' : 'Self-draw (Zi-mo)?'}
                    value={state.isSelfDraw}
                    onChange={v => update(p => ({ ...p, isSelfDraw: v }))}
                    accent="var(--color-porcelain)"
                    options={[
                      { value: false, label: isHK ? 'Won on a discard' : 'Stolen discard' },
                      { value: true, label: isHK ? '🤚 Self-pick (+1 fan)' : '🤚 Self-draw (+0.5 + 100 flat)' },
                    ]}
                  />
                )}

                {state.isMahjong && isHK && (
                  <ButtonRow
                    label="Concealed hand?"
                    hint="(門前清)"
                    value={state.isConcealedHand}
                    onChange={v => update(p => ({ ...p, isConcealedHand: v }))}
                    accent="var(--color-porcelain)"
                    options={[
                      { value: false, label: 'Took tiles from others' },
                      { value: true, label: '🔒 Fully concealed (+1 fan)' },
                    ]}
                  />
                )}

                {state.isMahjong && !isHK && (
                  <ButtonRow
                    label="Blessing?"
                    hint="(rare first-turn win — automatic buan-oh)"
                    value={state.blessing}
                    onChange={b => update(p => ({ ...p, blessing: b }))}
                    options={BLESSING_OPTIONS.map(o => ({ value: o.value, label: o.label, title: o.hint }))}
                  />
                )}
              </div>
              {isHK && (
                <p className="text-xs mt-4" style={{ color: 'var(--color-mist)' }}>
                  Situational fan — Kong Replacement, Robbing the Kong, Moon Under The Sea and the three Blessings — depend on what happened at the table
                  rather than on your tiles, so they are not inputs here. They are documented on the{' '}
                  <a href="/rules" style={{ color: 'var(--color-jade)', textDecoration: 'underline' }}>Rules page</a>.
                </p>
              )}
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
              <ScoreDisplay result={result} isDealer={state.isDealer} isSelfDraw={state.isSelfDraw} />
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
                    <li>Pick your style above</li>
                    <li>Pick all {sizes.winning} tiles (flowers/seasons too)</li>
                    <li>Hit Auto-detect sets</li>
                    <li>Tap your winning tile to mark it ★</li>
                    <li>{isHK ? 'Set your seat and round wind' : 'Choose your seat wind and role'}</li>
                    <li>Set win conditions, then calculate</li>
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
        target={tileTarget}
        onRemoveInstance={id => removeInstances([id])}
        onToggleFlower={toggleFlower}
        onToggleSeason={toggleSeason}
        onReset={reset}
      />
    </div>
  );
}
