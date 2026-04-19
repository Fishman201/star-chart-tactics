import Dice from './Dice.js';

export default class SubsystemTable {
    static roll(target, manager) {
        const roll = Dice.rollD20();
        let effect = "";
        let logMessage = "";

        if (roll <= 5) {
            effect = "WEAPONS";
            target.applyStatusEffect('weapons_damaged', 3);
            logMessage = "WEAPONS ARRAY CRITICALLY DAMAGED! Accuracy reduced.";
        } else if (roll <= 10) {
            effect = "ENGINES";
            target.applyStatusEffect('engines_damaged', 3);
            logMessage = "ENGINES CRIPPLED! Speed halved.";
        } else if (roll <= 15) {
            effect = "HULL";
            target.applyStatusEffect('hull_breach', 3);
            logMessage = "HULL BREACH! Damage taken increased.";
        } else if (roll <= 19) {
            effect = "LIFE_SUPPORT";
            target.applyStatusEffect('life_support_breach', 5);
            logMessage = "LIFE SUPPORT FAILING! Taking damage over time.";
        } else {
            effect = "BRIDGE";
            target.applyStatusEffect('bridge_stun', 1);
            logMessage = "BRIDGE STRUCK! Crew stunned.";
        }

        if (manager) {
            manager.addLog(`[CRITICAL] ${target.displayName}: ${logMessage}`);
        }

        return effect;
    }
}
