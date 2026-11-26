// TD — In-Game Comprehensive Wiki Engine
// Organizes units by form and rarity (Secrets at the bottom), arranges materials by rarity tier, and uses vector SVG artwork (no emojis).

const WikiController = {
    activeCategory: "units", // "units", "traits", "crafting", "materials", "food", "enemies", "mechanics"
    unitSearchQuery: "",
    unitRarityFilter: "all",
    unitFormFilter: "all", // "all", "base", "evolved"

    setCategory(category) {
        this.activeCategory = category;
        const subnavBtns = document.querySelectorAll(".wiki-subnav-btn");
        subnavBtns.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.wikiCat === category);
        });
        this.render();
    },

    setUnitFilter(rarity) {
        this.unitRarityFilter = rarity;
        this.render();
    },

    setUnitFormFilter(form) {
        this.unitFormFilter = form;
        this.render();
    },

    setUnitSearch(query) {
        this.unitSearchQuery = (query || "").trim().toLowerCase();
        this.render();
    },

    render() {
        const container = document.getElementById("wiki-content-area");
        if (!container) return;

        switch (this.activeCategory) {
            case "units":
                this.renderUnitsWiki(container);
                break;
            case "traits":
                this.renderTraitsWiki(container);
                break;
            case "crafting":
                this.renderCraftingWiki(container);
                break;
            case "materials":
                this.renderMaterialsWiki(container);
                break;
            case "food":
                this.renderFoodWiki(container);
                break;
            case "enemies":
                this.renderEnemiesWiki(container);
                break;
            case "mechanics":
                this.renderMechanicsWiki(container);
                break;
            case "tierlist":
                this.renderTierListWiki(container);
                break;
            case "dps_calc":
                this.renderDPSCalcWiki(container);
                break;
            case "codes":
                this.renderCodesWiki(container);
                break;
            default:
                this.renderUnitsWiki(container);
        }
    },

    // ----------------------------------------------------
    // UNITS WIKI (Order: Rare -> Epic -> Legendary -> Mythic -> Secret at bottom)
    // Supports Form filter (Base vs Evolved) and Rarity filter
    // ----------------------------------------------------
    renderUnitsWiki(container) {
        const rawUnits = Object.values(window.UNIT_CONFIG || {});
        const seen = new Set();
        let allUnits = rawUnits.filter(u => {
            if (seen.has(u.id)) return false;
            seen.add(u.id);
            return true;
        });

        // 1. Form Filter
        if (this.unitFormFilter === "base") {
            allUnits = allUnits.filter(u => !u.isEvolved && !u.id.includes("awakened") && !u.id.includes("explosion"));
        } else if (this.unitFormFilter === "evolved") {
            allUnits = allUnits.filter(u => u.isEvolved || u.id.includes("awakened") || u.id.includes("explosion"));
        }

        // 2. Rarity Filter
        if (this.unitRarityFilter !== "all") {
            allUnits = allUnits.filter(u => u.rarity === this.unitRarityFilter);
        }

        // 3. Search Query Filter
        if (this.unitSearchQuery) {
            const q = this.unitSearchQuery;
            allUnits = allUnits.filter(u => {
                const nameM = (u.name || "").toLowerCase().includes(q);
                const elemM = (u.element || "").toLowerCase().includes(q);
                const dmgM = (u.damageType || "").toLowerCase().includes(q);
                const shapeM = (u.attackShape || "").toLowerCase().includes(q);
                return nameM || elemM || dmgM || shapeM;
            });
        }

        // Sort by Rarity Order: Rare -> Epic -> Legendary -> Mythic -> Secret at bottom!
        const rarityRanks = { "Rare": 1, "Epic": 2, "Legendary": 3, "Mythic": 4, "Secret": 5 };
        allUnits.sort((a, b) => {
            const rankA = rarityRanks[a.rarity] || 99;
            const rankB = rarityRanks[b.rarity] || 99;
            if (rankA !== rankB) return rankA - rankB;
            return a.name.localeCompare(b.name);
        });

        let html = `
            <div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
                <!-- Controls & Filters Bar -->
                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px;">
                    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
                        <!-- Form Filter Tabs -->
                        <div style="display:flex;gap:6px;align-items:center;">
                            <span style="font-size:12px;font-weight:800;color:#94a3b8;margin-right:4px;">FORM:</span>
                            <button class="stage-btn ${this.unitFormFilter === 'all' ? 'special-btn' : ''}" style="padding:4px 10px;font-size:12px;" onclick="WikiController.setUnitFormFilter('all')">All Forms</button>
                            <button class="stage-btn ${this.unitFormFilter === 'base' ? 'special-btn' : ''}" style="padding:4px 10px;font-size:12px;" onclick="WikiController.setUnitFormFilter('base')">Base Units</button>
                            <button class="stage-btn ${this.unitFormFilter === 'evolved' ? 'special-btn' : ''}" style="padding:4px 10px;font-size:12px;" onclick="WikiController.setUnitFormFilter('evolved')">Evolved Only</button>
                        </div>

                        <!-- Search Input -->
                        <div style="flex:1;max-width:280px;">
                            <input type="text" placeholder="Search units, elements, shapes..." value="${this.unitSearchQuery}" oninput="WikiController.setUnitSearch(this.value)" style="width:100%;padding:6px 12px;border-radius:6px;border:1px solid #334155;background:#020617;color:#fff;font-size:12px;">
                        </div>
                    </div>

                    <!-- Rarity Filter Buttons (Rare -> Epic -> Legendary -> Mythic -> Secret) -->
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                        <span style="font-size:12px;font-weight:800;color:#94a3b8;margin-right:4px;">RARITY:</span>
                        <button class="stage-btn ${this.unitRarityFilter === 'all' ? 'special-btn' : ''}" style="padding:3px 8px;font-size:11px;" onclick="WikiController.setUnitFilter('all')">All Rarities</button>
                        <button class="stage-btn ${this.unitRarityFilter === 'Rare' ? 'special-btn' : ''}" style="padding:3px 8px;font-size:11px;color:#60a5fa;" onclick="WikiController.setUnitFilter('Rare')">Rare</button>
                        <button class="stage-btn ${this.unitRarityFilter === 'Epic' ? 'special-btn' : ''}" style="padding:3px 8px;font-size:11px;color:#c084fc;" onclick="WikiController.setUnitFilter('Epic')">Epic</button>
                        <button class="stage-btn ${this.unitRarityFilter === 'Legendary' ? 'special-btn' : ''}" style="padding:3px 8px;font-size:11px;color:#facc15;" onclick="WikiController.setUnitFilter('Legendary')">Legendary</button>
                        <button class="stage-btn ${this.unitRarityFilter === 'Mythic' ? 'special-btn' : ''}" style="padding:3px 8px;font-size:11px;color:#ec4899;" onclick="WikiController.setUnitFilter('Mythic')">Mythic</button>
                        <button class="stage-btn ${this.unitRarityFilter === 'Secret' ? 'special-btn' : ''}" style="padding:3px 8px;font-size:11px;color:#f43f5e;" onclick="WikiController.setUnitFilter('Secret')">Secret</button>
                    </div>
                </div>

                <!-- Units Cards Grid -->
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));gap:14px;">
        `;

        if (allUnits.length === 0) {
            html += `<div style="grid-column:1/-1;text-align:center;padding:36px;color:#94a3b8;">No units match your selected filters.</div>`;
        }

        allUnits.forEach(u => {
            const rClass = (u.rarity || "Rare").toLowerCase();
            const elemIcon = window.PixelSprites && window.PixelSprites.getElementIcon ? window.PixelSprites.getElementIcon(u.element, 22) : '';
            const dmgIcon = window.PixelSprites && window.PixelSprites.getDamageTypeIcon ? window.PixelSprites.getDamageTypeIcon(u.damageType, 22) : '';

            let passivesHtml = "";
            let pList = u.passives || [];
            // If the Mythic isn't evolved, only show the passive that is working (Passive 1)
            if (u.rarity === "Mythic" && !u.isEvolved && !u.id.includes("awakened") && !u.id.includes("divine") && !u.id.includes("explosion") && !u.id.includes("ruler") && !u.id.includes("power") && !u.id.includes("tornado") && !u.isSupport && u.id !== "vampire_king") {
                pList = pList.slice(0, 1);
            }
            if (pList.length > 0) {
                passivesHtml = `
                    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #1e293b;font-size:11px;">
                        <span style="font-weight:800;color:#94a3b8;">PASSIVES:</span>
                        ${pList.map(p => `<div style="color:#e2e8f0;margin-top:2px;">• <b>${p.name}:</b> ${p.desc || p.description || ''}</div>`).join("")}
                    </div>
                `;
            }

            if (u.activeAbility) {
                passivesHtml += `
                    <div style="margin-top:6px;padding-top:6px;border-top:1px dashed #f97316;font-size:11px;">
                        <span style="font-weight:900;color:#facc15;">☄️ ACTIVE ABILITY (${u.activeAbility.name}):</span>
                        <div style="color:#fef08a;margin-top:2px;">• ${u.activeAbility.description} (120s CD • 160px AoE • 350% DMG)</div>
                    </div>
                `;
            }

            html += `
                <div class="wiki-unit-card" style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px;">
                    <div style="display:flex;gap:12px;align-items:center;">
                        <div style="width:70px;height:90px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#020617;border-radius:6px;border:1px solid #1e293b;">
                            <img src="${window.PixelSprites.getUnitModel(u.id, 65, 85)}" style="max-width:65px;max-height:85px;object-fit:contain;">
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:15px;font-weight:900;color:#f8fafc;">${u.name}</div>
                            <span class="showcase-rarity-pill ${rClass}" style="margin:4px 0;display:inline-block;font-size:10px;padding:2px 6px;">${u.rarity}</span>
                            <div style="display:flex;gap:6px;align-items:center;margin-top:2px;">
                                ${dmgIcon}
                                ${elemIcon}
                            </div>
                        </div>
                    </div>

                    <div style="font-size:12px;color:#94a3b8;line-height:1.4;">
                        <div><b>Placement:</b> ${u.placement} ${u.hasSoaring ? '• Soaring' : ''}</div>
                        <div><b>Attack Shape:</b> ${u.attackShape || u.attackType}</div>
                        ${u.isFarm ? `
                            <div style="color:#fde047;font-weight:800;">Wave Yield: +${u.incomePerWave} ¥ / wave</div>
                        ` : `
                            <div><b>Stats (Lv 1):</b> ${u.baseDamage} DMG • ${u.baseSpa}s SPA • ${u.baseRange} Range</div>
                        `}
                        <div><b>Deployment Cost:</b> ${u.baseCost} ¥</div>
                    </div>

                    ${passivesHtml}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // ----------------------------------------------------
    // MATERIALS WIKI (Ordered strictly by Rarity, with zero emojis)
    // ----------------------------------------------------
    renderMaterialsWiki(container) {
        // Ordered by Rarity: Common -> Rare -> Epic -> Legendary -> Mythic -> Secret
        const mats = [
            // Common
            { id: "normal_star_fruit", name: "Normal Star Fruit", tier: "Common", drop: "Every Daily & Half Hourly Challenge clear", use: "Basic evolution & alchemy component" },
            // Rare
            { id: "pink_star_fruit", name: "Pink Star Fruit", tier: "Rare", drop: "Daily & Half Hourly Challenge, Gold Shop", use: "Crafting & Evolution material" },
            { id: "blue_star_fruit", name: "Blue Star Fruit", tier: "Rare", drop: "Daily & Half Hourly Challenge, Gold Shop", use: "Crafting & Evolution material" },
            { id: "red_star_fruit", name: "Red Star Fruit", tier: "Rare", drop: "Daily & Half Hourly Challenge, Gold Shop", use: "Fire and Physical evolution material" },
            { id: "green_star_fruit", name: "Green Star Fruit", tier: "Rare", drop: "Daily & Half Hourly Challenge, Gold Shop", use: "Nature and Wind evolution material" },
            { id: "yellow_star_fruit", name: "Yellow Star Fruit", tier: "Rare", drop: "Daily & Half Hourly Challenge, Gold Shop", use: "Lightning and Light evolution material" },
            { id: "fire_scroll", name: "Fire Scroll", tier: "Rare", drop: "Mountain Legend Act 1 (5-10 guaranteed drop)", use: "Crafting & Fire enhancement material" },
            { id: "water_scroll", name: "Water Scroll", tier: "Rare", drop: "Mountain Legend Act 2 (5-10 guaranteed drop)", use: "Crafting & Water enhancement material" },
            { id: "nature_scroll", name: "Nature Scroll", tier: "Rare", drop: "Mountain Legend Act 3 (5-10 guaranteed drop)", use: "Crafting & Nature enhancement material" },
            // Epic
            { id: "trait_reroll_crystal", name: "Trait Reroll Crystal", tier: "Epic", drop: "Daily (+25), Half-Hourly (+3), Quests, Gold Shop", use: "Reroll unit traits in Trait Temple" },
            // Legendary
            { id: "light_energy", name: "Light Energy", tier: "Legendary", drop: "Hills Legend Act 1 (1-3 guaranteed drop)", use: "12 required to evolve Holy Knight into Holy Knight (Power)" },
            { id: "blaze", name: "Blaze", tier: "Legendary", drop: "Hills Legend Act 2 (1-3 guaranteed drop)", use: "12 required to evolve Flame Emperor into Flame Emperor (Ruler)" },
            // Mythic
            { id: "rainbow_star_fruit", name: "Rainbow Star Fruit", tier: "Mythic", drop: "Daily Challenge or Gold Shop", use: "Universal requirement for all unit evolutions" },
            { id: "thunder_essence", name: "Thunder Essence", tier: "Mythic", drop: "Infinite Mode (5% chance each wave)", use: "10 required to evolve Thunder God into Thunder God (Divine)" },
            { id: "nature_essence", name: "Nature Essence", tier: "Mythic", drop: "Infinite Mode (5% chance each wave)", use: "10 required to evolve Wind Master into Wind Master (Tornado)" },
            { id: "relic_shard", name: "Relic Shard", tier: "Mythic", drop: "Hills Legend Act 3 (10% chance)", use: "Forge permanent unit relics in the Blacksmith" },
            // Secret
            { id: "star_staff", name: "Star Staff", tier: "Secret", drop: "Crafting (2 Rainbow, 5 Pink, 5 Blue, 5 Yellow Star Fruits)", use: "Exclusive catalyst to awaken Star Mage into Star Mage (Explosion)" }
        ];

        let html = `
            <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:16px;">
        `;

        mats.forEach(m => {
            let iconHtml = "";
            if (m.id.includes("star_fruit")) {
                iconHtml = `<img src="${window.PixelSprites.getStarFruit(m.id, 64)}" style="width:64px;height:64px;margin:0 auto;display:block;image-rendering:pixelated;">`;
            } else if (window.PixelSprites && window.PixelSprites.getMaterialIcon) {
                iconHtml = window.PixelSprites.getMaterialIcon(m.id, 64);
            }

            html += `
                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;text-align:center;">
                    <div style="height:68px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
                        ${iconHtml}
                    </div>
                    <div style="font-size:16px;font-weight:900;color:#f8fafc;">${m.name}</div>
                    <span class="showcase-rarity-pill ${m.tier.toLowerCase()}" style="margin:6px 0;display:inline-block;font-size:11px;padding:2px 8px;">${m.tier}</span>
                    <div style="font-size:12px;color:#94a3b8;margin-top:6px;text-align:left;line-height:1.4;">
                        <div><b>Where to get:</b> ${m.drop}</div>
                        <div style="margin-top:4px;"><b>Used for:</b> ${m.use}</div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    },

    // ----------------------------------------------------
    // CRAFTING WIKI (Zero emojis, uses SVG icons, Blacksmith renamed)
    // ----------------------------------------------------
    renderCraftingWiki(container) {
        let html = `
            <div style="max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:20px;font-size:13px;color:#cbd5e1;line-height:1.6;">
                <!-- Evolution Catalysts -->
                <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:18px;">
                    <h3 style="color:#c084fc;font-size:17px;margin:0 0 10px 0;">Evolution Catalysts (Crafted from Star Fruits)</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px;">
                        <!-- Shadow Dagger -->
                        <div style="background:#1e293b;border:1px solid #475569;border-radius:8px;padding:12px;display:flex;gap:12px;align-items:center;">
                            <div style="width:48px;height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                                ${window.PixelSprites.getShadowDaggerIcon ? window.PixelSprites.getShadowDaggerIcon(44) : window.PixelSprites.getDaggerIcon(44)}
                            </div>
                            <div>
                                <div style="font-weight:900;color:#c084fc;font-size:15px;">Shadow Dagger</div>
                                <div style="font-size:11.5px;color:#94a3b8;">Needed to awaken Shadow Assassin / Void Assassin!</div>
                                <div style="margin-top:6px;font-size:12px;color:#facc15;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                    <b>Recipe:</b>
                                    <span style="display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit('rainbow_star_fruit', 16)}" style="width:16px;height:16px;"> 1 Rainbow</span>
                                    <span style="display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit('pink_star_fruit', 16)}" style="width:16px;height:16px;"> 3 Pink</span>
                                    <span style="display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit('blue_star_fruit', 16)}" style="width:16px;height:16px;"> 3 Blue</span>
                                </div>
                            </div>
                        </div>

                        <!-- Star Staff -->
                        <div style="background:#1e293b;border:1px solid #f43f5e;border-radius:8px;padding:12px;display:flex;gap:12px;align-items:center;">
                            <div style="width:48px;height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                                ${window.PixelSprites.getStarStaffIcon ? window.PixelSprites.getStarStaffIcon(44) : window.PixelSprites.getMaterialIcon('star_staff', 44)}
                            </div>
                            <div>
                                <div style="font-weight:900;color:#f43f5e;font-size:15px;">Star Staff (Secret Catalyst)</div>
                                <div style="font-size:11.5px;color:#94a3b8;">Awakens Secret Unit Star Mage into Star Mage (Explosion)!</div>
                                <div style="margin-top:6px;font-size:12px;color:#facc15;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                    <b>Recipe:</b>
                                    <span style="display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit('rainbow_star_fruit', 16)}" style="width:16px;height:16px;"> 2 Rainbow</span>
                                    <span style="display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit('pink_star_fruit', 16)}" style="width:16px;height:16px;"> 5 Pink</span>
                                    <span style="display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit('blue_star_fruit', 16)}" style="width:16px;height:16px;"> 5 Blue</span>
                                    <span style="display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit('yellow_star_fruit', 16)}" style="width:16px;height:16px;"> 5 Yellow</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Star Fruit Alchemy & Conversions -->
                <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:18px;">
                    <h3 style="color:#38bdf8;font-size:17px;margin:0 0 10px 0;">Star Fruit Alchemy Rules</h3>
                    <p style="margin:0 0 8px 0;">
                        • <b>3 Normal Star Fruits ➔ 1 Colored Star Fruit:</b> Pick any specific color you need (Pink, Red, Green, Blue, or Yellow).<br>
                        • <b>1 Colored Star Fruit ➔ 2 Normal Star Fruits:</b> Dismantle spare colored fruits back into 2 normal fruits.<br>
                        • <b>Rainbow Star Fruit:</b> Combine 1 of EVERY color (Pink, Red, Green, Blue, Yellow) into 1 supreme Rainbow Star Fruit.
                    </p>
                </div>

                <!-- Blacksmith (Relics attached to 1 unit) -->
                <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:18px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <h3 style="color:#facc15;font-size:17px;margin:0;">Blacksmith (Unit Relic Forging)</h3>
                        <span style="font-size:11px;background:#eab308;color:#000;padding:2px 8px;border-radius:4px;font-weight:900;">1 RELIC PER UNIT</span>
                    </div>
                    <p style="margin:0 0 12px 0;">
                        Relics grant powerful passive buffs to the single unit they are attached to. 1 relic can only be equipped to one unit at a time. Forged using Relic Shards dropped with a 10% chance from Hills Legend Act 3.
                    </p>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;">
                        ${[
                            { id: "relic_mangekyou", name: "Mangekyou Sharingan", cost: 10, desc: "2x Burn Duration & Piercing Damage to equipped unit" },
                            { id: "relic_blazing_core", name: "Blazing Core", cost: 5, desc: "+15% Fire & Physical Damage to equipped unit" },
                            { id: "relic_shadow_cloak", name: "Shadow Cloak", cost: 5, desc: "+15% Dark & Magical Damage to equipped unit" },
                            { id: "relic_fortune_ring", name: "Golden Fortune Ring", cost: 8, desc: "+15% Wave Yen Income when equipped unit is placed" },
                            { id: "relic_divine_eye", name: "Ancient Eye of Divination", cost: 10, desc: "+15% Attack Range to equipped unit" }
                        ].map(r => `
                            <div style="background:#1e293b;border:1px solid #eab308;border-radius:10px;padding:12px;display:flex;gap:12px;align-items:center;">
                                <div style="width:52px;height:52px;flex-shrink:0;background:#0f172a;border:1px solid #334155;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                                    ${window.PixelSprites && window.PixelSprites.getRelicIcon ? window.PixelSprites.getRelicIcon(r.id, 44) : '🛡️'}
                                </div>
                                <div style="flex:1;">
                                    <div style="font-weight:900;color:#facc15;font-size:14px;">${r.name}</div>
                                    <div style="font-size:11px;color:#38bdf8;margin:2px 0;display:flex;align-items:center;gap:4px;">
                                        ${window.PixelSprites && window.PixelSprites.getRelicShardIcon ? window.PixelSprites.getRelicShardIcon(16) : '💎'}
                                        <span>Cost: ${r.cost} Relic Shards</span>
                                    </div>
                                    <div style="font-size:11.5px;color:#4ade80;line-height:1.3;">${r.desc}</div>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    renderTraitsWiki(container) {
        const traits = Object.values(window.TRAIT_CONFIG || {});
        let html = `
            <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:14px;">
        `;
        traits.forEach(t => {
            const iconSvg = window.PixelSprites && window.PixelSprites.getTraitIcon ? window.PixelSprites.getTraitIcon(t.name, 28) : '';
            
            // Custom high-tier trait badges & glowing card borders
            let badgeStyle = "background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid #3b82f6;";
            let cardBorder = "#1e293b";
            if (t.name === "Unique") {
                badgeStyle = "background:rgba(245,158,11,0.25);color:#facc15;border:1px solid #f59e0b;box-shadow:0 0 10px rgba(245,158,11,0.5);";
                cardBorder = "#f59e0b";
            } else if (t.name === "Eternal") {
                badgeStyle = "background:rgba(192,132,252,0.25);color:#c084fc;border:1px solid #a855f7;box-shadow:0 0 10px rgba(168,85,247,0.5);";
                cardBorder = "#a855f7";
            } else if (t.name === "Divine") {
                badgeStyle = "background:rgba(250,204,21,0.25);color:#facc15;border:1px solid #eab308;box-shadow:0 0 10px rgba(234,179,8,0.5);";
                cardBorder = "#eab308";
            } else if (t.name === "Celestial") {
                badgeStyle = "background:rgba(56,189,248,0.25);color:#38bdf8;border:1px solid #0284c7;box-shadow:0 0 10px rgba(56,189,248,0.5);";
                cardBorder = "#0284c7";
            } else if (t.name === "Reaper") {
                badgeStyle = "background:rgba(239,68,68,0.25);color:#f87171;border:1px solid #ef4444;box-shadow:0 0 10px rgba(239,68,68,0.5);";
                cardBorder = "#ef4444";
            } else if (t.rarity === "Legendary") {
                badgeStyle = "background:rgba(234,179,8,0.15);color:#facc15;border:1px solid #eab308;";
            } else if (t.rarity === "Epic") {
                badgeStyle = "background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid #a855f7;";
            }

            html += `
                <div style="background:#0f172a;border:1.5px solid ${cardBorder};border-radius:10px;padding:14px;display:flex;gap:12px;align-items:center;">
                    <div style="width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#020617;border-radius:6px;border:1px solid #1e293b;">
                        ${iconSvg}
                    </div>
                    <div>
                        <div style="font-size:15px;font-weight:900;color:#f8fafc;">${t.name}</div>
                        <span style="font-size:10px;padding:2px 8px;margin:2px 0;display:inline-block;border-radius:10px;font-weight:800;${badgeStyle}">${t.rarity} • ${t.chance}%</span>
                        <div style="font-size:12px;color:#cbd5e1;margin-top:2px;">${t.description}</div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    renderFoodWiki(container) {
        const foods = [
            { id: "rice_ball", name: "Rice Ball", exp: 50, price: 150, desc: "Light meal for quick early training." },
            { id: "dorayaki", name: "Dorayaki", exp: 200, price: 500, desc: "Sweet red bean pancake boosting unit experience." },
            { id: "kings_feast", name: "King's Feast (Bento)", exp: 800, price: 1800, desc: "Gourmet feast granting massive unit EXP levels." },
            { id: "dragon_ramen", name: "Dragon Ramen", exp: 3000, price: 6000, desc: "Supreme mythical bowl that propels level 1 units straight into the 30s!" }
        ];

        let html = `
            <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:16px;">
        `;
        foods.forEach(f => {
            const iconSvg = window.PixelSprites ? window.PixelSprites.getFoodIcon(f.id, 64) : '';
            html += `
                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;text-align:center;">
                    <div style="height:68px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
                        ${iconSvg}
                    </div>
                    <div style="font-size:16px;font-weight:900;color:#f8fafc;">${f.name}</div>
                    <div style="color:#38bdf8;font-weight:800;font-size:13px;margin:4px 0;">+${f.exp} Unit EXP</div>
                    <div style="font-size:12px;color:#94a3b8;line-height:1.4;">${f.desc}</div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    renderEnemiesWiki(container) {
        const enemies = Object.values(window.ENEMY_CONFIG || {});
        let html = `
            <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill, minmax(270px, 1fr));gap:14px;">
        `;
        enemies.forEach(e => {
            const spriteUrl = window.PixelSprites ? window.PixelSprites.getEnemySprite(e.id, 56) : '';
            html += `
                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:14px;display:flex;gap:12px;align-items:center;">
                    <div style="width:56px;height:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#020617;border-radius:6px;border:1px solid #1e293b;">
                        <img src="${spriteUrl}" style="max-width:50px;max-height:50px;">
                    </div>
                    <div>
                        <div style="font-size:15px;font-weight:900;color:#f8fafc;">${e.name}</div>
                        <span style="font-size:10px;background:#334155;color:#e2e8f0;padding:2px 6px;border-radius:4px;font-weight:800;">${e.isBoss ? 'BOSS' : (e.isFlying ? 'FLYING' : 'GROUND')}</span>
                        <div style="font-size:11.5px;color:#94a3b8;margin-top:4px;">${e.description}</div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    renderMechanicsWiki(container) {
        let html = `
            <div style="max-width:850px;margin:0 auto;display:flex;flex-direction:column;gap:18px;font-size:13px;color:#cbd5e1;line-height:1.6;">
                <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:18px;">
                    <h3 style="color:#38bdf8;font-size:17px;margin:0 0 8px 0;">Ground vs Hill vs Soaring</h3>
                    <p style="margin:0;">
                        • <b>Ground Tiles:</b> Defend against walking mobs. Ground units CANNOT target Flying enemies.<br>
                        • <b>Hill Tiles:</b> Elevated vantage points. Hill units CAN target Flying enemies.<br>
                        • <b>Hybrid Units:</b> Can be placed on both Ground or Hill tiles.<br>
                        • <b>Soaring:</b> Special aerial bonus. Only activates when placed on a Hill tile.
                    </p>
                </div>

                <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:18px;">
                    <h3 style="color:#facc15;font-size:17px;margin:0 0 8px 0;">Farm Units (Speedwagon & Bulma Mechanics)</h3>
                    <p style="margin:0;">
                        • <b>Silver Banker (Epic):</b> Speedwagon equivalent. Base cost 400 Yen, yields 250 Yen/wave scaling up to 2,600 Yen/wave.<br>
                        • <b>Gold Alchemist (Legendary):</b> Bulma equivalent. Base cost 850 Yen, yields 450 Yen/wave scaling up to 8,200 Yen/wave.<br>
                        • Farm units produce pure Yen payouts and have zero combat passives.
                    </p>
                </div>

                <div style="background:#0f172a;border:1px solid #6366f1;border-radius:12px;padding:18px;">
                    <h3 style="color:#a5b4fc;font-size:17px;margin:0 0 8px 0;">Infinite Mode Scaling & Essence Drops</h3>
                    <p style="margin:0;">
                        • <b>Essence Drops:</b> 5% chance every wave to obtain Thunder Essence (evolves Thunder God) or Nature Essence (evolves Wind Master).<br>
                        • <b>Milestone Gems:</b> Scaling Gems awarded every 5 waves (+35 to +800 Gems).
                    </p>
                </div>

                <div style="background:#0f172a;border:1px solid #a855f7;border-radius:12px;padding:18px;">
                    <h3 style="color:#e9d5ff;font-size:17px;margin:0 0 8px 0;">Release Event & Secret Star Mage</h3>
                    <p style="margin:0;">
                        • 20 challenging waves against the World Boss Demon.<br>
                        • 500 Gems rewarded every match.<br>
                        • <b>0.75% Chance</b> to obtain Secret Unit Star Mage (Release Event exclusive).<br>
                        • Star Mage awakens into <b>Star Mage (Explosion)</b> using the Star Staff.
                    </p>
                </div>
            </div>
        `;
        container.innerHTML = html;
    },

    // ====================================================
    // OFFICIAL TIER LIST (EVOLVED ONLY)
    // ====================================================
    renderTierListWiki(container) {
        const tierGroups = [
            {
                name: "META UNITS",
                badgeColor: "#ec4899",
                bgGradient: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(15,23,42,0.8))",
                desc: "The absolute best units in the game with top tier damage and execution.",
                unitIds: ["shinobi_god", "thunder_god_awakened", "star_mage_explosion", "vampire_king"]
            },
            {
                name: "GOOD HILL",
                badgeColor: "#10b981",
                bgGradient: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(15,23,42,0.8))",
                desc: "Long-range cliff champions capable of targeting flying threats or vortexing mobs.",
                unitIds: ["hunter", "star_mage", "wind_master_awakened", "pyro_archer"]
            },
            {
                name: "GOOD GROUND",
                badgeColor: "#3b82f6",
                bgGradient: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(15,23,42,0.8))",
                desc: "Excellent ground defenders dealing heavy area damage and sustained laser melts.",
                unitIds: ["robot", "shadow_assassin_awakened", "flame_emperor_awakened", "holy_knight_awakened"]
            },
            {
                name: "SUPPORT",
                badgeColor: "#a855f7",
                bgGradient: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(15,23,42,0.8))",
                desc: "Summoner and support commanding allied units from base.",
                unitIds: ["commander"]
            },
            {
                name: "FARMS",
                badgeColor: "#facc15",
                bgGradient: "linear-gradient(135deg, rgba(250,204,21,0.15), rgba(15,23,42,0.8))",
                desc: "Generates massive Yen payouts every wave to finance high-tier towers.",
                unitIds: ["gold_alchemist", "silver_banker"]
            },
            {
                name: "GARBAGE",
                badgeColor: "#64748b",
                bgGradient: "linear-gradient(135deg, rgba(100,116,139,0.15), rgba(15,23,42,0.8))",
                desc: "Starter units easily outclassed by higher rarities. Kept strictly for early stages.",
                unitIds: ["swordsman", "frost_weaver", "breeze_scout", "iron_slinger", "ember_apprentice"]
            }
        ];

        let html = `
            <div style="margin-bottom:24px;">
                <h2 style="color:#60a5fa;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                    <span>🏆</span> Official Tower Defense Tier List
                </h2>
                <p style="color:#94a3b8;font-size:14px;margin-bottom:20px;">
                    Ranked strictly from best to worst. Displays Evolved Mythics and relevant game tiers. Unevolved Mythics are omitted from the tier list but fully usable in the DPS Calculator.
                </p>
            </div>
            <div style="display:flex;flex-direction:column;gap:20px;">
        `;

        tierGroups.forEach(group => {
            html += `
                <div style="background:${group.bgGradient};border:1px solid #334155;border-left:5px solid ${group.badgeColor};border-radius:10px;padding:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
                        <h3 style="color:${group.badgeColor};margin:0;font-size:16px;letter-spacing:0.5px;">${group.name}</h3>
                        <span style="font-size:12px;color:#94a3b8;">${group.desc}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:12px;margin-top:12px;">
            `;

            group.unitIds.forEach(uId => {
                const conf = window.UNIT_CONFIG && window.UNIT_CONFIG[uId];
                if (!conf) return;

                // Max stats calculation
                const maxUpg = conf.upgrades && conf.upgrades.length > 0 ? conf.upgrades[conf.upgrades.length - 1] : null;
                const maxDmg = maxUpg ? maxUpg.damage : conf.baseDamage;
                const maxSpa = maxUpg ? maxUpg.spa : conf.baseSpa;
                const rawDps = maxSpa > 0 ? (maxDmg / maxSpa).toFixed(1) : 0;

                let roleBadge = conf.placement || "Ground";
                if (conf.isFarm) roleBadge = "Farm";
                else if (conf.isSupport) roleBadge = "Support";

                const dmgColor = conf.damageType === "Magical" ? "#c084fc" : "#f59e0b";
                const elemColor = {
                    "Fire": "#ef4444",
                    "Aqua": "#38bdf8",
                    "Nature": "#22c55e",
                    "Storm": "#a855f7",
                    "Light": "#facc15",
                    "Dark": "#7c3aed"
                }[conf.element] || "#94a3b8";

                html += `
                    <div style="background:#0b1324;border:1px solid #1e293b;border-radius:8px;padding:10px;display:flex;gap:12px;align-items:center;">
                        <img src="${window.PixelSprites ? window.PixelSprites.getUnitSprite(conf.id, 56) : ''}" style="width:56px;height:56px;border-radius:6px;border:1px solid #3b82f6;background:#0f172a;object-fit:contain;">
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                <strong style="color:#f1f5f9;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${conf.name}</strong>
                                <span class="rarity-badge ${conf.rarity.toLowerCase()}" style="font-size:10px;padding:2px 6px;">${conf.rarity}</span>
                            </div>
                            <div style="font-size:11px;color:#94a3b8;display:flex;gap:8px;align-items:center;margin-bottom:3px;flex-wrap:wrap;">
                                <span>Role: <b style="color:#38bdf8;">${roleBadge}</b></span>
                                <span>DPS: <b style="color:#fde047;">${conf.isFarm ? 'Yen' : rawDps}</b></span>
                            </div>
                            <div style="font-size:10px;display:flex;gap:8px;align-items:center;margin-bottom:3px;flex-wrap:wrap;">
                                <span style="background:rgba(255,255,255,0.05);padding:1px 5px;border-radius:4px;border:1px solid ${dmgColor};color:${dmgColor};font-weight:700;">⚔️ ${conf.damageType || 'Physical'}</span>
                                <span style="background:rgba(255,255,255,0.05);padding:1px 5px;border-radius:4px;border:1px solid ${elemColor};color:${elemColor};font-weight:700;">🔮 ${conf.element || 'None'}</span>
                            </div>
                            <div style="font-size:10px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                ${(conf.description || "").replace(/\s*\(\d+[r|px]+\)/gi, "").replace(/\s*\([^)]*aoe[^)]*\)/gi, "")}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        html += `</div>`;
        container.innerHTML = html;
    },

    // ====================================================
    // DPS CALCULATOR (INCLUDES UNEVOLVED MYTHICS & TRAITS)
    // ====================================================
    // ====================================================
    // DPS CALCULATOR (INCLUDES UNEVOLVED MYTHICS & TRAITS)
    // ====================================================
    renderDPSCalcWiki(container) {
        if (!this.dpsCalcState) {
            this.dpsCalcState = {
                unitId: "shinobi_god",
                upgradeLevel: "max",
                unitLevel: 1,
                trait: "None",
                isHill: false,
                targetType: "normal", // normal, boss, low_hp, flying
                passivesEnabled: {}
            };
        }

        const state = this.dpsCalcState;
        const allUnits = window.UNIT_CONFIG || {};
        const currentUnit = allUnits[state.unitId] || allUnits["shinobi_god"];

        // Initialize active passives if not set
        if (!state.passivesEnabled || typeof state.passivesEnabled !== 'object') {
            state.passivesEnabled = {};
        }
        (currentUnit.passives || []).forEach(p => {
            if (state.passivesEnabled[p.name] === undefined) {
                state.passivesEnabled[p.name] = true;
            }
        });

        // Generate upgrade options dynamically strictly bounded to this unit's upgrade array
        const upgCount = (currentUnit.upgrades || []).length;
        let upgOptionsHtml = "";
        
        if (currentUnit.isFarm) {
            upgOptionsHtml += `<option value="0" ${state.upgradeLevel === "0" ? "selected" : ""}>Base (Lv 0) - Cost: ${currentUnit.baseCost || 400}¥ | Yield: ${currentUnit.incomePerWave || 200}¥/w</option>`;
            for (let i = 1; i <= upgCount; i++) {
                const up = currentUnit.upgrades[i - 1];
                const isSel = state.upgradeLevel === String(i) ? "selected" : "";
                upgOptionsHtml += `<option value="${i}" ${isSel}>Upgrade ${i} - Cost: +${up.cost || 0}¥ | Yield: ${up.incomePerWave || up.income || 0}¥/w</option>`;
            }
        } else {
            upgOptionsHtml += `<option value="0" ${state.upgradeLevel === "0" ? "selected" : ""}>Base (Lv 0) - Dmg: ${currentUnit.baseDamage} | SPA: ${currentUnit.baseSpa}s | Rng: ${currentUnit.baseRange}</option>`;
            for (let i = 1; i <= upgCount; i++) {
                const up = currentUnit.upgrades[i - 1];
                const isSel = state.upgradeLevel === String(i) ? "selected" : "";
                upgOptionsHtml += `<option value="${i}" ${isSel}>Upgrade ${i} (+${up.cost || 0}¥) - Dmg: ${up.damage} | SPA: ${up.spa}s | Rng: ${up.range}</option>`;
            }
        }
        upgOptionsHtml += `<option value="max" ${state.upgradeLevel === "max" ? "selected" : ""}>Max Upgraded (${upgCount} upgrades)</option>`;

        // Trait options from TRAIT_CONFIG
        const traits = window.TRAIT_CONFIG || {};
        let traitOptionsHtml = `<option value="None" ${state.trait === "None" ? 'selected' : ''}>None (No Trait)</option>`;
        Object.keys(traits).forEach(tName => {
            const tr = traits[tName];
            const isSel = state.trait === tName ? 'selected' : '';
            traitOptionsHtml += `<option value="${tName}" ${isSel}>${tName} (${tr.description})</option>`;
        });

        let html = `
            <div style="margin-bottom:20px;">
                <h2 style="color:#38bdf8;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
                    <span>🧮</span> Interactive Tower DPS & Economy Calculator
                </h2>
                <p style="color:#94a3b8;font-size:14px;margin:0;">
                    Calculate exact damage, attack speed (SPA), unit level compounding, traits, target bonuses, and farm income.
                </p>
            </div>

            <!-- Controls Panel -->
            <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:16px;margin-bottom:20px;">
                <!-- Unit Select -->
                <div>
                    <label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">SELECT UNIT</label>
                    <select id="calc-unit-select" onchange="WikiController.changeDPSCalcUnit(this.value)" style="width:100%;padding:10px;background:#1e293b;color:#f8fafc;border:1px solid #334155;border-radius:8px;font-size:13px;">
        `;

        Object.keys(allUnits).forEach(uId => {
            const u = allUnits[uId];
            const sel = (uId === state.unitId) ? 'selected' : '';
            html += `<option value="${uId}" ${sel}>[${u.rarity}] ${u.name} (${(u.upgrades || []).length} Upgs)</option>`;
        });

        html += `
                    </select>
                </div>

                <!-- Upgrade Level Select -->
                <div>
                    <label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">UPGRADE LEVEL (${upgCount} max)</label>
                    <select id="calc-upg-select" onchange="WikiController.updateDPSCalc('upgradeLevel', this.value)" style="width:100%;padding:10px;background:#1e293b;color:#f8fafc;border:1px solid #334155;border-radius:8px;font-size:13px;">
                        ${upgOptionsHtml}
                    </select>
                </div>

                <!-- Unit Level (1-100) -->
                <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <label style="font-size:12px;font-weight:700;color:#94a3b8;">UNIT LEVEL</label>
                        <span id="calc-level-label" style="font-size:11px;color:#38bdf8;font-weight:700;">Lv ${state.unitLevel || 1} (+${((Math.pow(1.01, (state.unitLevel || 1) - 1) - 1) * 100).toFixed(1)}% Dmg)</span>
                    </div>
                    <div style="display:flex;gap:6px;align-items:center;">
                        <input id="calc-level-slider" type="range" min="1" max="100" value="${state.unitLevel || 1}" oninput="WikiController.updateDPSCalc('unitLevel', parseInt(this.value, 10))" style="flex:1;cursor:pointer;">
                        <input id="calc-level-input" type="number" min="1" max="100" value="${state.unitLevel || 1}" oninput="WikiController.updateDPSCalc('unitLevel', Math.max(1, Math.min(100, parseInt(this.value, 10) || 1)))" onchange="WikiController.updateDPSCalc('unitLevel', Math.max(1, Math.min(100, parseInt(this.value, 10) || 1)))" style="width:54px;padding:6px;background:#1e293b;color:#f8fafc;border:1px solid #334155;border-radius:6px;font-size:12px;text-align:center;">
                    </div>
                </div>

                <!-- Trait Select -->
                <div>
                    <label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">EQUIPPED TRAIT</label>
                    <select id="calc-trait-select" onchange="WikiController.updateDPSCalc('trait', this.value)" style="width:100%;padding:10px;background:#1e293b;color:#f8fafc;border:1px solid #334155;border-radius:8px;font-size:13px;">
                        ${traitOptionsHtml}
                    </select>
                </div>

                <!-- Target Type Scenario -->
                <div>
                    <label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">ENEMY TARGET SCENARIO</label>
                    <select id="calc-target-select" onchange="WikiController.updateDPSCalc('targetType', this.value)" style="width:100%;padding:10px;background:#1e293b;color:#f8fafc;border:1px solid #334155;border-radius:8px;font-size:13px;">
                        <option value="normal" ${state.targetType === "normal" ? 'selected' : ''}>Normal Enemy (>30% HP)</option>
                        <option value="boss" ${state.targetType === "boss" ? 'selected' : ''}>Boss Enemy (Triggers Reaper/Boss passives)</option>
                        <option value="low_hp" ${state.targetType === "low_hp" ? 'selected' : ''}>Low HP Enemy (<30% HP, Triggers Culling)</option>
                        <option value="flying" ${state.targetType === "flying" ? 'selected' : ''}>Flying Enemy (Triggers Anti-Air Hunter)</option>
                    </select>
                </div>

                <!-- Hill Vantage Placement -->
                <div>
                    <label style="display:block;font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px;">TILE PLACEMENT</label>
                    <label style="display:flex;align-items:center;gap:8px;background:#1e293b;padding:9px 12px;border-radius:8px;border:1px solid ${state.isHill ? '#38bdf8' : '#334155'};cursor:pointer;margin-top:1px;">
                        <input type="checkbox" ${state.isHill ? 'checked' : ''} onchange="WikiController.updateDPSCalc('isHill', this.checked)" style="width:18px;height:18px;cursor:pointer;">
                        <span style="font-size:12px;color:${state.isHill ? '#38bdf8' : '#cbd5e1'};font-weight:700;">⛰️ Hill Tile (Hits Soaring)</span>
                    </label>
                </div>
            </div>

            <!-- Customizable Passives Checklist -->
            <div style="background:#0b1324;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:20px;">
                <div style="font-size:13px;font-weight:800;color:#38bdf8;margin-bottom:10px;">
                    ⚡ ACTIVATE PASSIVES (Select to include in calculations):
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${(currentUnit.passives && currentUnit.passives.length > 0) ? currentUnit.passives.map(p => {
                        const isChecked = state.passivesEnabled[p.name] !== false;
                        return `
                            <label style="display:flex;align-items:flex-start;gap:10px;background:#0f172a;padding:8px 12px;border-radius:8px;border:1px solid ${isChecked ? '#3b82f6' : '#1e293b'};cursor:pointer;">
                                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="WikiController.togglePassive('${p.name}', this.checked)" style="margin-top:2px;width:18px;height:18px;cursor:pointer;">
                                <div>
                                    <strong style="color:${isChecked ? '#60a5fa' : '#94a3b8'};font-size:13px;">${p.name}</strong>
                                    <div style="color:#cbd5e1;font-size:12px;margin-top:2px;">${p.desc || p.description || ''}</div>
                                </div>
                            </label>
                        `;
                    }).join('') : `
                        <div style="color:#64748b;font-size:12px;font-style:italic;">This unit does not have native passive abilities.</div>
                    `}
                </div>
            </div>

            <!-- Calculation Results Screen -->
            <div id="dps-calc-result-area">
                ${this.computeDPSCalcHtml(state)}
            </div>
        `;

        container.innerHTML = html;
    },

    changeDPSCalcUnit(uId) {
        if (!this.dpsCalcState) this.dpsCalcState = {};
        this.dpsCalcState.unitId = uId;
        this.dpsCalcState.upgradeLevel = "max";
        this.dpsCalcState.passivesEnabled = {};
        const container = document.getElementById("wiki-content-area");
        if (container) {
            this.renderDPSCalcWiki(container);
        }
    },

    togglePassive(pName, isChecked) {
        if (!this.dpsCalcState) this.dpsCalcState = {};
        if (!this.dpsCalcState.passivesEnabled) this.dpsCalcState.passivesEnabled = {};
        this.dpsCalcState.passivesEnabled[pName] = isChecked;
        const resultArea = document.getElementById("dps-calc-result-area");
        if (resultArea) {
            resultArea.innerHTML = this.computeDPSCalcHtml(this.dpsCalcState);
        }
    },

    updateDPSCalc(key, val) {
        if (!this.dpsCalcState) this.dpsCalcState = {};
        this.dpsCalcState[key] = val;
        
        // If updating unitLevel, sync slider, input, and label text
        if (key === "unitLevel") {
            const lvl = Math.max(1, Math.min(100, parseInt(val, 10) || 1));
            this.dpsCalcState.unitLevel = lvl;
            const slider = document.getElementById("calc-level-slider");
            const input = document.getElementById("calc-level-input");
            const label = document.getElementById("calc-level-label");
            if (slider && slider.value != lvl) slider.value = lvl;
            if (input && input.value != lvl) input.value = lvl;
            if (label) {
                const bonus = ((Math.pow(1.01, lvl - 1) - 1) * 100).toFixed(1);
                label.textContent = `Lv ${lvl} (+${bonus}% Dmg)`;
            }
        }
        
        // Re-render calculation result area
        const resultArea = document.getElementById("dps-calc-result-area");
        if (resultArea) {
            resultArea.innerHTML = this.computeDPSCalcHtml(this.dpsCalcState);
        }
    },

    computeDPSCalcHtml(state) {
        const u = window.UNIT_CONFIG && window.UNIT_CONFIG[state.unitId];
        if (!u) return `<p style="color:#ef4444;">Unit not found.</p>`;

        const maxUpgs = (u.upgrades || []).length;
        let lvl = state.upgradeLevel === "max" ? maxUpgs : parseInt(state.upgradeLevel, 10);
        if (lvl > maxUpgs) lvl = maxUpgs;
        if (isNaN(lvl) || lvl < 0) lvl = 0;

        // Total cash investment up to this upgrade
        let totalInvested = u.baseCost || 400;
        for (let i = 0; i < lvl; i++) {
            if (u.upgrades && u.upgrades[i]) {
                totalInvested += (u.upgrades[i].cost || 0);
            }
        }

        // ----------------------------------------------------
        // FARM UNIT ECONOMY CALCULATOR (Speedwagon / Bulma)
        // ----------------------------------------------------
        if (u.isFarm) {
            let baseIncome = u.incomePerWave || 200;
            if (lvl > 0 && u.upgrades && u.upgrades[lvl - 1]) {
                const upg = u.upgrades[lvl - 1];
                baseIncome = upg.incomePerWave || upg.income || baseIncome;
            }

            // Apply Fortune trait if equipped (+20% farm income)
            let incomeMult = 1.0;
            const trConf = window.TRAIT_CONFIG && window.TRAIT_CONFIG[state.trait];
            if (trConf && trConf.incomeBonus) {
                incomeMult += trConf.incomeBonus;
            }

            const effectiveIncome = Math.round(baseIncome * incomeMult);
            const payoffWaves = effectiveIncome > 0 ? (totalInvested / effectiveIncome).toFixed(1) : "N/A";
            const maxPlacement = u.maxPlacements || (u.id === "gold_alchemist" ? 1 : 3);
            const totalMaxTeamIncome = effectiveIncome * maxPlacement;

            return `
                <div style="background:#0b1324;border:2px solid #eab308;border-radius:12px;padding:20px;box-shadow:0 10px 25px rgba(234,179,8,0.2);">
                    <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;border-bottom:1px solid #1e293b;padding-bottom:16px;flex-wrap:wrap;">
                        <img src="${window.PixelSprites ? window.PixelSprites.getUnitSprite(u.id, 64) : ''}" style="width:64px;height:64px;border-radius:8px;border:2px solid #eab308;background:#0f172a;object-fit:contain;">
                        <div>
                            <h3 style="color:#f8fafc;margin:0 0 4px 0;font-size:18px;">${u.name} (Upgrade ${lvl} / ${maxUpgs})</h3>
                            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                                <span class="rarity-badge ${u.rarity.toLowerCase()}">${u.rarity}</span>
                                <span style="background:rgba(234,179,8,0.2);color:#facc15;border:1px solid #eab308;padding:2px 8px;border-radius:6px;font-weight:800;font-size:11px;">🌾 ECONOMY FARM TOWER</span>
                                <span style="color:#94a3b8;font-size:12px;">Map Limit: <b>${maxPlacement} unit${maxPlacement > 1 ? 's' : ''}</b></span>
                            </div>
                        </div>
                    </div>

                    <!-- Farm Stats Grid -->
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:14px;margin-bottom:20px;">
                        <div style="background:#0f172a;padding:14px;border-radius:8px;border:1px solid #eab308;text-align:center;box-shadow:0 0 15px rgba(234,179,8,0.15);">
                            <span style="font-size:11px;color:#facc15;font-weight:700;display:block;">WAVE YEN PAYOUT</span>
                            <strong style="font-size:24px;color:#fde047;">${effectiveIncome.toLocaleString()} ¥</strong>
                            <span style="font-size:10px;color:#ca8a04;display:block;">Paid out at start of every wave</span>
                        </div>
                        <div style="background:#0f172a;padding:14px;border-radius:8px;border:1px solid #1e293b;text-align:center;">
                            <span style="font-size:11px;color:#94a3b8;display:block;">TOTAL CASH INVESTED</span>
                            <strong style="font-size:22px;color:#38bdf8;">${totalInvested.toLocaleString()} ¥</strong>
                            <span style="font-size:10px;color:#64748b;display:block;">Base ${u.baseCost}¥ + Upgrades</span>
                        </div>
                        <div style="background:#0f172a;padding:14px;border-radius:8px;border:1px solid #1e293b;text-align:center;">
                            <span style="font-size:11px;color:#94a3b8;display:block;">BREAK-EVEN TIME</span>
                            <strong style="font-size:22px;color:#4ade80;">~${payoffWaves} Waves</strong>
                            <span style="font-size:10px;color:#64748b;display:block;">Invested Cash ÷ Payout</span>
                        </div>
                        <div style="background:#0f172a;padding:14px;border-radius:8px;border:1px solid #22c55e;text-align:center;box-shadow:0 0 15px rgba(34,197,94,0.15);">
                            <span style="font-size:11px;color:#86efac;font-weight:700;display:block;">MAX TEAM YIELD (x${maxPlacement})</span>
                            <strong style="font-size:24px;color:#22c55e;">${totalMaxTeamIncome.toLocaleString()} ¥/w</strong>
                            <span style="font-size:10px;color:#4ade80;display:block;">If max cap placed on field</span>
                        </div>
                    </div>

                    <!-- Breakdown -->
                    <div style="background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:14px;">
                        <strong style="color:#facc15;font-size:12px;display:block;margin-bottom:6px;">📊 FARM ECONOMY BREAKDOWN:</strong>
                        <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:12px;line-height:1.6;">
                            <li><b>Base Yield at Upgrade ${lvl}:</b> ${baseIncome.toLocaleString()} ¥/wave</li>
                            ${trConf && trConf.incomeBonus ? `<li style="color:#4ade80;"><b>Fortune Trait Bonus:</b> +${Math.round(trConf.incomeBonus * 100)}% extra Yen (+${effectiveIncome - baseIncome} ¥/wave)</li>` : `<li><b>Trait:</b> None (+0% bonus)</li>`}
                            <li><b>Placement Limit:</b> Strictly limited to ${maxPlacement} placement${maxPlacement > 1 ? 's' : ''} on the battlefield.</li>
                            <li><b>Sell Refund:</b> In battle, selling this tower refunds 50% of total invested cash (<b>${Math.floor(totalInvested * 0.50).toLocaleString()} ¥</b>).</li>
                        </ul>
                    </div>
                </div>
            `;
        }

        // ----------------------------------------------------
        // COMBAT UNIT DPS CALCULATOR
        // ----------------------------------------------------
        // Base stats at selected upgrade
        let baseDmg = u.baseDamage;
        let baseSpa = u.baseSpa;
        let baseRng = u.baseRange;

        if (lvl > 0 && u.upgrades && u.upgrades[lvl - 1]) {
            const upg = u.upgrades[lvl - 1];
            baseDmg = upg.damage !== undefined ? upg.damage : baseDmg;
            baseSpa = upg.spa !== undefined ? upg.spa : baseSpa;
            baseRng = upg.range !== undefined ? upg.range : baseRng;
        }

        // Unit Level Compounding Scaling: 1.01^(lvl - 1)
        const unitLvl = Math.max(1, Math.min(100, Math.round(state.unitLevel || 1)));
        const levelMult = Math.pow(1.01, unitLvl - 1);
        let currentDmg = baseDmg * levelMult;

        // Trait Modifiers
        let traitDmgBonus = 0;
        let traitSpaReduction = 0;
        let traitRangeBonus = 0;
        const trConf = window.TRAIT_CONFIG && window.TRAIT_CONFIG[state.trait];
        if (trConf) {
            traitDmgBonus = trConf.damageBonus || 0;
            traitSpaReduction = trConf.spaReduction || 0;
            traitRangeBonus = trConf.rangeBonus || 0;
        }

        let effectiveDmg = currentDmg * (1 + traitDmgBonus);
        let effectiveSpa = Math.max(0.2, +(baseSpa * (1 - traitSpaReduction)).toFixed(2));
        let effectiveRng = Math.round(baseRng * (1 + traitRangeBonus));

        const rawDps = effectiveSpa > 0 ? (effectiveDmg / effectiveSpa) : 0;

        // Passive Multipliers & Conditional Mechanics
        let realDpsMult = 1.0;
        const notes = [];
        const passivesOn = state.passivesEnabled || {};

        notes.push(`📈 Unit Level ${unitLvl}: x${levelMult.toFixed(2)} (+${((levelMult - 1) * 100).toFixed(1)}% base damage)`);

        if (trConf) {
            if (traitDmgBonus > 0) notes.push(`✨ ${trConf.name} Trait: +${Math.round(traitDmgBonus * 100)}% Damage`);
            if (traitSpaReduction > 0) notes.push(`⚡ ${trConf.name} Trait: -${Math.round(traitSpaReduction * 100)}% SPA`);
            if (traitRangeBonus > 0) notes.push(`🎯 ${trConf.name} Trait: +${Math.round(traitRangeBonus * 100)}% Range`);
        }

        // Hill Soaring
        if (state.isHill && u.hasSoaring) {
            notes.push("🪽 Soaring capability active (Hits Soaring enemies)");
        }

        // Culling trait (+20% under 30% HP)
        if (trConf && trConf.cullingBonus && state.targetType === "low_hp") {
            realDpsMult += trConf.cullingBonus;
            notes.push(`💀 Culling Trait: +${Math.round(trConf.cullingBonus * 100)}% Damage against low HP enemies (<30%)`);
        }

        // Reaper trait (+25% vs bosses)
        if (trConf && trConf.bossDamageBonus && state.targetType === "boss") {
            realDpsMult += trConf.bossDamageBonus;
            notes.push(`🩸 Reaper Trait: +${Math.round(trConf.bossDamageBonus * 100)}% Damage against Bosses`);
        }

        // Unit-Specific Passives
        if (u.id === "shinobi" || u.id === "shinobi_god") {
            if (passivesOn["Black Flame Ignition"] !== false && passivesOn["Infernal Amaterasu"] !== false) {
                const burnBonus = (u.id === "shinobi_god" ? 0.35 : 0.25);
                realDpsMult += burnBonus;
                notes.push(`🔥 Black Flames Burn: 100% of unit damage over 3s (+${Math.round(burnBonus * 100)}% effective DPS)`);
            }
            if (passivesOn["Heavenly Meteor"]) {
                notes.push("☄️ Heavenly Meteor: 350% burst strike unlocked");
            }
        } else if (u.id === "flame_emperor" || u.id === "flame_emperor_awakened") {
            if (passivesOn["Ignition Blaze"] !== false && passivesOn["Infernal Blaze"] !== false) {
                realDpsMult += 0.15;
                notes.push("🔥 Lingering Fire Burn: 50% of unit damage over 3s (+15% effective DPS)");
            }
            if (passivesOn["Scorched Earth"]) {
                realDpsMult += 0.20;
                notes.push("🌋 Scorched Earth: +20% bonus damage vs burning targets");
            }
        } else if (u.id === "shadow_assassin_awakened") {
            if (passivesOn["Endless Hunt"]) {
                realDpsMult += 0.30;
                notes.push("⚔️ Endless Hunt: +30% maximum damage from kill stacks");
            }
            if (passivesOn["Phantom Rhythm"]) {
                realDpsMult += 0.05;
                notes.push("🗡️ Phantom Rhythm: +50% bonus damage on every 10th attack");
            }
        } else if (u.id === "thunder_god_awakened") {
            if (passivesOn["Divine Chain Lightning"]) {
                notes.push("⚡ Divine Chain Lightning: Jumps to 4 targets (25% falloff per jump)");
            }
            if (passivesOn["Thunderous Overload"]) {
                realDpsMult += 0.15;
                notes.push("⚡ Thunderous Overload: +15% damage to shocked targets");
            }
        } else if (u.id === "thunder_god") {
            if (passivesOn["Shocking Discharge"]) {
                notes.push("⚡ Chain Lightning: Jumps to 3 targets (25% falloff per jump)");
            }
        } else if (u.id === "vampire_king") {
            if (passivesOn["Blood Curse"]) {
                realDpsMult += 0.15;
                notes.push("🩸 Blood Curse: 50% bleed damage over 8s");
            }
            if (passivesOn["Crimson Feast"]) {
                realDpsMult += 0.15;
                notes.push("🩸 Crimson Feast: +15% direct damage to bleeding targets");
            }
        } else if (u.id === "star_mage_explosion") {
            if (passivesOn["Stellar Blast Zone"]) {
                realDpsMult += 0.30;
                notes.push("✨ Stellar Blast Zone: +30% extra light damage on hit enemies");
            }
            if (passivesOn["Cosmic Execution"] && state.targetType === "boss") {
                realDpsMult += 0.25;
                notes.push("🌟 Cosmic Execution: +25% bonus damage against Bosses");
            }
        } else if (u.id === "hunter" && state.targetType === "flying") {
            if (passivesOn["Eagle Eye"] !== false) {
                realDpsMult += 0.35;
                notes.push("🦅 Eagle Eye: +35% bonus damage against Flying targets");
            }
        }

        const realDps = rawDps * realDpsMult;

        return `
            <div style="background:#0b1324;border:2px solid #3b82f6;border-radius:12px;padding:20px;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
                <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;border-bottom:1px solid #1e293b;padding-bottom:16px;flex-wrap:wrap;">
                    <img src="${window.PixelSprites ? window.PixelSprites.getUnitSprite(u.id, 64) : ''}" style="width:64px;height:64px;border-radius:8px;border:2px solid #3b82f6;background:#0f172a;object-fit:contain;">
                    <div>
                        <h3 style="color:#f8fafc;margin:0 0 4px 0;font-size:18px;">${u.name} (Upgrade ${lvl} / ${maxUpgs})</h3>
                        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                            <span class="rarity-badge ${u.rarity.toLowerCase()}">${u.rarity}</span>
                            <span style="color:#38bdf8;font-size:12px;font-weight:700;">Lv ${unitLvl}</span>
                            <span style="color:#94a3b8;font-size:12px;">Role: <b>${u.placement || "Ground"}</b></span>
                            <span style="color:#94a3b8;font-size:12px;">Total Cash Invested: <b>${totalInvested.toLocaleString()} ¥</b></span>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:14px;margin-bottom:20px;">
                    <div style="background:#0f172a;padding:12px;border-radius:8px;border:1px solid #1e293b;text-align:center;">
                        <span style="font-size:11px;color:#94a3b8;display:block;">DAMAGE PER HIT</span>
                        <strong style="font-size:22px;color:#f43f5e;">${Math.round(effectiveDmg).toLocaleString()}</strong>
                        <span style="font-size:10px;color:#64748b;display:block;">Base: ${baseDmg} × Lv & Trait</span>
                    </div>
                    <div style="background:#0f172a;padding:12px;border-radius:8px;border:1px solid #1e293b;text-align:center;">
                        <span style="font-size:11px;color:#94a3b8;display:block;">ATTACK SPEED (SPA)</span>
                        <strong style="font-size:22px;color:#38bdf8;">${effectiveSpa}s</strong>
                        <span style="font-size:10px;color:#64748b;display:block;">Base: ${baseSpa}s</span>
                    </div>
                    <div style="background:#0f172a;padding:12px;border-radius:8px;border:1px solid #1e293b;text-align:center;">
                        <span style="font-size:11px;color:#94a3b8;display:block;">ATTACK RANGE</span>
                        <strong style="font-size:22px;color:#a855f7;">${effectiveRng}</strong>
                        <span style="font-size:10px;color:#64748b;display:block;">Base: ${baseRng}</span>
                    </div>
                    <div style="background:#0f172a;padding:12px;border-radius:8px;border:1px solid #1e293b;text-align:center;">
                        <span style="font-size:11px;color:#94a3b8;display:block;">RAW SINGLE DPS</span>
                        <strong style="font-size:22px;color:#facc15;">${rawDps.toFixed(1)}</strong>
                        <span style="font-size:10px;color:#64748b;display:block;">Dmg ÷ SPA</span>
                    </div>
                    <div style="background:#0f172a;padding:12px;border-radius:8px;border:1px solid #22c55e;text-align:center;box-shadow:0 0 15px rgba(34,197,94,0.15);">
                        <span style="font-size:11px;color:#4ade80;font-weight:700;display:block;">REAL POTENTIAL DPS</span>
                        <strong style="font-size:24px;color:#22c55e;">${realDps.toFixed(1)}</strong>
                        <span style="font-size:10px;color:#86efac;display:block;">Passives & Scenario Included</span>
                    </div>
                </div>

                <!-- Breakdown Explanation -->
                <div style="background:#090d16;border:1px solid #1e293b;border-radius:8px;padding:14px;">
                    <strong style="color:#38bdf8;font-size:12px;display:block;margin-bottom:6px;">📊 ACTIVE MULTIPLIERS & BREAKDOWN DETAILS:</strong>
                    ${notes.length > 0 ? `
                        <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:12px;line-height:1.6;">
                            ${notes.map(n => `<li>${n}</li>`).join('')}
                        </ul>
                    ` : `
                        <p style="color:#64748b;font-size:12px;margin:0;font-style:italic;">No active conditional passive bonuses toggled.</p>
                    `}
                </div>
            </div>
        `;
    },

    renderCodesWiki(container) {
        const allCodes = window.SaveService ? window.SaveService.getAllPromoCodes() : {};
        const entries = Object.entries(allCodes);

        let cardsHtml = "";
        for (const [code, data] of entries) {
            const rewardBadges = [];
            if (data.gems) rewardBadges.push(`<span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:4px 10px;border-radius:6px;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:4px;">💎 ${data.gems.toLocaleString()} Gems</span>`);
            if (data.gold) rewardBadges.push(`<span style="background:rgba(234,179,8,0.15);color:#facc15;padding:4px 10px;border-radius:6px;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:4px;">🪙 ${data.gold.toLocaleString()} Gold</span>`);
            if (data.traitRerolls) rewardBadges.push(`<span style="background:rgba(168,85,247,0.15);color:#c084fc;padding:4px 10px;border-radius:6px;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:4px;">🔮 ${data.traitRerolls} Trait RR</span>`);
            if (data.food) {
                for (const [fId, qty] of Object.entries(data.food)) {
                    rewardBadges.push(`<span style="background:rgba(34,197,94,0.15);color:#4ade80;padding:4px 10px;border-radius:6px;font-weight:700;font-size:12px;">🍙 ${qty}x ${fId.replace(/_/g, ' ')}</span>`);
                }
            }
            if (data.starFruits) {
                for (const [sfId, qty] of Object.entries(data.starFruits)) {
                    rewardBadges.push(`<span style="background:rgba(244,63,94,0.15);color:#fb7185;padding:4px 10px;border-radius:6px;font-weight:700;font-size:12px;">⭐ ${qty}x ${sfId.replace(/_/g, ' ')}</span>`);
                }
            }
            if (data.materials) {
                for (const [mId, qty] of Object.entries(data.materials)) {
                    rewardBadges.push(`<span style="background:rgba(148,163,184,0.15);color:#cbd5e1;padding:4px 10px;border-radius:6px;font-weight:700;font-size:12px;">📦 ${qty}x ${mId.replace(/_/g, ' ')}</span>`);
                }
            }

            cardsHtml += `
                <div style="background:#0b1324;border:1px solid #334155;border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-family:'Lilita One',cursive;font-size:20px;letter-spacing:1px;color:#38bdf8;">${code}</span>
                        <span style="background:#1e293b;color:#22c55e;font-size:11px;font-weight:800;padding:2px 8px;border-radius:4px;border:1px solid #22c55e;">ACTIVE</span>
                    </div>
                    <p style="color:#94a3b8;font-size:12px;margin:0;">${data.description || 'Active official promo code.'}</p>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
                        ${rewardBadges.join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div style="max-width:800px;margin:0 auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <div>
                        <h3 style="color:#f8fafc;margin:0;font-size:20px;">📜 Active Promo Codes Encyclopedia</h3>
                        <p style="color:#94a3b8;font-size:13px;margin:4px 0 0 0;">All working codes and their exact redemption rewards. Enter them in the Codes tab to claim!</p>
                    </div>
                    <button class="tactile-blue-btn" onclick="UIController.switchTab('codes')" style="padding:8px 16px;font-size:13px;">🎁 Go to Codes Tab</button>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:14px;">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.WikiController = WikiController;
}
