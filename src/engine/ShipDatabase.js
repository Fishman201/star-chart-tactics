/**
 * Star Chart: Tactics - Ship Database
 * Contains all blueprints for ships and alien mechs based on the Master Manual.
 */

export const FACTIONS = {
  UEF: 'UEF',
  NUL: 'NUL',
  NURK: 'NURK',
  ELIF: 'ELIF',
  COLDUNNACK: 'COLDUNNACK',
  DAWN: 'DAWN'
};

const defaultSubsystems = () => ({
  weapons: { label: 'WEAPONS', status: 'operational' },
  engines: { label: 'ENGINES', status: 'operational' },
  hull: { label: 'HULL', status: 'operational' },
  lifeSupport: { label: 'LIFE SUPPORT', status: 'operational' }
});

export const ShipDatabase = {
  // ==========================================
  // UEF (UNITED EARTH FEDERATION)
  // Tactics: Kinetic force, Railguns, Sparc Energy
  // ==========================================
  'uef_sparc_dart': {
    id: 'uef_sparc_dart',
    name: 'Sparc-Dart Interceptor',
    faction: FACTIONS.UEF,
    ac: 21,
    maxHp: 10,
    notes: 'Light Railguns',
    subsystems: defaultSubsystems(),
    deck: [
      'snap_dodge', 
      'evasive_stunt', 
      'target_lock'
    ]
  },
  'uef_aegis_frigate': {
    id: 'uef_aegis_frigate',
    name: 'Aegis Escort Frigate',
    faction: FACTIONS.UEF,
    ac: 18,
    maxHp: 55,
    notes: '4x Railguns, Size 2 Missiles',
    subsystems: defaultSubsystems(),
    deck: [
      'target_lock', 
      'flak_screen', 
      'make_it_so', 
      'damage_control'
    ]
  },
  'uef_halberd_cruiser': {
    id: 'uef_halberd_cruiser',
    name: 'Halberd Strike Cruiser',
    faction: FACTIONS.UEF,
    ac: 16,
    maxHp: 75,
    notes: 'Heavy Particle Lance (3d12, 1-turn lock)',
    subsystems: defaultSubsystems(),
    deck: [
      'target_lock', 
      'sparc_core_surge', 
      'emergency_coolant', 
      'rapid_reboot'
    ]
  },
  'uef_olympus_titan': {
    id: 'uef_olympus_titan',
    name: 'Olympus Command Titan',
    faction: FACTIONS.UEF,
    ac: 14,
    maxHp: 150,
    notes: 'Command and Control',
    subsystems: defaultSubsystems(),
    deck: [
      'make_it_so', 
      'rapid_reboot', 
      'damage_control', 
      'flak_screen', 
      'grav_repulsor'
    ]
  },

  // ==========================================
  // NUL (THE MATRIARCHY)
  // Tactics: Shield bypassing, resonance weapons
  // ==========================================
  'nul_lament_frigate': {
    id: 'nul_lament_frigate',
    name: 'Lament-Class Frigate',
    faction: FACTIONS.NUL,
    ac: 20,
    maxHp: 40,
    notes: 'Emerald Lances (2d10 direct to hull)',
    subsystems: defaultSubsystems(),
    deck: ['emerald_lance_strike', 'evasive_stunt'] // Thematic alien cards
  },
  'nul_leviathan_spire': {
    id: 'nul_leviathan_spire',
    name: 'Leviathan Spire-Ship',
    faction: FACTIONS.NUL,
    ac: 16,
    maxHp: 100,
    notes: 'Massive Resonance Array resets enemy FTL',
    subsystems: defaultSubsystems(),
    deck: ['resonance_array', 'damage_control']
  },
  'nul_discordant_frame': {
    id: 'nul_discordant_frame',
    name: 'Discordant Frame (Heavy Mech)',
    faction: FACTIONS.NUL,
    ac: 20,
    maxHp: 45,
    notes: 'Harmonic Resonance: 3 hits ignores DR',
    subsystems: defaultSubsystems(),
    deck: ['harmonic_resonance_strike', 'snap_dodge']
  },

  // ==========================================
  // NURK (THE SCRAPPERS)
  // Tactics: Close distance, harpoons, explosion on death
  // ==========================================
  'nurk_grit_destroyer': {
    id: 'nurk_grit_destroyer',
    name: 'Grit-Class Destroyer',
    faction: FACTIONS.NURK,
    ac: 15,
    maxHp: 60,
    notes: 'Scrap-Cannons and Harpoon Tethers. Junk-Shielding passive.',
    subsystems: defaultSubsystems(),
    deck: ['mag_harpoon', 'scrap_cannon_blast'] 
  },
  'nurk_world_cracker': {
    id: 'nurk_world_cracker',
    name: 'World-Cracker Space Hulk',
    faction: FACTIONS.NURK,
    ac: 12,
    maxHp: 160,
    notes: 'Spawns Slag-Bombers. Explodes on death.',
    subsystems: defaultSubsystems(),
    deck: ['spawn_bombers', 'boarding_torpedoes']
  },
  'nurk_scrapper_king': {
    id: 'nurk_scrapper_king',
    name: 'Scrapper-King (Heavy Mech)',
    faction: FACTIONS.NURK,
    ac: 15,
    maxHp: 90,
    notes: 'DR 10; Junk-Shielding; Explodes for 3d10 on death',
    subsystems: defaultSubsystems(),
    deck: ['mag_harpoon', 'scrap_cannon_blast']
  },

  // ==========================================
  // ELIF (THE PEACEKEEPERS)
  // Tactics: Phase tech, forced subsystem damage
  // ==========================================
  'elif_prism_cruiser': {
    id: 'elif_prism_cruiser',
    name: 'Prism-Class Cruiser',
    faction: FACTIONS.ELIF,
    ac: 22,
    maxHp: 50,
    notes: 'Solar-Eye Beams, Phase-Torpedoes (ignores first PD)',
    subsystems: defaultSubsystems(),
    deck: ['solar_eye_beam', 'phase_torpedo', 'snap_dodge']
  },
  'elif_grand_tribunal': {
    id: 'elif_grand_tribunal',
    name: 'The Grand Tribunal',
    faction: FACTIONS.ELIF,
    ac: 18,
    maxHp: 70,
    notes: 'Pacification Field (disadvantage on enemy attacks)',
    subsystems: defaultSubsystems(),
    deck: ['pacification_field', 'target_lock']
  },
  'elif_solar_eye_mech': {
    id: 'elif_solar_eye_mech',
    name: 'Solar-Eye (Heavy Mech)',
    faction: FACTIONS.ELIF,
    ac: 22,
    maxHp: 30,
    notes: 'Phase-Shift: incorporeal for 1 round once per combat',
    subsystems: defaultSubsystems(),
    deck: ['phase_shift', 'solar_eye_beam']
  },

  // ==========================================
  // COL'DUNNACK (THE BIO-SWARM)
  // Tactics: Regeneration, acid armor-melting
  // ==========================================
  'col_hive_seed': {
    id: 'col_hive_seed',
    name: 'Hive-Seed Carrier',
    faction: FACTIONS.COLDUNNACK,
    ac: 14,
    maxHp: 100,
    notes: 'Spawns Bio-Drones',
    subsystems: defaultSubsystems(),
    deck: ['spawn_bio_drones', 'damage_control']
  },
  'col_devourer': {
    id: 'col_devourer',
    name: 'The Devourer',
    faction: FACTIONS.COLDUNNACK,
    ac: 10,
    maxHp: 180,
    notes: 'Acid-Spore Pods (-1 AC), Bio-Plasma blocks Reboot',
    subsystems: defaultSubsystems(),
    deck: ['acid_spore_pod', 'bio_plasma_strike']
  },

  // ==========================================
  // THE DAWN (THE ETHEREALS)
  // Tactics: Target crew sanity/will
  // ==========================================
  'dawn_whisper_craft': {
    id: 'dawn_whisper_craft',
    name: 'Whisper-Craft',
    faction: FACTIONS.DAWN,
    ac: 21,
    maxHp: 8,
    notes: 'Sonic Darts',
    subsystems: defaultSubsystems(),
    deck: ['sonic_dart', 'evasive_stunt']
  },
  'dawn_great_chorus': {
    id: 'dawn_great_chorus',
    name: 'The Great Chorus',
    faction: FACTIONS.DAWN,
    ac: 15,
    maxHp: 110,
    notes: 'Failed Will checks cause crew to lose action',
    subsystems: defaultSubsystems(),
    deck: ['harmonic_torpedo', 'will_break']
  }
};
