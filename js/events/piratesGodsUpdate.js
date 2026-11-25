// Pixel Tower Defense — Update 0.5: Pirates X Gods Hunt (PREVIEW / STAGED MODULE)
// NOTE: This module is isolated for future deployment. It is NOT bundled into index.html for release.

const PiratesGodsUpdate = {
    version: "0.5.0",
    codename: "Pirates X Gods Hunt",
    isReleased: false,

    // NEW UPCOMING CHARACTERS
    UNITS: {
        "pirate_king": {
            id: "pirate_king",
            name: "Pirate King (Conqueror)",
            rarity: "Secret",
            placement: "Ground",
            element: "Storm",
            damageType: "True",
            description: "Legendary captain wielding supreme Conqueror Haki and supreme True Damage.",
            obtainment: "Pirate X Gods Banner (0.001%)",
            baseDamage: 2400,
            baseSpa: 7.5,
            baseRange: 320,
            passives: [
                { name: "Conqueror Supreme", desc: "Attacks inflict True Damage, completely bypassing all enemy armor and resistances." },
                { name: "King's Domain", desc: "Allies within range deal +30% True Damage to sea beasts and god-tier bosses." }
            ]
        },
        "poseidon": {
            id: "poseidon",
            name: "Poseidon (Tyrant of the Seas)",
            rarity: "Secret",
            placement: "Hill",
            element: "Aqua",
            damageType: "Magical",
            description: "Ruler of the ocean summoning abyssal tsunamis and trident tempest vortexes.",
            obtainment: "Sea God's Portal (0.75% Drop Rate)",
            baseDamage: 2200,
            baseSpa: 8.0,
            baseRange: 360,
            passives: [
                { name: "Abyssal Deluge", desc: "Every 4th attack drowns the entire lane in a crushing wave, stunning for 2.5s." },
                { name: "Trident Wrath", desc: "Attacks shatter enemy shields, converting 50% of damage into splash AOE." }
            ]
        },
        "pirate_hunter": {
            id: "pirate_hunter",
            name: "Pirate Hunter (General)",
            rarity: "Mythic",
            placement: "Ground",
            element: "Nature",
            damageType: "Physical",
            description: "Master swordsman wielding three blades infused with demonic slashing strikes.",
            obtainment: "Pirate X Gods Banner (Featured Mythic)",
            baseDamage: 1100,
            baseSpa: 6.2,
            baseRange: 240,
            passives: [
                { name: "Three-Sword Demon", desc: "Critical hits execute enemies below 15% Max HP instantly (except bosses)." },
                { name: "Dragon Twister", desc: "Spins up a localized cyclone cutting down flying and ground targets simultaneously." }
            ]
        },
        "ares": {
            id: "ares",
            name: "Ares (God of War)",
            rarity: "Mythic",
            placement: "Ground",
            element: "Fire",
            damageType: "Physical",
            description: "Incarnation of war empowered by bloodshed, gaining stacking rage on every elimination.",
            obtainment: "Sea God's Portal / War Trial",
            baseDamage: 1050,
            baseSpa: 6.8,
            baseRange: 220,
            passives: [
                { name: "Bloodlust Stacks", desc: "Kills grant +2% ATK up to 50 stacks (+100% total damage)." },
                { name: "Spear of War", desc: "Pierces through target lines inflicting deep bleed damage." }
            ]
        },
        "weather_pirate": {
            id: "weather_pirate",
            name: "Weather Pirate (Navigator)",
            rarity: "Mythic",
            placement: "Hill",
            element: "Storm",
            damageType: "Magical",
            description: "Tactical navigator manipulating climate, lightning clouds, and mirage heatwaves.",
            obtainment: "Pirate X Gods Banner (Featured Mythic)",
            baseDamage: 920,
            baseSpa: 5.8,
            baseRange: 300,
            passives: [
                { name: "Thundercloud Tempo", desc: "Calls thunderbolts with a 40% chance to shock and paralyze enemies for 1.8s." },
                { name: "Weather Gust", desc: "Pushes back normal enemy advances by 120 pixels every 12 seconds." }
            ]
        }
    },

    // 10-TIER SEA PORTAL SPECIFICATION
    PORTALS: {
        tiers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        getPortalConfig(tier = 1) {
            return {
                tier: tier,
                name: `Abyssal Sea Portal Tier ${tier}`,
                waves: 15 + Math.min(10, tier * 2),
                enemyHpMultiplier: Math.pow(1.65, tier),
                rewards: {
                    gems: 200 + tier * 150,
                    gold: 1500 + tier * 800,
                    seaEssence: tier * 3,
                    secretChance: tier >= 7 ? 0.0075 : 0.001
                }
            };
        },
        seaGodPortal: {
            name: "Sea God's Divine Portal",
            tier: 11,
            bossHp: 8500000,
            poseidonDropRate: 0.0075, // 0.75%
            aresDropRate: 0.035       // 3.5%
        }
    },

    // 3-CARD RUNTIME SELECTION SYSTEM (CARD CHOICES ON VICTORY & BETWEEN WAVES)
    CARD_CHOICE_POOL: [
        { id: "c_atk_boost", type: "buff", name: "Pirate's Rum", desc: "All placed units deal +25% Damage", cost: 0 },
        { id: "c_spa_haste", type: "buff", name: "Tailwind Breeze", desc: "All units gain -15% SPA (faster attacks)", cost: 0 },
        { id: "c_range_lens", type: "buff", name: "Spyglass Scope", desc: "All units gain +20% Attack Range", cost: 0 },
        { id: "c_gold_greed", type: "buff", name: "Buried Treasure", desc: "Waves grant +50% Gold income", cost: 0 },
        { id: "c_debuff_curse", type: "challenge", name: "Siren's Call", desc: "Enemies move +30% faster, but drops give 2x Gems", cost: 0 },
        { id: "c_boss_frenzy", type: "challenge", name: "Kraken's Fury", desc: "Boss HP +50%, awards guaranteed Tier 5+ Portal", cost: 0 }
    ],

    // Generate 3 randomized cards for player selection
    draw3Cards() {
        const pool = [...this.CARD_CHOICE_POOL];
        const drawn = [];
        for (let i = 0; i < 3; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            drawn.push(pool.splice(idx, 1)[0]);
        }
        return drawn;
    }
};

if (typeof window !== 'undefined') {
    window.PiratesGodsUpdate = PiratesGodsUpdate;
}
