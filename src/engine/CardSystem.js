import { CardDatabase } from './cards/CardDatabase.js';

export default class CardSystem {
    constructor(casterShip, starterDeckIds = []) {
        this.casterShip = casterShip;
        this.deck = [...starterDeckIds];
        this.hand = [];
        this.discard = [];
        this.actionPoints = 3;
        this.maxActionPoints = 3;
        this.rolledOverAP = 0;
        this.cardsPlayedThisTurn = 0;
        this.rapidRebootUsesThisCombat = 0;

        this.shuffleDeck();
        this.drawCards(5);
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCards(amount) {
        for (let i = 0; i < amount; i++) {
            if (this.hand.length >= 7) break;

            if (this.deck.length === 0) {
                if (this.discard.length === 0) break;
                this.deck = [...this.discard];
                this.discard = [];
                this.shuffleDeck();
            }

            const cardId = this.deck.pop();
            if (cardId) this.hand.push(cardId);
        }
    }

    canPlayCard(cardId) {
        const card = CardDatabase[cardId];
        if (!card) return { allowed: false, reason: "Card does not exist" };

        if (!this.hand.includes(cardId)) {
            return { allowed: false, reason: "Card not in hand" };
        }

        if (this.actionPoints < card.cost) {
            return { allowed: false, reason: "Not enough AP" };
        }

        if (this.cardsPlayedThisTurn >= 2) {
            return { allowed: false, reason: "Max 2 cards per turn" };
        }

        if (cardId === 'rapid_reboot' && this.rapidRebootUsesThisCombat >= 2) {
            return { allowed: false, reason: "Rapid Reboot limit reached (2/combat)" };
        }

        return { allowed: true };
    }

    async playCard(cardId, targetEntity, manager, options = {}) {
        const validation = this.canPlayCard(cardId);
        if (!validation.allowed) {
            console.warn(`Cannot play card ${cardId}: ${validation.reason}`);
            return false;
        }

        const card = CardDatabase[cardId];

        // Apply costs
        this.actionPoints -= card.cost;
        this.casterShip.reactorHeat += card.heatGenerated;
        if (manager) manager.addLog(`${this.casterShip.displayName} played ${card.name}.`);

        // Track card play
        this.cardsPlayedThisTurn++;
        if (cardId === 'rapid_reboot') {
            this.rapidRebootUsesThisCombat++;
        }

        // Move card to discard
        const index = this.hand.indexOf(cardId);
        this.hand.splice(index, 1);
        this.discard.push(cardId);

        // Execute effect
        // Support both card definition formats (play vs execute)
        const targetId = typeof targetEntity === 'string' ? targetEntity : targetEntity?.id;
        if (typeof card.play === 'function') {
            await card.play(manager, this.casterShip.id, targetId, options);
        } else if (typeof card.execute === 'function') {
            await card.execute(this.casterShip, targetEntity, manager, options);
        }

        if (manager) manager.emitStateUpdate();

        return true;
    }

    startTurn() {
        // Calculate AP rollover (max 1)
        this.rolledOverAP = Math.min(1, Math.floor(this.actionPoints / 2));
        this.actionPoints = this.maxActionPoints + this.rolledOverAP;

        this.cardsPlayedThisTurn = 0;
        this.drawCards(2);
    }

    resetForNewCombat(newDeckIds = null) {
        if (newDeckIds) {
            this.deck = [...newDeckIds];
        } else {
            this.deck = [...this.deck, ...this.hand, ...this.discard];
        }

        this.hand = [];
        this.discard = [];
        this.rapidRebootUsesThisCombat = 0;
        this.actionPoints = this.maxActionPoints;
        this.rolledOverAP = 0;
        this.cardsPlayedThisTurn = 0;

        this.shuffleDeck();
        this.drawCards(5);
    }

    serialize() {
        return {
            hand: [...this.hand],
            deckSize: this.deck.length,
            discardSize: this.discard.length,
            actionPoints: this.actionPoints,
            maxActionPoints: this.maxActionPoints,
            cardsPlayedThisTurn: this.cardsPlayedThisTurn,
            rapidRebootUsesThisCombat: this.rapidRebootUsesThisCombat,
            rolledOverAP: this.rolledOverAP
        };
    }
}
