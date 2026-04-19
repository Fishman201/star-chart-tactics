import CardSystem from './CardSystem.js';

export default class GridCombatManager {
  constructor(updateReactCallback) {
    this.updateReactCallback = updateReactCallback;
    this.gridSize = { width: 20, height: 20 };
    this.turnPhase = 'PLAYER_TURN';
    this.ships = new Map();
    this.turnCount = 1;
    this.logs = ["--- COMBAT INITIALIZED ---"];
    this.cardSystem = null; 
  }

  addLog(message) {
    this.logs.unshift(message);
    if (this.logs.length > 50) this.logs.pop();
    this.emitStateUpdate();
  }

  emitStateUpdate() {
    if (this.updateReactCallback) {
      this.updateReactCallback(this.getStateSnapshot());
    }
  }

  getStateSnapshot() {
    return {
      gridSize: this.gridSize,
      turnPhase: this.turnPhase,
      turnCount: this.turnCount,
      ships: Array.from(this.ships.values()).map(ship => ship.serialize()),
      cardSystem: this.cardSystem ? this.cardSystem.serialize() : null,
      logs: [...this.logs]
    };
  }

  startPlayerTurn() {
    this.turnPhase = 'PLAYER_TURN';
    this.turnCount++;
    this.addLog(`--- TURN ${this.turnCount} START ---`);
    
    // Tick player ship
    const player = this.ships.get('player_hero');
    if (player) player.onTurnStart(this);

    if (this.cardSystem) {
      this.cardSystem.startTurn();
    }
    this.emitStateUpdate();
  }

  endPlayerTurn() {
    this.turnPhase = 'ENEMY_TURN';
    this.emitStateUpdate();
    this.resolveEnemyTurn();
  }

  resolveEnemyTurn() {
    // Basic AI Loop
    const enemies = Array.from(this.ships.values()).filter(s => s.faction !== 'UEF');
    const player = this.ships.get('player_hero');
    
    if (!player) return;

    enemies.forEach((enemy, index) => {
        setTimeout(async () => {
            if (enemy.hp <= 0) return;

            const dist = Math.max(Math.abs(enemy.x - player.x), Math.abs(enemy.y - player.y));

            // AI Action 1: Skill / Card simulation
            if (enemy.faction === 'Nurk' && dist <= 3) {
                // Fixed: simulate a "Harpoon" every few turns (simulated as cooldown)
                if (this.turnCount % 2 === 0) {
                    this.addLog(`${enemy.displayName} fires MAG-HARPOON!`);
                    // Displacement effect
                    if (player.x > enemy.x) player.x--;
                    else if (player.x < enemy.x) player.x++;
                    await player.takeDamage(2, this);
                }
            }

            // AI Action 2: Move toward player
            if (dist > 1) {
                if (player.x > enemy.x) enemy.x++;
                else if (player.x < enemy.x) enemy.x--;
                
                if (player.y > enemy.y) enemy.y++;
                else if (player.y < enemy.y) enemy.y--;
                
                this.addLog(`${enemy.displayName} advances.`);
            }

            // AI Action 3: Basic Attack
            if (dist <= 2) {
                this.executeAttack(enemy.id, 'player_hero', { name: 'Scrap-Cannon', damage: 6 });
            }

            if (index === enemies.length - 1) {
                setTimeout(() => this.startPlayerTurn(), 1000);
            }
        }, 800 * (index + 1));
    });

    if (enemies.length === 0) {
        setTimeout(() => this.startPlayerTurn(), 1000);
    }
  }

  registerShip(shipEntity) {
    this.ships.set(shipEntity.id, shipEntity);
    
    // If this is the first UEF ship (the player's ship), initialize the CardSystem
    if (shipEntity.faction === 'UEF' && !this.cardSystem) {
        // Starter deck IDs from CardDatabase
        const starterDeck = [
            'make_it_so', 'snap_dodge', 'target_lock', 'rapid_reboot', 
            'emergency_coolant', 'flak_screen', 'sparc_surge', 
            'evasive_stunt', 'damage_control', 'grav_repulsor'
        ];
        this.cardSystem = new CardSystem(shipEntity, starterDeck);
    }
    
    this.emitStateUpdate();
  }

  async executeAttack(attackerId, targetId, weapon) {
    const attacker = this.ships.get(attackerId);
    const target = this.ships.get(targetId);
    if (!attacker || !target) return;

    // Fixed Success Threshold: WPS + 10 vs AC
    const hitThreshold = attacker.wps + 10;
    const isHit = hitThreshold >= target.ac;
    const isCrit = hitThreshold >= (target.ac + 5);

    if (isHit) {
        let damage = weapon.damage || 10;
        if (isCrit) {
            damage = Math.floor(damage * 1.5);
            this.addLog(`CRITICAL HIT! ${attacker.displayName} strikes ${target.displayName} for ${damage} damage.`);
        } else {
            this.addLog(`${attacker.displayName} hits ${target.displayName} for ${damage} damage.`);
        }
        await target.takeDamage(damage, this, isCrit);
    } else {
        this.addLog(`${attacker.displayName} misses ${target.displayName}.`);
    }

    this.checkDeaths();
  }

  checkDeaths() {
    for (let [id, ship] of this.ships.entries()) {
        if (ship.hp <= 0) {
            this.addLog(`[DESTROYED] ${ship.displayName} exploded!`);
            this.ships.delete(id);
        }
    }
    this.emitStateUpdate();
  }
}
