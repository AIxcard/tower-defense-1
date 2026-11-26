// Pixel Tower Defense — Advanced In-Game AI Chatbot Assistant Engine
// Top-tier intelligent game guide with fuzzy typo tolerance, Levenshtein distance matching,
// context-aware multi-turn memory, live config pulling, and accurate game database lookups.

const AIChatbot = {
    pendingQuery: null,
    history: [
        {
            role: "assistant",
            text: "Hey! I am your AI game guide. Ask me anything about unit stats, evolutions, traits, farm towers, secret drops, challenges, or stage strategies and I will look it up right away for you!",
            links: [
                { label: "⚔️ Play Challenges", tab: "challenges" },
                { label: "🧬 Evolution Altar", tab: "evolution" },
                { label: "📚 Open Wiki", tab: "wiki" }
            ]
        }
    ],

    // Levenshtein distance for fuzzy typo matching
    levenshtein(a, b) {
        if (!a || !b) return (a || b || "").length;
        const al = a.length;
        const bl = b.length;
        const dp = [];
        for (let i = 0; i <= al; i++) {
            dp[i] = [i];
        }
        for (let j = 0; j <= bl; j++) {
            dp[0][j] = j;
        }
        for (let i = 1; i <= al; i++) {
            for (let j = 1; j <= bl; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,      // deletion
                    dp[i][j - 1] + 1,      // insertion
                    dp[i - 1][j - 1] + cost // substitution
                );
            }
        }
        return dp[al][bl];
    },

    // Check if input is incomplete or hanging
    isIncomplete(text) {
        if (!text) return true;
        const trimmed = text.trim();
        if (trimmed.length < 3) return true;

        // Ending with ellipses
        if (/\.{2,}$/.test(trimmed)) return true;

        // Hanging prepositions, conjunctions, or question roots
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

        const cutOffPhrases = [
            "can you tell me about",
            "tell me about",
            "what is the best",
            "who is the best",
            "how do i evolve",
            "how do i get",
            "what does",
            "is thunder god",
            "is shinobi",
            "what about",
            "how to use",
            "which unit"
        ];
        for (const phrase of cutOffPhrases) {
            if (lower === phrase) return true;
        }

        return false;
    },

    // Fuzzy keyword matcher across text
    fuzzyIncludes(cleanText, targetWord, maxDist = 2) {
        if (cleanText.includes(targetWord)) return true;
        const tokens = cleanText.split(/\s+/);
        for (const t of tokens) {
            if (Math.abs(t.length - targetWord.length) <= maxDist) {
                if (this.levenshtein(t, targetWord) <= maxDist) {
                    return true;
                }
            }
        }
        return false;
    },

    // Dynamic greeting generator
    getRandomGreeting(topic) {
        const greetings = [
            `Got you covered on ${topic}!`,
            `Looking up the latest stats for ${topic} right now.`,
            `Here is the rundown on ${topic} from our game configs.`,
            `Checking the balance sheet and wiki for ${topic}.`,
            `Here are the exact numbers and details on ${topic}.`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    },

    // Dynamic closer generator
    getRandomCloser() {
        const closers = [
            "Let me know if you want to know anything else about them!",
            "You can also ask me about other units, traits, or stages anytime.",
            "Feel free to test them out in battle to see how they feel!",
            "Need more tips or advice? Just ask!",
            "Let me know if you want the breakdown on any other unit or mode!"
        ];
        return closers[Math.floor(Math.random() * closers.length)];
    },

    // Main query solver
    ask(rawQuery) {
        let query = (rawQuery || "").trim();
        if (!query) return null;

        // Record user query
        this.history.push({
            role: "user",
            text: query
        });

        // Handle incomplete queries and context resumption
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

        // 1. Evolution Queries ("how to evolve", "evolve shinobi", "evolution recipe")
        if (this.fuzzyIncludes(clean, "evolve") || this.fuzzyIncludes(clean, "evolution") || clean.includes("awaken") || clean.includes("recipe")) {
            const reply = this.getEvolutionResponse(clean);
            this.history.push(reply);
            return reply;
        }

        // 2. Best Units / Meta / Tier List
        if (this.fuzzyIncludes(clean, "tier") || this.fuzzyIncludes(clean, "meta") || clean.includes("best") || clean.includes("strongest") || clean.includes("who to use")) {
            const reply = this.getTierListResponse();
            this.history.push(reply);
            return reply;
        }

        // 3. Hardest Stage query
        if (clean.includes("hardest") || clean.includes("hard stage") || clean.includes("toughest") || clean.includes("most difficult")) {
            const reply = {
                role: "assistant",
                text: `${this.getRandomGreeting("the hardest stage")}

The **Release Event** is currently the single hardest stage in the entire game!
• It has **20 intense waves** of elite enemies with boosted HP and speed.
• It features Abyssal Colossus mini-bosses and the final World Boss Demon Lord Malakor.
• Winning awards **500 Gems every match** and a **0.75% drop chance** for the Secret unit Star Mage!

${this.getRandomCloser()}`,
                links: [
                    { label: "⚔️ Play Release Event", tab: "battle" }
                ]
            };
            this.history.push(reply);
            return reply;
        }

        // 4. Gem farming / Best gems source
        if ((clean.includes("gem") || clean.includes("gems")) && (clean.includes("farm") || clean.includes("get") || clean.includes("source") || clean.includes("fast") || clean.includes("best"))) {
            const reply = {
                role: "assistant",
                text: `${this.getRandomGreeting("farming gems")}

Here are the best ways to get Gems fast right now:
1. 💎 **Infinite Mode**: The best ongoing source of gems! You get milestone gem rewards every 5 waves (up to 800 Gems per milestone) and enemies drop food every wave.
2. 🏆 **Daily Challenge**: Gives a massive **3,000 Gems** plus 25 Trait Rerolls on every clear!
3. ⏱️ **Half Hourly Challenge**: Gives **500 Gems** plus 3 Trait Rerolls every 30 minutes!
4. 🌟 **Story Quests & Index**: Clearing story acts and discovering enemies in the index awards bonus gems.

${this.getRandomCloser()}`,
                links: [
                    { label: "⚔️ Launch Infinite Mode", tab: "battle" },
                    { label: "🏆 Play Challenges", tab: "challenges" }
                ]
            };
            this.history.push(reply);
            return reply;
        }

        // 5. Farm Units (Silver Banker and Gold Alchemist)
        if (this.fuzzyIncludes(clean, "farm") || clean.includes("banker") || clean.includes("alchemist") || clean.includes("yen") || clean.includes("money") || clean.includes("cash")) {
            const reply = this.getFarmResponse();
            this.history.push(reply);
            return reply;
        }

        // 6. Traits & Trait Altar
        if (this.fuzzyIncludes(clean, "trait") || clean.includes("reroll") || clean.includes("unique") || clean.includes("celestial") || clean.includes("divine") || clean.includes("eternal") || clean.includes("adept") || clean.includes("superior") || clean.includes("reaper") || clean.includes("culling") || clean.includes("godspeed")) {
            const reply = this.getTraitResponse();
            this.history.push(reply);
            return reply;
        }

        // 7. Unit Leveling, Food, and Stage EXP
        if (clean.includes("food") || clean.includes("level") || clean.includes("exp") || clean.includes("rice ball") || clean.includes("dorayaki") || clean.includes("ramen") || clean.includes("bento")) {
            const reply = this.getFoodAndExpResponse();
            this.history.push(reply);
            return reply;
        }

        // 8. Legend Stages, Drops & Materials
        if (this.fuzzyIncludes(clean, "legend") || clean.includes("drop") || clean.includes("scroll") || clean.includes("blaze") || clean.includes("dagger") || clean.includes("light energy") || clean.includes("where to get") || clean.includes("where do")) {
            const reply = this.getLegendResponse();
            this.history.push(reply);
            return reply;
        }

        // 9. Crafting & Star Fruits
        if (this.fuzzyIncludes(clean, "craft") || clean.includes("relic") || clean.includes("fruit") || clean.includes("starfruit") || clean.includes("shadow dagger") || clean.includes("star staff")) {
            const reply = this.getCraftingResponse();
            this.history.push(reply);
            return reply;
        }

        // 10. Specific Unit Lookup (with fuzzy typo handling)
        const unit = this.findUnitFuzzy(clean);
        if (unit) {
            const reply = this.getDynamicUnitResponse(unit);
            this.history.push(reply);
            return reply;
        }

        // 11. Promo Codes
        if (clean.includes("code") || clean.includes("promo") || clean.includes("redeem")) {
            const reply = {
                role: "assistant",
                text: `${this.getRandomGreeting("active promo codes")}

Here are the active working codes right now:
• **RELEASE** : Gives 500 Gems, 1000 Gold, and 5 Trait RR tokens!
• **PTD2026** : Gives 300 Gems and 5 Summon Tickets!
• **EVOLUTION** : Gives 1 Rainbow Star Fruit, 3 Blue, and 3 Pink Star Fruits!

${this.getRandomCloser()}`,
                links: [{ label: "👉 Redeem Codes Now", tab: "codes" }]
            };
            this.history.push(reply);
            return reply;
        }

        // Fallback with smart tips
        const reply = {
            role: "assistant",
            text: `I am your TD game guide! I can check live unit stats, tier lists, DPS, evolutions, traits, farm units, or story drops.

Try asking me things like:
• "How do I evolve Shinobi?"
• "How does Silver Banker work?"
• "Where do Daggers drop?"
• "What are the exact trait drop rates?"
• "Who are the best units in the tier list?"

${this.getRandomCloser()}`,
            links: [
                { label: "📚 Open Wiki", tab: "wiki" },
                { label: "⚔️ Play Story", tab: "battle" }
            ]
        };
        this.history.push(reply);
        return reply;
    },

    // Evolution handler with exact game recipes
    getEvolutionResponse(clean) {
        if (clean.includes("shinobi")) {
            return {
                role: "assistant",
                text: `${this.getRandomGreeting("Shinobi evolution")}

**Shinobi ➔ Shinobi (God)**:
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
  - 12 Normal Daggers (Guaranteed drops from Hills Legend Act 3)
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
                links: [{ label: "🧬 Evolution Altar", tab: "evolution" }]
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

        // General evolution summary
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("all unit evolutions")}

Here is the quick guide to all 7 unit evolutions:
1. **Shinobi (God)**: 10,000 Gold + 25 Fire, 25 Water, 25 Nature Scrolls (from Mountain Legend Acts 1-3).
2. **Thunder God (Awakened)**: 12,000 Gold + 10 Yellow & 2 Rainbow Star Fruits.
3. **Shadow Assassin (Awakened)**: 10,000 Gold + 1 Shadow Dagger (Forged from 12 Daggers from Hills Legend Act 3 + Star Fruits).
4. **Flame Emperor (Awakened)**: 11,000 Gold + 12 Blazes (from Hills Legend Act 2).
5. **Holy Knight (Awakened)**: 10,000 Gold + 12 Light Energy (from Hills Legend Act 1).
6. **Wind Master (Awakened)**: 10,000 Gold + 10 Green & 2 Rainbow Star Fruits.
7. **Star Mage (Explosion)**: 15,000 Gold + 1 Star Staff (Forged from 2 Rainbow, 5 Pink, 5 Blue, 5 Yellow Star Fruits).

${this.getRandomCloser()}`,
            links: [
                { label: "🧬 Evolution Altar", tab: "evolution" },
                { label: "🔨 Crafting Workshop", tab: "crafting" }
            ]
        };
    },

    // Fuzzy unit matching for typos like "shinoby", "thundr god", "huntr", etc.
    findUnitFuzzy(clean) {
        if (!window.UNIT_CONFIG) return null;

        const aliases = [
            { keys: ["shinobi god", "shinob god", "shinoby god"], id: "shinobi_god" },
            { keys: ["shinobi", "shinob", "shinoby", "shynobi"], id: "shinobi" },
            { keys: ["thunder god divine", "thunder god awakened"], id: "thunder_god_awakened" },
            { keys: ["thunder god", "thundr god", "tunder god", "thundergod"], id: "thunder_god" },
            { keys: ["star mage explosion", "star mage evo"], id: "star_mage_explosion" },
            { keys: ["star mage", "star mag", "starmage"], id: "star_mage" },
            { keys: ["vampire king", "vampire", "vamp king"], id: "vampire_king" },
            { keys: ["shadow assassin awakened", "shadow assassin evo"], id: "shadow_assassin_awakened" },
            { keys: ["shadow assassin", "shadow assasin", "assassin", "assasin"], id: "shadow_assassin" },
            { keys: ["hunter", "huntr", "huntar"], id: "hunter" },
            { keys: ["robot", "robt", "roboot"], id: "robot" },
            { keys: ["silver banker", "silverbanker", "banker", "speedwagon"], id: "silver_banker" },
            { keys: ["gold alchemist", "gold alch", "alchemist", "bulma"], id: "gold_alchemist" },
            { keys: ["frost weaver", "frostweaver", "frost"], id: "frost_weaver" },
            { keys: ["swordsman", "swords man", "sword"], id: "swordsman" },
            { keys: ["flame emperor ruler", "flame emperor awakened"], id: "flame_emperor_awakened" },
            { keys: ["flame emperor", "flam emperor"], id: "flame_emperor" },
            { keys: ["holy knight power", "holy knight awakened"], id: "holy_knight_awakened" },
            { keys: ["holy knight", "holy knigt"], id: "holy_knight" },
            { keys: ["wind master tornado", "wind master awakened"], id: "wind_master_awakened" },
            { keys: ["wind master", "wind mastr"], id: "wind_master" },
            { keys: ["commander", "comander"], id: "commander" },
            { keys: ["magic girl", "magicgirl"], id: "magic_girl" }
        ];

        for (const item of aliases) {
            for (const k of item.keys) {
                if (clean.includes(k) || this.fuzzyIncludes(clean, k, 1)) {
                    return window.UNIT_CONFIG[item.id] || null;
                }
            }
        }

        // Direct check against config names
        for (const [id, u] of Object.entries(window.UNIT_CONFIG)) {
            const nameLower = (u.name || "").toLowerCase();
            if (clean.includes(nameLower) || this.fuzzyIncludes(clean, nameLower, 1)) {
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
                    { label: "🧮 Test in Economy Calculator", tab: "wiki" },
                    { label: "👉 Check in Inventory", tab: "inventory" }
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
                { label: "🧮 Test in DPS Calculator", tab: "wiki" },
                { label: "👉 Check in Inventory", tab: "inventory" }
            ]
        };
    },

    // Tier list overview
    getTierListResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("the current meta tier list")}

Here are the top 4 absolute best units in the game right now:
1. 👑 **Shinobi (God)** : Massive fire burn damage (100% of unit damage), Susanoo shield bypass, and 350% burst Heavenly Meteor strike.
2. ⚡ **Thunder God (Awakened)** : Divine chain lightning hitting 4 targets with a 25% dropoff per jump and shock stuns.
3. 🌟 **Star Mage (Explosion)** : Massive Full AoE blasts, Stellar Blast Zone (+30%), and Cosmic Execution (+25% vs bosses).
4. 🩸 **Vampire King** : Secret unit with 8s bleed ticks, +15% direct bleed damage boost, and raises fallen enemies as base minions.

Other top roles:
• **Best Hill Anti-Air**: Hunter (Sniper targeting flying enemies with +35% bonus)
• **Best Ground Multi-Hit**: Robot (Fires a 4-second continuous laser beam)
• **Best Support Summoner**: Commander (Buffs physical towers and spawns war cavalry horses from base)
• **Best Farms**: Silver Banker (max 3 placements, up to 2,500 ¥/wave) and Gold Alchemist (strictly 1 placement, up to 10,000 ¥/wave)

${this.getRandomCloser()}`,
            links: [
                { label: "🏆 View Tier List", tab: "wiki" },
                { label: "🧮 Open DPS Calculator", tab: "wiki" }
            ]
        };
    },

    // Farm units overview
    getFarmResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("farm units")}

Here is how our two economy farm units work in combat:

1. **Silver Banker** [Epic]:
• **Placement Limit**: Max 3 on the field.
• **Yen Yield Table**:
  - Base: 200 ¥/wave
  - Upgrade 1: 350 ¥/wave
  - Upgrade 2: 550 ¥/wave
  - Upgrade 3: 850 ¥/wave
  - Upgrade 4: 1,300 ¥/wave
  - Upgrade 5: 1,850 ¥/wave
  - Upgrade 6 (Max): 2,500 ¥/wave
  *(With 3 placed on the field at max upgrade, you get 7,500 ¥ every wave!)*

2. **Gold Alchemist** [Legendary]:
• **Placement Limit**: Strictly 1 on the field.
• **Yen Yield Table**:
  - Base: 250 ¥/wave
  - Upgrade 1: 500 ¥/wave
  - Upgrade 2: 850 ¥/wave
  - Upgrade 3: 1,400 ¥/wave
  - Upgrade 4: 2,200 ¥/wave
  - Upgrade 5: 3,500 ¥/wave
  - Upgrade 6: 5,500 ¥/wave
  - Upgrade 7: 7,500 ¥/wave
  - Upgrade 8 (Max): 10,000 ¥/wave
  *(Yields a massive 10,000 ¥ every wave at max upgrade!)*

${this.getRandomCloser()}`,
            links: [
                { label: "👉 View Units in Team", tab: "inventory" },
                { label: "📚 Open Wiki", tab: "wiki" }
            ]
        };
    },

    // Trait overview with exact percentages matching TRAIT_CONFIG
    getTraitResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("traits and the Trait Altar")}

