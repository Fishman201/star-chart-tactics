# Star Chart: Tactics - Master Architecture & Design Document

## 1. Project Overview
**Star Chart: Tactics** is a browser-based, deterministic tactical deckbuilder. It blends grid-based tactical positioning with a card-driven action economy, set in a retro-futuristic CRT monitor aesthetic.

## 2. Technical Architecture & Rules
The core development philosophy relies on a **strict separation of concerns**:
*   **The Engine (`src/engine/`)**: Pure, vanilla ES6 JavaScript. Acts as the single source of truth for all game state, combat math, and AI logic (`GridCombatManager`, `CardSystem`, `ShipEntity`, `SubsystemTable`).
*   **The View (`src/components/`)**: "Dumb" React components that receive state snapshots from the engine and strictly render visuals. They never contain complex game logic.
*   **Math Safety**: All UI percentage calculations (HP, Shields) must include `NaN` fallbacks (e.g., `(entity.maxHp > 0 ? (entity.hp / entity.maxHp) * 100 : 0) || 0`) to prevent React rendering crashes.
*   **Error Boundaries**: The React tree is wrapped in a class-based `<ErrorBoundary />` to catch render exceptions and display a stylized terminal crash screen.

## 3. Core Mechanics
### 3.1. Action Economy
*   **Action Points (AP)**: The player gets 3 AP per turn. Unused AP rolls over (max 1).
*   **Reactor Heat**: Playing cards generates heat. High heat (without Venting/Rapid Reboot) can stall the engine. The core naturally dissipates 20% heat per turn.
*   **Card Limits**: Maximum 2 cards played per turn. Hand limit is 7. `Rapid Reboot` is strictly limited to 2 uses per combat.

### 3.2. Deterministic Combat Math
*   **Standard Hit**: `Attacker WPS + 10 >= Target AC`
*   **Critical Hit**: `Attacker WPS + 10 >= Target AC + 5`
*   **Damage Resolution**: Shields absorb damage first. Excess damage hits the Hull. Hits bypassing shields or Critical Hits trigger Subsystem Damage.

### 3.3. Subsystem Damage (1d20 Table)
Critical hits roll a 1d20 to damage specific enemy systems, permanently crippling their stats:
*   **1-5 (Weapons)**: Operational -> Damaged (-2 WPS) -> Destroyed (-5 WPS)
*   **6-10 (Engines)**: Operational -> Damaged (-1 Speed) -> Offline (-3 Speed & Stalled)
*   **11-14 (Hull)**: Operational -> Damaged (-2 AC) -> Breached (-4 AC & DoT)
*   **15-18 (Life Support)**: Operational -> Damaged (2 DoT) -> Destroyed (99 DoT)
*   **19-20 (Bridge)**: Shock effect, reduces WPS and AC.

## 4. Factions & AI Rules
Each faction has unique visuals (SVG wireframes), CSS animations, and passive behaviors:
*   **UEF (Humanity)**: Neon Green. Kinetic Railguns and Sparc Lances.
*   **NUL (The Matriarchy)**: Cyan. Crescents. Uses Emerald Lances that bypass standard defenses.
*   **NURK (The Scrappers)**: Magenta. Jittering scrap logic. Uses Mag-Harpoons to drag players closer. *Passive: Junk-Shielding (15% chance to deflect hits).*
*   **ELIF (The Peacekeepers)**: Yellow. Geometric. *Passive: Phase-Shift (immune to damage while phased).*
*   **COL'DUNNACK (The Bio-Swarm)**: Green-Yellow. Pulsating organic blobs. *Passive: Bio-Regen (restores 2 HP per turn).*
*   **THE DAWN (The Ethereals)**: Pale Purple. Tall pillars. Targets crew sanity with Sonic Darts.

### 4.1. AI Loop
*   The AI operates on a **Priority + Cooldown** system rather than an AP economy.
*   Enemies resolve their turns sequentially with a visual delay. They evaluate distance, utilize faction-specific skills (e.g., Mag-Harpoon tethers), move to close gaps, and fire faction-specific weapons.

## 5. Aesthetics & VFX
*   **Retro CRT Theme**: Neon colors, `Courier New` / `Press Start 2P` typography, scanlines, and heavy CSS text/box drop-shadows.
*   **VFX Queue**: The engine dispatches visual events (`laser`, `kinetic`, `missile`, `tether`, `explosion`) to an SVG `<VFXLayer />` that overlays the grid. Animations auto-cleanup after 600-1000ms.
*   **Targeting Mode**: Uses a dedicated CRT overlay (`TargetingOverlay.jsx`) to let players precisely select subsystems when using cards like `Target Lock`.

## 6. Current Status & Roadmap
**Completed Features:**
- [x] Grid rendering, movement, and distance calculations.
- [x] ES6 Engine decoupled from React.
- [x] Deck drawing, shuffling, AP economy, and heat mechanic.
- [x] Deterministic combat logic & Subsystem 1d20 Table.
- [x] React Error Boundaries and Math crash-proofing.
- [x] VFX Queue system (lasers, explosions, SVG faction ships, shield bubbles).
- [x] Precision Subsystem Targeting UI.

**Next Up:**
- [ ] **Game Over & Victory Screens**: Catching when `player_hero` reaches 0 HP or all enemies are destroyed.
- [ ] **Combat Log Viewer**: A UI component to render the engine's `logs` array.
- [ ] **Advanced AI Deck Usage**: Upgrading the AI from basic cooldowns to actually drawing and playing cards from their `ShipDatabase` decks.
- [ ] **Card Tooltips/Hover States**: Better visibility of card mechanics in the `CardHand`.