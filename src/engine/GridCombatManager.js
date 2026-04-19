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
    this.vfxQueue = [];
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
      logs: [...this.logs],
      vfxQueue: [...this.vfxQueue]
    };
  }

  addVFX(type, source, target, color = '#39ff14') {
    const id = crypto.randomUUID();
    this.vfxQueue.push({
      id, type,
      source: { x: source.x, y: source.y },
      target: { x: target.x, y: target.y },
      color,
      timestamp: Date.now()
    });
    this.emitStateUpdate();

    // Auto-cleanup VFX after the CSS animation finishes
    setTimeout(() => {
      this.vfxQueue = this.vfxQueue.filter(vfx => vfx.id !== id);
      // Only emit if it actually removed something to avoid noisy re-renders
      if (this.vfxQueue.length >= 0) this.emitStateUpdate();
    }, 1000);
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
        if (enemy.faction === 'NURK' && dist <= 3) {
          // Fixed: simulate a "Harpoon" every few turns (simulated as cooldown)
          if (this.turnCount % 2 === 0) {
            this.addVFX('tether', enemy, player, '#ff00ff');
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
          let wpnName = 'Scrap-Cannon';
          let dmg = 6;
          if (enemy.faction === 'NUL') { wpnName = 'Emerald Lance'; dmg = 8; }
          else if (enemy.faction === 'ELIF') { wpnName = 'Solar-Eye Beam'; dmg = 10; }
          else if (enemy.faction === 'COLDUNNACK') { wpnName = 'Acid-Spore Pod'; dmg = 5; }
          else if (enemy.faction === 'DAWN') { wpnName = 'Sonic Dart'; dmg = 4; }

          this.executeAttack(enemy.id, 'player_hero', { name: wpnName, damage: dmg });
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
      // Balanced starter deck: Weapons, Science, Navigator, and Captain abilities
      const starterDeck = [
        // 4 Attacks (reduced from 7)
        'railgun_shot', 'railgun_volley', 'sparc_lance', 'heavy_torpedo',
        // 3 Defense & Recovery
        'shield_boost', 'rapid_reboot', 'damage_control',
        // 3 Utility & Command
        'target_lock', 'make_it_so', 'sparc_surge',
        // 2 Evasion & Movement
        'evasive_maneuvers', 'snap_dodge'
      ];
      this.cardSystem = new CardSystem(shipEntity, starterDeck);
    }

    this.emitStateUpdate();
  }

  getWeaponVFX(weaponName) {
    const name = (weaponName || '').toLowerCase();
    if (name.includes('lance') || name.includes('beam') || name.includes('sparc') || name.includes('resonance') || name.includes('plasma')) return 'beam';
    if (name.includes('torpedo') || name.includes('missile') || name.includes('pod') || name.includes('spore')) return 'missile';
    if (name.includes('harpoon') || name.includes('tether')) return 'tether';
    return 'kinetic'; // Default to kinetic (railguns, scrap-cannons, etc.)
  }

  async executeAttack(attackerId, targetId, weapon) {
    const attacker = this.ships.get(attackerId);
    const target = this.ships.get(targetId);
    if (!attacker || !target) return;

    // Faction-based colors for the laser beam VFX
    const vfxColor = attacker.faction === 'UEF' ? '#39ff14'  // Neon Green
      : attacker.faction === 'NURK' ? '#ff00ff' // Magenta
        : attacker.faction === 'NUL' ? '#00ffff'  // Cyan
          : attacker.faction === 'ELIF' ? '#ffff00' // Yellow
            : attacker.faction === 'COLDUNNACK' ? '#adff2f' // Green-Yellow
              : attacker.faction === 'DAWN' ? '#e0b0ff' // Pale Purple
                : '#ffb000';                              // Amber fallback

    // Trigger projectile VFX immediately
    const weaponName = weapon?.name || 'Railgun';
    const vfxType = this.getWeaponVFX(weaponName);
    this.addVFX(vfxType, attacker, target, vfxColor);

    // Fixed Success Threshold: WPS + 10 vs AC
    const hitThreshold = attacker.wps + 10;
    const isHit = hitThreshold >= target.ac;
    const isCrit = hitThreshold >= (target.ac + 5);

    if (isHit) {
      let damage = weapon.damage || 10;

      // Trigger explosion VFX after a short delay to simulate travel time
      const impactDelay = vfxType === 'missile' ? 400 : (vfxType === 'kinetic' ? 200 : 150);
      setTimeout(() => {
        this.addVFX('explosion', target, target, isCrit ? '#ff003c' : '#ffb000');
      }, impactDelay);

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
        this.addVFX('ship_explosion', ship, ship, '#ff003c');
        this.addLog(`[DESTROYED] ${ship.displayName} exploded!`);
        this.ships.delete(id);
      }
    }
    this.emitStateUpdate();
  }
}
