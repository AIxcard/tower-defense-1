// Pixel Tower Defense — Advanced In-Game AI Chatbot Assistant Engine
// Accurate, zero-false-positive game guide with live game database lookups,
// strict keyword and token matching, and comprehensive guides.

const AIChatbot = {
    pendingQuery: null,
    history: [
        {
            role: "assistant",
            text: "Hey! I am your AI game guide. Ask me anything about unit stats, evolutions, star fruits, traits, food leveling, promo codes, farm towers, secret drops, or stage strategies and I will give you the exact details!",
            links: [
                { label: "⚔️ Play Challenges", tab: "challenges" },
                { label: "🧬 Evolution Altar", tab: "evolution" },
                { label: "🎁 Redeem Codes", tab: "codes" },
                { label: "📚 Open Wiki", tab: "wiki" }
            ]
        }
    ],

    // Exact word boundary matcher: \bword\b
    hasWord(text, word) {
        if (!text || !word) return false;
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(text);
    },

    // Checks if any phrase or word in list is contained in text
    hasAny(text, list) {
        if (!text || !list || !list.length) return false;
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
        if (this.hasAny(clean, ["code", "codes", "promo", "promos", "redeem", "free gems", "gift code", "active code", "active codes", "sorryforbugs", "td2026", "ptd2026"])) {
            const reply = this.getPromoCodesResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 2. STAR FRUITS
        // ----------------------------------------------------
        if (this.hasAny(clean, [
            "star fruit", "star fruits", "starfruit", "starfruits", "fruit", "fruits",
            "rainbow star", "rainbow fruit", "pink star", "pink fruit",
            "yellow star", "yellow fruit", "green star", "green fruit",
            "blue star", "blue fruit", "red star", "red fruit"
        ])) {
            // If they are specifically asking about evolution recipe for a unit using star fruits, let evolution handler take it
            if (this.hasAny(clean, ["evolve", "evolution", "recipe"]) && (clean.includes("thunder") || clean.includes("wind") || clean.includes("shadow") || clean.includes("mage") || clean.includes("shinobi"))) {
                // fall through to evolution handler
            } else {
                const reply = this.getStarFruitResponse();
                this.history.push(reply);
                return reply;
            }
        }

        // ----------------------------------------------------
        // 3. FOOD & UNIT LEVELING (EXP)
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
        // 4. EVOLUTION RECIPES & ALTAR
        // ----------------------------------------------------
        if (this.hasAny(clean, ["evolve", "evolution", "evolutions", "awaken", "awakening", "recipe", "recipes", "altar"])) {
            const reply = this.getEvolutionResponse(clean);
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 5. DROPS & LEGEND STAGES (Daggers, Scrolls, Blazes, Light Energy)
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
        // 6. CRAFTING WORKSHOP & RELICS
        // ----------------------------------------------------
        if (this.hasAny(clean, ["craft", "crafting", "workshop", "relic", "relics", "shadow dagger", "star staff"])) {
            const reply = this.getCraftingResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 7. FARM UNITS (ECONOMY)
        // ----------------------------------------------------
        if (this.hasAny(clean, ["banker", "alchemist", "silver banker", "gold alchemist", "farm", "farming", "yen", "cash", "money", "speedwagon", "bulma", "economy"])) {
            const reply = this.getFarmResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 8. TRAITS & TRAIT ALTAR
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
        // 9. GEMS & FARMING GEMS
        // ----------------------------------------------------
        if (this.hasWord(clean, "gem") || this.hasWord(clean, "gems")) {
            const reply = this.getGemResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 10. HARDEST STAGE / EVENT
        // ----------------------------------------------------
        if (this.hasAny(clean, ["hardest", "hard stage", "toughest", "most difficult", "boss stage", "demon lord", "malakor"])) {
            const reply = this.getHardestStageResponse();
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 11. TIER LIST / BEST UNITS / META
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
        // 12. SPECIFIC UNIT LOOKUP
        // ----------------------------------------------------
        const unit = this.findUnitByName(clean);
        if (unit) {
            const reply = this.getDynamicUnitResponse(unit);
            this.history.push(reply);
            return reply;
        }

        // ----------------------------------------------------
        // 13. FALLBACK WITH ACCURATE TIPS
        // ----------------------------------------------------
        const reply = {
            role: "assistant",
            text: `I am your TD game guide! I can look up live game stats, evolutions, star fruits, traits, food leveling, promo codes, farm units, or story drops.

Try asking me:
• "What are star fruits used for?"
• "How do I evolve Shinobi or Shadow Assassin?"
• "What are the active promo codes?"
• "How does food work to level up units?"
• "Where do Daggers drop?"
• "How do Silver Banker and Gold Alchemist work?"
• "What are the trait reroll rates?"
• "Who are the best units in the tier list?"

${this.getRandomCloser()}`,
            links: [
                { label: "📚 Open Wiki", tab: "wiki" },
                { label: "🧬 Evolution Altar", tab: "evolution" },
                { label: "🎁 Redeem Codes", tab: "codes" },
                { label: "⚔️ Play Battle", tab: "battle" }
            ]
        };
        this.history.push(reply);
        return reply;
    },

    // ----------------------------------------------------
    // PROMO CODES
    // ----------------------------------------------------
    getPromoCodesResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("active promo codes")}

Here are all active working codes right now:
• **SORRYFORBUGS** : **2,500 Gems** + **25 Trait RR** tokens!
• **TD2026** : **1,000 Gems** + **10 Trait RR** tokens!
• **RELEASE** : **500 Gems** + **1,000 Gold** + **5 Trait RR** tokens + 10 Normal Star Fruits + 5 Rice Balls!
• **EVOLUTION** : **10,000 Gold** + **1 Rainbow Star Fruit** + **3 Blue Star Fruits** + **3 Pink Star Fruits**!

Head over to the Codes tab in the top bar to claim your rewards! Note that each code can be redeemed once per account.

${this.getRandomCloser()}`,
            links: [{ label: "🎁 Open Codes Tab", tab: "codes" }]
        };
    },

    // ----------------------------------------------------
    // STAR FRUITS
    // ----------------------------------------------------
    getStarFruitResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("Star Fruits")}

**Star Fruits** are key evolution and crafting materials required to awaken Mythic units and forge legendary weapons:

**Star Fruit Types & Uses:**
• 🌈 **Rainbow Star Fruit** (Supreme Evolution Material):
  - Used in nearly every Awakened evolution (Thunder God, Wind Master, Shadow Dagger, Star Staff).
  - Can be bought in the Gem Shop for 250 Gems or fused in Crafting!
• 🟡 **Yellow Star Fruit**:
  - Required for **Thunder God (Awakened)** (10x) and **Star Staff** (5x).
• 🟢 **Green Star Fruit**:
  - Required for **Wind Master (Awakened)** (10x).
• 🌸 **Pink Star Fruit**:
  - Required for **Shadow Dagger** (3x) and **Star Staff** (5x).
• 🔵 **Blue Star Fruit**:
  - Required for **Shadow Dagger** (3x) and **Star Staff** (5x).
• 🔴 **Red Star Fruit**:
  - Used as an elemental catalyst in Rainbow Star Fruit fusion.

**Where to Get Star Fruits:**
1. 💎 **Gem Shop Daily Rotation**: Colored Star Fruits cost **50 Gems** each (max 3/day per color). Rainbow costs **250 Gems** (max 1/day). Stock rotates every 24 hours at 7:00 AM Bangkok time.
2. 🔨 **Crafting Workshop (Fruit Alchemy)**: Fuse 1 of each color (Pink, Red, Green, Blue, Yellow) to create **1 Rainbow Star Fruit**!
3. 🏆 **Daily & Half Hourly Challenges**: Victory awards guaranteed star fruit packs!

${this.getRandomCloser()}`,
            links: [
                { label: "💎 Gem Shop", tab: "gemshop" },
                { label: "🔨 Crafting Workshop", tab: "crafting" },
                { label: "🧬 Evolution Altar", tab: "evolution" }
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

Units level up from Level 1 to 100, gaining **+1% compounded damage per level** (+100% total base damage at max level)!

**Food Items in the Gold Shop:**
• 🍙 **Rice Ball**: 🪙150 Gold ➔ **+50 Unit EXP**
• 🥞 **Dorayaki**: 🪙500 Gold ➔ **+200 Unit EXP**
• 🍱 **King's Feast (Bento)**: 🪙1,800 Gold ➔ **+800 Unit EXP**
• 🍜 **Dragon Ramen**: 🪙6,000 Gold ➔ **+3,000 Unit EXP**

**How to Earn EXP:**
1. 🍙 **Feeding Food**: Open Inventory / Units tab, select a unit, and click Feed!
2. ⚔️ **Playing Story Stages**: Clearing Story Acts automatically grants EXP to all units equipped in your loadout!
3. 🌊 **Infinite Mode**: Enemies drop food items every wave!
4. 🔮 **Adept Trait**: Units rolled with the Adept trait gain **+50% more EXP** from both battles and food!

${this.getRandomCloser()}`,
            links: [
                { label: "🛒 Open Gold Shop", tab: "shop" },
                { label: "🎒 Open Units Inventory", tab: "units" }
            ]
        };
    },

    // ----------------------------------------------------
    // EVOLUTIONS (General & Specific)
    // ----------------------------------------------------
    getEvolutionResponse(clean) {
        if (clean.includes("shinobi")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Shinobi evolution")}

**Shinobi ➔ Shinobi (Awakened)**:
• **Gold Cost**: 10,000 Gold
• **Required Items**:
  - 25 Fire Scrolls (Mountain Legend Act 1)
  - 25 Water Scrolls (Mountain Legend Act 2)
  - 25 Nature Scrolls (Mountain Legend Act 3)
• **Evolution Gains**: Unlocks massive Black Flames Burn dealing 100% of unit damage, Susanoo shield bypass, and 350% burst Heavenly Meteor ability!

${this.getRandomCloser()}`,
                links: [{ label: "🧬 Evolution Altar", tab: "evolution" }]
            };
        }

        if (clean.includes("shadow") || clean.includes("assassin")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Shadow Assassin evolution")}

**Shadow Assassin ➔ Shadow Assassin (Awakened)**:
• **Gold Cost**: 10,000 Gold
• **Required Items**:
  - 1 Shadow Dagger (Forged in Crafting Workshop)
• **Shadow Dagger Recipe in Crafting**:
  - 12 Daggers (Guaranteed drops from Hills Legend Act 3)
  - 1 Rainbow Star Fruit
  - 3 Pink Star Fruits
  - 3 Blue Star Fruits
• **Evolution Gains**: Unlocks Endless Hunt (+30% permanent stack damage) and Phantom Rhythm (+50% bonus on every 10th strike)!

${this.getRandomCloser()}`,
                links: [
                    { label: "🔨 Open Crafting", tab: "crafting" },
                    { label: "🧬 Evolution Altar", tab: "evolution" }
                ]
            };
        }

        if (clean.includes("thunder") || clean.includes("lightning")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Thunder God evolution")}

**Thunder God ➔ Thunder God (Awakened)**:
• **Gold Cost**: 12,000 Gold
• **Required Items**:
  - 10 Yellow Star Fruits
  - 2 Rainbow Star Fruits
• **Evolution Gains**: Divine Chain Lightning hitting 4 targets with 25% falloff per jump, plus Thunderous Overload (+15% damage to shocked targets)!

${this.getRandomCloser()}`,
                links: [
                    { label: "💎 Buy Star Fruits", tab: "gemshop" },
                    { label: "🧬 Evolution Altar", tab: "evolution" }
                ]
            };
        }

        if (clean.includes("flame") || clean.includes("emperor")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Flame Emperor evolution")}

**Flame Emperor ➔ Flame Emperor (Awakened)**:
• **Gold Cost**: 11,000 Gold
• **Required Items**:
  - 12 Blazes (Guaranteed drops from Hills Legend Act 2)
• **Evolution Gains**: Infernal Blaze burn damage plus Scorched Earth (+20% bonus damage to burning targets)!

${this.getRandomCloser()}`,
                links: [{ label: "🧬 Evolution Altar", tab: "evolution" }]
            };
        }

        if (clean.includes("holy") || clean.includes("knight")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Holy Knight evolution")}

**Holy Knight ➔ Holy Knight (Awakened)**:
• **Gold Cost**: 10,000 Gold
• **Required Items**:
  - 12 Light Energy (Guaranteed drops from Hills Legend Act 1)
• **Evolution Gains**: Radiant AoE holy smite with huge base damage scaling!

${this.getRandomCloser()}`,
                links: [{ label: "🧬 Evolution Altar", tab: "evolution" }]
            };
        }

        if (clean.includes("wind") || clean.includes("master")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Wind Master evolution")}

**Wind Master ➔ Wind Master (Awakened)**:
• **Gold Cost**: 10,000 Gold
• **Required Items**:
  - 10 Green Star Fruits
  - 2 Rainbow Star Fruits
• **Evolution Gains**: Tempestuous vortex currents pulling and slowing enemy groups!

${this.getRandomCloser()}`,
                links: [{ label: "🧬 Evolution Altar", tab: "evolution" }]
            };
        }

        if (clean.includes("star") || clean.includes("mage")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Star Mage evolution")}

**Star Mage ➔ Star Mage (Explosion)**:
• **Gold Cost**: 15,000 Gold
• **Required Items**:
  - 1 Star Staff (Forged in Crafting Workshop)
• **Star Staff Recipe in Crafting**:
  - 2 Rainbow Star Fruits
  - 5 Pink Star Fruits
  - 5 Blue Star Fruits
  - 5 Yellow Star Fruits
• **Evolution Gains**: Supernova full AoE light damage, Stellar Blast Zone (+30% bonus), and Cosmic Execution (+25% vs Bosses)!

${this.getRandomCloser()}`,
                links: [
                    { label: "🔨 Open Crafting", tab: "crafting" },
                    { label: "🧬 Evolution Altar", tab: "evolution" }
                ]
            };
        }

        // General evolution guide listing ALL 7
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("all unit evolutions")}

Here is the complete guide to all 7 unit evolutions in Pixel Tower Defense:

1. ⚡ **Thunder God (Awakened)**:
   • 🪙 12,000 Gold + 🟡 10 Yellow Star Fruits + 🌈 2 Rainbow Star Fruits.
2. 🗡️ **Shadow Assassin (Awakened)**:
   • 🪙 10,000 Gold + 🟣 1 Shadow Dagger (Crafted from 12 Daggers from Hills Legend Act 3 + Star Fruits).
3. 🔥 **Shinobi (Awakened)**:
   • 🪙 10,000 Gold + 📜 25 Fire, 25 Water, 25 Nature Scrolls (from Mountain Legend Acts 1-3).
4. 🌋 **Flame Emperor (Awakened)**:
   • 🪙 11,000 Gold + 🔥 12 Blazes (from Hills Legend Act 2).
5. 🛡️ **Holy Knight (Awakened)**:
   • 🪙 10,000 Gold + ✨ 12 Light Energy (from Hills Legend Act 1).
6. 🌪️ **Wind Master (Awakened)**:
   • 🪙 10,000 Gold + 🟢 10 Green Star Fruits + 🌈 2 Rainbow Star Fruits.
7. 🌟 **Star Mage (Explosion)**:
   • 🪙 15,000 Gold + ⭐ 1 Star Staff (Crafted from 2 Rainbow, 5 Pink, 5 Blue, 5 Yellow Star Fruits).

You can evolve units at the Evolution Altar once you have collected the required materials and reached Level 100 on the base unit!

${this.getRandomCloser()}`,
            links: [
                { label: "🧬 Evolution Altar", tab: "evolution" },
                { label: "🔨 Crafting Workshop", tab: "crafting" }
            ]
        };
    },

    // ----------------------------------------------------
    // DROPS & LEGEND STAGES
    // ----------------------------------------------------
    getLegendResponse(clean) {
        if (clean && (clean.includes("dagger") || clean.includes("daggers"))) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Daggers drop location")}

🗡️ **Daggers** drop exclusively in **World 2 (Hills) Legend Act 3**!
• **Drop Rate**: 100% guaranteed to drop **1 to 3 Daggers** on every victory!
• **Bonus Drop**: 10% chance to also drop a rare **Relic Shard** 💠!
• **Purpose**: You need **12 Daggers** to forge the **Shadow Dagger** in Crafting, which is required to evolve Shadow Assassin into Shadow Assassin (Awakened)!

${this.getRandomCloser()}`,
                links: [
                    { label: "⚔️ Play Hills Legend Act 3", tab: "battle" },
                    { label: "🔨 Open Crafting Workshop", tab: "crafting" }
                ]
            };
        }

        return {
            role: "assistant",
            text: `${this.getRandomGreeting("Legend stages and material drops")}

Legend Stages are high-difficulty trial maps with 100% guaranteed material drops on victory:

**World 2 (Hills) Legend Stages:**
• **Hills Act 1**: 100% drops 1 to 3 **Light Energy** ✨ (Evolves Holy Knight)
• **Hills Act 2**: 100% drops 1 to 3 **Blazes** 🔥 (Evolves Flame Emperor)
• **Hills Act 3**: 100% drops 1 to 3 **Daggers** 🗡️ (Need 12 for Shadow Dagger) + 10% chance for a **Relic Shard** 💠!

**World 3 (Mountains) Legend Stages:**
• **Mountain Act 1**: 100% drops 5 to 10 **Fire Scrolls** 📜 (Evolves Shinobi)
• **Mountain Act 2**: 100% drops 5 to 10 **Water Scrolls** 📜 (Evolves Shinobi)
• **Mountain Act 3**: 100% drops 5 to 10 **Nature Scrolls** 📜 (Evolves Shinobi)

*(Note: You must clear the corresponding Story Act to unlock each Legend Stage!)*

${this.getRandomCloser()}`,
            links: [
                { label: "⚔️ Play Legend Stages", tab: "battle" },
                { label: "🔨 Open Crafting", tab: "crafting" }
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

The **Crafting Workshop** allows you to forge evolution catalysts, fuse star fruits, and build permanent team relics:

• 🟣 **Shadow Dagger** (Evolves Shadow Assassin):
  - 12 Daggers (from Hills Legend Act 3)
  - 1 Rainbow Star Fruit
  - 3 Pink Star Fruits
  - 3 Blue Star Fruits
• ⭐ **Star Staff** (Evolves Star Mage):
  - 2 Rainbow Star Fruits
  - 5 Pink Star Fruits
  - 5 Blue Star Fruits
  - 5 Yellow Star Fruits
• 🌈 **Star Fruit Alchemy (Fusion)**:
  - Combine 1 of each color (Pink, Red, Green, Blue, Yellow) into **1 Rainbow Star Fruit**!
• 💠 **Permanent Relics**:
  - Forge powerful relics using Relic Shards dropped from Hills Legend Act 3 to buff your entire team!

${this.getRandomCloser()}`,
            links: [
                { label: "🔨 Open Crafting Workshop", tab: "crafting" },
                { label: "🧬 Evolution Altar", tab: "evolution" }
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

1. **Silver Banker** [Epic]:
• **Placement Limit**: Max 3 on the field.
• **Base Payout**: 200 ¥/wave (Base Cost: 400 ¥)
• **Upgrade Payouts**:
  - Up 1: 350 ¥/wave (Cost: 650 ¥)
  - Up 2: 550 ¥/wave (Cost: 1,100 ¥)
  - Up 3: 850 ¥/wave (Cost: 1,800 ¥)
  - Up 4: 1,300 ¥/wave (Cost: 2,800 ¥)
  - Up 5: 1,850 ¥/wave (Cost: 4,200 ¥)
  - Up 6 (Max): **2,500 ¥/wave** (Cost: 6,000 ¥)
*(With 3 placed at max upgrade, you get a massive 7,500 ¥ every wave!)*

2. **Gold Alchemist** [Legendary]:
• **Placement Limit**: Strictly 1 on the field.
• **Base Payout**: 250 ¥/wave (Base Cost: 800 ¥)
• **Max Upgrade Payout**: **10,000 ¥/wave** across 8 upgrades!
*(Ideal for funding expensive high-damage Mythic upgrades!)*

${this.getRandomCloser()}`,
            links: [
                { label: "🎒 View Units", tab: "units" },
                { label: "📚 Open Wiki", tab: "wiki" }
            ]
        };
    },

    // ----------------------------------------------------
    // TRAITS & TRAIT ALTAR
    // ----------------------------------------------------
    getTraitResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("traits and the Trait Altar")}

