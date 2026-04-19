import { useState, useEffect, useRef } from 'react';
import GridCombatManager from '../engine/GridCombatManager.js';
import ShipEntity from '../engine/ShipEntity.js';

export function useEngine() {
    const engineRef = useRef(null);
    const [state, setState] = useState(null);

    useEffect(() => {
        if (!engineRef.current) {
            // Initialize manager with state update callback
            engineRef.current = new GridCombatManager(setState);
            
            // Register player ship (which initializes CardSystem)
            const player = new ShipEntity({
                id: 'player_hero',
                name: 'Prometheus',
                faction: 'UEF',
                shipType: 'Cruiser',
                hp: 100,
                shields: 50,
                x: 2,
                y: 2
            });
            engineRef.current.registerShip(player);

            // Register some enemies
            engineRef.current.registerShip(new ShipEntity({
                name: 'Scrapper 1',
                faction: 'Nurk',
                shipType: 'Destroyer',
                hp: 60,
                x: 10,
                y: 10
            }));
            engineRef.current.registerShip(new ShipEntity({
                name: 'Scrapper 2',
                faction: 'Nurk',
                shipType: 'Destroyer',
                hp: 60,
                x: 12,
                y: 8
            }));

            // Initial state snapshot
            engineRef.current.emitStateUpdate();
        }
    }, []);

    return { engine: engineRef.current, state };
}
