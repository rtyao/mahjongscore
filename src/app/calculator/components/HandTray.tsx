import type { TileInstance } from '@/types/mahjong';
import { getTile, FLOWER_TILES, SEASON_TILES } from '@/lib/tiles';
import MahjongTile from '@/components/MahjongTile';

export default function HandTray({
  instances, flowers, seasons, target,
  onRemoveInstance, onToggleFlower, onToggleSeason, onReset,
}: {
  instances: TileInstance[];
  flowers: number[];
  seasons: number[];
  /** How many tiles this hand should hold, for the current style and kong count. */
  target: number;
  onRemoveInstance: (id: string) => void;
  onToggleFlower: (v: number) => void;
  onToggleSeason: (v: number) => void;
  onReset: () => void;
}) {
  const tileCount = instances.length;
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
              <MahjongTile key={t.id} tile={t} size="xs" selected onClick={() => onToggleFlower(t.value)} />
            ))}
            {SEASON_TILES.filter(t => seasons.includes(t.value)).map(t => (
              <MahjongTile key={t.id} tile={t} size="xs" selected onClick={() => onToggleSeason(t.value)} />
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
