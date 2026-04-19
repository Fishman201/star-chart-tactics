import GravityMechanics from '../GravityMechanics.js';

export const CardDatabase = {
  // ==========================================
  // BASIC CARDS
  // ==========================================
  railgun_shot: {
    id: 'railgun_shot', name: 'Railgun Shot', suit: 'Weapons', cost: 1, heatGenerated: 5, range: 4, targetType: 'UNIT',
    description: 'Simple kinetic slug. Precise and reliable.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Railgun Slug', damage: 8 });
    }
  },
  laser_pulse: {
    id: 'laser_pulse', name: 'Laser Pulse', suit: 'Weapons', cost: 1, heatGenerated: 8, range: 6, targetType: 'UNIT',
    description: 'Energy pulse. Lower accuracy but higher damage.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Laser Pulse', damage: 12 });
    }
  },
  torpedo_swarm: {
    id: 'torpedo_swarm', name: 'Torpedo Swarm', suit: 'Weapons', cost: 2, heatGenerated: 5, range: 8, targetType: 'UNIT',
    description: 'A spread of tracking torpedoes. Hard to evade.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Torpedo', damage: 15 });
    }
  },
  evasive_maneuvers: {
    id: 'evasive_maneuvers', name: 'Evasive Action', suit: 'Navigator', cost: 1, heatGenerated: 10, targetType: 'SELF',
    description: 'Jink and roll. Increases Evasion chance for 1 turn.',
    execute: async (caster, targetEntity, manager) => {
      caster.flags.isEvading = true;
      manager.addLog(`${caster.displayName} is executing defensive maneuvers!`);
      manager.emitStateUpdate();
    }
  },
  evasive_stunt: {
    id: 'evasive_stunt', name: 'Evasive Stunt', suit: 'Navigator', cost: 1, heatGenerated: 5, targetType: 'SELF',
    description: 'Quick reactionary burn. Grants Evasion for 1 turn.',
    execute: async (caster, targetEntity, manager) => {
      caster.flags.isEvading = true;
      manager.addLog(`${caster.displayName} performs a brilliant stunt!`);
      manager.emitStateUpdate();
    }
  },
  shield_boost: {
    id: 'shield_boost', name: 'Shield Boost', suit: 'Science', cost: 1, heatGenerated: 12, targetType: 'SELF',
    description: 'Reroute power to shields. Restores 10 Shield HP.',
    execute: async (caster, targetEntity, manager) => {
      caster.shields = Math.min(caster.maxShields, caster.shields + 10);
      manager.emitStateUpdate();
    }
  },

  // ==========================================
  // UEF SPECIALS
  // ==========================================
  railgun_volley: {
    id: 'railgun_volley', name: 'Railgun Volley', suit: 'Weapons', cost: 1, heatGenerated: 5, range: 4, targetType: 'UNIT',
    description: 'A rapid-fire spread of railgun slugs. Multi-hit potential.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Railgun Volley', damage: 6 });
    }
  },
  sparc_lance: {
    id: 'sparc_lance', name: 'Sparc-Lance', suit: 'Weapons', cost: 2, heatGenerated: 15, range: 8, targetType: 'UNIT',
    description: 'High-intensity energy beam. High critical hit chance.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Sparc Lance', damage: 16 });
    }
  },
  heavy_torpedo: {
    id: 'heavy_torpedo', name: 'Heavy Torpedo', suit: 'Weapons', cost: 1, heatGenerated: 5, range: 6, targetType: 'UNIT',
    description: 'Slow but devastating ordnance strike.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Heavy Torpedo', damage: 20 });
    }
  },
  target_lock: {
    id: 'target_lock', name: 'Target Lock', suit: 'Weapons', cost: 1, heatGenerated: 5, targetType: 'UNIT',
    description: 'Sensors locked. Provides +5 to next accuracy roll in sector.',
    execute: async (caster, targetEntity, manager, extraData = {}) => {
      if (extraData.subsystemId) {
          const sysId = extraData.subsystemId;
          const label = targetEntity.subsystems[sysId]?.label || sysId;
          manager.addLog(`[TARGET LOCK] Sensors locked on ${targetEntity.displayName}'s ${label}!`);
          
          const SubsystemTable = (await import('../combat/SubsystemTable.js')).default;
          // Map to roll brackets (Weapons: 1-5, Engines: 6-10, etc.)
          const effectMap = { weapons: 1, engines: 6, hull: 11, lifeSupport: 16, bridge: 20 };
          await SubsystemTable.applyEffect(targetEntity, effectMap[sysId] || 1, manager);
      } else {
          caster.applyStatusEffect('target_lock_active', 2);
          manager.addLog(`${caster.displayName} maintains a general target lock.`);
      }
      manager.emitStateUpdate();
    }
  },
  rapid_reboot: {
    id: 'rapid_reboot', name: 'Rapid Reboot', suit: 'Science', cost: 1, heatGenerated: 5, targetType: 'SELF',
    description: 'Bring shields back online at 50% capacity.',
    execute: async (caster, targetEntity, manager) => {
      const shieldCap = Math.floor(caster.maxShields / 2);
      if (caster.shields < shieldCap) caster.shields = shieldCap;
      manager.emitStateUpdate();
    }
  },
  emergency_coolant: {
    id: 'emergency_coolant', name: 'Emergency Coolant', suit: 'Science', cost: 1, heatGenerated: 0, targetType: 'SELF',
    description: 'Flush the reactor. Resets heat to zero.',
    execute: async (caster, targetEntity, manager) => {
      caster.reactorHeat = 0;
      manager.emitStateUpdate();
    }
  },
  sparc_surge: {
    id: 'sparc_surge', name: 'Sparc-Core Surge', suit: 'Captain', cost: 0, heatGenerated: 15, targetType: 'SELF',
    description: 'Overload the sparc-core. Gain 1 extra Action Point.',
    execute: async (caster, targetEntity, manager) => {
      manager.cardSystem.actionPoints += 1; 
      manager.emitStateUpdate();
    }
  },

  // ==========================================
  // NURK (RECLAIMERS)
  // ==========================================
  mag_harpoon: {
    id: 'mag_harpoon', name: 'Mag-Harpoon', suit: 'NURK', cost: 1, heatGenerated: 0, range: 4, targetType: 'UNIT',
    description: 'Pull target unit closer and deal light damage.',
    execute: async (caster, targetEntity, manager) => {
      await manager.executeAttack(caster.id, targetEntity.id, { name: 'Harpoon', damage: 4 });
      if (Math.abs(targetEntity.x - caster.x) > 1) {
          targetEntity.x += Math.sign(caster.x - targetEntity.x);
      }
      if (Math.abs(targetEntity.y - caster.y) > 1) {
          targetEntity.y += Math.sign(caster.y - targetEntity.y);
      }
      manager.emitStateUpdate();
    }
  },
  scrap_cannon_blast: {
    id: 'scrap_cannon_blast', name: 'Scrap-Blast', suit: 'NURK', cost: 1, heatGenerated: 10, range: 3, targetType: 'UNIT',
    description: 'Inaccurate burst of scrap metal. High chance of hull breach.',
    execute: async (caster, targetEntity, manager) => {
      await manager.executeAttack(caster.id, targetEntity.id, { name: 'Scrap Blast', damage: 15 });
    }
  },
  spawn_bombers: {
    id: 'spawn_bombers', name: 'Slag-Bombers', suit: 'NURK', cost: 2, heatGenerated: 10, targetType: 'SELF',
    description: 'Release a swarm of slag-bombers. Deals damage to all adjacent units.',
    execute: async (caster, target, manager) => {
      manager.addLog(`${caster.displayName} releases EXOSWARM!`);
      for (let ship of manager.ships.values()) {
        const dist = Math.max(Math.abs(caster.x - ship.x), Math.abs(caster.y - ship.y));
        if (dist === 1 && ship.id !== caster.id) {
          await ship.takeDamage(10, manager);
        }
      }
    }
  },
  boarding_torpedoes: {
    id: 'boarding_torpedoes', name: 'Boarding Pods', suit: 'NURK', cost: 2, heatGenerated: 5, range: 4, targetType: 'UNIT',
    description: 'Spike enemy hull with boarders. Triggers random subsystem failure.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Boarding Pod', damage: 8 });
      const SubsystemTable = (await import('../combat/SubsystemTable.js')).default;
      SubsystemTable.roll(target, manager);
    }
  },

  // ==========================================
  // NUL (RESONANT)
  // ==========================================
  emerald_lance_strike: {
    id: 'emerald_lance_strike', name: 'Emerald Lance', suit: 'NUL', cost: 2, heatGenerated: 10, range: 5, targetType: 'UNIT',
    description: 'Focused energy beam. Melts through armor.',
    execute: async (caster, targetEntity, manager) => {
      await manager.executeAttack(caster.id, targetEntity.id, { name: 'Emerald Lance', damage: 20 });
    }
  },
  resonance_array: {
    id: 'resonance_array', name: 'Resonance Array', suit: 'NUL', cost: 2, heatGenerated: 15, range: 6, targetType: 'UNIT',
    description: 'Vibrate target at its natural frequency. Deals damage and stuns for 1 turn.',
    execute: async (caster, target, manager) => {
      target.applyStatusEffect('stunned', 1);
      await manager.executeAttack(caster.id, target.id, { name: 'Resonance', damage: 15 });
    }
  },
  harmonic_resonance_strike: {
    id: 'harmonic_resonance_strike', name: 'Harmonic Strike', suit: 'NUL', cost: 1, heatGenerated: 10, range: 4, targetType: 'UNIT',
    description: 'Bypass shields to strike the inner structure.',
    execute: async (caster, target, manager) => {
      target.hp -= 12;
      manager.addLog(`${caster.displayName}'s Harmonic Strike BYPASSES shields!`);
      manager.emitStateUpdate();
    }
  },

  // ==========================================
  // ELIF (ASCENDANT)
  // ==========================================
  solar_eye_beam: {
    id: 'solar_eye_beam', name: 'Solar Beam', suit: 'ELIF', cost: 1, heatGenerated: 5, range: 7, targetType: 'UNIT',
    description: 'High-accuracy celestial beam.',
    execute: async (caster, targetEntity, manager) => {
      await manager.executeAttack(caster.id, targetEntity.id, { name: 'Solar Beam', damage: 18 });
    }
  },
  phase_shift: {
    id: 'phase_shift', name: 'Phase Shift', suit: 'ELIF', cost: 1, heatGenerated: 15, targetType: 'SELF',
    description: 'Temporarily move out of phased reality. Grants 99% evasion for 1 turn.',
    execute: async (caster, targetEntity, manager) => {
      caster.flags.isEvading = true;
      manager.addLog(`${caster.displayName} has phased out of local reality!`);
      manager.emitStateUpdate();
    }
  },
  phase_torpedo: {
    id: 'phase_torpedo', name: 'Phase-Torpedo', suit: 'ELIF', cost: 1, heatGenerated: 5, range: 6, targetType: 'UNIT',
    description: 'Bypasses Point-Defense (Flak). Strikes target directly.',
    execute: async (caster, target, manager) => {
      await target.takeDamage(12, manager);
      manager.addLog(`${caster.displayName}'s Phase-Torpedo phased through defensive fire!`);
    }
  },
  pacification_field: {
    id: 'pacification_field', name: 'Pacify', suit: 'ELIF', cost: 2, heatGenerated: 20, targetType: 'SELF',
    description: 'Emit a frequency that dampens aggression. Enemies at range 3 have -5 accuracy.',
    execute: async (caster, target, manager) => {
      manager.addLog(`${caster.displayName} activates Pacification Field!`);
      caster.applyStatusEffect('pacify_aura', 2);
    }
  },

  // ==========================================
  // COL'DUNNACK (SWARM)
  // ==========================================
  acid_spore_pod: {
    id: 'acid_spore_pod', name: 'Acid Pod', suit: 'COL', cost: 1, heatGenerated: 5, range: 3, targetType: 'UNIT',
    description: 'Melt enemy armor. AC reduced for 3 turns.',
    execute: async (caster, targetEntity, manager) => {
      targetEntity.ac -= 2;
      manager.addLog(`${targetEntity.displayName} armor MELTED! AC reduced.`);
      await manager.executeAttack(caster.id, targetEntity.id, { name: 'Acid', damage: 5 });
    }
  },
  spawn_bio_drones: {
    id: 'spawn_bio_drones', name: 'Bio-Drones', suit: 'COL', cost: 2, heatGenerated: 5, targetType: 'SELF',
    description: 'Eject a swarm of biological interceptors. Heals caster for 5 HP per adjacent enemy.',
    execute: async (caster, target, manager) => {
      let count = 0;
      for (let ship of manager.ships.values()) {
        const dist = Math.max(Math.abs(caster.x - ship.x), Math.abs(caster.y - ship.y));
        if (dist === 1 && ship.faction !== caster.faction) count++;
      }
      if (count > 0) {
        caster.hp = Math.min(caster.maxHp, caster.hp + (count * 5));
        manager.addLog(`${caster.displayName} drones harvest biological matter. Healed ${count * 5} HP.`);
      }
    }
  },
  bio_plasma_strike: {
    id: 'bio_plasma_strike', name: 'Bio-Plasma', suit: 'COL', cost: 1, heatGenerated: 10, range: 4, targetType: 'UNIT',
    description: 'Inhibit enemy systems. Target cannot use Reboot cards for 2 turns.',
    execute: async (caster, target, manager) => {
      target.applyStatusEffect('plasma_corrosion', 2);
      await manager.executeAttack(caster.id, target.id, { name: 'Bio-Plasma', damage: 8 });
    }
  },
  rapid_regrow: {
    id: 'rapid_regrow', name: 'Regrow', suit: 'COL', cost: 1, heatGenerated: 10, targetType: 'SELF',
    description: 'Biological regeneration of the hull.',
    execute: async (caster, targetEntity, manager) => {
      caster.hp = Math.min(caster.maxHp, caster.hp + 15);
      manager.addLog(`${caster.displayName} flesh is knitting back together.`);
      manager.emitStateUpdate();
    }
  },

  // ==========================================
  // THE DAWN (LEGENDS)
  // ==========================================
  sonic_dart: {
    id: 'sonic_dart', name: 'Sonic Dart', suit: 'DAWN', cost: 1, heatGenerated: 5, range: 6, targetType: 'UNIT',
    description: 'Light kinetic strike that disorients the bridge crew.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Sonic Dart', damage: 6 });
      if (Math.random() > 0.4) target.applyStatusEffect('bridge_stun', 1);
    }
  },
  harmonic_torpedo: {
    id: 'harmonic_torpedo', name: 'Harmonic Torpedo', suit: 'DAWN', cost: 2, heatGenerated: 10, range: 8, targetType: 'UNIT',
    description: 'Resonant frequency ordnance. High critical failure chance.',
    execute: async (caster, target, manager) => {
      await manager.executeAttack(caster.id, target.id, { name: 'Harmonic Torpedo', damage: 15 });
      const SubsystemTable = (await import('../combat/SubsystemTable.js')).default;
      SubsystemTable.roll(target, manager);
    }
  },
  will_break: {
    id: 'will_break', name: 'Will Break', suit: 'DAWN', cost: 3, heatGenerated: 20, range: 5, targetType: 'UNIT',
    description: 'Psionic dampening. Target loses AP on next turn.',
    execute: async (caster, target, manager) => {
      target.applyStatusEffect('will_broken', 1);
      manager.addLog(`${target.displayName} experiences existence failure!`);
    }
  },

  // ==========================================
  // UTILITY
  // ==========================================
  make_it_so: {
    id: 'make_it_so', name: 'Make It So', suit: 'Captain', cost: 1, heatGenerated: 5, targetType: 'UNIT',
    description: 'Grant target advantage on their next action.',
    execute: async (caster, targetEntity, manager) => {
      targetEntity.applyStatusEffect('advantage_next_roll');
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
  snap_dodge: {
    id: 'snap_dodge', name: 'Snap Dodge', suit: 'Navigator', cost: 1, heatGenerated: 5, targetType: 'SELF',
    description: 'Reaction: Evade an incoming attack.',
    execute: async (caster, targetEntity, manager) => {
      caster.flags.isEvading = true; 
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
    id: 'grav_repulsor', name: 'Grav-Repulsor', suit: 'Science', cost: 1, heatGenerated: 10, range: 3, targetType: 'UNIT',
    description: 'Push target unit 3 tiles away using graviton pulses.',
    execute: async (caster, target, manager) => {
      GravityMechanics.executeGravityEvent(caster, 3, 3, true, manager);
      manager.addLog(`${caster.displayName} activates GRAV-REPULSOR!`);
    }
  }
};
