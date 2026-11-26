// TD — In-Game Intelligent Game Guide (No Emojis, Exact Math, Dynamic Lookup)

const AIChatbot = {
    history: [],
    pendingQuery: null,

    // Token check helper
    hasWord(text, word) {
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(text);
    },

    // Fuzzy phrase check helper
    hasAny(text, list) {
        const lower = text.toLowerCase();
        for (const item of list) {
            if (item.includes(" ")) {
                if (lower.includes(item.toLowerCase())) return true;
            } else {
                if (this.hasWord(lower, item.toLowerCase())) return true;
            }
        }
        return false;
    },

    // Check if input is incomplete or hanging
    isIncomplete(text) {
        if (!text) return true;
        const trimmed = text.trim();
        if (trimmed.length < 2) return true;

        if (/\.{2,}$/.test(trimmed)) return true;

        const hangingWords = [
            "about", "for", "with", "the", "a", "an", "and", "or", "to", "in", "of",
            "is", "are", "what", "how", "who", "can", "if", "when", "where", "does",
            "will", "like", "so", "because", "tell me", "give me", "which", "my", "your"
        ];
        const lower = trimmed.toLowerCase();
        for (const word of hangingWords) {
            const regex = new RegExp(`\\b${word}$`, "i");
            if (regex.test(lower)) return true;
        }

        return false;
    },

    getRandomGreeting(topic) {
        const greetings = [
            `Got you covered on ${topic}!`,
            `Looking up the exact game data for ${topic} right now.`,
            `Here is the complete breakdown on ${topic}.`,
            `Checking the balance sheet and wiki for ${topic}.`,
            `Here are the exact numbers and details on ${topic}.`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    },

    getRandomCloser() {
        const closers = [
            "Let me know if you want to know anything else!",
            "You can also ask me about star fruits, evolutions, codes, or stages anytime.",
            "Feel free to test them out in battle to see how they perform!",
            "Need more tips or stats? Just ask!",
            "Let me know if you want the breakdown on any other unit or mode!"
        ];
        return closers[Math.floor(Math.random() * closers.length)];
    },

    // Main query solver
    ask(rawQuery) {
        let query = (rawQuery || "").trim();
        if (!query) return null;

        this.history.push({
            role: "user",
            text: query
        });

        if (this.pendingQuery) {
            query = (this.pendingQuery + " " + query).trim();
            this.pendingQuery = null;
        } else if (this.isIncomplete(query)) {
            this.pendingQuery = query;
            const followUps = [
                "It looks like your question cut off at the end! What were you going to ask about?",
                "Did your message cut off early? Tell me the rest of your question and I will look it up right away!",
                "It seems you did not finish your sentence. Go ahead and continue your thought, I am listening!",
                "Looks like that message was incomplete! Finish what you were asking and I will check the stats."
            ];
            const botReply = {
                role: "assistant",
                text: followUps[Math.floor(Math.random() * followUps.length)],
                links: []
            };
            this.history.push(botReply);
            return botReply;
        }

        const clean = query.toLowerCase();

        // ----------------------------------------------------
        // 1. PROMO CODES
        // ----------------------------------------------------
        if (this.hasAny(clean, ["code", "codes", "promo", "promos", "redeem", "free gems", "gift code", "active code", "active codes", "sorryforbugs", "td2026", "ptd2026", "release"])) {
            const reply = this.getPromoCodesResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 2. STORY STAGES & ACT DROPS (e.g. "what do i get from storyy act 1??")
        // ----------------------------------------------------
        if (
            this.hasAny(clean, ["story", "storyy", "stroy", "stori", "plains", "stage drop", "stage drops", "story drop", "story drops"]) ||
            (clean.includes("act") && (clean.includes("get") || clean.includes("drop") || clean.includes("reward") || clean.includes("give") || clean.includes("from"))) ||
            (clean.includes("what") && clean.includes("get") && (clean.includes("act") || clean.includes("stage") || clean.includes("story") || clean.includes("from")))
        ) {
            const reply = this.getStoryDropResponse(clean);
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 3. STAR FRUITS (Only types and obtainment, no unit uses)
        // ----------------------------------------------------
        if (this.hasAny(clean, [
            "star fruit", "star fruits", "starfruit", "starfruits", "fruit", "fruits",
            "rainbow star", "rainbow fruit", "pink star", "pink fruit",
            "yellow star", "yellow fruit", "green star", "green fruit",
            "blue star", "blue fruit", "red star", "red fruit"
        ])) {
            const reply = this.getStarFruitResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 4. FOOD & UNIT LEVELING (EXP)
        // ----------------------------------------------------
        if (this.hasAny(clean, [
            "food", "foods", "feed", "feeding", "level up", "leveling", "level units",
            "rice ball", "dorayaki", "ramen", "dragon ramen", "bento", "king's feast"
        ]) || (this.hasWord(clean, "exp") && !this.hasWord(clean, "account"))) {
            const reply = this.getFoodAndExpResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 5. EVOLUTION RECIPES & ALTAR (General explanation)
        // ----------------------------------------------------
        if (this.hasAny(clean, ["evolve", "evolution", "evolutions", "awaken", "awakening", "recipe", "recipes", "altar"])) {
            const reply = this.getEvolutionResponse(clean);
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 6. DROPS & LEGEND STAGES (Daggers, Scrolls, Blazes, Light Energy)
        // ----------------------------------------------------
        if (this.hasAny(clean, [
            "dagger", "daggers", "scroll", "scrolls", "blaze", "blazes", "light energy",
            "drop", "drops", "material", "materials", "relic shard", "legend stage", "legend stages"
        ]) || (clean.includes("where") && (clean.includes("get") || clean.includes("find")))) {
            const reply = this.getLegendResponse(clean);
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 7. CRAFTING WORKSHOP & RELICS
        // ----------------------------------------------------
        if (this.hasAny(clean, ["craft", "crafting", "workshop", "relic", "relics", "shadow dagger", "star staff"])) {
            const reply = this.getCraftingResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 8. FARM UNITS (ECONOMY)
        // ----------------------------------------------------
        if (this.hasAny(clean, ["banker", "alchemist", "silver banker", "gold alchemist", "farm", "farming", "yen", "cash", "money", "speedwagon", "bulma", "economy"])) {
            const reply = this.getFarmResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 9. TRAITS & TRAIT ALTAR (Using custom SVG designs, NO emojis)
        // ----------------------------------------------------
        if (this.hasAny(clean, [
            "trait", "traits", "reroll", "rerolls", "trait rr", "unique", "celestial",
            "divine", "eternal", "adept", "superior", "godspeed", "culling", "reaper", "nimble", "fortune"
        ])) {
            const reply = this.getTraitResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 10. GEMS & FARMING GEMS
        // ----------------------------------------------------
        if (this.hasWord(clean, "gem") || this.hasWord(clean, "gems")) {
            const reply = this.getGemResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 11. HARDEST STAGE / EVENT
        // ----------------------------------------------------
        if (this.hasAny(clean, ["hardest", "hard stage", "toughest", "most difficult", "boss stage", "demon lord", "malakor"])) {
            const reply = this.getHardestStageResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 12. TIER LIST / BEST UNITS / META
        // ----------------------------------------------------
        if (this.hasAny(clean, [
            "tier", "tier list", "tierlist", "ranking", "rankings", "rank",
            "best unit", "best units", "strongest unit", "strongest units",
            "meta", "meta units", "who to use", "who is the best", "top units"
        ])) {
            const reply = this.getTierListResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 13. SPECIFIC UNIT LOOKUP
        // ----------------------------------------------------
        const unit = this.findUnitByName(clean);
        if (unit) {
            const reply = this.getDynamicUnitResponse(unit);
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 14. FALLBACK WITH ACCURATE TIPS
        // ----------------------------------------------------
        const reply = {
            role: "assistant",
            text: `I am your TD game guide! I can look up live game stats, evolutions, star fruits, traits, food leveling, promo codes, farm units, or story drops.

Try asking me:
• "What are star fruits and where do I get them?"
• "How does unit evolution work?"
• "What do I get from story act 1?"
• "What are the active promo codes?"
• "How does food work to level up units?"
• "Where do Daggers drop?"
• "How do Silver Banker and Gold Alchemist work?"
• "What are the trait reroll rates?"
• "Who are the best units in the tier list?"

${this.getRandomCloser()}`,
            links: [
                { label: "Open Wiki", tab: "wiki" },
                { label: "Evolution Altar", tab: "evolution" },
                { label: "Redeem Codes", tab: "codes" },
                { label: "Play Battle", tab: "battle" }
            ]
        };
        this.history.push(reply);
        return reply;
    },

    // ----------------------------------------------------
    // PROMO CODES
    // ----------------------------------------------------
    getPromoCodesResponse() {
        let customList = "";
        if (typeof window !== "undefined" && window.SaveService && window.SaveService.getCustomPromoCodes) {
            const customCodes = window.SaveService.getCustomPromoCodes();
            for (const [code, data] of Object.entries(customCodes)) {
                const parts = [];
                if (data.gems) parts.push(`<b>${data.gems.toLocaleString()} Gems</b>`);
                if (data.gold) parts.push(`<b>${data.gold.toLocaleString()} Gold</b>`);
                if (data.traitRerolls) parts.push(`<b>${data.traitRerolls} Trait RR</b>`);
                if (data.starFruits) {
                    for (const [fId, qty] of Object.entries(data.starFruits)) {
                        parts.push(`<b>${qty}x ${fId.replace(/_/g, ' ')}</b>`);
                    }
                }
                if (data.materials) {
                    for (const [mId, qty] of Object.entries(data.materials)) {
                        parts.push(`<b>${qty}x ${mId.replace(/_/g, ' ')}</b>`);
                    }
                }
                customList += `\n• <b>${code}</b> : ${parts.join(" + ")}`;
            }
        }

        return {
            role: "assistant",
            text: `${this.getRandomGreeting("active promo codes")}

Here are all active working codes right now:
• <b>SORRYFORBUGS</b> : <b>2,500 Gems</b> + <b>25 Trait RR</b> tokens!
• <b>TD2026</b> : <b>1,000 Gems</b> + <b>10 Trait RR</b> tokens!
• <b>RELEASE</b> : <b>500 Gems</b> + <b>5 Trait RR</b> tokens!
• <b>EVOLUTION</b> : <b>10,000 Gold</b> + <b>1 Rainbow Star Fruit</b> + <b>3 Blue Star Fruits</b> + <b>3 Pink Star Fruits</b>!${customList}

Head over to the Codes tab in the top bar to claim your rewards! Note that each code can be redeemed once per account.

${this.getRandomCloser()}`,
            links: [{ label: "Open Codes Tab", tab: "codes" }]
        };
    },

    // ----------------------------------------------------
    // STORY STAGE DROPS & ACT REWARDS
    // ----------------------------------------------------
    getStoryDropResponse(clean) {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("Story stage drops and rewards")}

Here is the exact breakdown of what you receive from clearing Story stages (such as Plains Acts 1 to 6):

<b>Guaranteed Drops & Clear Rewards:</b>
• <b>Guaranteed Food Drops</b>: Every cleared Story stage drops <b>1 to 8 random Food items</b> (Rice Balls, Dorayaki, King's Feast Bento, or Dragon Ramen) to feed and level up your units!
• <b>First-Clear Gems</b>:
  - <b>Normal Mode</b>: Grants <b>50 to 90 Gems</b> on your first stage clear!
  - <b>Hard Mode</b>: Grants <b>100 to 180 Gems</b> on your first stage clear!
• <b>Repeat Clear Gems</b>: Subsequent clears award <b>10 to 25 Gems</b> per victory!
• <b>Account Player EXP</b>: Grants <b>+80 EXP</b> (Normal) or <b>+150 EXP</b> (Hard) towards your Commander level!
• <b>Unit Battle EXP</b>: All units equipped in your team earn battle EXP directly from fighting!
• <b>In-Match Bounty Yen</b>: Defeating enemies earns Yen to purchase tower upgrades during battle!

If you are looking for Evolution Materials (Light Energy, Blazes, Daggers, and Element Scrolls), those drop exclusively from <b>Legend Stages</b> in Hills and Mountains!

${this.getRandomCloser()}`,
            links: [
                { label: "Play Story Mode", tab: "battle" },
                { label: "View Quests", tab: "quests" },
                { label: "Open Units", tab: "units" }
            ]
        };
    },

    // ----------------------------------------------------
    // STAR FRUITS (Types & Obtainment Only)
    // ----------------------------------------------------
    getStarFruitResponse() {
        const getFruitIcon = (id) => {
            if (typeof window !== "undefined" && window.PixelSprites) {
                const src = window.PixelSprites.getStarFruit ? window.PixelSprites.getStarFruit(id, 20) : (window.PixelSprites.getStarFruitIcon ? window.PixelSprites.getStarFruitIcon(id, 20) : "");
                if (src && src.startsWith("data:")) {
                    return `<img src="${src}" style="width:20px;height:20px;vertical-align:middle;display:inline-block;object-fit:contain;">`;
                }
                return src;
            }
            return "";
        };

        return {
            role: "assistant",
            text: `${this.getRandomGreeting("Star Fruits")}

<b>Star Fruits</b> are essential awakening and evolution materials in Tower Defense:

<b>Star Fruit Types:</b>
• ${getFruitIcon("rainbow_star_fruit")} <b>Rainbow Star Fruit</b> (Supreme Evolution Material)
• ${getFruitIcon("red_star_fruit")} <b>Red Star Fruit</b> (Evolution Material)
• ${getFruitIcon("blue_star_fruit")} <b>Blue Star Fruit</b> (Evolution Material)
• ${getFruitIcon("green_star_fruit")} <b>Green Star Fruit</b> (Evolution Material)
• ${getFruitIcon("yellow_star_fruit")} <b>Yellow Star Fruit</b> (Evolution Material)
• ${getFruitIcon("purple_star_fruit")} <b>Purple Star Fruit</b> (Evolution Material)
• ${getFruitIcon("pink_star_fruit")} <b>Pink Star Fruit</b> (Evolution Material)

<b>Where to Obtain Star Fruits:</b>
1. <b>Gem Shop Daily Rotation</b>: Colored Star Fruits cost <b>50 Gems</b> each (max 3 per color daily). Rainbow Star Fruit costs <b>350 Gems</b> (max 1 daily). Stock resets daily!
2. <b>Crafting Workshop (Fruit Alchemy)</b>: Fuse 1 of each colored Star Fruit (Pink, Red, Green, Blue, Yellow) into <b>1 Rainbow Star Fruit</b>!
3. <b>Daily & Half-Hourly Challenges</b>: Guaranteed Star Fruit packs on stage victory!
4. <b>Infinite Mode</b>: Random Star Fruit drops upon reaching high waves!

${this.getRandomCloser()}`,
            links: [
                { label: "Gem Shop", tab: "gemshop" },
                { label: "Crafting Workshop", tab: "crafting" },
                { label: "Evolution Altar", tab: "evolution" }
            ]
        };
    },

    // ----------------------------------------------------
    // FOOD & UNIT LEVELING (EXP)
    // ----------------------------------------------------
    getFoodAndExpResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("food and unit leveling")}

Units level up from Level 1 to 100, gaining compounded damage as they level up!

<b>Food Items in the Gold Shop:</b>
• <b>Rice Ball</b>: 150 Gold ➔ <b>+50 Unit EXP</b>
• <b>Dorayaki</b>: 500 Gold ➔ <b>+200 Unit EXP</b>
• <b>King's Feast (Bento)</b>: 1,800 Gold ➔ <b>+800 Unit EXP</b>
• <b>Dragon Ramen</b>: 6,000 Gold ➔ <b>+3,000 Unit EXP</b>

<b>How to Earn EXP:</b>
1. <b>Feeding Food</b>: Open Inventory / Units tab, select a unit, and click Feed!
2. <b>Playing Story Stages</b>: Clearing Story Acts automatically grants EXP to all units equipped in your loadout!
3. <b>Infinite Mode</b>: Enemies drop food items every wave!
4. <b>Adept Trait</b>: Units rolled with the Adept trait gain <b>+50% more EXP</b> from both battles and food!

${this.getRandomCloser()}`,
            links: [
                { label: "Open Gold Shop", tab: "shop" },
                { label: "Open Units Inventory", tab: "units" }
            ]
        };
    },

    // ----------------------------------------------------
    // EVOLUTIONS (General Explanation)
    // ----------------------------------------------------
    getEvolutionResponse(clean) {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("unit evolution")}

<b>Unit Evolution</b> permanently ascends your heroes into their ultimate Awakened forms:

<b>What Evolution Does:</b>
• <b>Massive Stat Increases</b>: Significantly boosts base damage, attack range, and lowers SPA so units strike faster!
• <b>Unlocks Extra Passives & Skills</b>: Grants game-changing new passives, elemental burns, shields, or destructive active abilities!
• <b>Awakened Appearance</b>: Upgrades your unit with vibrant awakened visual models, animated elemental auras, and custom particle VFX!
• <b>High-Tier Scaling</b>: Allows units to reach their maximum combat potential to conquer Legend and Infinite stages!

<b>How to Evolve:</b>
1. Level up your unit through battle or feeding food items.
2. Collect the required Star Fruits (always requires 1 Rainbow Star Fruit plus specific colored Star Fruits) and Gold or evolution materials.
3. Open the <b>Evolution Altar</b> in the top navigation bar, select your eligible unit, and awaken them!

${this.getRandomCloser()}`,
            links: [
                { label: "Evolution Altar", tab: "evolution" },
                { label: "Crafting Workshop", tab: "crafting" },
                { label: "Gem Shop", tab: "gemshop" }
            ]
        };
    },

    // ----------------------------------------------------
    // DROPS & LEGEND STAGES
    // ----------------------------------------------------
    getLegendResponse(clean) {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("item drops and Legend Stages")}

Here is where all evolution materials and crafting catalysts drop:

<b>Hills Legend Stages (World 2):</b>
• <b>Light Energy</b>: Guaranteed drop from <b>Hills Legend Act 1</b> (1-3 per run). Evolves Holy Knight!
• <b>Blaze</b>: Guaranteed drop from <b>Hills Legend Act 2</b> (1-3 per run). Evolves Flame Emperor!
• <b>Dagger</b>: Guaranteed drop from <b>Hills Legend Act 3</b> (1-3 per run). Required to forge the Shadow Dagger!
• <b>Relic Shard</b>: 10% bonus drop chance from <b>Hills Legend Act 3</b>! Used in Crafting for permanent relics.

<b>Mountains Legend Stages (World 3):</b>
• <b>Fire Scroll</b>: Guaranteed 5 to 10 scrolls from <b>Mountain Legend Act 1</b>!
• <b>Water Scroll</b>: Guaranteed 5 to 10 scrolls from <b>Mountain Legend Act 2</b>!
• <b>Nature Scroll</b>: Guaranteed 5 to 10 scrolls from <b>Mountain Legend Act 3</b>!
*(All 3 scroll types are required to awaken Shinobi into Shinobi (God)!)*

${this.getRandomCloser()}`,
            links: [
                { label: "Play Legend Stages", tab: "battle" },
                { label: "Open Crafting", tab: "crafting" }
            ]
        };
    },

    // ----------------------------------------------------
    // CRAFTING WORKSHOP
    // ----------------------------------------------------
    getCraftingResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("Crafting Workshop")}

The <b>Crafting Workshop</b> allows you to forge evolution catalysts, fuse star fruits, and build permanent team relics:

• <b>Shadow Dagger</b> (Evolves Shadow Assassin):
  - 12 Daggers (from Hills Legend Act 3)
  - 1 Rainbow Star Fruit
  - 3 Pink Star Fruits
  - 3 Blue Star Fruits
• <b>Star Staff</b> (Evolves Star Mage):
  - 2 Rainbow Star Fruits
  - 5 Pink Star Fruits
  - 5 Blue Star Fruits
  - 5 Yellow Star Fruits
• <b>Star Fruit Alchemy (Fusion)</b>:
  - Combine 1 of each color (Pink, Red, Green, Blue, Yellow) into <b>1 Rainbow Star Fruit</b>!
• <b>Permanent Relics</b>:
  - Forge powerful relics using Relic Shards dropped from Hills Legend Act 3 to buff your entire team!

${this.getRandomCloser()}`,
            links: [
                { label: "Open Crafting Workshop", tab: "crafting" },
                { label: "Evolution Altar", tab: "evolution" }
            ]
        };
    },

    // ----------------------------------------------------
    // FARM UNITS
    // ----------------------------------------------------
    getFarmResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("farm units")}

Here is how our two economy farm units work in combat:

1. <b>Silver Banker</b> [Epic]:
• <b>Placement Limit</b>: Max 3 on the field.
• <b>Base Payout</b>: 200 Yen/wave (Base Cost: 400 Yen)
• <b>Upgrade Payouts</b>:
  - Up 1: 350 Yen/wave (Cost: 650 Yen)
  - Up 2: 550 Yen/wave (Cost: 1,100 Yen)
  - Up 3: 850 Yen/wave (Cost: 1,800 Yen)
  - Up 4: 1,300 Yen/wave (Cost: 2,800 Yen)
  - Up 5: 1,850 Yen/wave (Cost: 4,200 Yen)
  - Up 6 (Max): <b>2,500 Yen/wave</b> (Cost: 6,000 Yen)
*(With 3 placed at max upgrade, you get a massive 7,500 Yen every wave!)*

2. <b>Gold Alchemist</b> [Legendary]:
• <b>Placement Limit</b>: Strictly 1 on the field.
• <b>Base Payout</b>: 250 Yen/wave (Base Cost: 800 Yen)
• <b>Max Upgrade Payout</b>: <b>10,000 Yen/wave</b> across 8 upgrades!
*(Ideal for funding expensive high-damage Mythic upgrades!)*

${this.getRandomCloser()}`,
            links: [
                { label: "View Units", tab: "units" },
                { label: "Open Wiki", tab: "wiki" }
            ]
        };
    },

    // ----------------------------------------------------
    // TRAITS & TRAIT ALTAR (Using custom SVG designs, NO emojis)
    // ----------------------------------------------------
    getTraitResponse() {
        const getIcon = (name) => {
            if (typeof window !== "undefined" && window.PixelSprites && window.PixelSprites.getTraitIcon) {
                return window.PixelSprites.getTraitIcon(name, 18);
            }
            return "";
        };

        return {
            role: "assistant",
            text: `${this.getRandomGreeting("traits and the Trait Altar")}

Traits grant permanent stat bonuses to your units. Rerolling consumes 1 Trait RR token:

<b>Complete Trait Breakdown & Exact Probabilities:</b>
• ${getIcon("Unique")} <b>Unique</b> (0.10%): <b>+300% Damage</b>, -10% SPA, +10% Range (Max 1 unit placement)
• ${getIcon("Eternal")} <b>Eternal</b> (0.25%): <b>+50% Damage</b>, -10% SPA, +20% Range
• ${getIcon("Divine")} <b>Divine</b> (0.50%): <b>+20% Damage</b>, -10% SPA, +20% Range
• ${getIcon("Celestial")} <b>Celestial</b> (1.00%): <b>+10% Damage</b>, +10% Range
• ${getIcon("Reaper")} <b>Reaper</b> (2.00%): <b>+15% Damage</b>, <b>+25% vs Bosses</b>
• ${getIcon("Godspeed")} <b>Godspeed</b> (2.00%): <b>-20% SPA</b> (Attacks 20% faster!)
• ${getIcon("Superior III")} <b>Superior III</b> (4.00%): +15% Damage | ${getIcon("Superior II")} <b>Superior II</b> (8.50%): +10% Damage | ${getIcon("Superior I")} <b>Superior I</b> (12.50%): +5% Damage
• ${getIcon("Nimble III")} <b>Nimble III</b> (4.00%): -15% SPA | ${getIcon("Nimble II")} <b>Nimble II</b> (8.50%): -10% SPA | ${getIcon("Nimble I")} <b>Nimble I</b> (12.50%): -5% SPA
• ${getIcon("Range III")} <b>Range III</b> (4.00%): +15% Range | ${getIcon("Range II")} <b>Range II</b> (8.50%): +10% Range | ${getIcon("Range I")} <b>Range I</b> (12.50%): +5% Range
• ${getIcon("Culling")} <b>Culling</b> (5.00%): +20% Damage against enemies under 30% HP
• ${getIcon("Adept")} <b>Adept</b> (7.39%): <b>+50% Unit EXP gained</b>
• ${getIcon("Fortune")} <b>Fortune</b> (7.50%): <b>+20% Income for farm units</b>

You can earn Trait RR tokens from Daily Challenges (25 RRs), Half-Hourly Challenges (3 RRs), and promo codes!

${this.getRandomCloser()}`,
            links: [
                { label: "Open Trait Altar", tab: "traits" },
                { label: "Open Wiki Traits", tab: "wiki" }
            ]
        };
    },

    // ----------------------------------------------------
    // GEMS
    // ----------------------------------------------------
    getGemResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("farming gems")}

Here are the best ways to earn Gems fast:
1. <b>Story Stage First Clears</b>: 50-90 Gems (Normal) and 100-180 Gems (Hard)!
2. <b>Daily Challenges</b>: 100-300 Gems on full completion!
3. <b>Half-Hourly Challenges</b>: 40-75 Gems every 30 minutes!
4. <b>Promo Codes</b>: Redeem active codes like <b>SORRYFORBUGS</b> (2,500 Gems), <b>TD2026</b> (1,000 Gems), and <b>RELEASE</b> (500 Gems)!
5. <b>Infinite Mode</b>: Tier rewards every 5 waves (+35 to +800 Gems)!
6. <b>Unit & Enemy Index</b>: Claim 30 Gems for every registered unit and enemy!

${this.getRandomCloser()}`,
            links: [
                { label: "Play Battle", tab: "battle" },
                { label: "Redeem Codes", tab: "codes" },
                { label: "Open Quests", tab: "quests" }
            ]
        };
    },

    // ----------------------------------------------------
    // HARDEST STAGE
    // ----------------------------------------------------
    getHardestStageResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("the hardest stages")}

The current toughest challenges in the game are:
1. <b>Infinite Mode (Wave 50+)</b>: Colossus bosses with escalating HP and flying enemy swarms!
2. <b>Mountain Legend Act 3</b>: High wave density requiring strong AoE damage to survive.
3. <b>Daily Challenge (Hard)</b>: 30 waves of boosted speed enemies!

Recommended units to beat them: Shinobi (God) for burn and meteor burst, Thunder God for chain shock crowd control, and Vampire King for single-target boss DPS!

${this.getRandomCloser()}`,
            links: [
                { label: "Play Battle", tab: "battle" },
                { label: "Open Wiki Tier List", tab: "wiki" }
            ]
        };
    },

    // ----------------------------------------------------
    // TIER LIST & BEST UNITS
    // ----------------------------------------------------
    getTierListResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("the meta Tier List")}

Here is the current official meta ranking:

<b>SS+ Tier (Absolute Meta):</b>
• <b>Shinobi (God)</b>: Top all-around Mythic. Black Flames Burn (100% of damage over 3s) + 350% burst Heavenly Meteor active strike!
• <b>Vampire King</b>: Premier Secret boss killer. High single-target DPS + summons allied minions!

<b>S Tier (Top Tier Powerhouses):</b>
• <b>Thunder God (Divine)</b>: Divine Chain Lightning hitting up to 4 targets with 25% falloff per jump!
• <b>Star Mage (Explosion)</b>: Massive Circle AoE with Cosmic Beam and stellar execution!
• <b>Shadow Assassin (Awakened)</b>: Extremely fast 1.0s SPA with Endless Hunt kill stacks!

<b>A Tier (Strong High-Impact):</b>
• <b>Flame Emperor (Ruler)</b>: Full map burn tick damage and Scorched Earth!
• <b>Wind Master (Tornado)</b>: Tempest vortex currents that slow and pull enemy mobs!
• <b>Holy Knight (Power)</b>: High burst holy smite!

<b>Economy Tier (Essential Support):</b>
• <b>Gold Alchemist</b>: Max 10,000 Yen/wave.
• <b>Silver Banker</b>: 2,500 Yen/wave (x3 max = 7,500 Yen/wave).

${this.getRandomCloser()}`,
            links: [
                { label: "Open Wiki Tier List", tab: "wiki" },
                { label: "DPS Calculator", tab: "wiki" }
            ]
        };
    },

    // ----------------------------------------------------
    // SPECIFIC UNIT DYNAMIC LOOKUP
    // ----------------------------------------------------
    findUnitByName(clean) {
        if (!window.UNIT_CONFIG) return null;
        for (const [id, u] of Object.entries(window.UNIT_CONFIG)) {
            const uName = u.name.toLowerCase();
            if (clean.includes(uName)) return u;
            if (clean.includes(id.toLowerCase())) return u;
        }
        return null;
    },

    getDynamicUnitResponse(unit) {
        const upgs = unit.upgrades || [];
        const maxUpg = upgs.length > 0 ? upgs[upgs.length - 1] : { damage: unit.baseDamage, spa: unit.baseSpa, range: unit.baseRange };
        const rawDps = maxUpg.spa > 0 ? (maxUpg.damage / maxUpg.spa).toFixed(1) : "N/A";

        return {
            role: "assistant",
            text: `${this.getRandomGreeting(unit.name)}

<b>${unit.name}</b> [${unit.rarity}]:
• <b>Placement</b>: ${unit.placement || "Ground"} ${unit.hasSoaring ? "(Soaring Capable)" : ""}
• <b>Element / Damage</b>: ${unit.element || "None"} / ${unit.damageType || "Physical"}
• <b>Base Cost</b>: ${unit.baseCost || 400} Yen
• <b>Attack Shape</b>: ${unit.attackShape || unit.attackType || "Single Target"}
• <b>Max Upgrades</b>: ${upgs.length} Upgrades
• <b>Max Upgrade Stats</b>: ${maxUpg.damage} Damage, ${maxUpg.spa}s SPA, ${maxUpg.range} Range (~${rawDps} Raw DPS at Lv.1)

${unit.passives && unit.passives.length > 0 ? `<b>Passives:</b>\n` + unit.passives.map(p => `• <b>${p.name}</b>: ${p.desc || p.description}`).join("\n") : `<i>No special passives (Standard unit).</i>`}

${this.getRandomCloser()}`,
            links: [
                { label: `Inspect in Wiki`, tab: "wiki" },
                { label: "DPS Calculator", tab: "wiki" }
            ]
        };
    }
};

if (typeof window !== "undefined") {
    window.AIChatbot = AIChatbot;
}
