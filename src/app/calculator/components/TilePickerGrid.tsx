import { useState } from 'react';
import type { Tile, TileInstance } from '@/types/mahjong';
import { CHARACTER_TILES, BAMBOO_TILES, CIRCLE_TILES, WIND_TILES, DRAGON_TILES, FLOWER_TILES, SEASON_TILES } from '@/lib/tiles';
import MahjongTile from '@/components/MahjongTile';

function countInHand(instances: TileInstance[], tileId: string): number {
  return instances.filter(i => i.tileId === tileId).length;
}

export default function TilePickerGrid({
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
