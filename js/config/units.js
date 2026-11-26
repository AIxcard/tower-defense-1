// Pixel Tower Defense — Rebalanced Units Configuration
// Capped Rares <= 50 DPS, Epics <= 120 DPS, Evolved Mythics 900-1400 Raw DPS.
// Balanced SPAs (4.2s to 10.5s).
// Passives with both 'name', 'desc', and 'description' keys. No specific skill names.

const UNIT_CONFIG = {
    // ====================================================
    // RARE UNITS (Raw DPS <= 50)
    // ====================================================
    "iron_slinger": {
        id: "iron_slinger",
        name: "Cowboy",
        rarity: "Rare",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Nature",
        role: "Damage",
        baseCost: 250,
        baseDamage: 110,
        baseSpa: 5.2,
        baseRange: 160,
        attackType: "Single",
        attackShape: "Single Target",
        maxPlacements: 5,
        canEvolve: false,
        description: "Quick-drawing gunslinger firing rapid precision shots at single targets.",
        passives: [],
        upgrades: [
            { cost: 100, damage: 140, spa: 5.2, range: 170, abilityName: "Upgrade 1" },
            { cost: 200, damage: 180, spa: 5.4, range: 180, abilityName: "Upgrade 2" },
            { cost: 350, damage: 220, spa: 5.5, range: 190, abilityName: "Upgrade 3" },
            { cost: 500, damage: 260, spa: 5.6, range: 200, abilityName: "Upgrade 4" }
        ]
    },

    "ember_apprentice": {
        id: "ember_apprentice",
        name: "Ember Apprentice",
        rarity: "Rare",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Fire",
        role: "Damage",
        baseCost: 300,
        baseDamage: 130,
        baseSpa: 6.0,
        baseRange: 150,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 45,
        maxPlacements: 5,
        canEvolve: false,
        description: "Novice pyromancer casting small fiery explosions.",
        passives: [],
        upgrades: [
            { cost: 120, damage: 165, spa: 6.0, range: 160, splashRadius: 48, abilityName: "Upgrade 1" },
            { cost: 220, damage: 210, spa: 6.2, range: 170, splashRadius: 50, abilityName: "Upgrade 2" },
            { cost: 380, damage: 260, spa: 6.4, range: 180, splashRadius: 54, abilityName: "Upgrade 3" },
            { cost: 550, damage: 310, spa: 6.5, range: 190, splashRadius: 58, abilityName: "Upgrade 4" }
        ]
    },

    "breeze_scout": {
        id: "breeze_scout",
        name: "Archer",
        rarity: "Rare",
        placement: "Hill",
        hasSoaring: true,
        damageType: "Physical",
        element: "Nature",
        role: "Damage",
        baseCost: 280,
        baseDamage: 100,
        baseSpa: 4.5,
        baseRange: 190,
        attackType: "Single",
        attackShape: "Single Target",
        maxPlacements: 5,
        canEvolve: false,
        description: "Sharp-eyed ranger firing swift precision arrows from elevated hills.",
        passives: [],
        upgrades: [
            { cost: 110, damage: 130, spa: 4.5, range: 200, abilityName: "Upgrade 1" },
            { cost: 210, damage: 165, spa: 4.6, range: 210, abilityName: "Upgrade 2" },
            { cost: 360, damage: 205, spa: 4.7, range: 220, abilityName: "Upgrade 3" },
            { cost: 520, damage: 245, spa: 4.8, range: 230, abilityName: "Upgrade 4" }
        ]
    },

    // ====================================================
    // EPIC UNITS (Raw DPS <= 120)
    // ====================================================
    "pyro_archer": {
        id: "pyro_archer",
        name: "Pyro Archer",
        rarity: "Epic",
        placement: "Hill",
        hasSoaring: true,
        damageType: "Physical",
        element: "Fire",
        role: "Damage",
        baseCost: 450,
        baseDamage: 240,
        baseSpa: 5.5,
        baseRange: 210,
        attackType: "Single",
        attackShape: "Single Target",
        maxPlacements: 4,
        canEvolve: false,
        description: "Sharp shooter firing flaming arrows from hill cliffs.",
        passives: [],
        upgrades: [
            { cost: 250, damage: 320, spa: 5.5, range: 220, abilityName: "Upgrade 1" },
            { cost: 450, damage: 420, spa: 5.6, range: 230, abilityName: "Upgrade 2" },
            { cost: 700, damage: 540, spa: 5.8, range: 240, abilityName: "Upgrade 3" },
            { cost: 1000, damage: 680, spa: 6.0, range: 250, abilityName: "Upgrade 4" }
        ]
    },

    "frost_weaver": {
        id: "frost_weaver",
        name: "Frost Weaver",
        rarity: "Epic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Aqua",
        role: "CrowdControl",
        baseCost: 500,
        baseDamage: 180,
        baseSpa: 5.0,
        baseRange: 175,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 60,
        maxPlacements: 4,
        canEvolve: false,
        freezeChance: 0.50,
        freezeDuration: 2.0,
        slowRate: 0.35,
        description: "Ice enchantress slowing enemies by 35% with a 50% chance to freeze for 2.0s.",
        passives: [
            {
                name: "Permafrost",
                desc: "50% chance on hit to freeze enemies in place for 2.0 seconds and slows by 35%.",
                description: "50% chance on hit to freeze enemies in place for 2.0 seconds and slows by 35%."
            }
        ],
        upgrades: [
            { cost: 280, damage: 240, spa: 5.0, range: 185, splashRadius: 65, abilityName: "Upgrade 1" },
            { cost: 500, damage: 320, spa: 5.2, range: 195, splashRadius: 70, abilityName: "Upgrade 2" },
            { cost: 800, damage: 420, spa: 5.4, range: 205, splashRadius: 75, abilityName: "Upgrade 3" },
            { cost: 1200, damage: 530, spa: 5.5, range: 215, splashRadius: 80, abilityName: "Upgrade 4" }
        ]
    },

    "swordsman": {
        id: "swordsman",
        name: "Swordsman",
        rarity: "Epic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Nature",
        role: "Damage",
        baseCost: 400,
        baseDamage: 220,
        baseSpa: 4.8,
        baseRange: 130,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 50,
        maxPlacements: 4,
        canEvolve: false,
        description: "Balanced ground blademaster cleaving nearby enemies.",
        passives: [],
        upgrades: [
            { cost: 220, damage: 290, spa: 4.8, range: 135, splashRadius: 52, abilityName: "Upgrade 1" },
            { cost: 420, damage: 380, spa: 5.0, range: 140, splashRadius: 55, abilityName: "Upgrade 2" },
            { cost: 680, damage: 490, spa: 5.2, range: 145, splashRadius: 58, abilityName: "Upgrade 3" },
            { cost: 950, damage: 610, spa: 5.4, range: 150, splashRadius: 60, abilityName: "Upgrade 4" }
        ]
    },

    "silver_banker": {
        id: "silver_banker",
        name: "Silver Banker",
        rarity: "Epic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "No Element",
        role: "Farm",
        isFarm: true,
        baseCost: 500,
        baseDamage: 0,
        baseSpa: 99.0,
        baseRange: 80,
        attackType: "None",
        attackShape: "None",
        incomePerWave: 200,
        maxPlacements: 3,
        canEvolve: false,
        description: "Passive economy manager yielding cash at the end of each wave.",
        passives: [
            {
                name: "Market Dividend",
                desc: "Generates wave cash at the end of every wave up to 2,500 ¥.",
                description: "Generates wave cash at the end of every wave up to 2,500 ¥."
            }
        ],
        upgrades: [
            { cost: 400, damage: 0, spa: 99.0, range: 80, incomePerWave: 350, abilityName: "Upgrade 1" },
            { cost: 750, damage: 0, spa: 99.0, range: 80, incomePerWave: 550, abilityName: "Upgrade 2" },
            { cost: 1200, damage: 0, spa: 99.0, range: 80, incomePerWave: 850, abilityName: "Upgrade 3" },
            { cost: 1800, damage: 0, spa: 99.0, range: 80, incomePerWave: 1300, abilityName: "Upgrade 4" },
            { cost: 2500, damage: 0, spa: 99.0, range: 80, incomePerWave: 1850, abilityName: "Upgrade 5" },
            { cost: 3500, damage: 0, spa: 99.0, range: 80, incomePerWave: 2500, abilityName: "Upgrade 6" }
        ]
    },

    // ====================================================
    // LEGENDARY UNITS (Raw DPS 250 - 550)
    // ====================================================
    "hunter": {
        id: "hunter",
        name: "Hunter",
        rarity: "Legendary",
        placement: "Hill",
        hasSoaring: true,
        damageType: "Physical",
        element: "Nature",
        role: "AntiAir",
        baseCost: 750,
        baseDamage: 650,
        baseSpa: 5.8,
        baseRange: 280,
        attackType: "Single",
        attackShape: "Single Target",
        maxPlacements: 3,
        canEvolve: false,
        description: "Specialized hill sniper with high range targeting flying enemies.",
        passives: [
            {
                name: "Eagle Eye",
                desc: "Deals +35% bonus damage specifically against flying enemies.",
                description: "Deals +35% bonus damage specifically against flying enemies."
            }
        ],
        upgrades: [
            { cost: 500, damage: 950, spa: 5.8, range: 300, abilityName: "Upgrade 1" },
            { cost: 950, damage: 1350, spa: 6.0, range: 320, abilityName: "Upgrade 2" },
            { cost: 1600, damage: 1900, spa: 6.2, range: 340, abilityName: "Upgrade 3" },
            { cost: 2400, damage: 2600, spa: 6.5, range: 360, abilityName: "Upgrade 4" },
            { cost: 3500, damage: 3450, spa: 6.8, range: 380, abilityName: "Upgrade 5" }
        ]
    },

    "robot": {
        id: "robot",
        name: "Robot",
        rarity: "Legendary",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Storm",
        role: "Damage",
        baseCost: 800,
        baseDamage: 220,
        baseSpa: 6.2,
        baseRange: 160,
        attackType: "SustainedBeam",
        attackShape: "Line AoE",
        laserDuration: 4.0,
        laserTicks: 8,
        maxPlacements: 3,
        canEvolve: false,
        description: "Ground android firing sustained laser beams that melt rows of enemies.",
        passives: [
            {
                name: "Overcharged Beam",
                desc: "Fires a 4-second sustained laser hitting enemies multiple times.",
                description: "Fires a 4-second sustained laser hitting enemies multiple times."
            }
        ],
        upgrades: [
            { cost: 550, damage: 320, spa: 6.2, range: 170, abilityName: "Upgrade 1" },
            { cost: 1000, damage: 450, spa: 6.4, range: 180, abilityName: "Upgrade 2" },
            { cost: 1700, damage: 620, spa: 6.6, range: 190, abilityName: "Upgrade 3" },
            { cost: 2600, damage: 820, spa: 6.8, range: 200, abilityName: "Upgrade 4" },
            { cost: 3800, damage: 1050, spa: 7.0, range: 210, abilityName: "Upgrade 5" }
        ]
    },

    "magic_girl": {
        id: "magic_girl",
        name: "Magic Girl",
        rarity: "Legendary",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "No Element",
        role: "Buffer",
        isBuffer: true,
        bufferType: "Magical",
        buffAmount: 0.10,
        baseCost: 750,
        baseDamage: 220,
        baseSpa: 5.5,
        baseRange: 190,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 65,
        maxPlacements: 4,
        canEvolve: false,
        description: "Magical support ally increasing magic damage of nearby towers.",
        passives: [
            {
                name: "Arcane Inspiration",
                desc: "Boosts all magical allies in range by +10% damage per upgrade tier up to 100%.",
                description: "Boosts all magical allies in range by +10% damage per upgrade tier up to 100%."
            }
        ],
        upgrades: [
            { cost: 400, damage: 300, spa: 5.5, range: 200, buffAmount: 0.20, abilityName: "Upgrade 1" },
            { cost: 700, damage: 400, spa: 5.5, range: 210, buffAmount: 0.30, abilityName: "Upgrade 2" },
            { cost: 1100, damage: 520, spa: 5.6, range: 220, buffAmount: 0.40, abilityName: "Upgrade 3" },
            { cost: 1600, damage: 650, spa: 5.6, range: 230, buffAmount: 0.50, abilityName: "Upgrade 4" },
            { cost: 2200, damage: 800, spa: 5.8, range: 240, buffAmount: 0.60, abilityName: "Upgrade 5" },
            { cost: 2900, damage: 980, spa: 5.8, range: 250, buffAmount: 0.70, abilityName: "Upgrade 6" },
            { cost: 3700, damage: 1180, spa: 6.0, range: 260, buffAmount: 0.80, abilityName: "Upgrade 7" },
            { cost: 4600, damage: 1400, spa: 6.0, range: 270, buffAmount: 0.90, abilityName: "Upgrade 8" },
            { cost: 5800, damage: 1650, spa: 6.2, range: 280, buffAmount: 1.00, abilityName: "Upgrade 9" }
        ]
    },

    "commander": {
        id: "commander",
        name: "Commander",
        rarity: "Legendary",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "No Element",
        role: "Buffer",
        isBuffer: true,
        bufferType: "Physical",
        buffAmount: 0.10,
        baseCost: 750,
        baseDamage: 250,
        baseSpa: 5.8,
        baseRange: 190,
        attackType: "Single",
        attackShape: "Single Target",
        maxPlacements: 4,
        canEvolve: false,
        description: "Military leader rallying physical towers and deploying war cavalry horses from base.",
        passives: [
            {
                name: "Tactical Rally",
                desc: "Increases physical ally damage in range by +10% per upgrade tier up to 100%.",
                description: "Increases physical ally damage in range by +10% per upgrade tier up to 100%."
            },
            {
                name: "Cavalry Dispatch",
                desc: "Base continuously spawns allied war cavalry that charge down the path into enemies.",
                description: "Base continuously spawns allied war cavalry that charge down the path into enemies."
            }
        ],
        upgrades: [
            { cost: 400, damage: 340, spa: 5.8, range: 200, buffAmount: 0.20, abilityName: "Upgrade 1" },
            { cost: 700, damage: 450, spa: 5.8, range: 210, buffAmount: 0.30, abilityName: "Upgrade 2" },
            { cost: 1100, damage: 580, spa: 6.0, range: 220, buffAmount: 0.40, abilityName: "Upgrade 3" },
            { cost: 1600, damage: 720, spa: 6.0, range: 230, buffAmount: 0.50, abilityName: "Upgrade 4" },
            { cost: 2200, damage: 880, spa: 6.2, range: 240, buffAmount: 0.60, abilityName: "Upgrade 5" },
            { cost: 2900, damage: 1060, spa: 6.2, range: 250, buffAmount: 0.70, abilityName: "Upgrade 6" },
            { cost: 3700, damage: 1260, spa: 6.4, range: 260, buffAmount: 0.80, abilityName: "Upgrade 7" },
            { cost: 4600, damage: 1480, spa: 6.4, range: 270, buffAmount: 0.90, abilityName: "Upgrade 8" },
            { cost: 5800, damage: 1720, spa: 6.6, range: 280, buffAmount: 1.00, abilityName: "Upgrade 9" }
        ]
    },

    "gold_alchemist": {
        id: "gold_alchemist",
        name: "Gold Alchemist",
        rarity: "Legendary",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "No Element",
        role: "Farm",
        isFarm: true,
        baseCost: 900,
        baseDamage: 0,
        baseSpa: 99.0,
        baseRange: 80,
        attackType: "None",
        attackShape: "None",
        incomePerWave: 250,
        maxPlacements: 1,
        canEvolve: false,
        description: "Master alchemist generating huge wave income. Strictly limited to 1 placement.",
        passives: [
            {
                name: "Golden Transmutation",
                desc: "Produces massive wave payouts up to 10,000 ¥ per wave. Max 1 placement.",
                description: "Produces massive wave payouts up to 10,000 ¥ per wave. Max 1 placement."
            }
        ],
        upgrades: [
            { cost: 500, damage: 0, spa: 99.0, range: 80, incomePerWave: 500, abilityName: "Upgrade 1" },
            { cost: 900, damage: 0, spa: 99.0, range: 80, incomePerWave: 850, abilityName: "Upgrade 2" },
            { cost: 1500, damage: 0, spa: 99.0, range: 80, incomePerWave: 1400, abilityName: "Upgrade 3" },
            { cost: 2400, damage: 0, spa: 99.0, range: 80, incomePerWave: 2200, abilityName: "Upgrade 4" },
            { cost: 3600, damage: 0, spa: 99.0, range: 80, incomePerWave: 3500, abilityName: "Upgrade 5" },
            { cost: 5200, damage: 0, spa: 99.0, range: 80, incomePerWave: 5500, abilityName: "Upgrade 6" },
            { cost: 7200, damage: 0, spa: 99.0, range: 80, incomePerWave: 7500, abilityName: "Upgrade 7" },
            { cost: 10000, damage: 0, spa: 99.0, range: 80, incomePerWave: 10000, abilityName: "Upgrade 8" }
        ]
    },

    // ====================================================
    // BASE MYTHICS (Raw DPS 300 - 550)
    // ====================================================
    "shinobi": {
        id: "shinobi",
        name: "Shinobi",
        rarity: "Mythic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Fire",
        role: "Damage",
        baseCost: 1200,
        baseDamage: 350,
        baseSpa: 6.8,
        baseRange: 220,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 75,
        maxPlacements: 4,
        canEvolve: true,
        evolvesTo: "shinobi_god",
        evolutionCost: {
            gold: 10000,
            requiredItems: { "fire_scroll": 25, "water_scroll": 25, "nature_scroll": 25 }
        },
        description: "Stealth fire master igniting enemies with unholy Black Flames.",
        passives: [
            {
                name: "Black Flame Ignition",
                desc: "Attacks apply Black Flames dealing 100% unit damage as burn over 3 seconds.",
                description: "Attacks apply Black Flames dealing 100% unit damage as burn over 3 seconds."
            }
        ],
        upgrades: [
            { cost: 800, damage: 850, spa: 6.8, range: 235, splashRadius: 80, abilityName: "Upgrade 1" },
            { cost: 1600, damage: 1600, spa: 6.8, range: 250, splashRadius: 85, abilityName: "Upgrade 2" },
            { cost: 2800, damage: 2600, spa: 7.0, range: 265, splashRadius: 90, abilityName: "Upgrade 3" },
            { cost: 4500, damage: 3800, spa: 7.2, range: 280, splashRadius: 95, abilityName: "Upgrade 4" }
        ]
    },

    "shinobi_god": {
        id: "shinobi_god",
        name: "Shinobi (Awakened)",
        rarity: "Mythic",
        isEvolved: true,
        evolvesFrom: "shinobi",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Fire",
        role: "Damage",
        baseCost: 1200,
        baseDamage: 750,
        baseSpa: 6.8,
        baseRange: 260,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 100,
        maxPlacements: 4,
        canEvolve: false,
        description: "Awakened master of the Black Flame wielding Susanoo piercing arrows.",
        passives: [
            {
                name: "Infernal Amaterasu",
                desc: "Black Flames burn deals 100% unit damage over 3 seconds.",
                description: "Black Flames burn deals 100% unit damage over 3 seconds."
            },
            {
                name: "Susanoo Armor Piercing",
                desc: "Arrows pierce and completely bypass enemy magic and physical shields.",
                description: "Arrows pierce and completely bypass enemy magic and physical shields."
            }
        ],
        activeAbility: {
            id: "heavenly_meteor",
            name: "Heavenly Meteor",
            damageMultiplier: 3.5,
            delaySeconds: 5.0,
            cooldownSeconds: 120,
            aoeRadius: 160,
            description: "Target an area on the battlefield. After 5 seconds, a massive celestial meteor crashes down dealing 350% unit damage across a 160px AoE."
        },
        upgrades: [
            { cost: 800, damage: 1250, spa: 6.8, range: 270, splashRadius: 105, abilityName: "Upgrade 1" },
            { cost: 1400, damage: 1850, spa: 6.8, range: 280, splashRadius: 105, abilityName: "Upgrade 2" },
            { cost: 2200, damage: 2550, spa: 6.8, range: 290, splashRadius: 110, abilityName: "Upgrade 3" },
            { cost: 3200, damage: 3400, spa: 6.9, range: 300, splashRadius: 115, abilityName: "Upgrade 4" },
            { cost: 4500, damage: 4400, spa: 6.9, range: 310, splashRadius: 115, abilityName: "Upgrade 5" },
            { cost: 6000, damage: 5500, spa: 7.0, range: 320, splashRadius: 120, abilityName: "Upgrade 6" },
            { cost: 7800, damage: 6750, spa: 7.1, range: 330, splashRadius: 125, abilityName: "Upgrade 7" },
            { cost: 9800, damage: 8100, spa: 7.2, range: 345, splashRadius: 130, abilityName: "Upgrade 8" }
        ]
    },

    "thunder_god": {
        id: "thunder_god",
        name: "Thunder God",
        rarity: "Mythic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Storm",
        role: "Damage",
        baseCost: 1300,
        baseDamage: 380,
        baseSpa: 7.5,
        baseRange: 220,
        attackType: "Chain",
        attackShape: "Chain Lightning",
        chainTargets: 3,
        chainFalloff: 0.25,
        maxPlacements: 3,
        canEvolve: true,
        evolvesTo: "thunder_god_awakened",
        evolutionCost: {
            gold: 12000,
            requiredItems: { "yellow_star_fruit": 10, "rainbow_star_fruit": 2 }
        },
        description: "Deity commanding lightning bolts that chain across up to 3 enemies.",
        passives: [
            {
                name: "Shocking Discharge",
                desc: "Strikes have a 25% chance to apply a 0.5s shock stun.",
                description: "Strikes have a 25% chance to apply a 0.5s shock stun."
            }
        ],
        upgrades: [
            { cost: 900, damage: 900, spa: 7.5, range: 235, chainTargets: 3, abilityName: "Upgrade 1" },
            { cost: 1800, damage: 1700, spa: 7.5, range: 250, chainTargets: 3, abilityName: "Upgrade 2" },
            { cost: 3000, damage: 2700, spa: 7.8, range: 265, chainTargets: 3, abilityName: "Upgrade 3" },
            { cost: 4800, damage: 3900, spa: 8.0, range: 280, chainTargets: 3, abilityName: "Upgrade 4" }
        ]
    },

    "thunder_god_awakened": {
        id: "thunder_god_awakened",
        name: "Thunder God (Awakened)",
        rarity: "Mythic",
        isEvolved: true,
        evolvesFrom: "thunder_god",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Storm",
        role: "Damage",
        baseCost: 1300,
        baseDamage: 780,
        baseSpa: 7.5,
        baseRange: 260,
        attackType: "Chain",
        attackShape: "Chain Lightning",
        chainTargets: 4,
        chainFalloff: 0.25,
        maxPlacements: 3,
        canEvolve: false,
        description: "Divine storm master chaining lightning across 4 targets with a 25% falloff.",
        passives: [
            {
                name: "Divine Chain Lightning",
                desc: "Attacks chain to 4 enemies with a 25% damage dropoff per jump.",
                description: "Attacks chain to 4 enemies with a 25% damage dropoff per jump."
            },
            {
                name: "Static Paralysis",
                desc: "Applies a 0.5s shock stun to primary and chained targets.",
                description: "Applies a 0.5s shock stun to primary creeping and chained targets."
            },
            {
                name: "Thunderous Overload",
                desc: "Shocked enemies take +15% damage from consecutive lightning hits.",
                description: "Shocked enemies take +15% damage from consecutive lightning hits."
            }
        ],
        upgrades: [
            { cost: 900, damage: 1300, spa: 7.5, range: 270, chainTargets: 4, abilityName: "Upgrade 1" },
            { cost: 1500, damage: 1900, spa: 7.5, range: 280, chainTargets: 4, abilityName: "Upgrade 2" },
            { cost: 2300, damage: 2650, spa: 7.5, range: 290, chainTargets: 4, abilityName: "Upgrade 3" },
            { cost: 3300, damage: 3500, spa: 7.6, range: 300, chainTargets: 4, abilityName: "Upgrade 4" },
            { cost: 4600, damage: 4500, spa: 7.6, range: 310, chainTargets: 4, abilityName: "Upgrade 5" },
            { cost: 6100, damage: 5600, spa: 7.7, range: 320, chainTargets: 4, abilityName: "Upgrade 6" },
            { cost: 7900, damage: 6850, spa: 7.8, range: 330, chainTargets: 4, abilityName: "Upgrade 7" },
            { cost: 9900, damage: 8200, spa: 7.9, range: 340, chainTargets: 4, abilityName: "Upgrade 8" },
            { cost: 12200, damage: 9600, spa: 8.0, range: 350, chainTargets: 4, abilityName: "Upgrade 9" }
        ]
    },

    "shadow_assassin": {
        id: "shadow_assassin",
        name: "Shadow Assassin",
        rarity: "Mythic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Dark",
        role: "Damage",
        baseCost: 1100,
        baseDamage: 400,
        baseSpa: 5.8,
        baseRange: 180,
        attackType: "Single",
        attackShape: "Single Target",
        maxPlacements: 4,
        canEvolve: true,
        evolvesTo: "shadow_assassin_awakened",
        evolutionCost: {
            gold: 10000,
            requiredItems: { "shadow_dagger": 1 }
        },
        description: "Silent blade marking foes and striking from shadows.",
        passives: [
            {
                name: "Shadow Mark",
                desc: "Every 8 attacks against the same target marks it for +35% bonus damage on next hit.",
                description: "Every 8 attacks against the same target marks it for +35% bonus damage on next hit."
            }
        ],
        upgrades: [
            { cost: 750, damage: 920, spa: 5.8, range: 190, abilityName: "Upgrade 1" },
            { cost: 1500, damage: 1750, spa: 5.8, range: 200, abilityName: "Upgrade 2" },
            { cost: 2600, damage: 2800, spa: 6.0, range: 210, abilityName: "Upgrade 3" },
            { cost: 4200, damage: 4100, spa: 6.2, range: 220, abilityName: "Upgrade 4" }
        ]
    },

    "shadow_assassin_awakened": {
        id: "shadow_assassin_awakened",
        name: "Shadow Assassin (Awakened)",
        rarity: "Mythic",
        isEvolved: true,
        evolvesFrom: "shadow_assassin",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Dark",
        role: "Damage",
        baseCost: 1100,
        baseDamage: 780,
        baseSpa: 5.8,
        baseRange: 210,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 70,
        maxPlacements: 4,
        canEvolve: false,
        description: "Supreme dark assassin reaping souls across groups of enemies.",
        passives: [
            {
                name: "Endless Hunt",
                desc: "Each enemy killed grants +0.5% bonus damage during the match (Max 30% at 60 kills).",
                description: "Each enemy killed grants +0.5% bonus damage during the match (Max 30% at 60 kills)."
            },
            {
                name: "Phantom Rhythm",
                desc: "Every 10 attacks, the next attack deals +50% bonus damage.",
                description: "Every 10 attacks, the next attack deals +50% bonus damage."
            },
            {
                name: "Eclipse Slash",
                desc: "Attacks hit in an area with shadow crescent blades.",
                description: "Attacks hit in an area with shadow crescent blades."
            }
        ],
        upgrades: [
            { cost: 750, damage: 1200, spa: 5.8, range: 218, splashRadius: 75, abilityName: "Upgrade 1" },
            { cost: 1350, damage: 1800, spa: 5.8, range: 225, splashRadius: 78, abilityName: "Upgrade 2" },
            { cost: 2100, damage: 2500, spa: 5.9, range: 232, splashRadius: 82, abilityName: "Upgrade 3" },
            { cost: 3050, damage: 3350, spa: 5.9, range: 240, splashRadius: 85, abilityName: "Upgrade 4" },
            { cost: 4250, damage: 4350, spa: 6.0, range: 248, splashRadius: 88, abilityName: "Upgrade 5" },
            { cost: 5700, damage: 5500, spa: 6.1, range: 255, splashRadius: 92, abilityName: "Upgrade 6" },
            { cost: 7400, damage: 6800, spa: 6.2, range: 262, splashRadius: 95, abilityName: "Upgrade 7" },
            { cost: 9400, damage: 8250, spa: 6.3, range: 270, splashRadius: 100, abilityName: "Upgrade 8" }
        ]
    },

    "flame_emperor": {
        id: "flame_emperor",
        name: "Flame Emperor",
        rarity: "Mythic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Fire",
        role: "Damage",
        baseCost: 1250,
        baseDamage: 420,
        baseSpa: 7.2,
        baseRange: 190,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 70,
        maxPlacements: 3,
        canEvolve: true,
        evolvesTo: "flame_emperor_awakened",
        evolutionCost: {
            gold: 11000,
            requiredItems: { "blaze": 12 }
        },
        description: "Monarch of fire engulfing the battlefield in molten waves.",
        passives: [
            {
                name: "Ignition Blaze",
                desc: "Attacks apply burn dealing 50% unit damage over 3 seconds.",
                description: "Attacks apply burn dealing 50% unit damage over 3 seconds."
            }
        ],
        upgrades: [
            { cost: 850, damage: 980, spa: 7.2, range: 200, splashRadius: 75, abilityName: "Upgrade 1" },
            { cost: 1700, damage: 1850, spa: 7.2, range: 210, splashRadius: 80, abilityName: "Upgrade 2" },
            { cost: 2900, damage: 2950, spa: 7.5, range: 220, splashRadius: 85, abilityName: "Upgrade 3" },
            { cost: 4600, damage: 4300, spa: 7.8, range: 230, splashRadius: 90, abilityName: "Upgrade 4" }
        ]
    },

    "flame_emperor_awakened": {
        id: "flame_emperor_awakened",
        name: "Flame Emperor (Awakened)",
        rarity: "Mythic",
        isEvolved: true,
        evolvesFrom: "flame_emperor",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Fire",
        role: "Damage",
        baseCost: 1250,
        baseDamage: 820,
        baseSpa: 7.2,
        baseRange: 220,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 95,
        maxPlacements: 3,
        canEvolve: false,
        description: "Awakened fire monarch ruling over scorched battlefields.",
        passives: [
            {
                name: "Infernal Blaze",
                desc: "Burn deals 50% unit damage over 3 seconds.",
                description: "Burn deals 50% unit damage over 3 seconds."
            },
            {
                name: "Scorched Earth",
                desc: "Deals +20% bonus damage to enemies currently burning.",
                description: "Deals +20% bonus damage to enemies currently burning."
            },
            {
                name: "Solar Pulse",
                desc: "Every 6 attacks unleashes a searing heat pulse dealing +30% bonus damage.",
                description: "Every 6 attacks unleashes a searing heat pulse dealing +30% bonus damage."
            }
        ],
        upgrades: [
            { cost: 850, damage: 1350, spa: 7.2, range: 230, splashRadius: 98, abilityName: "Upgrade 1" },
            { cost: 1500, damage: 2000, spa: 7.2, range: 240, splashRadius: 102, abilityName: "Upgrade 2" },
            { cost: 2350, damage: 2800, spa: 7.3, range: 250, splashRadius: 106, abilityName: "Upgrade 3" },
            { cost: 3400, damage: 3750, spa: 7.3, range: 260, splashRadius: 110, abilityName: "Upgrade 4" },
            { cost: 4700, damage: 4850, spa: 7.4, range: 270, splashRadius: 114, abilityName: "Upgrade 5" },
            { cost: 6300, damage: 6100, spa: 7.5, range: 280, splashRadius: 118, abilityName: "Upgrade 6" },
            { cost: 8200, damage: 7500, spa: 7.6, range: 290, splashRadius: 122, abilityName: "Upgrade 7" },
            { cost: 10400, damage: 9050, spa: 7.7, range: 305, splashRadius: 128, abilityName: "Upgrade 8" }
        ]
    },

    "holy_knight": {
        id: "holy_knight",
        name: "Holy Knight",
        rarity: "Mythic",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Light",
        role: "Damage",
        baseCost: 1150,
        baseDamage: 380,
        baseSpa: 6.5,
        baseRange: 170,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 65,
        maxPlacements: 4,
        canEvolve: true,
        evolvesTo: "holy_knight_awakened",
        evolutionCost: {
            gold: 10000,
            requiredItems: { "light_energy": 12 }
        },
        description: "Radiant paladin smiting the corrupt with blessed steel.",
        passives: [
            {
                name: "Blessed Steel",
                desc: "Deals +15% bonus damage against Dark and Abyssal enemies.",
                description: "Deals +15% bonus damage against Dark and Abyssal enemies."
            }
        ],
        upgrades: [
            { cost: 750, damage: 880, spa: 6.5, range: 180, splashRadius: 70, abilityName: "Upgrade 1" },
            { cost: 1550, damage: 1650, spa: 6.5, range: 190, splashRadius: 75, abilityName: "Upgrade 2" },
            { cost: 2700, damage: 2650, spa: 6.8, range: 200, splashRadius: 80, abilityName: "Upgrade 3" },
            { cost: 4300, damage: 3850, spa: 7.0, range: 210, splashRadius: 85, abilityName: "Upgrade 4" }
        ]
    },

    "holy_knight_awakened": {
        id: "holy_knight_awakened",
        name: "Holy Knight (Awakened)",
        rarity: "Mythic",
        isEvolved: true,
        evolvesFrom: "holy_knight",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Physical",
        element: "Light",
        role: "Damage",
        baseCost: 1150,
        baseDamage: 760,
        baseSpa: 6.5,
        baseRange: 200,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 85,
        maxPlacements: 4,
        canEvolve: false,
        description: "Radiant exemplar unleashing waves of divine judgment.",
        passives: [
            {
                name: "Aura of Radiance",
                desc: "Increases nearby physical allies' damage by +10%.",
                description: "Increases nearby physical allies' damage by +10%."
            },
            {
                name: "Sanctified Smite",
                desc: "Every 5th attack delivers a holy critical strike dealing +40% damage.",
                description: "Every 5th attack delivers a holy critical strike dealing +40% damage."
            },
            {
                name: "Divine Shockwave",
                desc: "Attacks unleash a blast of blinding holy light that stuns enemies in the blast for 1.5s.",
                description: "Attacks unleash a blast of blinding holy light that stuns enemies in the blast for 1.5s."
            }
        ],
        upgrades: [
            { cost: 800, damage: 1300, spa: 6.5, range: 210, splashRadius: 90, abilityName: "Upgrade 1" },
            { cost: 1450, damage: 1950, spa: 6.5, range: 220, splashRadius: 95, abilityName: "Upgrade 2" },
            { cost: 2300, damage: 2750, spa: 6.6, range: 230, splashRadius: 100, abilityName: "Upgrade 3" },
            { cost: 3400, damage: 3700, spa: 6.6, range: 240, splashRadius: 105, abilityName: "Upgrade 4" },
            { cost: 4800, damage: 4850, spa: 6.7, range: 250, splashRadius: 110, abilityName: "Upgrade 5" },
            { cost: 6600, damage: 6200, spa: 6.8, range: 260, splashRadius: 115, abilityName: "Upgrade 6" },
            { cost: 8800, damage: 7800, spa: 6.9, range: 272, splashRadius: 120, abilityName: "Upgrade 7" }
        ]
    },

    "wind_master": {
        id: "wind_master",
        name: "Wind Master",
        rarity: "Mythic",
        placement: "Hill",
        hasSoaring: true,
        damageType: "Magical",
        element: "Nature",
        role: "Damage",
        baseCost: 1200,
        baseDamage: 360,
        baseSpa: 6.2,
        baseRange: 240,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 60,
        maxPlacements: 3,
        canEvolve: true,
        evolvesTo: "wind_master_awakened",
        evolutionCost: {
            gold: 10000,
            requiredItems: { "green_star_fruit": 10, "rainbow_star_fruit": 2 }
        },
        description: "Wind sage sweeping enemies in tempestuous currents.",
        passives: [
            {
                name: "Gale Vantage",
                desc: "Gains +15% extra range when positioned on Hill vantage points.",
                description: "Gains +15% extra range when positioned on Hill vantage points."
            }
        ],
        upgrades: [
            { cost: 800, damage: 820, spa: 6.2, range: 255, splashRadius: 65, abilityName: "Upgrade 1" },
            { cost: 1600, damage: 1550, spa: 6.2, range: 270, splashRadius: 70, abilityName: "Upgrade 2" },
            { cost: 2800, damage: 2500, spa: 6.4, range: 285, splashRadius: 75, abilityName: "Upgrade 3" },
            { cost: 4400, damage: 3650, spa: 6.6, range: 300, splashRadius: 80, abilityName: "Upgrade 4" }
        ]
    },

    "wind_master_awakened": {
        id: "wind_master_awakened",
        name: "Wind Master (Awakened)",
        rarity: "Mythic",
        isEvolved: true,
        evolvesFrom: "wind_master",
        placement: "Hill",
        hasSoaring: true,
        damageType: "Magical",
        element: "Nature",
        role: "Damage",
        baseCost: 1200,
        baseDamage: 710,
        baseSpa: 6.2,
        baseRange: 280,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 85,
        maxPlacements: 3,
        canEvolve: false,
        description: "Supreme storm architect summoning tornadoes across the battlefield.",
        passives: [
            {
                name: "Vortex Currents",
                desc: "Attacks slightly drag enemies back along the road.",
                description: "Attacks slightly drag enemies back along the road."
            },
            {
                name: "Cyclone Mastery",
                desc: "Deals +25% bonus damage to airborne and flying enemies.",
                description: "Deals +25% bonus damage to airborne and flying enemies."
            },
            {
                name: "Swift Tempest",
                desc: "Reduces own attack time by 8%.",
                description: "Reduces own attack time by 8%."
            }
        ],
        upgrades: [
            { cost: 800, damage: 1220, spa: 6.2, range: 292, splashRadius: 90, abilityName: "Upgrade 1" },
            { cost: 1400, damage: 1850, spa: 6.2, range: 304, splashRadius: 94, abilityName: "Upgrade 2" },
            { cost: 2200, damage: 2600, spa: 6.3, range: 316, splashRadius: 98, abilityName: "Upgrade 3" },
            { cost: 3200, damage: 3500, spa: 6.3, range: 328, splashRadius: 102, abilityName: "Upgrade 4" },
            { cost: 4500, damage: 4550, spa: 6.4, range: 340, splashRadius: 106, abilityName: "Upgrade 5" },
            { cost: 6050, damage: 5750, spa: 6.5, range: 352, splashRadius: 110, abilityName: "Upgrade 6" },
            { cost: 7900, damage: 7100, spa: 6.6, range: 364, splashRadius: 114, abilityName: "Upgrade 7" },
            { cost: 10100, damage: 8600, spa: 6.7, range: 380, splashRadius: 120, abilityName: "Upgrade 8" }
        ]
    },

    // ====================================================
    // SECRET UNITS (Highest Tier)
    // ====================================================
    "star_mage": {
        id: "star_mage",
        name: "Star Mage",
        rarity: "Secret",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Light",
        role: "Damage",
        baseCost: 1800,
        baseDamage: 550,
        baseSpa: 7.0,
        baseRange: 220,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 80,
        maxPlacements: 2,
        canEvolve: true,
        evolvesTo: "star_mage_explosion",
        evolutionCost: {
            gold: 15000,
            requiredItems: { "star_staff": 1 }
        },
        description: "Celestial sorcerer channeling supernova power.",
        passives: [
            {
                name: "Stellar Gravity",
                desc: "Slows enemies in blast radius by 20% for 1.5 seconds.",
                description: "Slows enemies in blast radius by 20% for 1.5 seconds."
            }
        ],
        upgrades: [
            { cost: 1200, damage: 1300, spa: 7.0, range: 235, splashRadius: 85, abilityName: "Upgrade 1" },
            { cost: 2400, damage: 2400, spa: 7.0, range: 250, splashRadius: 90, abilityName: "Upgrade 2" },
            { cost: 4200, damage: 3800, spa: 7.2, range: 265, splashRadius: 95, abilityName: "Upgrade 3" },
            { cost: 6800, damage: 5600, spa: 7.4, range: 280, splashRadius: 100, abilityName: "Upgrade 4" }
        ]
    },

    "star_mage_explosion": {
        id: "star_mage_explosion",
        name: "Star Mage (Awakened)",
        rarity: "Secret",
        isEvolved: true,
        evolvesFrom: "star_mage",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Light",
        role: "Damage",
        baseCost: 1800,
        baseDamage: 1150,
        baseSpa: 7.5,
        baseRange: 280,
        attackType: "FullAoE",
        attackShape: "Full AoE",
        splashRadius: 200,
        maxPlacements: 2,
        canEvolve: false,
        description: "Cataclysmic star archmage unleashing massive supernova blasts across the field.",
        passives: [
            {
                name: "Supernova Catalyst",
                desc: "Attack speed buffs convert directly into bonus attack damage.",
                description: "Attack speed buffs convert directly into bonus attack damage."
            },
            {
                name: "Stellar Blast Zone",
                desc: "Enemies hit 3 times by explosion take +30% extra light damage.",
                description: "Enemies hit 3 times by explosion take +30% extra light damage."
            },
            {
                name: "Cosmic Execution",
                desc: "Deals +25% bonus damage to high health bosses.",
                description: "Deals +25% bonus damage to high health bosses."
            }
        ],
        upgrades: [
            { cost: 1200, damage: 1900, spa: 7.5, range: 290, splashRadius: 200, abilityName: "Upgrade 1" },
            { cost: 2100, damage: 2800, spa: 7.5, range: 300, splashRadius: 200, abilityName: "Upgrade 2" },
            { cost: 3200, damage: 3900, spa: 7.6, range: 310, splashRadius: 200, abilityName: "Upgrade 3" },
            { cost: 4600, damage: 5150, spa: 7.6, range: 320, splashRadius: 200, abilityName: "Upgrade 4" },
            { cost: 6300, damage: 6600, spa: 7.7, range: 330, splashRadius: 200, abilityName: "Upgrade 5" },
            { cost: 8300, damage: 8250, spa: 7.7, range: 340, splashRadius: 200, abilityName: "Upgrade 6" },
            { cost: 10700, damage: 10100, spa: 7.8, range: 350, splashRadius: 200, abilityName: "Upgrade 7" },
            { cost: 13500, damage: 12200, spa: 7.9, range: 360, splashRadius: 200, abilityName: "Upgrade 8" },
            { cost: 16800, damage: 14500, spa: 8.0, range: 370, splashRadius: 200, abilityName: "Upgrade 9" },
            { cost: 20500, damage: 17000, spa: 8.1, range: 385, splashRadius: 200, abilityName: "Upgrade 10" }
        ]
    },

    "vampire_king": {
        id: "vampire_king",
        name: "Vampire King",
        rarity: "Secret",
        placement: "Ground",
        hasSoaring: false,
        damageType: "Magical",
        element: "Dark",
        role: "Damage",
        baseCost: 2750,
        baseDamage: 1250,
        baseSpa: 7.8,
        baseRange: 210,
        attackType: "Splash",
        attackShape: "Circle AoE",
        splashRadius: 110,
        maxPlacements: 1,
        canEvolve: false,
        description: "Ancient lord of crimson. Inflicts bleed, gains bleed bonus damage, and raises dead foes as minions.",
        passives: [
            {
                name: "Blood Curse",
                desc: "Attacks apply bleed for 8 seconds dealing 50% unit damage over time.",
                description: "Attacks apply bleed for 8 seconds dealing 50% unit damage over time."
            },
            {
                name: "Crimson Feast",
                desc: "Deals +15% direct attack damage to bleeding enemies.",
                description: "Deals +15% direct attack damage to bleeding enemies."
            },
            {
                name: "Army of the Fallen",
                desc: "Defeated enemies are resurrected as walking minions from base that attack foes.",
                description: "Defeated enemies are resurrected as walking minions from base that attack foes."
            }
        ],
        upgrades: [
            { cost: 2200, damage: 2700, spa: 7.8, range: 225, splashRadius: 115, abilityName: "Upgrade 1" },
            { cost: 4500, damage: 4700, spa: 7.8, range: 240, splashRadius: 120, abilityName: "Upgrade 2" },
            { cost: 7800, damage: 7200, spa: 8.0, range: 255, splashRadius: 125, abilityName: "Upgrade 3" },
            { cost: 12000, damage: 10200, spa: 8.2, range: 270, splashRadius: 130, abilityName: "Upgrade 4" },
            { cost: 18000, damage: 13800, spa: 8.5, range: 290, splashRadius: 140, abilityName: "Upgrade 5" }
        ]
    }
};

if (typeof window !== 'undefined') {
    window.UNIT_CONFIG = UNIT_CONFIG;
}
