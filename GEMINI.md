// Example of the shape expected from getStateSnapshot().ships[targetId]
subsystems: {
  weapons: { label: 'WEAPONS', status: 'operational' }, // operational, damaged, destroyed
  engines: { label: 'ENGINES', status: 'damaged' },     // operational, damaged, offline
  hull: { label: 'HULL', status: 'operational' },       // operational, breached
  lifeSupport: { label: 'LIFE SUPPORT', status: 'operational' } // operational, damaged
}
# Star Chart: Tactics — Gemini Code Context

This file provides full context for AI-assisted development of the **Star Chart: Tactics** project.
Place this file at the root of the repository so Gemini Code can include it automatically in every session.

---

## 1. Project Overview

**Star Chart: Tactics** is a browser-based, tactical card-driven space combat game built on top of the *Star Chart RPG* tabletop universe (by the same author). It is being actively developed as a Vite + React single-page app.

The game pivots away from a 4X Civilisation-style board game and instead implements a **Tactical Deckbuilder** — the spiritual crossover between *XCOM* (grid-based tactics) and *Slay the Spire* (card-driven action economy). The 1d20 dice roll system from the tabletop RPG is replaced with a **deterministic / percentage-based combat engine**; all randomness is communicated visually, not through hidden dice.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (via Vite) |import React from 'react';
import './SubsystemTargeting.css';

export default function SubsystemTargetingUI({ 
  targetShip, 
  isActive, 
  onSelectSubsystem, 
  onCancel 
}) {
  if (!isActive || !targetShip) return null;

  // Helper to map engine status to our neon CSS classes
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'operational': return 'status-green';
      case 'damaged': return 'status-amber';
      case 'destroyed':
      case 'offline':
      case 'breached':
        return 'status-red';
      default: return 'status-green';
    }
  };

  return (
    <div className="targeting-overlay">
      {/* Scanline wrapper for the CRT effect */}
      <div className="crt-scanlines"></div>
      
      <div className="targeting-panel crt-border">
        <header className="targeting-header">
          <h2>&gt; TACTICAL TARGET LOCK INITIALIZED</h2>
          <p className="blink">AWAITING SUBSYSTEM SELECTION FOR: [ {targetShip.name.toUpperCase()} ]</p>
        </header>

        {/* Abstract ship wireframe layout */}
        <div className="ship-wireframe-grid">
          {Object.entries(targetShip.subsystems).map(([sysKey, sysData]) => {
            const statusClass = getStatusColorClass(sysData.status);
            const isSelectable = sysData.status !== 'destroyed' && sysData.status !== 'offline';

            return (
              <button
                key={sysKey}
                className={`subsystem-btn ${statusClass}`}
                disabled={!isSelectable}
                onClick={() => onSelectSubsystem(targetShip.id, sysKey)}
              >
                <div className="bracket-left">[</div>
                <div className="subsystem-info">
                  <span className="sys-label">{sysData.label}</span>
                  <span className="sys-status">SYS_{sysData.status.toUpperCase()}</span>
                </div>
                <div className="bracket-right">]</div>
              </button>
            );
          })}
        </div>

        <footer className="targeting-footer">
          <button className="btn-cancel" onClick={onCancel}>
            [ ESC ] ABORT LOCK
          </button>
        </footer>
      </div>
    </div>
  );
}
.targeting-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 5, 0, 0.85); /* Dark terminal background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  font-family: 'Courier New', Courier, monospace;
}

.crt-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 4px, 6px 100%;
  pointer-events: none;
}

.targeting-panel {
  background-color: #000;
  border: 2px solid #39ff14; /* UEF Neon Green */
  box-shadow: 0 0 15px #39ff14, inset 0 0 15px #39ff14;
  padding: 30px;
  width: 600px;
  max-width: 90%;
  position: relative;
}

.targeting-header {
  color: #39ff14;
  text-shadow: 0 0 5px #39ff14;
  margin-bottom: 30px;
  border-bottom: 1px dashed #39ff14;
  padding-bottom: 10px;
}

.targeting-header h2 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.blink {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  50% { opacity: 0; }
}

/* Ship Diagram Grid */
.ship-wireframe-grid {
  display: grid;
  grid-template-areas: 
    ". weapons ."
    "lifeSupport hull engines";
  grid-gap: 20px;
  justify-items: center;
  margin-bottom: 30px;
}

.subsystem-btn {
  background: transparent;
  border: 1px solid currentColor;
  color: currentColor;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
  width: 180px;
}