Traits grant permanent stat bonuses to your units. Rerolling always consumes 1 Trait RR token.

**Complete Trait Breakdown & Exact Probabilities:**
• **Unique** (0.10%): +300% Damage, -10% SPA, +10% Range (Max 1 unit placement)
• **Eternal** (0.25%): +50% Damage, -10% SPA, +20% Range
• **Divine** (0.50%): +20% Damage, -10% SPA, +20% Range
• **Celestial** (1.00%): +10% Damage, +10% Range
• **Reaper** (2.00%): +15% Damage, +25% vs Bosses
• **Godspeed** (2.00%): -20% SPA
• **Superior III** (4.00%): +15% Damage | **Superior II** (8.50%): +10% Damage | **Superior I** (12.50%): +5% Damage
• **Nimble III** (4.00%): -15% SPA | **Nimble II** (8.50%): -10% SPA | **Nimble I** (12.50%): -5% SPA
• **Range III** (4.00%): +15% Range | **Range II** (8.50%): +10% Range | **Range I** (12.50%): +5% Range
• **Culling** (5.00%): +20% Damage against enemies under 30% HP
• **Adept** (7.39%): +50% Unit EXP gained
• **Fortune** (7.50%): +20% Income for farming units

You can get Trait RRs by beating Daily Challenges (25 RRs), Half-Hourly Challenges (3 RRs), or in the shops!

