// 1d20 rule system based on manual
export const rollDice = (sides) => Math.floor(Math.random() * sides) + 1;

export const executeCombat = (attacker, defender) => {
  const d20 = rollDice(20);
  const isCritHit = d20 >= 17; // Manual says 17-20 for some subsystem crits, let's simplify critical hit range or standard nat 20.
  const isCritMiss = d20 === 1;
  const totalHit = d20 + attacker.attack.bonus;

  const result = {
    roll: d20,
    total: totalHit,
    isHit: false,
    isCrit: isCritHit,
    damage: 0,
    log: ''
  };

  if (isCritMiss) {
    result.log = `Critical Miss! (Rolled a 1)`;
    return result;
  }

  // Hit if total beats AC, or if nat 20
  if (totalHit >= defender.ac || d20 === 20) {
    result.isHit = true;
    
    // Calculate damage: dice X sides
    let damage = 0;
    for (let i = 0; i < attacker.attack.dice; i++) {
        damage += rollDice(attacker.attack.sides);
    }
    
    if (d20 === 20) {
        // Nat 20 maxes out one die or adds bonus damage. Let's maximize all dice for simplicity.
        damage = attacker.attack.dice * attacker.attack.sides;
        result.log = `Critical Hit! Deals ${damage} damage.`;
    } else {
        result.log = `Hit! (Roll: ${d20} + ${attacker.attack.bonus} = ${totalHit} vs AC ${defender.ac}). Deals ${damage} damage.`;
    }
    
    result.damage = damage;
  } else {
    result.log = `Miss. (Roll: ${d20} + ${attacker.attack.bonus} = ${totalHit} vs AC ${defender.ac}).`;
  }
  
  return result;
};
