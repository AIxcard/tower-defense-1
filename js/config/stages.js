// Pixel Tower Defense — Stages & Modifiers Configuration
// Normal, Hard, Infinite, and Limited Event modes with separate first-clear rewards and modifiers

const WORLDS_METADATA = {
    "world_1": { id: "world_1", name: "Plains", worldNum: 1, desc: "Rolling open meadows and beginner training grounds.", hasLegend: false },
    "world_2": { id: "world_2", name: "Hills", worldNum: 2, desc: "Rugged foothills and goblin outposts. Home to the Light, Blaze, and Dagger Legend Acts.", hasLegend: true },
    "world_3": { id: "world_3", name: "Mountains", worldNum: 3, desc: "High altitude alpine peaks and elemental shrines. Home to Fire, Water, and Nature Scroll Legend Acts.", hasLegend: true }
};

const STAGE_CONFIG = {
    // ----------------------------------------------------
    // STORY WORLD 1: PLAINS (Acts 1 to 6) — NO LEGEND STAGES
    // ----------------------------------------------------
    "world1_act1": {
        id: "world1_act1",
        worldId: "world_1",
        actNum: 1,
        name: "Plains Act 1",
        description: "Sunny outskirts where rookie slimes and grunts assemble.",
        totalWaves: 15,
        normal: {
            firstClearGems: 50,
            repeatGems: 10,
            baseMobHpMultiplier: 0.40,
            mobSpeedMultiplier: 0.85,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 4, interval: 2.0 },
                { wave: 2, enemies: ["grunt"], count: 5, interval: 1.8 },
                { wave: 3, enemies: ["grunt"], count: 6, interval: 1.8 },
                { wave: 4, enemies: ["grunt", "scout_dasher"], count: 6, interval: 1.6 },
                { wave: 5, enemies: ["grunt", "scout_dasher"], count: 8, interval: 1.5 },
                { wave: 6, enemies: ["grunt"], count: 8, interval: 1.4 },
                { wave: 7, enemies: ["grunt", "scout_dasher"], count: 9, interval: 1.4 },
                { wave: 8, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.3 },
                { wave: 9, enemies: ["grunt"], count: 10, interval: 1.2 },
                { wave: 10, enemies: ["grunt", "armored_golem"], count: 8, interval: 1.5 },
                { wave: 11, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.2 },
                { wave: 12, enemies: ["grunt"], count: 12, interval: 1.1 },
                { wave: 13, enemies: ["scout_dasher"], count: 8, interval: 1.3 },
                { wave: 14, enemies: ["grunt", "armored_golem"], count: 8, interval: 1.4 },
                { wave: 15, enemies: ["grunt", "armored_golem", "scout_dasher"], count: 10, interval: 1.2 }
            ],
            modifier: null
        },
        hard: { firstClearGems: 100, repeatGems: 20, baseMobHpMultiplier: 1.2, mobSpeedMultiplier: 1.05, startCash: 3000, totalWaves: 15 }
    },
    "world1_act2": {
        id: "world1_act2",
        worldId: "world_1",
        actNum: 2,
        name: "Plains Act 2",
        description: "Windy grasslands patrolled by scout dashers.",
        totalWaves: 15,
        normal: {
            firstClearGems: 60,
            repeatGems: 12,
            baseMobHpMultiplier: 0.45,
            mobSpeedMultiplier: 0.88,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 5, interval: 1.8 },
                { wave: 2, enemies: ["grunt", "scout_dasher"], count: 6, interval: 1.6 },
                { wave: 3, enemies: ["scout_dasher"], count: 6, interval: 1.6 },
                { wave: 4, enemies: ["grunt", "scout_dasher"], count: 8, interval: 1.5 },
                { wave: 5, enemies: ["grunt"], count: 8, interval: 1.4 },
                { wave: 6, enemies: ["scout_dasher"], count: 8, interval: 1.4 },
                { wave: 7, enemies: ["grunt", "armored_golem"], count: 8, interval: 1.5 },
                { wave: 8, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.3 },
                { wave: 9, enemies: ["scout_dasher"], count: 10, interval: 1.2 },
                { wave: 10, enemies: ["armored_golem"], count: 4, interval: 2.0 },
                { wave: 11, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.2 },
                { wave: 12, enemies: ["grunt"], count: 12, interval: 1.1 },
                { wave: 13, enemies: ["scout_dasher"], count: 10, interval: 1.2 },
                { wave: 14, enemies: ["grunt", "armored_golem"], count: 10, interval: 1.3 },
                { wave: 15, enemies: ["grunt", "scout_dasher", "armored_golem"], count: 12, interval: 1.1 }
            ]
        },
        hard: { firstClearGems: 120, repeatGems: 25, baseMobHpMultiplier: 1.3, mobSpeedMultiplier: 1.08, startCash: 3000, totalWaves: 15 }
    },
    "world1_act3": {
        id: "world1_act3",
        worldId: "world_1",
        actNum: 3,
        name: "Plains Act 3",
        description: "Creek crossing where armored scouts try to break through.",
        totalWaves: 15,
        normal: {
            firstClearGems: 70,
            repeatGems: 14,
            baseMobHpMultiplier: 0.50,
            mobSpeedMultiplier: 0.90,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 6, interval: 1.8 },
                { wave: 2, enemies: ["grunt", "scout_dasher"], count: 7, interval: 1.6 },
                { wave: 3, enemies: ["grunt"], count: 8, interval: 1.5 },
                { wave: 4, enemies: ["scout_dasher"], count: 8, interval: 1.4 },
                { wave: 5, enemies: ["armored_golem"], count: 3, interval: 2.2 },
                { wave: 6, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.3 },
                { wave: 7, enemies: ["grunt"], count: 10, interval: 1.3 },
                { wave: 8, enemies: ["armored_golem", "grunt"], count: 8, interval: 1.5 },
                { wave: 9, enemies: ["scout_dasher"], count: 10, interval: 1.2 },
                { wave: 10, enemies: ["armored_golem"], count: 5, interval: 1.8 },
                { wave: 11, enemies: ["grunt", "scout_dasher"], count: 12, interval: 1.1 },
                { wave: 12, enemies: ["grunt"], count: 12, interval: 1.1 },
                { wave: 13, enemies: ["scout_dasher"], count: 12, interval: 1.1 },
                { wave: 14, enemies: ["armored_golem", "grunt"], count: 10, interval: 1.3 },
                { wave: 15, enemies: ["armored_golem", "scout_dasher", "grunt"], count: 14, interval: 1.0 }
            ]
        },
        hard: { firstClearGems: 140, repeatGems: 30, baseMobHpMultiplier: 1.4, mobSpeedMultiplier: 1.10, startCash: 3000, totalWaves: 15 }
    },
    "world1_act4": {
        id: "world1_act4",
        worldId: "world_1",
        actNum: 4,
        name: "Plains Act 4",
        description: "Harvest fields teeming with swarms of enemies.",
        totalWaves: 15,
        normal: {
            firstClearGems: 80,
            repeatGems: 16,
            baseMobHpMultiplier: 0.55,
            mobSpeedMultiplier: 0.90,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 6, interval: 1.7 },
                { wave: 2, enemies: ["scout_dasher"], count: 7, interval: 1.5 },
                { wave: 3, enemies: ["grunt", "scout_dasher"], count: 8, interval: 1.5 },
                { wave: 4, enemies: ["armored_golem"], count: 4, interval: 2.0 },
                { wave: 5, enemies: ["grunt"], count: 10, interval: 1.3 },
                { wave: 6, enemies: ["scout_dasher"], count: 10, interval: 1.3 },
                { wave: 7, enemies: ["armored_golem", "grunt"], count: 8, interval: 1.5 },
                { wave: 8, enemies: ["grunt", "scout_dasher"], count: 12, interval: 1.2 },
                { wave: 9, enemies: ["scout_dasher"], count: 12, interval: 1.2 },
                { wave: 10, enemies: ["armored_golem"], count: 6, interval: 1.8 },
                { wave: 11, enemies: ["grunt"], count: 14, interval: 1.1 },
                { wave: 12, enemies: ["scout_dasher"], count: 12, interval: 1.1 },
                { wave: 13, enemies: ["armored_golem", "grunt"], count: 10, interval: 1.3 },
                { wave: 14, enemies: ["grunt", "scout_dasher"], count: 14, interval: 1.0 },
                { wave: 15, enemies: ["armored_golem", "scout_dasher", "grunt"], count: 15, interval: 1.0 }
            ]
        },
        hard: { firstClearGems: 160, repeatGems: 35, baseMobHpMultiplier: 1.5, mobSpeedMultiplier: 1.12, startCash: 3000, totalWaves: 15 }
    },
    "world1_act5": {
        id: "world1_act5",
        worldId: "world_1",
        actNum: 5,
        name: "Plains Act 5",
        description: "Ancient stone henge in the center of the plains.",
        totalWaves: 15,
        normal: {
            firstClearGems: 90,
            repeatGems: 18,
            baseMobHpMultiplier: 0.60,
            mobSpeedMultiplier: 0.92,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 7, interval: 1.6 },
                { wave: 2, enemies: ["scout_dasher"], count: 8, interval: 1.5 },
                { wave: 3, enemies: ["armored_golem"], count: 4, interval: 2.0 },
                { wave: 4, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.3 },
                { wave: 5, enemies: ["grunt"], count: 10, interval: 1.3 },
                { wave: 6, enemies: ["armored_golem"], count: 5, interval: 1.8 },
                { wave: 7, enemies: ["scout_dasher"], count: 12, interval: 1.2 },
                { wave: 8, enemies: ["grunt", "armored_golem"], count: 10, interval: 1.3 },
                { wave: 9, enemies: ["scout_dasher"], count: 12, interval: 1.2 },
                { wave: 10, enemies: ["armored_golem"], count: 6, interval: 1.7 },
                { wave: 11, enemies: ["grunt", "scout_dasher"], count: 14, interval: 1.1 },
                { wave: 12, enemies: ["armored_golem"], count: 6, interval: 1.6 },
                { wave: 13, enemies: ["grunt"], count: 15, interval: 1.0 },
                { wave: 14, enemies: ["scout_dasher", "armored_golem"], count: 12, interval: 1.2 },
                { wave: 15, enemies: ["armored_golem", "scout_dasher", "grunt"], count: 16, interval: 1.0 }
            ]
        },
        hard: { firstClearGems: 180, repeatGems: 40, baseMobHpMultiplier: 1.6, mobSpeedMultiplier: 1.15, startCash: 3000, totalWaves: 15 }
    },
    "world1_act6": {
        id: "world1_act6",
        worldId: "world_1",
        actNum: 6,
        name: "Plains Act 6",
        description: "Plains stronghold gate guarded by the plains boss chieftain.",
        totalWaves: 15,
        normal: {
            firstClearGems: 100,
            repeatGems: 20,
            baseMobHpMultiplier: 0.65,
            mobSpeedMultiplier: 0.92,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 6, interval: 1.7 },
                { wave: 2, enemies: ["scout_dasher"], count: 8, interval: 1.5 },
                { wave: 3, enemies: ["armored_golem"], count: 4, interval: 2.0 },
                { wave: 4, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.3 },
                { wave: 5, enemies: ["grunt"], count: 10, interval: 1.3 },
                { wave: 6, enemies: ["armored_golem"], count: 5, interval: 1.8 },
                { wave: 7, enemies: ["scout_dasher"], count: 12, interval: 1.2 },
                { wave: 8, enemies: ["grunt", "armored_golem"], count: 10, interval: 1.3 },
                { wave: 9, enemies: ["scout_dasher"], count: 12, interval: 1.2 },
                { wave: 10, enemies: ["armored_golem"], count: 6, interval: 1.7 },
                { wave: 11, enemies: ["grunt", "scout_dasher"], count: 14, interval: 1.1 },
                { wave: 12, enemies: ["armored_golem"], count: 6, interval: 1.6 },
                { wave: 13, enemies: ["grunt"], count: 15, interval: 1.0 },
                { wave: 14, enemies: ["scout_dasher", "armored_golem"], count: 12, interval: 1.2 },
                { wave: 15, enemies: ["world_boss_demon"], count: 1, interval: 3.0 }
            ]
        },
        hard: { firstClearGems: 200, repeatGems: 50, baseMobHpMultiplier: 1.7, mobSpeedMultiplier: 1.15, startCash: 3000, totalWaves: 15 }
    },

    // ----------------------------------------------------
    // STORY WORLD 2: HILLS (Acts 1 to 6) — FORMERLY WORLD 1
    // ----------------------------------------------------
    "world2_act1": {
        id: "world2_act1",
        worldId: "world_2",
        actNum: 1,
        name: "Hills Act 1",
        description: "Scattered vanguard pushing through the hills.",
        totalWaves: 15,
                normal: {
            firstClearGems: 60,
            repeatGems: 10,
            baseMobHpMultiplier: 0.55,
            mobSpeedMultiplier: 0.90,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 5, interval: 1.8 },
                { wave: 2, enemies: ["grunt", "scout_dasher"], count: 6, interval: 1.6 },
                { wave: 3, enemies: ["grunt"], count: 7, interval: 1.5 },
                { wave: 4, enemies: ["scout_dasher"], count: 8, interval: 1.4 },
                { wave: 5, enemies: ["grunt", "armored_golem"], count: 6, interval: 1.6 },
                { wave: 6, enemies: ["grunt"], count: 9, interval: 1.3 },
                { wave: 7, enemies: ["grunt", "scout_dasher"], count: 10, interval: 1.3 },
                { wave: 8, enemies: ["armored_golem"], count: 5, interval: 2.0 },
                { wave: 9, enemies: ["grunt", "scout_dasher"], count: 12, interval: 1.2 },
                { wave: 10, enemies: ["armored_golem", "grunt"], count: 8, interval: 1.5 },
                { wave: 11, enemies: ["scout_dasher"], count: 12, interval: 1.1 },
                { wave: 12, enemies: ["grunt", "armored_golem"], count: 10, interval: 1.4 },
                { wave: 13, enemies: ["scout_dasher", "grunt"], count: 14, interval: 1.1 },
                { wave: 14, enemies: ["armored_golem", "grunt"], count: 10, interval: 1.3 },
                { wave: 15, enemies: ["armored_golem", "scout_dasher", "grunt"], count: 12, interval: 1.2 }
            ]
        },
        hard: { firstClearGems: 120, repeatGems: 20, baseMobHpMultiplier: 2.2, mobSpeedMultiplier: 1.15, startCash: 3000, totalWaves: 15 }
    },
    "world2_act2": {
        id: "world2_act2",
        worldId: "world_2",
        actNum: 2,
        name: "Hills Act 2",
        description: "Woodland passes infested with armored guards.",
        totalWaves: 15,
                normal: {
            firstClearGems: 75,
            repeatGems: 12,
            baseMobHpMultiplier: 0.60,
            mobSpeedMultiplier: 0.95,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 6, interval: 1.7 },
                { wave: 2, enemies: ["grunt", "scout_dasher"], count: 7, interval: 1.5 },
                { wave: 3, enemies: ["armored_golem"], count: 5, interval: 1.8 },
                { wave: 4, enemies: ["grunt", "scout_dasher"], count: 8, interval: 1.4 },
                { wave: 5, enemies: ["armored_golem", "grunt"], count: 8, interval: 1.5 },
                { wave: 6, enemies: ["scout_dasher"], count: 10, interval: 1.2 },
                { wave: 7, enemies: ["armored_golem", "scout_dasher"], count: 9, interval: 1.4 },
                { wave: 8, enemies: ["grunt"], count: 12, interval: 1.2 },
                { wave: 9, enemies: ["armored_golem"], count: 8, interval: 1.5 },
                { wave: 10, enemies: ["grunt", "scout_dasher"], count: 12, interval: 1.2 },
                { wave: 11, enemies: ["armored_golem", "grunt"], count: 10, interval: 1.3 },
                { wave: 12, enemies: ["scout_dasher"], count: 14, interval: 1.1 },
                { wave: 13, enemies: ["armored_golem", "scout_dasher"], count: 11, interval: 1.3 },
                { wave: 14, enemies: ["grunt", "armored_golem"], count: 13, interval: 1.2 },
                { wave: 15, enemies: ["armored_golem", "scout_dasher", "grunt"], count: 15, interval: 1.1 }
            ]
        },
        hard: { firstClearGems: 150, repeatGems: 25, baseMobHpMultiplier: 2.6, mobSpeedMultiplier: 1.20, startCash: 3000, totalWaves: 15 }
    },
    "world2_act3": {
        id: "world2_act3",
        worldId: "world_2",
        actNum: 3,
        name: "Hills Act 3",
        description: "Elevated ridges where flying harpies dive.",
        totalWaves: 15,
                normal: {
            firstClearGems: 90,
            repeatGems: 15,
            baseMobHpMultiplier: 0.65,
            mobSpeedMultiplier: 1.0,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 6, interval: 1.6 },
                { wave: 2, enemies: ["flying_harpy"], count: 4, interval: 2.0 },
                { wave: 3, enemies: ["grunt", "flying_harpy"], count: 7, interval: 1.5 },
                { wave: 4, enemies: ["scout_dasher"], count: 8, interval: 1.3 },
                { wave: 5, enemies: ["flying_harpy", "scout_dasher"], count: 8, interval: 1.4 },
                { wave: 6, enemies: ["armored_golem", "flying_harpy"], count: 8, interval: 1.5 },
                { wave: 7, enemies: ["flying_harpy"], count: 8, interval: 1.4 },
                { wave: 8, enemies: ["grunt", "scout_dasher"], count: 11, interval: 1.2 },
                { wave: 9, enemies: ["flying_harpy", "armored_golem"], count: 9, interval: 1.4 },
                { wave: 10, enemies: ["flying_harpy"], count: 10, interval: 1.3 },
                { wave: 11, enemies: ["scout_dasher", "flying_harpy"], count: 12, interval: 1.2 },
                { wave: 12, enemies: ["armored_golem", "flying_harpy"], count: 10, interval: 1.3 },
                { wave: 13, enemies: ["flying_harpy", "grunt"], count: 13, interval: 1.2 },
                { wave: 14, enemies: ["armored_golem", "flying_harpy"], count: 11, interval: 1.3 },
                { wave: 15, enemies: ["flying_harpy", "armored_golem", "scout_dasher"], count: 14, interval: 1.1 }
            ]
        },
        hard: { firstClearGems: 180, repeatGems: 30, baseMobHpMultiplier: 3.0, mobSpeedMultiplier: 1.25, startCash: 3000, totalWaves: 15 }
    },
    "world2_act4": {
        id: "world2_act4",
        worldId: "world_2",
        actNum: 4,
        name: "Hills Act 4",
        description: "Ancient sanctuary shielded by magic resistant guardians.",
        totalWaves: 15,
                normal: {
            firstClearGems: 100,
            repeatGems: 18,
            baseMobHpMultiplier: 0.70,
            mobSpeedMultiplier: 1.0,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 6, interval: 1.6 },
                { wave: 2, enemies: ["magic_shieldbearer"], count: 4, interval: 1.8 },
                { wave: 3, enemies: ["grunt", "magic_shieldbearer"], count: 7, interval: 1.5 },
                { wave: 4, enemies: ["flying_harpy"], count: 6, interval: 1.6 },
                { wave: 5, enemies: ["magic_shieldbearer", "armored_golem"], count: 7, interval: 1.6 },
                { wave: 6, enemies: ["scout_dasher", "magic_shieldbearer"], count: 9, interval: 1.3 },
                { wave: 7, enemies: ["magic_shieldbearer", "flying_harpy"], count: 9, interval: 1.4 },
                { wave: 8, enemies: ["grunt", "magic_shieldbearer"], count: 11, interval: 1.3 },
                { wave: 9, enemies: ["magic_shieldbearer", "armored_golem"], count: 9, interval: 1.4 },
                { wave: 10, enemies: ["magic_shieldbearer"], count: 10, interval: 1.3 },
                { wave: 11, enemies: ["flying_harpy", "magic_shieldbearer"], count: 11, interval: 1.3 },
                { wave: 12, enemies: ["magic_shieldbearer", "scout_dasher"], count: 12, interval: 1.2 },
                { wave: 13, enemies: ["armored_golem", "magic_shieldbearer"], count: 11, interval: 1.3 },
                { wave: 14, enemies: ["magic_shieldbearer", "flying_harpy"], count: 12, interval: 1.2 },
                { wave: 15, enemies: ["magic_shieldbearer", "armored_golem", "flying_harpy"], count: 14, interval: 1.1 }
            ]
        },
        hard: { firstClearGems: 200, repeatGems: 35, baseMobHpMultiplier: 3.4, mobSpeedMultiplier: 1.25, startCash: 3000, totalWaves: 15 }
    },
    "world2_act5": {
        id: "world2_act5",
        worldId: "world_2",
        actNum: 5,
        name: "Hills Act 5",
        description: "Twisting gorges where berserkers charge the line.",
        totalWaves: 15,
                normal: {
            firstClearGems: 125,
            repeatGems: 22,
            baseMobHpMultiplier: 0.75,
            mobSpeedMultiplier: 1.05,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt", "scout_dasher"], count: 7, interval: 1.5 },
                { wave: 2, enemies: ["berserker_orc"], count: 4, interval: 2.0 },
                { wave: 3, enemies: ["grunt", "berserker_orc"], count: 8, interval: 1.5 },
                { wave: 4, enemies: ["flying_harpy"], count: 7, interval: 1.5 },
                { wave: 5, enemies: ["berserker_orc", "armored_golem"], count: 8, interval: 1.6 },
                { wave: 6, enemies: ["scout_dasher", "berserker_orc"], count: 9, interval: 1.3 },
                { wave: 7, enemies: ["berserker_orc", "flying_harpy"], count: 9, interval: 1.4 },
                { wave: 8, enemies: ["magic_shieldbearer", "berserker_orc"], count: 10, interval: 1.3 },
                { wave: 9, enemies: ["berserker_orc"], count: 10, interval: 1.4 },
                { wave: 10, enemies: ["berserker_orc", "scout_dasher"], count: 11, interval: 1.3 },
                { wave: 11, enemies: ["armored_golem", "berserker_orc"], count: 11, interval: 1.3 },
                { wave: 12, enemies: ["flying_harpy", "berserker_orc"], count: 12, interval: 1.2 },
                { wave: 13, enemies: ["magic_shieldbearer", "berserker_orc"], count: 12, interval: 1.2 },
                { wave: 14, enemies: ["berserker_orc", "scout_dasher"], count: 13, interval: 1.2 },
                { wave: 15, enemies: ["berserker_orc", "armored_golem", "flying_harpy"], count: 15, interval: 1.1 }
            ]
        },
        hard: { firstClearGems: 250, repeatGems: 45, baseMobHpMultiplier: 3.8, mobSpeedMultiplier: 1.30, startCash: 3000, totalWaves: 15 }
    },
    "world2_act6": {
        id: "world2_act6",
        worldId: "world_2",
        actNum: 6,
        name: "Hills Act 6",
        description: "Peak fortress of the hills. Prepare for the final summit battle!",
        totalWaves: 15,
        hasBoss: true,
        bossId: "world_boss_demon",
                normal: {
            firstClearGems: 200,
            repeatGems: 30,
            baseMobHpMultiplier: 0.70, // 4,500 * 0.70 = ~3,150 HP Boss (clean and balanced!)
            mobSpeedMultiplier: 1.05,
            startCash: 3000,
            waveEnemies: [
                { wave: 1, enemies: ["grunt", "scout_dasher"], count: 7, interval: 1.5 },
                { wave: 2, enemies: ["armored_golem"], count: 5, interval: 1.8 },
                { wave: 3, enemies: ["flying_harpy"], count: 6, interval: 1.6 },
                { wave: 4, enemies: ["magic_shieldbearer"], count: 7, interval: 1.5 },
                { wave: 5, enemies: ["berserker_orc"], count: 7, interval: 1.6 },
                { wave: 6, enemies: ["armored_golem", "flying_harpy"], count: 8, interval: 1.4 },
                { wave: 7, enemies: ["berserker_orc", "scout_dasher"], count: 10, interval: 1.3 },
                { wave: 8, enemies: ["magic_shieldbearer", "grunt"], count: 10, interval: 1.3 },
                { wave: 9, enemies: ["flying_harpy", "berserker_orc"], count: 10, interval: 1.3 },
                { wave: 10, enemies: ["armored_golem", "berserker_orc"], count: 10, interval: 1.3 },
                { wave: 11, enemies: ["magic_shieldbearer", "flying_harpy"], count: 11, interval: 1.2 },
                { wave: 12, enemies: ["berserker_orc", "armored_golem"], count: 11, interval: 1.2 },
                { wave: 13, enemies: ["grunt", "scout_dasher", "flying_harpy"], count: 13, interval: 1.1 },
                { wave: 14, enemies: ["berserker_orc", "magic_shieldbearer", "armored_golem"], count: 12, interval: 1.2 },
                { wave: 15, enemies: ["berserker_orc", "armored_golem"], count: 8, interval: 1.5 }
            ]
        },
        hard: { firstClearGems: 400, repeatGems: 60, baseMobHpMultiplier: 4.5, mobSpeedMultiplier: 1.35, startCash: 3000, totalWaves: 15 }
    },

    // ----------------------------------------------------
    // STORY WORLD 3: MOUNTAINS (Acts 1 to 6)
    // ----------------------------------------------------
    "world3_act1": {
        id: "world3_act1",
        worldId: "world_3",
        actNum: 1,
        name: "Mountains Act 1",
        description: "Rocky mountain base with jagged boulders and creeping ogres.",
        totalWaves: 15,
        normal: { firstClearGems: 80, repeatGems: 15, baseMobHpMultiplier: 2.0, mobSpeedMultiplier: 1.10, startCash: 3000 },
        hard: { firstClearGems: 160, repeatGems: 30, baseMobHpMultiplier: 3.8, mobSpeedMultiplier: 1.25, startCash: 3000, totalWaves: 15 }
    },
    "world3_act2": {
        id: "world3_act2",
        worldId: "world_3",
        actNum: 2,
        name: "Mountains Act 2",
        description: "Snowy passes where fierce frost winds slow defenses.",
        totalWaves: 15,
        normal: { firstClearGems: 95, repeatGems: 18, baseMobHpMultiplier: 2.2, mobSpeedMultiplier: 1.12, startCash: 3000 },
        hard: { firstClearGems: 190, repeatGems: 36, baseMobHpMultiplier: 4.0, mobSpeedMultiplier: 1.28, startCash: 3000, totalWaves: 15 }
    },
    "world3_act3": {
        id: "world3_act3",
        worldId: "world_3",
        actNum: 3,
        name: "Mountains Act 3",
        description: "Precipitous cliff edges where flying wyverns attack.",
        totalWaves: 15,
        normal: { firstClearGems: 110, repeatGems: 20, baseMobHpMultiplier: 2.5, mobSpeedMultiplier: 1.15, startCash: 3000 },
        hard: { firstClearGems: 220, repeatGems: 42, baseMobHpMultiplier: 4.4, mobSpeedMultiplier: 1.30, startCash: 3000, totalWaves: 15 }
    },
    "world3_act4": {
        id: "world3_act4",
        worldId: "world_3",
        actNum: 4,
        name: "Mountains Act 4",
        description: "Mountain crystal cavern humming with raw elemental power.",
        totalWaves: 15,
        normal: { firstClearGems: 130, repeatGems: 24, baseMobHpMultiplier: 2.8, mobSpeedMultiplier: 1.18, startCash: 3000 },
        hard: { firstClearGems: 260, repeatGems: 50, baseMobHpMultiplier: 4.8, mobSpeedMultiplier: 1.32, startCash: 3000, totalWaves: 15 }
    },
    "world3_act5": {
        id: "world3_act5",
        worldId: "world_3",
        actNum: 5,
        name: "Mountains Act 5",
        description: "Volcanic crest smoking with molten rock and lava golems.",
        totalWaves: 15,
        normal: { firstClearGems: 150, repeatGems: 28, baseMobHpMultiplier: 3.1, mobSpeedMultiplier: 1.20, startCash: 3000 },
        hard: { firstClearGems: 300, repeatGems: 60, baseMobHpMultiplier: 5.2, mobSpeedMultiplier: 1.35, startCash: 3000, totalWaves: 15 }
    },
    "world3_act6": {
        id: "world3_act6",
        worldId: "world_3",
        actNum: 6,
        name: "Mountains Act 6",
        description: "Apex of the mountain peak. Summit fortress boss battle!",
        totalWaves: 15,
        hasBoss: true,
        bossId: "world_boss_demon",
        normal: { firstClearGems: 250, repeatGems: 40, baseMobHpMultiplier: 3.5, mobSpeedMultiplier: 1.22, startCash: 3000 },
        hard: { firstClearGems: 500, repeatGems: 80, baseMobHpMultiplier: 5.8, mobSpeedMultiplier: 1.40, startCash: 3000, totalWaves: 15 }
    },

    // ----------------------------------------------------
    // INFINITE MODE
    // ----------------------------------------------------
    "infinite_mode": {
        id: "infinite_mode",
        name: "Infinite Mode",
        description: "Endless escalating waves. Every 5 waves grants scaling Gems! Wave drops: 5% Thunder Essence & 5% Nature Essence.",
        isInfinite: true,
        startCash: 3000,
        gemRewardPer5Waves: true,
        modifier: {
            name: "Endless Surge",
            description: "+10% Damage to all units, +8% Enemy HP compound per wave",
            physicalDamageBonus: 0.10,
            magicalDamageBonus: 0.10
        }
    },

    // ----------------------------------------------------
    // LIMITED RELEASE EVENT MODE (20 WAVES, 500 GEMS, 0.75% STAR MAGE)
    // ----------------------------------------------------
        "event_release": {
        id: "event_release",
        name: "Release Event",
        description: "Supreme 20-wave trial! The hardest stage in the game with elite abyssal colossi and demon lords. Clears award 500 Gems and a 0.75% chance for Secret Star Mage!",
        isEvent: true,
        totalWaves: 20,
        startCash: 1500,
        firstClearGems: 500,
        repeatGems: 500,
        hasBoss: true,
        bossId: "world_boss_demon",
        eventUnitRewardId: "star_mage",
        eventUnitDropRate: 0.0075,
        modifier: {
            name: "Celestial Convergence",
            description: "Supreme Trial: Enemies have +150% HP and +25% Speed.",
            magicalDamageBonus: 0.20,
            elementalBonus: { "Light": 0.25, "Dark": 0.25 }
        },
        normal: {
            firstClearGems: 500,
            repeatGems: 500,
            baseMobHpMultiplier: 4.8,
            mobSpeedMultiplier: 1.25,
            startCash: 1500,
            waveEnemies: [
                { wave: 1, enemies: ["grunt", "scout_dasher"], count: 12, interval: 1.2 },
                { wave: 2, enemies: ["armored_golem", "scout_dasher"], count: 14, interval: 1.1 },
                { wave: 3, enemies: ["flying_harpy", "grunt"], count: 16, interval: 1.0 },
                { wave: 4, enemies: ["magic_shieldbearer", "scout_dasher"], count: 16, interval: 1.0 },
                { wave: 5, enemies: ["berserker_orc", "armored_golem"], count: 18, interval: 0.9 },
                { wave: 6, enemies: ["flying_harpy", "shadow_healer"], count: 18, interval: 0.9 },
                { wave: 7, enemies: ["shadow_assassin", "scout_dasher"], count: 20, interval: 0.85 },
                { wave: 8, enemies: ["armored_golem", "magic_shieldbearer"], count: 22, interval: 0.8 },
                { wave: 9, enemies: ["berserker_orc", "shadow_healer", "flying_harpy"], count: 24, interval: 0.8 },
                { wave: 10, enemies: ["abyssal_colossus", "berserker_orc"], count: 15, interval: 0.9 },
                { wave: 11, enemies: ["shadow_assassin", "magic_shieldbearer"], count: 24, interval: 0.75 },
                { wave: 12, enemies: ["armored_golem", "flying_harpy", "shadow_healer"], count: 26, interval: 0.7 },
                { wave: 13, enemies: ["berserker_orc", "shadow_assassin"], count: 28, interval: 0.7 },
                { wave: 14, enemies: ["magic_shieldbearer", "shadow_healer", "armored_golem"], count: 30, interval: 0.65 },
                { wave: 15, enemies: ["abyssal_colossus", "berserker_orc"], count: 18, interval: 0.8 },
                { wave: 16, enemies: ["shadow_assassin", "flying_harpy"], count: 32, interval: 0.6 },
                { wave: 17, enemies: ["armored_golem", "berserker_orc", "magic_shieldbearer"], count: 34, interval: 0.55 },
                { wave: 18, enemies: ["shadow_healer", "shadow_assassin", "berserker_orc"], count: 36, interval: 0.5 },
                { wave: 19, enemies: ["abyssal_colossus", "shadow_assassin", "flying_harpy"], count: 25, interval: 0.6 },
                { wave: 20, enemies: ["world_boss_demon", "abyssal_colossus", "berserker_orc"], count: 20, interval: 0.7 }
            ]
        },
        hard: {
            firstClearGems: 1000,
            repeatGems: 750,
            baseMobHpMultiplier: 7.5,
            mobSpeedMultiplier: 1.40,
            totalWaves: 20,
            startCash: 1500
        }
    },