Traits grant permanent stat bonuses to your units. Rerolling consumes 1 Trait RR token:

**Complete Trait Breakdown & Exact Probabilities:**
• 👑 **Unique** (0.10%): **+300% Damage**, -10% SPA, +10% Range (Max 1 unit placement)
• 🌌 **Eternal** (0.25%): **+50% Damage**, -10% SPA, +20% Range
• ⚡ **Divine** (0.50%): **+20% Damage**, -10% SPA, +20% Range
• ✨ **Celestial** (1.00%): **+10% Damage**, +10% Range
• ☠️ **Reaper** (2.00%): **+15% Damage**, **+25% vs Bosses**
• 💨 **Godspeed** (2.00%): **-20% SPA** (Attacks 20% faster!)
• ⚔️ **Superior III** (4.00%): +15% Damage | **Superior II** (8.50%): +10% Damage | **Superior I** (12.50%): +5% Damage
• 👟 **Nimble III** (4.00%): -15% SPA | **Nimble II** (8.50%): -10% SPA | **Nimble I** (12.50%): -5% SPA
• 🎯 **Range III** (4.00%): +15% Range | **Range II** (8.50%): +10% Range | **Range I** (12.50%): +5% Range
• 🩸 **Culling** (5.00%): +20% Damage against enemies under 30% HP
• 📚 **Adept** (7.39%): **+50% Unit EXP gained**
• 🪙 **Fortune** (7.50%): **+20% Income for farm units**

