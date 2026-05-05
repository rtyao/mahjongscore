import type { Tile } from '@/types/mahjong';

interface MahjongTileProps {
  tile: Tile;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  winning?: boolean;
  concealed?: boolean;
  faceDown?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

const SIZES = {
  xs: { w: 32, h: 44, mainSize: 18, subSize: 8, cornerSize: 7 },
  sm: { w: 40, h: 56, mainSize: 22, subSize: 10, cornerSize: 8 },
  md: { w: 52, h: 72, mainSize: 28, subSize: 11, cornerSize: 9 },
  lg: { w: 64, h: 88, mainSize: 36, subSize: 13, cornerSize: 10 },
};

function getSuitColor(tile: Tile): string {
  if (tile.suit === 'character') return 'var(--color-wan)';
  if (tile.suit === 'bamboo') return 'var(--color-bamboo)';
  if (tile.suit === 'circle') return 'var(--color-circle)';
  if (tile.suit === 'wind') return 'var(--color-wind)';
  if (tile.suit === 'dragon') {
    if (tile.value === 1) return 'var(--color-dragon-red)';
    if (tile.value === 2) return 'var(--color-dragon-green)';
    return 'var(--color-dragon-white)';
  }
  if (tile.suit === 'flower') return 'var(--color-flower)';
  if (tile.suit === 'season') return 'var(--color-season)';
  return 'var(--color-ink)';
}

function getSuitLabel(tile: Tile): string {
  if (tile.suit === 'character') return '萬';
  if (tile.suit === 'bamboo') return '條';
  if (tile.suit === 'circle') return '餅';
  if (tile.suit === 'wind') return '風';
  if (tile.suit === 'dragon') return '龍';
  if (tile.suit === 'flower') return '花';
  if (tile.suit === 'season') return '季';
  return '';
}

// Simple bamboo sticks SVG
function BambooSticks({ value, size }: { value: number; size: { w: number; h: number } }) {
  if (value === 1) {
    // Bird for 1-bamboo
    return (
      <div style={{ fontSize: Math.round(size.h * 0.4), lineHeight: 1 }}>🐦</div>
    );
  }

  const cols = value <= 3 ? 1 : value <= 6 ? 2 : 3;
  const rows = Math.ceil(value / cols);
  const stickW = Math.round((size.w - 12) / cols - 2);
  const stickH = Math.round((size.h - 24) / rows - 3);

  // Bamboo colors: jade tiles are pure green, others mixed
  const jadeIds = [2, 3, 4, 6, 8];
  const isJade = jadeIds.includes(value);

  const sticks = Array.from({ length: value });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${stickW}px)`,
        gap: '2px',
        padding: '2px',
      }}
    >
      {sticks.map((_, i) => {
        let color = 'var(--color-bamboo)';
        if (!isJade) {
          // 1: bird (handled above), 5/9: red+green alternating, 7: blue+green+red
          if (value === 5 || value === 9) color = i % 2 === 0 ? '#C53030' : 'var(--color-bamboo)';
          if (value === 7) {
            const palette = ['var(--color-circle)', 'var(--color-bamboo)', '#C53030'];
            color = palette[i % 3];
          }
        }
        return (
          <div
            key={i}
            style={{
              width: stickW,
              height: stickH,
              background: color,
              borderRadius: 3,
              border: '0.5px solid rgba(0,0,0,0.15)',
            }}
          />
        );
      })}
    </div>
  );
}

// Circle dots SVG
function CircleDots({ value, size }: { value: number; size: { w: number; h: number } }) {
  const dotSize = value === 1 ? Math.round(size.h * 0.42) : Math.round((size.w - 14) / Math.min(value, 3)) - 3;
  const cols = value === 1 ? 1 : value <= 2 ? 1 : value <= 4 ? 2 : 3;

  const dots = Array.from({ length: value });
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`,
        gap: '2px',
        placeItems: 'center',
      }}
    >
      {dots.map((_, i) => (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: value === 1 ? 'var(--color-circle)' : i % 2 === 0 ? 'var(--color-circle)' : 'var(--color-porcelain-light)',
            border: '1px solid rgba(0,0,0,0.12)',
          }}
        />
      ))}
    </div>
  );
}

// White dragon: just a blue rectangle border
function WhiteDragonContent({ size }: { size: { w: number; h: number } }) {
  return (
    <div
      style={{
        width: size.w - 10,
        height: size.h - 16,
        border: '2.5px solid var(--color-dragon-white)',
        borderRadius: 4,
      }}
    />
  );
}