// ----------------------------------------------------
    // WORLD 2: HILLS LEGEND STAGES (ACTS 1 - 3)
    // Act 1: 100% drops 1-3 Light Energy (Replaces clock)
    // Act 2: 100% drops 1-3 Blazes
    // Act 3: 100% drops 1-3 Daggers + 10% Relic Shard
    // ----------------------------------------------------
    "legend_act1": {
        id: "legend_act1",
        worldId: "world_2",
        name: "Hills Legend Act 1",
        name: "Legend Act 1",
        description: "Celestial sanctuary where radiant light forces dwell. 100% drops 1-3 Light Energy!",
        isLegend: true,
        actNum: 1,
        totalWaves: 15,
        startCash: 3000,
        previewEnemies: ["armored_golem", "scout_dasher", "grunt"],
        guaranteedDrop: { id: "light_energy", name: "Light Energy", min: 1, max: 3, icon: "✨" },
        normal: {
            firstClearGems: 80,
            repeatGems: 25,
            baseMobHpMultiplier: 2.2,
            mobSpeedMultiplier: 1.10,
            waveEnemies: [
                { wave: 1, enemies: ["grunt"], count: 8, interval: 1.4 },
                { wave: 2, enemies: ["scout_dasher"], count: 10, interval: 1.2 },
                { wave: 3, enemies: ["armored_golem"], count: 8, interval: 1.5 },
                { wave: 4, enemies: ["grunt", "armored_golem"], count: 12, interval: 1.2 },
                { wave: 5, enemies: ["scout_dasher", "armored_golem"], count: 14, interval: 1.1 },
                { wave: 6, enemies: ["grunt", "scout_dasher"], count: 16, interval: 1.0 },
                { wave: 7, enemies: ["armored_golem"], count: 10, interval: 1.4 },
                { wave: 8, enemies: ["grunt", "scout_dasher", "armored_golem"], count: 18, interval: 1.0 },
                { wave: 9, enemies: ["armored_golem", "scout_dasher"], count: 16, interval: 0.9 },
                { wave: 10, enemies: ["armored_golem", "grunt"], count: 18, interval: 0.9 },
                { wave: 11, enemies: ["grunt", "scout_dasher"], count: 20, interval: 0.8 },
                { wave: 12, enemies: ["armored_golem", "berserker_orc"], count: 14, interval: 1.0 },
                { wave: 13, enemies: ["scout_dasher", "shadow_healer"], count: 18, interval: 0.9 },
                { wave: 14, enemies: ["armored_golem", "berserker_orc"], count: 20, interval: 0.8 },
                { wave: 15, enemies: ["armored_golem", "berserker_orc", "scout_dasher"], count: 24, interval: 0.75 }
            ]
        },
        hard: {
            firstClearGems: 160,
            repeatGems: 40,
            baseMobHpMultiplier: 3.5,
            mobSpeedMultiplier: 1.25,
            totalWaves: 15
        }
    },
    "legend_act2": {
        id: "legend_act2",
        name: "Legend Act 2",
        description: "Volcanic caldera surging with molten fury. 100% drops 1-3 Blazes!",
        isLegend: true,
        actNum: 2,
        totalWaves: 15,
        startCash: 3000,
        previewEnemies: ["berserker_orc", "scout_dasher", "armored_golem"],
        guaranteedDrop: { id: "blaze", name: "Blaze", min: 1, max: 3, icon: "🔥" },
        normal: {
            firstClearGems: 100,
            repeatGems: 30,
            baseMobHpMultiplier: 2.5,
            mobSpeedMultiplier: 1.15,
            waveEnemies: [
                { wave: 1, enemies: ["scout_dasher"], count: 10, interval: 1.3 },
                { wave: 2, enemies: ["grunt", "berserker_orc"], count: 10, interval: 1.2 },
                { wave: 3, enemies: ["berserker_orc"], count: 12, interval: 1.1 },
                { wave: 4, enemies: ["armored_golem", "berserker_orc"], count: 12, interval: 1.1 },
                { wave: 5, enemies: ["scout_dasher", "berserker_orc"], count: 16, interval: 1.0 },
                { wave: 6, enemies: ["grunt", "berserker_orc"], count: 18, interval: 0.95 },
                { wave: 7, enemies: ["armored_golem"], count: 12, interval: 1.3 },
                { wave: 8, enemies: ["berserker_orc", "scout_dasher"], count: 20, interval: 0.9 },
                { wave: 9, enemies: ["armored_golem", "berserker_orc"], count: 18, interval: 0.85 },
                { wave: 10, enemies: ["berserker_orc", "shadow_healer"], count: 20, interval: 0.85 },
                { wave: 11, enemies: ["scout_dasher", "berserker_orc"], count: 22, interval: 0.8 },
                { wave: 12, enemies: ["armored_golem", "berserker_orc"], count: 16, interval: 0.9 },
                { wave: 13, enemies: ["shadow_healer", "berserker_orc"], count: 20, interval: 0.8 },
                { wave: 14, enemies: ["armored_golem", "berserker_orc"], count: 22, interval: 0.75 },
                { wave: 15, enemies: ["armored_golem", "berserker_orc", "scout_dasher"], count: 26, interval: 0.7 }
            ]
        },
        hard: {
            firstClearGems: 200,
            repeatGems: 50,
            baseMobHpMultiplier: 4.0,
            mobSpeedMultiplier: 1.30,
            totalWaves: 15
        }
    },
    "legend_act3": {
        id: "legend_act3",
        name: "Legend Act 3",
        description: "Dark citadel of elite stealth assassins. 100% drops 1-3 Daggers + 10% Relic Shard!",
        isLegend: true,
        actNum: 3,
        totalWaves: 15,
        startCash: 3000,
        previewEnemies: ["shadow_healer", "berserker_orc", "armored_golem", "scout_dasher"],
        guaranteedDrop: { id: "dagger", name: "Dagger", min: 1, max: 3, icon: "🗡️" },
        bonusDrop: { id: "relic_shard", name: "Relic Shard", chance: 0.10, count: 1, icon: "💠" },
        normal: {
            firstClearGems: 120,
            repeatGems: 35,
            baseMobHpMultiplier: 2.8,
            mobSpeedMultiplier: 1.20,
            waveEnemies: [
                { wave: 1, enemies: ["grunt", "scout_dasher"], count: 12, interval: 1.2 },
                { wave: 2, enemies: ["scout_dasher", "shadow_healer"], count: 12, interval: 1.1 },
                { wave: 3, enemies: ["armored_golem", "shadow_healer"], count: 12, interval: 1.1 },
                { wave: 4, enemies: ["berserker_orc", "shadow_healer"], count: 14, interval: 1.0 },
                { wave: 5, enemies: ["scout_dasher", "berserker_orc"], count: 18, interval: 0.9 },
                { wave: 6, enemies: ["armored_golem", "shadow_healer"], count: 16, interval: 0.9 },
                { wave: 7, enemies: ["berserker_orc", "scout_dasher"], count: 20, interval: 0.85 },
                { wave: 8, enemies: ["shadow_healer", "berserker_orc"], count: 22, interval: 0.8 },
                { wave: 9, enemies: ["armored_golem", "berserker_orc"], count: 20, interval: 0.8 },
                { wave: 10, enemies: ["armored_golem", "shadow_healer"], count: 22, interval: 0.75 },
                { wave: 11, enemies: ["scout_dasher", "berserker_orc"], count: 24, interval: 0.7 },
                { wave: 12, enemies: ["shadow_healer", "berserker_orc"], count: 20, interval: 0.75 },
                { wave: 13, enemies: ["armored_golem", "berserker_orc"], count: 24, interval: 0.7 },
                { wave: 14, enemies: ["shadow_healer", "armored_golem", "berserker_orc"], count: 26, interval: 0.65 },
                { wave: 15, enemies: ["armored_golem", "berserker_orc", "shadow_healer", "scout_dasher"], count: 30, interval: 0.6 }
            ]
        },
        hard: {
            firstClearGems: 240,
            repeatGems: 60,
            baseMobHpMultiplier: 4.5,
            mobSpeedMultiplier: 1.35,
            totalWaves: 15
        }
    },

    // ----------------------------------------------------
    // WORLD 3: MOUNTAINS LEGEND STAGES (ACTS 1 - 3)
    // Act 1: 100% drops 5-10 Fire Scrolls
    // Act 2: 100% drops 5-10 Water Scrolls
    // Act 3: 100% drops 5-10 Nature Scrolls
    // ----------------------------------------------------
    "legend_mountains_act1": {
        id: "legend_mountains_act1",
        worldId: "world_3",
        name: "Mountain Legend Act 1",
        description: "Scorching volcanic mountain caldera. 100% drops 5-10 Fire Scrolls!",
        isLegend: true,
        actNum: 1,
        totalWaves: 15,
        startCash: 3000,
        previewEnemies: ["berserker_orc", "scout_dasher", "armored_golem"],
        guaranteedDrop: { id: "fire_scroll", name: "Fire Scroll", min: 5, max: 10, icon: "📜" },
        normal: {
            firstClearGems: 140,
            repeatGems: 40,
            baseMobHpMultiplier: 3.0,
            mobSpeedMultiplier: 1.15,
            waveEnemies: [
                { wave: 1, enemies: ["scout_dasher"], count: 12, interval: 1.2 },
                { wave: 2, enemies: ["grunt", "berserker_orc"], count: 14, interval: 1.1 },
                { wave: 3, enemies: ["berserker_orc"], count: 14, interval: 1.1 },
                { wave: 4, enemies: ["armored_golem", "berserker_orc"], count: 16, interval: 1.0 },
                { wave: 5, enemies: ["scout_dasher", "berserker_orc"], count: 18, interval: 0.95 },
                { wave: 6, enemies: ["grunt", "berserker_orc"], count: 20, interval: 0.9 },
                { wave: 7, enemies: ["armored_golem"], count: 14, interval: 1.2 },
                { wave: 8, enemies: ["berserker_orc", "scout_dasher"], count: 22, interval: 0.85 },
                { wave: 9, enemies: ["armored_golem", "berserker_orc"], count: 20, interval: 0.8 },
                { wave: 10, enemies: ["berserker_orc", "shadow_healer"], count: 22, interval: 0.8 },
                { wave: 11, enemies: ["scout_dasher", "berserker_orc"], count: 24, interval: 0.75 },
                { wave: 12, enemies: ["armored_golem", "berserker_orc"], count: 18, interval: 0.85 },
                { wave: 13, enemies: ["shadow_healer", "berserker_orc"], count: 22, interval: 0.75 },
                { wave: 14, enemies: ["armored_golem", "berserker_orc"], count: 24, interval: 0.7 },
                { wave: 15, enemies: ["armored_golem", "berserker_orc", "scout_dasher"], count: 28, interval: 0.65 }
            ]
        },
        hard: {
            firstClearGems: 280,
            repeatGems: 75,
            baseMobHpMultiplier: 4.8,
            mobSpeedMultiplier: 1.30,
            totalWaves: 15
        }
    },
    "legend_mountains_act2": {
        id: "legend_mountains_act2",
        worldId: "world_3",
        name: "Mountain Legend Act 2",
        description: "Glacial mountain cataracts and cascades. 100% drops 5-10 Water Scrolls!",
        isLegend: true,
        actNum: 2,
        totalWaves: 15,
        startCash: 3000,
        previewEnemies: ["flying_harpy", "armored_golem", "shadow_healer"],
        guaranteedDrop: { id: "water_scroll", name: "Water Scroll", min: 5, max: 10, icon: "📜" },
        normal: {
            firstClearGems: 160,
            repeatGems: 45,
            baseMobHpMultiplier: 3.3,
            mobSpeedMultiplier: 1.18,
            waveEnemies: [
                { wave: 1, enemies: ["grunt", "scout_dasher"], count: 14, interval: 1.2 },
                { wave: 2, enemies: ["scout_dasher", "shadow_healer"], count: 14, interval: 1.1 },
                { wave: 3, enemies: ["armored_golem", "shadow_healer"], count: 14, interval: 1.0 },
                { wave: 4, enemies: ["berserker_orc", "shadow_healer"], count: 16, interval: 1.0 },
                { wave: 5, enemies: ["scout_dasher", "berserker_orc"], count: 20, interval: 0.9 },
                { wave: 6, enemies: ["armored_golem", "shadow_healer"], count: 18, interval: 0.9 },
                { wave: 7, enemies: ["berserker_orc", "scout_dasher"], count: 22, interval: 0.85 },
                { wave: 8, enemies: ["shadow_healer", "berserker_orc"], count: 24, interval: 0.8 },
                { wave: 9, enemies: ["armored_golem", "berserker_orc"], count: 22, interval: 0.75 },
                { wave: 10, enemies: ["armored_golem", "shadow_healer"], count: 24, interval: 0.75 },
                { wave: 11, enemies: ["scout_dasher", "berserker_orc"], count: 26, interval: 0.7 },
                { wave: 12, enemies: ["shadow_healer", "berserker_orc"], count: 22, interval: 0.7 },
                { wave: 13, enemies: ["armored_golem", "berserker_orc"], count: 26, interval: 0.65 },
                { wave: 14, enemies: ["shadow_healer", "armored_golem", "berserker_orc"], count: 28, interval: 0.6 },
                { wave: 15, enemies: ["armored_golem", "berserker_orc", "shadow_healer", "scout_dasher"], count: 32, interval: 0.55 }
            ]
        },
        hard: {
            firstClearGems: 320,
            repeatGems: 85,
            baseMobHpMultiplier: 5.2,
            mobSpeedMultiplier: 1.32,
            totalWaves: 15
        }
    },
    "legend_mountains_act3": {
        id: "legend_mountains_act3",
        worldId: "world_3",
        name: "Mountain Legend Act 3",
        description: "Alpine pine ridges whistling in gale-force winds. 100% drops 5-10 Nature Scrolls!",
        isLegend: true,
        actNum: 3,
        totalWaves: 15,
        startCash: 3000,
        previewEnemies: ["berserker_orc", "shadow_healer", "armored_golem"],
        guaranteedDrop: { id: "nature_scroll", name: "Nature Scroll", min: 5, max: 10, icon: "📜" },
        normal: {
            firstClearGems: 180,
            repeatGems: 50,
            baseMobHpMultiplier: 3.6,
            mobSpeedMultiplier: 1.20,
            waveEnemies: [
                { wave: 1, enemies: ["scout_dasher", "grunt"], count: 16, interval: 1.1 },
                { wave: 2, enemies: ["berserker_orc", "scout_dasher"], count: 16, interval: 1.0 },
                { wave: 3, enemies: ["armored_golem", "berserker_orc"], count: 16, interval: 1.0 },
                { wave: 4, enemies: ["shadow_healer", "berserker_orc"], count: 18, interval: 0.95 },
                { wave: 5, enemies: ["armored_golem", "shadow_healer"], count: 20, interval: 0.9 },
                { wave: 6, enemies: ["scout_dasher", "berserker_orc"], count: 22, interval: 0.85 },
                { wave: 7, enemies: ["armored_golem", "berserker_orc"], count: 24, interval: 0.8 },
                { wave: 8, enemies: ["shadow_healer", "berserker_orc"], count: 26, interval: 0.75 },
                { wave: 9, enemies: ["armored_golem", "shadow_healer"], count: 24, interval: 0.75 },
                { wave: 10, enemies: ["berserker_orc", "armored_golem"], count: 28, interval: 0.7 },
                { wave: 11, enemies: ["scout_dasher", "shadow_healer"], count: 30, interval: 0.65 },
                { wave: 12, enemies: ["armored_golem", "berserker_orc"], count: 26, interval: 0.65 },
                { wave: 13, enemies: ["shadow_healer", "berserker_orc"], count: 30, interval: 0.6 },
                { wave: 14, enemies: ["armored_golem", "berserker_orc"], count: 32, interval: 0.55 },
                { wave: 15, enemies: ["armored_golem", "berserker_orc", "shadow_healer", "scout_dasher"], count: 36, interval: 0.5 }
            ]
        },
        hard: {
            firstClearGems: 360,
            repeatGems: 100,
            baseMobHpMultiplier: 5.5,
            mobSpeedMultiplier: 1.35,
            totalWaves: 15
        }
    }
};