You can earn Trait RR tokens from Daily Challenges (25 RRs), Half-Hourly Challenges (3 RRs), and promo codes!

${this.getRandomCloser()}`,
            links: [
                { label: "🔮 Trait Altar", tab: "traits" },
                { label: "🏆 Play Challenges", tab: "challenges" }
            ]
        };
    },

    // ----------------------------------------------------
    // GEMS & FARMING GEMS
    // ----------------------------------------------------
    getGemResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("farming Gems")}

Here are the best ways to get Gems fast in Pixel Tower Defense:
1. 🌊 **Infinite Mode**: Milestone gem rewards every 5 waves (up to 800 Gems per milestone) plus food drops on every wave!
2. 🏆 **Daily Challenge**: Awards a huge **3,000 Gems** plus 25 Trait Rerolls on every victory!
3. ⏱️ **Half Hourly Challenge**: Awards **500 Gems** plus 3 Trait Rerolls every 30 minutes!
4. 🎁 **Promo Codes**: Redeem codes like **SORRYFORBUGS** (2,500 Gems) and **TD2026** (1,000 Gems)!
5. 📖 **Story Acts & Index**: First-time story clears and index enemy discoveries grant bonus gems.

${this.getRandomCloser()}`,
            links: [
                { label: "🏆 Play Challenges", tab: "challenges" },
                { label: "🎁 Redeem Codes", tab: "codes" },
                { label: "⚔️ Infinite Mode", tab: "battle" }
            ]
        };
    },

    // ----------------------------------------------------
    // HARDEST STAGE
    // ----------------------------------------------------
    getHardestStageResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("the hardest stage")}