function TileContent({ tile, size }: { tile: Tile; size: typeof SIZES['md'] }) {
  const color = getSuitColor(tile);
  const suitLabel = getSuitLabel(tile);

  // White dragon is special
  if (tile.suit === 'dragon' && tile.value === 3) {
    return <WhiteDragonContent size={size} />;
  }

  // Bamboo: use visual sticks
  if (tile.suit === 'bamboo') {
    return <BambooSticks value={tile.value} size={size} />;
  }

  // Circles: use dots
  if (tile.suit === 'circle') {
    return <CircleDots value={tile.value} size={size} />;
  }

  // Everything else: large Chinese character
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <span style={{ fontSize: size.mainSize, fontWeight: 700, color, lineHeight: 1.1, fontFamily: '"Noto Serif SC", "KaiTi", "STKaiti", serif' }}>
        {tile.chineseChar}
      </span>
      {tile.suit !== 'flower' && tile.suit !== 'season' && (
        <span style={{ fontSize: size.subSize, color: 'var(--color-mist)', lineHeight: 1 }}>
          {suitLabel}
        </span>
      )}
    </div>
  );
}

export default function MahjongTile({
  tile,
  size = 'md',
  selected = false,
  winning = false,
  concealed = false,
  faceDown = false,
  count,
  onClick,
  className = '',
}: MahjongTileProps) {
  const s = SIZES[size];
  const color = getSuitColor(tile);

  const borderColor = winning
    ? 'var(--color-porcelain)'
    : selected
    ? 'var(--color-jade)'
    : 'var(--color-tile-border)';

  const boxShadow = winning
    ? '0 0 0 2px var(--color-porcelain), 0 3px 6px var(--color-tile-shadow)'
    : selected
    ? '0 0 0 2px var(--color-jade), 0 3px 6px var(--color-tile-shadow)'
    : '0 2px 4px var(--color-tile-shadow), inset 0 1px 0 rgba(255,255,255,0.85)';

  if (faceDown) {
    return (
      <div
        style={{
          width: s.w,
          height: s.h,
          background: 'var(--color-jade)',
          border: '1.5px solid var(--color-jade-light)',
          borderRadius: 6,
          boxShadow,
          cursor: onClick ? 'pointer' : 'default',
        }}
        className={className}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={selected}
      style={{
        width: s.w,
        height: s.h,
        background: concealed ? 'var(--color-porcelain-pale)' : 'var(--color-tile-bg)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 6,
        boxShadow,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 3px 2px',
        position: 'relative',
        userSelect: 'none',
        transition: 'transform 0.1s, box-shadow 0.1s',
        flexShrink: 0,
      }}
      className={className}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Corner: number for suited tiles */}
      {(tile.suit === 'flower' || tile.suit === 'season') && (
        <div style={{
          position: 'absolute', top: 2, left: 4,
          fontSize: s.cornerSize, fontWeight: 700,
          color, lineHeight: 1,
        }}>
          {tile.value}
        </div>
      )}

      {/* Winning tile star */}
      {winning && (
        <div style={{
          position: 'absolute', top: 1, right: 3,
          fontSize: s.cornerSize - 1,
          color: 'var(--color-porcelain)',
          lineHeight: 1,
        }}>
          ★
        </div>
      )}

      <TileContent tile={tile} size={s} />

      {/* English label for flower/season tiles */}
      {(tile.suit === 'flower' || tile.suit === 'season') && (
        <div style={{ fontSize: s.cornerSize - 1, color: 'var(--color-mist)', marginTop: 1, lineHeight: 1 }}>
          {tile.englishLabel.slice(0, 3).toUpperCase()}
        </div>
      )}

      {/* Concealed indicator */}
      {concealed && (
        <div style={{
          position: 'absolute', bottom: 2, right: 3,
          fontSize: s.cornerSize - 2,
          color: 'var(--color-porcelain)',
          lineHeight: 1,
          fontWeight: 600,
        }}>
          ⓒ
        </div>
      )}

      {/* Count badge */}
      {count !== undefined && count > 0 && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          background: 'var(--color-jade)',
          color: '#fff',
          borderRadius: '50%',
          width: 16, height: 16,
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}>
          {count}
        </div>
      )}
    </div>
  );
}
