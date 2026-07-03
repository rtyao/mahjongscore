import type { TileGroup, TileInstance, KangType } from '@/types/mahjong';
import { getTile } from '@/lib/tiles';
import MahjongTile from '@/components/MahjongTile';

export default function GroupCard({
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
        {tiles.map(inst => (
          <MahjongTile
            key={inst.instanceId}
            tile={getTile(inst.tileId)}
            size="sm"
            winning={inst.isWinningTile}
            concealed={group.concealed}
            onClick={() => onMarkWinning(group.id, inst.instanceId)}
          />
        ))}
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
