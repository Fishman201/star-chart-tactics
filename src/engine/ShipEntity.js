import SubsystemTable from './combat/SubsystemTable.js';

const SHIP_TYPE_PREFIXES = {
  'Fighter': 'FTR', 'Interceptor': 'INT', 'Frigate': 'FF', 
  'Destroyer': 'DD', 'Cruiser': 'CA', 'Carrier': 'CV', 
  'Titan': 'BB', 'Dreadnought': 'DN', 'Spire-Ship': 'SPR', 
  'Space Hulk': 'HLK', 'Bio-Swarm': 'BIO',
};

const FACTION_PREFIXES = {
  'UEF': 'UEV', 'Nul': 'NUL', 'Nurk': 'NRK', 'Elif': 'ELF', 'Dawn': 'DWN'
};

export default class ShipEntity {
  constructor(config) {
    this.id = config.id || crypto.randomUUID();
    this.baseName = config.name;
    this.shipType = config.shipType;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.maxHp = config.hp || config.maxHp;
    this.hp = config.hp || config.maxHp;
    this.maxShields = config.shields || 0;
    this.shields = this.maxShields;
    this.speed = config.speed || 3;
    this.wps = config.wps || 0;
    this.ac = config.ac || 15;
    this.reactorHeat = 0;
    this.deck = config.deck || [];
    this.flags = { steadyVector: true, isEvading: false };
    this.statusEffects = new Map();
    this.subsystems = {
        weapons: true,
        engines: true,
        hull: true,
        lifeSupport: true,
        bridge: true
    };
  }

  get displayName() {
    const typePrefix = SHIP_TYPE_PREFIXES[this.shipType] || 'UNK';
    const factionPrefix = FACTION_PREFIXES[this.faction] || '???';
    return `${factionPrefix}-${typePrefix} ${this.baseName}`;
  }

  applyStatusEffect(effect, duration = 1) {
    this.statusEffects.set(effect, duration);
  }

  removeStatusEffect(effect) {
    this.statusEffects.delete(effect);
  }

  hasStatus(effect) {
    return this.statusEffects.has(effect);
  }

  async takeDamage(amount, manager, isCrit = false) {
    if (this.hasStatus('phased')) {
        if (manager) manager.addLog(`${this.displayName} is PHASED - Damage ignored!`);
        return;
    }

    // Nurk Passive: Junk-Shielding (15% chance to ignore hit)
    if (this.faction === 'NURK' || this.faction === 'Nurk') {
        const Dice = (await import('./combat/Dice.js')).default;
        if (Dice.roll(1, 100) <= 15) {
            if (manager) manager.addLog(`${this.displayName}: JUNK-SHIELDING ACTIVATED! Damage absorbed by debris.`);
            return;
        }
    }

    let remainingDamage = amount;
    let hitHull = false;

    // Shield logic
    if (this.shields > 0) {
        const shieldDamage = Math.min(this.shields, remainingDamage);
        this.shields -= shieldDamage;
        remainingDamage -= shieldDamage;
        if (manager) manager.addLog(`${this.displayName} shields absorb ${shieldDamage} damage! (${this.shields} left)`);
    }

    // Hull logic
    if (remainingDamage > 0) {
        hitHull = true;
        if (this.hasStatus('hull_breach')) {
            remainingDamage += 2;
        }

        this.hp -= remainingDamage;
        if (manager) manager.addLog(`${this.displayName} hull takes ${remainingDamage} damage!`);
    }

    // Trigger Subsystem Damage
    if ((hitHull || isCrit) && this.hp > 0) {
        SubsystemTable.roll(this, manager);
    }
  }

  onTurnStart(manager) {
    // Faction Passives
    if (this.faction === 'COLDUNNACK' || this.faction === 'Col\'dunnack') {
        this.hp = Math.min(this.maxHp, this.hp + 2);
        if (manager) manager.addLog(`${this.displayName} bio-regen: +2 HP.`);
    }

    for (let [effect, duration] of this.statusEffects.entries()) {
        if (effect === 'life_support_breach') {
            this.hp -= 1;
            if (manager) manager.addLog(`${this.displayName} takes 1 Life Support damage!`);
        }

        duration--;
        if (duration <= 0) {
            this.statusEffects.delete(effect);
            if (manager) manager.addLog(`${this.displayName}: Effect ${effect} expired.`);
        } else {
            this.statusEffects.set(effect, duration);
        }
    }
    this.flags.isEvading = false;
  }

  serialize() {
    return {
      id: this.id,
      displayName: this.displayName,
      x: this.x,
      y: this.y,
      hp: this.hp,
      maxHp: this.maxHp,
      shields: this.shields,
      maxShields: this.maxShields,
      reactorHeat: this.reactorHeat,
      isEvading: this.flags.isEvading,
      wps: this.wps,
      ac: this.ac,
      statusEffects: Array.from(this.statusEffects.keys())
    };
  }
}
