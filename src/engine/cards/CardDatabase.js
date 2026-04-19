export const CARD_SUITS = {
    NAVIGATOR: { id: 'NAVIGATOR', name: 'Navigator', color: '#0088ff' },
    SCIENCE:   { id: 'SCIENCE',   name: 'Science',   color: '#00ff88' },
    WEAPONS:   { id: 'WEAPONS',   name: 'Weapons',   color: '#ff4444' },
    CAPTAIN:   { id: 'CAPTAIN',   name: 'Captain',   color: '#ffd700' }
};

// ─── Helper ────────────────────────────────────────────────────────────────────
const resolveAccuracy = (caster, target, base) => {
    let acc = base;
    // Apply ACCURACY_DOWN debuff on caster
    caster.statusEffects
        .filter(e => e.type === 'ACCURACY_DOWN')
        .forEach(e => { acc -= e.value; });
    // Apply DAMAGE_UP buff (raises accuracy by a smaller margin for simplicity)
    // Subtract target evasion + active EVASION_UP buffs
    let targetEvasion = target.evasion;
    target.statusEffects
        .filter(e => e.type === 'EVASION_UP')
        .forEach(e => { targetEvasion += e.value; });
    return Math.max(5, acc - targetEvasion); // Never below 5%
};

const resolveDamage = (caster, base) => {
    let dmg = base;
    caster.statusEffects
        .filter(e => e.type === 'DAMAGE_UP')
        .forEach(e => { dmg = Math.floor(dmg * (1 + e.value / 100)); });
    return dmg;
};