The **Release Event** is currently the single toughest challenge in the game!
• It features **20 relentless waves** of elite, boosted enemies.
• Includes Abyssal Colossus mini-bosses and the ultimate World Boss **Demon Lord Malakor**.
• Winning awards **500 Gems every match** and a **0.75% drop chance** for the Secret unit Star Mage!

${this.getRandomCloser()}`,
            links: [{ label: "⚔️ Play Release Event", tab: "battle" }]
        };
    },

    // ----------------------------------------------------
    // TIER LIST
    // ----------------------------------------------------
    getTierListResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("the meta tier list")}

Here are the top absolute best units in the game right now:

1. 👑 **Shinobi (Awakened)** : Massive fire burn damage (100% of unit damage), Susanoo shield bypass, and 350% burst Heavenly Meteor strike.
2. ⚡ **Thunder God (Awakened)** : Divine chain lightning hitting 4 targets with a 25% dropoff per jump and shock stuns.
3. 🌟 **Star Mage (Explosion)** : Massive Full AoE blasts, Stellar Blast Zone (+30%), and Cosmic Execution (+25% vs bosses).
4. 🩸 **Vampire King** : Secret unit with 8s bleed ticks, +15% direct bleed damage boost, and raises fallen enemies as base minions.

**Top Role Specialists:**
• **Best Hill Anti-Air**: Hunter (Sniper targeting flying enemies with +35% bonus)
• **Best Ground Multi-Hit**: Robot (Continuous laser beam)
• **Best Support Summoner**: Commander (Buffs physical towers and spawns cavalry horses)
• **Best Farms**: Silver Banker (up to 2,500 ¥/wave x3) and Gold Alchemist (up to 10,000 ¥/wave)

${this.getRandomCloser()}`,
            links: [
                { label: "🏆 View Wiki", tab: "wiki" },
                { label: "🎒 Open Inventory", tab: "units" }
            ]
        };
    },

    // ----------------------------------------------------
    // SPECIFIC UNIT FINDER
    // ----------------------------------------------------
    findUnitByName(clean) {
        if (!window.UNIT_CONFIG) return null;

        const aliases = [
            { keys: ["shinobi god", "shinobi (god)"], id: "shinobi_god" },
            { keys: ["shinobi"], id: "shinobi" },
            { keys: ["thunder god awakened", "thunder god (awakened)"], id: "thunder_god_awakened" },
            { keys: ["thunder god", "thunder"], id: "thunder_god" },
            { keys: ["star mage explosion", "star mage (explosion)"], id: "star_mage_explosion" },
            { keys: ["star mage"], id: "star_mage" },
            { keys: ["vampire king", "vampire"], id: "vampire_king" },
            { keys: ["shadow assassin awakened", "shadow assassin (awakened)"], id: "shadow_assassin_awakened" },
            { keys: ["shadow assassin", "assassin"], id: "shadow_assassin" },
            { keys: ["hunter"], id: "hunter" },
            { keys: ["robot"], id: "robot" },
            { keys: ["silver banker", "banker"], id: "silver_banker" },
            { keys: ["gold alchemist", "alchemist"], id: "gold_alchemist" },
            { keys: ["frost weaver", "frost"], id: "frost_weaver" },
            { keys: ["swordsman"], id: "swordsman" },
            { keys: ["flame emperor awakened", "flame emperor (awakened)"], id: "flame_emperor_awakened" },
            { keys: ["flame emperor"], id: "flame_emperor" },
            { keys: ["holy knight awakened", "holy knight (awakened)"], id: "holy_knight_awakened" },
            { keys: ["holy knight"], id: "holy_knight" },
            { keys: ["wind master awakened", "wind master (awakened)"], id: "wind_master_awakened" },
            { keys: ["wind master"], id: "wind_master" },
            { keys: ["commander"], id: "commander" },
            { keys: ["magic girl"], id: "magic_girl" }
        ];

        for (const item of aliases) {
            for (const k of item.keys) {
                if (clean.includes(k) || this.hasWord(clean, k)) {
                    return window.UNIT_CONFIG[item.id] || null;
                }
            }
        }

        for (const [id, u] of Object.entries(window.UNIT_CONFIG)) {
            const nameLower = (u.name || "").toLowerCase();
            if (clean.includes(nameLower) || this.hasWord(clean, nameLower)) {
                return u;
            }
        }

        return null;
    },

    // Dynamic Unit Stat response
    getDynamicUnitResponse(unit) {
        const rawDps = Math.round(unit.baseDamage / unit.baseSpa);
        const maxUpgrades = (unit.upgrades || []).length;
        let lastDmg = unit.baseDamage;
        let lastSpa = unit.baseSpa;
        let lastRange = unit.baseRange;

        if (maxUpgrades > 0) {
            const lastUp = unit.upgrades[maxUpgrades - 1];
            lastDmg = lastUp.damage || lastDmg;
            lastSpa = lastUp.spa || lastSpa;
            lastRange = lastUp.range || lastRange;
        }
        const maxDps = Math.round(lastDmg / lastSpa);

        const passivesList = (unit.passives || []).map(p => `• **${p.name}**: ${p.desc || p.description || ''}`).join("\n");

        if (unit.isFarm) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting(unit.name)}