${this.getRandomCloser()}`,
            links: [
                { label: "🔮 Go to Trait Altar", tab: "traits" },
                { label: "⚔️ Play Challenges", tab: "challenges" }
            ]
        };
    },

    // Food and stage EXP overview matching shop and wiki
    getFoodAndExpResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("unit EXP and food leveling")}

Units level up from Level 1 to 100, gaining compounded +1% damage per level:
1. ⚔️ **Playing Story & Legend Stages**: Clearing Story stages automatically grants your active team units EXP. Note that Infinite mode drops food instead of raw unit EXP.
2. 🍙 **Feeding Food from the Gold Shop**:
   • **Rice Ball**: Cost 150 Gold ➔ **+50 Unit EXP**
   • **Dorayaki**: Cost 500 Gold ➔ **+200 Unit EXP**
   • **King's Feast (Bento)**: Cost 1,800 Gold ➔ **+800 Unit EXP**
   • **Dragon Ramen**: Cost 6,000 Gold ➔ **+3,000 Unit EXP**

*(Tip: Units with the Adept trait gain 50% more EXP from both food and battles!)*

${this.getRandomCloser()}`,
            links: [
                { label: "👉 Open Inventory to Feed", tab: "inventory" },
                { label: "🍙 Buy Food in Gold Shop", tab: "gold_shop" }
            ]
        };
    },

    // Legend Stages & drop locations
    getLegendResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("Legend stages and material drops")}

