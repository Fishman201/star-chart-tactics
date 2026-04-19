import { useState, useEffect, useRef } from 'react';
import GridCombatManager from '../engine/GridCombatManager.js';
import ShipEntity from '../engine/ShipEntity.js';
import { ShipDatabase } from '../engine/ShipDatabase.js';

export function useEngine() {
    const engineRef = useRef(null);
    const [state, setState] = useState(null);

    useEffect(() => {
        if (!engineRef.current) {
            engineRef.current = new GridCombatManager(setState);
            
            // Register player ship using Blueprint
            const playerConfig = ShipDatabase['uef_halberd_cruiser'];
            const player = new ShipEntity({
                ...playerConfig,
                id: 'player_hero',
                name: 'Prometheus',
                x: 2,
                y: 2,
                wps: 5,
            });
            engineRef.current.registerShip(player);

            // Register Faction Enemies
            const nurkConfig = ShipDatabase['nurk_grit_destroyer'];
            engineRef.current.registerShip(new ShipEntity({
                ...nurkConfig,
                name: 'Scrapper 1',
                x: 10,
                y: 10,
                wps: 2
            }));

            const elifConfig = ShipDatabase['elif_prism_cruiser'];
            engineRef.current.registerShip(new ShipEntity({
                ...elifConfig,
                name: 'Judgment',
                x: 12,
                y: 6,
                wps: 4
            }));

            const colConfig = ShipDatabase['col_hive_seed'];
            engineRef.current.registerShip(new ShipEntity({
                ...colConfig,
                name: 'Spore Carrier',
                x: 8,
                y: 14,
                wps: 1
            }));

            // Finalize initialization and draw cards
            engineRef.current.startPlayerTurn();
        }
    }, []);

    return { engine: engineRef.current, state };
}
