import { useReducer, useEffect } from 'react';
import { createUnit } from '../gameEngine/entities';
import { executeCombat } from '../gameEngine/combat';

const GRID_SIZE = 20;

const initialState = {
  gridSize: GRID_SIZE,
  turnNumber: 1,
  activeFaction: 'UEF', 
  units: [
    createUnit('UEF', 'titan', 1, 10),
    createUnit('UEF', 'frigate', 2, 9),
    createUnit('UEF', 'fighter', 2, 8),
    createUnit('NURK', 'titan', 18, 10),
    createUnit('NURK', 'frigate', 17, 9),
    createUnit('NURK', 'fighter', 17, 11)
  ],
  selectedUnitId: null,
  logs: ['--- GAME STARTED ---', 'Commander, deploy the UEF fleet.']
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_UNIT':
      return { ...state, selectedUnitId: action.payload };

    case 'DESELECT':
      return { ...state, selectedUnitId: null };
    
    case 'MOVE_UNIT': {
      const { unitId, x, y } = action.payload;
      const unitIndex = state.units.findIndex(u => u.id === unitId);
      if (unitIndex === -1) return state;
      const unit = state.units[unitIndex];
      
      const dist = Math.max(Math.abs(unit.x - x), Math.abs(unit.y - y));
      if (dist > unit.speed || unit.hasMoved) return state;
      if (state.units.some(u => u.x === x && u.y === y)) return state;

      const newUnits = [...state.units];
      newUnits[unitIndex] = { ...unit, x, y, hasMoved: true };
      
      let moveLog = `> ${unit.name} moving to [${x},${y}]`;
      return { ...state, units: newUnits, logs: [moveLog, ...state.logs].slice(0, 50) };
    }

    case 'ATTACK': {
      const { attackerId, targetId } = action.payload;
      const tIdx = state.units.findIndex(u => u.id === targetId);
      const aIdx = state.units.findIndex(u => u.id === attackerId);
      if (tIdx === -1 || aIdx === -1) return state;
      
      const attacker = state.units[aIdx];
      const target = state.units[tIdx];
      
      const dist = Math.max(Math.abs(attacker.x - target.x), Math.abs(attacker.y - target.y));
      if (dist > attacker.range || attacker.hasAttacked) {
         return { ...state, logs: ['> Target out of range.', ...state.logs].slice(0, 50) };
      }

      const result = executeCombat(attacker, target);
      const newUnits = [...state.units];
      
      let deathLog = null;
      if (result.isHit) {
        const newHp = Math.max(0, target.hp - result.damage);
        if (newHp === 0) {
            deathLog = `> ALERT: ${target.name} DESTROYED!`;
            newUnits.splice(tIdx, 1);
        } else {
            newUnits[tIdx] = { ...target, hp: newHp };
        }
      }
      
      const aIdxUpdated = newUnits.findIndex(u => u.id === attackerId);
      if (aIdxUpdated !== -1) {
         newUnits[aIdxUpdated] = { ...newUnits[aIdxUpdated], hasAttacked: true };
      }

      const newLogs = [result.log, ...state.logs];
      if (deathLog) newLogs.unshift(deathLog);

      return { ...state, units: newUnits, selectedUnitId: null, logs: newLogs.slice(0, 50) };
    }

    case 'END_TURN': {
      const nextFaction = state.activeFaction === 'UEF' ? 'NURK' : 'UEF';
      const newTurnNumber = state.activeFaction === 'NURK' ? state.turnNumber + 1 : state.turnNumber;
      
      // Reset unit flags
      const resetUnits = state.units.map(u => ({ ...u, hasMoved: false, hasAttacked: false }));
      
      return { 
        ...state, 
        units: resetUnits, 
        turnNumber: newTurnNumber,
        activeFaction: nextFaction,
        selectedUnitId: null,
        logs: [`--- Turn ${newTurnNumber}: ${nextFaction} ---`, ...state.logs].slice(0, 50)
      };
    }

    case 'FORCE_STATE':
        return action.payload;

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Extremely basic PvE AI
  useEffect(() => {
    if (state.activeFaction === 'NURK') {
      let currentState = state;
      const executeAITurn = async () => {
        const myUnits = currentState.units.filter(u => u.factionId === 'NURK');
        
        for (let unit of myUnits) {
            // Re-fetch state to get latest unit positions
            let freshUnits = currentState.units;
            let currentUnitPos = freshUnits.find(u => u.id === unit.id);
            if (!currentUnitPos) continue; // Died

            const targets = freshUnits.filter(u => u.factionId !== 'NURK');
            if (targets.length === 0) continue;

            const target = targets[0]; // Just picking the first target for MVP
            
            // Move towards target if out of range
            const distToTarget = Math.max(Math.abs(currentUnitPos.x - target.x), Math.abs(currentUnitPos.y - target.y));
            if (distToTarget > currentUnitPos.range && !currentUnitPos.hasMoved) {
                const moveX = currentUnitPos.x < target.x ? Math.min(currentUnitPos.x + currentUnitPos.speed, target.x - currentUnitPos.range) : Math.max(currentUnitPos.x - currentUnitPos.speed, target.x + currentUnitPos.range);
                const moveY = currentUnitPos.y < target.y ? Math.min(currentUnitPos.y + currentUnitPos.speed, target.y - currentUnitPos.range) : Math.max(currentUnitPos.y - currentUnitPos.speed, target.y + currentUnitPos.range);
                
                dispatch({ type: 'MOVE_UNIT', payload: { unitId: unit.id, x: moveX, y: moveY } });
                await new Promise(r => setTimeout(r, 600)); // AI thinking delay
            }

            // Attack
            dispatch({ type: 'ATTACK', payload: { attackerId: unit.id, targetId: target.id } });
            await new Promise(r => setTimeout(r, 400));
        }

        dispatch({ type: 'END_TURN' });
      };

      setTimeout(executeAITurn, 1000);
    }
  }, [state.activeFaction]);

  return [state, dispatch];
}