Legend Stages are high-difficulty trials with 100% guaranteed material drops:

**World 2 (Hills) Legend Stages:**
• **Hills Act 1**: 100% drops 1 to 3 Light Energy ✨ (Evolves Holy Knight)
• **Hills Act 2**: 100% drops 1 to 3 Blazes 🔥 (Evolves Flame Emperor)
• **Hills Act 3**: 100% drops 1 to 3 Daggers 🗡️ (Need 12 to craft Shadow Dagger) plus 10% chance for a Relic Shard 💠!

**World 3 (Mountains) Legend Stages:**
• **Mountain Act 1**: 100% drops 5 to 10 Fire Scrolls 📜 (Evolves Shinobi)
• **Mountain Act 2**: 100% drops 5 to 10 Water Scrolls 📜 (Evolves Shinobi)
• **Mountain Act 3**: 100% drops 5 to 10 Nature Scrolls 📜 (Evolves Shinobi)

${this.getRandomCloser()}`,
            links: [
                { label: "👉 Play Legend Stages", tab: "battle" },
                { label: "🔨 Open Crafting", tab: "crafting" }
            ]
        };
    },

    // Crafting Workshop
    getCraftingResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("crafting, star fruits, and relics")}

The **Crafting Workshop** lets you forge evolution catalysts and permanent relics:
• **Shadow Dagger** (Evolves Shadow Assassin):
  - 12 Daggers (from Hills Legend Act 3)
  - 1 Rainbow Star Fruit
  - 3 Pink Star Fruits
  - 3 Blue Star Fruits
• **Star Staff** (Evolves Star Mage):
  - 2 Rainbow Star Fruits
  - 5 Pink Star Fruits
  - 5 Blue Star Fruits
  - 5 Yellow Star Fruits
• **Star Fruit Fusion**: Combine 1 of each color (Pink, Red, Green, Blue, Yellow) into 1 Rainbow Star Fruit!
• **Relics**: Forge team relics using Relic Shards dropped from Hills Legend Act 3.

${this.getRandomCloser()}`,
            links: [
                { label: "🔨 Open Crafting Workshop", tab: "crafting" },
                { label: "🧬 Evolution Altar", tab: "evolution" }
            ]
        };
    }
};

if (typeof window !== "undefined") {
    window.AIChatbot = AIChatbot;
}