// Backward compatibility stage aliases
STAGE_CONFIG["event_genesis_rift"] = STAGE_CONFIG["event_release"];
STAGE_CONFIG["legend_hills_act1"] = STAGE_CONFIG["legend_act1"];
STAGE_CONFIG["legend_hills_act2"] = STAGE_CONFIG["legend_act2"];
STAGE_CONFIG["legend_hills_act3"] = STAGE_CONFIG["legend_act3"];

// Story World Quests (Clear Acts in Story Mode — ONLY gives Gems!)
const STORY_QUESTS = {
    "world_1": [
        { actNum: 1, title: "Clear Plains Act 1", rewardGems: 30, description: "Clear Plains Act 1 in Story Mode" },
        { actNum: 2, title: "Clear Plains Act 2", rewardGems: 40, description: "Clear Plains Act 2 in Story Mode" },
        { actNum: 3, title: "Clear Plains Act 3", rewardGems: 50, description: "Clear Plains Act 3 in Story Mode" },
        { actNum: 4, title: "Clear Plains Act 4", rewardGems: 60, description: "Clear Plains Act 4 in Story Mode" },
        { actNum: 5, title: "Clear Plains Act 5", rewardGems: 75, description: "Clear Plains Act 5 in Story Mode" },
        { actNum: 6, title: "Defeat Plains Boss (Act 6)", rewardGems: 100, description: "Defeat Boss in Plains Act 6" }
    ],
    "world_2": [
        { actNum: 1, title: "Clear Hills Act 1", rewardGems: 35, description: "Clear Hills Act 1 in Story Mode" },
        { actNum: 2, title: "Clear Hills Act 2", rewardGems: 45, description: "Clear Hills Act 2 in Story Mode" },
        { actNum: 3, title: "Clear Hills Act 3", rewardGems: 55, description: "Clear Hills Act 3 in Story Mode" },
        { actNum: 4, title: "Clear Hills Act 4", rewardGems: 65, description: "Clear Hills Act 4 in Story Mode" },
        { actNum: 5, title: "Clear Hills Act 5", rewardGems: 80, description: "Clear Hills Act 5 in Story Mode" },
        { actNum: 6, title: "Defeat Demon Lord (Act 6)", rewardGems: 120, description: "Defeat Demon Lord in Hills Act 6" }
    ],
    "world_3": [
        { actNum: 1, title: "Clear Mountain Act 1", rewardGems: 40, description: "Clear Mountain Act 1 in Story Mode" },
        { actNum: 2, title: "Clear Mountain Act 2", rewardGems: 50, description: "Clear Mountain Act 2 in Story Mode" },
        { actNum: 3, title: "Clear Mountain Act 3", rewardGems: 60, description: "Clear Mountain Act 3 in Story Mode" },
        { actNum: 4, title: "Clear Mountain Act 4", rewardGems: 75, description: "Clear Mountain Act 4 in Story Mode" },
        { actNum: 5, title: "Clear Mountain Act 5", rewardGems: 90, description: "Clear Mountain Act 5 in Story Mode" },
        { actNum: 6, title: "Defeat Mountain Summit Boss (Act 6)", rewardGems: 150, description: "Defeat Summit Boss in Mountain Act 6" }
    ]
};

