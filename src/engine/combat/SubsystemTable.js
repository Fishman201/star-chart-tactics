export default class SubsystemTable {
    /**
     * Rolls a 1d20 to determine subsystem damage and applies penalties.
     * Brackets: 1-5 Weapons, 6-10 Engines, 11-14 Hull, 15-18 Life Support, 19-20 Bridge.
     */
    static roll(targetShip, manager) {
        const roll = Math.floor(Math.random() * 20) + 1;
        let sysKey = '';

        if (roll <= 5) sysKey = 'weapons';
        else if (roll <= 10) sysKey = 'engines';
        else if (roll <= 14) sysKey = 'hull';
        else if (roll <= 18) sysKey = 'lifeSupport';
        else sysKey = 'bridge';

        this.damageSubsystem(targetShip, sysKey, manager);
    }

    /**
     * Directly damages a specific subsystem.
     */
    static damageSubsystem(targetShip, sysKey, manager) {
        const sys = targetShip.subsystems[sysKey];
        if (!sys) return; // Safety fallback

        if (sys.status === 'operational') {
            sys.status = 'damaged';
            if (manager) manager.addLog(`[CRITICAL] ${targetShip.displayName}'s ${sys.label} damaged!`);
            this.applyPenalty(targetShip, sysKey, 'damaged', manager);
        } else if (sys.status === 'damaged') {
            sys.status = sysKey === 'hull' ? 'breached' : sysKey === 'engines' ? 'offline' : 'destroyed';
            if (manager) manager.addLog(`[CATASTROPHIC] ${targetShip.displayName}'s ${sys.label} ${sys.status}!`);
            this.applyPenalty(targetShip, sysKey, sys.status, manager);
        } else {
            // System is already destroyed/offline; deal bonus direct damage instead
            if (manager) manager.addLog(`[IMPACT] Strike to the already ruined ${sys.label} of ${targetShip.displayName}!`);
            targetShip.hp -= 5;
        }
    }

    /**
     * Applies mechanical stat penalties or status effects based on the subsystem and severity.
     */
    static applyPenalty(targetShip, sysKey, severity, manager) {
        switch (sysKey) {
            case 'weapons':
                // Damaged: -2 WPS. Destroyed: -5 WPS.
                targetShip.wps = Math.max(0, targetShip.wps - (severity === 'damaged' ? 2 : 5));
                break;
            case 'engines':
                // Damaged: -1 Speed. Offline: -3 Speed & Stalled.
                targetShip.speed = Math.max(0, targetShip.speed - (severity === 'damaged' ? 1 : 3));
                if (severity === 'offline') targetShip.applyStatusEffect('stalled', 1);
                break;
            case 'hull':
                // Damaged: -2 AC. Breached: -4 AC & apply Hull Breach DoT.
                targetShip.ac = Math.max(5, targetShip.ac - (severity === 'damaged' ? 2 : 4));
                if (severity === 'breached') targetShip.applyStatusEffect('hull_breach', 3);
                break;
            case 'lifeSupport':
                // Applies damage over time
                targetShip.applyStatusEffect('life_support_breach', severity === 'damaged' ? 2 : 99);
                break;
            case 'bridge':
                // Bridge hits shock the crew, lowering both accuracy and evasion
                targetShip.wps = Math.max(0, targetShip.wps - (severity === 'damaged' ? 1 : 3));
                targetShip.ac = Math.max(5, targetShip.ac - (severity === 'damaged' ? 1 : 3));
                break;
        }
    }
}