import re

with open('pixel_tower_defense/js/ui/uiController.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update switchTab
if 'if (tabName === "gemshop")' not in code:
    code = code.replace(
        'if (tabName === "shop") this.renderGoldShop();',
        'if (tabName === "shop") this.renderGoldShop();\n        if (tabName === "gemshop") this.renderGemShop();'
    )

# 2. Update updateTopBar to call updateActiveBuffsHUD
if 'this.updateActiveBuffsHUD();' not in code:
    code = code.replace(
        'const syncEl = document.getElementById("hud-sync-status");',
        'const syncEl = document.getElementById("hud-sync-status");\n        this.updateActiveBuffsHUD();'
    )

# 3. Update startTimers to update gemshop-timer and active buffs
if 'gemshop-timer' not in code:
    target_timer = '''            // Live Banner Hourly Reset Timer
            const bannerTimerEl = document.getElementById("banner-timer-clock");
            if (bannerTimerEl) {
                const now = new Date();
                const minutesLeft = 59 - now.getMinutes();
                const secondsLeft = 59 - now.getSeconds();
                bannerTimerEl.textContent = `Resets in ${String(minutesLeft).padStart(2, '0')}m ${String(secondsLeft).padStart(2, '0')}s (Hourly)`;
            }'''
    replacement_timer = '''            // Live Banner Hourly Reset Timer
            const bannerTimerEl = document.getElementById("banner-timer-clock");
            const gemShopTimerEl = document.getElementById("gemshop-timer");
            const now = new Date();
            const minutesLeft = 59 - now.getMinutes();
            const secondsLeft = 59 - now.getSeconds();
            const timerText = `Resets in ${String(minutesLeft).padStart(2, '0')}m ${String(secondsLeft).padStart(2, '0')}s`;
            if (bannerTimerEl) {
                bannerTimerEl.textContent = `${timerText} (Hourly)`;
            }
            if (gemShopTimerEl) {
                gemShopTimerEl.textContent = timerText;
            }
            this.updateActiveBuffsHUD();'''
    code = code.replace(target_timer, replacement_timer)

# 4. Update showUnitInspector for 50% sell refund
target_sell_btn = '''                <button class="sell-btn" onclick="UIController.sellSelectedUnit('${placedUnit.id}')">
                    Sell (Refund Yen)
                </button>'''
replacement_sell_btn = '''                <button class="sell-btn" onclick="UIController.sellSelectedUnit('${placedUnit.id}')">
                    Sell (+${Math.floor((conf.baseCost + (conf.upgrades ? conf.upgrades.slice(0, placedUnit.upgradeLevel).reduce((a, b) => a + b.cost, 0) : 0)) * 0.50)} ¥ [50%])
                </button>'''
code = code.replace(target_sell_btn, replacement_sell_btn)

# 5. Add View Rates button in renderBanners
if '📊 View Rates' not in code:
    target_banner_btns = '''                        <!-- Action Controls (Gems only, No tickets button) -->
                        <div class="banner-action-buttons" onclick="event.stopPropagation()">
                            <button class="tactile-green-btn" onclick="UIController.performSummon('featured_mythics', 1)">
                                Summon x1 (${singleCost} 💎)
                            </button>
                            <button class="tactile-green-btn" onclick="UIController.performSummon('featured_mythics', 10)">
                                Summon x10 (${multiCost} 💎)
                            </button>
                        </div>'''
    replacement_banner_btns = '''                        <!-- Action Controls (Gems only, No tickets button) -->
                        <div class="banner-action-buttons" onclick="event.stopPropagation()">
                            <button class="tactile-green-btn" onclick="UIController.performSummon('featured_mythics', 1)">
                                Summon x1 (${singleCost} 💎)
                            </button>
                            <button class="tactile-green-btn" onclick="UIController.performSummon('featured_mythics', 10)">
                                Summon x10 (${multiCost} 💎)
                            </button>
                            <button class="tactile-green-btn" onclick="UIController.openRatesModal('featured_mythics')" style="background:#0284c7;border:2px solid #38bdf8;box-shadow:0 0 12px rgba(56,189,248,0.5);">
                                📊 View Rates
                            </button>
                        </div>'''
    code = code.replace(target_banner_btns, replacement_banner_btns)

# 6. Update renderGoldShop to include Shiny Hunter pass
target_gold_shop_passes = '''        // 3. Game Passes (VIP - 0.5% chance)
        if (passesContainer) {
            const isVipInStock = window.TimeService.isVipInStockForCurrentDay();
            const state = window.SaveService.state;
            const vipPass = window.SHOP_CONFIG.gamePasses[0];

            let pHtml = `
                <div class="shop-card vip-card" style="grid-column:1/-1;">
                    <div class="shop-icon">${vipPass.icon}</div>
                    <div class="shop-title" style="font-size:22px;color:#facc15;">${vipPass.name}</div>
                    <div class="shop-desc">
                        <ul>
                            ${vipPass.benefits.map(b => `<li>✓ ${b}</li>`).join("")}
                        </ul>
                    </div>
                    <div class="shop-price" style="font-size:20px;">🪙 ${vipPass.goldPrice.toLocaleString()} Gold</div>
                    
                    ${state.vip ? `
                        <button class="shop-buy-btn disabled" disabled>✓ ALREADY OWNED</button>
                    ` : (isVipInStock ? `
                        <button class="shop-buy-btn special" onclick="UIController.buyVipPass()">
                            Purchase VIP Lifetime (🪙50,000)
                        </button>
                    ` : `
                        <div style="color:#ef4444;font-size:14px;margin-top:8px;">
                            Out of Stock Today (Restocks daily at 7:00 AM Bangkok with a 0.5% chance)
                        </div>
                    `)}
                </div>
            `;
            passesContainer.innerHTML = pHtml;
        }'''

replacement_gold_shop_passes = '''        // 3. Game Passes (VIP & Shiny Hunter)
        if (passesContainer) {
            const isVipInStock = window.TimeService.isVipInStockForCurrentDay();
            const state = window.SaveService.state;
            const vipPass = window.SHOP_CONFIG.gamePasses[0];
            const hasShiny = window.SaveService.hasShinyHunter();

            let pHtml = `
                <!-- VIP PASS -->
                <div class="shop-card vip-card">
                    <div class="shop-icon">${vipPass.icon}</div>
                    <div class="shop-title" style="font-size:20px;color:#facc15;">${vipPass.name}</div>
                    <div class="shop-desc">
                        <ul>
                            ${vipPass.benefits.map(b => `<li>✓ ${b}</li>`).join("")}
                        </ul>
                    </div>
                    <div class="shop-price" style="font-size:18px;">🪙 ${vipPass.goldPrice.toLocaleString()} Gold</div>
                    
                    ${state.vip ? `
                        <button class="shop-buy-btn disabled" disabled>✓ ALREADY OWNED</button>
                    ` : (isVipInStock ? `
                        <button class="shop-buy-btn special" onclick="UIController.buyVipPass()">
                            Purchase VIP (🪙50,000)
                        </button>
                    ` : `
                        <div style="color:#ef4444;font-size:13px;margin-top:6px;">
                            Out of Stock Today (0.5% Daily Restock)
                        </div>
                    `)}
                </div>

                <!-- SHINY HUNTER PASS -->
                <div class="shop-card" style="border:2px solid #38bdf8;background:#0f172a;box-shadow:0 0 20px rgba(56,189,248,0.3);">
                    <div class="shop-icon" style="font-size:42px;">✨</div>
                    <div class="shop-title" style="font-size:20px;color:#38bdf8;font-weight:900;">Shiny Hunter Pass</div>
                    <div class="shop-desc">
                        <ul>
                            <li>✓ Triples summon Shiny chance on all banners (1% ➔ 3%)</li>
                            <li>✓ Permanent account unlock</li>
                            <li>✓ Displays shiny hunter status pill on HUD</li>
                        </ul>
                    </div>
                    <div class="shop-price" style="font-size:18px;">🪙 35,000 Gold</div>

                    ${hasShiny ? `
                        <button class="shop-buy-btn disabled" disabled style="background:#22c55e;color:#fff;">✓ ALREADY OWNED</button>
                    ` : `
                        <button class="shop-buy-btn special" onclick="UIController.buyShinyHunter()" style="background:linear-gradient(180deg,#0284c7,#0369a1);border:1px solid #38bdf8;">
                            Purchase Shiny Hunter (🪙35,000)
                        </button>
                    `}
                </div>
            `;
            passesContainer.innerHTML = pHtml;
        }'''
code = code.replace(target_gold_shop_passes, replacement_gold_shop_passes)

# 7. Add Gem Shop method & helpers
gem_shop_methods = '''
    // ----------------------------------------------------
    // GEM SHOP VIEW & PURCHASES
    // ----------------------------------------------------
    renderGemShop() {
        const grid = document.getElementById("gemshop-grid");
        if (!grid) return;

        const state = window.SaveService.state;
        const hourCycleKey = "HOUR_" + Math.floor(Date.now() / 3600000);
        const purchases = (state.gemShopLimits && state.gemShopLimits[hourCycleKey]) || {};

        const pool = [
            { id: "luck_potion", name: "Luck Potion", cost: 200, type: "consumable", targetKey: "luck_potion", desc: "+25% Summon Luck on banners for 30 minutes! (Boosts Mythic & Secret rates)", model: window.PixelSprites.getLuckPotionIcon(60) },
            { id: "normal_star_fruit", name: "Normal Star Fruit", cost: 50, type: "material", targetKey: "normal_star_fruit", desc: "Basic unit evolution fruit.", icon: "⭐" },
            { id: "pink_star_fruit", name: "Pink Star Fruit", cost: 200, type: "material", targetKey: "pink_star_fruit", desc: "Refined pink evolution fruit.", icon: "🌸" },
            { id: "red_star_fruit", name: "Red Star Fruit", cost: 200, type: "material", targetKey: "red_star_fruit", desc: "Blazing crimson evolution fruit.", icon: "🔥" },
            { id: "green_star_fruit", name: "Green Star Fruit", cost: 200, type: "material", targetKey: "green_star_fruit", desc: "Verdant nature evolution fruit.", icon: "🍃" },
            { id: "blue_star_fruit", name: "Blue Star Fruit", cost: 200, type: "material", targetKey: "blue_star_fruit", desc: "Mystic oceanic evolution fruit.", icon: "💧" },
            { id: "yellow_star_fruit", name: "Yellow Star Fruit", cost: 200, type: "material", targetKey: "yellow_star_fruit", desc: "Electrified lightning evolution fruit.", icon: "⚡" },
            { id: "rainbow_star_fruit", name: "Rainbow Star Fruit", cost: 400, type: "material", targetKey: "rainbow_star_fruit", desc: "Prismatic cosmic evolution fruit.", icon: "🌈" }
        ];

        // Pick 3 deterministic random items for the hour
        const hourSeed = Math.floor(Date.now() / 3600000);
        const selectedItems = [];
        const poolCopy = [...pool];
        let seed = hourSeed;
        for (let i = 0; i < 3; i++) {
            seed = (seed * 9301 + 49297) % 233280;
            const idx = Math.floor((seed / 233280) * poolCopy.length);
            selectedItems.push(poolCopy.splice(idx, 1)[0]);
        }

        let html = "";
        selectedItems.forEach(item => {
            const isSoldOut = (purchases[item.id] || 0) >= 1;
            html += `
                <div class="shop-card" style="border:1.5px solid #0284c7;background:#0f172a;box-shadow:0 0 16px rgba(2,132,199,0.25);">
                    <div style="height:70px;display:flex;align-items:center;justify-content:center;">
                        ${item.model ? item.model : `<div style="font-size:46px;">${item.icon}</div>`}
                    </div>
                    <div class="shop-card-name" style="color:#38bdf8;font-size:18px;font-weight:900;">${item.name}</div>
                    <div class="shop-card-desc" style="min-height:36px;font-size:12px;color:#94a3b8;line-height:1.4;">${item.desc}</div>
                    <div style="font-size:11px;color:#facc15;font-weight:800;margin:4px 0;">Hourly Limit: 1x</div>
                    <div class="shop-card-cost" style="color:#facc15;font-size:18px;font-weight:900;margin:6px 0;">💎 ${item.cost} Gems</div>
                    ${isSoldOut ? `
                        <button class="stage-btn disabled" disabled style="width:100%;background:#334155;color:#94a3b8;border:none;padding:9px;border-radius:6px;font-weight:800;">
                            ✓ Sold Out This Hour
                        </button>
                    ` : `
                        <button onclick="UIController.buyGemShopItem('${item.id}', ${item.cost}, '${item.type}', '${item.targetKey}')" class="stage-btn normal-btn" style="width:100%;background:linear-gradient(180deg,#0284c7,#0369a1);border:1px solid #38bdf8;padding:9px;border-radius:6px;font-weight:800;cursor:pointer;">
                            Buy (1x)
                        </button>
                    `}
                </div>
            `;
        });

        grid.innerHTML = html;
    },

    buyGemShopItem(itemId, cost, type, targetKey) {
        const res = window.SaveService.buyGemShopItem(itemId, cost, type, targetKey);
        if (!res.success) {
            alert(res.message);
            return;
        }

        if (window.AudioService) window.AudioService.playPurchaseSound();
        this.updateTopBar();
        this.renderGemShop();
        this.updateActiveBuffsHUD();
        alert(res.message);
    },

    buyShinyHunter() {
        const res = window.SaveService.buyShinyHunter();
        if (!res.success) {
            alert(res.message);
            return;
        }

        if (window.AudioService) window.AudioService.playVictorySound();
        this.updateTopBar();
        this.renderGoldShop();
        this.updateActiveBuffsHUD();
        alert(res.message);
    },

    // ----------------------------------------------------
    // ACTIVE BUFFS FLOATING HUD
    // ----------------------------------------------------
    updateActiveBuffsHUD() {
        const hud = document.getElementById("active-buffs-hud");
        if (!hud) return;

        const state = window.SaveService ? window.SaveService.state : null;
        if (!state) return;

        let html = "";
        if (state.vip) {
            html += `<div class="buff-pill vip">👑 VIP Active (20% OFF)</div>`;
        }
        if (window.SaveService.hasShinyHunter()) {
            html += `<div class="buff-pill shiny-hunter">✨ Shiny Hunter (3x Shiny: 3%)</div>`;
        }
        if (window.SaveService.hasLuckPotion()) {
            const secs = window.SaveService.getLuckPotionRemainingSeconds();
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;
            html += `<div class="buff-pill luck-potion">🧪 Luck Potion Active (+25% Luck) [${timeStr}]</div>`;
        }
        hud.innerHTML = html;
    },
'''

if 'renderGemShop()' not in code:
    code = code.replace('    renderGoldShop() {', gem_shop_methods + '\n    renderGoldShop() {')

with open('pixel_tower_defense/js/ui/uiController.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Pass 1 completed successfully.")