// Challenges Configuration (Daily Challenge: 30 waves, Half Hourly Challenge: 15 waves)
const CHALLENGE_CONFIG = {
    getDailyChallenge() {
        const cycleKey = window.TimeService ? window.TimeService.getDailyCycleKey() : "DAILY";
        let hash = 0;
        for (let i = 0; i < cycleKey.length; i++) hash = (hash << 5) - hash + cycleKey.charCodeAt(i);
        const worldNum = (Math.abs(hash >> 3) % 3) + 1; // Rotates across World 1, 2, or 3
        const actNum = (Math.abs(hash) % 6) + 1; // Rotates through Story Act 1 to 6
        const stageId = `world${worldNum}_act${actNum}`;
        const baseStage = STAGE_CONFIG[stageId] || STAGE_CONFIG["world2_act1"] || STAGE_CONFIG["world1_act1"];

        return {
            id: "daily_challenge",
            type: "daily",
            title: "Daily Challenge",
            cycleKey: cycleKey,
            worldNum: worldNum,
            actNum: actNum,
            stageId: stageId,
            mapName: baseStage.name,
            totalWaves: 30, // 30 waves
            startCash: 600,
            hpMultiplier: 2.5,
            speedMultiplier: 1.15,
            rewards: {
                gems: 3000,
                traitRerolls: 25, // 25 Trait RR added to Daily Challenge reward pool!
                starFruits: {
                    "normal_star_fruit": 10,
                    "pink_star_fruit": 2,
                    "red_star_fruit": 2,
                    "green_star_fruit": 2,
                    "blue_star_fruit": 2,
                    "yellow_star_fruit": 2,
                    "rainbow_star_fruit": 3
                }
            }
        };
    },

    getHalfHourlyChallenge() {
        const cycleKey = window.TimeService ? window.TimeService.getHourlyCycleKey() : "HOURLY";
        let hash = 0;
        for (let i = 0; i < cycleKey.length; i++) hash = (hash << 5) - hash + cycleKey.charCodeAt(i);
        const worldNum = (Math.abs(hash >> 3) % 3) + 1; // Rotates across World 1, 2, or 3
        const actNum = (Math.abs(hash) % 6) + 1; // Rotates through Story Act 1 to 6
        const stageId = `world${worldNum}_act${actNum}`;
        const baseStage = STAGE_CONFIG[stageId] || STAGE_CONFIG["world2_act1"] || STAGE_CONFIG["world1_act1"];

        // Hourly dynamic fruit rewards from TimeService
        const hourlyData = window.TimeService ? window.TimeService.getHourlyChallengeForCurrentCycle() : null;
        const fruits = {};
        if (hourlyData && hourlyData.rewards) {
            hourlyData.rewards.forEach(r => {
                fruits[r.type] = r.count;
            });
        } else {
            fruits["normal_star_fruit"] = 4;
            fruits["blue_star_fruit"] = 2;
        }

        return {
            id: "half_hourly_challenge",
            type: "half_hourly",
            title: "Half Hourly Challenge",
            cycleKey: cycleKey,
            worldNum: worldNum,
            actNum: actNum,
            stageId: stageId,
            mapName: baseStage.name,
            totalWaves: 15, // 15 waves
            startCash: 550,
            hpMultiplier: 1.8,
            speedMultiplier: 1.25,
            rewards: {
                gems: 500,
                traitRerolls: 3, // 3 Trait RR added to Half Hourly Challenge reward pool!
                starFruits: fruits
            }
        };
    }
};


// Mountain Legend aliases
STAGE_CONFIG["legend_m_act1"] = STAGE_CONFIG["legend_mountains_act1"];
STAGE_CONFIG["legend_m_act2"] = STAGE_CONFIG["legend_mountains_act2"];
STAGE_CONFIG["legend_m_act3"] = STAGE_CONFIG["legend_mountains_act3"];

if (typeof window !== 'undefined') {
    window.WORLDS_METADATA = WORLDS_METADATA;
    window.STAGE_CONFIG = STAGE_CONFIG;
    window.STORY_QUESTS = STORY_QUESTS;
    window.CHALLENGE_CONFIG = CHALLENGE_CONFIG;
}
