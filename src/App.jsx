import React, { useState } from 'react';
import { useEngine } from './hooks/useEngine';
import { GridMap } from './components/GridMap';
import { CardHand } from './components/CardHand';
import { HUD } from './components/HUD';
import { CardDatabase } from './engine/cards/CardDatabase.js';
import './index.css';

function CombatLog({ logs }) {
  return (
    <div style={{
      width: 260,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '2px solid #00ff8822',
      background: '#010c05',
      flexShrink: 0,
    }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9,
        color: '#00ff88',
        padding: '10px 12px',
        borderBottom: '1px solid #00ff8833',
        letterSpacing: 1,
      }}>
        ◈ COMBAT LOG
      </div>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}>
        {logs?.map((log, i) => (
          <div key={i} style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: log.includes('DESTROYED')  ? '#ff4444'
                 : log.includes('CRITICAL')   ? '#ffd700'
                 : log.includes('Sparc-Core') ? '#ffd700'
                 : log.includes('STALLED')    ? '#ff6600'
                 : log.startsWith('---')      ? '#00ff88'
                 : '#88cc99',
            lineHeight: 1.5,
          }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const { engine, state } = useEngine();
  // Store the full card object (not just id) so GridMap can read its range
  const [selectedCard, setSelectedCard] = useState(null);

  if (!state) {
    return (
      <div style={{
        background: '#000', color: '#00ff88', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Press Start 2P', monospace", fontSize: 16,
      }}>
        INITIALIZING...
      </div>
    );
  }

  const player = state.ships.find(e => e.id === 'player_hero');
  const enemies = state.ships.filter(e => e.faction !== 'UEF');
  const isGameOver = !player;
  const isVictory = player && enemies.length === 0;

  // Map card IDs in hand to card objects from the database
  const hand = (state.cardSystem?.hand || []).map((cardId, index) => ({
    ...CardDatabase[cardId],
    instanceId: `${cardId}_${index}` // Adding instanceId for UI keys
  }));

  // ── Card selection / play ──────────────────────────────────────────────────
  const handleSelectCard = (cardInstanceId) => {
    if (!engine || state.activePhase !== 'PLAYER') return;

    // Deselect
    if (!cardInstanceId || (selectedCard?.instanceId === cardInstanceId)) {
      setSelectedCard(null);
      return;
    }

    const card = hand.find(c => c.instanceId === cardInstanceId);
    if (!card || !engine.cardSystem.canPlayCard(card.id).allowed) return;

    if (card.targetType === 'SELF') {
      // Play immediately — no target needed
      engine.cardSystem.playCard(card.id, null, engine);
      setSelectedCard(null);
    } else {
      // Weapon or targeted card — enter range-selection mode
      setSelectedCard(card);
    }
  };

  // Called by GridMap when player clicks a valid enemy target
  const handleTargetClick = (enemyId) => {
    if (!selectedCard || !engine) return;
    const target = engine.ships.get(enemyId);
    if (!target) return;

    engine.cardSystem.playCard(selectedCard.id, target, engine);
    // engine.checkDeaths(); // Engine handles basic logic for now
    setSelectedCard(null);
  };

  const handleDeselectCard = () => setSelectedCard(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      background: '#000',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 20px',
        borderBottom: '2px solid #00ff8822',
        gap: 24,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 14, color: '#00ff88', letterSpacing: 2,
        }}>
          ★ STAR CHART: TACTICS
        </span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#555' }}>
          TURN {state.turnCount} / {state.turnPhase === 'PLAYER_TURN' ? '🟢 PLAYER PHASE' : '🔴 ENEMY PHASE'}
        </span>

        {/* Active card indicator */}
        {selectedCard && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 9,
            color: selectedCard.suit?.color || '#ff4444',
            padding: '4px 10px',
            border: `1px solid ${selectedCard.suit?.color || '#ff4444'}`,
            background: `${selectedCard.suit?.color || '#ff4444'}11`,
          }}>
            ▶ {selectedCard.name}
            &nbsp;|&nbsp; RANGE {selectedCard.range}
            &nbsp;|&nbsp;
            <span
              onClick={handleDeselectCard}
              style={{ cursor: 'pointer', color: '#888', fontSize: 9 }}
            >
              ✕ cancel
            </span>
          </div>
        )}
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Grid */}
        <div style={{
          flex: 1, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', padding: 12,
        }}>
          <GridMap
            state={state}
            engine={engine}
            selectedCard={selectedCard}
            onTargetClick={handleTargetClick}
            onDeselectCard={handleDeselectCard}
          />
        </div>

        {/* Combat Log */}
        <CombatLog logs={state.logs} />
      </div>

      {/* Bottom section: HUD + Card Hand */}
      <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <HUD
          state={state}
          engine={engine}
          onEndTurn={() => { engine?.endPlayerTurn(); setSelectedCard(null); }}
        />

        <div style={{
          padding: '12px 0 16px',
          borderTop: '1px solid #00ff8820',
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
        }}>
          <CardHand
            hand={hand}
            ap={state.cardSystem?.actionPoints || 0}
            cardsPlayed={state.cardSystem?.cardsPlayedThisTurn || 0}
            maxCardsPerTurn={2}
            selectedCardId={selectedCard?.instanceId ?? null}
            onSelectCard={handleSelectCard}
          />
        </div>
      </div>

      {/* Victory / Defeat overlay */}
      {(isGameOver || isVictory) && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 999, gap: 30,
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 36,
            color: isVictory ? '#00ff88' : '#ff4444',
            textShadow: `0 0 40px ${isVictory ? '#00ff88' : '#ff4444'}`,
          }}>
            {isVictory ? 'VICTORY' : 'SHIP LOST'}
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#888' }}>
            {isVictory ? 'SECTOR CLEARED' : 'THE VOID CLAIMS ANOTHER'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 12, padding: '14px 28px',
              background: 'transparent',
              color: '#00ff88', border: '2px solid #00ff88',
              cursor: 'pointer', letterSpacing: 2,
            }}
          >
            NEW MISSION
          </button>
        </div>
      )}

      {/* Stall banner - disabled for now */}
      {/* state.stalled && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          background: '#ff330066',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 11, color: '#fff',
          textAlign: 'center', padding: '6px',
          zIndex: 998, borderBottom: '2px solid #ff3300',
        }}>
          ⚠ REACTOR STALL — AP LOST — EVASION OFFLINE
        </div>
      ) */}
    </div>
  );
}

export default App;
