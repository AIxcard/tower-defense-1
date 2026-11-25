// Pixel Tower Defense — Advanced In-Game AI Chatbot Assistant Engine
// Top-tier intelligent game guide with fuzzy typo tolerance, Levenshtein distance matching,
// context-aware multi-turn memory, live config pulling, and zero-repetitive varied replies.

const AIChatbot = {
    pendingQuery: null,
    history: [
        {
            role: "assistant",
            text: "Hey Commander! I am your AI game guide. Ask me anything about unit stats, evolutions, traits, farm towers, secret drops, challenges, or stage strategies and I will look it up right away for you!",
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

        // 1. Best Units / Meta / Tier List
        if (this.fuzzyIncludes(clean, "tier") || this.fuzzyIncludes(clean, "meta") || clean.includes("best") || clean.includes("strongest") || clean.includes("who to use")) {
            const reply = this.getTierListResponse();
            this.history.push(reply);
            return reply;
        }

        // 2. Hardest Stage query
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

        // 3. Gem farming / Best gems source
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

        // 4. Farm Units (Silver Banker and Gold Alchemist)
        if (this.fuzzyIncludes(clean, "farm") || clean.includes("banker") || clean.includes("alchemist") || clean.includes("yen") || clean.includes("money") || clean.includes("cash")) {
            const reply = this.getFarmResponse();
            this.history.push(reply);
            return reply;
        }

        // 5. Traits & Trait Altar
        if (this.fuzzyIncludes(clean, "trait") || clean.includes("reroll") || clean.includes("unique") || clean.includes("celestial") || clean.includes("divine") || clean.includes("eternal")) {
            const reply = this.getTraitResponse();
            this.history.push(reply);
            return reply;
        }

        // 6. Unit Leveling, Food, and Stage EXP
        if (clean.includes("food") || clean.includes("level") || clean.includes("exp") || clean.includes("rice ball") || clean.includes("bento")) {
            const reply = this.getFoodAndExpResponse();
            this.history.push(reply);
            return reply;
        }

        // 7. Legend Stages & Guaranteed Drops
        if (this.fuzzyIncludes(clean, "legend") || clean.includes("scroll") || clean.includes("blaze") || clean.includes("dagger") || clean.includes("light energy")) {
            const reply = this.getLegendResponse();
            this.history.push(reply);
            return reply;
        }

        // 8. Specific Unit Lookup (with fuzzy typo handling)
        const unit = this.findUnitFuzzy(clean);
        if (unit) {
            const reply = this.getDynamicUnitResponse(unit);
            this.history.push(reply);
            return reply;
        }

        // 9. Crafting & Star Fruits
        if (this.fuzzyIncludes(clean, "craft") || clean.includes("relic") || clean.includes("fruit") || clean.includes("starfruit")) {
            const reply = this.getCraftingResponse();
            this.history.push(reply);
            return reply;
        }

        // 10. Promo Codes
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
• "Who are the best units?"
• "How does Silver Banker work?"
• "What are Shinobi stats?"
• "How do I get gems fast?"
• "What is the hardest stage?"

${this.getRandomCloser()}`,
            links: [
                { label: "📚 Open Wiki", tab: "wiki" },
                { label: "⚔️ Play Story", tab: "battle" }
            ]
        };
        this.history.push(reply);
        return reply;
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
            { keys: ["silver banker", "silverbanker", "banker"], id: "silver_banker" },
            { keys: ["gold alchemist", "gold alch", "alchemist"], id: "gold_alchemist" },
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

        return {
            role: "assistant",
            text: `${this.getRandomGreeting(unit.name)}

**${unit.name}** (${unit.rarity.toUpperCase()} • ${unit.element || "No Element"} • ${unit.placement || unit.type})
• **Placement Cap**: ${unit.maxPlacements || unit.placementLimit || 3} on the field
• **Base Stats**: ${unit.baseDamage} DMG | ${unit.baseSpa}s SPA | ${unit.baseRange} Range
• **Base Raw DPS**: ~${rawDps} DPS
• **Max Upgrade Stats**: ${lastDmg} DMG | ${lastSpa}s SPA | ~${maxDps} Raw DPS (${maxUpgrades} total upgrades)

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
1. 👑 **Shinobi (God)** : Massive fire burn damage (100% of unit damage), Susanoo shield bypass, and 350% Meteor ability.
2. ⚡ **Thunder God (Divine)** : Divine chain lightning hitting 4 targets with a 25% dropoff per jump and shock stuns.
3. 🌟 **Star Mage (Explosion)** : Massive Full AoE blasts, converts speed buffs into extra damage, and targets high health bosses.
4. 🩸 **Vampire King** : Secret unit with 8s bleed ticks, +15% bleed damage boost, and resurrects dead enemies into marching allied minions.

Other top roles:
• **Best Hill Anti-Air**: Hunter (Legendary sniper targeting flying enemies)
• **Best Ground Multi-Hit**: Robot (Fires a 4-second sustained laser beam)
• **Best Support Summoner**: Commander (Buffs physical towers and spawns war cavalry horses from base)
• **Best Farms**: Silver Banker (max 3 placements) and Gold Alchemist (strictly 1 placement)

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

${this.getRandomCloser()}`,
            links: [
                { label: "👉 View Units in Team", tab: "inventory" },
                { label: "📚 Open Wiki", tab: "wiki" }
            ]
        };
    },

    // Trait overview
    getTraitResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("traits and the Trait Altar")}

Traits give permanent stat boosts to your units. Rerolling always consumes strictly 1 Trait RR token.

Top traits:
• **Unique** (0.10%): +300% Damage, -10% SPA, +10% Range (Max 1 placement)
• **Celestial** (0.35%): +150% Damage, -10% SPA, +15% Range
• **Divine** (0.50%): +125% Damage, -10% SPA
• **Eternal** (0.75%): +100% Damage, +15% Range
• **Reaper** (0.80%): +90% Damage
• **Fortune** (1.00%): +100% Gold when sold and +25% in-match farm cash
• **Culling** (1.50%): Executes non-boss enemies under 15% HP
• **Godspeed** (2.50%): -17.5% SPA

You can get Trait RRs by beating Daily Challenges (25 RRs), Half-Hourly Challenges (3 RRs), or buying in the shops!

${this.getRandomCloser()}`,
            links: [
                { label: "🔮 Go to Trait Altar", tab: "traits" },
                { label: "⚔️ Play Challenges", tab: "challenges" }
            ]
        };
    },

    // Food and stage EXP overview
    getFoodAndExpResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("unit EXP and food leveling")}

