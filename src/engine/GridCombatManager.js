export default class GridCombatManager {
  constructor(updateReactCallback) {
    this.updateReactCallback = updateReactCallback;
    this.gridSize = { width: 20, height: 20 };
    this.turnPhase = 'PLAYER_TURN';
    this.ships = new Map();
    this.turnCount = 1;
  }

  emitStateUpdate() {
    if (this.updateReactCallback) {
      this.updateReactCallback(this.getStateSnapshot());
    }
  }

  getStateSnapshot() {
    return {
      gridSize: this.gridSize,
      turnPhase: this.turnPhase,
      turnCount: this.turnCount,
      ships: Array.from(this.ships.values()).map(ship => ship.serialize()),
    };
  }

  startPlayerTurn() {
    this.turnPhase = 'PLAYER_TURN';
    this.turnCount++;
    this.emitStateUpdate();
  }

  endPlayerTurn() {
    this.turnPhase = 'ENEMY_TURN';
    this.emitStateUpdate();
    this.resolveEnemyTurn();
  }

  resolveEnemyTurn() {
    setTimeout(() => { this.startPlayerTurn(); }, 2000); 
  }

  registerShip(shipEntity) {
    this.ships.set(shipEntity.id, shipEntity);
    this.emitStateUpdate();
  }

  moveUnit(shipId, targetCell) {
    const ship = this.ships.get(shipId);
    if (!ship) return;
    ship.x = targetCell.x;
    ship.y = targetCell.y;
    this.emitStateUpdate();
  }
}