.subsystem-btn:hover:not(:disabled) {
  background: currentColor;
  color: #000;
  box-shadow: 0 0 20px currentColor;
}

.subsystem-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-style: dashed;
}

.bracket-left, .bracket-right {
  font-size: 1.5rem;
  font-weight: bold;
}

.subsystem-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sys-label { font-weight: bold; font-size: 1.1rem; }
.sys-status { font-size: 0.8rem; opacity: 0.8; }

/* Status Colors */
.status-green { color: #39ff14; text-shadow: 0 0 5px #39ff14; }
.status-amber { color: #ffb000; text-shadow: 0 0 5px #ffb000; }
.status-red   { color: #ff003c; text-shadow: 0 0 5px #ff003c; }

/* Assigning Grid Areas dynamically based on child keys (requires setting nth-child or adding specific classes in JSX map, but for simplicity here's a generic flow) */
.subsystem-btn:nth-child(1) { grid-area: weapons; }
.subsystem-btn:nth-child(2) { grid-area: engines; }
.subsystem-btn:nth-child(3) { grid-area: hull; }
.subsystem-btn:nth-child(4) { grid-area: lifeSupport; }

.targeting-footer {
  text-align: right;
  margin-top: 20px;
}

.btn-cancel {
  background: transparent;
  color: #ff00ff; /* Nurk Magenta for cancel/abort actions */
  border: 1px solid #ff00ff;
  padding: 10px 20px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
}

.btn-cancel:hover {
  background: #ff00ff;
  color: #000;
  box-shadow: 0 0 10px #ff00ff;
}
// Inside App.jsx
<SubsystemTargetingUI 
  isActive={uiState.isTargetingSubsystem}
  targetShip={uiState.selectedEnemyShip}
  onSelectSubsystem={(targetId, subsystemId) => {
     // 1. Tell the pure JS engine to apply the card effect
     engineRef.current.playCard('target_lock', targetId, { subsystem: subsystemId });
     // 2. Clear UI state
     setUiState({ ...uiState, isTargetingSubsystem: false });
     // 3. Re-sync React state with engine snapshot
     syncStateWithEngine();
  }}
  onCancel={() => setUiState({ ...uiState, isTargetingSubsystem: false })}
/>

| Language | JavaScript (ES6+ classes) |
| Styling | Vanilla CSS with a retro CRT neon aesthetic |
| State | Pure JS game engine classes; React is the **View only** |
| Build | Vite |
| Dev server | `npm run dev` → `http://localhost:5173` |

**Key design constraint:** All complex game logic lives in ES6 classes under `src/engine/`. React components call engine methods and re-render on the resulting snapshot. There are **no complex reducers** in React.

---

## 3. Repository Structure

```
starchart-civ/
├── src/
│   ├── main.jsx                  # Vite entry point
│   ├── App.jsx                   # Root React component; wires engine → UI
│   ├── App.css / index.css       # Global styles (retro/neon CRT theme)
│   ├── engine/                   # Pure JS game engine (no React deps)
│   │   ├── ShipEntity.js         # Base class for all units (HP, shields, heat)
│   │   ├── CardSystem.js         # Deck, hand, AP, and card resolution
│   │   ├── GridCombatManager.js  # Orchestrator: grid, turns, AI, state emission
│   │   └── cards/
│   │       └── CardDatabase.js   # All playable card definitions
│   ├── components/
│   │   ├── GridMap.jsx           # Hex/square grid renderer + click handling
│   │   ├── CardHand.jsx          # Player hand of cards + play interaction
│   │   ├── HUD.jsx               # Sidebar: AP, heat gauge, turn controls
│   │   └── Unit.jsx              # Single unit icon rendered on the grid
│   └── hooks/                    # Custom React hooks (if any)
├── public/
├── index.html
├── package.json
└── vite.config.js
```

---

## 4. Core Game Rules (from the Master Manual)

### 4.1 The Core Engine (Tabletop Origin)
- Roll 1d20 + modifier vs. DC or AC. **Natural 20** = automatic success + bonus. **Natural 1** = failure + complication.
- **Stats (20-point pool):** Dexterity, Strength, Tech, Will, Communications, WPH (Handheld), WPS (Ship).
- **Scale Conversion (10:1:10 rule):** Personnel → Vehicle → Ship tier conversions.

### 4.2 Action Point & Card System (Tactics Implementation)
| Rule | Value |
|---|---|
| AP per turn | 3 |
| AP rollover (max) | 1 (half of unused, rounded down) |
| Cards played per turn | Max 2 |
| Starting hand | 5 cards |
| Cards drawn per turn | 2 |
| Max hand size | 7 |
| Card cost | 1 AP (standard); special cards may vary |

Playing a card, moving, or standard shooting all cost AP.

### 4.3 Reactor Heat
- Each Bridge Crew ability that is used generates **Reactor Heat**.
- First use per combat is free. Each successive use adds **+5 to the Tech DC**.
- If the Science Officer fails the heat check the ship **stalls for 1 round** and heat resets.
- `Emergency Coolant` consumable resets heat to zero instantly.

### 4.4 Bridge Crew Abilities (Playable Cards)
| Role | Card Name | Effect |
|---|---|---|
| Captain | Make It So | Grant ally an extra Action or Advantage |
| Navigator | Snap Dodge | Reaction: 1d20+Dex vs Attack. On success = Miss. Grants Stabilizing Token (−1 to next ship attack). |
| Weapons | Target Lock | Declare a subsystem. If attack hits and exceeds AC by 5+, disable that subsystem. |
| Science | Rapid Reboot | Bring shields to 50% HP. **Limit: max 2 per combat.** |

### 4.5 Shields & Subsystem Damage
- Deflection shields add a **flat AC bonus**.
- Shields drop when: attack beats total AC by 5+, OR a Railgun rolls 15–20.
- Hull hit on Crit (17–20) or when shields are offline → roll 1d20 on the **Subsystem Table**:
  - **Weapons:** −2 to hit → Destroyed
  - **Engines:** Half speed → Offline
  - **Hull:** Breach → +2 damage taken per hit
  - **Life Support:** 1 Person Damage/turn until fixed
- **Surge (Natural 20):** Accidental power reroute grants Advantage or +10 Movement.

### 4.6 Point Defence (PD)
PD uses WPS to intercept ordnance. Tracks **hits required to destroy**, not raw damage:
| Ordnance Size | Hits to Destroy |
|---|---|
| Size 1–2 (Micro/Tactical) | 1 |
| Size 3 (Heavy Torpedo) | 2 |
| Size 4 (Capital Killer) | 4 |
The **Flak Trait** makes a successful PD roll count as 1d4 hits.

### 4.7 Warp Travel (Sparc Drive)
Navigator rolls 1d20 + Tech or Dex on warp exit:
| Roll | Result |
|---|---|
| 1 | Catastrophic — all systems down; need 3 successful Tech rolls |
| 2–5 | Rough exit — 1d6 Hull damage, shields offline |
| 6–11 | Standard exit — crew disoriented for 1 round |
| 12–18 | Perfect exit — combat-ready immediately |
| 19–20 | Energy Boost — gain a Sparc Charge (+4 bonus to any single ship action within 1 hour) |

---

## 5. Factions & Ships

### 5.1 United Earth Federation (UEF) 🇺🇳
*Raw kinetic force. Sparc-Core Railguns pierce shields on rolls of 15–20.*

| Ship | AC | HP | Notes |
|---|---|---|---|
| Sparc-Dart Interceptor | 21 | 10 | Light Railguns |
| Aegis Escort Frigate | 18 | 55 | 4× Railguns, Size 2 Missiles |
| Halberd Strike Cruiser | 16 | 75 | Heavy Particle Lance (3d12, 1-turn lock) |
| Olympus Command Titan | 14 | 150 | — |

### 5.2 Nul (The Matriarchy) 💠
*Emerald Lances ignore shields entirely. Resonance stacks vibrate hulls apart.*

| Ship | AC | HP | Notes |
|---|---|---|---|
| Lament-Class Frigate | 20 | 40 | Emerald Lances (2d10 direct to hull) |
| Leviathan Spire-Ship | 16 | 100 | Massive Resonance Array resets enemy FTL |

### 5.3 Nurk (The Scrappers) ⚙️
*Junk-tech. Mag-Harpoons drag targets and halve movement speed. Always try to close range.*

| Ship | AC | HP | Notes |
|---|---|---|---|
| Grit-Class Destroyer | 15 | 60 | Scrap-Cannons and Harpoon Tethers |
| World-Cracker Space Hulk | 12 | 160 | Spawns Slag-Bombers and boarding torpedoes |

**Passive — Junk-Shielding:** When hit, roll 1d6; on a 6, debris provides Half Cover (+2 AC).
**Death Explosion:** Explodes on death for 3d10 damage to adjacent cells.

### 5.4 Elif (The Peacekeepers) 🌌
*Ancient tech. Phase-Ion Blasters (17–20) force subsystem rolls ignoring hull damage.*

| Ship | AC | HP | Notes |
|---|---|---|---|
| Prism-Class Cruiser | 22 | 50 | Solar-Eye Beams (3d12), Phase-Torpedoes (first PD hit always misses) |
| The Grand Tribunal | 18 | 70 | Pacification Field imposes disadvantage on enemy attacks |

### 5.5 Col'dunnack (The Bio-Swarm) 🦠
*Organic hulls regenerate. Acid payloads melt AC.*

| Ship | AC | HP | Notes |
|---|---|---|---|
| Hive-Seed Carrier | 14 | 100 | Spawns Bio-Drones |
| The Devourer | 10 | 180 | Acid-Spore Pods: permanent −1 AC per hit. Bio-Plasma blocks Rapid Reboot for 2 rounds |

### 5.6 The Dawn (The Ethereals) 🎐
*Targets crew sanity over ship armor.*

| Ship | AC | HP | Notes |
|---|---|---|---|
| Whisper-Craft (Fighter) | 21 | 8 | Sonic Darts |
| Echo-Runner (Destroyer) | 19 | 35 | Harmonic Torpedoes: crew Will save or −1 to next rolls |
| The Great Chorus (Dreadnought) | 15 | 110 | Failed Will checks cause crew to lose their action |

---

## 6. Archangel Mechs (UEF Ground Units)

Archangel suits are **Vehicle Scale**. They ignore personnel-scale cover and reduce incoming infantry damage by their DR (Damage Reduction). Each chassis has a 3-slot customisation system (Primary / Secondary / Auxiliary).

| Chassis | AC | DR | HP | Speed | Role |
|---|---|---|---|---|---|
| Seraphim | 16 | 10 | 80 | 20ft | Heavy Siege / Tank |
| Thrones | 18 | 6 | 55 | 40ft | Tactical Support |
| Cherubim | 21 | 3 | 35 | 50ft | Infiltration / Stealth |
| Dominions | 19 | 4 | 40 | 40ft | Electronic Warfare |
| Powers | 17 | 8 | 65 | 30ft | Kinetic Breacher |
| Virtues | 15 | 12 | 70 | 25ft | Field Logistics / Medic |

---

## 7. Alien Heavy Mechs

| Unit | AC | HP | Special |
|---|---|---|---|
| Nul Discordant Frame | 20 | 45 | Harmonic Resonance: 3 hits on same target → next ignores all DR |
| Nurk Scrapper-King | 15 | 90 | DR 10; Junk-Shielding (1d6 → 6 = Half Cover); Explodes for 3d10 on death |
| Elif Solar-Eye | 22 | 30 | Phase-Shift: once per combat, incorporeal for 1 round (immune to kinetic, passes through walls) |
| Col'dunnack Gore-Spore | 14 | 100 | DR 5; Rapid Regrowth (1d8 HP regen/turn); Acidic Maw (permanent −1 DR per hit) |

---

## 8. Lore & World-Building Notes

- **Setting:** Year 2435. Humanity (United Earth Federation) is a new spacefaring power, fuelled by **Sparc Energy** — exotic particles tapped from the Big Bang via micro-wormholes, discovered in 2425 by scientist *Jamie Aldridge*.
- **Catapult Drive (FTL):** A catapult charge is fired from the ship's rear; the explosion propels the ship to FTL speeds. Exiting warp is volatile and requires a Navigator check.
- **The Unknown:** The oldest race in the galaxy, existing in 4D space. They created all other sentient species. They live in massive spires on each homeworld and never leave them.
- **Key NPCs:** Space Commander Gripen Arden (UEF HQ commander); Captain Zack Maynard; Navigator Edward Ray; Weapons Officer Taliesin Qu; Science Officer Operand 1.
- **Player Ship:** UEV Halo — a Gaia-class scout/destroyer with a SERL Lance, Railguns, Helion missiles, Bulax shields, and advanced sensors.
- **The Erasmus Scenario:** A UEF training scenario (final exam on the command path) designed to be an 'unwinnable' test of command decision-making.

---

---

## 9. Engine Architecture (Current Implementation)

### `GridCombatManager` (`src/engine/GridCombatManager.js`)
The **game orchestrator**.
- **Deterministic Combat**: Uses a fixed threshold: `WPS + 10 >= Target AC`. Critical Hit occurs at `Threshold >= AC + 5`.
- **Combat Logic**: `executeAttack(attacker, target, weapon)` handles damage calculation and subsystem trigger checks.
- **AI Loop**: Enemies use a timed sequence of actions (Skill/Card -> Move -> Attack). AI skills are simulated via a turn-based cooldown system.
- **Logging**: Maintains a 50-entry log of all tactical events.

### `ShipEntity` (`src/engine/ShipEntity.js`)
- **Status Effects**: Tracks active buffs/debuffs (e.g., `hull_breach`, `engines_damaged`) with turn-based durations.
- **Damage Handling**: `takeDamage(amount, manager, isCrit)` asynchronously handles shield depletion, hull strikes, and subsystem rolls.
- **Turn Hooks**: `onTurnStart` handles DoTs (Life Support) and effect expiration.

### `SubsystemTable` (`src/engine/combat/SubsystemTable.js`)
Triggered on Critical Hits or Hull Strikes. Rolls 1d20:
- **1-5 (Weapons)**: Accuracy reduction.
- **6-10 (Engines)**: Speed halved.
- **11-15 (Hull)**: Breach (+2 damage taken).
- **16-19 (Life Support)**: 1 HP damage/turn.
- **20 (Bridge)**: Stun (Turn ends immediately).

---

## 10. Current Project Status

| Feature | Status |
|---|---|
| **Engine Core** | ✅ Functional (ES6 Classes) |
| **Tactical Combat** | ✅ Functional (Deterministic Hitting, Subsystem Table) |
| **AI Logic** | ✅ Functional (Sequence: Card -> Move -> Attack) |
| **UI Sync** | ✅ Functional (engineRef + getStateSnapshot) |
| **Visuals** | ✅ Functional (Neon CRT theme, ship icons, range highlights) |

---

## 11. Visual / UX Guidelines
... (rest of the file) ...

- **Aesthetic:** Retro CRT monitor / terminal. Neon colour palette.
  - UEF units → Neon Green (`#39ff14`)
  - Nurk / enemy units → Neon Magenta (`#ff00ff`)
  - Elif → Electric Blue
  - Col'dunnack → Toxic Amber/Orange
- **Grid:** Square grid, `image-rendering: pixelated` for crisp retro look.
- **Scanlines:** CSS overlay for CRT scanline effect.
- **Fonts:** Monospace (e.g. `Courier New` or `Share Tech Mono`) for all HUD text.
- **Micro-animations:** Unit attacks should flash/pulse; card plays should animate from hand to battlefield.

---

## 11. Planned Features (Future Iterations)

1. **Dynamic Ship Building:** Production interface for the Spawning Titan — generate new ships using Sparc Energy currency.
2. **Archangel / Ground Missions:** Add planetary grid tiles; deploy Seraphim mechs on ground maps.
3. **More Factions:** Implement Nul, The Dawn, Elif, and Col'dunnack fleets with full asymmetric AI behavior trees.
4. **Social / Diplomacy Layer:** Rep standing system (−10 to +10 per faction); Comms rolls; Renown track (0–30).
5. **Progression System:** Rank 5 Legendary Traits per role (e.g. Grand Admiral, Warp-Ghost, Dreadnought Hunter).
6. **Subsystem Targeting UI:** Visual ship diagram; click a subsystem to target it with Target Lock card.
7. **Warp Event Mini-game:** Navigator dice roll visualised as a mini-game on jump.

---

## 12. Known Constraints & Design Rules

- **Rapid Reboot Limit:** Capped at 2 uses per combat. Hard-enforce this in `CardSystem.js`.
- **Snap Dodge Token:** A Navigator's extreme evasion imposes −1 penalty on the ship's weapons next turn. Track this as a status effect in `ShipEntity`.
- **Mag-Lock Rule:** Archangel Specialists on the ship's hull must pass a Strength Save (DC 15) if the ship uses a stunt, Snap Dodge, or takes a critical hit — or they are ejected into space.
- **Steady Vector:** Ships must fly straight (no stunts, no Snap Dodges) for 1 round before safely launching an Archangel or Fighter.
- **Nurk AI Priority:** Nurk units always attempt to close to melee/harpoon range. Never kite.
- **Elif Phase-Shift:** Once-per-combat ability. Flag it on `ShipEntity` and block re-use.

---

*Last updated: 2026-04-19 | Conversation: Star Chart Tactics Development*