**${unit.name}** (${unit.rarity.toUpperCase()} • Economy Farm Unit)
• **Placement Cap**: Max ${unit.maxPlacements || 1} on the field
• **Base Payout**: ${unit.incomePerWave} ¥/wave (Base Cost: ${unit.baseCost} ¥)
• **Max Upgrade Payout**: ${(unit.upgrades && unit.upgrades[maxUpgrades - 1] ? (unit.upgrades[maxUpgrades - 1].incomePerWave || unit.upgrades[maxUpgrades - 1].income) : unit.incomePerWave)} ¥/wave (${maxUpgrades} total upgrades)

${this.getRandomCloser()}`,
                links: [
                    { label: "🎒 View Units", tab: "units" },
                    { label: "📚 Open Wiki", tab: "wiki" }
                ]
            };
        }

        return {
            role: "assistant",
            text: `${this.getRandomGreeting(unit.name)}

**${unit.name}** (${unit.rarity.toUpperCase()} • ${unit.element || "No Element"} • ${unit.placement || unit.type})
• **Placement Cap**: Max ${unit.maxPlacements || 3} on the field
• **Base Stats**: ${unit.baseDamage} DMG | ${unit.baseSpa}s SPA | ${unit.baseRange} Range (~${rawDps} DPS)
• **Max Upgrade Stats**: ${lastDmg} DMG | ${lastSpa}s SPA | ${lastRange} Range (~${maxDps} DPS across ${maxUpgrades} upgrades)

${passivesList ? "**Passives:**\n" + passivesList + "\n\n" : ""}${this.getRandomCloser()}`,
            links: [
                { label: "🎒 View Units", tab: "units" },
                { label: "📚 Open Wiki", tab: "wiki" }
            ]
        };
    }
};

if (typeof window !== "undefined") {
    window.AIChatbot = AIChatbot;
}
