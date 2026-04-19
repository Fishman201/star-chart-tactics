export default class GravityMechanics {
    static executeGravityEvent(epicenter, radius, force, isPush, manager) {
        const allShips = Array.from(manager.ships.values());
        const affectedShips = allShips.filter(ship => {
            if (ship.x === epicenter.x && ship.y === epicenter.y) return false;
            const distance = Math.max(Math.abs(ship.x - epicenter.x), Math.abs(ship.y - epicenter.y));
            return distance <= radius;
        });

        affectedShips.forEach(ship => {
            this._displaceShip(ship, epicenter, force, isPush, manager);
        });
        manager.emitStateUpdate();
    }

    static _displaceShip(ship, epicenter, force, isPush, manager) {
        let dx = Math.sign(ship.x - epicenter.x);
        let dy = Math.sign(ship.y - epicenter.y);
        if (!isPush) { dx *= -1; dy *= -1; }

        let currentX = ship.x; let currentY = ship.y;
        let forceRemaining = force;
        
        while (forceRemaining > 0) {
            currentX += dx; currentY += dy;
            forceRemaining--;
        }

        ship.x = currentX; ship.y = currentY;
    }
}
