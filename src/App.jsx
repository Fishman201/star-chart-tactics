import React, { useState } from 'react';
import { useEngine } from './hooks/useEngine';
import { GridMap } from './components/GridMap';
import { CardHand } from './components/CardHand';
import { HUD } from './components/HUD';
import { CardDatabase } from './engine/cards/CardDatabase.js';
import SubsystemTargetingUI from './components/SubsystemTargetingUI.jsx';
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
  const [selectedCard, setSelectedCard] = useState(null);
  const [targetingUI, setTargetingUI] = useState({ active: false, targetShip: null });

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
  const hand = (state.cardSystem?.hand || []).map((cardId, index) => {
    const cardBase = CardDatabase[cardId];
    if (!cardBase) {
      console.warn(`Card ${cardId} not in DB - falling back to safety.`);
      return { 
        id: cardId, 
        name: 'ERR: MISSING', 
        description: `Card ID ${cardId} could not be resolved.`, 
        suit: '?', 
        cost: 0, 
        instanceId: `${cardId}_${index}`,
        execute: () => console.error("Missing Card Executed")
      };
    }
    return { ...cardBase, instanceId: `${cardId}_${index}` };
  });

  const handleSelectCard = (cardInstanceId) => {
    if (!engine || state.turnPhase !== 'PLAYER_TURN') return;
    if (!cardInstanceId || (selectedCard?.instanceId === cardInstanceId)) {
      setSelectedCard(null);
      return;
    }
    const card = hand.find(c => c.instanceId === cardInstanceId);
    if (!card || !engine.cardSystem.canPlayCard(card.id).allowed) return;

    if (card.targetType === 'SELF') {
      engine.cardSystem.playCard(card.id, null, engine);
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handleTargetClick = (enemyId) => {
    if (!selectedCard || !engine) return;
    const targetSnapshot = state.ships.find(s => s.id === enemyId);
    const targetEntity = engine.ships.get(enemyId);
    if (!targetEntity) return;

    if (selectedCard.id === 'target_lock') {
      setTargetingUI({ active: true, targetShip: targetSnapshot });
    } else {
      engine.cardSystem.playCard(selectedCard.id, targetEntity, engine);
      setSelectedCard(null);
    }
  };

  const handleApplyTargetLock = (targetId, subsystemId) => {
    if (!engine || !selectedCard) return;
    const targetEntity = engine.ships.get(targetId);
    engine.cardSystem.playCard('target_lock', targetEntity, engine, { subsystemId });
    setTargetingUI({ active: false, targetShip: null });
    setSelectedCard(null);
  };

  const handleDeselectCard = () => setSelectedCard(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#000', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px', borderBottom: '2px solid #00ff8822', gap: 24 }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#00ff88', letterSpacing: 2 }}>
          ★ STAR CHART: TACTICS
        </span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: '#555' }}>
          TURN {state.turnCount} | {state.turnPhase === 'PLAYER_TURN' ? '🟢 PLAYER' : '🔴 ENEMY'}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 12, position: 'relative' }}>
          {player?.statusEffects?.includes('stalled') && (
            <div style={{
              position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
              background: '#ff000033', border: '2px solid #ff0000', color: '#ff4444',
              padding: '12px 24px', fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
              zIndex: 100, textShadow: '0 0 6px #ff0000', letterSpacing: '1px',
              boxShadow: '0 0 15px #ff000044', whiteSpace: 'nowrap'
            }}>
              <style>{`@keyframes stallPulse { 0% { opacity: 0.8; } 100% { opacity: 1; text-shadow: 0 0 12px #ff4444; } }`}</style>
              <div style={{ animation: 'stallPulse 0.5s infinite alternate' }}>
                 ⚠ REACTOR STALL — AP OFFLINE
              </div>
            </div>
          )}
          <GridMap
            state={state}
            engine={engine}
            selectedCard={selectedCard}
            onTargetClick={handleTargetClick}
            onDeselectCard={handleDeselectCard}
          />
        </div>
        <CombatLog logs={state.logs} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <HUD state={state} engine={engine} onEndTurn={() => { engine?.endPlayerTurn(); setSelectedCard(null); }} />
        <div style={{ padding: '12px 0 16px', minHeight: 180, display: 'flex', alignItems: 'center' }}>
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

      {targetingUI.active && (
        <SubsystemTargetingUI 
          isActive={targetingUI.active}
          targetShip={targetingUI.targetShip}
          onSelectSubsystem={handleApplyTargetLock}
          onCancel={() => setTargetingUI({ active: false, targetShip: null })}
        />
      )}

      {(isGameOver || isVictory) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999, gap: 30 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 32, color: isVictory ? '#00ff88' : '#ff4444' }}>
            {isVictory ? 'SECTOR CLEAR' : 'HULL BREACHED'}
          </div>
          <button onClick={() => window.location.reload()} style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, padding: '12px 24px', background: 'transparent', color: '#00ff88', border: '2px solid #00ff88', cursor: 'pointer' }}>
            REDEPLOY
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
