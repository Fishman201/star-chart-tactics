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
    this.faction = config.faction;
    this.x = config.x || 0;
    this.y = config.y || 0;
    const baseHp = config.hp || config.maxHp || 10;
    this.maxHp = baseHp;
    this.hp = baseHp;
    this.maxShields = config.shields || 0;
    this.shields = this.maxShields;
    this.speed = config.speed || 3;
    this.wps = config.wps || 0;
    this.ac = config.ac || 15;
    this.reactorHeat = 0;
    this.flags = { steadyVector: true, isEvading: false };
    this.statusEffects = new Map();
    this.subsystems = {
      weapons: { label: 'WEAPONS', status: 'operational' },
      engines: { label: 'ENGINES', status: 'operational' },
      hull: { label: 'HULL', status: 'operational' },
      lifeSupport: { label: 'LIFE SUPPORT', status: 'operational' },
      bridge: { label: 'BRIDGE', status: 'operational' }
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
    let remainingDamage = amount;
    let hitHull = false;

    // ELIF Passive: Phasing Immunity
    if (this.hasStatus('phased')) {
      if (manager) manager.addLog(`${this.displayName} is phased out of reality! Attack passes harmlessly through.`);
      return;
    }

    // NURK Passive: Junk-Shielding (15% chance to ignore hit)
    if (this.faction === 'NURK' && Math.random() < 0.15) {
      if (manager) manager.addLog(`${this.displayName}'s Junk-Shielding deflects the attack!`);
      return;
    }

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
    // Natural Heat Decay
    if (this.reactorHeat > 0) {
      this.reactorHeat = Math.max(0, this.reactorHeat - 20);
      if (manager && this.id === 'player_hero') {
        manager.addLog(`${this.displayName} passive sink disspates 20 Heat. (Core at ${this.reactorHeat}%)`);
      }
    }

    // Clear Reactor Stall if present from last turn
    if (this.hasStatus('stalled')) {
      this.removeStatusEffect('stalled');
      if (manager) manager.addLog(`[ SYSTEM BOOT ] ${this.displayName} reactor online.`);
    }

    // COL'DUNNACK Passive: Bio-Regen (Restore 2 HP per turn)
    if (this.faction === 'COLDUNNACK' && this.hp > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + 2);
      if (manager) manager.addLog(`${this.displayName}'s Bio-Regen restores 2 HP.`);
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
      statusEffects: Array.from(this.statusEffects.keys()),
      subsystems: { ...this.subsystems }
    };
  }
}
