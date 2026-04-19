import GravityMechanics from '../GravityMechanics.js';

export const CardDatabase = {
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
