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
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.maxShields = config.shields || 0;
    this.shields = this.maxShields;
    this.speed = config.speed || 3;
    this.reactorHeat = 0;
    this.flags = { steadyVector: true, isEvading: false };
    this.modifiers = {};
  }

  get displayName() {
    const typePrefix = SHIP_TYPE_PREFIXES[this.shipType] || 'UNK';
    const factionPrefix = FACTION_PREFIXES[this.faction] || '???';
    return `${factionPrefix}-${typePrefix} ${this.baseName}`;
  }

  applyStatusEffect(effect) { /* ... */ }
  removeStatusEffect(effect) { /* ... */ }
  takeDamage(amount) { /* ... */ }

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
      isEvading: this.flags.isEvading 
    };
  }
}
