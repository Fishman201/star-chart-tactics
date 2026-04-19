export const FACTIONS = {
  UEF: {
    id: 'UEF',
    name: 'United Earth Federation',
    color: '#00ff00', // Player color
    ships: {
      fighter: { 
        classId: 'fighter', name: 'Sparc-Dart', 
        ac: 21, maxHp: 10, speed: 5, range: 2,
        attack: { name: 'Light Railgun', dice: 1, sides: 6, bonus: 2, critPierce: true }
      },
      frigate: { 
        classId: 'frigate', name: 'Aegis Escort', 
        ac: 18, maxHp: 55, speed: 3, range: 4,
        attack: { name: 'Heavy Railguns', dice: 2, sides: 8, bonus: 4, critPierce: true }
      },
      titan: { 
        classId: 'titan', name: 'Olympus Titan', 
        ac: 14, maxHp: 150, speed: 1, range: 6,
        attack: { name: 'Mac-Cannon', dice: 4, sides: 12, bonus: 8, critPierce: true },
        isSpawner: true // Can produce smaller ships
      }
    }
  },
  NURK: {
    id: 'NURK',
    name: 'The Scrappers',
    color: '#ff00ff', // Enemy color
    ships: {
      fighter: {
        classId: 'fighter', name: 'Slag-Bomber',
        ac: 16, maxHp: 20, speed: 4, range: 1,
        attack: { name: 'Scrap-Cannon', dice: 2, sides: 4, bonus: 1 }
      },
      frigate: { 
        classId: 'frigate', name: 'Grit-Class Destroyer', 
        ac: 15, maxHp: 60, speed: 2, range: 3,
        attack: { name: 'Mag-Harpoon', dice: 1, sides: 12, bonus: 3, pull: true }
      },
      titan: { 
        classId: 'titan', name: 'World-Cracker', 
        ac: 12, maxHp: 160, speed: 1, range: 5,
        attack: { name: 'Harpoon-Grinders', dice: 3, sides: 10, bonus: 6 },
        isSpawner: true
      }
    }
  }
};

export const createUnit = (factionId, shipClass, x, y) => {
  const faction = FACTIONS[factionId];
  if (!faction) return null;
  const template = faction.ships[shipClass];
  if (!template) return null;

  return {
    id: `${factionId}_${shipClass}_${Math.random().toString(36).substr(2, 9)}`,
    factionId,
    classId: shipClass,
    name: template.name,
    ac: template.ac,
    maxHp: template.maxHp,
    hp: template.maxHp,
    speed: template.speed,
    range: template.range,
    attack: template.attack,
    isSpawner: template.isSpawner || false,
    x,
    y,
    hasMoved: false,
    hasAttacked: false
  };
};
