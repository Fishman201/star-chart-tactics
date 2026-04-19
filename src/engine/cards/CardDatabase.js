import GravityMechanics from '../GravityMechanics.js';

export const CardDatabase = {
  make_it_so: {
    id: 'make_it_so', name: 'Make It So', suit: 'Captain', cost: 1, heatGenerated: 5,
    description: 'Grant an ally an extra Action Point or Advantage on their next roll.',
    execute: (caster, targetEntity, manager) => {
      targetEntity.applyStatusEffect('advantage_next_roll');
      manager.emitStateUpdate();
    }
  },
  snap_dodge: {
    id: 'snap_dodge', name: 'Snap Dodge', suit: 'Navigator', cost: 1, heatGenerated: 5,
    description: 'Reaction: Evade an incoming attack. Grants Stabilizing Token.',
    execute: (caster, targetEntity, manager) => {
      caster.applyStatusEffect('stabilizing_token_penalty');
      caster.flags.isEvading = true; 
      manager.emitStateUpdate();
    }
  },
  target_lock: {
    id: 'target_lock', name: 'Target Lock', suit: 'Weapons', cost: 1, heatGenerated: 5,
    description: 'Declare a subsystem. If attack hits and exceeds AC by 5+, disable that subsystem.',
    execute: (caster, targetEntity, manager) => {
      caster.modifiers.nextAttackTargetLock = true; 
      manager.emitStateUpdate();
    }
  },
  rapid_reboot: {
    id: 'rapid_reboot', name: 'Rapid Reboot', suit: 'Science', cost: 1, heatGenerated: 5,
    description: 'Bring shields to 50% HP. Limit: max 2 per combat.',
    execute: (caster, targetEntity, manager) => {
      const shieldCap = Math.floor(caster.maxShields / 2);
      if (caster.shields < shieldCap) caster.shields = shieldCap;
      manager.emitStateUpdate();
    }
  },
  emergency_coolant: {
    id: 'emergency_coolant', name: 'Emergency Coolant', suit: 'Science', cost: 1, heatGenerated: 0,
    description: 'Instantly flushes the reactor. Resets Reactor Heat to zero.',
    execute: (caster, targetEntity, manager) => {
      caster.reactorHeat = 0;
      manager.emitStateUpdate();
    }
  },
  flak_screen: {
    id: 'flak_screen', name: 'Flak Screen', suit: 'Weapons', cost: 1, heatGenerated: 5,
    description: 'Activates the Flak Trait for the turn.',
    execute: (caster, targetEntity, manager) => {
      caster.modifiers.flakActive = true;
      manager.emitStateUpdate();
    }
  },
  sparc_surge: {
    id: 'sparc_surge', name: 'Sparc-Core Surge', suit: 'Captain', cost: 0, heatGenerated: 15,
    description: 'Gain 1 extra Action Point this turn, but drastically increases Reactor Heat.',
    execute: (caster, targetEntity, manager) => {
      manager.cardSystem.actionPoints += 1; 
      manager.emitStateUpdate();
    }
  },
  evasive_stunt: {
    id: 'evasive_stunt', name: 'Evasive Stunt', suit: 'Navigator', cost: 1, heatGenerated: 10,
    description: 'Perform a high-G maneuver. Breaks Steady Vector.',
    execute: (caster, targetCell, manager) => {
      caster.flags.steadyVector = false;
      manager.moveUnit(caster.id, targetCell);
      manager.emitStateUpdate();
    }
  },
  damage_control: {
    id: 'damage_control', name: 'Damage Control', suit: 'Science', cost: 2, heatGenerated: 5,
    description: 'Patch a critical breach.',
    execute: (caster, targetEntity, manager) => {
      caster.removeStatusEffect('hull_breach');
      caster.removeStatusEffect('life_support_failure');
      manager.emitStateUpdate();
    }
  },
  grav_repulsor: {
    id: 'grav_repulsor', name: 'Grav-Repulsor', suit: 'Science', cost: 2, heatGenerated: 10,  
    description: 'Creates a localized repulsor field. Pushes all units within 2 tiles away by 3 tiles.',
    execute: (caster, targetCell, manager) => {
      GravityMechanics.executeGravityEvent(targetCell, 2, 3, true, manager);
    }
  }
};
