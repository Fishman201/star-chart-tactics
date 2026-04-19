import { CardDatabase } from './cards/CardDatabase';

export class CardSystem {
    constructor(engine) {
        this.engine = engine; // Reference to GridCombatManager
        
        // AP
        this.maxAP = 3;
        this.currentAP = this.maxAP;
        
        // Deck Management
        this.deck = [];
        this.hand = [];
        this.discardPile = [];
        
        this.maxHandSize = 7;
        this.cardsPlayedThisTurn = 0;
        this.maxCardsPerTurn = 2;

        this.initializeDeck();
    }

    initializeDeck() {
        const starterIds = [
            // Weapons — core of the attack system
            'standard_shot', 'standard_shot', 'standard_shot',
            'railgun_burst', 'railgun_burst',
            'missile_salvo', 'missile_salvo',
            'target_lock',
            // Navigator
            'snap_dodge', 'snap_dodge',
            'focused_evasion',
            // Science
            'rapid_reboot',
            'system_override',
            'vent_heat',
            // Captain
            'make_it_so', 'make_it_so',
            'all_hands',
        ];

        this.deck = starterIds.map(id => ({
            ...CardDatabase.find(c => c.id === id),
            instanceId: Math.random().toString(36).substr(2, 9)
        }));

        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCards(amount) {
        let drawn = 0;
        for (let i = 0; i < amount; i++) {
            if (this.hand.length >= this.maxHandSize) {
                this.engine.log(`Hand full. Cannot draw more cards.`);
                break;
            }

            if (this.deck.length === 0) {
                if (this.discardPile.length === 0) {
                   this.engine.log(`Deck and discard pile empty!`);
                   break; // Out of cards completely
                }
                // Reshuffle discards
                this.deck = [...this.discardPile];
                this.discardPile = [];
                this.shuffleDeck();
                this.engine.log(`Discard pile reshuffled into deck.`);
            }

            const card = this.deck.pop();
            this.hand.push(card);
            drawn++;
        }
        return drawn;
    }

    canPlayCard(cardInstanceId) {
        const card = this.hand.find(c => c.instanceId === cardInstanceId);
        if (!card) return false;

        const playerShip = this.engine.getPlayerShip();
        if (playerShip.isStalled) return false;

        if (this.currentAP < card.apCost) return false;
        if (this.cardsPlayedThisTurn >= this.maxCardsPerTurn) return false;
        
        // Heat check? Manual says powerful cards generate heat, but doesn't prevent playing them if it pushes to 100%.
        return true;
    }

    playCard(cardInstanceId, targetEntity = null) {
        if (!this.canPlayCard(cardInstanceId)) return false;

        const cardIndex = this.hand.findIndex(c => c.instanceId === cardInstanceId);
        const card = this.hand[cardIndex];

        // Cost resolution
        this.currentAP -= card.apCost;
        this.cardsPlayedThisTurn += 1;

        const playerShip = this.engine.getPlayerShip();
        // Negative heatGenerated = cooling (e.g. Emergency Vent)
        const stalled = card.heatGenerated >= 0
            ? playerShip.addHeat(card.heatGenerated)
            : (playerShip.reactorHeat = Math.max(0, playerShip.reactorHeat + card.heatGenerated), false);

        // Resolve Effect
        const resolvedTarget = card.targetType === 'SELF' ? playerShip : targetEntity;
        if (card.execute) {
            card.execute(this.engine, playerShip, resolvedTarget);
        }

        // Cleanup
        this.hand.splice(cardIndex, 1);
        this.discardPile.push(card);

        this.engine.notifyUpdate(); // Trigger UI re-render
        return true;
    }

    onTurnStart() {
        this.cardsPlayedThisTurn = 0;
        
        // Max half AP rolls over -> math.floor(3/2) = 1.
        // Wait, user said "Max half AP rolls over". If maxAP is 3, 1 AP can roll over.
        let rollOverAp = Math.min(this.currentAP, Math.floor(this.maxAP / 2));
        this.currentAP = this.maxAP + rollOverAp;

        this.drawCards(2);
    }
}
