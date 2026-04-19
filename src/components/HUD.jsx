import React from 'react';

export const HUD = ({ state, engine, onEndTurn }) => {
  if (!state) return null;

  const { ships, cardSystem, turnPhase } = state;
  const player = ships.find(e => e.id === 'player_hero');
  const maxCardsPerTurn = 2;

  if (!player) return null;

  // Fallback for missing card system (initialization delay)
  if (!cardSystem) {
    return (
        <div style={{ padding: 20, color: '#00ff88', fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}>
            ◈ BOOTING TACTICAL COMPUTER...
        </div>
    );
  }

  const hpPct = (player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0) || 0;
  const shieldPct = (player.maxShields > 0 ? (player.shields / player.maxShields) * 100 : 0) || 0;
  const heatPct = player.reactorHeat || 0;

  const isPlayerPhase = turnPhase === 'PLAYER_TURN';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '8px 16px',
      background: '#000',
      borderTop: '2px solid #00ff8844',
      flexShrink: 0,
    }}>
      {/* Status bars row */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Hull */}
        <StatBar label="HULL" value={player.hp} max={player.maxHp} pct={hpPct} color={hpPct > 40 ? '#00ff00' : '#ff0000'} />

        {/* Shields */}
        <StatBar label="SHIELDS" value={player.shields} max={player.maxShields} pct={shieldPct} color="#4499ff" />

        {/* Reactor Heat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatBar
            label="REACTOR HEAT"
            value={`${Math.round(heatPct)}%`}
            max={100}
            pct={heatPct}
            color={heatPct > 75 ? '#ff3300' : heatPct > 50 ? '#ff9900' : '#ff6600'}
            warning={player.statusEffects?.includes('stalled')}
          />
          <button 
            disabled={!isPlayerPhase || cardSystem.actionPoints < 1 || heatPct === 0 || player.statusEffects?.includes('stalled')}
            onClick={() => {
              if (engine.cardSystem.ventCore(engine)) {
                engine.emitStateUpdate();
              }
            }}
            style={{
              background: '#221100',
              border: '1px solid #ff9900',
              color: '#ff9900',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              padding: '6px 8px',
              cursor: (!isPlayerPhase || cardSystem.actionPoints < 1 || heatPct === 0 || player.statusEffects?.includes('stalled')) ? 'not-allowed' : 'pointer',
              opacity: (!isPlayerPhase || cardSystem.actionPoints < 1 || heatPct === 0 || player.statusEffects?.includes('stalled')) ? 0.3 : 1
            }}
          >
            VENT (1AP)
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Deck info */}
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#888', textAlign: 'right', lineHeight: 1.8 }}>
          <div>DECK: {cardSystem.deckSize}</div>
          <div>DISC: {cardSystem.discardSize}</div>
        </div>

        {/* Cards played indicator */}
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, textAlign: 'center', lineHeight: 1.8 }}>
          <div style={{ color: '#ffd700' }}>PLAYS</div>
          <div style={{ color: cardSystem.cardsPlayedThisTurn >= maxCardsPerTurn ? '#ff4444' : '#fff' }}>
            {cardSystem.cardsPlayedThisTurn} / {maxCardsPerTurn}
          </div>
        </div>

        {/* AP dots */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#ffd700' }}>AP</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: i < cardSystem.actionPoints ? '#ffd700' : '#222',
                border: '2px solid #ffd70066',
                boxShadow: i < cardSystem.actionPoints ? '0 0 6px #ffd70088' : 'none',
              }} />
            ))}
          </div>
        </div>

        {/* End Turn */}
        <button
          onClick={onEndTurn}
          disabled={!isPlayerPhase}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 10,
            padding: '10px 16px',
            background: isPlayerPhase ? 'transparent' : '#111',
            color: isPlayerPhase ? '#00ff88' : '#444',
            border: `2px solid ${isPlayerPhase ? '#00ff88' : '#333'}`,
            cursor: isPlayerPhase ? 'pointer' : 'not-allowed',
            letterSpacing: 1,
          }}
        >
          {isPlayerPhase ? 'END TURN' : 'ENEMY...'}
        </button>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, max, pct, color, warning }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 120 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#888' }}>{label}</span>
      {warning
        ? <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ff3300' }}>{warning}</span>
        : <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color }}>{value}</span>
      }
    </div>
    <div style={{ height: 6, background: '#1a1a1a', border: '1px solid #333' }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`,
        height: '100%',
        background: color,
        transition: 'width 0.3s ease',
        boxShadow: `0 0 4px ${color}88`,
      }} />
    </div>
  </div>
);
