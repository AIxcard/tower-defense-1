// Pixel Tower Defense — Enemies Configuration
// Rigorous balancing, diverse behaviors, resistances, flying flags, and boss mechanics

const ENEMY_CONFIG = {
    // Normal swarm enemies
    "grunt": {
        id: "grunt",
        name: "Shadow Grunt",
        isFlying: false,
        isBoss: false,
        baseHp: 65,
        speed: 0.65,
        cashReward: 15,
        color: "#8b5cf6",
        size: 16,
        description: "Standard frontline minion."
    },
    "scout_dasher": {
        id: "scout_dasher",
        name: "Scout Dasher",
        isFlying: false,
        isBoss: false,
        baseHp: 40,
        speed: 0.95,
        cashReward: 20,
        color: "#eab308",
        size: 14,
        description: "Fast runner testing your early lane coverage."
    },

    // Armored: Resistant to Physical, weak to Magical
    "armored_golem": {
        id: "armored_golem",
        name: "Armored Golem",
        isFlying: false,
        isBoss: false,
        baseHp: 220,
        speed: 0.45,
        cashReward: 35,
        physicalResistance: 0.50, // 50% physical damage reduction
        magicalResistance: -0.20, // 20% extra magic damage
        color: "#64748b",
        size: 22,
        description: "Heavy plate armor. Takes 50% less Physical damage; weak to Magic."
    },

    // Flying: strictly requires Hill, Hybrid, or Soaring on Hill
    "flying_harpy": {
        id: "flying_harpy",
        name: "Flying Harpy",
        isFlying: true,            // CANNOT be attacked by Ground-only units!
        isBoss: false,
        baseHp: 80,
        speed: 0.75,
        cashReward: 30,
        color: "#06b6d4",
        size: 18,
        description: "Soars above the road. Immune to all Ground-only units."
    },
    "flying_wyvern": {
        id: "flying_wyvern",
        name: "Elder Wyvern",
        isFlying: true,
        isBoss: false,
        baseHp: 380,
        speed: 0.60,
        cashReward: 65,
        color: "#0284c7",
        size: 24,
        description: "Armored flying dragon. Requires high-tier Hill or Hybrid units."
    },

    // Magic Shield: Resistant to Magical, weak to Physical
    "magic_shieldbearer": {
        id: "magic_shieldbearer",
        name: "Arcane Shieldbearer",
        isFlying: false,
        isBoss: false,
        baseHp: 200,
        speed: 0.50,
        cashReward: 35,
        physicalResistance: -0.20, // 20% extra physical damage
        magicalResistance: 0.50,  // 50% magic damage reduction
        color: "#a855f7",
        size: 20,
        description: "Mystic energy shield. Halves Magical damage; weak to Physical."
    },

    // Support: Heals surrounding minions
    "shadow_healer": {
        id: "shadow_healer",
        name: "Shadow Healer",
        isFlying: false,
        isBoss: false,
        baseHp: 160,
        speed: 0.55,
        cashReward: 45,
        healCooldown: 2.5,
        healRadius: 90,
        healPercent: 0.15,
        color: "#22c55e",
        size: 18,
        description: "Heals all nearby enemies for 15% HP every 2.5s. Priority target!"
    },

    // Enrager: Speed surges under 40% HP
    "berserker_orc": {
        id: "berserker_orc",
        name: "Berserker Orc",
        isFlying: false,
        isBoss: false,
        baseHp: 290,
        speed: 0.55,
        enrageThreshold: 0.40,
        enrageSpeedMultiplier: 1.50,
        cashReward: 50,
        color: "#ef4444",
        size: 22,
        description: "Frenzy: Moves +50% faster when health falls below 40%."
    },

    // BOSSES
    "world_boss_demon": {
        id: "world_boss_demon",
        name: "Demon Lord Malakor",
        isFlying: false,
        isBoss: true,
        baseHp: 4500,
        speed: 0.35,
        cashReward: 500,
        color: "#dc2626",
        size: 32,
        bossAura: "Roar of Terror: Stuns nearby defenders for 1.5s periodically.",
        description: "Act 6 World Boss. Enormous HP and periodic tower-disrupting stun."
    },
    "abyssal_colossus": {
        id: "abyssal_colossus",
        name: "Abyssal Colossus",
        isFlying: false,
        isBoss: true,
        baseHp: 12500,
        speed: 0.30,
        cashReward: 1000,
        color: "#475569",
        size: 36,
        physicalResistance: 0.25,
        magicalResistance: 0.25,
        description: "Hard Mode / Infinite Leviathan. Resistant to all standard attacks."
    },
    "genesis_void_behemoth": {
        id: "genesis_void_behemoth",
        name: "Genesis Void Sovereign (Boss)",
        isFlying: true,            // Flying Boss!
        isBoss: true,
        baseHp: 28000,
        speed: 0.35,
        cashReward: 2500,
        color: "#7c3aed",
        size: 40,
        description: "Limited Event Raid Boss. Flying titan that rewards Genesis tokens."
    }
};

if (typeof window !== 'undefined') {
    window.ENEMY_CONFIG = ENEMY_CONFIG;
}
