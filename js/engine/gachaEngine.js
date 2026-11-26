// Pixel Tower Defense — Gacha & Banner Engine
// High-Tier Banner Rates, Pity Counters, VIP Discount, and Character Distributions

const GachaEngine = {
    BASE_MYTHICS: ["shinobi", "thunder_god", "shadow_assassin", "flame_emperor", "holy_knight", "wind_master"],

    _cachedCycleKey: null,
    _cachedBanner: null,

    getRotatedBanner() {
        const cycleKey = window.TimeService && window.TimeService.getBannerHourlyCycleKey ? window.TimeService.getBannerHourlyCycleKey() : (window.TimeService ? window.TimeService.getHourlyCycleKey() : "default_cycle");

        if (this._cachedBanner && this._cachedCycleKey === cycleKey) {
            return this._cachedBanner;
        }

        const banner = this.BANNERS["featured_mythics"];
        const pool = [...this.BASE_MYTHICS];
        const selected = [];
        for (let i = 0; i < 3; i++) {
            const seedVal = window.TimeService ? window.TimeService.seededRandom(cycleKey + "_mythic_slot_" + i) : Math.random();
            const pickIdx = Math.floor(seedVal * pool.length);
            selected.push(pool.splice(pickIdx, 1)[0]);
        }

        banner.leftUnitId = selected[0] || "shinobi";
        banner.middleUnitId = selected[1] || "shadow_assassin";
        banner.rightUnitId = selected[2] || "wind_master";
        banner.featuredUnitIds = [banner.leftUnitId, banner.middleUnitId, banner.rightUnitId];

        this._cachedCycleKey = cycleKey;
        this._cachedBanner = banner;
        return banner;
    },

    BANNERS: {
        "featured_mythics": {
            id: "featured_mythics",
            name: "Featured Mythics Banner",
            featuredUnitIds: ["shinobi", "shadow_assassin", "wind_master"],
            middleUnitId: "shadow_assassin",
            leftUnitId: "shinobi",
            rightUnitId: "wind_master",
            costSingle: 50,
            costMulti: 500,
            badgeRateUp: "RATE UP!!!",
            badgeBonus: "2x Mythic Chance!",
            shinyChance: 1.0,
            rates: {
                "Rare": 70.0,
                "Epic": 25.0,
                "Legendary": 4.499,
                "Mythic": 0.5,
                "Secret": 0.001
            }
        },
        "genesis_event": {
            id: "genesis_event",
            name: "Blood & Flame: Mythic Banner",
            featuredUnitIds: ["vampire_king", "holy_knight", "flame_emperor"],
            middleUnitId: "vampire_king",
            leftUnitId: "holy_knight",
            rightUnitId: "flame_emperor",
            costSingle: 50,
            costMulti: 500,
            badgeRateUp: "SECRET DROP",
            badgeBonus: "Rate Up!",
            shinyChance: 1.0,
            rates: {
                "Rare": 70.0,
                "Epic": 25.0,
                "Legendary": 4.499,
                "Mythic": 0.5,
                "Secret": 0.001
            }
        }
    },

    // Gets actual cost after applying VIP 20% discount (50 -> 40, 500 -> 400)
    getSummonCost(bannerId, count) {
        const isVip = window.SaveService && window.SaveService.state && window.SaveService.state.vip;
        if (count === 10) {
            return isVip ? 400 : 500;
        }
        return isVip ? 40 : 50;
    },

    // Generates exact rate table for all individual characters for the Rate Details modal
    getRateBreakdown(bannerId) {
        const banner = (bannerId === "featured_mythics" && this.getRotatedBanner) ? this.getRotatedBanner() : (this.BANNERS[bannerId] || (this.getRotatedBanner ? this.getRotatedBanner() : this.BANNERS["featured_mythics"]));
        const rawUnits = Object.values(window.UNIT_CONFIG || {});
        const seen = new Set();
        const allUnits = rawUnits.filter(u => {
            if (seen.has(u.id)) return false;
            seen.add(u.id);
            return true;
        });

        const mythicUnits = allUnits.filter(u => u.rarity === "Mythic" && !u.isEvolved);
        const legendaryUnits = allUnits.filter(u => u.rarity === "Legendary" && !u.isEvolved);
        const epicUnits = allUnits.filter(u => u.rarity === "Epic" && !u.isEvolved);
        const rareUnits = allUnits.filter(u => u.rarity === "Rare" && !u.isEvolved);
        const secretUnits = allUnits.filter(u => u.rarity === "Secret" && !u.isEvolved && u.id !== "star_mage");

        // Mythic Breakdown: Featured Middle (50%), Left (20%), Right (20%), Unfeatured (10% shared)
        const mythicRate = banner.rates.Mythic;
        const unfeaturedMythics = mythicUnits.filter(u => !banner.featuredUnitIds.includes(u.id));
        const unfeaturedShare = unfeaturedMythics.length > 0 ? (0.10 / unfeaturedMythics.length) : 0;

        const mythicList = mythicUnits.map(u => {
            let shareOfMythic = 0;
            let note = "Non-featured (Lower Chance)";
            const isMiddle = u.id === banner.middleUnitId;
            const isLeft = u.id === banner.leftUnitId;
            const isRight = u.id === banner.rightUnitId;

            if (isMiddle) {
                shareOfMythic = 0.50;
                note = "Featured (Middle) - 50% of Mythics";
            } else if (isLeft) {
                shareOfMythic = 0.20;
                note = "Featured (Left) - 20% of Mythics";
            } else if (isRight) {
                shareOfMythic = 0.20;
                note = "Featured (Right) - 20% of Mythics";
            } else {
                shareOfMythic = unfeaturedShare;
            }
            const overallRate = mythicRate * shareOfMythic;
            return {
                id: u.id,
                name: u.name,
                rarity: "Mythic",
                note: note,
                relativePercent: (shareOfMythic * 100).toFixed(1) + "%",
                overallPercent: overallRate.toFixed(3) + "%",
                isFeatured: isMiddle || isLeft || isRight || banner.featuredUnitIds.includes(u.id),
                isMiddle: isMiddle,
                isLeft: isLeft,
                isRight: isRight
            };
        });

        // Ensure Middle is first, then Left, then Right, then non-featured
        mythicList.sort((a, b) => {
            const scoreA = a.isMiddle ? 4 : a.isLeft ? 3 : a.isRight ? 2 : 1;
            const scoreB = b.isMiddle ? 4 : b.isLeft ? 3 : b.isRight ? 2 : 1;
            return scoreB - scoreA;
        });

        // Other rarities: split equally across candidate pool
        const makePoolList = (units, poolOverallRate, rarityName) => {
            const count = units.length || 1;
            const perUnitRate = poolOverallRate / count;
            return units.map(u => ({
                id: u.id,
                name: u.name,
                rarity: rarityName,
                relativePercent: (100 / count).toFixed(1) + "%",
                overallPercent: perUnitRate.toFixed(2) + "%",
                isFeatured: banner.featuredUnitIds.includes(u.id)
            }));
        };

        return {
            bannerName: banner.name,
            shinyChance: banner.shinyChance || 1.0,
            rates: banner.rates,
            breakdown: {
                "Mythic": {
                    totalRate: banner.rates.Mythic,
                    units: mythicList
                },
                "Legendary": {
                    totalRate: banner.rates.Legendary,
                    units: makePoolList(legendaryUnits, banner.rates.Legendary, "Legendary")
                },
                "Epic": {
                    totalRate: banner.rates.Epic,
                    units: makePoolList(epicUnits, banner.rates.Epic, "Epic")
                },
                "Rare": {
                    totalRate: banner.rates.Rare,
                    units: makePoolList(rareUnits, banner.rates.Rare, "Rare")
                },
                "Secret": {
                    totalRate: banner.rates.Secret,
                    units: makePoolList(secretUnits, banner.rates.Secret, "Secret")
                }
            }
        };
    },

    // Performs single or multi summon
    summon(bannerId, count = 1, useTicket = false) {
        const banner = this.getRotatedBanner ? this.getRotatedBanner() : (this.BANNERS[bannerId] || this.BANNERS["featured_mythics"]);
        let cost = 0;
        if (useTicket) {
            if (!window.SaveService.spendSummonTickets(1)) {
                return { success: false, message: "No Summon Tickets available!" };
            }
        } else {
            cost = this.getSummonCost(bannerId, count);
            if (!window.SaveService.spendGems(cost)) {
                return { success: false, message: `Insufficient Gems! Need ${cost} Gems.` };
            }
        }

        const state = window.SaveService.state;
        if (!state.gachaPity) state.gachaPity = {};
        if (!state.gachaPity[bannerId]) {
            state.gachaPity[bannerId] = { count: 0, legendaryPity: 0, mythicPity: 0, featuredMiddlePity: 0 };
        }
        const pity = state.gachaPity[bannerId];
        if (pity.featuredMiddlePity === undefined) pity.featuredMiddlePity = 0;

        const results = [];

        for (let i = 0; i < count; i++) {
            pity.count++;
            pity.legendaryPity++;
            pity.mythicPity++;
            pity.featuredMiddlePity++;

            // Determine Rarity with pity
            let pulledRarity = "Rare";

            if (pity.featuredMiddlePity >= 400) {
                // Guaranteed Middle Featured Mythic!
                pulledRarity = "Mythic";
                pity.mythicPity = 0;
            } else if (pity.mythicPity >= 100) {
                pulledRarity = "Mythic";
                pity.mythicPity = 0;
            } else if (pity.legendaryPity >= 50) {
                pulledRarity = "Legendary";
                pity.legendaryPity = 0;
            } else {
                // Roll RNG with Luck Potion check (+25% banner luck on Secret and Mythic)
                const hasLuckPotion = state.luckPotionUntil && Date.now() < state.luckPotionUntil;
                const luckMultiplier = hasLuckPotion ? 1.25 : 1.0;
                const secretRate = banner.rates.Secret * luckMultiplier;
                const mythicRate = banner.rates.Mythic * luckMultiplier;
                const legendaryRate = banner.rates.Legendary;
                const epicRate = banner.rates.Epic;

                const roll = Math.random() * 100;
                let cum = 0;

                if (roll <= (cum += secretRate)) {
                    pulledRarity = "Secret";
                } else if (roll <= (cum += mythicRate)) {
                    pulledRarity = "Mythic";
                    pity.mythicPity = 0;
                } else if (roll <= (cum += legendaryRate)) {
                    pulledRarity = "Legendary";
                    pity.legendaryPity = 0;
                } else if (roll <= (cum += epicRate)) {
                    pulledRarity = "Epic";
                } else {
                    pulledRarity = "Rare";
                }
            }

            // Pick unit of that rarity (excluding evolved forms and event-exclusive Secret Star Mage from gacha pool)
            const candidateUnits = Object.values(window.UNIT_CONFIG).filter(u => u.rarity === pulledRarity && !u.isEvolved && u.id !== "star_mage");
            let chosenUnit = candidateUnits[0];

            if (pulledRarity === "Mythic") {
                if (pity.featuredMiddlePity >= 400) {
                    chosenUnit = window.UNIT_CONFIG[banner.middleUnitId] || candidateUnits[0];
                    pity.featuredMiddlePity = 0;
                } else {
                    const mRoll = Math.random() * 100;
                    if (mRoll < 50 && window.UNIT_CONFIG[banner.middleUnitId]) {
                        chosenUnit = window.UNIT_CONFIG[banner.middleUnitId];
                        pity.featuredMiddlePity = 0;
                    } else if (mRoll < 70 && window.UNIT_CONFIG[banner.leftUnitId]) {
                        chosenUnit = window.UNIT_CONFIG[banner.leftUnitId];
                    } else if (mRoll < 90 && window.UNIT_CONFIG[banner.rightUnitId]) {
                        chosenUnit = window.UNIT_CONFIG[banner.rightUnitId];
                    } else {
                        const unfeatured = candidateUnits.filter(u => !banner.featuredUnitIds.includes(u.id));
                        if (unfeatured.length > 0) {
                            chosenUnit = unfeatured[Math.floor(Math.random() * unfeatured.length)];
                        } else {
                            chosenUnit = candidateUnits[Math.floor(Math.random() * candidateUnits.length)];
                        }
                    }
                }
            } else if (candidateUnits.length > 1) {
                const featuredMatch = candidateUnits.find(u => banner.featuredUnitIds.includes(u.id));
                if (featuredMatch && Math.random() < 0.50) {
                    chosenUnit = featuredMatch;
                } else {
                    const randIdx = Math.floor(Math.random() * candidateUnits.length);
                    chosenUnit = candidateUnits[randIdx];
                }
            }

            // Shiny chance (1% standard, 3% with Shiny Hunter Game Pass)
            const hasShinyHunter = state.gamepasses && state.gamepasses.shinyHunter;
            const effectiveShinyRate = hasShinyHunter ? 3.0 : (banner.shinyChance || 1.0);
            const isShiny = Math.random() * 100 <= effectiveShinyRate;

            // Starting trait chance: strictly 2% chance to obtain ANY trait on summon
            let initialTrait = null;
            if (Math.random() < 0.02 && window.TraitEngine) {
                initialTrait = window.TraitEngine.rollTrait();
            }

            // Check Auto-Sell Settings
            const settings = (window.SaveService && window.SaveService.state && window.SaveService.state.settings) || {};
            let isAutoSold = false;
            let goldEarned = 0;

            if (chosenUnit.rarity === "Rare" && settings.autoSellRare) {
                isAutoSold = true;
                goldEarned = 100;
            } else if (chosenUnit.rarity === "Epic" && settings.autoSellEpic) {
                isAutoSold = true;
                goldEarned = 300;
            } else if (chosenUnit.rarity === "Legendary" && settings.autoSellLegendary) {
                isAutoSold = true;
                goldEarned = 1000;
            }

            let instance = null;
            if (isAutoSold) {
                window.SaveService.addGold(goldEarned);
            } else {
                // Add unit to persistent inventory
                instance = window.SaveService.addUnit(chosenUnit.id, chosenUnit.rarity, initialTrait);
                if (isShiny && instance) {
                    instance.shiny = true;
                }
            }

            // Unlock in Unit Index!
            if (window.SaveService.unlockUnitIndex) {
                window.SaveService.unlockUnitIndex(chosenUnit.id);
            }

            results.push({
                instanceId: instance ? instance.id : null,
                unitId: chosenUnit.id,
                name: chosenUnit.name,
                rarity: chosenUnit.rarity,
                damageType: chosenUnit.damageType,
                element: chosenUnit.element,
                placement: chosenUnit.placement,
                hasSoaring: chosenUnit.hasSoaring,
                isShiny: isShiny,
                trait: initialTrait,
                config: chosenUnit,
                isAutoSold: isAutoSold,
                goldEarned: goldEarned
            });
        }

        window.SaveService.save();

        return {
            success: true,
            results: results,
            costPaid: cost,
            remainingGems: state.gems,
            pity: pity
        };
    }
};

if (typeof window !== 'undefined') {
    window.GachaEngine = GachaEngine;
}