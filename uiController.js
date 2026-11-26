// Pixel Tower Defense — UI Controller
// Manages Lobby, Modals, Banners, Trait Rerolls, Gold Shop, Challenges, and Battle HUD

const UIController = {
    currentTab: "battle", // "battle", "summon", "inventory", "traits", "shop", "quests", "settings"

    init() {
        this.bindEvents();
        this.updateTopBar();
        this.renderStages();
        this.renderBanners();
        this.renderGoldShop();
        this.renderChallenges();
        this.renderQuests();
        this.startTimers();
        this.initTooltips();
        window.alert = (msg) => { this.showToast(msg, "info"); };

        // Check for returning Google OAuth redirect callback
        this.checkGoogleOAuthCallback();

        // Force Login & Username selection before playing
        const googleUser = window.SaveService && window.SaveService.getGoogleUser();
        const profile = window.SaveService && window.SaveService.getUserProfile();
        if (!googleUser || !profile || !profile.usernameChosen) {
            this.openAuthModal();
        }
    },

    showToast(message, type = "info") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `atd-toast ${type}`;

        let icon = "✨";
        if (type === "success") icon = "🎉";
        else if (type === "warning") icon = "⚠️";
        else if (type === "error") icon = "❌";
        else if (type === "info") icon = "💎";

        const cleanMsg = (message || "").replace(/\n+/g, " • ");

        toast.innerHTML = `
            <span class="atd-toast-icon">${icon}</span>
            <span class="atd-toast-text">${cleanMsg}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-15px) scale(0.95)";
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3200);
    },

    initTooltips() {
        const tooltipEl = document.getElementById("custom-tooltip");
        if (!tooltipEl) return;

        document.body.addEventListener("mouseover", (e) => {
            const target = e.target.closest("[data-tooltip]");
            if (target) {
                const text = target.getAttribute("data-tooltip");
                if (text) {
                    tooltipEl.innerHTML = text;
                    tooltipEl.classList.add("visible");
                    const rect = target.getBoundingClientRect();
                    let top = rect.bottom + 6;
                    let left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2);
                    if (left < 10) left = 10;
                    if (left + tooltipEl.offsetWidth > window.innerWidth - 10) {
                        left = window.innerWidth - tooltipEl.offsetWidth - 10;
                    }
                    if (top + tooltipEl.offsetHeight > window.innerHeight - 10) {
                        top = rect.top - tooltipEl.offsetHeight - 6;
                    }
                    tooltipEl.style.top = `${top}px`;
                    tooltipEl.style.left = `${left}px`;
                }
            }
        });

        document.body.addEventListener("mouseout", (e) => {
            const target = e.target.closest("[data-tooltip]");
            if (target) {
                tooltipEl.classList.remove("visible");
            }
        });
    },

    bindEvents() {
        // Navigation Tabs
        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Close Modal buttons
        document.querySelectorAll(".modal-close-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                this.closeAllModals();
            });
        });
    },

    switchTab(tabName) {
        if (!tabName) return;

        // Custom warning modal if currently in an active match
        if (window.CombatEngine && window.CombatEngine.isActive && tabName !== "battle") {
            this.showConfirmModal({
                title: "Exit Active Battle?",
                message: "You are currently in an active battle! Navigating away will exit this match and forfeit your progress.",
                icon: "🚪",
                confirmText: "Exit Battle",
                cancelText: "Stay in Battle",
                confirmColor: "red",
                onConfirm: () => {
                    this.exitBattleToLobby();
                    this.switchTab(tabName);
                }
            });
            return;
        }

        this.currentTab = tabName;

        // Ensure lobby view is visible and battle view hidden when switching tabs
        const lobbyView = document.getElementById("lobby-view");
        const battleView = document.getElementById("battle-view");
        if (lobbyView) lobbyView.style.display = "block";
        if (battleView) battleView.style.display = "none";

        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tabName);
        });

        document.querySelectorAll(".tab-pane").forEach(pane => {
            pane.classList.toggle("active", pane.id === `tab-${tabName}`);
        });

        // Refresh views
        this.updateTopBar();
        if (tabName === "inventory") this.renderInventory();
        if (tabName === "summon") this.renderBanners();
        if (tabName === "challenges") this.renderChallenges();
        if (tabName === "crafting") this.renderCrafting();
        if (tabName === "evolution") this.renderEvolution();
        if (tabName === "items") this.renderItemsInventory();
        if (tabName === "index") this.renderIndex();
        if (tabName === "traits") this.renderTraitTemple();
        if (tabName === "shop") this.renderGoldShop();
        if (tabName === "gemshop") this.renderGemShop();
        if (tabName === "quests") this.renderQuests();
        if (tabName === "codes") this.renderCodes();
        if (tabName === "battle") this.renderStages();
        if (tabName === "chatbot") this.renderChatbot();
        if (tabName === "wiki") this.renderWiki();
    },

    updateTopBar() {
        const state = window.SaveService.state;
        if (!state) return;

        const gemsEl = document.getElementById("hud-gems");
        const ticketsEl = document.getElementById("hud-tickets");
        const goldEl = document.getElementById("hud-gold");
        const traitRrEl = document.getElementById("hud-trait-rr");
        const levelEl = document.getElementById("hud-level");
        const vipEl = document.getElementById("hud-vip-badge");
        const syncEl = document.getElementById("hud-sync-status");
        
        // Player Account Level and EXP Bar (Widget next to PLAY)
        const accLevelEl = document.getElementById("hud-account-level");
        const accExpFillEl = document.getElementById("hud-account-exp-fill");
        const accExpLabelEl = document.getElementById("hud-account-exp-label");

        const pLevel = state.playerLevel || 1;
        const pExp = state.playerExp || 0;
        const reqExp = pLevel * 200;
        const pct = Math.min(100, Math.max(0, Math.floor((pExp / reqExp) * 100)));

        if (accLevelEl) accLevelEl.textContent = pLevel;
        if (accExpFillEl) accExpFillEl.style.width = `${pct}%`;
        if (accExpLabelEl) accExpLabelEl.textContent = `${pExp} / ${reqExp} EXP`;

        this.updateActiveBuffsHUD();

        if (gemsEl) gemsEl.textContent = state.gems.toLocaleString();
        if (ticketsEl) ticketsEl.textContent = (state.summonTickets || 0).toLocaleString();
        if (goldEl) goldEl.textContent = state.gold.toLocaleString();
        if (traitRrEl) traitRrEl.textContent = (state.traitRerolls || 0).toLocaleString();
        if (levelEl) levelEl.textContent = `Lv.${state.playerLevel}`;

        if (vipEl) {
            vipEl.style.display = state.vip ? "inline-block" : "none";
            vipEl.textContent = "👑 VIP (20% OFF)";
        }

        if (syncEl) {
            const status = window.SaveService.syncStatus;
            if (status === "synced") {
                syncEl.innerHTML = `<span style="color:#22c55e;">● Cloud Synced</span>`;
            } else if (status === "offline") {
                syncEl.innerHTML = `<span style="color:#eab308;">● Local Cached</span>`;
            } else {
                syncEl.innerHTML = `<span style="color:#38bdf8;">● Syncing...</span>`;
            }
        }

        const userNameEl = document.getElementById("hud-user-name");
        if (userNameEl) {
            const googleUser = window.SaveService && window.SaveService.getGoogleUser();
            const profile = window.SaveService && window.SaveService.getUserProfile();
            if (googleUser && profile && profile.usernameChosen && profile.name) {
                userNameEl.textContent = profile.name;
            } else if (googleUser) {
                userNameEl.textContent = "Choose Username";
            } else {
                userNameEl.textContent = "Sign In";
            }
        }
    },

    startTimers() {
        setInterval(() => {
            // Daily reset timer (7:00 AM Bangkok)
            const msDaily = window.TimeService.getTimeUntilDailyReset();
            const dailyTimerEl = document.getElementById("daily-reset-countdown");
            if (dailyTimerEl) dailyTimerEl.textContent = window.TimeService.formatTime(msDaily);

            // 30-min challenge timer
            const msHourly = window.TimeService.getTimeUntilHourlyRefresh();
            const hourlyTimerEl = document.getElementById("hourly-reset-countdown");
            if (hourlyTimerEl) hourlyTimerEl.textContent = window.TimeService.formatTime(msHourly);

            // Live Banner Hourly Reset Timer
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
            this.updateActiveBuffsHUD();

            // Update top bar stats
            this.updateTopBar();
        }, 1000);
    },

    // ----------------------------------------------------
    // ----------------------------------------------------
    // STAGE SELECTION VIEW
    // ----------------------------------------------------
    getStageEnemies(stageConfig) {
        if (stageConfig.previewEnemies) return stageConfig.previewEnemies;
        const diff = stageConfig.normal;
        if (diff && diff.waveEnemies) {
            const set = new Set();
            diff.waveEnemies.forEach(w => w.enemies.forEach(e => set.add(e)));
            if (stageConfig.hasBoss && stageConfig.bossId) set.add(stageConfig.bossId);
            return Array.from(set);
        }
        return ["grunt", "scout_dasher"];
    },

    renderStageEnemyPills(enemyIds) {
        if (!enemyIds || enemyIds.length === 0) return '<span style="font-size:11px;color:#64748b;">Standard minions</span>';
        return enemyIds.map(eId => {
            const conf = (window.ENEMY_CONFIG && window.ENEMY_CONFIG[eId]) || { name: eId };
            const spriteUrl = window.PixelSprites ? window.PixelSprites.getEnemySprite(eId, 26) : "";
            return `
                <div class="stage-enemy-chip" title="${conf.name}">
                    ${spriteUrl ? `<img src="${spriteUrl}" alt="${conf.name}" class="stage-enemy-chip-img">` : '👾'}
                    <span>${conf.name}</span>
                </div>
            `;
        }).join("");
    },

    renderStages() {
        const container = document.getElementById("stages-container");
        if (!container) return;

        const state = window.SaveService.state;
        this.playTab = this.playTab || "story"; // "story", "legend", "special"
        this.selectedStoryWorld = this.selectedStoryWorld !== undefined ? this.selectedStoryWorld : null;

        let html = `
            <!-- PLAY MODE NAVIGATION TABS -->
            <div style="display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid #1e293b;padding-bottom:12px;">
                <button class="stage-btn ${this.playTab === 'story' ? 'special-btn' : ''}" style="font-size:14px;padding:8px 16px;font-weight:900;" onclick="UIController.setPlayTab('story')">
                    ⚔️ Story Mode
                </button>
                <button class="stage-btn ${this.playTab === 'legend' ? 'special-btn' : ''}" style="font-size:14px;padding:8px 16px;font-weight:900;" onclick="UIController.setPlayTab('legend')">
                    👑 Legend Stages
                </button>
                <button class="stage-btn ${this.playTab === 'special' ? 'special-btn' : ''}" style="font-size:14px;padding:8px 16px;font-weight:900;" onclick="UIController.setPlayTab('special')">
                    ♾️ Special Modes
                </button>
            </div>
        `;

        // Helper to render stage cards
        const renderStageCards = (stageIds, isLegend = false) => {
            let cardsHtml = '<div class="stages-grid" style="margin-bottom:24px;">';
            stageIds.forEach(sId => {
                const st = window.STAGE_CONFIG[sId];
                if (!st) return;
                const prog = (state.stageProgress && state.stageProgress[sId]) || {};
                const normalDone = prog.normalCleared;
                const hardDone = prog.hardCleared;
                const isUnlocked = isLegend || window.SaveService.isActUnlocked(sId);
                const enemies = this.getStageEnemies(st);

                let dropsDesc = "";
                if (st.guaranteedDrop) {
                    const iconHtml = window.PixelSprites && window.PixelSprites.getMaterialIcon ? window.PixelSprites.getMaterialIcon(st.guaranteedDrop.id, 20) : st.guaranteedDrop.icon;
                    const dropQty = st.guaranteedDrop.min ? `${st.guaranteedDrop.min}-${st.guaranteedDrop.max}` : "1-3";
                    dropsDesc += `
                        <div class="stage-reward-chip" style="border-color:#facc15;background:rgba(234,179,8,0.15);color:#fef08a;display:inline-flex;align-items:center;gap:6px;">
                            <span>${iconHtml}</span>
                            <b>${dropQty} ${st.guaranteedDrop.name} (100% Drop)</b>
                        </div>
                    `;
                }
                if (st.bonusDrop) {
                    const iconHtml = window.PixelSprites && window.PixelSprites.getMaterialIcon ? window.PixelSprites.getMaterialIcon(st.bonusDrop.id, 20) : st.bonusDrop.icon;
                    dropsDesc += `
                        <div class="stage-reward-chip" style="border-color:#38bdf8;background:rgba(56,189,248,0.15);color:#bae6fd;display:inline-flex;align-items:center;gap:6px;">
                            <span>${iconHtml}</span>
                            <b>${st.bonusDrop.name} (${Math.round(st.bonusDrop.chance * 100)}% Chance)</b>
                        </div>
                    `;
                }

                cardsHtml += `
                    <div class="stage-card" style="${isLegend ? 'border:2px solid #ca8a04;background:linear-gradient(180deg,#1e1b4b,#0f172a);box-shadow:0 0 16px rgba(202,138,4,0.25);' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <div class="stage-badge">${st.name}</div>
                            <div class="stage-waves-tag">Waves: ${st.totalWaves}</div>
                        </div>
                        <p class="stage-desc" style="color:#cbd5e1;">${st.description}</p>
                        
                        <div style="margin:8px 0;">
                            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">👾 ENEMIES IN THIS STAGE:</div>
                            <div class="stage-enemies-row">
                                ${this.renderStageEnemyPills(enemies)}
                            </div>
                        </div>

                        <div style="margin:8px 0;">
                            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">🎁 STAGE REWARDS:</div>
                            <div class="stage-rewards-row">
                                ${dropsDesc}
                                <div class="stage-reward-chip">
                                    <span>💎</span>
                                    <span>Gems: +${st.normal ? st.normal.firstClearGems : 80} (Hard: +${st.hard ? st.hard.firstClearGems : 150})</span>
                                </div>
                                <div class="stage-reward-chip">
                                    <span>🍙</span>
                                    <span>1-8 Food Drop (100% Guaranteed)</span>
                                </div>
                                <div class="stage-reward-chip">
                                    <span>🌟</span>
                                    <span>+60 / +120 EXP</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stage-diff-actions" style="margin-top:auto;">
                            ${isUnlocked ? `
                                <button class="stage-btn normal-btn" onclick="UIController.launchBattle('${sId}', false)">
                                    ▶ Play Normal ${normalDone ? '✓' : ''}
                                </button>
                                <button class="stage-btn hard-btn" onclick="UIController.launchBattle('${sId}', true)">
                                    ▶ Play Hard ${hardDone ? '✓' : ''}
                                </button>
                            ` : `
                                <button class="stage-btn disabled" disabled style="width:100%;background:#334155;color:#94a3b8;cursor:not-allowed;padding:10px;font-weight:700;">
                                    🔒 Locked (Clear Act ${st.actNum - 1} Normal)
                                </button>
                            `}
                        </div>
                    </div>
                `;
            });
            cardsHtml += '</div>';
            return cardsHtml;
        };

        // 1. STORY MODE
        if (this.playTab === "story") {
            if (this.selectedStoryWorld === null) {
                // Show World Selection Menu
                html += `
                    <div style="margin-bottom:16px;">
                        <h2 style="margin:0 0 4px 0;color:#f8fafc;font-size:22px;font-weight:900;">🗺️ Select Story World</h2>
                        <p style="margin:0;color:#94a3b8;font-size:13px;">Choose a world to enter its acts. Clearing Normal unlocks first-clear Gems and Hard Mode.</p>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
                        <!-- World 1: Plains -->
                        <div class="stage-card" style="border:2px solid #22c55e;cursor:pointer;background:linear-gradient(180deg,#064e3b,#022c22);padding:20px;border-radius:12px;box-shadow:0 0 16px rgba(34,197,94,0.25);" onclick="UIController.selectStoryWorld(1)">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                                <h3 style="margin:0;color:#4ade80;font-size:20px;font-weight:900;">🌿 World 1: Plains</h3>
                                <span style="font-size:11px;background:#16a34a;color:#fff;padding:2px 8px;border-radius:999px;font-weight:900;">ACTS 1 - 6</span>
                            </div>
                            <p style="color:#cbd5e1;font-size:13px;line-height:1.5;margin:8px 0 16px 0;">Peaceful open grasslands and meadow clearings. Great for starting your adventure and farming food!</p>
                            <button class="stage-btn special-btn" style="width:100%;font-size:14px;padding:10px;">▶ Enter World 1 (Plains)</button>
                        </div>

                        <!-- World 2: Hills -->
                        <div class="stage-card" style="border:2px solid #facc15;cursor:pointer;background:linear-gradient(180deg,#713f12,#451a03);padding:20px;border-radius:12px;box-shadow:0 0 16px rgba(250,204,21,0.25);" onclick="UIController.selectStoryWorld(2)">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                                <h3 style="margin:0;color:#fde047;font-size:20px;font-weight:900;">⛰️ World 2: Hills</h3>
                                <span style="font-size:11px;background:#ca8a04;color:#000;padding:2px 8px;border-radius:999px;font-weight:900;">ACTS 1 - 6</span>
                            </div>
                            <p style="color:#cbd5e1;font-size:13px;line-height:1.5;margin:8px 0 16px 0;">Rugged rocky foothills, goblin camps, and ancient cliff battlegrounds.</p>
                            <button class="stage-btn special-btn" style="width:100%;font-size:14px;padding:10px;">▶ Enter World 2 (Hills)</button>
                        </div>

                        <!-- World 3: Mountains -->
                        <div class="stage-card" style="border:2px solid #38bdf8;cursor:pointer;background:linear-gradient(180deg,#0c4a6e,#082f49);padding:20px;border-radius:12px;box-shadow:0 0 16px rgba(56,189,248,0.25);" onclick="UIController.selectStoryWorld(3)">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                                <h3 style="margin:0;color:#7dd3fc;font-size:20px;font-weight:900;">🏔️ World 3: Mountains</h3>
                                <span style="font-size:11px;background:#0284c7;color:#fff;padding:2px 8px;border-radius:999px;font-weight:900;">ACTS 1 - 6</span>
                            </div>
                            <p style="color:#cbd5e1;font-size:13px;line-height:1.5;margin:8px 0 16px 0;">High altitude peaks, alpine ridges, and ancient elemental shrines.</p>
                            <button class="stage-btn special-btn" style="width:100%;font-size:14px;padding:10px;">▶ Enter World 3 (Mountains)</button>
                        </div>
                    </div>
                `;
            } else {
                // Show Acts for Selected World with "Back to Worlds" button
                const worldInfo = {
                    1: { name: "Plains", acts: ["world1_act1", "world1_act2", "world1_act3", "world1_act4", "world1_act5", "world1_act6"], color: "#22c55e" },
                    2: { name: "Hills", acts: ["world2_act1", "world2_act2", "world2_act3", "world2_act4", "world2_act5", "world2_act6"], color: "#facc15" },
                    3: { name: "Mountains", acts: ["world3_act1", "world3_act2", "world3_act3", "world3_act4", "world3_act5", "world3_act6"], color: "#38bdf8" }
                }[this.selectedStoryWorld];

                html += `
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                        <button class="stage-btn" style="padding:8px 18px;font-size:14px;font-weight:900;background:linear-gradient(180deg,#2563eb,#1d4ed8);color:#ffffff !important;border:2px solid #60a5fa;box-shadow:0 0 14px rgba(37,99,235,0.6);cursor:pointer;" onclick="UIController.selectStoryWorld(null)">
                            ← Back to Worlds
                        </button>
                        <h2 style="margin:0;color:${worldInfo.color};font-size:22px;font-weight:900;">World ${this.selectedStoryWorld}: ${worldInfo.name} (Acts 1 - 6)</h2>
                    </div>
                `;
                html += renderStageCards(worldInfo.acts);
            }
        } else if (this.playTab === "legend") {
            // 2. LEGEND STAGES
            html += `
                <div style="margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <h2 style="margin:0;color:#facc15;font-size:20px;font-weight:900;">👑 HILLS LEGEND STAGES (ACTS 1 - 3)</h2>
                        <span style="font-size:10px;background:#ca8a04;color:#000;padding:2px 6px;border-radius:4px;font-weight:800;">100% GUARANTEED DROPS</span>
                    </div>
                    <p style="margin:4px 0 12px 0;color:#94a3b8;font-size:13px;">Act 1: Light Energy • Act 2: Blazes • Act 3: Daggers + 10% Relic Shard</p>
                </div>
            `;
            html += renderStageCards(["legend_act1", "legend_act2", "legend_act3"], true);

            html += `
                <div style="margin:24px 0 16px 0;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <h2 style="margin:0;color:#38bdf8;font-size:20px;font-weight:900;">👑 MOUNTAIN LEGEND STAGES (SCROLL FARMS)</h2>
                        <span style="font-size:10px;background:#0284c7;color:#fff;padding:2px 6px;border-radius:4px;font-weight:800;">5-10 SCROLLS / MATCH (100% DROP)</span>
                    </div>
                    <p style="margin:4px 0 12px 0;color:#94a3b8;font-size:13px;">Act 1: Fire Scrolls • Act 2: Water Scrolls • Act 3: Nature Scrolls</p>
                </div>
            `;
            html += renderStageCards(["legend_mountains_act1", "legend_mountains_act2", "legend_mountains_act3"], true);
        } else if (this.playTab === "special") {
            // 3. SPECIAL MODES (Infinite & Release Event)
            html += `
                <div style="margin-bottom:16px;">
                    <h2 style="margin:0 0 4px 0;color:#c7d2fe;font-size:22px;font-weight:900;">♾️ Infinite & Limited Event Modes</h2>
                    <p style="margin:0;color:#94a3b8;font-size:13px;">Challenge endless escalating waves or tackle the 20-wave Release Event raid!</p>
                </div>
                <div class="stages-grid">
                    <!-- INFINITE MODE -->
                    <div class="stage-card infinite-card-glow" style="background:linear-gradient(145deg,#0f172a,#1e1b4b);border:1px solid #6366f1;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 0 20px rgba(99,102,241,0.25);">
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:16px;font-weight:900;color:#c7d2fe;">♾️ Infinite Mode</span>
                            <span style="font-size:10px;font-weight:800;background:#4338ca;color:#e0e7ff;padding:3px 8px;border-radius:4px;">ENDLESS</span>
                        </div>
                        <p class="stage-desc" style="color:#94a3b8;font-size:13px;line-height:1.4;">${window.STAGE_CONFIG.infinite_mode.description}</p>
                        
                        <div style="margin:4px 0;">
                            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">👾 ESCALATING ENEMIES:</div>
                            <div class="stage-enemies-row">
                                ${this.renderStageEnemyPills(["grunt", "scout_dasher", "armored_golem", "flying_harpy", "berserker_orc", "abyssal_colossus"])}
                            </div>
                        </div>

                        <div style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:8px 12px;font-size:12px;color:#a5b4fc;">
                            ⚡ <b>Drops:</b> 5% chance each wave for <b>Thunder Essence</b> & <b>Nature Essence</b>! Plus scaling milestone Gems (+35💎 to +800💎).
                        </div>
                        <button class="stage-btn special-btn" style="margin-top:auto;background:linear-gradient(180deg,#6366f1,#4f46e5);color:#fff;border:none;padding:10px;border-radius:8px;font-weight:900;cursor:pointer;box-shadow:0 0 12px rgba(99,102,241,0.4);" onclick="UIController.launchBattle('infinite_mode', false)">
                            ▶ Play Infinite Mode
                        </button>
                    </div>

                    <!-- RELEASE EVENT -->
                    <div class="stage-card event-card-glow" style="background:linear-gradient(145deg,#0f172a,#2e1065);border:1px solid #a855f7;border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 0 20px rgba(168,85,247,0.25);">
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:16px;font-weight:900;color:#e9d5ff;">🌟 Release Event</span>
                            <span style="font-size:10px;font-weight:800;background:#7e22ce;color:#fae8ff;padding:3px 8px;border-radius:4px;">LIMITED 20 WAVES</span>
                        </div>
                        <p class="stage-desc" style="color:#94a3b8;font-size:13px;line-height:1.4;">${(window.STAGE_CONFIG.event_release || window.STAGE_CONFIG.event_genesis_rift).description}</p>
                        
                        <div style="margin:4px 0;">
                            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:4px;">👾 RAID BOSS & MINIONS:</div>
                            <div class="stage-enemies-row">
                                ${this.renderStageEnemyPills(["world_boss_demon", "shadow_healer", "berserker_orc"])}
                            </div>
                        </div>

                        <div style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);border-radius:8px;padding:8px 12px;font-size:12px;color:#facc15;">
                            ⭐ <b>Rewards:</b> 500 Gems every match! <b>0.75% Chance</b> to obtain Secret Unit: <b>Star Mage</b>!
                            <div style="margin-top:4px;color:#38bdf8;font-weight:700;">
                                🎯 Release Event Pity: <span style="color:#fde047;">${window.SaveService.state.releaseEventPity || 0} / 100 clears</span> (100% Guaranteed Star Mage on clear 100!)
                            </div>
                        </div>
                        <button class="stage-btn event-btn" style="margin-top:auto;background:linear-gradient(180deg,#a855f7,#9333ea);color:#fff;border:none;padding:10px;border-radius:8px;font-weight:900;cursor:pointer;box-shadow:0 0 12px rgba(168,85,247,0.4);" onclick="UIController.launchBattle('event_release', false)">
                            ▶ Play Release Event
                        </button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    setPlayTab(tab) {
        this.playTab = tab;
        this.renderStages();
    },

    selectStoryWorld(worldNum) {
        this.selectedStoryWorld = worldNum;
        this.renderStages();
    },

    launchBattle(stageId, isHard) {
        document.getElementById("lobby-view").style.display = "none";
        document.getElementById("battle-view").style.display = "block";

        const canvas = document.getElementById("battleCanvas");
        window.CombatEngine.init(canvas);
        window.CombatEngine.startMatch(stageId, isHard);
        this.renderUnitDeploymentBar();
    },

    exitBattleToLobby() {
        window.CombatEngine.isActive = false;
        this.closeAllModals();
        this.hideUnitInspector();
        document.getElementById("battle-view").style.display = "none";
        document.getElementById("lobby-view").style.display = "block";
        this.switchTab("battle");
    },

    confirmExitBattle() {
        this.showConfirmModal({
            title: "Exit Battle?",
            message: "Are you sure you want to exit and return to the lobby? Your current match progress will be lost.",
            icon: "🚪",
            confirmText: "Exit Battle",
            cancelText: "Stay in Battle",
            confirmColor: "red",
            onConfirm: () => {
                this.exitBattleToLobby();
                this.showToast("Returned to Lobby", "info");
            }
        });
    },

    showConfirmModal({
        title = "Confirm Action",
        message = "Are you sure you want to proceed?",
        icon = "⚠️",
        confirmText = "Confirm",
        cancelText = "Cancel",
        confirmColor = "red",
        onConfirm = null,
        onCancel = null
    } = {}) {
        const modal = document.getElementById("universal-confirm-modal");
        const iconEl = document.getElementById("confirm-modal-icon");
        const titleEl = document.getElementById("confirm-modal-title");
        const msgEl = document.getElementById("confirm-modal-message");
        const okBtn = document.getElementById("confirm-modal-ok-btn");
        const cancelBtn = document.getElementById("confirm-modal-cancel-btn");
        if (!modal) return;

        if (iconEl) iconEl.textContent = icon;
        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;

        if (cancelBtn) {
            cancelBtn.textContent = cancelText;
            cancelBtn.onclick = () => {
                modal.style.display = "none";
                modal.classList.remove("open");
                if (typeof onCancel === "function") onCancel();
            };
        }

        if (okBtn) {
            okBtn.textContent = confirmText;
            if (confirmColor === "red") {
                okBtn.style.background = "linear-gradient(180deg, #ef4444, #dc2626)";
                okBtn.style.borderColor = "#f87171";
                okBtn.style.boxShadow = "0 4px 14px rgba(239, 68, 68, 0.45)";
            } else if (confirmColor === "green") {
                okBtn.style.background = "linear-gradient(180deg, #22c55e, #16a34a)";
                okBtn.style.borderColor = "#4ade80";
                okBtn.style.boxShadow = "0 4px 14px rgba(34, 197, 94, 0.45)";
            } else if (confirmColor === "gold") {
                okBtn.style.background = "linear-gradient(180deg, #f59e0b, #d97706)";
                okBtn.style.borderColor = "#facc15";
                okBtn.style.boxShadow = "0 4px 14px rgba(245, 158, 11, 0.45)";
            } else {
                okBtn.style.background = "linear-gradient(180deg, #3b82f6, #2563eb)";
                okBtn.style.borderColor = "#60a5fa";
                okBtn.style.boxShadow = "0 4px 14px rgba(59, 130, 246, 0.45)";
            }

            okBtn.onclick = () => {
                modal.style.display = "none";
                modal.classList.remove("open");
                if (typeof onConfirm === "function") onConfirm();
            };
        }

        modal.style.display = "flex";
        modal.classList.add("open");
    },

    closeConfirmModal() {
        const modal = document.getElementById("universal-confirm-modal");
        if (modal) {
            modal.style.display = "none";
            modal.classList.remove("open");
        }
    },

    getElementBadge(elem) {
        const eLower = (elem || "none").toLowerCase();
        const iconSvg = window.PixelSprites ? window.PixelSprites.getElementIcon(eLower, 18) : "✨";
        return `<span class="badge-element ${eLower}" title="Element: ${elem || 'None'}">${iconSvg}</span>`;
    },

    getDamageTypeBadge(type) {
        const tLower = (type || "physical").toLowerCase();
        const iconSvg = window.PixelSprites ? window.PixelSprites.getDamageTypeIcon(tLower, 18) : "⚔️";
        return `<span class="badge-dmg-type ${tLower}" title="Damage Type: ${type || 'Physical'}">${iconSvg}</span>`;
    },

    getFarmBadge() {
        return window.PixelSprites ? window.PixelSprites.getFarmIcon() : '<span class="badge-farm">FARM</span>';
    },

    // ----------------------------------------------------
    // IN-BATTLE HUD & DEPLOYMENT BAR
    // ----------------------------------------------------
    updateBattleHUD() {
        const ce = window.CombatEngine;
        if (!ce) return;

        const baseHpEl = document.getElementById("battle-base-hp");
        const yenEl = document.getElementById("battle-yen") || document.getElementById("battle-cash");
        const waveEl = document.getElementById("battle-wave");
        const speedBtn = document.getElementById("battle-speed-btn");
        const pauseBtn = document.getElementById("battle-pause-btn");

        if (baseHpEl) baseHpEl.textContent = `${ce.baseHp}/3`;
        if (yenEl) yenEl.textContent = `${(ce.matchCash || ce.matchYen || 0).toLocaleString()} ¥`;
        if (waveEl) waveEl.textContent = `${ce.currentWave}/${ce.totalWaves}`;
        if (speedBtn) speedBtn.textContent = `${ce.gameSpeed}x Speed`;
        if (pauseBtn) pauseBtn.textContent = ce.isPaused ? "▶️ Resume" : "⏸️ Pause";

        // If any unit with active ability is on field, refresh deployment bar so cooldown stays updated
        if (ce.placedUnits && ce.placedUnits.some(p => p.activeAbility)) {
            const now = Date.now();
            if (!this._lastAbilityHudRefresh || now - this._lastAbilityHudRefresh > 500) {
                this._lastAbilityHudRefresh = now;
                this.renderUnitDeploymentBar();
            }
        }
    },

    toggleBattlePause() {
        if (window.CombatEngine) {
            window.CombatEngine.togglePause();
            this.updateBattleHUD();
        }
    },

    toggleGameSpeed() {
        const ce = window.CombatEngine;
        if (ce.gameSpeed === 1) ce.gameSpeed = 2;
        else if (ce.gameSpeed === 2) ce.gameSpeed = 3;
        else ce.gameSpeed = 1;
        this.updateBattleHUD();
    },

    renderUnitDeploymentBar() {
        const container = document.getElementById("battle-deployment-bar");
        if (!container) return;

        const state = window.SaveService.state;
        const equippedIds = Array.isArray(state.equippedUnits) ? state.equippedUnits : [];
        const equippedUnits = equippedIds.map(id => state.inventoryUnits.find(u => u.id === id)).filter(Boolean);

        if (equippedUnits.length === 0) {
            container.innerHTML = `
                <div style="color:#facc15;font-size:13px;padding:8px;font-weight:700;text-align:center;width:100%;">
                    ⚠️ No units equipped on your team! Go to the UNITS tab to equip up to 6 units.
                </div>
            `;
            return;
        }

        let html = "";
        equippedUnits.forEach((u, slotIdx) => {
            const conf = window.UNIT_CONFIG[u.unitId];
            if (!conf) return;

            const isSelected = window.CombatEngine.selectedUnitToPlace && window.CombatEngine.selectedUnitToPlace.id === u.id;
            const canAfford = window.CombatEngine.matchCash >= conf.baseCost;
            
            // Placement limit tracking
            const limit = conf.maxPlacements || 4;
            const placedCount = window.CombatEngine.placedUnits.filter(p => p.config.id === conf.id).length;
            const limitReached = placedCount >= limit;
            const slotNum = slotIdx + 1;

            html += `
                <div class="deploy-unit-card ${isSelected ? 'selected' : ''} ${(!canAfford || limitReached) ? 'disabled' : ''}" 
                     onclick="${limitReached ? `UIController.showToast('Placement limit reached (Max ${limit} for ${conf.name})!', 'warning')` : `UIController.selectUnitToDeploy('${u.id}')`}">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="background:rgba(250,204,21,0.2);color:#facc15;font-size:10px;font-weight:900;padding:1px 5px;border-radius:4px;border:1px solid rgba(250,204,21,0.4);">[${slotNum}]</span>
                        <span class="deploy-rarity ${conf.rarity.toLowerCase()}">${conf.rarity}</span>
                        <span class="deploy-cost">${conf.baseCost} ¥</span>
                    </div>
                    <img src="${window.PixelSprites.getUnitSprite(u.unitId, 44)}" alt="${conf.name}" style="margin:2px auto;display:block;width:38px;height:38px;object-fit:contain;">
                    <div class="deploy-name">${conf.name}</div>
                    <div style="font-size:10px;font-weight:800;color:${limitReached ? '#ef4444' : '#38bdf8'};">
                        ${limitReached ? `MAX (${placedCount}/${limit})` : `Placed: ${placedCount}/${limit}`}
                    </div>
                    <div class="deploy-tags">
                        <span class="tag-placement">${conf.placement}</span>
                        ${conf.hasSoaring ? '<span class="tag-soaring">🪽Soaring</span>' : ''}
                    </div>
                </div>
            `;
        });

        // Placed Units with Active Abilities (e.g. Shinobi (God) Heavenly Meteor)
        const abilityUnits = (window.CombatEngine && window.CombatEngine.placedUnits ? window.CombatEngine.placedUnits.filter(p => p.activeAbility) : []);
        if (abilityUnits.length > 0) {
            abilityUnits.forEach(p => {
                const conf = p.config;
                const ab = p.activeAbility;
                const onCd = (p.abilityCooldown && p.abilityCooldown > 0);
                const isTargeting = (window.CombatEngine.activeAbilityTargeting && window.CombatEngine.activeAbilityTargeting.placedUnit.id === p.id);

                html += `
                    <div class="deploy-unit-card ability-cast-card ${onCd ? 'disabled' : ''} ${isTargeting ? 'selected' : ''}"
                         style="border-color:${isTargeting ? '#facc15' : '#f97316'};background:linear-gradient(135deg, rgba(249,115,22,0.2), rgba(220,38,38,0.25));box-shadow:0 0 10px rgba(249,115,22,0.3);min-width:95px;"
                         onclick="${onCd ? `UIController.showToast('Ability on cooldown (${Math.ceil(p.abilityCooldown)}s remaining)', 'warning')` : `UIController.activateUnitAbility('${p.id}')`}">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span class="deploy-rarity mythic" style="background:#ea580c;color:#fff;font-size:9px;padding:1px 4px;">ABILITY</span>
                            <span style="font-size:10px;font-weight:900;color:#facc15;">350%</span>
                        </div>
                        <img src="${window.PixelSprites.getMeteorArtwork(44)}" alt="${ab.name}" style="margin:2px auto;display:block;width:38px;height:38px;object-fit:contain;">
                        <div class="deploy-name" style="color:#fef08a;">${ab.name}</div>
                        <div style="font-size:10px;font-weight:900;color:${onCd ? '#94a3b8' : (isTargeting ? '#facc15' : '#4ade80')};">
                            ${onCd ? `⏳ ${Math.ceil(p.abilityCooldown)}s` : (isTargeting ? '🎯 SELECTING' : '☄️ READY')}
                        </div>
                        <div class="deploy-tags">
                            <span class="tag-placement" style="background:#7f1d1d;color:#fef08a;">160px AoE</span>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    },

    selectUnitToDeploy(instanceId) {
        const unit = window.SaveService.state.inventoryUnits.find(u => u.id === instanceId);
        if (!unit) return;

        const conf = window.UNIT_CONFIG[unit.unitId];
        if (window.CombatEngine.matchCash < conf.baseCost) {
            UIController.showToast(`Need ${conf.baseCost} ¥ to deploy ${conf.name}!`, 'warning');
            return;
        }

        window.CombatEngine.selectedUnitToPlace = unit;
        this.renderUnitDeploymentBar();
    },

    calculateDPSBreakdown(conf, upgradeLvl = 0, trait = null, unitLevel = 1, isHill = false) {
        const stats = window.TraitEngine.calculateEffectiveStats(conf, upgradeLvl, trait, isHill, unitLevel);
        const directDps = stats.spa > 0 ? (stats.damage / stats.spa) : 0;
        let passiveMultiplier = 1.0;
        let passiveBreakdown = [];
        let statusDps = 0;
        let summonDmg = 0;

        // Shadow Assassin Breakdown
        if (conf.id === "shadow_assassin" || conf.id === "shadow_assassin_awakened") {
            const markBonus = 0.35 / 8; // 35% on 8th hit = +4.375% sustained
            passiveBreakdown.push({ name: "Shadow Mark", bonus: "+4.38%", contribution: Math.round(directDps * markBonus) });
            passiveMultiplier += markBonus;

            if (conf.id === "shadow_assassin_awakened") {
                const huntBonus = 0.30; // Max Endless Hunt at 60 kills
                passiveBreakdown.push({ name: "Endless Hunt (Max 30%)", bonus: "+30.0%", contribution: Math.round(directDps * huntBonus) });
                passiveMultiplier += huntBonus;

                const rhythmBonus = 0.50 / 10; // 50% on 10th hit = +5% sustained
                passiveBreakdown.push({ name: "Phantom Rhythm", bonus: "+5.0%", contribution: Math.round(directDps * rhythmBonus) });
                passiveMultiplier += rhythmBonus;
            }
        }

        // Vampire King Breakdown
        if (conf.id === "vampire_king") {
            // Bleed: 50% attack damage over 8s = stats.damage * 0.50 / 8 DPS
            statusDps = Math.round((stats.damage * 0.50) / 8);
            passiveBreakdown.push({ name: "Blood Curse (Bleed)", bonus: `${statusDps} DPS`, contribution: statusDps });

            // Crimson Feast: +15% direct damage on bleeding enemies
            const feastBonus = 0.15;
            passiveBreakdown.push({ name: "Crimson Feast", bonus: "+15.0%", contribution: Math.round(directDps * feastBonus) });
            passiveMultiplier += feastBonus;

            // Army of the Fallen: Summons dealing 50% damage per hit
            summonDmg = Math.round(stats.damage * 0.50);
        }

        // Shinobi Black Flames Burn Breakdown
        if (conf.id === "shinobi" || conf.id === "shinobi_god") {
            statusDps = Math.round(stats.damage);
            passiveBreakdown.push({ name: "Black Flames (Burn)", bonus: `${statusDps} DPS`, contribution: statusDps });
        }

        // Commander Summon Breakdown
        if (conf.id === "commander") {
            summonDmg = stats.damage;
        }

        const passiveDps = Math.round(directDps * passiveMultiplier + statusDps);

        // AoE targets scaling
        const isAoE = conf.attackType === "Splash" || conf.attackType === "CircleAOE" || conf.attackType === "ConeAOE" || conf.attackType === "FullAOE" || conf.attackType === "Line";
        const aoeTargets = isAoE ? {
            target1: Math.round(directDps),
            target3: Math.round(directDps * 3),
            target5: Math.round(directDps * 5)
        } : null;

        return {
            stats: stats,
            directDps: Math.round(directDps),
            passiveDps: passiveDps,
            passiveMultiplier: passiveMultiplier,
            passiveBreakdown: passiveBreakdown,
            statusDps: statusDps,
            summonDmg: summonDmg,
            isAoE: isAoE,
            aoeTargets: aoeTargets
        };
    },

        getCommanderBonus(placedUnit) {
        if (!placedUnit || placedUnit.config.damageType !== "Physical" || !window.CombatEngine || !window.CombatEngine.placedUnits) return 0;
        let maxBonus = 0;
        window.CombatEngine.placedUnits.forEach(b => {
            if (b.config.id === "commander" && b !== placedUnit) {
                const dist = Math.hypot(b.x - placedUnit.x, b.y - placedUnit.y);
                if (dist <= b.stats.range) {
                    const bonus = 0.30 + (b.upgradeLevel || 0) * 0.05;
                    if (bonus > maxBonus) maxBonus = bonus;
                }
            }
        });
        return Math.min(0.60, maxBonus);
    },

    getMagicGirlBonus(placedUnit) {
        if (!placedUnit || placedUnit.config.damageType !== "Magical" || !window.CombatEngine || !window.CombatEngine.placedUnits) return 0;
        let maxBonus = 0;
        window.CombatEngine.placedUnits.forEach(b => {
            if (b.config.id === "magic_girl" && b !== placedUnit) {
                const dist = Math.hypot(b.x - placedUnit.x, b.y - placedUnit.y);
                if (dist <= b.stats.range) {
                    const bonus = 0.30 + (b.upgradeLevel || 0) * 0.05;
                    if (bonus > maxBonus) maxBonus = bonus;
                }
            }
        });
        return Math.min(0.60, maxBonus);
    },

    getActiveBuffsHtml(placedUnit) {
        const buffs = [];
        const conf = placedUnit.config;
        const inst = placedUnit.unitInstance;

        // 1. Trait Bonus (Correctly parses percentage bonus properties)
        if (inst && inst.trait && inst.trait !== "None") {
            const trConf = window.TRAIT_CONFIG && window.TRAIT_CONFIG[inst.trait];
            if (trConf) {
                const parts = [];
                if (trConf.damageBonus) {
                    const pct = Math.round(trConf.damageBonus * 100);
                    parts.push(`+${pct}% Dmg`);
                }
                if (trConf.spaReduction) {
                    const pct = Math.round(trConf.spaReduction * 100);
                    parts.push(`-${pct}% SPA`);
                }
                if (trConf.rangeBonus) {
                    const pct = Math.round(trConf.rangeBonus * 100);
                    parts.push(`+${pct}% Range`);
                }
                if (trConf.bossDamageBonus) {
                    parts.push(`+${Math.round(trConf.bossDamageBonus * 100)}% Boss Dmg`);
                }
                if (trConf.cullingBonus) {
                    parts.push(`+${Math.round(trConf.cullingBonus * 100)}% Culling`);
                }
                if (trConf.incomeBonus) {
                    parts.push(`+${Math.round(trConf.incomeBonus * 100)}% Income`);
                }
                const details = parts.length > 0 ? parts.join(', ') : (trConf.description || "Active");
                buffs.push(`<div style="color:#22c55e;">• <b>Trait (${inst.trait}):</b> ${details}</div>`);
            }
        }

        // 2. Commander Physical Buff (if within range)
        const cmdBonus = this.getCommanderBonus(placedUnit);
        if (cmdBonus > 0) {
            buffs.push(`<div style="color:#38bdf8;">• <b>Commander Aura:</b> +${Math.round(cmdBonus * 100)}% Physical Dmg (Active)</div>`);
        }

        // 3. Magic Girl Magical Buff (if within range)
        const magicBonus = this.getMagicGirlBonus(placedUnit);
        if (magicBonus > 0) {
            buffs.push(`<div style="color:#c084fc;">• <b>Arcane Aura:</b> +${Math.round(magicBonus * 100)}% Magical Dmg (Active)</div>`);
        }

        // 4. Hill Vantage Rule
        if (placedUnit.isHill && conf.hasSoaring) {
            buffs.push(`<div style="color:#38bdf8;">• <b>Hill Vantage:</b> Soaring Altitude Active 🪽</div>`);
        }

        if (buffs.length === 0) {
            buffs.push(`<div style="color:#64748b;">No active auras or passives</div>`);
        }

        return buffs.join('');
    },
    showUnitInspector(placedUnit) {
        const inspector = document.getElementById("unit-inspector-panel");
        if (!inspector) return;

        const conf = placedUnit.config;
        const stats = placedUnit.stats;
        const nextLvl = placedUnit.upgradeLevel + 1;
        const nextUpgrade = conf.upgrades && conf.upgrades[nextLvl - 1];

        // Placements
        const limit = conf.maxPlacements || 4;
        const placedCount = window.CombatEngine.placedUnits.filter(p => p.config.id === conf.id).length;
        const currentAbility = (conf.upgrades && placedUnit.upgradeLevel > 0 && conf.upgrades[placedUnit.upgradeLevel - 1].abilityName) || conf.abilityName || "Basic Attack";

        // Calculate Effective Next Upgrade Stats WITH Traits, Level Scaling, and Hill
        const nextEffectiveStats = nextUpgrade ? window.TraitEngine.calculateEffectiveStats(
            conf,
            nextLvl,
            placedUnit.unitInstance.trait,
            placedUnit.isHill,
            placedUnit.unitInstance.level || 1
        ) : null;

        // Aura Buff Multiplier (Commander for Physical, Magic Girl for Magical)
        const auraBuff = conf.damageType === "Physical" ? this.getCommanderBonus(placedUnit) : this.getMagicGirlBonus(placedUnit);
        const auraLabel = conf.damageType === "Physical" ? "Commander" : "Arcane";

        // DPS Calculation Breakdown
        const dpsData = this.calculateDPSBreakdown(conf, placedUnit.upgradeLevel, placedUnit.unitInstance.trait, placedUnit.unitInstance.level || 1, placedUnit.isHill);
        const effectiveDps = Math.round(dpsData.directDps * (1 + auraBuff));
        const effectivePassiveDps = Math.round(dpsData.passiveDps * (1 + auraBuff));

        const isFarm = !!(conf.isFarm || conf.role === "Farm" || conf.incomePerWave !== undefined);
        const currentIncome = (stats.income !== undefined && stats.income > 0) ? stats.income : ((placedUnit.upgradeLevel > 0 && conf.upgrades && (conf.upgrades[placedUnit.upgradeLevel - 1].incomePerWave || conf.upgrades[placedUnit.upgradeLevel - 1].income)) || conf.incomePerWave || 0);
        const nextIncome = nextUpgrade ? (nextUpgrade.incomePerWave || nextUpgrade.income || currentIncome) : currentIncome;
        const incomeIncrease = nextIncome - currentIncome;

        let html = `
            <div class="inspector-header" style="display:flex;align-items:center;justify-content:space-between;">
                <div>
                    <h3>${conf.name} (Lv.${placedUnit.upgradeLevel})</h3>
                    <span class="rarity-badge ${conf.rarity.toLowerCase()}">${conf.rarity}</span>
                </div>
                <img src="${window.PixelSprites.getUnitSprite(conf.id, 56)}" alt="${conf.name}" style="width:56px;height:56px;border:1px solid #3b82f6;border-radius:6px;background:#0f172a;object-fit:contain;">
            </div>
            <div class="inspector-stats">
                <div style="display:flex;gap:6px;margin:6px 0;">
                    ${this.getDamageTypeBadge(conf.damageType)}
                    ${this.getElementBadge(conf.element)}
                </div>
                <div><b>Attack Type:</b> <span style="color:#facc15;">${conf.attackShape || conf.attackType}</span></div>
                <div><b>Current Ability:</b> <span style="color:#38bdf8;font-weight:700;">${currentAbility}</span></div>
                <div><b>Placements:</b> <span style="color:#94a3b8;">${placedCount} / ${limit} on field</span></div>
                <div><b>Placement Tile:</b> ${conf.placement} ${placedUnit.isHill ? '(On Hill)' : '(On Ground)'}</div>
                <div><b>Soaring:</b> ${stats.soaringActive ? '<span style="color:#38bdf8;font-weight:700;">Can Hit Soaring Enemies 🪽</span>' : (conf.hasSoaring ? '<span style="color:#94a3b8;">Inactive (Needs Hill)</span>' : '<span style="color:#64748b;">None</span>')}</div>
                <div><b>Trait:</b> ${placedUnit.unitInstance.trait || 'None'}</div>
                
                <!-- Active Buffs & Auras Section -->
                <div style="background:#090d16;border:1px solid #1e293b;border-radius:6px;padding:8px;margin:8px 0;">
                    <div style="font-weight:700;color:#38bdf8;font-size:11px;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
                        <span>✨</span> ACTIVE BUFFS & AURAS
                    </div>
                    <div style="font-size:11px;line-height:1.4;">
                        ${this.getActiveBuffsHtml(placedUnit)}
                    </div>
                </div>
                <hr style="border:0;border-top:1px solid #334155;margin:8px 0;">
                ${isFarm ? `
                    <div style="background:rgba(234,179,8,0.12);border:1px solid #eab308;border-radius:8px;padding:8px;margin:8px 0;">
                        <div style="font-size:11px;font-weight:900;color:#facc15;margin-bottom:2px;display:flex;align-items:center;gap:4px;">
                            <span>💰</span> CURRENT WAVE INCOME
                        </div>
                        <div style="font-size:15px;font-weight:800;color:#4ade80;">
                            +${currentIncome.toLocaleString()} ¥ <span style="font-size:11px;color:#94a3b8;font-weight:500;">/ wave</span>
                        </div>
                    </div>
                ` : `
                    <div><b>Damage per Attack:</b> <span style="color:#f8fafc;font-weight:700;">${Math.round(stats.damage * (1 + auraBuff))}</span> ${auraBuff > 0 ? `<span style="color:#38bdf8;font-size:11px;">(${stats.damage} + ${Math.round(stats.damage * auraBuff)} ${auraLabel})</span>` : ''}</div>
                    <div><b>SPA:</b> <span style="color:#f8fafc;font-weight:700;">${stats.spa}s</span></div>
                    <div><b>Range:</b> <span style="color:#f8fafc;font-weight:700;">${stats.range}</span></div>
                `}
                
                <!-- IN-GAME LIVE DPS CHECKER CARD -->
                <div style="background:#090d16;border:1px solid #38bdf8;border-radius:8px;padding:8px;margin:8px 0;box-shadow:0 0 10px rgba(56,189,248,0.2);">
                    <div style="font-size:11px;font-weight:900;color:#38bdf8;margin-bottom:4px;display:flex;justify-content:space-between;">
                        <span>📊 DPS CHECKER</span>
                        <span style="color:#facc15;">Direct: ${effectiveDps} /s</span>
                    </div>
                    <div style="font-size:12px;font-weight:800;color:#4ade80;">
                        Passive-Adjusted DPS: ${effectivePassiveDps} /s
                    </div>
                    ${dpsData.passiveBreakdown.length > 0 ? `
                        <div style="font-size:10.5px;color:#94a3b8;margin-top:4px;">
                            ${dpsData.passiveBreakdown.map(p => `<div>• <b>${p.name}:</b> ${p.bonus} (+${p.contribution} DPS)</div>`).join('')}
                        </div>
                    ` : ''}
                    ${dpsData.statusDps > 0 ? `
                        <div style="font-size:11px;color:#f97316;margin-top:2px;">
                            🔥 Status Effect DPS: <b>+${dpsData.statusDps} /s</b>
                        </div>
                    ` : ''}
                    ${dpsData.summonDmg > 0 ? `
                        <div style="font-size:11px;color:#a855f7;margin-top:2px;">
                            💀 Summon Strike DMG: <b>${dpsData.summonDmg}</b>
                        </div>
                    ` : ''}
                    ${dpsData.isAoE && dpsData.aoeTargets ? `
                        <div style="font-size:10.5px;color:#cbd5e1;margin-top:4px;background:rgba(255,255,255,0.05);padding:4px;border-radius:4px;">
                            <b>AoE Targets Scaling:</b><br>
                            1 Target: ${dpsData.aoeTargets.target1} DPS | 3 Targets: ${dpsData.aoeTargets.target3} DPS | 5 Targets: ${dpsData.aoeTargets.target5} DPS
                        </div>
                    ` : ''}
                </div>

                <div><b>Target Mode:</b> 
                    <select onchange="UIController.changeUnitTargetMode('${placedUnit.id}', this.value)" style="background:#0f172a;color:#fff;border:1px solid #475569;padding:2px 6px;border-radius:4px;">
                        <option value="First" ${placedUnit.targetMode === 'First' ? 'selected' : ''}>First</option>
                        <option value="Last" ${placedUnit.targetMode === 'Last' ? 'selected' : ''}>Last</option>
                        <option value="Strongest" ${placedUnit.targetMode === 'Strongest' ? 'selected' : ''}>Strongest</option>
                        <option value="Closest" ${placedUnit.targetMode === 'Closest' ? 'selected' : ''}>Closest</option>
                    </select>
                </div>

                ${nextUpgrade ? `
                    <div class="inspector-upgrade-box">
                        <div class="upgrade-preview-title">NEXT UPGRADE: Lv.${nextLvl} (${nextUpgrade.cost.toLocaleString()} ¥)</div>
                        ${isFarm ? `
                            <div class="upgrade-diff-row" style="background:rgba(234,179,8,0.14);padding:6px 8px;border-radius:6px;border:1px solid rgba(234,179,8,0.4);margin:4px 0;">
                                <span style="font-weight:700;color:#facc15;">Income Increase:</span>
                                <span>${currentIncome.toLocaleString()} ¥ ➔ <b class="upgrade-diff-val" style="color:#4ade80;font-size:13px;">${nextIncome.toLocaleString()} ¥ (+${incomeIncrease.toLocaleString()} ¥/wave)</b></span>
                            </div>
                        ` : ''}
                        ${!isFarm && nextUpgrade ? `
                            <div class="upgrade-diff-row">
                                <span>Damage:</span>
                                <span>${stats.damage} ➔ <b class="upgrade-diff-val">${nextEffectiveStats ? nextEffectiveStats.damage : nextUpgrade.damage} (${((nextEffectiveStats ? nextEffectiveStats.damage : nextUpgrade.damage) - stats.damage) >= 0 ? '+' : ''}${((nextEffectiveStats ? nextEffectiveStats.damage : nextUpgrade.damage) - stats.damage)})</b></span>
                            </div>
                            <div class="upgrade-diff-row">
                                <span>SPA:</span>
                                <span>${stats.spa}s ➔ <b class="upgrade-diff-val">${nextEffectiveStats ? nextEffectiveStats.spa : nextUpgrade.spa}s ${((nextEffectiveStats ? nextEffectiveStats.spa : nextUpgrade.spa) - stats.spa) < 0 ? `(${((nextEffectiveStats ? nextEffectiveStats.spa : nextUpgrade.spa) - stats.spa).toFixed(2)}s)` : ''}</b></span>
                            </div>
                            <div class="upgrade-diff-row">
                                <span>Range:</span>
                                <span>${stats.range} ➔ <b class="upgrade-diff-val">${nextEffectiveStats ? nextEffectiveStats.range : nextUpgrade.range} (${((nextEffectiveStats ? nextEffectiveStats.range : nextUpgrade.range) - stats.range) >= 0 ? '+' : ''}${((nextEffectiveStats ? nextEffectiveStats.range : nextUpgrade.range) - stats.range)})</b></span>
                            </div>
                        ` : ''}
                        ${nextUpgrade.abilityName ? `
                            <div class="upgrade-ability-callout">
                                ⚔️ Skill Upgrade: <b>${nextUpgrade.abilityName}</b>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                <!-- ACTIVE ABILITY CARD (For units with activeAbility e.g. Shinobi (God)) -->
                ${conf.activeAbility ? `
                    <div style="background:linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.15));border:1px solid #f97316;border-radius:8px;padding:10px;margin:8px 0;box-shadow:0 0 12px rgba(249,115,22,0.25);">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                            <img src="${window.PixelSprites.getMeteorArtwork(48)}" alt="${conf.activeAbility.name}" style="width:48px;height:48px;border-radius:6px;border:1px solid #f97316;background:#0c0a09;box-shadow:0 0 8px rgba(249,115,22,0.4);object-fit:contain;">
                            <div>
                                <div style="font-size:12px;font-weight:900;color:#facc15;display:flex;align-items:center;gap:4px;">
                                    <span>☄️</span> ${conf.activeAbility.name}
                                    <span style="font-size:9.5px;background:#ef4444;color:#fff;padding:1px 5px;border-radius:4px;font-weight:900;">ACTIVE ABILITY</span>
                                </div>
                                <div style="font-size:10.5px;color:#cbd5e1;line-height:1.3;margin-top:2px;">
                                    ${conf.activeAbility.description}
                                </div>
                            </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:10.5px;color:#94a3b8;border-top:1px solid rgba(249,115,22,0.3);padding-top:6px;margin-top:6px;">
                            <span><b>Damage:</b> <span style="color:#facc15;">${Math.round((placedUnit.stats ? placedUnit.stats.damage : conf.baseDamage) * conf.activeAbility.damageMultiplier).toLocaleString()} (350%)</span></span>
                            <span><b>AoE:</b> <span style="color:#38bdf8;">${conf.activeAbility.aoeRadius}px</span></span>
                            <span><b>Cooldown:</b> <span style="color:#f87171;">${conf.activeAbility.cooldownSeconds}s</span></span>
                        </div>
                        <div style="margin-top:8px;">
                            ${(placedUnit.abilityCooldown && placedUnit.abilityCooldown > 0) ? `
                                <button style="width:100%;background:#334155;color:#94a3b8;border:1px solid #475569;padding:9px;border-radius:6px;font-weight:800;font-size:12px;cursor:not-allowed;" disabled>
                                    ⏳ ON COOLDOWN (${Math.ceil(placedUnit.abilityCooldown)}s)
                                </button>
                            ` : `
                                <button onclick="UIController.activateUnitAbility('${placedUnit.id}')" style="width:100%;background:linear-gradient(135deg, #f97316, #dc2626);color:#ffffff;border:1px solid #facc15;padding:9px;border-radius:6px;font-weight:900;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 0 12px rgba(249,115,22,0.5);">
                                    <span>☄️</span> CAST HEAVENLY METEOR (Select Zone)
                                </button>
                            `}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="inspector-actions">
                ${nextUpgrade ? `
                    <button class="upgrade-btn" onclick="UIController.upgradeSelectedUnit('${placedUnit.id}')">
                        Upgrade (${nextUpgrade.cost} ¥)
                    </button>
                ` : `<button class="upgrade-btn disabled" disabled>MAX LEVEL</button>`}
                <button class="sell-btn" onclick="UIController.sellSelectedUnit('${placedUnit.id}')">
                    Sell (+${Math.floor((conf.baseCost + (conf.upgrades ? conf.upgrades.slice(0, placedUnit.upgradeLevel).reduce((a, b) => a + b.cost, 0) : 0)) * 0.50)} ¥ [50%])
                </button>
            </div>
        `;

        inspector.innerHTML = html;
        inspector.style.display = "block";
    },

    hideUnitInspector() {
        const inspector = document.getElementById("unit-inspector-panel");
        if (inspector) inspector.style.display = "none";
    },

    upgradeSelectedUnit(placedId) {
        const u = window.CombatEngine.placedUnits.find(p => p.id === placedId);
        if (u) {
            window.CombatEngine.upgradePlacedUnit(u);
        }
    },

    sellSelectedUnit(placedId) {
        const u = window.CombatEngine.placedUnits.find(p => p.id === placedId);
        if (u) {
            window.CombatEngine.sellPlacedUnit(u);
        }
    },

    activateUnitAbility(placedId) {
        const u = window.CombatEngine.placedUnits.find(p => p.id === placedId);
        if (u) {
            window.CombatEngine.startAbilityTargeting(u);
        }
    },

    changeUnitTargetMode(placedId, newMode) {
        const u = window.CombatEngine.placedUnits.find(p => p.id === placedId);
        if (u) {
            u.targetMode = newMode;
        }
    },

    showMatchResultModal(data) {
        const modal = document.getElementById("match-result-modal");
        const body = document.getElementById("match-result-body");
        if (!modal || !body) return;

        if (data.victory) {
            // Build the queue of sequential victory rewards
            const rewardQueue = [];
            if (data.gemsAwarded) {
                rewardQueue.push({
                    type: "gems",
                    title: "GEMS HARVEST",
                    value: `+${data.gemsAwarded.toLocaleString()} 💎`,
                    sub: data.isFirstClear ? "First Clear Victory Bonus!" : "Stage Clear Reward",
                    color: "#38bdf8",
                    iconSvg: window.PixelSprites && window.PixelSprites.getGemIcon ? window.PixelSprites.getGemIcon(72) : "💎"
                });
            }
            if (data.unitExpAwarded) {
                rewardQueue.push({
                    type: "exp",
                    title: "UNIT EXP",
                    value: `+${data.unitExpAwarded.toLocaleString()} EXP ⚔️`,
                    sub: "Awarded to All Equipped Battle Team Units",
                    color: "#22c55e",
                    iconSvg: `<div style="font-size:64px;filter:drop-shadow(0 0 16px rgba(34,197,94,0.6));">⚔️</div>`
                });
            }
            if (data.foodAmount) {
                rewardQueue.push({
                    type: "food",
                    title: "FOOD DROP",
                    value: `+${data.foodAmount} Rice Balls 🍙`,
                    sub: "1-8 Guaranteed Random Food Harvest",
                    color: "#facc15",
                    iconSvg: window.PixelSprites ? `<img src="${window.PixelSprites.getFood('rice_ball', 64)}" style="width:64px;height:64px;image-rendering:pixelated;filter:drop-shadow(0 0 16px rgba(250,204,21,0.6));">` : "🍙"
                });
            }
            if (data.isLegend && data.legendDrops && data.legendDrops.length > 0) {
                data.legendDrops.forEach(d => {
                    const iconSvg = window.PixelSprites && window.PixelSprites.getMaterialIcon ? window.PixelSprites.getMaterialIcon(d.id, 64) : `<div style="font-size:64px;">${d.icon}</div>`;
                    rewardQueue.push({
                        type: "material",
                        title: d.name.toUpperCase(),
                        value: `+${d.count} ${d.name}`,
                        sub: "100% Guaranteed Legend Stage Drop",
                        color: "#f59e0b",
                        iconSvg: iconSvg
                    });
                });
            }
            rewardQueue.push({
                type: "accountExp",
                title: "PLAYER EXP",
                value: `+${data.isHard ? 120 : 60} EXP 🌟`,
                sub: "Player Account Progression",
                color: "#a855f7",
                iconSvg: `<div style="font-size:64px;filter:drop-shadow(0 0 16px rgba(168,85,247,0.6));">🌟</div>`
            });

            this.renderVictoryRewardStep(data, rewardQueue, 0);
        } else {
            let html = `
                <div style="text-align:center;">
                    <h1 style="color:#ef4444;font-size:32px;margin-bottom:6px;">💀 DEFEAT</h1>
                    <p style="font-size:16px;color:#94a3b8;margin-bottom:18px;">Base Core was destroyed!</p>
                    <p style="font-size:14px;color:#cbd5e1;">Waves Survived: <b style="color:#facc15;">${data.wavesCleared}</b></p>
                    <button class="stage-btn special-btn" style="width:220px;margin-top:20px;padding:12px;font-size:15px;font-weight:900;cursor:pointer;background:linear-gradient(180deg,#dc2626,#991b1b);border:1px solid #f87171;border-radius:8px;color:#fff;box-shadow:0 0 15px rgba(239,68,68,0.4);" onclick="UIController.exitBattleToLobby()">Return to Lobby</button>
                </div>
            `;
            body.innerHTML = html;
        }

        modal.style.display = "flex";
        modal.style.zIndex = "99999";
        modal.classList.add("open");
    },

    renderVictoryRewardStep(data, queue, stepIndex) {
        const body = document.getElementById("match-result-body");
        if (!body) return;

        if (stepIndex >= queue.length) {
            this.renderVictoryFinalSummary(data);
            return;
        }

        const item = queue[stepIndex];
        if (window.AudioService && window.AudioService.playUpgradeSound) {
            window.AudioService.playUpgradeSound();
        }

        window.currentMatchResultData = data;
        window.currentMatchRewardQueue = queue;

        body.innerHTML = `
            <div style="text-align:center;padding:10px 0;animation:atdPopIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-size:12px;font-weight:900;letter-spacing:2px;color:#22c55e;text-transform:uppercase;margin-bottom:4px;">
                    ⚔️ STAGE CLEARED • REWARD ${stepIndex + 1} / ${queue.length}
                </div>
                <div style="font-size:14px;color:#94a3b8;margin-bottom:20px;">${data.stageName}</div>

                <div style="background:radial-gradient(circle, rgba(15,23,42,0.9), rgba(2,6,23,0.95));border:2px solid ${item.color};border-radius:16px;padding:30px 20px;margin:0 auto 20px auto;max-width:320px;box-shadow:0 0 30px ${item.color}40;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                    <div style="height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                        ${item.iconSvg}
                    </div>
                    <div style="font-size:13px;font-weight:900;letter-spacing:1px;color:${item.color};text-transform:uppercase;margin-bottom:4px;">
                        ${item.title}
                    </div>
                    <div style="font-size:26px;font-weight:900;color:#f8fafc;margin-bottom:6px;">
                        ${item.value}
                    </div>
                    <div style="font-size:12px;color:#94a3b8;">
                        ${item.sub}
                    </div>
                </div>

                <button class="stage-btn special-btn" style="width:240px;padding:12px;font-size:15px;font-weight:900;background:linear-gradient(180deg,#3b82f6,#2563eb);border:1px solid #60a5fa;border-radius:8px;color:#fff;box-shadow:0 0 15px rgba(59,130,246,0.4);" onclick="UIController.renderVictoryRewardStep(window.currentMatchResultData, window.currentMatchRewardQueue, ${stepIndex + 1})">
                    ${stepIndex + 1 < queue.length ? '▶ NEXT REWARD' : '✨ VIEW SUMMARY'}
                </button>
            </div>
        `;
    },

    renderVictoryFinalSummary(data) {
        const body = document.getElementById("match-result-body");
        if (!body) return;

        let dropsHtml = "";
        if (data.isLegend && data.legendDrops && data.legendDrops.length > 0) {
            dropsHtml = data.legendDrops.map(d => {
                const iconSvg = window.PixelSprites && window.PixelSprites.getMaterialIcon ? window.PixelSprites.getMaterialIcon(d.id, 20) : d.icon;
                return `
                    <div class="reward-row" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                        <span style="display:inline-flex;align-items:center;gap:6px;">${iconSvg} <span>${d.name}:</span></span>
                        <b style="color:#facc15;">+${d.count} Guaranteed Material</b>
                    </div>
                `;
            }).join("");
        } else if (data.foodAmount) {
            dropsHtml = `
                <div class="reward-row">
                    <span>🍙 Food Drop (1-8 Random):</span>
                    <b style="color:#facc15;">+${data.foodAmount} Rice Balls</b>
                </div>
            `;
        }

        body.innerHTML = `
            <div style="text-align:center;animation:atdPopIn 0.3s ease-out;">
                <h1 style="color:#22c55e;font-size:32px;margin-bottom:6px;">⚔️ VICTORY!</h1>
                <p style="font-size:16px;color:#94a3b8;margin-bottom:18px;">${data.stageName} Cleared</p>
                
                <div class="rewards-summary-box">
                    <h3 style="margin-top:0;margin-bottom:12px;color:#38bdf8;">🎁 All Rewards Claimed:</h3>
                    <div class="reward-row">
                        <span>💎 Gems:</span>
                        <b style="color:#38bdf8;">+${data.gemsAwarded} ${data.isFirstClear ? '(FIRST CLEAR!)' : '(Repeat)'}</b>
                    </div>
                    ${data.unitExpAwarded ? `
                        <div class="reward-row">
                            <span>⚔️ Unit EXP (Equipped Team):</span>
                            <b style="color:#22c55e;">+${data.unitExpAwarded.toLocaleString()} EXP</b>
                        </div>
                    ` : ''}
                    ${dropsHtml}
                    <div class="reward-row">
                        <span>🌟 Account EXP:</span>
                        <b style="color:#a855f7;">+${data.isHard ? 120 : 60} EXP</b>
                    </div>
                </div>
                
                <button class="stage-btn special-btn" style="width:220px;margin-top:20px;padding:12px;font-size:15px;font-weight:900;cursor:pointer;background:linear-gradient(180deg,#16a34a,#15803d);border:1px solid #4ade80;border-radius:8px;color:#fff;box-shadow:0 0 15px rgba(34,197,94,0.4);" onclick="UIController.exitBattleToLobby()">Return to Lobby</button>
            </div>
        `;
    },

    // ----------------------------------------------------
    // SUMMON BANNERS VIEW
    // ----------------------------------------------------
    renderBanners() {
        const container = document.getElementById("banners-container");
        if (!container) return;

        const state = window.SaveService.state;
        const isVip = state.vip;
        const banner = window.GachaEngine.getRotatedBanner ? window.GachaEngine.getRotatedBanner() : window.GachaEngine.BANNERS["featured_mythics"];
        const tickets = state.summonTickets || 0;
        const leftConf = window.UNIT_CONFIG[banner.leftUnitId] || { name: "Shinobi", rarity: "Mythic" };
        const midConf = window.UNIT_CONFIG[banner.middleUnitId] || { name: "Shadow Assassin", rarity: "Mythic" };
        const rightConf = window.UNIT_CONFIG[banner.rightUnitId] || { name: "Thunder God", rarity: "Mythic" };
        const singleCost = window.GachaEngine.getSummonCost("featured_mythics", 1);
        const multiCost = window.GachaEngine.getSummonCost("featured_mythics", 10);
        const pity = (state.gachaPity && state.gachaPity["featured_mythics"]) || { count: 0, legendaryPity: 0, mythicPity: 0, featuredMiddlePity: 0 };

        // Dynamic countdown until next rotation
        const now = new Date();
        const minutesLeft = 59 - now.getMinutes();
        const secondsLeft = 59 - now.getSeconds();
        const timeFormatted = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

        let html = `
            <div class="special-banner-wrapper">
                <!-- Column wrapping top meta bar and banner card for perfect center alignment -->
                <div class="banner-main-column">
                    <!-- Top Meta Bar (No Banner Tier text) - Centered directly above middle character -->
                    <div class="banner-top-meta">
                        <div class="banner-timer-bar-wrap">
                            <span class="banner-timer-label">Hourly Rotation:</span>
                            <span id="banner-timer-clock" class="banner-timer-value">Resets in ${String(minutesLeft).padStart(2, '0')}m ${String(secondsLeft).padStart(2, '0')}s (Hourly)</span>
                        </div>
                        <div class="banner-pity-tag">
                            Featured (Middle) Pity: <b>${pity.featuredMiddlePity || 0}/400</b>
                        </div>
                    </div>

                    <!-- Main Featured Banner Container (Clickable for Rates Modal) -->
                    <div class="special-banner-card" onclick="UIController.openRatesModal('featured_mythics')" title="Click banner for details and rates!">
                        <!-- Top Badges -->
                        <div class="banner-badge-row">
                            <div class="rate-up-badge">${banner.badgeRateUp || 'RATE UP!!!'}</div>
                            <div class="bonus-badge">${banner.badgeBonus || '2x Mythic Chance!'}</div>
                        </div>

                        <!-- 3 Featured Mythics Showcase (Rotated Hourly) -->
                        <div class="character-trio-showcase">
                            <!-- Left: ${leftConf.name} -->
                            <div class="showcase-character-column left">
                                <img src="${window.PixelSprites.getUnitModel(banner.leftUnitId, 140, 180)}" alt="${leftConf.name}" class="showcase-character-img" style="width:140px;height:180px;">
                                <div class="showcase-character-name">${leftConf.name}</div>
                                <span class="showcase-rarity-pill mythic">Mythic</span>
                            </div>

                            <!-- Center: ${midConf.name} (Prominent & Centered) -->
                            <div class="showcase-character-column middle">
                                <img src="${window.PixelSprites.getUnitModel(banner.middleUnitId, 180, 220)}" alt="${midConf.name}" class="showcase-character-img" style="width:180px;height:220px;">
                                <div class="showcase-character-name">${midConf.name}</div>
                                <span class="showcase-rarity-pill mythic">Featured Rate Up</span>
                            </div>

                            <!-- Right: ${rightConf.name} -->
                            <div class="showcase-character-column right">
                                <img src="${window.PixelSprites.getUnitModel(banner.rightUnitId, 140, 180)}" alt="${rightConf.name}" class="showcase-character-img" style="width:140px;height:180px;">
                                <div class="showcase-character-name">${rightConf.name}</div>
                                <span class="showcase-rarity-pill mythic">Mythic</span>
                            </div>
                        </div>

                        <!-- Bottom Pricing & Subtext -->
                        <div class="banner-info-bar">
                            <div class="banner-price-callout">
                                <span>${singleCost}</span> <span class="gem-icon">💎</span>
                                ${isVip ? '<span class="vip-price-discount">👑 VIP 20% OFF</span>' : ''}
                            </div>
                            <div class="banner-hint-text">
                                Spend gems for new units! Rate Up for the featured unit(s)! Click banner for details and rates!
                            </div>
                        </div>

                        <!-- Action Controls (Gems + Usable Tickets) -->
                        <div class="banner-action-buttons" onclick="event.stopPropagation()">
                            ${tickets > 0 ? `
                                <button class="tactile-green-btn" onclick="UIController.performSummon('${banner.id || 'featured_mythics'}', 1, true)" style="background:linear-gradient(180deg,#8b5cf6,#6d28d9);border:2px solid #c084fc;box-shadow:0 0 14px rgba(192,132,252,0.6);">
                                    🎫 1x Ticket (${tickets} Owned)
                                </button>
                            ` : ''}
                            <button class="tactile-green-btn" onclick="UIController.performSummon('${banner.id || 'featured_mythics'}', 1)">
                                Summon x1 (${singleCost} 💎)
                            </button>
                            <button class="tactile-green-btn" onclick="UIController.performSummon('${banner.id || 'featured_mythics'}', 10)">
                                Summon x10 (${multiCost} 💎)
                            </button>
                            <button class="tactile-green-btn" onclick="UIController.openRatesModal('${banner.id || 'featured_mythics'}')" style="background:#0284c7;border:2px solid #38bdf8;box-shadow:0 0 12px rgba(56,189,248,0.5);">
                                📊 View Rates
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right Side Panel: "More Gems" (Currently in Progress) -->
                <div class="more-gems-panel">
                    <div class="more-gems-header">More Gems</div>
                    
                    <div class="more-gems-tier-card" style="opacity:0.75;cursor:not-allowed;" onclick="UIController.showToast('💎 More Gems store is currently in progress!', 'info')">
                        <div class="tier-boost-tag">Coming Soon</div>
                        <div class="tier-title-label">Huge Pack</div>
                        <div class="tier-amount-value">+2,000 💎</div>
                        <div class="tier-btn-price" style="background:#475569;color:#cbd5e1;">Currently in Progress</div>
                    </div>

                    <div class="more-gems-tier-card" style="opacity:0.75;cursor:not-allowed;" onclick="UIController.showToast('💎 More Gems store is currently in progress!', 'info')">
                        <div class="tier-boost-tag">Coming Soon</div>
                        <div class="tier-title-label">Large Pack</div>
                        <div class="tier-amount-value">+925 💎</div>
                        <div class="tier-btn-price" style="background:#475569;color:#cbd5e1;">Currently in Progress</div>
                    </div>

                    <div class="more-gems-tier-card" style="opacity:0.75;cursor:not-allowed;" onclick="UIController.showToast('💎 More Gems store is currently in progress!', 'info')">
                        <div class="tier-boost-tag">Coming Soon</div>
                        <div class="tier-title-label">Medium Pack</div>
                        <div class="tier-amount-value">+475 💎</div>
                        <div class="tier-btn-price" style="background:#475569;color:#cbd5e1;">Currently in Progress</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    openSettingsModal() {
        const modal = document.getElementById("settings-modal");
        if (!modal) return;

        const state = window.SaveService.state;
        const settings = state.settings || {};

        const rareCb = document.getElementById("setting-auto-sell-rare");
        const epicCb = document.getElementById("setting-auto-sell-epic");
        const legCb = document.getElementById("setting-auto-sell-leg");
        const skipCb = document.getElementById("setting-auto-skip");
        const speedSel = document.getElementById("setting-default-speed");
        const sfxCb = document.getElementById("setting-sfx-mute");

        if (rareCb) rareCb.checked = !!settings.autoSellRare;
        if (epicCb) epicCb.checked = !!settings.autoSellEpic;
        if (legCb) legCb.checked = !!settings.autoSellLegendary;
        if (skipCb) skipCb.checked = !!settings.autoSkipWave;
        if (speedSel) speedSel.value = settings.defaultSpeed || 1;
        if (sfxCb) sfxCb.checked = window.AudioService ? window.AudioService.muted : false;

        modal.classList.add("open");
        modal.style.display = "flex";
    },

    closeSettingsModal() {
        const modal = document.getElementById("settings-modal");
        if (modal) {
            modal.classList.remove("open");
            modal.style.display = "none";
        }
    },

    toggleSetting(key, val) {
        if (window.SaveService) {
            window.SaveService.updateSetting(key, val);
        }
    },

    toggleAudioMute(muted) {
        if (window.AudioService) {
            window.AudioService.muted = muted;
        }
        this.toggleSetting('sfxMuted', muted);
    },

    openRatesModal(bannerId = "featured_mythics") {
        const modal = document.getElementById("summon-rates-modal");
        const container = document.getElementById("rates-breakdown-container");
        if (!modal || !container) return;

        const data = window.GachaEngine.getRateBreakdown(bannerId);
        let listHtml = "";

        const rarityOrder = ["Mythic", "Legendary", "Epic", "Rare", "Secret"];
        rarityOrder.forEach(rarity => {
            const group = data.breakdown[rarity];
            if (!group) return;

            const rLower = rarity.toLowerCase();
            listHtml += `
                <div class="rarity-rate-section ${rLower}">
                    <div class="rarity-rate-header ${rLower}">
                        <span>${rarity}</span>
                        <span>${group.totalRate}%</span>
                    </div>
                    <div class="rarity-units-table">
                        ${group.units.map(u => `
                            <div class="rarity-unit-row">
                                <div class="rarity-unit-name">
                                    ${u.name}
                                    ${u.isMiddle ? '<span class="featured-indicator-tag" style="background:#06b6d4;color:#000;font-weight:900;">FEATURED (MIDDLE)</span>' : (u.isLeft ? '<span class="featured-indicator-tag" style="background:#e11d48;color:#fff;font-weight:900;">FEATURED (LEFT)</span>' : (u.isRight ? '<span class="featured-indicator-tag" style="background:#10b981;color:#fff;font-weight:900;">FEATURED (RIGHT)</span>' : (u.isFeatured ? '<span class="featured-indicator-tag">FEATURED</span>' : '')))}
                                </div>
                                <div class="rarity-unit-meta">
                                    <span style="font-size:11px;color:#94a3b8;">${u.note || ''}</span>
                                    <span class="rarity-unit-percent">${u.relativePercent}</span>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        });

        container.innerHTML = listHtml;
        const shinyB = modal.querySelector(".rates-shiny-pill b");
        if (shinyB) {
            const hasSh = window.SaveService && window.SaveService.hasShinyHunter();
            shinyB.textContent = hasSh ? "3% (3x Shiny Hunter Active!)" : "1%";
        }
        modal.style.display = "flex";
        modal.classList.add("open");
    },

    theatreData: {
        results: [],
        currentIndex: 0,
        isAnimating: false,
        starState: "idle", // "idle" | "cracking" | "shattering"
        timerId: null
    },

    performSummon(bannerId, count, useTicket = false) {
        const res = window.GachaEngine.summon(bannerId, count, useTicket);
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }

        this.updateTopBar();
        this.renderBanners();

        // Launch Manual Star Cracking Sequence (Player opens it themselves!)
        this.startSummonTheatre(res.results);
    },

    startSummonTheatre(results) {
        this.theatreData.results = results;
        this.theatreData.currentIndex = 0;
        this.theatreData.isAnimating = true;
        this.theatreData.starState = "idle";

        const modal = document.getElementById("summon-theatre-modal");
        const starStage = document.getElementById("theatre-star-stage");
        const cardStage = document.getElementById("theatre-card-stage");
        const starWrap = document.getElementById("theatre-star-container");
        const statusText = document.getElementById("theatre-status-text");

        if (!modal) return;

        modal.style.display = "flex";
        starStage.style.display = "flex";
        cardStage.style.display = "none";
        starWrap.classList.remove("cracking", "shattering");
        statusText.textContent = "✨ Tap the Celestial Star to awaken it! ✨";

        if (window.AudioService) window.AudioService.playTone(350, 'sine', 0.6, 0.15);
    },

    handleStarClick(e) {
        if (e) e.stopPropagation();
        const d = this.theatreData;
        if (!d.isAnimating) return;

        const starWrap = document.getElementById("theatre-star-container");
        const statusText = document.getElementById("theatre-status-text");
        const starStage = document.getElementById("theatre-star-stage");
        const cardStage = document.getElementById("theatre-card-stage");

        if (d.starState === "idle") {
            // First Click: Fractures start appearing
            d.starState = "cracking";
            starWrap.classList.add("cracking");
            statusText.textContent = "⚡ The Star is Fracturing! Tap again to shatter! ⚡";
            if (window.AudioService) {
                window.AudioService.playTone(450, 'sawtooth', 0.25, 0.2);
            }
        } else if (d.starState === "cracking") {
            // Second Click: Star shatters & bursts open!
            d.starState = "shattering";
            starWrap.classList.remove("cracking");
            starWrap.classList.add("shattering");
            statusText.textContent = "💥 BOOM! The Celestial Star Shatters! 💥";

            if (window.AudioService) {
                window.AudioService.playTone(700, 'square', 0.35, 0.35);
            }

            // Transition to card stage after burst animation
            setTimeout(() => {
                if (!d.isAnimating) return;
                starStage.style.display = "none";
                cardStage.style.display = "flex";
                this.revealNextCard();
            }, 380);
        }
    },

    revealNextCard() {
        const d = this.theatreData;
        if (d.currentIndex >= d.results.length) {
            // All units revealed! Close theatre and show final summary
            this.closeSummonTheatre();
            this.showSummonResultsModal(d.results);
            return;
        }

        const r = d.results[d.currentIndex];
        const conf = window.UNIT_CONFIG[r.unitId] || {};
        const cardContainer = document.getElementById("theatre-unit-card");
        const counterEl = document.getElementById("theatre-card-counter");

        if (counterEl) {
            counterEl.textContent = `Unit ${d.currentIndex + 1} of ${d.results.length}`;
        }

        if (cardContainer) {
            // Apply rarity class styling & high-definition vector character artwork with rune pedestal (No trading card box!)
            const rarityLower = r.rarity.toLowerCase();
            cardContainer.className = `theatre-unit-showcase ${rarityLower}`;
            cardContainer.innerHTML = `
                <div class="theatre-unit-rarity-badge ${rarityLower}">${r.rarity}</div>
                <div class="theatre-character-display">
                    <img src="${window.PixelSprites.getUnitModel(r.unitId, 220, 260)}" alt="${r.name}" class="theatre-unit-model">
                    <div class="theatre-rune-pedestal ${rarityLower}"></div>
                </div>
                <div class="theatre-unit-name-hero">${r.name}</div>
                ${r.isShiny ? '<div class="theatre-shiny-sparkle">✨ SHINY UNIT (+10% ALL STATS) ✨</div>' : ''}
                <div class="theatre-tags-row">
                    <span class="tag-elem">${r.element}</span>
                    <span class="tag-dmg">${r.damageType}</span>
                    <span class="tag-pl">${r.placement}</span>
                    ${r.hasSoaring ? '<span class="tag-soar">🦅 Soaring</span>' : ''}
                </div>
                ${r.trait ? `<div class="theatre-trait-badge">Trait: ${r.trait}</div>` : ''}
                <div class="theatre-unit-flavor">${conf.description || ''}</div>
            `;
        }

        if (window.AudioService) {
            window.AudioService.playSummonSound(r.rarity);
        }

        d.currentIndex++;
    },

    onSummonTheatreClick(e) {
        if (e.target.closest(".theatre-skip-btn")) return;
        const d = this.theatreData;
        const starStage = document.getElementById("theatre-star-stage");

        // If currently on star stage, clicking cracks/shatters the star
        if (starStage && starStage.style.display !== "none") {
            this.handleStarClick(e);
            return;
        }

        // If on card stage, reveal next card
        this.revealNextCard();
    },

    skipSummonAnimation(e) {
        if (e) e.stopPropagation();
        clearTimeout(this.theatreData.timerId);
        this.closeSummonTheatre();
        this.showSummonResultsModal(this.theatreData.results);
    },

    closeSummonTheatre() {
        this.theatreData.isAnimating = false;
        const modal = document.getElementById("summon-theatre-modal");
        if (modal) modal.style.display = "none";
    },

    showSummonResultsModal(results) {
        const modal = document.getElementById("summon-result-modal");
        const grid = document.getElementById("summon-result-grid");
        if (!modal || !grid) return;

        // Dynamic container sizing: 1 unit = compact modal, multi units = wide grid
        if (results.length === 1) {
            modal.classList.add("single-result");
            modal.classList.remove("multi-result");
        } else {
            modal.classList.add("multi-result");
            modal.classList.remove("single-result");
        }

        let html = "";
        results.forEach(r => {
            html += `
                <div class="summon-card ${r.rarity.toLowerCase()}">
                    <div class="summon-rarity ${r.rarity === 'Mythic' ? 'mythic-rainbow-text' : ''}">${r.rarity}</div>
                    <img src="${window.PixelSprites.getUnitModel(r.unitId, 80, 100)}" alt="${r.name}" style="margin:6px auto;display:block;width:80px;height:100px;object-fit:contain;">
                    <div class="summon-unit-name ${r.rarity === 'Mythic' ? 'mythic-rainbow-text' : ''}">${r.name}</div>
                    <div style="display:flex;gap:4px;justify-content:center;margin:4px 0;">
                        ${this.getDamageTypeBadge(r.damageType)}
                        ${this.getElementBadge(r.element)}
                        ${r.config && r.config.isFarm ? this.getFarmBadge() : ''}
                    </div>
                    <div class="summon-placement">${r.placement} ${r.hasSoaring ? '🪽' : ''}</div>
                    ${r.trait ? `<div class="summon-trait">Trait: ${r.trait}</div>` : ''}
                    ${r.isAutoSold ? `<div style="font-size:10px;font-weight:900;color:#facc15;background:rgba(234,179,8,0.25);border:1px solid #eab308;border-radius:4px;padding:2px 4px;margin-top:4px;">AUTO-SOLD (+🪙${r.goldEarned})</div>` : ''}
                </div>
            `;
        });

        grid.innerHTML = html;
        modal.style.display = "flex";
        modal.classList.add("open");
    },

    // ----------------------------------------------------
    // INVENTORY VIEW & EQUIPPED TEAM LOADOUT
    // ----------------------------------------------------
    renderTeamLoadout() {
        const container = document.getElementById("team-loadout-container");
        if (!container) return;

        const state = window.SaveService.state;
        const equippedIds = Array.isArray(state.equippedUnits) ? state.equippedUnits : [];

        let slotsHtml = "";
        for (let i = 0; i < 6; i++) {
            const instanceId = equippedIds[i];
            const unit = instanceId ? state.inventoryUnits.find(u => u.id === instanceId) : null;
            const conf = unit ? window.UNIT_CONFIG[unit.unitId] : null;

            if (unit && conf) {
                slotsHtml += `
                    <div class="team-slot-card occupied">
                        <div class="team-slot-num">SLOT ${i + 1}</div>
                        <img src="${window.PixelSprites.getUnitModel(unit.unitId, 48, 56)}" alt="${conf.name}" style="width:48px;height:56px;object-fit:contain;">
                        <div class="team-slot-name">${conf.name}</div>
                        <span class="rarity-badge ${conf.rarity.toLowerCase()}" style="font-size:9px;padding:1px 6px;">${conf.rarity}</span>
                        <button class="team-slot-unequip-btn" onclick="UIController.handleUnequipUnit('${unit.id}')">✕ Unequip</button>
                    </div>
                `;
            } else {
                slotsHtml += `
                    <div class="team-slot-card">
                        <div class="team-slot-num">SLOT ${i + 1}</div>
                        <div class="team-slot-empty-label">+ Empty Slot</div>
                    </div>
                `;
            }
        }

        container.innerHTML = `
            <div class="team-loadout-panel">
                <div class="team-loadout-header">
                    <div class="team-loadout-title">
                        🛡️ BATTLE TEAM LOADOUT (${equippedIds.length}/6 EQUIPPED)
                    </div>
                    <span style="font-size:12px;color:#94a3b8;">Max 6 units • Duplicates forbidden • Only equipped units fight in battle</span>
                </div>
                <div class="team-slots-row">
                    ${slotsHtml}
                </div>
            </div>
        `;
    },

    handleEquipUnit(instanceId) {
        const res = window.SaveService.equipUnit(instanceId);
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }
        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.renderInventory();
    },

    handleUnequipUnit(instanceId) {
        const res = window.SaveService.unequipUnit(instanceId);
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }
        if (window.AudioService) window.AudioService.playSellSound();
        this.renderInventory();
    },

    renderInventory() {
        this.renderTeamLoadout();

        const container = document.getElementById("inventory-units-container");
        if (!container) return;

        const allUnits = window.SaveService.state.inventoryUnits;
        const searchInput = document.getElementById("unit-search-input");
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const rarityFilter = document.getElementById("unit-rarity-filter") ? document.getElementById("unit-rarity-filter").value : "all";
        const sortFilter = document.getElementById("unit-sort-filter") ? document.getElementById("unit-sort-filter").value : "rarity";

        let units = [...allUnits];

        // 1. Search Query Filter
        if (query) {
            units = units.filter(u => {
                const conf = window.UNIT_CONFIG[u.unitId];
                if (!conf) return false;
                const nameMatch = conf.name.toLowerCase().includes(query);
                const rarityMatch = conf.rarity.toLowerCase().includes(query);
                const elemMatch = conf.element.toLowerCase().includes(query);
                const dmgMatch = conf.damageType.toLowerCase().includes(query);
                const placeMatch = conf.placement.toLowerCase().includes(query);
                const traitMatch = (u.trait || "").toLowerCase().includes(query);
                const soaringMatch = conf.hasSoaring && "soaring".includes(query);
                return nameMatch || rarityMatch || elemMatch || dmgMatch || placeMatch || traitMatch || soaringMatch;
            });
        }

        // 2. Rarity Dropdown Filter
        if (rarityFilter !== "all") {
            units = units.filter(u => u.rarity === rarityFilter);
        }

        // 3. Sorting
        const rarityWeight = { "Secret": 5, "Mythic": 4, "Legendary": 3, "Epic": 2, "Rare": 1 };
        if (sortFilter === "rarity") {
            units.sort((a, b) => (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0) || b.level - a.level);
        } else if (sortFilter === "level") {
            units.sort((a, b) => b.level - a.level || b.exp - a.exp);
        } else if (sortFilter === "name") {
            units.sort((a, b) => {
                const nameA = window.UNIT_CONFIG[a.unitId] ? window.UNIT_CONFIG[a.unitId].name : "";
                const nameB = window.UNIT_CONFIG[b.unitId] ? window.UNIT_CONFIG[b.unitId].name : "";
                return nameA.localeCompare(nameB);
            });
        } else if (sortFilter === "newest") {
            units.reverse();
        }

        // Update count display
        const countDisplay = document.getElementById("unit-count-display");
        if (countDisplay) {
            countDisplay.textContent = `Showing ${units.length} of ${allUnits.length} units in collection`;
        }

        let html = "";

        if (allUnits.length === 0) {
            html = `<p style="color:#94a3b8;grid-column:1/-1;text-align:center;">No units in inventory. Summon from banners!</p>`;
        } else if (units.length === 0) {
            html = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:#94a3b8;">
                <p style="font-size:16px;">🔍 No units found matching "${query}"</p>
                <button onclick="document.getElementById('unit-search-input').value = ''; document.getElementById('unit-rarity-filter').value = 'all'; UIController.renderInventory();" class="stage-btn normal-btn" style="width:160px;margin-top:10px;">Clear Filters</button>
            </div>`;
        } else {
            units.forEach(u => {
                const conf = window.UNIT_CONFIG[u.unitId];
                if (!conf) return;

                const isEquipped = window.SaveService.isUnitEquipped(u.id);
                const goldValues = window.UNIT_SELL_VALUES || { "Rare": 100, "Epic": 300, "Legendary": 1000, "Mythic": 3500, "Secret": 10000 };
                const goldValue = goldValues[u.rarity] || 100;

                html += `
                    <div class="inv-unit-card ${isEquipped ? 'is-equipped' : ''}" style="position:relative;">
                        <div class="inv-header">
                            <span class="rarity-badge ${u.rarity.toLowerCase()}">${u.rarity}</span>
                            <button class="lock-btn ${u.locked ? 'locked' : ''}" onclick="UIController.toggleUnitLock('${u.id}')" title="Toggle Lock">
                                ${u.locked ? '🔒' : '🔓'}
                            </button>
                        </div>
                        <img src="${window.PixelSprites.getUnitModel(u.unitId, 80, 100)}" alt="${conf.name}" style="margin:6px auto;display:block;width:70px;height:90px;border:1px solid #1e293b;border-radius:6px;background:#0f172a;object-fit:contain;">
                        <div class="inv-name" style="text-align:center;">${conf.name}</div>
                        <div class="inv-sub" style="text-align:center;font-weight:700;color:#38bdf8;">Lv. ${u.level}/100</div>
                        
                        <!-- Unit EXP Progress Bar -->
                        <div style="background:#0f172a;border-radius:4px;height:7px;overflow:hidden;border:1px solid #334155;margin:3px 12px;">
                            <div style="background:linear-gradient(90deg, #38bdf8, #818cf8);height:100%;width:${Math.min(100, Math.max(0, Math.floor((u.exp / (window.SaveService.getRequiredExpForLevel ? window.SaveService.getRequiredExpForLevel(u.level) : (u.level * 200))) * 100)))}%;"></div>
                        </div>
                        <div style="font-size:9.5px;color:#94a3b8;text-align:center;margin-bottom:3px;">
                            ${u.exp} / ${window.SaveService.getRequiredExpForLevel ? window.SaveService.getRequiredExpForLevel(u.level) : (u.level * 200)} EXP
                        </div>

                        ${(() => {
                            const eqRelicKey = window.SaveService.getUnitEquippedRelic ? window.SaveService.getUnitEquippedRelic(u.id) : null;
                            if (!eqRelicKey) return '';
                            const relicNames = {
                                "relic_mangekyou": "Mangekyou Sharingan",
                                "relic_blazing_core": "Blazing Core",
                                "relic_shadow_cloak": "Shadow Cloak",
                                "relic_fortune_ring": "Fortune Ring",
                                "relic_divine_eye": "Divine Eye"
                            };
                            const rName = relicNames[eqRelicKey] || eqRelicKey;
                            return `
                                <div style="display:flex;align-items:center;justify-content:center;gap:4px;background:#1e1b4b;border:1px solid #6366f1;border-radius:5px;padding:2px 6px;margin:3px 8px;font-size:10px;color:#c7d2fe;">
                                    ${window.PixelSprites.getRelicIcon ? window.PixelSprites.getRelicIcon(eqRelicKey, 14) : '🛡️'}
                                    <span style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${rName}</span>
                                    <button onclick="UIController.handleDetachRelic('${u.id}')" style="background:#dc2626;color:#fff;border:none;border-radius:3px;padding:1px 4px;font-size:9px;cursor:pointer;margin-left:auto;">Detach</button>
                                </div>
                            `;
                        })()}

                        <div class="inv-tags" style="justify-content:center;gap:4px;margin:4px 0;">
                            ${this.getDamageTypeBadge(conf.damageType)}
                            ${this.getElementBadge(conf.element)}
                            ${conf.isFarm ? this.getFarmBadge() : ''}
                            <span class="tag-pl">${conf.placement}</span>
                            ${conf.hasSoaring ? '<span class="tag-soar">🪽Soaring</span>' : ''}
                        </div>
                        <div style="font-size:11px;color:#facc15;text-align:center;font-weight:700;">
                            Ability: ${conf.abilityName || 'Basic Attack'} (${conf.attackShape || conf.attackType})
                        </div>
                        <div class="inv-trait" style="text-align:center;">Trait: <b>${u.trait || 'None'}</b></div>
                        
                        <div style="display:flex;gap:6px;margin-top:8px;">
                            ${isEquipped ? `
                                <button class="btn-equip-toggle unequip" onclick="UIController.handleUnequipUnit('${u.id}')">Unequip</button>
                            ` : `
                                <button class="btn-equip-toggle equip" onclick="UIController.handleEquipUnit('${u.id}')">Equip to Team</button>
                            `}
                        </div>

                        <div class="inv-actions" style="margin-top:6px;">
                            <button class="inv-action-btn feed" onclick="UIController.openFeedModal('${u.id}')">🍙 Level Up</button>
                            <button class="inv-action-btn sell" onclick="UIController.confirmSellUnit('${u.id}')" ${u.locked || isEquipped ? 'disabled' : ''} title="${isEquipped ? 'Unequip first to sell' : ''}">
                                Sell (+🪙${goldValue})
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    },

    toggleUnitLock(instanceId) {
        window.SaveService.toggleLockUnit(instanceId);
        this.renderInventory();
    },

    confirmSellUnit(instanceId) {
        const u = window.SaveService.state.inventoryUnits.find(unit => unit.id === instanceId);
        if (!u) return;
        if (u.locked) {
            this.showToast("This unit is locked! Unlock it first if you wish to sell.", "warning");
            return;
        }

        const goldValues = window.UNIT_SELL_VALUES || { "Rare": 100, "Epic": 300, "Legendary": 1000, "Mythic": 3500, "Secret": 10000 };
        const goldValue = goldValues[u.rarity] || 100;
        const conf = window.UNIT_CONFIG[u.unitId];

        this.showConfirmModal({
            title: "Sell Unit?",
            message: `Sell ${conf.name} (${u.rarity}) for 🪙${goldValue.toLocaleString()} Gold?\n(Gold is only obtained from selling units!)`,
            icon: "🪙",
            confirmText: `Sell (+🪙${goldValue.toLocaleString()})`,
            cancelText: "Cancel",
            confirmColor: "gold",
            onConfirm: () => {
                const res = window.SaveService.sellUnit(instanceId);
                if (res.success) {
                    if (window.AudioService) window.AudioService.playSellSound();
                    this.updateTopBar();
                    this.renderInventory();
                    this.showToast(`🪙 Sold ${conf.name} for +${goldValue.toLocaleString()} Gold!`, "success");
                } else {
                    this.showToast(res.message, "warning");
                }
            }
        });
    },

    openFeedModal(instanceId) {
        const u = window.SaveService.state.inventoryUnits.find(unit => unit.id === instanceId);
        if (!u) return;

        const foodList = window.SHOP_CONFIG.food;
        let foodHtml = "";

        foodList.forEach(f => {
            const count = window.SaveService.getItemCount("food", f.id);
            foodHtml += `
                <div class="feed-item-row">
                    <span>${f.icon} ${f.name} (+${f.exp} EXP)</span>
                    <span>Owned: <b>${count}</b></span>
                    <button class="feed-btn" onclick="UIController.feedUnit('${u.id}', '${f.id}')" ${count <= 0 ? 'disabled' : ''}>
                        Feed 1
                    </button>
                </div>
            `;
        });

        const modal = document.getElementById("feed-unit-modal");
        const body = document.getElementById("feed-unit-body");
        if (modal && body) {
            body.innerHTML = `
                <h3>Level Up: ${window.UNIT_CONFIG[u.unitId].name}</h3>
                <p>Current Level: <b>${u.level}</b> | Current EXP: <b>${u.exp}</b></p>
                <div class="food-selector-list">${foodHtml}</div>
            `;
            modal.style.display = "flex";
            modal.classList.add("open");
        }
    },

        feedUnit(instanceId, foodId) {
        const u = window.SaveService.state.inventoryUnits.find(unit => unit.id === instanceId);
        const food = window.SHOP_CONFIG.food.find(f => f.id === foodId);
        if (!u || !food) return;

        if (!window.SaveService.consumeItem("food", foodId, 1)) {
            this.showToast("No food available!", "warning");
            return;
        }

        // Apply EXP (Adept trait boosts EXP gained by +50%)
        let expBonus = 1.0;
        if (u.trait === "Adept") expBonus = 1.50;

        const expGained = Math.round(food.exp * expBonus);
        u.exp = (u.exp || 0) + expGained;

        const initialLevel = u.level || 1;
        let reqExp = window.SaveService.getRequiredExpForLevel ? window.SaveService.getRequiredExpForLevel(u.level) : (u.level * 100);

        // Loop level ups so low level units jump straight to high levels when fed high-tier food!
        while (u.exp >= reqExp && u.level < 100) {
            u.exp -= reqExp;
            u.level += 1;
            reqExp = window.SaveService.getRequiredExpForLevel ? window.SaveService.getRequiredExpForLevel(u.level) : (u.level * 100);
        }

        window.SaveService.save();
        if (u.level > initialLevel) {
            this.showToast(`🎉 Level Up! ${window.UNIT_CONFIG[u.unitId].name} reached Lv. ${u.level}!`, "success");
        } else {
            this.showToast(`Fed 1x ${food.name}! (+${expGained} EXP)`, "info");
        }

        this.openFeedModal(instanceId);
        this.renderInventory();
    },

    // ----------------------------------------------------
    // TRAIT TEMPLE & REROLLS
    // ----------------------------------------------------
    selectedTraitUnitId: null,

    handleTraitUnitSearch(val) {
        this.traitUnitSearchQuery = val;
        this.renderTraitTemple();
        const input = document.getElementById("trait-unit-search-input");
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    },

    toggleTraitFilter(key, checked) {
        if (!window.SaveService.state.traitFilters) {
            window.SaveService.state.traitFilters = { protectMythic: true, protectLegendary: false };
        }
        window.SaveService.state.traitFilters[key] = checked;
        window.SaveService.save();
    },

    renderTraitTemple() {
        const container = document.getElementById("trait-altar-container");
        if (!container) return;

        const state = window.SaveService.state;
        const units = state.inventoryUnits || [];
        const filters = state.traitFilters || { protectMythic: true, protectLegendary: false };
        const protectMythic = filters.protectMythic !== false;
        const protectLegendary = !!filters.protectLegendary;
        
        if (!this.selectedTraitUnitId && units.length > 0) {
            this.selectedTraitUnitId = units[0].id;
        }

        const selectedUnit = units.find(u => u.id === this.selectedTraitUnitId);
        const conf = selectedUnit ? window.UNIT_CONFIG[selectedUnit.unitId] : null;
        const traitInfo = (selectedUnit && selectedUnit.trait) ? window.TRAIT_CONFIG[selectedUnit.trait] : null;
        const isSelectedMythicTrait = traitInfo && traitInfo.rarity === "Mythic";

        // Unit Search Filter
        const query = (this.traitUnitSearchQuery || "").trim().toLowerCase();
        let filteredUnits = [...units];
        if (query) {
            filteredUnits = filteredUnits.filter(u => {
                const uConf = window.UNIT_CONFIG[u.unitId];
                if (!uConf) return false;
                const nameMatch = uConf.name.toLowerCase().includes(query);
                const rarityMatch = uConf.rarity.toLowerCase().includes(query);
                const traitMatch = (u.trait || "").toLowerCase().includes(query);
                return nameMatch || rarityMatch || traitMatch;
            });
        }

        let html = `
            <div class="trait-altar-arena" style="background:radial-gradient(circle at center, #2e1065 0%, #0f172a 70%);border:2px solid #7c3aed;box-shadow:0 0 35px rgba(124,58,237,0.35);border-radius:16px;padding:24px;margin-bottom:24px;">
                <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:center;">
                    <!-- Pedestal with Visual Model -->
                    <div style="position:relative;width:200px;height:240px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
                        <!-- Rotating Arcane Circle SVG -->
                        <svg width="180" height="70" viewBox="0 0 180 70" style="position:absolute;bottom:0;left:10px;z-index:1;">
                            <ellipse cx="90" cy="35" rx="80" ry="25" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="6,4">
                                <animateTransform attributeName="transform" type="rotate" from="0 90 35" to="360 90 35" dur="10s" repeatCount="indefinite"/>
                            </ellipse>
                            <ellipse cx="90" cy="35" rx="60" ry="18" fill="rgba(168,85,247,0.2)" stroke="#c084fc" stroke-width="1.5"/>
                            <ellipse cx="90" cy="35" rx="40" ry="12" fill="rgba(216,180,254,0.4)"/>
                        </svg>
                        ${selectedUnit && conf ? `
                            <img src="${window.PixelSprites.getUnitModel(selectedUnit.unitId, 140, 180)}" alt="${conf.name}" style="position:relative;z-index:2;width:130px;height:170px;object-fit:contain;filter:drop-shadow(0 0 15px rgba(168,85,247,0.7));">
                        ` : `
                            <div style="position:relative;z-index:2;font-size:48px;margin-bottom:40px;">🔮</div>
                        `}
                    </div>

                    <!-- Altar Controls -->
                    <div style="flex:1;min-width:280px;max-width:440px;">
                        ${selectedUnit && conf ? `
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                                <span class="rarity-badge ${conf.rarity.toLowerCase()}">${conf.rarity}</span>
                                <h3 style="margin:0;font-size:20px;color:#f8fafc;font-weight:900;">${conf.name}</h3>
                            </div>
                            <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;">Level ${selectedUnit.level || 1} • ${conf.placement} • ${conf.damageType}</div>

                            <!-- Current Trait Box with Symbol & Animated Rainbow Text if Mythic -->
                            <div style="background:rgba(15,23,42,0.85);border:1.5px solid ${isSelectedMythicTrait ? '#facc15' : '#475569'};border-radius:10px;padding:12px;margin-bottom:12px;box-shadow:${isSelectedMythicTrait ? '0 0 15px rgba(250,204,21,0.3)' : 'none'};">
                                <div style="display:flex;justify-content:space-between;align-items:center;">
                                    <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Current Trait</div>
                                    ${traitInfo ? `
                                        <span class="${isSelectedMythicTrait ? 'mythic-rainbow-name' : ''}" style="font-size:11px;font-weight:900;color:${isSelectedMythicTrait ? '' : (traitInfo.symbolColor || '#38bdf8')};">
                                            [${traitInfo.rarity}]
                                        </span>
                                    ` : ''}
                                </div>
                                <div style="font-size:19px;font-weight:900;margin:6px 0;display:flex;align-items:center;gap:8px;">
                                    ${selectedUnit.trait ? window.PixelSprites.getTraitIcon(selectedUnit.trait, 26) : ''}
                                    <span class="${isSelectedMythicTrait ? 'mythic-rainbow-name' : ''}" style="color:${selectedUnit.trait ? (isSelectedMythicTrait ? '' : (traitInfo && traitInfo.symbolColor ? traitInfo.symbolColor : '#facc15')) : '#94a3b8'};">
                                        ${selectedUnit.trait || 'None (No Trait)'}
                                    </span>
                                </div>
                                <div style="font-size:12px;color:#cbd5e1;line-height:1.4;">
                                    ${traitInfo ? traitInfo.description : 'Place this unit on the altar and roll to awaken a powerful combat perk!'}
                                </div>
                            </div>

                            <!-- Advanced Trait Protection Filters Panel -->
                            <div style="background:#0f172a;border:1px solid #475569;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:12px;">
                                <div style="font-weight:800;color:#facc15;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
                                    <span>🛡️ Advanced Trait Protection (Keep / Warn Before Reroll)</span>
                                    <span style="font-size:10px;color:#94a3b8;">Uncheck traits you want to skip</span>
                                </div>
                                
                                <div style="margin-bottom:6px;">
                                    <div style="font-size:10.5px;font-weight:800;color:#c084fc;margin-bottom:3px;text-transform:uppercase;">Mythic Traits (Select to Protect):</div>
                                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                        ${["Unique", "Celestial", "Divine", "Eternal"].map(t => {
                                            const isChecked = filters.protectedTraits ? filters.protectedTraits[t] !== false : true;
                                            return `
                                                <label style="display:flex;align-items:center;gap:4px;background:#1e1b4b;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:11px;">
                                                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="UIController.toggleSpecificTraitProtection('${t}', this.checked)">
                                                    <span class="mythic-rainbow-name" style="font-weight:800;">${t}</span>
                                                </label>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>

                                <div>
                                    <div style="font-size:10.5px;font-weight:800;color:#eab308;margin-bottom:3px;text-transform:uppercase;">Legendary Traits (Select to Protect):</div>
                                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                        ${["Reaper", "Fortune", "Culling", "Sniper", "Godspeed"].map(t => {
                                            const isChecked = filters.protectedTraits ? !!filters.protectedTraits[t] : false;
                                            return `
                                                <label style="display:flex;align-items:center;gap:4px;background:#1e293b;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:11px;">
                                                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="UIController.toggleSpecificTraitProtection('${t}', this.checked)">
                                                    <span style="color:#eab308;font-weight:700;">${t}</span>
                                                </label>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>

                            <div style="display:flex;align-items:center;justify-content:space-between;background:#1e1b4b;border:1px solid #6366f1;border-radius:8px;padding:8px 12px;margin-bottom:12px;">
                                <span style="font-size:12px;color:#c7d2fe;font-weight:700;">Owned Trait Rerolls:</span>
                                <span style="font-size:15px;color:#facc15;font-weight:900;">🔮 ${(state.traitRerolls || 0).toLocaleString()} RR</span>
                            </div>

                            <button onclick="UIController.rerollTrait('${selectedUnit.id}')" style="width:100%;background:linear-gradient(180deg,#8b5cf6,#6d28d9);color:#fff;border:1px solid #c084fc;padding:12px;border-radius:8px;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 0 16px rgba(139,92,246,0.6);transition:transform 0.1s;">
                                🔮 REROLL TRAIT (1 Trait RR)
                            </button>
                        ` : `
                            <div style="color:#94a3b8;text-align:center;">Select a unit below to place on the altar.</div>
                        `}
                    </div>
                </div>

                <!-- Unit Search & Horizontal Selector -->
                <div style="margin-top:20px;border-top:1px solid rgba(124,58,237,0.3);padding-top:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                        <div style="font-size:12px;color:#c084fc;font-weight:800;text-transform:uppercase;">
                            Select Unit to Place on Altar:
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <input type="text" id="trait-unit-search-input" placeholder="🔍 Search units..." value="${this.traitUnitSearchQuery || ''}" oninput="UIController.handleTraitUnitSearch(this.value)" style="background:#0f172a;color:#fff;border:1px solid #7c3aed;border-radius:6px;padding:4px 10px;font-size:12px;width:180px;">
                            <span style="font-size:11px;color:#94a3b8;">(${filteredUnits.length}/${units.length})</span>
                        </div>
                    </div>

                    ${filteredUnits.length === 0 ? `
                        <div style="text-align:center;padding:16px;color:#94a3b8;font-size:13px;">No units match "${this.traitUnitSearchQuery}"</div>
                    ` : `
                        <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;">
                            ${filteredUnits.map(u => {
                                const uConf = window.UNIT_CONFIG[u.unitId];
                                if (!uConf) return '';
                                const isSel = u.id === this.selectedTraitUnitId;
                                const uTrait = u.trait ? window.TRAIT_CONFIG[u.trait] : null;
                                const isMythicT = uTrait && uTrait.rarity === 'Mythic';
                                return `
                                    <div onclick="UIController.selectTraitUnit('${u.id}')" style="flex:0 0 92px;background:${isSel ? '#3b0764' : '#1e293b'};border:2px solid ${isSel ? '#c084fc' : '#334155'};border-radius:8px;padding:6px;cursor:pointer;text-align:center;transition:all 0.15s;box-shadow:${isSel ? '0 0 12px rgba(192,132,252,0.6)' : 'none'};">
                                        <img src="${window.PixelSprites.getUnitModel(u.unitId, 50, 60)}" style="width:48px;height:58px;object-fit:contain;margin:0 auto;display:block;">
                                        <div style="font-size:11px;font-weight:800;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${uConf.name}</div>
                                        <div class="${isMythicT ? 'mythic-rainbow-name' : ''}" style="font-size:9.5px;color:${u.trait ? (isMythicT ? '' : (uTrait ? uTrait.symbolColor : '#facc15')) : '#64748b'};font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                            ${u.trait || 'No Trait'}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        const prevScrollY = window.scrollY || document.documentElement.scrollTop;
        container.innerHTML = html;
        window.scrollTo(0, prevScrollY);

        // Render Trait Chances Table (Sorted by chance descending: easiest at top, hardest at bottom)
        const probTable = document.getElementById("trait-probability-table");
        if (probTable && window.TRAIT_CONFIG && !probTable.hasChildNodes()) {
            const traitEntries = Object.entries(window.TRAIT_CONFIG);
            traitEntries.sort((a, b) => b[1].chance - a[1].chance);

            let tableHtml = `
                <table class="trait-table" style="max-width:850px;margin:0 auto;">
                    <thead>
                        <tr>
                            <th style="width:110px;">Rarity</th>
                            <th style="width:190px;">Trait Name</th>
                            <th style="width:110px;">Probability</th>
                            <th>Effect</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            for (const [tName, tConf] of traitEntries) {
                const isMythic = tConf.rarity === "Mythic";
                const iconSvg = window.PixelSprites ? window.PixelSprites.getTraitIcon(tName, 22) : '';
                tableHtml += `
                    <tr class="tier-${tConf.rarity.toLowerCase()}">
                        <td>
                            <b class="${isMythic ? 'mythic-rainbow-name' : ''}" style="color:${isMythic ? '' : tConf.symbolColor};font-size:12px;">
                                ${tConf.rarity}
                            </b>
                        </td>
                        <td style="font-weight:800;display:flex;align-items:center;gap:6px;">
                            ${iconSvg}
                            <span class="${isMythic ? 'mythic-rainbow-name' : ''}" style="color:${isMythic ? '' : tConf.symbolColor};">
                                ${tName}
                            </span>
                        </td>
                        <td style="color:#facc15;font-weight:900;">${tConf.chance}%</td>
                        <td>${tConf.description}</td>
                    </tr>
                `;
            }
            tableHtml += `</tbody></table>`;
            probTable.innerHTML = tableHtml;
        }
        window.scrollTo(0, prevScrollY);
    },

    selectTraitUnit(instanceId) {
        this.selectedTraitUnitId = instanceId;
        this.renderTraitTemple();
    },

    rerollTrait(instanceId) {
        const state = window.SaveService.state;
        const unit = state.inventoryUnits.find(u => u.id === instanceId);
        if (!unit) return;

        const currentTrait = unit.trait;
        const tConf = currentTrait && window.TRAIT_CONFIG ? window.TRAIT_CONFIG[currentTrait] : null;
        const filters = state.traitFilters || { protectMythic: true, protectLegendary: false };
        const protectMythic = filters.protectMythic !== false;
        const protectLegendary = !!filters.protectLegendary;

        let isProtected = false;
        if (tConf && currentTrait) {
            const protectedTraits = filters.protectedTraits || { "Unique": true, "Celestial": true, "Divine": true, "Eternal": true };
            if (protectedTraits[currentTrait] === true) {
                isProtected = true;
            } else if (protectedTraits[currentTrait] === undefined) {
                if (tConf.rarity === "Mythic" && protectMythic) isProtected = true;
                if (tConf.rarity === "Legendary" && protectLegendary) isProtected = true;
            }
        }

        if (isProtected) {
            this.openTraitWarningModal(instanceId, currentTrait, tConf.rarity);
            return;
        }

        this.executeReroll(instanceId);
    },

    openTraitWarningModal(instanceId, traitName, rarity) {
        const modal = document.getElementById("trait-warning-modal");
        const desc = document.getElementById("trait-warning-desc");
        const confirmBtn = document.getElementById("trait-confirm-reroll-btn");
        if (!modal || !desc || !confirmBtn) return;

        const traitSvg = window.PixelSprites ? window.PixelSprites.getTraitIcon(traitName, 26) : '';
        desc.innerHTML = `
            This unit currently has the <b>${rarity}</b> trait:
            <div style="font-size:20px;font-weight:900;color:#facc15;margin:8px 0;display:flex;align-items:center;justify-content:center;gap:8px;">
                ${traitSvg} <span>${traitName}</span>
            </div>
            Rerolling will permanently overwrite this protected trait!<br>
            Please wait 5 seconds to confirm.
        `;

        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.5";
        confirmBtn.style.cursor = "not-allowed";

        if (this._traitWarnInterval) clearInterval(this._traitWarnInterval);

        let sec = 5;
        confirmBtn.textContent = `Confirm Reroll (${sec}s)`;

        this._traitWarnInterval = setInterval(() => {
            sec--;
            if (sec > 0) {
                confirmBtn.textContent = `Confirm Reroll (${sec}s)`;
            } else {
                clearInterval(this._traitWarnInterval);
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = "1";
                confirmBtn.style.cursor = "pointer";
                confirmBtn.textContent = "⚠️ Yes, Overwrite Trait";
                confirmBtn.onclick = () => {
                    this.closeAllModals();
                    this.executeReroll(instanceId);
                };
            }
        }, 1000);

        modal.classList.add("open");
        modal.style.display = "flex";
    },

    executeReroll(instanceId) {
        const res = window.TraitEngine.rerollUnitTrait(instanceId);
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }

        if (window.AudioService) window.AudioService.playUpgradeSound();
        const prevScrollY = window.scrollY || document.documentElement.scrollTop;
        this.updateTopBar();
        this.renderTraitTemple();
        window.scrollTo(0, prevScrollY);

        if (res.newTrait === "Unique") {
            this.openUniqueAwakeningModal();
        } else {
            this.showToast(`✨ You obtained Trait: ${res.newTrait}! (${res.traitDetails.description})`, "success");
        }
    },

    openUniqueAwakeningModal() {
        const modal = document.getElementById("unique-awakening-modal");
        if (!modal) return;
        if (window.AudioService && window.AudioService.playVictorySound) {
            window.AudioService.playVictorySound();
        }
        modal.classList.add("open");
        modal.style.display = "flex";
    },

    resetSettingsToDefault() {
        if (!window.SaveService) return;
        window.SaveService.resetSettingsToDefault();

        const rareCb = document.getElementById("setting-auto-sell-rare");
        const epicCb = document.getElementById("setting-auto-sell-epic");
        const legCb = document.getElementById("setting-auto-sell-leg");
        const skipCb = document.getElementById("setting-auto-skip");
        const speedSel = document.getElementById("setting-default-speed");
        const sfxCb = document.getElementById("setting-sfx-mute");

        if (rareCb) rareCb.checked = false;
        if (epicCb) epicCb.checked = false;
        if (legCb) legCb.checked = false;
        if (skipCb) skipCb.checked = false;
        if (speedSel) speedSel.value = "1";
        if (sfxCb) sfxCb.checked = false;

        this.renderTraitTemple();
        this.updateActiveBuffsHUD();
        this.showToast("All settings and trait filters have been reset to default values!", "info");
    },

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
            { id: "normal_star_fruit", name: "Normal Star Fruit", cost: 50, type: "material", targetKey: "normal_star_fruit", desc: "Evolution material", icon: "⭐" },
            { id: "pink_star_fruit", name: "Pink Star Fruit", cost: 200, type: "material", targetKey: "pink_star_fruit", desc: "Evolution material", icon: "🌸" },
            { id: "red_star_fruit", name: "Red Star Fruit", cost: 200, type: "material", targetKey: "red_star_fruit", desc: "Evolution material", icon: "🔥" },
            { id: "green_star_fruit", name: "Green Star Fruit", cost: 200, type: "material", targetKey: "green_star_fruit", desc: "Evolution material", icon: "🍃" },
            { id: "blue_star_fruit", name: "Blue Star Fruit", cost: 200, type: "material", targetKey: "blue_star_fruit", desc: "Evolution material", icon: "💧" },
            { id: "yellow_star_fruit", name: "Yellow Star Fruit", cost: 200, type: "material", targetKey: "yellow_star_fruit", desc: "Evolution material", icon: "⚡" },
            { id: "rainbow_star_fruit", name: "Rainbow Star Fruit", cost: 400, type: "material", targetKey: "rainbow_star_fruit", desc: "Supreme evolution material", icon: "🌈" }
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
            const modelHtml = item.model ? item.model : (item.id.includes("star_fruit") ? `<img src="${window.PixelSprites.getStarFruit(item.id, 56)}" style="width:56px;height:56px;image-rendering:pixelated;">` : `<div style="font-size:46px;">${item.icon}</div>`);
            html += `
                <div class="shop-card" style="border:1.5px solid #0284c7;background:#0f172a;box-shadow:0 0 16px rgba(2,132,199,0.25);">
                    <div style="height:70px;display:flex;align-items:center;justify-content:center;">
                        ${modelHtml}
                    </div>
                    <div class="shop-card-name" style="color:#38bdf8;font-size:18px;font-weight:900;">${item.name}</div>
                    <div class="shop-card-desc" style="min-height:36px;font-size:12px;color:#94a3b8;line-height:1.4;">${item.desc}</div>
                    <div style="font-size:11px;color:#facc15;font-weight:800;margin:4px 0;">Hourly Limit: 1x</div>
                    <div class="shop-card-cost" style="color:#facc15;font-size:18px;font-weight:900;margin:6px 0;display:flex;align-items:center;justify-content:center;gap:6px;">
                        ${window.PixelSprites.getGemIcon(18)} <span>${item.cost} Gems</span>
                    </div>
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
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }

        if (window.AudioService && window.AudioService.playPurchaseSound) {
            window.AudioService.playPurchaseSound();
        } else if (window.AudioService && window.AudioService.playUpgradeSound) {
            window.AudioService.playUpgradeSound();
        }
        this.updateTopBar();
        this.renderGemShop();
        this.updateActiveBuffsHUD();
        this.showToast(res.message, res.success ? "success" : "warning");
    },

    buyShinyHunter() {
        const res = window.SaveService.buyShinyHunter();
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }

        if (window.AudioService && window.AudioService.playVictorySound) {
            window.AudioService.playVictorySound();
        }
        this.updateTopBar();
        this.renderGoldShop();
        this.updateActiveBuffsHUD();
        this.showToast(res.message, res.success ? "success" : "warning");
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

// ----------------------------------------------------
    // GOLD SHOP VIEW
    // ----------------------------------------------------
    renderGoldShop() {
        const foodContainer = document.getElementById("shop-food-grid");
        const matsContainer = document.getElementById("shop-mats-grid");
        const passesContainer = document.getElementById("shop-passes-grid");
        const dayKey = window.TimeService.getDailyCycleKey();

        // 1. Food
        if (foodContainer) {
            let fHtml = "";
            window.SHOP_CONFIG.food.forEach(f => {
                fHtml += `
                    <div class="shop-card">
                        <img src="${window.PixelSprites.getFood(f.id, 56)}" alt="${f.name}" style="width:56px;height:56px;image-rendering:pixelated;margin-bottom:4px;">
                        <div class="shop-title">${f.name}</div>
                        <div class="shop-desc">+${f.exp} Unit EXP</div>
                        <div class="shop-price" style="display:flex;align-items:center;justify-content:center;gap:4px;">
                            ${window.PixelSprites.getGoldIcon(16)} <span>${f.goldPrice} Gold</span>
                        </div>
                        <button class="shop-buy-btn" onclick="UIController.buyShopItem('food', '${f.id}', ${f.goldPrice})">
                            Buy (1x)
                        </button>
                    </div>
                `;
            });
            foodContainer.innerHTML = fHtml;
        }

        // 2. Materials (Star Fruits - 3 per day limit)
        if (matsContainer) {
            let mHtml = "";
            const limits = window.SaveService.state.shopLimits[dayKey] || {};

            window.SHOP_CONFIG.materials.forEach(m => {
                const purchased = limits[m.id] || 0;
                const remaining = Math.max(0, m.dailyLimit - purchased);

                mHtml += `
                    <div class="shop-card">
                        <img src="${window.PixelSprites.getStarFruit(m.id, 56)}" alt="${m.name}" style="width:56px;height:56px;image-rendering:pixelated;margin-bottom:4px;">
                        <div class="shop-title">${m.name}</div>
                        <div class="shop-desc">Daily Limit: <b>${remaining}/${m.dailyLimit}</b></div>
                        <div class="shop-price" style="display:flex;align-items:center;justify-content:center;gap:4px;">
                            ${window.PixelSprites.getGoldIcon(16)} <span>${m.goldPrice} Gold</span>
                        </div>
                        <button class="shop-buy-btn ${remaining <= 0 ? 'disabled' : ''}" 
                                onclick="UIController.buyStarFruit('${m.id}', ${m.goldPrice})" 
                                ${remaining <= 0 ? 'disabled' : ''}>
                            ${remaining > 0 ? 'Buy (1x)' : 'Sold Out Today'}
                        </button>
                    </div>
                `;
            });
            matsContainer.innerHTML = mHtml;
        }

        // 3. Game Passes (VIP & Shiny Hunter)
        if (passesContainer) {
            const state = window.SaveService.state;
            const vipPass = window.SHOP_CONFIG.gamePasses[0];
            const shinyPass = (window.SHOP_CONFIG.gamePasses || [])[1] || { goldPrice: 150000 };
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
                    ` : `
                        <button class="shop-buy-btn special" onclick="UIController.buyVipPass()">
                            Purchase VIP (🪙${vipPass.goldPrice.toLocaleString()})
                        </button>
                    `}
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
                    <div class="shop-price" style="font-size:18px;">🪙 ${shinyPass.goldPrice.toLocaleString()} Gold</div>

                    ${hasShiny ? `
                        <button class="shop-buy-btn disabled" disabled style="background:#22c55e;color:#fff;">✓ ALREADY OWNED</button>
                    ` : `
                        <button class="shop-buy-btn special" onclick="UIController.buyShinyHunter()" style="background:linear-gradient(180deg,#0284c7,#0369a1);border:1px solid #38bdf8;">
                            Purchase Shiny Hunter (🪙${shinyPass.goldPrice.toLocaleString()})
                        </button>
                    `}
                </div>
            `;
            passesContainer.innerHTML = pHtml;
        }
    },

        formatPurchaseMessage(category, itemId) {
        if (category === "food") {
            const fItem = (window.SHOP_CONFIG.food || []).find(f => f.id === itemId);
            const name = fItem ? fItem.name : itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const iconSvg = window.PixelSprites ? window.PixelSprites.getFoodIcon(itemId, 24) : '🍙';
            return `<span style="display:inline-flex;align-items:center;gap:8px;">${iconSvg} <span>Purchased 1x <b>${name}</b>!</span></span>`;
        }
        if (category === "starFruits") {
            const name = window.TimeService ? window.TimeService.formatFruitName(itemId) : itemId;
            const iconSvg = window.PixelSprites ? `<img src="${window.PixelSprites.getStarFruit(itemId, 24)}" style="width:24px;height:24px;vertical-align:middle;image-rendering:pixelated;">` : '⭐';
            return `<span style="display:inline-flex;align-items:center;gap:8px;">${iconSvg} <span>Purchased 1x <b>${name}</b>!</span></span>`;
        }
        const cleanName = itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const iconSvg = window.PixelSprites && window.PixelSprites.getMaterialIcon ? window.PixelSprites.getMaterialIcon(itemId, 24) : '💎';
        return `<span style="display:inline-flex;align-items:center;gap:8px;">${iconSvg} <span>Purchased 1x <b>${cleanName}</b>!</span></span>`;
    },

    buyShopItem(category, itemId, price) {
        if (!window.SaveService.spendGold(price)) {
            this.showToast(`Insufficient Gold! Need 🪙${price} Gold. Sell units in your Inventory to earn Gold.`, 'warning');
            return;
        }
        window.SaveService.addItem(category, itemId, 1);
        this.updateTopBar();
        this.renderGoldShop();
        this.showToast(this.formatPurchaseMessage(category, itemId), "success");
    },

    buyStarFruit(fruitId, price) {
        const dayKey = window.TimeService.getDailyCycleKey();
        if (!window.SaveService.state.shopLimits[dayKey]) {
            window.SaveService.state.shopLimits[dayKey] = {};
        }
        const limits = window.SaveService.state.shopLimits[dayKey];
        const purchased = limits[fruitId] || 0;

        if (purchased >= 3) {
            this.showToast("Daily purchase limit reached (Max 3 per day). Resets at 7:00 AM Bangkok time!", "warning");
            return;
        }

        if (!window.SaveService.spendGold(price)) {
            this.showToast(`Insufficient Gold! Need 🪙${price} Gold. Sell units in your Inventory to earn Gold.`, 'warning');
            return;
        }

        limits[fruitId] = purchased + 1;
        window.SaveService.addItem("starFruits", fruitId, 1);
        window.SaveService.save();

        this.updateTopBar();
        this.renderGoldShop();
        this.showToast(this.formatPurchaseMessage("starFruits", fruitId), "success");
    },

    buyVipPass() {
        const vipPass = window.SHOP_CONFIG.gamePasses[0];
        if (!window.SaveService.spendGold(vipPass.goldPrice)) {
            this.showToast(`Need 🪙${vipPass.goldPrice.toLocaleString()} Gold to purchase VIP Pass!`, 'warning');
            return;
        }

        window.SaveService.state.vip = true;
        window.SaveService.state.vipPurchasedAt = new Date().toISOString();
        window.SaveService.save();

        this.updateTopBar();
        this.renderGoldShop();
        this.showToast("🎉 CONGRATULATIONS! You are now a lifetime VIP member! Enjoy 10% summon discount and +25% player account EXP!", "success");
    },

    // ----------------------------------------------------
    // TIMED CHALLENGES VIEW (DAILY 30 WAVES & HALF HOURLY 15 WAVES)
    // ----------------------------------------------------
    renderChallenges() {
        const container = document.getElementById("challenges-grid-container");
        if (!container) return;

        const state = window.SaveService.state;
        const daily = window.CHALLENGE_CONFIG.getDailyChallenge();
        const hourly = window.CHALLENGE_CONFIG.getHalfHourlyChallenge();

        const isDailyClaimed = state.challengeClaims[daily.cycleKey];
        const isDailyUnlocked = window.SaveService.isActUnlocked(daily.stageId);

        const isHourlyClaimed = state.challengeClaims[hourly.cycleKey];
        const isHourlyUnlocked = window.SaveService.isActUnlocked(hourly.stageId);

        let html = `
            <!-- Daily Challenge Card (30 Waves) -->
            <div class="challenge-card">
                <div>
                    <div class="challenge-badge-row">
                        <span class="challenge-type-pill daily">☀️ Daily Challenge</span>
                        <span class="timer-badge">Reset: <span id="daily-reset-countdown">--:--:--</span></span>
                    </div>
                    <h3 style="color:#f8fafc;font-size:20px;margin-bottom:6px;">Daily Challenge</h3>
                    <p style="color:#94a3b8;font-size:14px;margin-bottom:10px;">
                        Map: <b>World ${daily.worldNum || 1} Act ${daily.actNum} (${daily.mapName})</b> • <b>🌊 30 Waves</b>
                    </p>
                    <div style="background:#020617;padding:12px;border-radius:8px;border:1px solid #1e293b;margin-bottom:16px;">
                        <div style="font-size:12px;color:#94a3b8;font-weight:700;margin-bottom:6px;">REWARDS ON VICTORY:</div>
                        <div style="display:flex;gap:14px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                            <div style="font-size:14px;color:#38bdf8;font-weight:800;display:inline-flex;align-items:center;gap:5px;">
                                ${window.PixelSprites && window.PixelSprites.getGemIcon ? window.PixelSprites.getGemIcon(20) : '💎'}
                                <span>${(daily.rewards && daily.rewards.gems ? daily.rewards.gems.toLocaleString() : '3,000')} Gems</span>
                            </div>
                            <div style="font-size:14px;color:#c084fc;font-weight:800;display:inline-flex;align-items:center;gap:5px;">
                                ${window.PixelSprites && window.PixelSprites.getTraitRRIcon ? window.PixelSprites.getTraitRRIcon(20) : '🔮'}
                                <span>+25 Trait Rerolls</span>
                            </div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit('normal_star_fruit', 20)}" style="width:20px;height:20px;image-rendering:pixelated;"> 10 Normal</span>
                            <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit('pink_star_fruit', 20)}" style="width:20px;height:20px;image-rendering:pixelated;"> 2 Pink</span>
                            <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit('red_star_fruit', 20)}" style="width:20px;height:20px;image-rendering:pixelated;"> 2 Red</span>
                            <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit('green_star_fruit', 20)}" style="width:20px;height:20px;image-rendering:pixelated;"> 2 Green</span>
                            <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit('blue_star_fruit', 20)}" style="width:20px;height:20px;image-rendering:pixelated;"> 2 Blue</span>
                            <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit('yellow_star_fruit', 20)}" style="width:20px;height:20px;image-rendering:pixelated;"> 2 Yellow</span>
                            <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit('rainbow_star_fruit', 20)}" style="width:20px;height:20px;image-rendering:pixelated;"> 3 Rainbow</span>
                        </div>
                    </div>
                </div>
                <div>
                    ${!isDailyUnlocked ? `
                        <button class="stage-btn disabled" disabled style="width:100%;background:#334155;color:#94a3b8;cursor:not-allowed;">🔒 Locked (Clear Act ${daily.actNum} in Story)</button>
                    ` : (isDailyClaimed ? `
                        <button class="stage-btn disabled" disabled style="width:100%;background:#15803d;color:#fff;cursor:not-allowed;">✓ Cleared Today</button>
                    ` : `
                        <button class="stage-btn special-btn" style="width:100%;font-size:15px;padding:12px;" onclick="UIController.launchChallenge('daily')">▶ PLAY CHALLENGE</button>
                    `)}
                </div>
            </div>

            <!-- Half Hourly Challenge Card (15 Waves) -->
            <div class="challenge-card">
                <div>
                    <div class="challenge-badge-row">
                        <span class="challenge-type-pill half_hourly">⏱️ Half Hourly Challenge</span>
                        <span class="timer-badge">Refreshes: <span id="hourly-reset-countdown">--:--:--</span></span>
                    </div>
                    <h3 style="color:#f8fafc;font-size:20px;margin-bottom:6px;">Half Hourly Challenge</h3>
                    <p style="color:#94a3b8;font-size:14px;margin-bottom:10px;">
                        Map: <b>World ${hourly.worldNum || 1} Act ${hourly.actNum} (${hourly.mapName})</b> • <b>🌊 15 Waves</b>
                    </p>
                    <div style="background:#020617;padding:12px;border-radius:8px;border:1px solid #1e293b;margin-bottom:16px;">
                        <div style="font-size:12px;color:#94a3b8;font-weight:700;margin-bottom:6px;">REWARDS ON VICTORY:</div>
                        <div style="display:flex;gap:14px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                            <div style="font-size:14px;color:#38bdf8;font-weight:800;display:inline-flex;align-items:center;gap:5px;">
                                ${window.PixelSprites && window.PixelSprites.getGemIcon ? window.PixelSprites.getGemIcon(20) : '💎'}
                                <span>${(hourly.rewards && hourly.rewards.gems ? hourly.rewards.gems.toLocaleString() : '500')} Gems</span>
                            </div>
                            <div style="font-size:14px;color:#c084fc;font-weight:800;display:inline-flex;align-items:center;gap:5px;">
                                ${window.PixelSprites && window.PixelSprites.getTraitRRIcon ? window.PixelSprites.getTraitRRIcon(20) : '🔮'}
                                <span>+3 Trait Rerolls</span>
                            </div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;">
                            ${Object.entries(hourly.rewards.starFruits).map(([fruitId, count]) => `
                                <span class="fruit-pill" style="display:inline-flex;align-items:center;gap:4px;">
                                    <img src="${window.PixelSprites.getStarFruit(fruitId, 20)}" style="width:20px;height:20px;image-rendering:pixelated;">
                                    ${count}x ${window.TimeService.formatFruitName(fruitId)}
                                </span>
                            `).join("")}
                        </div>
                    </div>
                </div>
                <div>
                    ${!isHourlyUnlocked ? `
                        <button class="stage-btn disabled" disabled style="width:100%;background:#334155;color:#94a3b8;cursor:not-allowed;">🔒 Locked (Clear Act ${hourly.actNum} in Story)</button>
                    ` : (isHourlyClaimed ? `
                        <button class="stage-btn disabled" disabled style="width:100%;background:#15803d;color:#fff;cursor:not-allowed;">✓ Cleared (Wait for Refresh)</button>
                    ` : `
                        <button class="stage-btn special-btn" style="width:100%;font-size:15px;padding:12px;" onclick="UIController.launchChallenge('half_hourly')">▶ PLAY CHALLENGE</button>
                    `)}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    launchChallenge(type) {
        const ch = (type === "daily") ? window.CHALLENGE_CONFIG.getDailyChallenge() : window.CHALLENGE_CONFIG.getHalfHourlyChallenge();
        if (!window.SaveService.isActUnlocked(ch.stageId)) {
            this.showToast(`You must unlock Act ${ch.actNum} in Story Mode first before attempting this challenge!`, 'warning');
            return;
        }

        const isClaimed = window.SaveService.state.challengeClaims[ch.cycleKey];
        if (isClaimed) {
            this.showToast("You have already completed this challenge for this cycle!", "info");
            return;
        }

        document.getElementById("lobby-view").style.display = "none";
        document.getElementById("battle-view").style.display = "block";
        const canvas = document.getElementById("battleCanvas");
        window.CombatEngine.init(canvas);
        window.CombatEngine.startMatch(ch.stageId, false, ch);
        this.renderUnitDeploymentBar();
    },

    // ----------------------------------------------------
    // STORY QUESTS VIEW (STRICTLY GEMS REWARDS)
    // ----------------------------------------------------
        renderQuests() {
        const container = document.getElementById("quests-list-container");
        if (!container) return;

        const state = window.SaveService.state;
        this.questsTab = this.questsTab || "story"; // "story" or "legend"

        let html = `
            <!-- QUESTS TAB SEPARATION -->
            <div style="display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid #1e293b;padding-bottom:12px;flex-wrap:wrap;">
                <button class="stage-btn ${this.questsTab === 'story' ? 'special-btn' : ''}" style="font-size:14px;padding:8px 16px;font-weight:900;" onclick="UIController.setQuestsTab('story')">
                    ⚔️ Story Quests
                </button>
                <button class="stage-btn ${this.questsTab === 'legend' ? 'special-btn' : ''}" style="font-size:14px;padding:8px 16px;font-weight:900;" onclick="UIController.setQuestsTab('legend')">
                    👑 Legend Stage Quests
                </button>
                <button class="stage-btn ${this.questsTab === 'event' ? 'special-btn' : ''}" style="font-size:14px;padding:8px 16px;font-weight:900;" onclick="UIController.setQuestsTab('event')">
                    🎉 Event Quests
                </button>
            </div>
        `;

        if (this.questsTab === "story") {
            const worlds = [
                { num: 1, name: "Plains", acts: 6, prefix: "world1" },
                { num: 2, name: "Hills", acts: 6, prefix: "world2" },
                { num: 3, name: "Mountains", acts: 6, prefix: "world3" }
            ];

            worlds.forEach(w => {
                html += `
                    <div style="margin-bottom:18px;">
                        <h3 style="color:#facc15;font-size:16px;margin:0 0 10px 0;font-weight:900;">World ${w.num}: ${w.name} Story Quests</h3>
                        <div style="display:flex;flex-direction:column;gap:8px;">
                `;

                for (let act = 1; act <= w.acts; act++) {
                    const sId = `${w.prefix}_act${act}`;
                    const altSId = `world${w.num}_act${act}`;
                    const altSId2 = `world_${w.num}_act_${act}`;
                    const qKey = `world_${w.num}_act_${act}`;
                    const prog = state.stageProgress[sId] || state.stageProgress[altSId] || state.stageProgress[altSId2] || {};
                    const isCleared = prog.normalCleared || prog.hardCleared;
                    const isClaimed = state.storyQuests && state.storyQuests[qKey];
                    const rewardGems = 50 + act * 10;

                    html += `
                        <div class="quest-card ${isClaimed ? 'claimed' : ''}">
                            <div class="quest-info">
                                <h4>Act ${act}: Clear ${w.name} Act ${act}</h4>
                                <p style="color:#38bdf8;font-weight:700;">Reward: 💎 ${rewardGems} Gems</p>
                            </div>
                            <div class="quest-action">
                                ${isClaimed ? `
                                    <span class="badge-claimed">✓ Claimed</span>
                                ` : (isCleared ? `
                                    <button class="claim-btn" onclick="UIController.claimWorldQuest(${w.num}, ${act}, ${rewardGems})">Claim 💎${rewardGems} Gems</button>
                                ` : `
                                    <span class="badge-locked">🔒 Incomplete</span>
                                `)}
                            </div>
                        </div>
                    `;
                }

                html += `</div></div>`;
            });
        } else if (this.questsTab === "legend") {
            // Legend Stage Quests
            const legendQuests = [
                { id: "legend_act1", name: "Hills Legend Act 1", desc: "Clear Hills Legend Act 1", gems: 100, rrs: 2 },
                { id: "legend_act2", name: "Hills Legend Act 2", desc: "Clear Hills Legend Act 2", gems: 120, rrs: 3 },
                { id: "legend_act3", name: "Hills Legend Act 3", desc: "Clear Hills Legend Act 3", gems: 150, rrs: 5 },
                { id: "legend_mountains_act1", name: "Mountain Legend Act 1", desc: "Clear Mountain Legend Act 1", gems: 140, rrs: 3 },
                { id: "legend_mountains_act2", name: "Mountain Legend Act 2", desc: "Clear Mountain Legend Act 2", gems: 160, rrs: 4 },
                { id: "legend_mountains_act3", name: "Mountain Legend Act 3", desc: "Clear Mountain Legend Act 3", gems: 180, rrs: 5 }
            ];

            html += `
                <div style="margin-bottom:18px;">
                    <h3 style="color:#7dd3fc;font-size:16px;margin:0 0 10px 0;font-weight:900;">👑 Legend Stage Clear Quests</h3>
                    <div style="display:flex;flex-direction:column;gap:8px;">
            `;

            legendQuests.forEach(lq => {
                const prog = state.stageProgress[lq.id] || {};
                const isCleared = prog.normalCleared || prog.hardCleared;
                const isClaimed = state.storyQuests && state.storyQuests[`legend_${lq.id}`];

                html += `
                    <div class="quest-card ${isClaimed ? 'claimed' : ''}">
                        <div class="quest-info">
                            <h4>${lq.name}</h4>
                            <p style="color:#38bdf8;font-weight:700;">Reward: 💎 ${lq.gems} Gems + 🔮 ${lq.rrs} Trait Rerolls</p>
                        </div>
                        <div class="quest-action">
                            ${isClaimed ? `
                                <span class="badge-claimed">✓ Claimed</span>
                            ` : (isCleared ? `
                                <button class="claim-btn" onclick="UIController.claimLegendStageQuest('${lq.id}', ${lq.gems}, ${lq.rrs})">Claim Rewards</button>
                            ` : `
                                <span class="badge-locked">🔒 Incomplete (Clear Stage)</span>
                            `)}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        } else if (this.questsTab === "event") {
            const hasMythicEvolved = (state.inventoryUnits || []).some(u => {
                const cfg = window.UNIT_CONFIG && window.UNIT_CONFIG[u.unitId];
                return u.isEvolved && (u.rarity === "Mythic" || (cfg && cfg.rarity === "Mythic"));
            });
            const releaseClears = (state.stageProgress && state.stageProgress["event_release"] && state.stageProgress["event_release"].clearCount) || 0;
            const release1Done = releaseClears >= 1 || (state.stageProgress && state.stageProgress["event_release"] && state.stageProgress["event_release"].normalCleared);
            const release10Done = releaseClears >= 10;

            const eventQuests = [
                {
                    id: "event_quest_mythic_evo",
                    title: "Mythic Awakening",
                    desc: "Evolve any Mythic Unit in the Evolution Altar",
                    gems: 2500,
                    rrs: 25,
                    isComplete: hasMythicEvolved,
                    progressText: hasMythicEvolved ? "1 / 1 Evolved" : "0 / 1 Evolved"
                },
                {
                    id: "event_quest_release_1",
                    title: "Release Event Trial (Solo)",
                    desc: "Clear the 20-wave Release Event stage once",
                    gems: 5000,
                    rrs: 50,
                    isComplete: release1Done,
                    progressText: release1Done ? "1 / 1 Cleared" : `${Math.min(1, releaseClears)} / 1 Cleared`
                },
                {
                    id: "event_quest_release_10",
                    title: "Release Event Master",
                    desc: "Clear the 20-wave Release Event stage 10 times",
                    gems: 7500,
                    rrs: 75,
                    isComplete: release10Done,
                    progressText: `${Math.min(10, releaseClears)} / 10 Cleared`
                }
            ];

            html += `
                <div style="margin-bottom:18px;">
                    <h3 style="color:#f472b6;font-size:16px;margin:0 0 10px 0;font-weight:900;">🎉 Limited Event Quests</h3>
                    <div style="display:flex;flex-direction:column;gap:8px;">
            `;

            eventQuests.forEach(eq => {
                const isClaimed = state.storyQuests && state.storyQuests[eq.id];
                html += `
                    <div class="quest-card ${isClaimed ? 'claimed' : ''}">
                        <div class="quest-info">
                            <h4>${eq.title}</h4>
                            <p style="color:#cbd5e1;font-size:12px;margin:2px 0;">${eq.desc}</p>
                            <p style="color:#38bdf8;font-weight:700;margin:4px 0 0 0;">
                                Reward: 💎 ${eq.gems.toLocaleString()} Gems + 🔮 ${eq.rrs} Trait Rerolls
                                <span style="margin-left:8px;color:#facc15;">(${eq.progressText})</span>
                            </p>
                        </div>
                        <div class="quest-action">
                            ${isClaimed ? `
                                <span class="badge-claimed">✓ Claimed</span>
                            ` : (eq.isComplete ? `
                                <button class="claim-btn" onclick="UIController.claimEventQuest('${eq.id}', ${eq.gems}, ${eq.rrs})">Claim Rewards</button>
                            ` : `
                                <span class="badge-locked">🔒 Incomplete</span>
                            `)}
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        }

        container.innerHTML = html;
    },

    setQuestsTab(tab) {
        this.questsTab = tab;
        this.renderQuests();
    },

    claimWorldQuest(worldNum, actNum, rewardGems) {
        const key = `world_${worldNum}_act_${actNum}`;
        if (!window.SaveService.state.storyQuests) window.SaveService.state.storyQuests = {};
        if (window.SaveService.state.storyQuests[key]) return;

        window.SaveService.state.storyQuests[key] = true;
        window.SaveService.addGems(rewardGems);
        window.SaveService.save();

        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.updateTopBar();
        this.renderQuests();
        this.showToast(`Claimed World ${worldNum} Act ${actNum} Quest! +💎${rewardGems} Gems!`, "success");
    },

    claimLegendStageQuest(stageId, gems, rrs) {
        const key = `legend_${stageId}`;
        if (!window.SaveService.state.storyQuests) window.SaveService.state.storyQuests = {};
        if (window.SaveService.state.storyQuests[key]) return;

        window.SaveService.state.storyQuests[key] = true;
        window.SaveService.addGems(gems);
        window.SaveService.addItem("materials", "trait_reroll_crystal", rrs);
        window.SaveService.state.currencies.traitRerolls = (window.SaveService.state.currencies.traitRerolls || 0) + rrs;
        window.SaveService.save();

        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.updateTopBar();
        this.renderQuests();
        this.showToast(`Claimed Legend Quest! +💎${gems} Gems & +${rrs} Trait RRs!`, "success");
    },

    claimEventQuest(questId, gems, rrs) {
        if (!window.SaveService.state.storyQuests) window.SaveService.state.storyQuests = {};
        if (window.SaveService.state.storyQuests[questId]) return;

        window.SaveService.state.storyQuests[questId] = true;
        window.SaveService.addGems(gems);
        window.SaveService.addTraitRerolls(rrs);
        window.SaveService.save();

        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.updateTopBar();
        this.renderQuests();
        this.showToast(`Claimed Event Quest! +💎${gems.toLocaleString()} Gems & +🔮${rrs} Trait RRs!`, "success");
    },

    // ----------------------------------------------------
    // CRAFTING WORKSHOP VIEW
    // ----------------------------------------------------
    renderCrafting() {
        const container = document.getElementById("crafting-container");
        if (!container) return;

        const ss = window.SaveService;
        const state = ss.state;

        // Current Inventory Balances
        const normalCount = ss.getItemCount("starFruits", "normal_star_fruit");
        const pinkCount = ss.getItemCount("starFruits", "pink_star_fruit");
        const redCount = ss.getItemCount("starFruits", "red_star_fruit");
        const greenCount = ss.getItemCount("starFruits", "green_star_fruit");
        const blueCount = ss.getItemCount("starFruits", "blue_star_fruit");
        const yellowCount = ss.getItemCount("starFruits", "yellow_star_fruit");
        const rainbowCount = ss.getItemCount("starFruits", "rainbow_star_fruit");
        const relicShards = ss.getItemCount("materials", "relic_shard");

        const daggerCount = ss.getItemCount("materials", "abyssal_shadow_dagger");
        const rawDaggerCount = ss.getItemCount("materials", "dagger");
        const staffCount = ss.getItemCount("materials", "star_staff");

        // Dagger Recipe: 12 Daggers (Hills Legend Act 3), 1 Rainbow, 3 Pink, 3 Blue
        const daggerMet = rawDaggerCount >= 12 && rainbowCount >= 1 && pinkCount >= 3 && blueCount >= 3;
        // Star Staff Recipe: 2 Rainbow, 5 Pink, 5 Blue, 5 Yellow (Secret Catalyst)
        const staffMet = rainbowCount >= 2 && pinkCount >= 5 && blueCount >= 5 && yellowCount >= 5;
        // Fusion Recipe: 1 of each color
        const fuseMet = pinkCount >= 1 && redCount >= 1 && greenCount >= 1 && blueCount >= 1 && yellowCount >= 1;

        const relics = [
            { id: "relic_mangekyou", name: "Mangekyou Sharingan", cost: 10, desc: "2x Burn Duration & Piercing Damage" },
            { id: "relic_blazing_core", name: "Blazing Core", cost: 5, desc: "+15% Fire & Physical Damage" },
            { id: "relic_shadow_cloak", name: "Shadow Cloak", cost: 5, desc: "+15% Dark & Magical Damage" },
            { id: "relic_fortune_ring", name: "Golden Fortune Ring", cost: 8, desc: "+15% Wave Yen Income in matches" },
            { id: "relic_divine_eye", name: "Ancient Eye of Divination", cost: 10, desc: "+15% Attack Range to all units" }
        ];

        let html = `
            <!-- SECTION 1: EVOLUTION ITEMS -->
            <div class="crafting-section">
                <div class="crafting-section-title">
                    <span>⚔️ Evolution Catalyst Items</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:normal;margin-left:auto;">Forge catalysts to evolve your units</span>
                </div>
                <div class="crafting-grid">
                    <!-- Shadow Dagger -->
                    <div class="crafting-card">
                        <div>
                            <div class="crafting-header-box">
                                <div class="crafting-item-img" style="height:48px;display:flex;align-items:center;justify-content:center;">
                                    ${window.PixelSprites.getShadowDaggerIcon(44)}
                                </div>
                                <div>
                                    <div style="font-weight:900;color:#c084fc;font-size:15px;">Shadow Dagger</div>
                                    <div style="font-size:11px;color:#94a3b8;">Mythic Evolution Catalyst</div>
                                    <div style="font-size:11px;color:#38bdf8;margin-top:2px;">Owned: x${daggerCount}</div>
                                </div>
                            </div>
                            <div class="crafting-cost-list">
                                <div class="crafting-cost-item ${rawDaggerCount >= 12 ? 'met' : 'unmet'}">
                                    <span style="display:inline-flex;align-items:center;gap:6px;">${window.PixelSprites.getNormalDaggerIcon(20)} Daggers (Hills Legend Act 3)</span>
                                    <span>${rawDaggerCount} / 12</span>
                                </div>
                                <div class="crafting-cost-item ${rainbowCount >= 1 ? 'met' : 'unmet'}">
                                    <span><img src="${window.PixelSprites.getStarFruit('rainbow_star_fruit', 16)}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Rainbow Star Fruit</span>
                                    <span>${rainbowCount} / 1</span>
                                </div>
                                <div class="crafting-cost-item ${pinkCount >= 3 ? 'met' : 'unmet'}">
                                    <span><img src="${window.PixelSprites.getStarFruit('pink_star_fruit', 16)}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Pink Star Fruit</span>
                                    <span>${pinkCount} / 3</span>
                                </div>
                                <div class="crafting-cost-item ${blueCount >= 3 ? 'met' : 'unmet'}">
                                    <span><img src="${window.PixelSprites.getStarFruit('blue_star_fruit', 16)}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Blue Star Fruit</span>
                                    <span>${blueCount} / 3</span>
                                </div>
                            </div>
                        </div>
                        <button class="craft-action-btn" onclick="UIController.handleCraftEvolutionItem('abyssal_shadow_dagger')" ${daggerMet ? '' : 'disabled'}>
                            ${daggerMet ? '🔨 Forge Shadow Dagger' : 'Missing Materials (Need 12 Daggers)'}
                        </button>
                    </div>

                    <!-- Star Staff -->
                    <div class="crafting-card">
                        <div>
                            <div class="crafting-header-box">
                                <div class="crafting-item-img" style="height:48px;display:flex;align-items:center;justify-content:center;">
                                    ${window.PixelSprites.getStarStaffIcon(44)}
                                </div>
                                <div>
                                    <div style="font-weight:900;color:#facc15;font-size:15px;">Star Staff</div>
                                    <div style="font-size:11px;color:#94a3b8;">Secret Evolution Catalyst</div>
                                    <div style="font-size:11px;color:#38bdf8;margin-top:2px;">Owned: x${staffCount}</div>
                                </div>
                            </div>
                            <div class="crafting-cost-list">
                                <div class="crafting-cost-item ${rainbowCount >= 2 ? 'met' : 'unmet'}">
                                    <span><img src="${window.PixelSprites.getStarFruit('rainbow_star_fruit', 16)}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Rainbow Star Fruit</span>
                                    <span>${rainbowCount} / 2</span>
                                </div>
                                <div class="crafting-cost-item ${pinkCount >= 5 ? 'met' : 'unmet'}">
                                    <span><img src="${window.PixelSprites.getStarFruit('pink_star_fruit', 16)}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Pink Star Fruit</span>
                                    <span>${pinkCount} / 5</span>
                                </div>
                                <div class="crafting-cost-item ${blueCount >= 5 ? 'met' : 'unmet'}">
                                    <span><img src="${window.PixelSprites.getStarFruit('blue_star_fruit', 16)}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Blue Star Fruit</span>
                                    <span>${blueCount} / 5</span>
                                </div>
                                <div class="crafting-cost-item ${yellowCount >= 5 ? 'met' : 'unmet'}">
                                    <span><img src="${window.PixelSprites.getStarFruit('yellow_star_fruit', 16)}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Yellow Star Fruit</span>
                                    <span>${yellowCount} / 5</span>
                                </div>
                            </div>
                        </div>
                        <button class="craft-action-btn" onclick="UIController.handleCraftEvolutionItem('star_staff')" ${staffMet ? '' : 'disabled'}>
                            ${staffMet ? '✨ Forge Star Staff' : 'Missing Star Fruits'}
                        </button>
                    </div>
                </div>
            </div>

            <!-- SECTION 2: STAR FRUIT ALCHEMY -->
            <div class="crafting-section">
                <div class="crafting-section-title">
                    <span>Star Fruit Alchemy & Conversions</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:normal;margin-left:auto;">Convert, dismantle, or fuse Star Fruits</span>
                </div>
                
                <!-- Cosmic Rainbow Fusion -->
                <div style="background:#1e293b;border:2px solid #eab308;border-radius:10px;padding:14px;margin-bottom:16px;box-shadow:0 0 15px rgba(234,179,8,0.2);">
                    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <img src="${window.PixelSprites.getStarFruit('rainbow_star_fruit', 48)}" style="width:48px;height:48px;image-rendering:pixelated;">
                            <div>
                                <div style="font-size:16px;font-weight:900;color:#facc15;">Rainbow Star Fruit</div>
                                <div style="font-size:12px;color:#cbd5e1;">Fuse 1 of EVERY colored star fruit into 1 supreme Rainbow Star Fruit!</div>
                            </div>
                        </div>
                        <button class="craft-action-btn" style="background:linear-gradient(180deg,#eab308,#ca8a04);color:#000;border-color:#fde047;font-weight:900;" onclick="UIController.handleFuseRainbow()" ${fuseMet ? '' : 'disabled'}>
                            ${fuseMet ? '✨ Fuse Rainbow Star Fruit' : 'Need 1 of Each Color'}
                        </button>
                    </div>
                    <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;align-items:center;">
                        <span class="req-pill ${pinkCount >= 1 ? 'met' : 'unmet'}" style="display:inline-flex;align-items:center;gap:4px;">
                            <img src="${window.PixelSprites.getStarFruit('pink_star_fruit', 18)}" style="width:18px;height:18px;flex-shrink:0;"> Pink: ${pinkCount}/1
                        </span>
                        <span class="req-pill ${redCount >= 1 ? 'met' : 'unmet'}" style="display:inline-flex;align-items:center;gap:4px;">
                            <img src="${window.PixelSprites.getStarFruit('red_star_fruit', 18)}" style="width:18px;height:18px;flex-shrink:0;"> Red: ${redCount}/1
                        </span>
                        <span class="req-pill ${greenCount >= 1 ? 'met' : 'unmet'}" style="display:inline-flex;align-items:center;gap:4px;">
                            <img src="${window.PixelSprites.getStarFruit('green_star_fruit', 18)}" style="width:18px;height:18px;flex-shrink:0;"> Green: ${greenCount}/1
                        </span>
                        <span class="req-pill ${blueCount >= 1 ? 'met' : 'unmet'}" style="display:inline-flex;align-items:center;gap:4px;">
                            <img src="${window.PixelSprites.getStarFruit('blue_star_fruit', 18)}" style="width:18px;height:18px;flex-shrink:0;"> Blue: ${blueCount}/1
                        </span>
                        <span class="req-pill ${yellowCount >= 1 ? 'met' : 'unmet'}" style="display:inline-flex;align-items:center;gap:4px;">
                            <img src="${window.PixelSprites.getStarFruit('yellow_star_fruit', 18)}" style="width:18px;height:18px;flex-shrink:0;"> Yellow: ${yellowCount}/1
                        </span>
                    </div>
                </div>

                <!-- 3 Normal -> 1 Colored & 1 Colored -> 2 Normal -->
                <div class="crafting-grid">
                    <!-- Convert Normal to Colored -->
                    <div class="crafting-card">
                        <div>
                            <div style="font-weight:900;color:#38bdf8;font-size:15px;margin-bottom:4px;">Convert Normal ➔ Colored</div>
                            <div style="font-size:12px;color:#94a3b8;margin-bottom:10px;">3 Normal Star Fruits = 1 Specific Colored Fruit</div>
                            <div style="font-size:12px;color:#f8fafc;margin-bottom:8px;">Owned Normal Star Fruits: <b style="color:#facc15;">${normalCount}</b></div>
                            <label style="font-size:11.5px;color:#cbd5e1;display:block;margin-bottom:4px;">Target Color:</label>
                            <select id="craft-target-color-select" style="width:100%;padding:8px;background:#0f172a;border:1px solid #334155;color:#f8fafc;border-radius:6px;font-weight:700;margin-bottom:12px;">
                                <option value="pink_star_fruit">Pink Star Fruit</option>
                                <option value="red_star_fruit">Red Star Fruit</option>
                                <option value="green_star_fruit">Green Star Fruit</option>
                                <option value="blue_star_fruit">Blue Star Fruit</option>
                                <option value="yellow_star_fruit">Yellow Star Fruit</option>
                            </select>
                        </div>
                        <button class="craft-action-btn" onclick="UIController.handleConvertNormalToColored()" ${normalCount >= 3 ? '' : 'disabled'}>
                            ${normalCount >= 3 ? 'Convert 3 Normal ➔ 1 Colored' : 'Need 3 Normal Fruits'}
                        </button>
                    </div>

                    <!-- Convert Colored to 2 Normal -->
                    <div class="crafting-card">
                        <div>
                            <div style="font-weight:900;color:#4ade80;font-size:15px;margin-bottom:4px;">Dismantle Colored ➔ 2 Normal</div>
                            <div style="font-size:12px;color:#94a3b8;margin-bottom:10px;">1 Colored Star Fruit = 2 Normal Star Fruits</div>
                            <label style="font-size:11.5px;color:#cbd5e1;display:block;margin-bottom:4px;">Source Colored Fruit:</label>
                            <select id="craft-source-color-select" style="width:100%;padding:8px;background:#0f172a;border:1px solid #334155;color:#f8fafc;border-radius:6px;font-weight:700;margin-bottom:12px;">
                                <option value="pink_star_fruit">Pink Star Fruit (Owned: ${pinkCount})</option>
                                <option value="red_star_fruit">Red Star Fruit (Owned: ${redCount})</option>
                                <option value="green_star_fruit">Green Star Fruit (Owned: ${greenCount})</option>
                                <option value="blue_star_fruit">Blue Star Fruit (Owned: ${blueCount})</option>
                                <option value="yellow_star_fruit">Yellow Star Fruit (Owned: ${yellowCount})</option>
                            </select>
                        </div>
                        <button class="craft-action-btn" onclick="UIController.handleConvertColoredToNormal()">
                            Dismantle 1 Colored ➔ 2 Normal
                        </button>
                    </div>
                </div>
            </div>

            <!-- SECTION 3: ANCIENT RELICS -->
            <div class="crafting-section">
                <div class="crafting-section-title">
                    <span>🔨 Blacksmith</span>
                    <span style="font-size:12px;color:#38bdf8;font-weight:700;margin-left:auto;background:rgba(56,189,248,0.15);padding:3px 10px;border-radius:999px;border:1px solid #38bdf8;display:inline-flex;align-items:center;gap:4px;">
                        ${window.PixelSprites.getRelicShardIcon(18)} Owned Relic Shards: ${relicShards}
                    </span>
                </div>
                <div style="font-size:12px;color:#94a3b8;margin-bottom:12px;">
                    Forge permanent team relics using Relic Shards dropped from Legend Stage Act 3 (10% chance). Each relic can be attached to 1 unit at a time to grant specialized enhancements.
                </div>
                <div class="crafting-grid">
                    ${relics.map(r => {
                        const isOwned = ss.hasRelic(r.id);
                        const canAfford = relicShards >= r.cost;
                        return `
                            <div class="crafting-card ${isOwned ? 'relic-owned' : ''}">
                                <div>
                                    <div class="crafting-header-box">
                                        <div class="crafting-item-img" style="height:48px;display:flex;align-items:center;justify-content:center;">
                                            ${window.PixelSprites.getRelicIcon(r.id, 44)}
                                        </div>
                                        <div>
                                            <div style="font-weight:900;color:${isOwned ? '#facc15' : '#f8fafc'};font-size:15px;">${r.name}</div>
                                            <div style="font-size:11.5px;color:#4ade80;margin-top:2px;">${r.desc}</div>
                                            <div style="font-size:11px;color:#94a3b8;margin-top:4px;display:flex;align-items:center;gap:4px;">
                                                ${isOwned ? '<b style="color:#facc15;">👑 ACTIVE RELIC</b>' : `Cost: ${window.PixelSprites.getRelicShardIcon(16)} ${r.cost} Shards`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button class="craft-action-btn relic-btn" onclick="UIController.handleCraftRelic('${r.id}')" ${isOwned ? 'disabled' : (canAfford ? '' : 'disabled')}>
                                    ${isOwned ? '✓ Already Crafted' : (canAfford ? `🔨 Forge Relic (${r.cost} Shards)` : `Need ${r.cost} Shards (${relicShards}/${r.cost})`)}
                                </button>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    handleCraftEvolutionItem(itemId) {
        const res = window.SaveService.craftEvolutionItem(itemId);
        this.showToast(res.message, res.success ? "success" : "warning");
        if (res.success) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            this.updateTopBar();
            this.renderCrafting();
        }
    },

    handleConvertNormalToColored() {
        const sel = document.getElementById("craft-target-color-select");
        if (!sel) return;
        const targetColor = sel.value;
        const res = window.SaveService.convertNormalToColoredStarFruit(targetColor);
        this.showToast(res.message, res.success ? "success" : "warning");
        if (res.success) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            this.updateTopBar();
            this.renderCrafting();
        }
    },

    handleConvertColoredToNormal() {
        const sel = document.getElementById("craft-source-color-select");
        if (!sel) return;
        const sourceColor = sel.value;
        const res = window.SaveService.convertColoredToNormalStarFruit(sourceColor);
        this.showToast(res.message, res.success ? "success" : "warning");
        if (res.success) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            this.updateTopBar();
            this.renderCrafting();
        }
    },

    handleFuseRainbow() {
        const res = window.SaveService.fuseRainbowStarFruit();
        this.showToast(res.message, res.success ? "success" : "warning");
        if (res.success) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            this.updateTopBar();
            this.renderCrafting();
        }
    },

    handleCraftRelic(relicId) {
        const res = window.SaveService.craftRelic(relicId);
        this.showToast(res.message, res.success ? "success" : "warning");
        if (res.success) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            this.updateTopBar();
            this.renderCrafting();
        }
    },

    // ----------------------------------------------------
    // EVOLUTION ALTAR VIEW
    // ----------------------------------------------------
        renderEvolution() {
        const container = document.getElementById("evolution-container");
        if (!container) return;

        const state = window.SaveService.state;
        const rawInventory = state.inventoryUnits || [];
        
        // Find all owned units that can evolve
        const evolvableOwned = rawInventory.filter(u => {
            const conf = window.UNIT_CONFIG[u.unitId];
            return conf && conf.canEvolve && conf.evolvesTo;
        });

        if (evolvableOwned.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:50px 20px;background:#0f172a;border:1px solid #1e293b;border-radius:14px;max-width:620px;margin:24px auto;">
                    <div style="font-size:48px;margin-bottom:12px;">🧬</div>
                    <h3 style="color:#f8fafc;font-size:22px;margin:0 0 8px 0;font-weight:900;">No Evolvable Units Owned</h3>
                    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 auto;max-width:480px;">
                        You do not own any evolvable units in your inventory.
                        Summon or obtain Mythic & Secret units (such as <b>Shadow Assassin</b>, <b>Holy Knight</b>, <b>Flame Emperor</b>, <b>Wind Master</b>, <b>Thunder God</b>, or <b>Star Mage</b>) to unlock their evolution!
                    </p>
                </div>
            `;
            return;
        }

        // Validate selected unit
        const validIds = evolvableOwned.map(u => u.id);
        if (!this.selectedEvolutionUnitInstanceId || !validIds.includes(this.selectedEvolutionUnitInstanceId)) {
            this.selectedEvolutionUnitInstanceId = evolvableOwned[0].id;
        }

        const selectedUnit = evolvableOwned.find(u => u.id === this.selectedEvolutionUnitInstanceId);
        const baseConf = window.UNIT_CONFIG[selectedUnit.unitId];
        const evolvedConf = window.UNIT_CONFIG[baseConf.evolvesTo];

        const evoCost = baseConf.evolutionCost || { gold: 10000, requiredEvolutionItem: "abyssal_shadow_dagger", requiredCount: 1, evolutionItemName: "Catalyst" };
        const reqGold = evoCost.gold || 10000;
        const ownedGold = state.gold || 0;
        const goldMet = ownedGold >= reqGold;

        let allMatsMet = true;
        let matsListHtml = "";
        
        const itemsMap = evoCost.requiredItems || evoCost.materials || (evoCost.requiredEvolutionItem ? { [evoCost.requiredEvolutionItem]: (evoCost.requiredCount || 1) } : {});
        matsListHtml = Object.entries(itemsMap).map(([matId, reqCount]) => {
            const isFruit = matId.includes("star_fruit");
            let owned = 0;
            if (isFruit) {
                owned = window.SaveService.getItemCount("starFruits", matId);
            } else {
                owned = window.SaveService.getItemCount("materials", matId) || window.SaveService.getItemCount("relics", matId);
            }
            const isMet = owned >= reqCount;
            if (!isMet) allMatsMet = false;

            let matIcon = '📜';
            if (isFruit && window.PixelSprites && window.PixelSprites.getStarFruit) {
                matIcon = `<img src="${window.PixelSprites.getStarFruit(matId, 24)}" style="width:24px;height:24px;image-rendering:pixelated;vertical-align:middle;">`;
            } else if (window.PixelSprites && window.PixelSprites.getMaterialIcon) {
                matIcon = window.PixelSprites.getMaterialIcon(matId, 24);
            }

            const formattedName = matId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `
                <div style="display:flex;align-items:center;justify-content:space-between;background:#1e293b;padding:8px 12px;border-radius:8px;border:1px solid ${isMet ? '#22c55e' : '#ef4444'};margin-top:6px;">
                    <span style="display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#f8fafc;">
                        ${matIcon} <span>${formattedName}</span>
                    </span>
                    <span style="font-size:12px;font-weight:900;color:${isMet ? '#4ade80' : '#f87171'};">
                        ${owned} / ${reqCount}
                    </span>
                </div>
            `;
        }).join("");

        const canEvolve = goldMet && allMatsMet;

        let html = `
            <div style="margin-bottom:16px;">
                <div style="font-size:12px;font-weight:800;color:#94a3b8;margin-bottom:8px;">SELECT UNIT TO AWAKEN:</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    ${evolvableOwned.map(u => {
                        const uConf = window.UNIT_CONFIG[u.unitId];
                        const isSelected = u.id === this.selectedEvolutionUnitInstanceId;
                        return `
                            <button onclick="UIController.selectEvolutionUnit('${u.id}')" style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:8px;border:2px solid ${isSelected ? '#facc15' : '#334155'};background:${isSelected ? 'rgba(250,204,21,0.15)' : '#0f172a'};color:#f8fafc;font-weight:800;cursor:pointer;">
                                <img src="${window.PixelSprites.getUnitModel(u.unitId, 28, 36)}" style="width:28px;height:36px;object-fit:contain;">
                                <span>${uConf.name}</span>
                                <span style="font-size:10px;color:#94a3b8;">Lv.${u.level}</span>
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>

            <div class="evolution-card">
                <div class="evolution-split">
                    <!-- Base Unit -->
                    <div class="evolution-unit-box">
                        <img src="${window.PixelSprites.getUnitModel(baseConf.id, 140, 180)}" alt="${baseConf.name}" style="width:140px;height:180px;object-fit:contain;margin-bottom:8px;">
                        <h3 style="color:#a855f7;font-size:18px;">${baseConf.name}</h3>
                        <span class="showcase-rarity-pill ${baseConf.rarity.toLowerCase()}">${baseConf.rarity}</span>
                        <div style="font-size:12px;color:#94a3b8;margin-top:8px;">
                            ${baseConf.attackShape || baseConf.attackType} • ${baseConf.baseSpa}s SPA<br>
                            Range: ${baseConf.baseRange} • ${baseConf.element} / ${baseConf.damageType}
                        </div>
                    </div>

                    <!-- Center Arrow & Requirements -->
                    <div class="evolution-arrow-box" style="max-width:300px;">
                        <div style="font-size:32px;color:#facc15;margin-bottom:6px;">➔</div>
                        <div style="font-size:13px;font-weight:900;color:#f8fafc;margin-bottom:10px;">EVOLUTION RECIPE</div>
                        
                        <div class="req-pill ${goldMet ? 'met' : 'unmet'}" style="margin-bottom:8px;">
                            🪙 Gold: ${ownedGold.toLocaleString()} / ${reqGold.toLocaleString()}
                        </div>
                        <div style="display:flex;flex-direction:column;gap:6px;width:100%;">
                            ${matsListHtml}
                        </div>
                        ${!allMatsMet ? `
                            <div style="font-size:11px;color:#94a3b8;margin-top:8px;">
                                Farm materials from Legend Stages, Infinite, or Crafting!
                            </div>
                        ` : ''}
                    </div>

                    <!-- Evolved Unit Preview -->
                    <div class="evolution-unit-box" style="border-color:#8b5cf6;box-shadow:0 0 18px rgba(139, 92, 246, 0.35);">
                        <img src="${window.PixelSprites.getUnitModel(evolvedConf.id, 150, 190)}" alt="${evolvedConf.name}" style="width:150px;height:190px;object-fit:contain;margin-bottom:8px;">
                        <h3 style="color:#c084fc;font-size:18px;">${evolvedConf.name}</h3>
                        <span class="showcase-rarity-pill ${evolvedConf.rarity.toLowerCase()}">${evolvedConf.rarity} [AWAKENED]</span>
                        <div style="font-size:12px;color:#94a3b8;margin-top:6px;">
                            <b style="color:#facc15;">${evolvedConf.attackShape || evolvedConf.attackType} • Range: ${evolvedConf.baseRange}</b>
                        </div>
                        <div style="background:rgba(139,92,246,0.2);border:1px solid #a855f7;border-radius:8px;padding:8px;margin-top:8px;font-size:11.5px;text-align:left;">
                            <div style="color:#4ade80;font-weight:800;">💥 +30% Base Damage Boost</div>
                            ${(evolvedConf.passives || []).map(p => `
                                <div style="color:#fde047;font-weight:800;margin-top:2px;">🔮 ${p.name}: ${p.desc || p.description || ''}</div>
                            `).join("")}
                        </div>
                    </div>
                </div>

                <div style="text-align:center;margin-top:20px;">
                    ${canEvolve ? `
                        <button class="stage-btn special-btn" style="width:340px;padding:14px;font-size:16px;background:linear-gradient(180deg,#8b5cf6,#6d28d9);border:2px solid #c084fc;" onclick="UIController.handleEvolution()">
                            ✨ AWAKEN INTO ${evolvedConf.name.toUpperCase()}!
                        </button>
                    ` : `
                        <button class="stage-btn disabled" disabled style="width:340px;padding:14px;font-size:15px;background:#334155;color:#94a3b8;cursor:not-allowed;">
                            🔒 Requirements Incomplete
                        </button>
                    `}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    selectEvolutionUnit(instanceId) {
        this.selectedEvolutionUnitInstanceId = instanceId;
        this.renderEvolution();
    },

    handleEvolution() {
        if (!this.selectedEvolutionUnitInstanceId) return;
        const res = window.SaveService.evolveUnit(this.selectedEvolutionUnitInstanceId);
        if (!res.success) {
            this.showToast(res.message, "warning");
            return;
        }

        if (window.AudioService && window.AudioService.playVictorySound) {
            window.AudioService.playVictorySound();
        } else if (window.AudioService && window.AudioService.playUpgradeSound) {
            window.AudioService.playUpgradeSound();
        }

        this.updateTopBar();
        this.renderEvolution();
        this.showToast(`🎉 EVOLUTION SUCCESSFUL! Awakened into ${res.evolvedName}!`, "success");
    },

    // ----------------------------------------------------
    // ITEMS & MATERIALS INVENTORY VIEW
    // ----------------------------------------------------
    renderItemsInventory() {
        const container = document.getElementById("items-inventory-container");
        if (!container) return;

        const ss = window.SaveService;
        const state = ss.state;

        const relicsList = [
                        { id: "relic_blazing_core", name: "Blazing Core", desc: "+15% Fire & Physical Damage" },
            { id: "relic_shadow_cloak", name: "Shadow Cloak", desc: "+15% Dark & Magical Damage" },
            { id: "relic_fortune_ring", name: "Golden Fortune Ring", desc: "+15% Wave Yen Income" },
            { id: "relic_divine_eye", name: "Ancient Eye of Divination", desc: "+15% Attack Range" },
            { id: "relic_mangekyou", name: "Mangekyou Sharingan", desc: "2x Burn Duration & Piercing" }
        ];

        let html = `
            <!-- Relics Section (Permanent Team Passives) -->
            <div class="item-category-section">
                <div class="item-category-title" style="display:flex;align-items:center;justify-content:space-between;">
                    <span>👑 Relics & Relic Shards (Permanent Team Passives)</span>
                    <button class="stage-btn" style="padding:4px 10px;font-size:12px;background:#eab308;color:#000;border:none;font-weight:900;" onclick="UIController.switchTab('crafting')">🔨 Craft Relics</button>
                </div>
                <div class="items-card-grid">
                    <!-- Relic Shards -->
                    <div class="item-box-card" style="border-color:#38bdf8;box-shadow:0 0 10px rgba(56,189,248,0.25);">
                        <span class="item-box-count">x${ss.getItemCount("materials", "relic_shard")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getRelicShardIcon(56)}
                        </div>
                        <div class="item-box-name" style="color:#38bdf8;">Relic Shard</div>
                        <div class="item-box-sub">Legend Stage Act 3 (10% drop)</div>
                    </div>
                    ${relicsList.map(r => {
                        const owned = ss.hasRelic(r.id);
                        return `
                            <div class="item-box-card" style="${owned ? 'border-color:#facc15;background:rgba(234,179,8,0.1);box-shadow:0 0 12px rgba(234,179,8,0.3);' : 'opacity:0.6;'}">
                                <span class="item-box-count" style="color:${owned ? '#facc15' : '#64748b'};">${owned ? '✓ ACTIVE' : 'LOCKED'}</span>
                                <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                                    ${window.PixelSprites.getRelicIcon(r.id, 56)}
                                </div>
                                <div class="item-box-name" style="color:${owned ? '#facc15' : '#94a3b8'};">${r.name}</div>
                                <div class="item-box-sub">${r.desc}</div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>

            <!-- Evolution Items & Legend Drops -->
            <div class="item-category-section">
                <div class="item-category-title">⚔️ Evolution Items & Legend Stage Drops</div>
                <div class="items-card-grid">
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "abyssal_shadow_dagger")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getDaggerIcon(56)}
                        </div>
                        <div class="item-box-name" style="color:#c084fc;">Shadow Dagger</div>
                        <div class="item-box-sub">Void Assassin Evolution Item</div>
                    </div>
                    <div class="item-box-card" style="border-color:#f43f5e;box-shadow:0 0 12px rgba(244,63,94,0.3);">
                        <span class="item-box-count">x${ss.getItemCount("materials", "star_staff")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getStarStaffIcon ? window.PixelSprites.getStarStaffIcon(56) : window.PixelSprites.getMaterialIcon('star_staff', 56)}
                        </div>
                        <div class="item-box-name" style="color:#f43f5e;">Star Staff</div>
                        <div class="item-box-sub">Secret Star Mage Evolution Item</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "fire_scroll")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getMaterialIcon('fire_scroll', 56)}
                        </div>
                        <div class="item-box-name" style="color:#ef4444;">Fire Scroll</div>
                        <div class="item-box-sub">Mountain Legend Act 1 (5-10 drop)</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "water_scroll")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getMaterialIcon('water_scroll', 56)}
                        </div>
                        <div class="item-box-name" style="color:#0ea5e9;">Water Scroll</div>
                        <div class="item-box-sub">Mountain Legend Act 2 (5-10 drop)</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "nature_scroll")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getMaterialIcon('nature_scroll', 56)}
                        </div>
                        <div class="item-box-name" style="color:#22c55e;">Nature Scroll</div>
                        <div class="item-box-sub">Mountain Legend Act 3 (5-10 drop)</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "thunder_essence")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getMaterialIcon('thunder_essence', 56)}
                        </div>
                        <div class="item-box-name" style="color:#eab308;">Thunder Essence</div>
                        <div class="item-box-sub">Infinite Drop (5%) • Evolves Thunder God</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "nature_essence")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getMaterialIcon('nature_essence', 56)}
                        </div>
                        <div class="item-box-name" style="color:#10b981;">Nature Essence</div>
                        <div class="item-box-sub">Infinite Drop (5%) • Evolves Wind Master</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "light_energy")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getLightEnergyIcon(56)}
                        </div>
                        <div class="item-box-name">Light Energy</div>
                        <div class="item-box-sub">Legend Stage Act 1 (100% drop)</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "blaze")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getBlazeIcon(56)}
                        </div>
                        <div class="item-box-name">Blaze</div>
                        <div class="item-box-sub">Legend Stage Act 2 (100% drop)</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${ss.getItemCount("materials", "dagger")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getDaggerIcon(56)}
                        </div>
                        <div class="item-box-name">Dagger</div>
                        <div class="item-box-sub">Legend Stage Act 3 (100% drop)</div>
                    </div>
                </div>
            </div>

            <!-- Food Section (EXP Only) -->
            <div class="item-category-section">
                <div class="item-category-title">🍙 Food (Unit EXP Only)</div>
                <div class="items-card-grid">
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("food", "rice_ball")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getFoodIcon('rice_ball', 56)}
                        </div>
                        <div class="item-box-name">Rice Ball</div>
                        <div class="item-box-sub">+50 Unit EXP</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("food", "dorayaki")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getFoodIcon('dorayaki', 56)}
                        </div>
                        <div class="item-box-name">Dorayaki</div>
                        <div class="item-box-sub">+200 Unit EXP</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("food", "bento_box") || window.SaveService.getItemCount("food", "kings_feast")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getFoodIcon('kings_feast', 56)}
                        </div>
                        <div class="item-box-name">King's Feast</div>
                        <div class="item-box-sub">+800 Unit EXP</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("food", "ramen_bowl") || window.SaveService.getItemCount("food", "dragon_ramen")}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getFoodIcon('dragon_ramen', 56)}
                        </div>
                        <div class="item-box-name">Dragon Ramen</div>
                        <div class="item-box-sub">+3,000 Unit EXP</div>
                    </div>
                </div>
            </div>

            <!-- Evolution Materials Section (Star Fruits) -->
            <div class="item-category-section">
                <div class="item-category-title" style="display:flex;align-items:center;justify-content:space-between;">
                    <span>⭐ Evolution Star Fruits (Materials)</span>
                    <button class="stage-btn" style="padding:4px 10px;font-size:12px;background:#2563eb;color:#fff;border:none;font-weight:900;" onclick="UIController.switchTab('crafting')">🔨 Convert / Fuse</button>
                </div>
                <div class="items-card-grid">
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("starFruits", "normal_star_fruit")}</span>
                        <img src="${window.PixelSprites.getStarFruit('normal_star_fruit', 64)}" style="width:64px;height:64px;image-rendering:pixelated;">
                        <div class="item-box-name">Normal Star Fruit</div>
                        <div class="item-box-sub">Evolution Material</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("starFruits", "pink_star_fruit")}</span>
                        <img src="${window.PixelSprites.getStarFruit('pink_star_fruit', 64)}" style="width:64px;height:64px;image-rendering:pixelated;">
                        <div class="item-box-name">Pink Star Fruit</div>
                        <div class="item-box-sub">Evolution Material</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("starFruits", "red_star_fruit")}</span>
                        <img src="${window.PixelSprites.getStarFruit('red_star_fruit', 64)}" style="width:64px;height:64px;image-rendering:pixelated;">
                        <div class="item-box-name">Red Star Fruit</div>
                        <div class="item-box-sub">Evolution Material</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("starFruits", "green_star_fruit")}</span>
                        <img src="${window.PixelSprites.getStarFruit('green_star_fruit', 64)}" style="width:64px;height:64px;image-rendering:pixelated;">
                        <div class="item-box-name">Green Star Fruit</div>
                        <div class="item-box-sub">Evolution Material</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("starFruits", "blue_star_fruit")}</span>
                        <img src="${window.PixelSprites.getStarFruit('blue_star_fruit', 64)}" style="width:64px;height:64px;image-rendering:pixelated;">
                        <div class="item-box-name">Blue Star Fruit</div>
                        <div class="item-box-sub">Evolution Material</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count">x${window.SaveService.getItemCount("starFruits", "yellow_star_fruit")}</span>
                        <img src="${window.PixelSprites.getStarFruit('yellow_star_fruit', 64)}" style="width:64px;height:64px;image-rendering:pixelated;">
                        <div class="item-box-name">Yellow Star Fruit</div>
                        <div class="item-box-sub">Evolution Material</div>
                    </div>
                    <div class="item-box-card" style="border-color:#eab308;box-shadow:0 0 12px rgba(234, 179, 8, 0.25);">
                        <span class="item-box-count">x${window.SaveService.getItemCount("starFruits", "rainbow_star_fruit")}</span>
                        <img src="${window.PixelSprites.getStarFruit('rainbow_star_fruit', 64)}" style="width:64px;height:64px;image-rendering:pixelated;">
                        <div class="item-box-name" style="color:#facc15;">Rainbow Star Fruit</div>
                        <div class="item-box-sub">Supreme Evolution Material</div>
                    </div>
                </div>
            </div>

            <!-- Consumables & Tokens -->
            <div class="item-category-section">
                <div class="item-category-title">🔮 Consumables & Currencies</div>
                <div class="items-card-grid">
                    <div class="item-box-card">
                        <span class="item-box-count">x${(state.traitRerolls || 0).toLocaleString()}</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getTraitRRIcon(56)}
                        </div>
                        <div class="item-box-name">Trait Reroll Token</div>
                        <div class="item-box-sub">Reroll traits at Trait Altar</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count" style="font-size:10px;white-space:nowrap;padding:2px 6px;">${(state.gold || 0).toLocaleString()} Gold</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getGoldIcon(56)}
                        </div>
                        <div class="item-box-name">Gold</div>
                        <div class="item-box-sub">Earned by selling units</div>
                    </div>
                    <div class="item-box-card">
                        <span class="item-box-count" style="font-size:10px;white-space:nowrap;padding:2px 6px;">${(state.gems || 0).toLocaleString()} Gems</span>
                        <div style="height:64px;display:flex;align-items:center;justify-content:center;">
                            ${window.PixelSprites.getGemIcon(56)}
                        </div>
                        <div class="item-box-name">Summon Gems</div>
                        <div class="item-box-sub">Used for Banners</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    // ----------------------------------------------------
    // UNIT & ENEMY INDEX VIEW
    // ----------------------------------------------------
    indexSubtab: "units", // "units" or "enemies"

    setIndexSubtab(subtab) {
        this.indexSubtab = subtab;
        const btnU = document.getElementById("btn-subnav-units");
        const btnE = document.getElementById("btn-subnav-enemies");
        if (btnU) btnU.classList.toggle("active", subtab === "units");
        if (btnE) btnE.classList.toggle("active", subtab === "enemies");
        this.renderIndex();
    },

    renderIndex() {
        const container = document.getElementById("index-display-container");
        if (!container) return;

        const state = window.SaveService.state;
        const subtab = this.indexSubtab;

        if (subtab === "units") {
            const allUnits = Object.values(window.UNIT_CONFIG || {}).filter(u => !u.isEvolvedForm);
            let html = `
                <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
                    <button class="stage-btn special-btn" style="padding:8px 18px;font-size:13px;border-radius:8px;" onclick="UIController.claimAllUnitIndex()">
                        ✨ Claim All Unit Rewards
                    </button>
                </div>
                <div class="index-grid">
            `;

            allUnits.forEach(u => {
                const isUnlocked = !!(state.unlockedUnitIndex && state.unlockedUnitIndex[u.id]);
                const isClaimed = !!(state.claimedUnitIndex && state.claimedUnitIndex[u.id]);

                // Reward tiers: Rare: 25, Epic: 50, Legendary: 100, Mythic: 250, Secret: 500
                const gemRewards = {
                    "Rare": 25,
                    "Epic": 50,
                    "Legendary": 100,
                    "Mythic": 250,
                    "Secret": 500
                };
                const reward = gemRewards[u.rarity] || 25;

                html += `
                    <div class="index-card ${isUnlocked ? '' : 'locked'}">
                        <div>
                            <span class="showcase-rarity-pill ${u.rarity.toLowerCase()}">${u.rarity}</span>
                            <img src="${window.PixelSprites.getUnitModel(u.id, 90, 110)}" alt="${u.name}" style="width:90px;height:110px;object-fit:contain;margin:8px auto;display:block;">
                            <div style="font-weight:700;color:#f8fafc;font-size:14px;">${u.name}</div>
                            <div style="font-size:12px;color:#94a3b8;">${u.element} • ${u.damageType}</div>
                        </div>
                        <div style="margin-top:10px;width:100%;">
                            ${!isUnlocked ? `
                                <span class="badge-locked" style="display:block;text-align:center;">🔒 Undiscovered</span>
                            ` : (isClaimed ? `
                                <span class="badge-claimed" style="display:block;text-align:center;">✓ Claimed (💎${reward})</span>
                            ` : `
                                <button class="claim-btn" style="width:100%;" onclick="UIController.claimUnitIndex('${u.id}')">Claim 💎${reward} Gems</button>
                            `)}
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
        } else {
            // Enemies Subtab
            const world1Enemies = [
                { id: "grunt", name: "Corrupted Grunt", isBoss: false },
                { id: "scout_dasher", name: "Swift Scout", isBoss: false },
                { id: "armored_golem", name: "Armored Golem", isBoss: false },
                { id: "flying_harpy", name: "Flying Harpy", isBoss: false },
                { id: "magic_shieldbearer", name: "Magic Shieldbearer", isBoss: false },
                { id: "berserker_orc", name: "Berserker Orc", isBoss: false },
                { id: "shadow_assassin", name: "Shadow Assassin", isBoss: false },
                { id: "abyssal_colossus", name: "Abyssal Colossus", isBoss: true },
                { id: "world_boss_demon", name: "Demon Lord Malakor", isBoss: true }
            ];

            const unlockedCount = world1Enemies.filter(e => state.unlockedEnemyIndex && state.unlockedEnemyIndex[e.id]).length;
            const allWorld1Unlocked = unlockedCount >= world1Enemies.length;
            const isWorldClaimed = !!(state.claimedWorldEnemyIndex && state.claimedWorldEnemyIndex["world_1"]);

            let html = `
                <!-- World 1 Grand Bonus Header -->
                <div class="world-bonus-card">
                    <div>
                        <h3 style="color:#facc15;font-size:18px;margin-bottom:4px;">🏆 World 1 Completion Bonus</h3>
                        <p style="color:#e2e8f0;font-size:13px;margin:0;">
                            Unlock all 9 World 1 enemies in your Index to claim <b>💎 500 Gems</b> and <b>🔮 5 Trait Rerolls</b>!
                        </p>
                        <div style="font-size:12px;color:#93c5fd;margin-top:6px;">Progress: <b>${unlockedCount} / ${world1Enemies.length} Enemies Registered</b></div>
                    </div>
                    <div>
                        ${isWorldClaimed ? `
                            <span class="badge-claimed" style="padding:10px 16px;font-size:14px;">✓ World 1 Bonus Claimed!</span>
                        ` : (allWorld1Unlocked ? `
                            <button class="stage-btn special-btn" style="padding:10px 18px;font-size:14px;" onclick="UIController.claimWorldEnemyIndex('world_1')">
                                🏆 Claim Bonus (💎500 & 🔮5 Trait RRs)
                            </button>
                        ` : `
                            <span class="badge-locked" style="padding:10px 16px;font-size:13px;">🔒 ${world1Enemies.length - unlockedCount} Enemies Remaining</span>
                        `)}
                    </div>
                </div>
                <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
                    <button class="stage-btn special-btn" style="padding:8px 18px;font-size:13px;border-radius:8px;" onclick="UIController.claimAllEnemyIndex()">
                        ✨ Claim All Enemy Rewards
                    </button>
                </div>

                <div class="index-grid">
            `;

            world1Enemies.forEach(e => {
                const conf = (window.ENEMY_CONFIG && window.ENEMY_CONFIG[e.id]) || { hp: 100, speed: 1.0 };
                const isUnlocked = !!(state.unlockedEnemyIndex && state.unlockedEnemyIndex[e.id]);
                const isClaimed = !!(state.claimedEnemyIndex && state.claimedEnemyIndex[e.id]);

                html += `
                    <div class="index-card ${isUnlocked ? '' : 'locked'}">
                        <div>
                            <span class="showcase-rarity-pill ${e.isBoss ? 'mythic' : 'epic'}">${e.isBoss ? 'WORLD BOSS' : 'ENEMY'}</span>
                            <img src="${window.PixelSprites.getEnemySprite(e.id, 80)}" alt="${e.name}" style="width:80px;height:80px;image-rendering:pixelated;margin:8px auto;display:block;">
                            <div style="font-weight:700;color:#f8fafc;font-size:14px;">${e.name}</div>
                            <div style="font-size:12px;color:#94a3b8;">${e.isBoss ? '10% Kill Drop Chance' : '25% Kill Drop Chance'}</div>
                        </div>
                        <div style="margin-top:10px;width:100%;">
                            ${!isUnlocked ? `
                                <span class="badge-locked" style="display:block;text-align:center;">🔒 Undiscovered</span>
                            ` : (isClaimed ? `
                                <span class="badge-claimed" style="display:block;text-align:center;">✓ Claimed (💎30)</span>
                            ` : `
                                <button class="claim-btn" style="width:100%;" onclick="UIController.claimEnemyIndex('${e.id}')">Claim 💎30 Gems</button>
                            `)}
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
        }
    },

    claimUnitIndex(unitId) {
        const res = window.SaveService.claimUnitIndex(unitId);
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }
        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.updateTopBar();
        this.renderIndex();
        this.showToast(`Claimed Index Reward for ${unitId}! +${res.gems} 💎 Gems!`, 'success');
    },

    claimEnemyIndex(enemyId) {
        const res = window.SaveService.claimEnemyIndex(enemyId);
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }
        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.updateTopBar();
        this.renderIndex();
        this.showToast(`Claimed Enemy Index Reward for ${enemyId}! +${res.gems} 💎 Gems!`, 'success');
    },

    claimWorldEnemyIndex(worldId) {
        const res = window.SaveService.claimWorldEnemyIndex(worldId);
        if (!res.success) {
            this.showToast(res.message, res.success ? "success" : "warning");
            return;
        }
        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.updateTopBar();
        this.renderIndex();
        this.showToast(`🎉 WORLD 1 GRAND BONUS CLAIMED! +${res.gems} 💎 Gems and +${res.traitRrs} 🔮 Trait Rerolls!`, 'success');
    },

    claimAllUnitIndex() {
        let totalGems = 0;
        let count = 0;
        const state = window.SaveService.state;
        const allUnits = Object.values(window.UNIT_CONFIG || {}).filter(u => !u.isEvolvedForm);
        allUnits.forEach(u => {
            const isUnlocked = !!(state.unlockedUnitIndex && state.unlockedUnitIndex[u.id]);
            const isClaimed = !!(state.claimedUnitIndex && state.claimedUnitIndex[u.id]);
            if (isUnlocked && !isClaimed) {
                const res = window.SaveService.claimUnitIndex(u.id);
                if (res.success) {
                    totalGems += res.gems;
                    count++;
                }
            }
        });

        if (count > 0) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            this.updateTopBar();
            this.renderIndex();
            this.showToast(`🎉 Claimed rewards for ${count} units! Total: +${totalGems} 💎 Gems!`, 'success');
        } else {
            this.showToast("No unclaimed unit rewards available right now.", "info");
        }
    },

    claimAllEnemyIndex() {
        let totalGems = 0;
        let count = 0;
        const state = window.SaveService.state;
        const enemyIds = ["grunt", "scout_dasher", "armored_golem", "flying_harpy", "magic_shieldbearer", "berserker_orc", "shadow_assassin", "abyssal_colossus", "world_boss_demon"];
        enemyIds.forEach(id => {
            const isUnlocked = !!(state.unlockedEnemyIndex && state.unlockedEnemyIndex[id]);
            const isClaimed = !!(state.claimedEnemyIndex && state.claimedEnemyIndex[id]);
            if (isUnlocked && !isClaimed) {
                const res = window.SaveService.claimEnemyIndex(id);
                if (res.success) {
                    totalGems += res.gems;
                    count++;
                }
            }
        });

        if (count > 0) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            this.updateTopBar();
            this.renderIndex();
            this.showToast(`🎉 Claimed rewards for ${count} enemies! Total: +${totalGems} 💎 Gems!`, 'success');
        } else {
            this.showToast("No unclaimed enemy rewards available right now.", "info");
        }
    },

    // ----------------------------------------------------
    // PROMO CODES VIEW & CREATOR CODE STUDIO
    // ----------------------------------------------------
    renderCodes() {
        const input = document.getElementById("promo-code-input");
        const msg = document.getElementById("promo-code-msg");
        if (input) input.value = "";
        if (msg) msg.style.display = "none";

        // Render Active Codes List (Only Active, Non-Expired, Non-Deleted Codes)
        const listEl = document.getElementById("active-codes-list");
        if (listEl && window.SaveService) {
            const activeCodes = window.SaveService.getActivePromoCodes ? window.SaveService.getActivePromoCodes() : window.SaveService.PROMO_CODES;
            let html = "";
            for (const [code, data] of Object.entries(activeCodes)) {
                const parts = [];
                if (data.gems && window.PixelSprites) parts.push(`<span style="color:#38bdf8;display:inline-flex;align-items:center;gap:4px;">${window.PixelSprites.getGemIcon(14)} <span>${data.gems.toLocaleString()} Gems</span></span>`);
                if (data.gold && window.PixelSprites) parts.push(`<span style="color:#facc15;display:inline-flex;align-items:center;gap:4px;">${window.PixelSprites.getGoldIcon(14)} <span>${data.gold.toLocaleString()} Gold</span></span>`);
                if (data.traitRerolls && window.PixelSprites) parts.push(`<span style="color:#c084fc;display:inline-flex;align-items:center;gap:4px;">${window.PixelSprites.getTraitRRIcon(14)} <span>${data.traitRerolls} Trait RR</span></span>`);
                if (data.food && window.PixelSprites) {
                    for (const [fId, qty] of Object.entries(data.food)) {
                        parts.push(`<span style="color:#4ade80;display:inline-flex;align-items:center;gap:4px;">${window.PixelSprites.getFoodIcon(fId, 14)} <span>${qty}x ${fId.replace(/_/g, ' ')}</span></span>`);
                    }
                }
                if (data.starFruits && window.PixelSprites) {
                    for (const [sfId, qty] of Object.entries(data.starFruits)) {
                        parts.push(`<span style="color:#fb7185;display:inline-flex;align-items:center;gap:4px;"><img src="${window.PixelSprites.getStarFruit(sfId, 14)}" style="width:14px;height:14px;vertical-align:middle;display:inline-block;image-rendering:pixelated;"> <span>${qty}x ${sfId.replace(/_/g, ' ')}</span></span>`);
                    }
                }
                if (data.materials && window.PixelSprites) {
                    for (const [mId, qty] of Object.entries(data.materials)) {
                        parts.push(`<span style="color:#94a3b8;display:inline-flex;align-items:center;gap:4px;">${window.PixelSprites.getMaterialIcon(mId, 14)} <span>${qty}x ${mId.replace(/_/g, ' ')}</span></span>`);
                    }
                }
                if (data.luckPotions && window.PixelSprites) {
                    parts.push(`<span style="color:#a855f7;display:inline-flex;align-items:center;gap:4px;">${window.PixelSprites.getLuckPotionIcon(14)} <span>${data.luckPotions}x Luck Potion</span></span>`);
                }
                html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">• <b style="color:#fff;font-family:'Lilita One',cursive;letter-spacing:0.5px;font-size:14px;">${code}</b> : ${parts.join(', ')}</div>`;
            }
            if (!html) html = `<div style="color:#64748b;font-style:italic;">No active promo codes right now.</div>`;
            listEl.innerHTML = html;
        }

        // Render Creator Code Studio (Only for thabpanaphat.p2031@icsn.ac.th)
        const studioEl = document.getElementById("creator-code-studio-area");
        if (studioEl) {
            const isCreator = window.SaveService && window.SaveService.isCreatorAccount && window.SaveService.isCreatorAccount();
            if (!isCreator) {
                studioEl.innerHTML = "";
                return;
            }

            const items = [
                // Currencies
                { id: "gems", name: "Gems", category: "Currency", type: "gems" },
                { id: "gold", name: "Gold", category: "Currency", type: "gold" },
                { id: "traitRerolls", name: "Trait Reroll Crystals", category: "Currency", type: "trait_rr" },
                
                // Star Fruits
                { id: "rainbow_star_fruit", name: "Rainbow Star Fruit", category: "Star Fruits", subGroup: "starFruits" },
                { id: "red_star_fruit", name: "Red Star Fruit", category: "Star Fruits", subGroup: "starFruits" },
                { id: "blue_star_fruit", name: "Blue Star Fruit", category: "Star Fruits", subGroup: "starFruits" },
                { id: "green_star_fruit", name: "Green Star Fruit", category: "Star Fruits", subGroup: "starFruits" },
                { id: "yellow_star_fruit", name: "Yellow Star Fruit", category: "Star Fruits", subGroup: "starFruits" },
                { id: "purple_star_fruit", name: "Purple Star Fruit", category: "Star Fruits", subGroup: "starFruits" },
                { id: "pink_star_fruit", name: "Pink Star Fruit", category: "Star Fruits", subGroup: "starFruits" },

                // Food
                { id: "rice_ball", name: "Rice Ball (+50 EXP)", category: "Food Items", subGroup: "food" },
                { id: "dorayaki", name: "Dorayaki (+200 EXP)", category: "Food Items", subGroup: "food" },
                { id: "bento", name: "King's Feast Bento (+800 EXP)", category: "Food Items", subGroup: "food" },
                { id: "ramen", name: "Dragon Ramen (+3,000 EXP)", category: "Food Items", subGroup: "food" },

                // Materials
                { id: "dagger", name: "Normal Dagger", category: "Materials", subGroup: "materials" },
                { id: "shadow_dagger", name: "Shadow Dagger", category: "Materials", subGroup: "materials" },
                { id: "relic_shard", name: "Relic Shard", category: "Materials", subGroup: "materials" },
                { id: "light_energy", name: "Light Energy", category: "Materials", subGroup: "materials" },
                { id: "blaze", name: "Blaze", category: "Materials", subGroup: "materials" },
                { id: "fire_scroll", name: "Fire Scroll", category: "Materials", subGroup: "materials" },
                { id: "water_scroll", name: "Water Scroll", category: "Materials", subGroup: "materials" },
                { id: "nature_scroll", name: "Nature Scroll", category: "Materials", subGroup: "materials" },
                { id: "star_staff", name: "Star Staff", category: "Materials", subGroup: "materials" },
                { id: "thunder_essence", name: "Thunder Essence", category: "Materials", subGroup: "materials" },
                { id: "nature_essence", name: "Nature Essence", category: "Materials", subGroup: "materials" },
                { id: "luck_potion", name: "Luck Potion (+100% Luck)", category: "Consumables", subGroup: "potions" }
            ];

            const categories = ["Currency", "Star Fruits", "Food Items", "Materials", "Consumables"];

            let sectionsHtml = "";
            for (const cat of categories) {
                const catItems = items.filter(it => it.category === cat);
                let itemsGrid = "";
                for (const item of catItems) {
                    let iconSvg = "";
                    if (window.PixelSprites) {
                        if (item.category === "Star Fruits") {
                            iconSvg = window.PixelSprites.getStarFruit ? window.PixelSprites.getStarFruit(item.id, 28) : (window.PixelSprites.getStarFruitIcon ? window.PixelSprites.getStarFruitIcon(item.id, 28) : "");
                        } else if (item.category === "Food Items") {
                            iconSvg = window.PixelSprites.getFoodIcon ? window.PixelSprites.getFoodIcon(item.id, 28) : (window.PixelSprites.getFood ? window.PixelSprites.getFood(item.id, 28) : "");
                        } else if (item.id === "luck_potion") {
                            iconSvg = window.PixelSprites.getLuckPotionIcon ? window.PixelSprites.getLuckPotionIcon(28) : "";
                        } else {
                            iconSvg = window.PixelSprites.getMaterialIcon ? window.PixelSprites.getMaterialIcon(item.type || item.id, 28) : "";
                        }
                    }

                    let iconEl = "";
                    if (iconSvg) {
                        if (iconSvg.startsWith("data:")) {
                            iconEl = `<img src="${iconSvg}" style="width:28px;height:28px;object-fit:contain;">`;
                        } else {
                            iconEl = iconSvg;
                        }
                    }

                    itemsGrid += `
                        <div style="background:#090d16;border:1px solid #334155;border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
                            <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                                <div style="width:28px;height:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">${iconEl}</div>
                                <span style="font-size:12px;color:#f1f5f9;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</span>
                            </div>
                            <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                                <input type="number" id="creator-qty-${item.id}" data-item-id="${item.id}" data-category="${item.category}" data-subgroup="${item.subGroup || ''}" min="0" value="0" style="width:65px;padding:4px 6px;background:#1e293b;border:1px solid #475569;border-radius:4px;color:#fff;font-weight:700;font-size:12px;text-align:center;">
                                <button type="button" onclick="UIController.adjustCreatorQty('${item.id}', 1)" style="background:#334155;color:#fff;border:none;border-radius:4px;padding:3px 6px;cursor:pointer;font-size:10px;font-weight:700;">+1</button>
                                <button type="button" onclick="UIController.adjustCreatorQty('${item.id}', 10)" style="background:#334155;color:#fff;border:none;border-radius:4px;padding:3px 6px;cursor:pointer;font-size:10px;font-weight:700;">+10</button>
                                <button type="button" onclick="UIController.adjustCreatorQty('${item.id}', 100)" style="background:#334155;color:#fff;border:none;border-radius:4px;padding:3px 6px;cursor:pointer;font-size:10px;font-weight:700;">+100</button>
                            </div>
                        </div>
                    `;
                }

                sectionsHtml += `
                    <div style="margin-bottom:14px;">
                        <h5 style="color:#38bdf8;margin:0 0 8px 0;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">${cat}</h5>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:8px;">
                            ${itemsGrid}
                        </div>
                    </div>
                `;
            }

            // Build Code Management rows (Expire / Delete)
            const allManageCodes = window.SaveService ? window.SaveService.getAllPromoCodes(true) : {};
            let manageRowsHtml = "";
            for (const [cName, cData] of Object.entries(allManageCodes)) {
                const isExp = !!cData.expired;
                const badges = [];
                if (cData.gems && window.PixelSprites) badges.push(`<span style="color:#38bdf8;display:inline-flex;align-items:center;gap:3px;">${window.PixelSprites.getGemIcon(12)} ${cData.gems.toLocaleString()}</span>`);
                if (cData.gold && window.PixelSprites) badges.push(`<span style="color:#facc15;display:inline-flex;align-items:center;gap:3px;">${window.PixelSprites.getGoldIcon(12)} ${cData.gold.toLocaleString()}</span>`);
                if (cData.traitRerolls && window.PixelSprites) badges.push(`<span style="color:#c084fc;display:inline-flex;align-items:center;gap:3px;">${window.PixelSprites.getTraitRRIcon(12)} ${cData.traitRerolls} RR</span>`);
                if (cData.food && window.PixelSprites) {
                    for (const [fId, qty] of Object.entries(cData.food)) {
                        badges.push(`<span style="color:#4ade80;display:inline-flex;align-items:center;gap:3px;">${window.PixelSprites.getFoodIcon(fId, 12)} ${qty}x ${fId.replace(/_/g, ' ')}</span>`);
                    }
                }
                if (cData.starFruits && window.PixelSprites) {
                    for (const [sfId, qty] of Object.entries(cData.starFruits)) {
                        badges.push(`<span style="color:#fb7185;display:inline-flex;align-items:center;gap:3px;"><img src="${window.PixelSprites.getStarFruit(sfId, 12)}" style="width:12px;height:12px;vertical-align:middle;display:inline-block;image-rendering:pixelated;"> ${qty}x ${sfId.replace(/_/g, ' ')}</span>`);
                    }
                }
                if (cData.materials && window.PixelSprites) {
                    for (const [mId, qty] of Object.entries(cData.materials)) {
                        badges.push(`<span style="color:#94a3b8;display:inline-flex;align-items:center;gap:3px;">${window.PixelSprites.getMaterialIcon(mId, 12)} ${qty}x ${mId.replace(/_/g, ' ')}</span>`);
                    }
                }

                const statusTag = isExp
                    ? `<span style="background:rgba(239,68,68,0.2);color:#ef4444;font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;border:1px solid #ef4444;">EXPIRED</span>`
                    : `<span style="background:rgba(34,197,94,0.2);color:#4ade80;font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;border:1px solid #22c55e;">ACTIVE</span>`;

                const expireBtn = isExp
                    ? `<button type="button" onclick="UIController.reactivateCode('${cName}')" style="background:#15803d;color:#fff;border:none;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">Reactivate</button>`
                    : `<button type="button" onclick="UIController.expireCode('${cName}')" style="background:#c2410c;color:#fff;border:none;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">Expire</button>`;

                manageRowsHtml += `
                    <div style="background:#060a12;border:1px solid ${isExp ? 'rgba(239,68,68,0.3)' : '#1e293b'};border-radius:6px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                            <span style="font-family:'Lilita One',cursive;font-size:15px;color:${isExp ? '#94a3b8' : '#38bdf8'};">${cName}</span>
                            ${statusTag}
                            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;">${badges.join(', ')}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            ${expireBtn}
                            <button type="button" onclick="UIController.deleteCode('${cName}')" style="background:#991b1b;color:#fecaca;border:1px solid #dc2626;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:800;cursor:pointer;">Delete</button>
                        </div>
                    </div>
                `;
            }

            studioEl.innerHTML = `
                <div style="background:#0b1324;border:2px solid #eab308;border-radius:14px;padding:20px;box-shadow:0 0 30px rgba(234,179,8,0.25);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #1e293b;padding-bottom:12px;flex-wrap:wrap;gap:8px;">
                        <div>
                            <h3 style="margin:0;color:#facc15;font-family:'Lilita One',cursive;font-size:22px;letter-spacing:1px;display:flex;align-items:center;gap:8px;">
                                CREATOR CODE STUDIO
                            </h3>
                            <p style="margin:4px 0 0 0;color:#94a3b8;font-size:12px;">Exclusive code generator for <b>thabpanaphat.p2031@icsn.ac.th</b>. Build custom codes with any item rewards.</p>
                        </div>
                        <span style="background:rgba(234,179,8,0.2);color:#facc15;border:1px solid #eab308;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:800;">CREATOR ACTIVE</span>
                    </div>

                    <!-- Code Details -->
                    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
                        <div style="flex:1;min-width:200px;">
                            <label style="display:block;font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:4px;">CODE NAME (e.g. VIP2026):</label>
                            <input type="text" id="creator-code-name" placeholder="TYPE NEW CODE..." style="width:100%;box-sizing:border-box;padding:10px 12px;background:#090d16;color:#fff;border:2px solid #eab308;border-radius:8px;font-size:15px;text-transform:uppercase;font-weight:800;">
                        </div>
                        <div style="flex:1;min-width:200px;">
                            <label style="display:block;font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:4px;">DESCRIPTION / NOTE:</label>
                            <input type="text" id="creator-code-desc" placeholder="Special gift pack note..." style="width:100%;box-sizing:border-box;padding:10px 12px;background:#090d16;color:#fff;border:1px solid #334155;border-radius:8px;font-size:14px;">
                        </div>
                    </div>

                    <!-- Items Menu -->
                    <div style="max-height:360px;overflow-y:auto;background:#060a12;border:1px solid #1e293b;border-radius:8px;padding:14px;margin-bottom:16px;">
                        ${sectionsHtml}
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:20px;">
                        <button type="button" onclick="UIController.clearCreatorQuantities()" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;border-radius:8px;padding:10px 18px;font-weight:700;cursor:pointer;font-size:13px;">Reset Quantities</button>
                        <button type="button" onclick="UIController.generateCreatorCode()" class="tactile-green-btn" style="padding:12px 28px;font-size:15px;font-weight:900;letter-spacing:0.5px;">Generate & Publish Code</button>
                    </div>

                    <!-- Code Control Section: Expire & Delete -->
                    <div style="background:#090d16;border:1px solid #334155;border-radius:10px;padding:16px;">
                        <h4 style="margin:0 0 4px 0;color:#38bdf8;font-size:15px;font-weight:800;letter-spacing:0.5px;">ACTIVE & EXPIRED CODES MANAGEMENT</h4>
                        <p style="margin:0 0 12px 0;color:#94a3b8;font-size:12px;">Expire codes to remove from the active Codes tab while keeping on the Wiki, or Delete to permanently wipe test codes.</p>
                        <div style="display:flex;flex-direction:column;gap:8px;">
                            ${manageRowsHtml}
                        </div>
                    </div>
                </div>
            `;
        }
    },

    adjustCreatorQty(itemId, amount) {
        const input = document.getElementById(`creator-qty-${itemId}`);
        if (!input) return;
        const cur = parseInt(input.value, 10) || 0;
        input.value = Math.max(0, cur + amount);
    },

    clearCreatorQuantities() {
        document.querySelectorAll("input[id^='creator-qty-']").forEach(inp => inp.value = 0);
        const nameInp = document.getElementById("creator-code-name");
        if (nameInp) nameInp.value = "";
        const descInp = document.getElementById("creator-code-desc");
        if (descInp) descInp.value = "";
    },

    expireCode(code) {
        if (!window.SaveService) return;
        const res = window.SaveService.expirePromoCode(code);
        if (res.success) {
            this.showToast(`Code "${code}" is now expired.`, "info");
            this.renderCodes();
        } else {
            this.showToast(res.message || "Failed to expire code.", "warning");
        }
    },

    reactivateCode(code) {
        if (!window.SaveService) return;
        const res = window.SaveService.reactivatePromoCode(code);
        if (res.success) {
            this.showToast(`Code "${code}" reactivated!`, "success");
            this.renderCodes();
        } else {
            this.showToast(res.message || "Failed to reactivate code.", "warning");
        }
    },

    deleteCode(code) {
        if (!window.SaveService) return;
        const res = window.SaveService.deletePromoCode(code);
        if (res.success) {
            this.showToast(`Code "${code}" deleted permanently.`, "info");
            this.renderCodes();
        } else {
            this.showToast(res.message || "Failed to delete code.", "warning");
        }
    },

    generateCreatorCode() {
        if (!window.SaveService || !window.SaveService.isCreatorAccount()) {
            this.showToast("Unauthorized. Creator account required.", "warning");
            return;
        }

        const nameInp = document.getElementById("creator-code-name");
        const descInp = document.getElementById("creator-code-desc");
        const codeName = (nameInp ? nameInp.value : "").trim().toUpperCase();

        if (!codeName || codeName.length < 3) {
            this.showToast("Please enter a code name with at least 3 characters!", "warning");
            return;
        }

        const rewards = {};
        let totalItems = 0;

        document.querySelectorAll("input[id^='creator-qty-']").forEach(inp => {
            const qty = parseInt(inp.value, 10) || 0;
            if (qty > 0) {
                const itemId = inp.dataset.itemId;
                const cat = inp.dataset.category;
                const subGroup = inp.dataset.subgroup;

                if (cat === "Currency") {
                    if (itemId === "gems") rewards.gems = qty;
                    else if (itemId === "gold") rewards.gold = qty;
                    else if (itemId === "traitRerolls") rewards.traitRerolls = qty;
                } else if (subGroup === "starFruits") {
                    if (!rewards.starFruits) rewards.starFruits = {};
                    rewards.starFruits[itemId] = qty;
                } else if (subGroup === "food") {
                    if (!rewards.food) rewards.food = {};
                    rewards.food[itemId] = qty;
                } else if (subGroup === "materials") {
                    if (!rewards.materials) rewards.materials = {};
                    rewards.materials[itemId] = qty;
                } else if (subGroup === "potions") {
                    rewards.luckPotions = (rewards.luckPotions || 0) + qty;
                }
                totalItems += qty;
            }
        });

        if (totalItems <= 0) {
            this.showToast("Please select at least 1 item reward for this code!", "warning");
            return;
        }

        if (descInp && descInp.value.trim()) {
            rewards.description = descInp.value.trim();
        }

        const res = window.SaveService.createCustomPromoCode(codeName, rewards);
        if (res.success) {
            if (window.AudioService) window.AudioService.playVictorySound();
            this.showToast(`Code "${codeName}" created and active! Auto-updated in Wiki and AI Bot!`, "success");
            this.clearCreatorQuantities();
            this.renderCodes();
        } else {
            this.showToast(res.message || "Failed to generate code.", "warning");
        }
    },

    redeemPromoCode() {
        const input = document.getElementById("promo-code-input");
        const msg = document.getElementById("promo-code-msg");
        if (!input) return;

        const code = input.value.trim();
        if (!code) {
            if (msg) {
                msg.style.display = "block";
                msg.style.color = "#ef4444";
                msg.textContent = "Please enter a promo code!";
            }
            return;
        }

        const res = window.SaveService.redeemPromoCode(code);
        if (msg) {
            msg.style.display = "block";
            msg.style.color = res.success ? "#22c55e" : "#ef4444";
            msg.textContent = res.message;
        }

        if (res.success) {
            if (window.AudioService) window.AudioService.playUpgradeSound();
            input.value = "";
            this.updateTopBar();
        }
    },

    renderChatbot() {
        const container = document.getElementById("chatbot-messages");
        if (!container || !window.AIChatbot) return;

        let html = "";
        window.AIChatbot.history.forEach(msg => {
            const isUser = msg.role === "user";
            let rawText = msg.text || "";
            // Strip any newlines inside <svg>...</svg> to prevent <br> injection breaking SVG DOM
            rawText = rawText.replace(/<svg[\s\S]*?<\/svg>/gi, m => m.replace(/[\r\n]+/g, ' '));
            const formatted = rawText
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\*(.*?)\*/g, '<i>$1</i>')
                .replace(/\n/g, '<br>');

            html += `
                <div class="chat-msg-row ${isUser ? 'user-row' : 'bot-row'}" style="display:flex;gap:10px;align-items:flex-start;justify-content:${isUser ? 'flex-end' : 'flex-start'};">
                    ${!isUser ? `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 0 8px #38bdf8);">🤖</div>` : ''}
                    <div class="chat-bubble ${isUser ? 'user' : 'bot'}" style="max-width:80%;padding:12px 16px;border-radius:12px;font-size:13.5px;line-height:1.5;background:${isUser ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : '#1e293b'};color:#f8fafc;border:1px solid ${isUser ? '#60a5fa' : '#334155'};box-shadow:0 4px 12px rgba(0,0,0,0.3);">
                        <div>${formatted}</div>
                        ${(msg.links && msg.links.length > 0) ? `
                            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);">
                                ${msg.links.map(lnk => {
                                    if (lnk.action === "openSettings") {
                                        return `<button class="bot-nav-link" onclick="UIController.openSettingsModal()">${lnk.label}</button>`;
                                    }
                                    return `<button class="bot-nav-link" onclick="UIController.switchTab('${lnk.tab}')">${lnk.label}</button>`;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                    ${isUser ? `<div style="font-size:24px;line-height:1;">👤</div>` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    },

    sendChatbotQuery(query) {
        const input = document.getElementById("chatbot-input");
        if (input) input.value = query;
        this.submitChatbotMessage();
    },

    submitChatbotMessage() {
        const input = document.getElementById("chatbot-input");
        if (!input) return;
        const query = (input.value || "").trim();
        if (!query || !window.AIChatbot) return;

        input.value = "";
        window.AIChatbot.ask(query);
        if (window.AudioService) window.AudioService.playPlaceSound();
        this.renderChatbot();
    },

    renderWiki() {
        if (window.WikiController) {
            window.WikiController.render();
        }
    },

    openAuthModal() {
        const modal = document.getElementById("auth-gateway-modal");
        if (!modal) return;
        this.renderAuthModal();
        modal.style.display = "flex";
        modal.classList.add("open");
    },

    closeAuthModal() {
        const googleUser = window.SaveService && window.SaveService.getGoogleUser();
        if (!googleUser) {
            this.showToast("Please sign in with Google to play!", "warning");
            return;
        }
        const profile = window.SaveService && window.SaveService.getUserProfile();
        if (!profile || !profile.usernameChosen || !profile.name || !profile.name.trim()) {
            this.showToast("You must choose a username to start playing!", "warning");
            return;
        }
        const modal = document.getElementById("auth-gateway-modal");
        if (modal) {
            modal.style.display = "none";
            modal.classList.remove("open");
        }
    },

    renderAuthModal() {
        const container = document.getElementById("auth-gateway-content");
        if (!container) return;

        const googleUser = window.SaveService && window.SaveService.getGoogleUser();
        const profile = window.SaveService ? window.SaveService.getUserProfile() : null;

        if (!googleUser) {
            container.innerHTML = `
                <div style="display:flex;justify-content:center;margin-bottom:18px;">
                    <div style="width:56px;height:56px;border-radius:16px;background:#1e293b;border:1px solid #334155;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5);">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                    </div>
                </div>
                <h2 style="color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;margin-bottom:8px;">Welcome back</h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.5;margin-bottom:28px;">
                    Sign in with your Google account to save your game progress, units, and gems.
                </p>

                <!-- 1-CLICK GOOGLE SIGN IN BUTTON -->
                <button onclick="UIController.handleContinueWithGoogle()" style="width:100%;height:52px;background:#0f172a;color:#f8fafc;border:1px solid #38bdf8;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;transition:all 0.2s ease;box-shadow:0 0 20px rgba(56,189,248,0.25);" onmouseover="this.style.background='#1e293b';this.style.boxShadow='0 0 25px rgba(56,189,248,0.45)';" onmouseout="this.style.background='#0f172a';this.style.boxShadow='0 0 20px rgba(56,189,248,0.25)';">
                    <svg width="22" height="22" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.1-6.71-4.93H1.25v3.14C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.29 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.41l4.04-3.14z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.59l4.04 3.14c.95-2.83 3.59-4.98 6.71-4.98z"/>
                    </svg>
                    <span>Continue with Google</span>
                </button>
            `;
        } else if (!profile || !profile.usernameChosen || !profile.name || !profile.name.trim()) {
            // Screen 2: Logged in, BUT MUST CHOOSE USERNAME BEFORE PLAYING!
            container.innerHTML = `
                <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:10px;text-align:left;">
                        <div style="width:32px;height:32px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;">
                            ${(googleUser.name || "G")[0].toUpperCase()}
                        </div>
                        <div style="font-size:12px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;max-width:200px;white-space:nowrap;">
                            ${googleUser.email}
                        </div>
                    </div>
                    <button onclick="UIController.handleLogout()" style="background:transparent;color:#ef4444;border:none;font-size:11px;font-weight:700;cursor:pointer;padding:4px 6px;">
                        Switch Account
                    </button>
                </div>

                <div style="display:flex;justify-content:center;margin-bottom:14px;">
                    <div style="width:64px;height:64px;border-radius:20px;background:#0f172a;border:2px solid #38bdf8;display:flex;align-items:center;justify-content:center;box-shadow:0 0 25px rgba(56,189,248,0.3);font-size:30px;">
                        ⚔️
                    </div>
                </div>

                <h2 style="color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px;margin-bottom:6px;">Choose Your Username</h2>
                <p style="color:#94a3b8;font-size:13px;line-height:1.4;margin-bottom:22px;">
                    Enter your username to start playing. You cannot proceed without choosing a username.
                </p>

                <div style="margin-bottom:20px;text-align:left;">
                    <label style="display:block;font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:6px;letter-spacing:0.5px;">USERNAME</label>
                    <input id="choose-username-input" type="text" maxlength="16" placeholder="Enter username (3-16 chars)" style="width:100%;height:50px;background:#0f172a;border:2px solid #334155;border-radius:12px;padding:0 16px;color:#f8fafc;font-size:15px;font-weight:700;box-sizing:border-box;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='#334155'" onkeydown="if(event.key==='Enter') UIController.handleConfirmUsername();" />
                    <div id="username-error-msg" style="display:none;color:#ef4444;font-size:12px;font-weight:700;margin-top:6px;"></div>
                </div>

                <button onclick="UIController.handleConfirmUsername()" style="width:100%;height:52px;background:#2563eb;color:#fff;border:none;border-radius:12px;font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 0 25px rgba(37,99,235,0.45);transition:all 0.2s ease;" onmouseover="this.style.background='#1d4ed8';" onmouseout="this.style.background='#2563eb';">
                    Confirm Username & Start Playing ▶
                </button>
            `;

            setTimeout(() => {
                const inp = document.getElementById("choose-username-input");
                if (inp) inp.focus();
            }, 100);
        } else {
            // Screen 3: Logged in and username chosen — Single Profile View
            const state = window.SaveService.state || {};
            const pLevel = state.playerLevel || 1;
            container.innerHTML = `
                <div style="display:flex;justify-content:center;margin-bottom:16px;">
                    <div style="width:60px;height:60px;border-radius:50%;background:#0284c7;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;border:3px solid #38bdf8;box-shadow:0 0 20px rgba(56,189,248,0.4);">
                        ${profile.name[0].toUpperCase()}
                    </div>
                </div>

                <h2 style="color:#facc15;font-size:22px;font-weight:900;margin-bottom:4px;">${profile.name}</h2>
                <div style="font-size:12px;color:#94a3b8;margin-bottom:18px;">Level ${pLevel} • ${googleUser.email}</div>

                <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">
                    <button onclick="UIController.closeAuthModal()" style="width:100%;height:48px;background:#22c55e;color:#000;border:none;border-radius:12px;font-weight:900;font-size:15px;cursor:pointer;box-shadow:0 0 20px rgba(34,197,94,0.35);transition:all 0.2s ease;">
                        Go Back
                    </button>
                    <button onclick="UIController.handleLogout()" style="width:100%;height:44px;background:#1e293b;color:#ef4444;border:1px solid #334155;border-radius:12px;font-weight:800;font-size:13px;cursor:pointer;transition:all 0.2s ease;">
                        Log Out
                    </button>
                </div>
            `;
        }
    },

    checkGoogleOAuthCallback() {
        if (!window.location.hash) return;
        const hash = window.location.hash.substring(1);
        if (!hash.includes("id_token=") && !hash.includes("access_token=")) return;

        try {
            const params = new URLSearchParams(hash);
            const idToken = params.get("id_token");
            if (idToken) {
                const base64Url = idToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                const payload = JSON.parse(jsonPayload);

                if (payload && payload.email) {
                    const cleanEmail = payload.email.toLowerCase();
                    const userObj = {
                        id: "google_" + cleanEmail.replace(/[^a-z0-9]/g, "_").slice(0, 20),
                        email: cleanEmail,
                        name: payload.name || cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                        avatar: payload.picture || "https://lh3.googleusercontent.com/a/default-user",
                        provider: "google"
                    };
                    window.SaveService.setGoogleUser(userObj);
                    window.SaveService.pushToSupabaseAsync();

                    const profile = window.SaveService.getUserProfile();
                    this.updateTopBar();
                    this.renderStages();
                    this.renderBanners();
                    this.renderInventory();

                    if (profile && profile.usernameChosen && profile.name && profile.name.trim()) {
                        this.closeAuthModal();
                        this.showToast("Welcome back, " + profile.name + "!", "success");
                    } else {
                        // Open and enforce username selection screen!
                        this.openAuthModal();
                    }
                }
            }
        } catch (e) {
            console.error("[PTD] Failed to parse Google OAuth callback:", e);
        } finally {
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, null, window.location.pathname);
            }
        }
    },

    handleContinueWithGoogle() {
        this.showToast("Opening Google Sign-In...", "info");
        const clientId = "514483287401-c16joefvhh30fjilurp8dp89fio55e9t.apps.googleusercontent.com";
        const redirectUri = window.location.origin + "/";
        const nonce = "ptd_" + Date.now();
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${nonce}&prompt=select_account`;
        window.location.href = authUrl;
    },

    handleLogout() {
        window.SaveService.logout();
        this.renderAuthModal();
        this.updateTopBar();
        this.showToast("Logged out successfully.", "info");
    },

    handleConfirmUsername() {
        const input = document.getElementById("choose-username-input");
        const errorDiv = document.getElementById("username-error-msg");
        if (!input) return;

        const name = input.value.trim();
        if (!name || name.length < 3) {
            if (errorDiv) {
                errorDiv.innerText = "Username must be at least 3 characters long.";
                errorDiv.style.display = "block";
            }
            input.focus();
            return;
        }

        if (name.length > 16) {
            if (errorDiv) {
                errorDiv.innerText = "Username cannot exceed 16 characters.";
                errorDiv.style.display = "block";
            }
            input.focus();
            return;
        }

        if (!/^[a-zA-Z0-9_ ]+$/.test(name)) {
            if (errorDiv) {
                errorDiv.innerText = "Only letters, numbers, spaces, and underscores allowed.";
                errorDiv.style.display = "block";
            }
            input.focus();
            return;
        }

        const prof = window.SaveService.setUsername(name);
        this.updateTopBar();
        this.renderStages();
        this.renderBanners();
        this.renderInventory();
        this.closeAuthModal();
        this.showToast("Welcome, " + prof.name + "!", "success");
    },

    closeAllModals() {
        document.querySelectorAll(".modal-overlay").forEach(m => {
            if (m.id === "auth-gateway-modal") {
                const googleUser = window.SaveService && window.SaveService.getGoogleUser();
                const profile = window.SaveService && window.SaveService.getUserProfile();
                if (!googleUser || !profile || !profile.usernameChosen) return; // do not close auth modal if not logged in or username not chosen!
            }
            m.classList.remove("open");
            m.style.display = "none";
        });
    }
};

if (typeof window !== 'undefined') {
    window.UIController = UIController;
}


// Global PC Keyboard Shortcuts (X = Sell, R = Upgrade, 1-6 = Select Deploy Slot)
if (typeof window !== 'undefined') {
    window.addEventListener("keydown", (e) => {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable);
        if (isTyping) return;

        const ce = window.CombatEngine;
        if (!ce || !ce.isActive) return;

        const key = e.key;

        // Keys 1-6: Select Unit to Place from Equipped Hotbar
        if (key >= "1" && key <= "6") {
            const slotIndex = parseInt(key, 10) - 1;
            const state = window.SaveService && window.SaveService.state;
            const equippedIds = state && Array.isArray(state.equippedUnits) ? state.equippedUnits : [];
            if (equippedIds[slotIndex]) {
                const u = state.inventoryUnits.find(unit => unit.id === equippedIds[slotIndex]);
                if (u) {
                    const conf = window.UNIT_CONFIG[u.unitId];
                    const limit = conf ? (conf.maxPlacements || 4) : 4;
                    const placedCount = ce.placedUnits.filter(p => p.config.id === conf.id).length;
                    if (placedCount >= limit) {
                        if (window.UIController && window.UIController.showToast) {
                            window.UIController.showToast(`Placement limit reached (Max ${limit} for ${conf.name})!`, "warning");
                        }
                    } else {
                        if (window.UIController) {
                            window.UIController.selectUnitToDeploy(u.id);
                        }
                    }
                }
            }
            return;
        }

        // 'x' or 'X': Sell selected unit
        if (key === "x" || key === "X") {
            if (ce.selectedPlacedUnit && window.UIController) {
                window.UIController.sellSelectedUnit(ce.selectedPlacedUnit.id);
            }
            return;
        }

        // 'r' or 'R': Upgrade selected unit
        if (key === "r" || key === "R") {
            if (ce.selectedPlacedUnit && window.UIController) {
                window.UIController.upgradeSelectedUnit(ce.selectedPlacedUnit.id);
            }
            return;
        }
    });
}
