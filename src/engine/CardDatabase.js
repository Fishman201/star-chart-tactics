import SubsystemTable from './combat/SubsystemTable.js';

export const CardDatabase = {
    // ==========================================
    // WEAPON CARDS (Hooked up for VFX)
    // ==========================================
    'railgun_volley': {
        id: 'railgun_volley',
        name: 'Railgun Volley',
        suit: 'Weapons',
        cost: 1,
        heatGenerated: 0,
        range: 5,
        description: 'Standard kinetic barrage. 10 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Railgun', damage: 10 });
        }
    },
    'sparc_lance': {
        id: 'sparc_lance',
        name: 'Sparc Lance',
        suit: 'Weapons',
        cost: 2,
        heatGenerated: 5,
        range: 8,
        description: 'Piercing energy beam. 15 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Sparc Lance', damage: 15 });
        }
    },
    'heavy_torpedo': {
        id: 'heavy_torpedo',
        name: 'Heavy Torpedo',
        suit: 'Weapons',
        cost: 3,
        heatGenerated: 10,
        range: 12,
        description: 'High-yield ordnance. 25 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Heavy Torpedo', damage: 25 });
        }
    },
    'mag_harpoon': {
        id: 'mag_harpoon',
        name: 'Mag-Harpoon',
        suit: 'Weapons',
        cost: 1,
        heatGenerated: 5,
        range: 3,
        description: 'Magnetic tether that strikes for 5 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Mag-Harpoon', damage: 5 });
        }
    },
    'scrap_cannon_blast': {
        id: 'scrap_cannon_blast',
        name: 'Scrap-Cannon Blast',
        suit: 'Weapons',
        cost: 2,
        heatGenerated: 5,
        range: 4,
        description: 'Brutal close-range kinetic damage. 12 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Scrap-Cannon', damage: 12 });
        }
    },
    'emerald_lance_strike': {
        id: 'emerald_lance_strike',
        name: 'Emerald Lance Strike',
        suit: 'Weapons',
        cost: 2,
        heatGenerated: 10,
        range: 8,
        description: 'Direct hull damage. 11 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Emerald Lance', damage: 11 });
        }
    },
    'solar_eye_beam': {
        id: 'solar_eye_beam',
        name: 'Solar-Eye Beam',
        suit: 'Weapons',
        cost: 2,
        heatGenerated: 5,
        range: 10,
        description: 'Scorching light beam. 14 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Solar-Eye Beam', damage: 14 });
        }
    },
    'phase_torpedo': {
        id: 'phase_torpedo',
        name: 'Phase-Torpedo',
        suit: 'Weapons',
        cost: 3,
        heatGenerated: 10,
        range: 12,
        description: 'Bypasses defenses. 20 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Phase-Torpedo', damage: 20 });
        }
    },
    'acid_spore_pod': {
        id: 'acid_spore_pod',
        name: 'Acid-Spore Pod',
        suit: 'Weapons',
        cost: 2,
        heatGenerated: 5,
        range: 6,
        description: 'Corrosive pod. 8 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Acid-Spore Pod', damage: 8 });
        }
    },
    'bio_plasma_strike': {
        id: 'bio_plasma_strike',
        name: 'Bio-Plasma Strike',
        suit: 'Weapons',
        cost: 3,
        heatGenerated: 10,
        range: 8,
        description: 'Searing bio-plasma. 18 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Bio-Plasma', damage: 18 });
        }
    },
    'sonic_dart': {
        id: 'sonic_dart',
        name: 'Sonic Dart',
        suit: 'Weapons',
        cost: 1,
        heatGenerated: 2,
        range: 5,
        description: 'Piercing sound construct. 6 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Sonic Dart', damage: 6 });
        }
    },
    'harmonic_torpedo': {
        id: 'harmonic_torpedo',
        name: 'Harmonic Torpedo',
        suit: 'Weapons',
        cost: 3,
        heatGenerated: 8,
        range: 10,
        description: 'Resonating explosive. 22 DMG.',
        play: async (engine, sourceId, targetId) => {
            await engine.executeAttack(sourceId, targetId, { name: 'Harmonic Torpedo', damage: 22 });
        }
    },

    // ==========================================
    // UTILITY & DEFENSE CARDS (Stubs for the starter deck)
    // ==========================================
    'target_lock': {
        id: 'target_lock',
        name: 'Target Lock',
        suit: 'Science',
        cost: 1,
        heatGenerated: 5,
        range: 10,
        description: 'Locks onto enemy subsystems for precision targeting.',
        play: async (engine, sourceId, targetId, options = {}) => {
            const target = engine.ships.get(targetId);
            const source = engine.ships.get(sourceId);
            const sysKey = options.subsystem || 'weapons'; // Default fallback if UI doesn't provide it

            engine.addVFX('beam', source, target, '#00ffff'); // Cyan targeting beam
            engine.addLog(`[TARGET LOCK] Precision strike on ${target.displayName}'s ${sysKey.toUpperCase()}!`);

            SubsystemTable.damageSubsystem(target, sysKey, engine);
        }
    },
    'rapid_reboot': {
        id: 'rapid_reboot',
        name: 'Rapid Reboot',
        suit: 'Captain',
        cost: 0,
        heatGenerated: -10,
        description: 'Flushes 10 reactor heat instantly.',
        play: async (engine, sourceId, targetId) => {
            const source = engine.ships.get(sourceId);
            if (source) {
                source.reactorHeat = Math.max(0, source.reactorHeat);
                engine.addLog(`[SYSTEM] ${source.displayName} flushed 10 reactor heat via Rapid Reboot!`);
            }
        }
    }
};