There are two main ways to level up your units up to Level 100:
1. ⚔️ **Playing Story & Legend Stages**: Clearing Story stages automatically grants your equipped team units EXP (enough to reach level 60-70 naturally as you beat the worlds). Note: Infinite mode drops food instead of giving unit EXP.
2. 🍙 **Feeding Food Items**: Food EXP has been buffed!
   • **Rice Ball**: +250 Unit EXP
   • **Bento Box**: +1,000 Unit EXP
   • **Gourmet Ramen**: +3,000 Unit EXP
   • **Emperor Feast**: +10,000 Unit EXP

*(Tip: Units with the Adept trait gain 50% more EXP from all sources!)*

${this.getRandomCloser()}`,
            links: [
                { label: "👉 Open Inventory to Feed", tab: "inventory" },
                { label: "⚔️ Play Story Stages", tab: "battle" }
            ]
        };
    },

    // Legend Stages
    getLegendResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("Legend stages and drop rates")}

Legend Stages are high-difficulty trials with 100% guaranteed material drops:

**World 2 (Hills) Legend Stages:**
• **Hills Act 1**: 100% drops 1 to 3 Light Energy ✨
• **Hills Act 2**: 100% drops 1 to 3 Blazes 🔥
• **Hills Act 3**: 100% drops 1 to 3 Daggers 🗡️ plus a 10% chance for a Relic Shard 💠!

**World 3 (Mountains) Legend Stages:**
• **Mountain Act 1**: 100% drops 5 to 10 Fire Scrolls 📜
• **Mountain Act 2**: 100% drops 5 to 10 Water Scrolls 📜
• **Mountain Act 3**: 100% drops 5 to 10 Nature Scrolls 📜

Every victory registers stage clear progress and gives full gems!

${this.getRandomCloser()}`,
            links: [
                { label: "👉 Play Legend Stages", tab: "battle" },
                { label: "🔨 Open Crafting", tab: "crafting" }
            ]
        };
    },

    // Crafting
    getCraftingResponse() {
        return {
            role: "assistant",
            text: `${this.getRandomGreeting("crafting, star fruits, and relics")}

The **Crafting Workshop** lets you forge evolution materials and permanent relics:
• **Shadow Dagger**: 1 Rainbow, 3 Pink, 3 Blue Star Fruits (Needed to evolve Shadow Assassin).
• **Star Staff**: 2 Rainbow, 5 Pink, 5 Blue, 5 Yellow Star Fruits (Catalyst for Star Mage).
• **Star Fruit Alchemy**: 3 Normal convert to 1 Colored, or 1 of each color combines into 1 Rainbow Star Fruit!
• **Relics**: Forge team relics with Relic Shards dropped from Hills Legend Act 3.

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
