import React from 'react';

const TILE_SIZE = 44;

const FACTION_COLORS = {
  UEF: '#00ff88',
  NURK: '#ff4444',
  NUL: '#aa44ff',
  ELIF: '#00ccff',
  COLDUNNACK: '#88ff00',
  DAWN: '#ff88ff',
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
      const entityHere = entities.find(e => e.x === col && e.y === row);

      if (dist === 0) return null; // player's own tile

      // Within card range
      if (dist <= cardRange) {
        const entityHere = ships.find(e => e.x === col && e.y === row);
        if (entityHere && entityHere.faction !== 'UEF') return 'in-range-enemy'; // attackable
        if (!entityHere)                                   return 'in-range';     // range tint
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
      // Weapon card targeting
      if (entityHere && entityHere.faction !== 'UEF') {
        const cardRange = selectedCard.range ?? 99;
        const dist = player
          ? Math.max(Math.abs(player.x - col), Math.abs(player.y - row))
          : 99;
        if (dist <= cardRange) {
          onTargetClick(entityHere.id);
        } else {
          onDeselectCard();
        }
      } else {
        onDeselectCard();
      }
    } else {
      // Movement
      if (!entityHere && player && engine) {
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
    'move':            { background: 'rgba(0,80,255,0.15)', borderColor: 'rgba(0,80,255,0.35)' },
    'in-range':        { background: 'rgba(255,60,60,0.10)', borderColor: 'rgba(255,60,60,0.25)' },
    'in-range-enemy':  { background: 'rgba(255,60,60,0.35)', borderColor: 'rgba(255,60,60,0.80)', cursor: 'crosshair' },
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
        const hpPct = (entity.hp / entity.maxHp) * 100;
        const shieldPct = (entity.shields / entity.maxShields) * 100;

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

            <div style={{
              fontSize: 22,
              color,
              transform: isPlayer ? 'none' : 'scaleX(-1)',
              filter: `drop-shadow(0 0 5px ${color})`,
              lineHeight: 1,
              userSelect: 'none',
            }}>
              {isPlayer ? '🚀' : '☠️'}
            </div>

            {/* HP bar */}
            <div style={{
              position: 'absolute', bottom: 2, left: 3,
              width: TILE_SIZE - 6, height: 3, background: '#111'
            }}>
              <div style={{
                width: `${Math.max(0,hpPct)}%`, height: '100%',
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
                width: `${Math.max(0,shieldPct)}%`, height: '100%',
                background: '#4499ff',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
