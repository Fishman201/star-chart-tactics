export class ShipEntity {
    constructor(config) {
        this.id = config.id || Math.random().toString(36).substr(2, 9);
        this.faction = config.faction || 'UEF';
        this.name = config.name || 'Unknown Ship';
        
        // Vitals
        this.maxHp = config.hp || 100;
        this.hp = this.maxHp;
        this.maxShields = config.shields || 50;
        this.shields = this.maxShields;
        
        // Stats
        this.baseAccuracy = config.baseAccuracy || 70; // Percentage
        this.evasion = config.evasion || 15; // Percentage
        this.speed = config.speed || 3;
        
        // Mechanics
        this.reactorHeat = 0; // 0 to 100
        this.maxHeat = 100;
        this.isStalled = false;
        
        // Map Position
        this.x = config.x || 0;
        this.y = config.y || 0;

        // Buffs/Debuffs array
        this.statusEffects = [];
    }

    takeDamage(amount, bypassShields = false) {
        let actualDamage = amount;
        
        if (!bypassShields && this.shields > 0) {
            // "Shields mitigate 100% of damage until depleted."
            if (this.shields >= actualDamage) {
                this.shields -= actualDamage;
                actualDamage = 0;
            } else {
                actualDamage -= this.shields;
                this.shields = 0;
            }
        }

        if (actualDamage > 0) {
            this.hp = Math.max(0, this.hp - actualDamage);
        }

        return actualDamage; // Return damage actually dealt to HP for logs or passive triggers
    }

    addHeat(amount) {
        this.reactorHeat += amount;
        if (this.reactorHeat >= this.maxHeat) {
            this.reactorHeat = 0; // Vent
            this.isStalled = true;
            this.evasion = 0; // Stalled drawback
            this.takeDamage(15, true); // Flat internal damage
            return true; // Indicates ship stalled
        }
        return false;
    }

    resetHeat() {
        this.reactorHeat = 0;
        this.isStalled = false;
        // Logic to restore evasion would need to check base stats, maybe handled by manager
    }
}
