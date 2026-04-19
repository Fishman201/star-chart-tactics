import { ShipEntity } from './ShipEntity';
import { CardSystem } from './CardSystem';

export class GridCombatManager {
    constructor() {
        this.gridSize = 15;
        this.turnNumber = 1;
        this.activePhase = 'PLAYER'; // 'PLAYER' or 'ENEMY'
        this.logs = [];

        this.entities = [];
        this.cardSystem = new CardSystem(this);

        this.listeners = [];
        this.initializeBattle();
    }

    log(msg) {
        this.logs.unshift(msg);
        if (this.logs.length > 50) this.logs.pop();
    }

    initializeBattle() {
        const player = new ShipEntity({
            id: 'player_hero', faction: 'UEF', name: 'UEF Vanguard',
            hp: 100, shields: 50, x: 2, y: 7
        });

        const enemy = new ShipEntity({
            id: 'enemy_nurk', faction: 'NURK', name: 'Nurk Scrapper',
            hp: 150, shields: 20, speed: 2, evasion: 5, x: 12, y: 7
        });

        this.entities = [player, enemy];
        
        // Initial setup
        this.cardSystem.drawCards(5);
        this.log('Battle Initiated. Player Turn.');
    }

    getPlayerShip() {
        return this.entities.find(e => e.id === 'player_hero');
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyUpdate() {
        const player = this.getPlayerShip();
        const stateSnapshot = {
            gridSize: this.gridSize,
            turnNumber: this.turnNumber,
            activePhase: this.activePhase,
            entities: this.entities.map(e => ({ ...e, statusEffects: [...e.statusEffects] })),
            deckSize: this.cardSystem.deck.length,
            discardSize: this.cardSystem.discardPile.length,
            hand: this.cardSystem.hand.map(c => ({ ...c })),
            ap: this.cardSystem.currentAP,
            maxAp: this.cardSystem.maxAP,
            heat: player?.reactorHeat ?? 0,
            stalled: player?.isStalled ?? false,
            cardsPlayed: this.cardSystem.cardsPlayedThisTurn,
            maxCardsPerTurn: this.cardSystem.maxCardsPerTurn,
            logs: [...this.logs]
        };
        this.listeners.forEach(cb => cb(stateSnapshot));
    }

    // --- Action Methods ---

    moveEntity(entityId, targetX, targetY) {
        if (this.activePhase !== 'PLAYER') return false;
        
        const entity = this.entities.find(e => e.id === entityId);
        if (!entity || entity.isStalled) return false;

        // Basic AP cost for movement
        if (entityId === 'player_hero') {
            if (this.cardSystem.currentAP < 1) {
                this.log('Not enough AP to move.');
                return false;
            }
        }

        // Distance check (Chebyshev)
        const dist = Math.max(Math.abs(entity.x - targetX), Math.abs(entity.y - targetY));
        if (dist > entity.speed) {
            this.log('Target out of movement range.');
            return false; // Beyond speed
        }
        
        if (this.entities.some(e => e.x === targetX && e.y === targetY)) {
            return false; // Tile occupied
        }

        entity.x = targetX;
        entity.y = targetY;

        if (entityId === 'player_hero') {
            this.cardSystem.currentAP -= 1;
        }

        this.log(`${entity.name} moved to [${targetX}, ${targetY}]`);
        this.notifyUpdate();
        return true;
    }

    // Check if a card can legally target an enemy from the player's position
    isInCardRange(cardInstanceId) {
        const card = this.cardSystem.hand.find(c => c.instanceId === cardInstanceId);
        const player = this.getPlayerShip();
        if (!card || !player || !card.range) return () => true; // No range = always valid
        return (enemy) => {
            const dist = Math.max(Math.abs(player.x - enemy.x), Math.abs(player.y - enemy.y));
            return dist <= card.range;
        };
    }

    checkDeaths() {
        this.entities = this.entities.filter(e => {
            if (e.hp <= 0) {
               this.log(`${e.name} has been destroyed!`);
               return false;
            }
            return true;
        });
    }

    endPlayerTurn() {
        if (this.activePhase !== 'PLAYER') return;
        this.activePhase = 'ENEMY';
        this.log('--- ENEMY PHASE ---');
        this.notifyUpdate();

        // Process Status effect durations (Very basic implementation)
        this.getPlayerShip().statusEffects = []; // Clear for now

        // Process AI turn
        setTimeout(() => this.executeEnemyPhase(), 1000);
    }

    executeEnemyPhase() {
        const enemies = this.entities.filter(e => e.faction !== 'UEF');
        const player = this.getPlayerShip();

        enemies.forEach(enemy => {
            if(!player) return;

            // Simplified AI: Move closer
            const dist = Math.max(Math.abs(enemy.x - player.x), Math.abs(enemy.y - player.y));
            
            if (dist > 3) {
                 // Move
                 const dx = Math.sign(player.x - enemy.x);
                 const dy = Math.sign(player.y - enemy.y);
                 enemy.x += dx * Math.min(enemy.speed, Math.abs(player.x - enemy.x));
                 enemy.y += dy * Math.min(enemy.speed, Math.abs(player.y - enemy.y));
                 this.log(`${enemy.name} maneuvers to engage.`);
            } else {
                 // Attack
                 const hitChance = enemy.baseAccuracy - player.evasion;
                 if (Math.random() * 100 <= hitChance) {
                     let bypassShields = false;
                     // Nurk Junk-Shield check happens when they take dmg, Nul Resonance ignores shields, etc.
                     // (Faction traits placeholder)
                     
                     player.takeDamage(15, bypassShields);
                     this.log(`${enemy.name} fired and hit UEF Vanguard for 15 damage.`);
                 } else {
                     this.log(`${enemy.name} fired and missed.`);
                 }
            }
        });

        this.checkDeaths();
        
        setTimeout(() => {
            this.activePhase = 'PLAYER';
            this.turnNumber++;
            this.log(`--- PLAYER PHASE : TURN ${this.turnNumber} ---`);
            this.cardSystem.onTurnStart();
            this.notifyUpdate();
        }, 1000);
    }
}
