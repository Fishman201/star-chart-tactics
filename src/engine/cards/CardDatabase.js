import GravityMechanics from '../GravityMechanics.js';

export const CardDatabase = {
    // --- NURK CARDS ---
    mag_harpoon: {
        id: 'mag_harpoon', name: 'Mag-Harpoon', suit: 'NURK', cost: 1, heatGenerated: 0, range: 4, targetType: 'UNIT',
        description: 'Pull target unit 2 tiles closer and deal light damage.',
        execute: async (caster, targetEntity, manager) => {
            await manager.executeAttack(caster.id, targetEntity.id, { name: 'Harpoon', damage: 4 });
            // Simple pull logic: move target 1 tile toward caster
            const dx = Math.sign(caster.x - targetEntity.x);
            const dy = Math.sign(caster.y - targetEntity.y);
            const newX = targetEntity.x + dx;
            const newY = targetEntity.y + dy;
            manager.moveUnit(targetEntity.id, { x: newX, y: newY });
        }
    },
    scrap_cannon_blast: {
        id: 'scrap_cannon_blast', name: 'Scrap-Cannon', suit: 'NURK', cost: 1, heatGenerated: 0, range: 3, targetType: 'UNIT',
        description: 'A messy blast of shrapnel.',
        execute: async (caster, targetEntity, manager) => {
            await manager.executeAttack(caster.id, targetEntity.id, { name: 'Scrap Cannon', damage: 10 });
        }
    },

    // --- ELIF CARDS ---
    phase_shift: {
        id: 'phase_shift', name: 'Phase-Shift', suit: 'ELIF', cost: 1, heatGenerated: 10, targetType: 'SELF',
        description: 'Vanish from local spacetime. Immune to damage for 1 turn.',
        execute: async (caster, targetEntity, manager) => {
            caster.applyStatusEffect('phased', 1);
            manager.addLog(`${caster.displayName} phased out of reality!`);
        }
    },
    solar_eye_beam: {
        id: 'solar_eye_beam', name: 'Solar-Eye Beam', suit: 'ELIF', cost: 2, heatGenerated: 15, range: 8, targetType: 'UNIT',
        description: 'Concentrated solar energy strike.',
        execute: async (caster, targetEntity, manager) => {
            await manager.executeAttack(caster.id, targetEntity.id, { name: 'Solar Beam', damage: 18 });
        }
    },

    // --- NUL CARDS ---
    emerald_lance_strike: {
        id: 'emerald_lance_strike', name: 'Emerald Lance', suit: 'NUL', cost: 1, heatGenerated: 10, range: 5, targetType: 'UNIT',
        description: 'Spear of resonance. Ignores shields to strike the hull directly.',
        execute: async (caster, targetEntity, manager) => {
             // Logic to bypass shields: deal damage directly to hull
             const damage = 12;
             targetEntity.hp -= damage;
             manager.addLog(`${caster.displayName} emerald lance PIERCES shields! ${targetEntity.displayName} hull takes ${damage} damage.`);
             manager.emitStateUpdate();
        }
    },

    // --- COL'DUNNACK CARDS ---
    acid_spore_pod: {
        id: 'acid_spore_pod', name: 'Acid Spore', suit: 'COL', cost: 1, heatGenerated: 5, range: 3, targetType: 'UNIT',
        description: 'Melt enemy armor. Reduces AC permanently.',
        execute: async (caster, targetEntity, manager) => {
            targetEntity.ac -= 2;
            manager.addLog(`${targetEntity.displayName} armor MELTED! AC reduced.`);
            await manager.executeAttack(caster.id, targetEntity.id, { name: 'Acid', damage: 5 });
        }
    },
    rapid_regrow: {
        id: 'rapid_regrow', name: 'Regrow', suit: 'COL', cost: 1, heatGenerated: 10, targetType: 'SELF',
        description: 'Biological regeneration of the hull.',
        execute: async (caster, targetEntity, manager) => {
            const heal = 15;
            caster.hp = Math.min(caster.maxHp, caster.hp + heal);
            manager.addLog(`${caster.displayName} bio-hull REGENERATED ${heal} HP.`);
        }
    },
  railgun_shot: {
    id: 'railgun_shot', name: 'Railgun Shot', suit: 'Weapons', cost: 1, heatGenerated: 5, range: 6, targetType: 'UNIT',
    description: 'Standard UEF kinetic strike. High accuracy railgun fire.',
    execute: async (caster, targetEntity, manager) => {
      await manager.executeAttack(caster.id, targetEntity.id, { name: 'Railgun', damage: 8 });
    }
  },
  make_it_so: {
    id: 'make_it_so', name: 'Make It So', suit: 'Captain', cost: 1, heatGenerated: 5, targetType: 'UNIT',
    description: 'Grant target advantage on their next action.',
    execute: async (caster, targetEntity, manager) => {
      targetEntity.applyStatusEffect('advantage_next_roll');
      manager.emitStateUpdate();
    }
  },
  snap_dodge: {
    id: 'snap_dodge', name: 'Snap Dodge', suit: 'Navigator', cost: 1, heatGenerated: 5, targetType: 'SELF',
    description: 'Reaction: Evade an incoming attack. Grants Stabilizing Token.',
    execute: async (caster, targetEntity, manager) => {
      caster.applyStatusEffect('stabilizing_token_penalty');
      caster.flags.isEvading = true; 
      manager.emitStateUpdate();
    }
  },
  target_lock: {
    id: 'target_lock', name: 'Target Lock', suit: 'Weapons', cost: 1, heatGenerated: 5, targetType: 'UNIT',
    description: 'Lock sensors onto an enemy system. Higher critical chance.',
    execute: async (caster, targetEntity, manager) => {
      // Logic for target lock modifier
      caster.applyStatusEffect('target_lock_active');
      manager.emitStateUpdate();
    }
  },
  rapid_reboot: {
    id: 'rapid_reboot', name: 'Rapid Reboot', suit: 'Science', cost: 1, heatGenerated: 5, targetType: 'SELF',
    description: 'Bring shields to 50% HP. Limit: max 2 per combat.',
    execute: async (caster, targetEntity, manager) => {
      const shieldCap = Math.floor(caster.maxShields / 2);
      if (caster.shields < shieldCap) caster.shields = shieldCap;
      manager.emitStateUpdate();
    }
  },
  emergency_coolant: {
    id: 'emergency_coolant', name: 'Emergency Coolant', suit: 'Science', cost: 1, heatGenerated: 0, targetType: 'SELF',
    description: 'Instantly flushes the reactor. Resets Reactor Heat to zero.',
    execute: async (caster, targetEntity, manager) => {
      caster.reactorHeat = 0;
      manager.emitStateUpdate();
    }
  },
  flak_screen: {
    id: 'flak_screen', name: 'Flak Screen', suit: 'Weapons', cost: 1, heatGenerated: 5, targetType: 'SELF',
    description: 'Activates the Flak Trait for the turn.',
    execute: async (caster, targetEntity, manager) => {
      caster.applyStatusEffect('flak_active');
      manager.emitStateUpdate();
    }
  },
  sparc_surge: {
    id: 'sparc_surge', name: 'Sparc-Core Surge', suit: 'Captain', cost: 0, heatGenerated: 15, targetType: 'SELF',
    description: 'Gain 1 extra Action Point this turn.',
    execute: async (caster, targetEntity, manager) => {
      manager.cardSystem.actionPoints += 1; 
      manager.emitStateUpdate();
    }
  },
  evasive_stunt: {
    id: 'evasive_stunt', name: 'Evasive Stunt', suit: 'Navigator', cost: 1, heatGenerated: 10, targetType: 'CELL',
    description: 'Perform a high-G maneuver. Breaks Steady Vector.',
    execute: async (caster, targetCell, manager) => {
      caster.flags.steadyVector = false;
      manager.moveUnit(caster.id, targetCell);
      manager.emitStateUpdate();
    }
  },
  damage_control: {
    id: 'damage_control', name: 'Damage Control', suit: 'Science', cost: 2, heatGenerated: 5, targetType: 'SELF',
    description: 'Patch a critical breach.',
    execute: async (caster, targetEntity, manager) => {
      caster.removeStatusEffect('hull_breach');
      caster.removeStatusEffect('life_support_breach');
      manager.emitStateUpdate();
    }
  },
  grav_repulsor: {
    id: 'grav_repulsor', name: 'Grav-Repulsor', suit: 'Science', cost: 2, heatGenerated: 10, targetType: 'CELL',
    description: 'Creates a localized repulsor field. Pushes all units range 2 away by 3 tiles.',
    execute: async (caster, targetCell, manager) => {
      GravityMechanics.executeGravityEvent(targetCell, 2, 3, true, manager);
    }
  }
};