// ─── Card Database ─────────────────────────────────────────────────────────────
export const CardDatabase = [

    // ── WEAPONS ──────────────────────────────────────────────────────────────
    {
        id: 'standard_shot',
        name: 'Standard Shot',
        suit: CARD_SUITS.WEAPONS,
        apCost: 1,
        heatGenerated: 5,
        range: 6,
        damage: 20,
        accuracy: 80,
        description: '80% hit. 20 dmg. Range 6.',
        targetType: 'ENEMY',
        execute: (engine, caster, target) => {
            const hitChance = resolveAccuracy(caster, target, 80);
            const roll = Math.random() * 100;
            const isCrit = Math.random() * 100 <= 10;
            if (roll <= hitChance) {
                const dmg = resolveDamage(caster, isCrit ? Math.floor(20 * 1.5) : 20);
                target.takeDamage(dmg);
                engine.log(isCrit
                    ? `CRITICAL! Standard Shot hits ${target.name} for ${dmg} dmg.`
                    : `Standard Shot hits ${target.name} for ${dmg} dmg.`
                );
            } else {
                engine.log(`Standard Shot missed. (${roll.toFixed(0)} vs ${hitChance}% needed)`);
            }
        }
    },
    {
        id: 'railgun_burst',
        name: 'Railgun Burst',
        suit: CARD_SUITS.WEAPONS,
        apCost: 2,
        heatGenerated: 20,
        range: 10,
        damage: 35,
        accuracy: 65,
        description: '65% hit. 35 dmg. Range 10. 20% chance to pierce shields.',
        targetType: 'ENEMY',
        execute: (engine, caster, target) => {
            const hitChance = resolveAccuracy(caster, target, 65);
            const roll = Math.random() * 100;
            const isCrit = Math.random() * 100 <= 10;
            const pierceShields = Math.random() * 100 <= 20; // UEF Sparc-Core
            if (roll <= hitChance) {
                const dmg = resolveDamage(caster, isCrit ? Math.floor(35 * 1.5) : 35);
                target.takeDamage(dmg, pierceShields);
                engine.log(pierceShields
                    ? `Sparc-Core RAILGUN pierces shields! ${target.name} takes ${dmg} hull dmg.`
                    : isCrit
                    ? `CRITICAL RAILGUN hits ${target.name} for ${dmg} dmg!`
                    : `Railgun hits ${target.name} for ${dmg} dmg.`
                );
            } else {
                engine.log(`Railgun missed. (${roll.toFixed(0)} vs ${hitChance}% needed)`);
            }
        }
    },
    {
        id: 'scatter_volley',
        name: 'Scatter Volley',
        suit: CARD_SUITS.WEAPONS,
        apCost: 2,
        heatGenerated: 15,
        range: 3,
        damage: 12,
        accuracy: 90,
        description: '90% hit. 12 dmg × all enemies in range 3.',
        targetType: 'ENEMY',
        execute: (engine, caster, _target) => {
            const enemies = engine.entities.filter(e => e.faction !== 'UEF');
            let hits = 0;
            enemies.forEach(enemy => {
                const dist = Math.max(Math.abs(caster.x - enemy.x), Math.abs(caster.y - enemy.y));
                if (dist <= 3) {
                    const hitChance = resolveAccuracy(caster, enemy, 90);
                    if (Math.random() * 100 <= hitChance) {
                        const dmg = resolveDamage(caster, 12);
                        enemy.takeDamage(dmg);
                        hits++;
                        engine.log(`Scatter Volley hits ${enemy.name} for ${dmg} dmg.`);
                    }
                }
            });
            if (hits === 0) engine.log('Scatter Volley — all shots missed.');
        }
    },
    {
        id: 'missile_salvo',
        name: 'Missile Salvo',
        suit: CARD_SUITS.WEAPONS,
        apCost: 2,
        heatGenerated: 10,
        range: 8,
        damage: 25,
        accuracy: 100, // Guaranteed hit — missile tracking
        description: 'Guaranteed hit. 25 dmg. Range 8. Generates 10 heat.',
        targetType: 'ENEMY',
        execute: (engine, caster, target) => {
            const dmg = resolveDamage(caster, 25);
            target.takeDamage(dmg);
            engine.log(`Missile Salvo locks on — ${target.name} takes ${dmg} dmg.`);
        }
    },
    {
        id: 'target_lock',
        name: 'Target Lock: Engines',
        suit: CARD_SUITS.WEAPONS,
        apCost: 2,
        heatGenerated: 10,
        range: 7,
        damage: 15,
        accuracy: 60,
        description: '60% hit. 15 dmg. Disables enemy movement next turn. Range 7.',
        targetType: 'ENEMY',
        execute: (engine, caster, target) => {
            const hitChance = resolveAccuracy(caster, target, 60);
            const roll = Math.random() * 100;
            if (roll <= hitChance) {
                target.takeDamage(15);
                target.statusEffects.push({ type: 'IMMOBILIZED', duration: 1 });
                engine.log(`Target Lock hits! ${target.name}'s engines are offline.`);
            } else {
                engine.log(`Target Lock missed. (${roll.toFixed(0)} vs ${hitChance}%)`);
            }
        }
    },

    // ── NAVIGATOR ────────────────────────────────────────────────────────────
    {
        id: 'snap_dodge',
        name: 'Snap Dodge',
        suit: CARD_SUITS.NAVIGATOR,
        apCost: 1,
        heatGenerated: 0,
        description: '+40% Evasion vs next hit. -15% Accuracy on next shot.',
        targetType: 'SELF',
        execute: (engine, caster) => {
            caster.statusEffects.push({ type: 'EVASION_UP',     value: 40, duration: 'NEXT_ATTACK_TAKEN' });
            caster.statusEffects.push({ type: 'ACCURACY_DOWN',  value: 15, duration: 'NEXT_ATTACK_MADE'  });
            engine.log(`${caster.name} snap dodges!`);
        }
    },
    {
        id: 'focused_evasion',
        name: 'Focused Evasion',
        suit: CARD_SUITS.NAVIGATOR,
        apCost: 1,
        heatGenerated: 0,
        description: '+60% Evasion vs next hit. Cannot attack next turn.',
        targetType: 'SELF',
        execute: (engine, caster) => {
            caster.statusEffects.push({ type: 'EVASION_UP',     value: 60, duration: 'NEXT_ATTACK_TAKEN' });
            caster.statusEffects.push({ type: 'CANNOT_ATTACK',  duration: 1 });
            engine.log(`${caster.name} enters a full evasive pattern.`);
        }
    },

    // ── SCIENCE ──────────────────────────────────────────────────────────────
    {
        id: 'rapid_reboot',
        name: 'Rapid Reboot',
        suit: CARD_SUITS.SCIENCE,
        apCost: 2,
        heatGenerated: 0,
        limitPerBattle: 2,
        description: 'Restore Shields to 50%. (Limit 2/battle)',
        targetType: 'SELF',
        execute: (engine, caster) => {
            const target = Math.floor(caster.maxShields * 0.5);
            if (caster.shields < target) caster.shields = target;
            engine.log(`${caster.name} reboots shields to 50%.`);
        }
    },
    {
        id: 'shield_overcharge',
        name: 'Shield Overcharge',
        suit: CARD_SUITS.SCIENCE,
        apCost: 2,
        heatGenerated: 20,
        description: 'Restore ALL shields. +20 Heat.',
        targetType: 'SELF',
        execute: (engine, caster) => {
            caster.shields = caster.maxShields;
            engine.log(`${caster.name} fully overcharges shields.`);
        }
    },
    {
        id: 'system_override',
        name: 'System Override',
        suit: CARD_SUITS.SCIENCE,
        apCost: 0,
        heatGenerated: 30,
        description: '+20% Damage for 1 turn. +30 Reactor Heat.',
        targetType: 'SELF',
        execute: (engine, caster) => {
            caster.statusEffects.push({ type: 'DAMAGE_UP', value: 20, duration: 1 });
            engine.log(`${caster.name} overrides output limiters!`);
        }
    },
    {
        id: 'vent_heat',
        name: 'Emergency Vent',
        suit: CARD_SUITS.SCIENCE,
        apCost: 1,
        heatGenerated: -40, // Negative = cools
        description: 'Reduce Reactor Heat by 40.',
        targetType: 'SELF',
        execute: (engine, caster) => {
            caster.reactorHeat = Math.max(0, caster.reactorHeat - 40);
            engine.log(`${caster.name} vents reactor heat.`);
        }
    },

    // ── CAPTAIN ──────────────────────────────────────────────────────────────
    {
        id: 'make_it_so',
        name: 'Make It So',
        suit: CARD_SUITS.CAPTAIN,
        apCost: 0,
        heatGenerated: 0,
        description: 'Draw 2 cards. Gain +1 AP.',
        targetType: 'SELF',
        execute: (engine, caster) => {
            engine.cardSystem.drawCards(2);
            engine.cardSystem.currentAP = Math.min(engine.cardSystem.currentAP + 1, engine.cardSystem.maxAP + 1);
            engine.log('"Make it so." +1 AP, +2 Cards.');
        }
    },
    {
        id: 'all_hands',
        name: 'All Hands',
        suit: CARD_SUITS.CAPTAIN,
        apCost: 1,
        heatGenerated: 0,
        description: 'Draw 3 cards.',
        targetType: 'SELF',
        execute: (engine, caster) => {
            engine.cardSystem.drawCards(3);
            engine.log('"All hands on deck!" +3 Cards.');
        }
    },
];
