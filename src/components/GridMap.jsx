import React from 'react';
import VFXLayer from './VFXLayer.jsx';

const TILE_SIZE = 32;


const FACTION_COLORS = {
  UEF: '#00ff88',
  NURK: '#ff4444',
  NUL: '#aa44ff',
  ELIF: '#00ccff',
  COLDUNNACK: '#88ff00',
  DAWN: '#ff88ff',
};

const ShipIcon = ({ faction }) => {
  switch (faction) {
    case 'UEF':
      return (
        <svg viewBox="0 0 24 24" width="80%" height="80%">
          <polygon points="12,2 20,20 12,16 4,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        </svg>
      );
    case 'NUL':
      return (
        <svg viewBox="0 0 24 24" width="80%" height="80%">
          <path d="M12,2 A10,10 0 0,1 22,12 A10,10 0 0,0 12,6 A10,10 0 0,0 2,12 A10,10 0 0,1 12,2 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="14" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        </svg>
      );
    case 'NURK':
      return (
        <svg viewBox="0 0 24 24" width="80%" height="80%" className="anim-jitter">
          <polygon points="12,2 18,5 17,14 20,18 15,22 9,21 4,17 6,9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="bevel" />
          <line x1="8" y1="8" x2="16" y2="15" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <line x1="16" y1="8" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );
    case 'ELIF':
      return (
        <svg viewBox="0 0 24 24" width="80%" height="80%">
          <polygon points="12,2 20,12 12,22 4,12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
          <polygon points="12,5 16,12 12,19 8,12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case 'COLDUNNACK':
      return (
        <svg viewBox="0 0 24 24" width="80%" height="80%" className="anim-pulsate">
          <path d="M12,4 C18,4 20,10 20,14 C20,20 12,22 12,22 C12,22 4,20 4,14 C4,10 6,4 12,4 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M8,10 Q12,14 16,10 M10,15 Q12,18 14,15" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        </svg>
      );
    case 'DAWN':
      return (
        <svg viewBox="0 0 24 24" width="80%" height="80%">
          <path d="M12,22 L12,10 M8,2 L8,8 Q8,10 12,10 Q16,10 16,8 L16,2" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="5" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        </svg>
      );
    default:
      return <svg viewBox="0 0 24 24" width="80%" height="80%"><polygon points="12,2 20,20 4,20" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
  }
};

export const GridMap = ({ state, engine, selectedCard, onTargetClick, onDeselectCard }) => {
  const { gridSize, ships, turnPhase } = state;
  const player = ships.find(e => e.id === 'player_hero');
  const isPlayerPhase = turnPhase === 'PLAYER_TURN';

  // ── What to highlight ──────────────────────────────────────────────────────
  const getHighlight = (col, row) => {
    if (!player || !isPlayerPhase) return null;

    const dist = Math.max(Math.abs(player.x - col), Math.abs(player.y - row));

    // Card targeting mode (a weapon card is selected)
    if (selectedCard) {
      const cardRange = selectedCard.range ?? 99;
      const entityHere = ships.find(e => e.x === col && e.y === row);

      if (dist === 0) return null; // player's own tile

      // Within card range
      if (dist <= cardRange) {
        const entityHere = ships.find(e => e.x === col && e.y === row);
        if (entityHere && entityHere.faction !== 'UEF') return 'in-range-enemy'; // attackable
        if (!entityHere) return 'in-range';     // range tint
      }
      return null;
    }

    // No card selected — show movement range
    if (dist > 0 && dist <= player.speed) {
      const entityHere = ships.find(e => e.x === col && e.y === row);
      if (!entityHere) return 'move';
    }
    return null;
  };

  const handleTileClick = (col, row) => {
    if (!isPlayerPhase) return;

    const entityHere = ships.find(e => e.x === col && e.y === row);

    if (selectedCard) {
      console.log(`[Interaction] Targeting with ${selectedCard.name} at (${col}, ${row})`);
      // Weapon card targeting
      if (entityHere && entityHere.faction !== 'UEF') {
        const cardRange = selectedCard.range ?? 99;
        const dist = player
          ? Math.max(Math.abs(player.x - col), Math.abs(player.y - row))
          : 99;

        if (dist <= cardRange) {
          console.log(`[Interaction] Valid target! Shooting ${entityHere.id}`);
          onTargetClick(entityHere.id);
        } else {
          console.warn(`[Interaction] Target out of range: ${dist} > ${cardRange}`);
        }
      } else {
        console.log("[Interaction] Clicked non-enemy with weapon selected - Deselecting");
        onDeselectCard();
      }
    } else {
      // Movement
      if (!entityHere && player && engine) {
        console.log(`[Interaction] Moving to (${col}, ${row})`);
        engine.moveUnit('player_hero', { x: col, y: row });
      }
    }
  };

  // Pre-build highlight map for efficiency
  const tileHighlights = {};
  for (let row = 0; row < gridSize.height; row++) {
    for (let col = 0; col < gridSize.width; col++) {
      const h = getHighlight(col, row);
      if (h) tileHighlights[`${col},${row}`] = h;
    }
  }

  const HIGHLIGHT_STYLES = {
    'move': { background: 'rgba(0,80,255,0.15)', borderColor: 'rgba(0,80,255,0.35)' },
    'in-range': { background: 'rgba(255,60,60,0.10)', borderColor: 'rgba(255,60,60,0.25)' },
    'in-range-enemy': { background: 'rgba(255,60,60,0.35)', borderColor: 'rgba(255,60,60,0.80)', cursor: 'crosshair' },
  };

  return (
    <div style={{
      position: 'relative',
      width: gridSize.width * TILE_SIZE,
      height: gridSize.height * TILE_SIZE,
      background: 'radial-gradient(ellipse at center, #001a10 0%, #000800 100%)',
      border: `2px solid ${isPlayerPhase ? '#00ff8844' : '#ff444422'}`,
      flexShrink: 0,
      transition: 'border-color 0.4s',
    }}>

      <style>{`
        @keyframes pulsate-bio {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .anim-pulsate {
          animation: pulsate-bio 2s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes jitter-scrap {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(1px, -1px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
          100% { transform: translate(0, 0); }
        }
        .anim-jitter {
          animation: jitter-scrap 0.3s infinite;
        }
        @keyframes pulse-shield {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.9; }
        }
        .anim-shield {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 85%;
          height: 85%;
          border-radius: 50%;
          border: 2px solid rgba(68, 153, 255, 0.5);
          box-shadow: 0 0 10px #4499ff, inset 0 0 8px #4499ff;
          animation: pulse-shield 2.5s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Star field */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={`star-${i}`} style={{
          position: 'absolute',
          width: i % 7 === 0 ? 2 : 1,
          height: i % 7 === 0 ? 2 : 1,
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.15 + ((i * 37) % 100) / 250,
          left: `${(i * 131.3) % 100}%`,
          top: `${(i * 79.7) % 100}%`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Grid tiles */}
      {Array.from({ length: gridSize.width * gridSize.height }).map((_, idx) => {
        const col = idx % gridSize.width;
        const row = Math.floor(idx / gridSize.width);
        const key = `${col},${row}`;
        const hl = tileHighlights[key];
        const hlStyle = hl ? HIGHLIGHT_STYLES[hl] : {};
        return (
          <div
            key={key}
            onClick={() => handleTileClick(col, row)}
            style={{
              position: 'absolute',
              left: col * TILE_SIZE,
              top: row * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              borderRight: '1px solid rgba(0,255,100,0.06)',
              borderBottom: '1px solid rgba(0,255,100,0.06)',
              cursor: hl === 'in-range-enemy' ? 'crosshair' : hl === 'move' ? 'pointer' : 'default',
              transition: 'background 0.15s',
              boxSizing: 'border-box',
              ...hlStyle,
            }}
          />
        );
      })}

      {/* Range ring label when card selected */}
      {selectedCard && player && (
        <div style={{
          position: 'absolute',
          left: player.x * TILE_SIZE,
          top: player.y * TILE_SIZE - 22,
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 8,
          color: '#ff6666',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          textShadow: '0 0 6px #ff444488',
        }}>
          RANGE {selectedCard.range} ▼
        </div>
      )}

      {/* Entities */}
      {ships.map(entity => {
        const color = FACTION_COLORS[entity.faction] || '#ffffff';
        const isPlayer = entity.id === 'player_hero';
        const hpPct = (entity.maxHp > 0 ? (entity.hp / entity.maxHp) * 100 : 0) || 0;
        const shieldPct = (entity.maxShields > 0 ? (entity.shields / entity.maxShields) * 100 : 0) || 0;

        // Flash targeting ring on enemy when a card with range can reach them
        const isTargetable = selectedCard && !isPlayer &&
          player &&
          Math.max(Math.abs(player.x - entity.x), Math.abs(player.y - entity.y)) <= (selectedCard.range ?? 99);

        return (
          <div key={entity.id} style={{
            position: 'absolute',
            left: entity.x * TILE_SIZE,
            top: entity.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.22s ease, top 0.22s ease',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            {/* Targeting ring */}
            {isTargetable && (
              <div style={{
                position: 'absolute',
                inset: 3,
                border: '2px solid #ff4444',
                borderRadius: 2,
                boxShadow: '0 0 10px #ff444488, inset 0 0 6px #ff444444',
                animation: 'none',
                pointerEvents: 'none',
              }} />
            )}

            {/* Shield Bubble */}
            {entity.shields > 0 && <div className="anim-shield" />}

            <div style={{
              color,
              transform: entity.faction === 'UEF' ? 'none' : 'rotate(180deg)',
              filter: `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}>
              <ShipIcon faction={entity.faction} />
            </div>

            {/* HP bar */}
            <div style={{
              position: 'absolute', bottom: 2, left: 3,
              width: TILE_SIZE - 6, height: 3, background: '#111'
            }}>
              <div style={{
                width: `${Math.max(0, hpPct)}%`, height: '100%',
                background: hpPct > 40 ? '#00ff00' : hpPct > 20 ? '#ffaa00' : '#ff0000',
                transition: 'width 0.3s',
              }} />
            </div>
            {/* Shield bar */}
            <div style={{
              position: 'absolute', bottom: 6, left: 3,
              width: TILE_SIZE - 6, height: 2, background: '#111'
            }}>
              <div style={{
                width: `${Math.max(0, shieldPct)}%`, height: '100%',
                background: '#4499ff',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        );
      })}

      {/* VFX Overlay Layer */}
      <VFXLayer vfxQueue={state.vfxQueue} tileSize={TILE_SIZE} />
    </div>
  );
};
