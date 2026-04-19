import CardSystem from './CardSystem.js';
import { CardDatabase } from './cards/CardDatabase.js';

export default class GridCombatManager {
  constructor(updateReactCallback) {
    this.updateReactCallback = updateReactCallback;
    this.gridSize = { width: 20, height: 20 };
    this.turnPhase = 'PLAYER_TURN';
    this.ships = new Map();
    this.turnCount = 1;
    this.logs = ["--- COMBAT INITIALIZED ---"];
    this.cardSystem = null; 
    this.aiCooldowns = new Map();
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
    const enemies = Array.from(this.ships.values()).filter(s => s.faction !== 'UEF');
    const player = this.ships.get('player_hero');
    if (!player) return;

    this.aiCooldowns = this.aiCooldowns || new Map();

    enemies.forEach((enemy, index) => {
        setTimeout(async () => {
            if (this.ships.get(enemy.id)?.hp <= 0) return;

            const dist = Math.max(Math.abs(enemy.x - player.x), Math.abs(enemy.y - player.y));
            let actedWithCard = false;

            // 1. Check Deck for Priority Action
            if (enemy.deck && enemy.deck.length > 0) {
                for (const cardId of enemy.deck) {
                    const card = CardDatabase[cardId];
                    const cooldownKey = `${enemy.id}_${cardId}`;
                    const currentCooldown = this.aiCooldowns.get(cooldownKey) || 0;

                    if (currentCooldown === 0) {
                        // Check range and target logic
                        if (card.targetType === 'SELF' || (card.range && dist <= card.range)) {
                            this.addLog(`[AI] ${enemy.displayName} uses ${card.name}!`);
                            await card.execute(enemy, player, this);
                            this.aiCooldowns.set(cooldownKey, 3); // 3 turn cooldown for AI cards
                            actedWithCard = true;
                            break;
                        }
                    }
                }
            }

            // 2. Cooldown Management
            for (let [key, val] of this.aiCooldowns.entries()) {
                if (key.startsWith(enemy.id) && val > 0) this.aiCooldowns.set(key, val - 1);
            }

            // 3. Move Logic
            if (!actedWithCard || dist > 1) {
                // If Faction is Nurk, always close to melee. Else move if out of range.
                const shouldMove = enemy.faction === 'NURK' || enemy.faction === 'Nurk' || dist > 2;
                if (shouldMove && dist > 1) {
                    if (player.x > enemy.x) enemy.x++;
                    else if (player.x < enemy.x) enemy.x--;
                    
                    if (player.y > enemy.y) enemy.y++;
                    else if (player.y < enemy.y) enemy.y--;
                    
                    this.addLog(`${enemy.displayName} advances.`);
                }
            }

            // 4. Standard Attack (if not used card or still has "action")
            const newDist = Math.max(Math.abs(enemy.x - player.x), Math.abs(enemy.y - player.y));
            if (!actedWithCard && newDist <= 2) {
                await this.executeAttack(enemy.id, 'player_hero', { name: 'Closing Volley', damage: 6 });
            }

            if (index === enemies.length - 1) {
                setTimeout(() => this.startPlayerTurn(), 1000);
            }
        }, 1000 * (index + 1));
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

  async checkDeaths() {
    for (let [id, ship] of this.ships.entries()) {
        if (ship.hp <= 0) {
            this.addLog(`[DESTROYED] ${ship.displayName} exploded!`);
            
            // Nurk Passive: Death Explosion
            if (ship.faction === 'NURK' || ship.faction === 'Nurk') {
                this.addLog(`FATAL OVERLOAD: ${ship.displayName} releases energy!`);
                const targets = Array.from(this.ships.values()).filter(s => 
                    Math.max(Math.abs(s.x - ship.x), Math.abs(s.y - ship.y)) <= 1 && s.id !== ship.id
                );
                for (const t of targets) {
                    await t.takeDamage(10, this);
                }
            }

            this.ships.delete(id);
        }
    }
    this.emitStateUpdate();
  }
}
