// Pixel Tower Defense — Real-Time 2D Combat Engine
// Strictly enforces Ground, Hill, Hybrid, Soaring, Flying Targeting, and Damage Modifiers

const CombatEngine = {
    canvas: null,
    ctx: null,
    animationId: null,

    // Match State
    isActive: false,
    isPaused: false,
    gameSpeed: 1, // 1x, 2x, 3x
    autoStartWave: true,

    // Map & Dimensions (800x500 virtual canvas resolution)
    WIDTH: 800,
    HEIGHT: 500,
    TILE_SIZE: 50, // 16 cols x 10 rows

    // Base Health & In-match Currency
    baseHp: 3,
    matchCash: 500,

    // Waves & Timer
    currentWave: 0,
    totalWaves: 10,
    waveState: "intermission", // "intermission", "spawning", "clearing", "gameover", "victory"
    intermissionTimer: 5,
    spawnQueue: [],
    spawnTimer: 0,

    // Active Entities
    placedUnits: [],
    activeEnemies: [],
    activeProjectiles: [],
    floatingTexts: [],
    visualEffects: [],

    // Stage & Map Data
    currentStageId: "world1_act1",
    isHardMode: false,
    stageConfig: null,
    mapTiles: [], // 10 rows x 16 cols: 'ground', 'hill', 'road'
    pathWaypoints: [],

    // Placement & Ability Cursor
    selectedUnitToPlace: null,
    selectedPlacedUnit: null,
    hoverTile: { col: -1, row: -1 },
    mousePos: { x: 0, y: 0 },
    activeAbilityTargeting: null,
    pendingActiveAbilities: [],

    imgCache: {},
    getImage(url) {
        if (!this.imgCache[url]) {
            const img = new Image();
            img.src = url;
            this.imgCache[url] = img;
        }
        return this.imgCache[url];
    },

    // Initialize Combat Engine
    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.setupInputListeners();
    },

    // Generates map layout for current stage
    buildMap(stageId) {
        this.mapTiles = [];
        this.pathWaypoints = [
            { x: -20, y: 150 },
            { x: 175, y: 150 },
            { x: 175, y: 350 },
            { x: 425, y: 350 },
            { x: 425, y: 150 },
            { x: 625, y: 150 },
            { x: 625, y: 350 },
            { x: 765, y: 350 }
        ];

        // Fill grid: 'ground', 'hill', 'road'
        for (let r = 0; r < 10; r++) {
            this.mapTiles[r] = [];
            for (let c = 0; c < 16; c++) {
                this.mapTiles[r][c] = 'ground';
            }
        }

        // Mark Road tiles along waypoints
        const markRoad = (c, r) => {
            if (r >= 0 && r < 10 && c >= 0 && c < 16) {
                this.mapTiles[r][c] = 'road';
            }
        };

        // Horizontal 1: row 3 (y=150)
        for (let c = 0; c <= 3; c++) markRoad(c, 3);
        // Vertical 1: col 3, rows 3-7
        for (let r = 3; r <= 7; r++) markRoad(3, r);
        // Horizontal 2: row 7, cols 3-8
        for (let c = 3; c <= 8; c++) markRoad(c, 7);
        // Vertical 2: col 8, rows 3-7
        for (let r = 3; r <= 7; r++) markRoad(8, r);
        // Horizontal 3: row 3, cols 8-12
        for (let c = 8; c <= 12; c++) markRoad(c, 3);
        // Vertical 3: col 12, rows 3-7
        for (let r = 3; r <= 7; r++) markRoad(12, r);
        // Horizontal 4: row 7, cols 12-15
        for (let c = 12; c < 16; c++) markRoad(c, 7);

        // Place Hills strategically near roads (cliffs for vantage & Soaring)
        const hillCoords = [
            { c: 1, r: 1 }, { c: 2, r: 1 }, { c: 1, r: 2 },
            { c: 5, r: 4 }, { c: 6, r: 4 }, { c: 5, r: 5 }, { c: 6, r: 5 },
            { c: 10, r: 4 }, { c: 11, r: 4 }, { c: 10, r: 5 },
            { c: 14, r: 1 }, { c: 14, r: 2 }, { c: 14, r: 5 }
        ];
        hillCoords.forEach(h => {
            if (this.mapTiles[h.r] && this.mapTiles[h.r][h.c] !== 'road') {
                this.mapTiles[h.r][h.c] = 'hill';
            }
        });
    },

    // Start a match
    startMatch(stageId, isHard = false, challengeOptions = null) {
        this.currentStageId = stageId;
        this.isHardMode = isHard;
        this.challengeOptions = challengeOptions;
        this.isChallenge = !!challengeOptions;
        this.stageConfig = window.STAGE_CONFIG[stageId] || window.STAGE_CONFIG["world1_act1"];
        this.buildMap(stageId);

        const diffConfig = isHard ? this.stageConfig.hard : this.stageConfig.normal;
        this.baseHp = 3;
        // Starting Yen: strictly 3,000 across ALL game modes
        this.matchCash = 3000;
        this.matchYen = 3000;
        this.currentWave = 0;
        this.totalWaves = challengeOptions ? challengeOptions.totalWaves : (this.stageConfig.isInfinite ? 999 : 15);
        
        // Ready / Preparation Phase with 60-second countdown
        this.isReadyPhase = true;
        this.readyTimer = 60;
        this.waveState = "ready_phase";
        this.intermissionTimer = 0;

        // Apply default speed from settings
        const savedSettings = (window.SaveService && window.SaveService.state && window.SaveService.state.settings) || {};
        this.gameSpeed = savedSettings.defaultSpeed || 1;

        const readyBanner = document.getElementById("battle-ready-banner");
        if (readyBanner) {
            readyBanner.style.display = "flex";
            const timerEl = document.getElementById("battle-ready-timer");
            if (timerEl) timerEl.textContent = "60s";
        }

        this.placedUnits = [];
        this.activeEnemies = [];
        this.activeProjectiles = [];
        this.floatingTexts = [];
        this.visualEffects = [];
        this.selectedUnitToPlace = null;
        this.selectedPlacedUnit = null;
        this.activeAbilityTargeting = null;
        this.pendingActiveAbilities = [];
        this.alliedMinions = [];

        this.isActive = true;
        this.isPaused = false;

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.lastTime = performance.now();
        this.gameLoop();

        if (window.UIController) {
            window.UIController.updateBattleHUD();
        }
    },

    startBattleWaves() {
        if (!this.isReadyPhase) return;
        this.isReadyPhase = false;
        const readyBanner = document.getElementById("battle-ready-banner");
        if (readyBanner) readyBanner.style.display = "none";
        this.waveState = "intermission";
        this.intermissionTimer = 1.0;
        if (window.AudioService) window.AudioService.playPlaceSound();
        if (window.UIController) window.UIController.updateBattleHUD();
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.addFloatingText(this.WIDTH / 2, 220, "⏸️ MATCH PAUSED", "#facc15", 26);
        } else {
            this.addFloatingText(this.WIDTH / 2, 220, "▶️ RESUMED", "#22c55e", 22);
        }
        if (window.UIController) window.UIController.updateBattleHUD();
    },

    // Canvas Input Handlers
    setupInputListeners() {
        if (!this.canvas) return;

        const getCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.WIDTH / rect.width;
            const scaleY = this.HEIGHT / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        };

        this.canvas.addEventListener('mousemove', (e) => {
            const coords = getCoords(e);
            this.mousePos = coords;
            this.hoverTile.col = Math.floor(coords.x / this.TILE_SIZE);
            this.hoverTile.row = Math.floor(coords.y / this.TILE_SIZE);
        });

        this.canvas.addEventListener('click', (e) => {
            const coords = getCoords(e);
            this.handleClick(coords.x, coords.y);
        });
    },

    handleClick(x, y) {
        // 0. If actively targeting an active ability (e.g. Heavenly Meteor)
        if (this.activeAbilityTargeting) {
            this.castActiveAbility(this.activeAbilityTargeting.placedUnit, x, y);
            return;
        }

        const col = Math.floor(x / this.TILE_SIZE);
        const row = Math.floor(y / this.TILE_SIZE);

        if (col < 0 || col >= 16 || row < 0 || row >= 10) return;

        // 1. If currently trying to place a unit from inventory
        if (this.selectedUnitToPlace) {
            this.attemptPlacement(col, row);
            return;
        }

        // 2. Check if clicked an existing placed unit
        const clickedUnit = this.placedUnits.find(u => u.col === col && u.row === row);
        if (clickedUnit) {
            this.selectedPlacedUnit = clickedUnit;
            if (window.UIController) {
                window.UIController.showUnitInspector(clickedUnit);
            }
        } else {
            this.selectedPlacedUnit = null;
        this.alliedMinions = [];
            if (window.UIController) {
                window.UIController.hideUnitInspector();
            }
        }
    },

    // Strict Placement Rules
    canPlaceUnitOnTile(unitConfig, col, row) {
        if (col < 0 || col >= 16 || row < 0 || row >= 10) return { valid: false, reason: "Out of bounds" };

        const tileType = this.mapTiles[row][col];
        if (tileType === 'road') {
            return { valid: false, reason: "Cannot place on Enemy Road" };
        }

        // Check if another unit is already placed there
        const occupied = this.placedUnits.some(u => u.col === col && u.row === row);
        if (occupied) {
            return { valid: false, reason: "Tile is already occupied" };
        }

        // Check unit placement limit
        const limit = unitConfig.maxPlacements || 4;
        const currentCount = this.placedUnits.filter(u => u.config.id === unitConfig.id).length;
        if (currentCount >= limit) {
            return { valid: false, reason: `Placement limit reached (Max ${limit} ${unitConfig.name})!` };
        }

        // Check Unique limit (unique unit or Unique trait, max 1)
        if (unitConfig.isUnique || this.selectedUnitToPlace.trait === "Unique") {
            const sameUniqueCount = this.placedUnits.filter(u => u.config.id === unitConfig.id || (u.unitInstance.unitId === this.selectedUnitToPlace.unitId && u.unitInstance.trait === "Unique")).length;
            if (sameUniqueCount >= 1) {
                return { valid: false, reason: "Unique unit limit: Max 1 placement allowed!" };
            }
        }

        // Placement rules: Ground, Hill, Hybrid
        if (unitConfig.placement === "Ground" && tileType !== "ground") {
            return { valid: false, reason: "Ground units can ONLY be placed on Ground tiles!" };
        }
        if (unitConfig.placement === "Hill" && tileType !== "hill") {
            return { valid: false, reason: "Hill units can ONLY be placed on Hill tiles!" };
        }
        if (unitConfig.placement === "Hybrid") {
            // Can be placed on Ground OR Hill
            return { valid: true, isHill: (tileType === "hill") };
        }

        return { valid: true, isHill: (tileType === "hill") };
    },

    attemptPlacement(col, row) {
        if (!this.selectedUnitToPlace) return;
        const unitInstance = this.selectedUnitToPlace;
        const unitConfig = window.UNIT_CONFIG[unitInstance.unitId];

        const check = this.canPlaceUnitOnTile(unitConfig, col, row);
        if (!check.valid) {
            this.addFloatingText(col * this.TILE_SIZE + 25, row * this.TILE_SIZE + 25, check.reason, "#ef4444");
            return;
        }

        if (this.matchCash < unitConfig.baseCost) {
            this.addFloatingText(col * this.TILE_SIZE + 25, row * this.TILE_SIZE + 25, "Need $" + unitConfig.baseCost, "#ef4444");
            return;
        }

        // Deduct in-match cash
        this.matchCash -= unitConfig.baseCost;

        // Is Soaring activated?
        // Rules: Soaring requires Hill placement!
        // Hybrid unit only activates Soaring when on Hill!
        // Ground unit cannot activate Soaring!
        const isHill = (this.mapTiles[row][col] === 'hill');
        const effectiveStats = window.TraitEngine.calculateEffectiveStats(
            unitConfig,
            0,
            unitInstance.trait,
            isHill,
            unitInstance.level || 1
        );

        const newPlacement = {
            id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            unitInstance: unitInstance,
            config: unitConfig,
            col: col,
            row: row,
            x: col * this.TILE_SIZE + this.TILE_SIZE / 2,
            y: row * this.TILE_SIZE + this.TILE_SIZE / 2,
            isHill: isHill,
            upgradeLevel: 0,
            stats: effectiveStats,
            targetMode: "First", // First, Last, Strongest, Closest
            cooldown: 0,
            abilityCooldown: 0,
            activeAbility: unitConfig.activeAbility || null,
            totalDamageDealt: 0,
            kills: 0
        };

        this.placedUnits.push(newPlacement);
        this.selectedUnitToPlace = null; // Reset selection
        if (window.AudioService) window.AudioService.playPlaceSound();

        if (window.UIController) {
            window.UIController.updateBattleHUD();
            window.UIController.renderUnitDeploymentBar();
        }
    },

    // Upgrades a placed unit
    upgradePlacedUnit(placedUnit) {
        const nextLevel = placedUnit.upgradeLevel + 1;
        if (!placedUnit.config.upgrades || nextLevel > placedUnit.config.upgrades.length) {
            return { success: false, message: "Max level reached!" };
        }

        const upgradeInfo = placedUnit.config.upgrades[nextLevel - 1];
        if (this.matchCash < upgradeInfo.cost) {
            return { success: false, message: `Need $${upgradeInfo.cost}` };
        }

        this.matchCash -= upgradeInfo.cost;
        placedUnit.upgradeLevel = nextLevel;
        placedUnit.stats = window.TraitEngine.calculateEffectiveStats(
            placedUnit.config,
            placedUnit.upgradeLevel,
            placedUnit.unitInstance.trait,
            placedUnit.isHill,
            placedUnit.unitInstance.level || 1
        );

        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.addFloatingText(placedUnit.x, placedUnit.y - 20, "UPGRADE!", "#22c55e");

        if (window.UIController) {
            window.UIController.updateBattleHUD();
            window.UIController.showUnitInspector(placedUnit);
        }
        return { success: true };
    },

    // Sells placed unit inside the match (returns 70% in-match cash)
    sellPlacedUnit(placedUnit) {
        const idx = this.placedUnits.indexOf(placedUnit);
        if (idx !== -1) {
            let totalInvested = placedUnit.config.baseCost;
            for (let i = 0; i < placedUnit.upgradeLevel; i++) {
                totalInvested += placedUnit.config.upgrades[i].cost;
            }
            // In-game placed unit selling refunds 50% of total Yen invested
            const refundCash = Math.floor(totalInvested * 0.50);
            this.matchCash += refundCash;
            this.placedUnits.splice(idx, 1);
            this.selectedPlacedUnit = null;
        this.alliedMinions = [];

            if (window.AudioService) window.AudioService.playSellSound();
            if (window.UIController) {
                window.UIController.updateBattleHUD();
                window.UIController.renderUnitDeploymentBar();
                window.UIController.hideUnitInspector();
            }
        }
    },

    // ----------------------------------------------------
    // ACTIVE ABILITIES (Player-Triggered Map Targeting & Casting)
    // ----------------------------------------------------
    startAbilityTargeting(placedUnit) {
        if (!placedUnit || !placedUnit.activeAbility) return;
        if (placedUnit.abilityCooldown > 0) {
            if (window.UIController) {
                window.UIController.showToast(`Ability on cooldown (${Math.ceil(placedUnit.abilityCooldown)}s remaining)`, "warning");
            }
            return;
        }
        this.activeAbilityTargeting = { placedUnit: placedUnit };
        if (window.UIController) {
            window.UIController.showToast("☄️ SELECT METEOR IMPACT ZONE (Click anywhere on the map)", "info");
            window.UIController.updateBattleHUD();
        }
    },

    cancelAbilityTargeting() {
        this.activeAbilityTargeting = null;
        if (window.UIController) window.UIController.updateBattleHUD();
    },

    castActiveAbility(placedUnit, targetX, targetY) {
        if (!placedUnit || !placedUnit.activeAbility) return;
        const ability = placedUnit.activeAbility;

        // Put ability on 120s cooldown
        placedUnit.abilityCooldown = ability.cooldownSeconds || 120;

        // Create pending celestial meteor strike (takes 5.0s to drop)
        this.pendingActiveAbilities = this.pendingActiveAbilities || [];
        this.pendingActiveAbilities.push({
            id: "meteor_" + Date.now(),
            unit: placedUnit,
            ability: ability,
            x: targetX,
            y: targetY,
            radius: ability.aoeRadius || 160,
            damageMultiplier: ability.damageMultiplier || 3.5,
            delayTimer: ability.delaySeconds || 5.0,
            initialDelay: ability.delaySeconds || 5.0
        });

        this.activeAbilityTargeting = null;
        if (window.AudioService) window.AudioService.playSummonSound();
        this.addFloatingText(targetX, targetY - 20, "☄️ HEAVENLY METEOR INCOMING (5s)!", "#f97316", 16);

        if (window.UIController) {
            window.UIController.showToast("☄️ Celestial Meteor summoned! Impact in 5 seconds!", "success");
            window.UIController.updateBattleHUD();
            if (this.selectedPlacedUnit && this.selectedPlacedUnit.id === placedUnit.id) {
                window.UIController.showUnitInspector(placedUnit);
            }
        }
    },

    detonateActiveAbilityMeteor(meteor) {
        const { unit, ability, x, y, radius, damageMultiplier } = meteor;
        const damage = Math.round((unit.stats ? unit.stats.damage : 750) * damageMultiplier);

        // Screen shake effect
        this.screenShake = 0.6;

        // Visual effects: Colossal fire impact shockwave and crater particles
        this.visualEffects.push({
            type: "meteor_impact",
            x: x,
            y: y,
            radius: radius,
            maxRadius: radius,
            duration: 1.2,
            initialDuration: 1.2
        });

        // Damage all enemies within 160px AoE radius
        let hitCount = 0;
        for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
            const e = this.activeEnemies[i];
            const dist = Math.hypot(e.x - x, e.y - y);
            if (dist <= radius) {
                hitCount++;
                this.damageEnemy(e, damage, unit);

                // Apply 100% Black Flames burn over 3 seconds
                e.burnTimer = 3.0;
                e.burnDps = (e.burnDps || 0) + (damage * 0.33);
                e.burnColor = "#dc2626";
            }
        }

        if (window.AudioService) {
            window.AudioService.playExplosionSound();
        }
        this.addFloatingText(x, y - 30, `💥 HEAVENLY METEOR: ${damage.toLocaleString()} DMG! (${hitCount} Hits)`, "#facc15", 18);
    },

    // ----------------------------------------------------
    // WAVE ENGINE & SPAWNING
    // ----------------------------------------------------
    startNextWave() {
        this.currentWave++;
        this.hasAutoSkippedWave = false;
        this.waveState = "spawning";
        this.spawnTimer = 0;

        const diffConfig = this.isHardMode ? this.stageConfig.hard : this.stageConfig.normal;
        let hpMultiplier = diffConfig ? diffConfig.baseMobHpMultiplier : 1.0;
        let speedMultiplier = diffConfig ? diffConfig.mobSpeedMultiplier : 1.0;

        if (this.isChallenge && this.challengeOptions) {
            hpMultiplier *= (this.challengeOptions.hpMultiplier || 1.8);
            speedMultiplier *= (this.challengeOptions.speedMultiplier || 1.15);
        }

        this.spawnQueue = [];

        // Story Mode Wave definitions (Uses stage waveEnemies, falling back to normal waves on hard)
        const waveEnemiesList = (diffConfig && diffConfig.waveEnemies) || (this.stageConfig.normal && this.stageConfig.normal.waveEnemies);
        if (waveEnemiesList && waveEnemiesList[this.currentWave - 1]) {
            const waveData = waveEnemiesList[this.currentWave - 1];
            for (let i = 0; i < waveData.count; i++) {
                const enemyType = waveData.enemies[i % waveData.enemies.length];
                this.spawnQueue.push({
                    type: enemyType,
                    delay: i * waveData.interval,
                    hpMult: hpMultiplier,
                    speedMult: speedMultiplier
                });
            }
        } else {
            // Infinite mode or fallback waves (Smoothed progression, progressive tiers)
            let enemyPool = ["grunt", "scout_dasher"];
            if (this.currentWave >= 6) enemyPool.push("armored_golem", "magic_shieldbearer");
            if (this.currentWave >= 11) enemyPool.push("berserker_orc", "flying_harpy");
            if (this.currentWave >= 16) enemyPool.push("soaring_sky_serpent");
            if (this.currentWave >= 21) enemyPool.push("celestial_soarer", "shadow_healer");

            const count = Math.floor(5 + this.currentWave * 1.0);
            const compoundHp = Math.pow(1.045, this.currentWave) * (1 + this.currentWave * 0.015);
            const speedScale = speedMultiplier * Math.min(1.40, 0.95 + this.currentWave * 0.01);

            for (let i = 0; i < count; i++) {
                const type = enemyPool[Math.floor(Math.random() * enemyPool.length)];
                this.spawnQueue.push({
                    type: type,
                    delay: i * 1.10,
                    hpMult: compoundHp * hpMultiplier,
                    speedMult: speedScale
                });
            }

            // Boss every 10 waves in Infinite (Balanced scaling)
            if (this.stageConfig.isInfinite && this.currentWave % 10 === 0) {
                this.spawnQueue.push({
                    type: "abyssal_colossus",
                    delay: count * 1.10 + 1.5,
                    hpMult: compoundHp * hpMultiplier * 0.85,
                    speedMult: 0.75
                });
            }
        }

        // World 1 & World 2 Ironclad Aerial Ban: ZERO flying or soaring enemies in World 1 and 2
        const isWorld1or2 = this.stageConfig && (this.stageConfig.worldId === "world_1" || this.stageConfig.worldId === "world_2");
        if (isWorld1or2) {
            this.spawnQueue.forEach(item => {
                const cfg = window.ENEMY_CONFIG && window.ENEMY_CONFIG[item.type];
                if (cfg && (cfg.isFlying || cfg.isSoaring)) {
                    item.type = "armored_golem";
                }
            });
        }

        // Story and Legend stages: Bosses will ONLY spawn at last wave (wave 15)!
        const isStoryOrLegend = this.stageConfig && (this.stageConfig.isLegend || (this.stageConfig.worldId && !this.stageConfig.isInfinite && !this.stageConfig.isEvent));
        if (isStoryOrLegend) {
            if (this.currentWave < 15) {
                // Strip any boss enemy from spawnQueue if before wave 15
                this.spawnQueue = this.spawnQueue.filter(item => {
                    const cfg = window.ENEMY_CONFIG && window.ENEMY_CONFIG[item.type];
                    return !cfg || !cfg.isBoss;
                });
            } else if (this.currentWave === 15) {
                // On final wave 15, ensure the boss is present
                const hasExistingBoss = this.spawnQueue.some(item => {
                    const cfg = window.ENEMY_CONFIG && window.ENEMY_CONFIG[item.type];
                    return cfg && cfg.isBoss;
                });
                if (!hasExistingBoss && (this.stageConfig.hasBoss || this.stageConfig.isLegend)) {
                    this.spawnQueue.push({
                        type: this.stageConfig.bossId || (this.stageConfig.isLegend ? "abyssal_colossus" : "world_boss_demon"),
                        delay: 4.0,
                        hpMult: hpMultiplier,
                        speedMult: speedMultiplier
                    });
                }
            }
        } else {
            // General Boss spawn for other modes
            if (this.stageConfig.hasBoss && this.currentWave === this.totalWaves) {
                this.spawnQueue.push({
                    type: this.stageConfig.bossId || "world_boss_demon",
                    delay: 5.0,
                    hpMult: hpMultiplier,
                    speedMult: speedMultiplier
                });
            }
        }

        if (window.UIController) {
            window.UIController.updateBattleHUD();
        }
    },

    spawnEnemy(spawnItem) {
        const config = window.ENEMY_CONFIG[spawnItem.type] || window.ENEMY_CONFIG["grunt"];
        let totalHp = config.baseHp * spawnItem.hpMult;
        let totalSpeed = config.speed * spawnItem.speedMult;

        // Apply stage modifiers to enemy
        const diffConfig = this.isHardMode ? this.stageConfig.hard : this.stageConfig.normal;
        if (diffConfig && diffConfig.modifier) {
            if (config.isFlying && diffConfig.modifier.flyingMobHpBonus) {
                totalHp *= (1 + diffConfig.modifier.flyingMobHpBonus);
            }
            if (config.isBoss && diffConfig.modifier.bossHpBonus) {
                totalHp *= (1 + diffConfig.modifier.bossHpBonus);
            }
            if (diffConfig.modifier.mobSpeedBonus) {
                totalSpeed *= (1 + diffConfig.modifier.mobSpeedBonus);
            }
        }

        const enemy = {
            id: 'e_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            config: config,
            type: spawnItem.type,
            maxHp: Math.round(totalHp),
            hp: Math.round(totalHp),
            speed: totalSpeed,
            baseSpeed: totalSpeed,
            isFlying: config.isFlying,
            isSoaring: !!config.isSoaring,
            isBoss: config.isBoss,
            waypointIndex: 0,
            x: this.pathWaypoints[0].x,
            y: this.pathWaypoints[0].y,
            slowTimer: 0,
            healCooldown: config.healCooldown || 0
        };

        this.activeEnemies.push(enemy);
    },

    // ----------------------------------------------------
    // COMBAT & DAMAGE COMPUTATION
    // ----------------------------------------------------
    updateCombat(dt) {
        // 0. Process Active Ability Cooldowns & Pending Delays
        for (const unit of this.placedUnits) {
            if (unit.abilityCooldown > 0) {
                unit.abilityCooldown = Math.max(0, unit.abilityCooldown - dt);
            }
        }

        this.pendingActiveAbilities = this.pendingActiveAbilities || [];
        for (let i = this.pendingActiveAbilities.length - 1; i >= 0; i--) {
            const pa = this.pendingActiveAbilities[i];
            pa.delayTimer -= dt;
            if (pa.delayTimer <= 0) {
                this.detonateActiveAbilityMeteor(pa);
                this.pendingActiveAbilities.splice(i, 1);
            }
        }

        // 1. Process Placed Units Attack Loop
        for (const unit of this.placedUnits) {
            unit.cooldown -= dt;
            if (unit.cooldown <= 0) {
                if (unit.config.id === "commander") {
                    // Commander summons horses even if enemy not in range
                    this.spawnCommanderCavalry(unit);
                    unit.cooldown = unit.stats.spa;
                } else {
                    const target = this.findTargetForUnit(unit);
                    if (target) {
                        this.executeUnitAttack(unit, target);
                        unit.cooldown = unit.stats.spa;
                    }
                }
            }
        }

        // 2. Process Projectiles
        for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
            const p = this.activeProjectiles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.lifetime -= dt;

            // Check hit target
            const dist = Math.hypot(p.target.x - p.x, p.target.y - p.y);
            if (dist < 15 || p.lifetime <= 0) {
                this.detonateProjectile(p);
                this.activeProjectiles.splice(i, 1);
            }
        }

        // 3. Process Allied Minions (Army of the Fallen & Commander Cavalry)
        this.alliedMinions = this.alliedMinions || [];
        for (let i = this.alliedMinions.length - 1; i >= 0; i--) {
            const minion = this.alliedMinions[i];
            const targetWp = this.pathWaypoints[minion.waypointIndex - 1];
            if (targetWp) {
                const dx = targetWp.x - minion.x;
                const dy = targetWp.y - minion.y;
                const dist = Math.hypot(dx, dy);
                const step = minion.speed * 48 * dt;

                if (dist <= step) {
                    minion.x = targetWp.x;
                    minion.y = targetWp.y;
                    minion.waypointIndex--;
                } else {
                    minion.x += (dx / dist) * step;
                    minion.y += (dy / dist) * step;
                }
            } else {
                // Reached start of track, despawn
                this.alliedMinions.splice(i, 1);
                continue;
            }

            // Check collision with incoming enemies
            for (let j = this.activeEnemies.length - 1; j >= 0; j--) {
                const enemy = this.activeEnemies[j];
                const collisionDist = Math.hypot(enemy.x - minion.x, enemy.y - minion.y);
                if (collisionDist <= 24) {
                    enemy.hp -= minion.damage;
                    this.addFloatingText(enemy.x, enemy.y - 12, minion.damage, minion.type === "cavalry_horse" ? "#38bdf8" : "#ef4444");
                    this.visualEffects.push({ type: "hit_spark", x: enemy.x, y: enemy.y, color: "#38bdf8", duration: 0.2 });

                    if (enemy.hp <= 0) {
                        this.killEnemy(enemy, minion.sourceUnit);
                    }

                    minion.hp--;
                    if (minion.hp <= 0) {
                        this.alliedMinions.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // 4. Process Enemies Movement, Status Effects & Behaviors
        for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
            const enemy = this.activeEnemies[i];

            // Bleed Damage Ticks (Vampire King Blood Curse)
            if (enemy.bleedTimer > 0) {
                enemy.bleedTimer -= dt;
                enemy.bleedTickTimer = (enemy.bleedTickTimer || 2.0) - dt;
                if (enemy.bleedTickTimer <= 0) {
                    enemy.bleedTickTimer = 2.0;
                    const bDmg = Math.max(1, Math.round(enemy.bleedDamagePerTick || 10));
                    enemy.hp -= bDmg;
                    this.addFloatingText(enemy.x, enemy.y - 14, bDmg, "#dc2626");
                    if (enemy.hp <= 0) {
                        this.killEnemy(enemy, enemy.bleedSource);
                        continue;
                    }
                }
            }

            // Burn Damage Ticks (Shinobi Black Flames)
            if (enemy.burnTimer > 0) {
                enemy.burnTimer -= dt;
                enemy.burnTickTimer = (enemy.burnTickTimer || 0.5) - dt;
                if (enemy.burnTickTimer <= 0) {
                    enemy.burnTickTimer = 0.5;
                    const bDmg = Math.max(1, Math.round(enemy.burnDamagePerTick || 10));
                    enemy.hp -= bDmg;
                    this.addFloatingText(enemy.x, enemy.y - 16, bDmg, "#ea580c");
                    if (enemy.hp <= 0) {
                        this.killEnemy(enemy, enemy.burnSource);
                        continue;
                    }
                }
            }

            // Stun Effect (Star Mage Shining Stars / Earth Titan)
            if (enemy.stunTimer > 0) {
                enemy.stunTimer -= dt;
                continue; // Stunned enemies cannot move or act!
            }

            // Speed & Slow effects
            if (enemy.slowTimer > 0) {
                enemy.slowTimer -= dt;
                if (enemy.slowTimer <= 0) {
                    enemy.speed = enemy.baseSpeed;
                }
            }

            // Berserker rage check (<40% HP)
            if (enemy.config.enrageThreshold && (enemy.hp / enemy.maxHp) <= enemy.config.enrageThreshold) {
                enemy.speed = enemy.baseSpeed * (enemy.config.enrageSpeedMultiplier || 1.7);
            }

            // Shaman Healing Aura
            if (enemy.config.healRadius) {
                enemy.healCooldown -= dt;
                if (enemy.healCooldown <= 0) {
                    enemy.healCooldown = enemy.config.healCooldown;
                    this.triggerHealAura(enemy);
                }
            }

            // Waypoint navigation
            const targetWp = this.pathWaypoints[enemy.waypointIndex + 1];
            if (targetWp) {
                const dx = targetWp.x - enemy.x;
                const dy = targetWp.y - enemy.y;
                const dist = Math.hypot(dx, dy);
                const step = enemy.speed * 48 * dt;

                if (dist <= step) {
                    enemy.x = targetWp.x;
                    enemy.y = targetWp.y;
                    enemy.waypointIndex++;
                } else {
                    enemy.x += (dx / dist) * step;
                    enemy.y += (dy / dist) * step;
                }
            } else {
                // Reached the Kingdom Base! Deduct 1 Life (3/3 Lives rule: 1 enemy = -1 life)
                this.baseHp = Math.max(0, this.baseHp - 1);
                this.addFloatingText(740, 330, "-1 LIFE", "#ef4444");
                // Outward hit-away shockwave blast pushing away from base
                this.visualEffects.push({ type: "base_repel_blast", x: 755, y: 350, duration: 0.5 });
                this.activeEnemies.splice(i, 1);

                if (this.baseHp <= 0) {
                    this.triggerGameOver();
                    return;
                }
            }
        }
    },

    // Strict Target Selector (Ground vs Hill vs Hybrid vs Flying vs Soaring)
    findTargetForUnit(unit) {
        const validEnemies = this.activeEnemies.filter(enemy => {
            // Rule: Ground-only units CANNOT attack Flying enemies!
            // Rule: Hybrid can attack Flying on Ground OR Hill!
            // Rule: Hill units can attack Flying!
            if (enemy.isFlying) {
                if (unit.config.placement === "Ground") {
                    return false; // Ground-only unit CANNOT hit flying!
                }
            }

            // Rule: Soaring enemies fly at extreme stratosphere altitude!
            // They can ONLY be targeted by units with active Soaring capability!
            if (enemy.isSoaring) {
                if (!unit.stats || !unit.stats.soaringActive) {
                    return false;
                }
            }

            const dist = Math.hypot(enemy.x - unit.x, enemy.y - unit.y);
            return dist <= unit.stats.range;
        });

        if (validEnemies.length === 0) return null;

        // Apply Targeting Mode: First, Last, Strongest, Closest
        if (unit.targetMode === "First") {
            // Highest waypoint index + closest to next waypoint
            return validEnemies.sort((a, b) => b.waypointIndex - a.waypointIndex)[0];
        } else if (unit.targetMode === "Strongest") {
            return validEnemies.sort((a, b) => b.hp - a.hp)[0];
        } else if (unit.targetMode === "Closest") {
            return validEnemies.sort((a, b) => {
                const distA = Math.hypot(a.x - unit.x, a.y - unit.y);
                const distB = Math.hypot(b.x - unit.x, b.y - unit.y);
                return distA - distB;
            })[0];
        } else {
            // Last
            return validEnemies.sort((a, b) => a.waypointIndex - b.waypointIndex)[0];
        }
    },

    // Fires attack from unit to target
        executeLaserBeam(unit, target) {
        const duration = unit.config.beamDuration || 3.5;
        const ticks = unit.config.beamTicks || 6;
        const tickInterval = duration / ticks;
        const tickDamage = unit.stats.damage / ticks;

        // Visual beam effect
        this.visualEffects.push({
            type: "robot_laser_beam",
            x1: unit.x,
            y1: unit.y,
            x2: target.x,
            y2: target.y,
            target: target,
            duration: duration
        });

        // Channel damage ticks
        for (let t = 0; t < ticks; t++) {
            setTimeout(() => {
                if (!this.isActive || this.isPaused) return;
                // Deal tick damage to all enemies within beam radius
                const angle = Math.atan2(target.y - unit.y, target.x - unit.x);
                this.activeEnemies.forEach(e => {
                    if (e.isFlying && unit.config.placement === "Ground") return;
                    const dist = Math.hypot(e.x - unit.x, e.y - unit.y);
                    if (dist <= unit.stats.range) {
                        const enemyAngle = Math.atan2(e.y - unit.y, e.x - unit.x);
                        if (Math.abs(angle - enemyAngle) < 0.35) {
                            this.applyDamage(unit, e, 1.0 / ticks);
                        }
                    }
                });
            }, t * tickInterval * 1000);
        }
    },
    executeUnitAttack(unit, target) {
        if (window.AudioService) window.AudioService.playShootSound(unit.config.damageType);

        if (unit.config.attackType === "Single" || unit.config.attackType === "Splash") {
            const angle = Math.atan2(target.y - unit.y, target.x - unit.x);
            const speed = 480;
            this.activeProjectiles.push({
                x: unit.x,
                y: unit.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                target: target,
                unit: unit,
                lifetime: 1.5
            });
                } else if (unit.config.attackType === "LaserBeam") {
            this.executeLaserBeam(unit, target);
        } else if (unit.config.attackType === "Line" || unit.config.attackType === "LineAOE") {
            this.executeLineSlash(unit, target);
        } else if (unit.config.attackType === "Chain") {
            this.executeChainLightning(unit, target);
        } else if (unit.config.attackType === "CircleAOE") {
            this.executeCircleAOE(unit);
        } else if (unit.config.attackType === "ConeAOE") {
            this.executeConeAOE(unit, target);
        } else if (unit.config.attackType === "FullAOE") {
            this.executeFullAOE(unit);
        } else if (unit.config.attackType === "BlackHole") {
            this.executeBlackHole(unit, target);
        } else if (unit.config.attackType === "MultiTarget") {
            this.executeMultiTarget(unit);
        }
    },

    // Detonates projectile on target with high-tier unit VFX
    detonateProjectile(p) {
        const unit = p.unit;
        const uId = unit.config.id;

        if (unit.config.attackType === "Splash") {
            const radius = unit.stats.splashRadius || 60;

            if (uId === "lucifer") {
                this.visualEffects.push({ type: "hellfire_meteor", x: p.x, y: p.y, radius: radius, duration: 0.5 });
            } else if (uId === "solar_valkyrie") {
                this.visualEffects.push({ type: "solar_pillar", x: p.x, y: p.y, radius: radius, duration: 0.45 });
            } else if (uId === "frost_weaver") {
                this.visualEffects.push({ type: "frost_blizzard", x: p.x, y: p.y, radius: radius, duration: 0.4 });
            } else if (uId === "pyro_archer" || uId === "ember_apprentice") {
                this.visualEffects.push({ type: "pyro_explosion", x: p.x, y: p.y, radius: radius, duration: 0.35 });
            } else if (uId === "earth_titan") {
                this.visualEffects.push({ type: "earth_quake", x: p.x, y: p.y, radius: radius, duration: 0.4 });
            } else {
                this.visualEffects.push({ type: "explosion", x: p.x, y: p.y, radius: radius, maxRadius: radius, duration: 0.3 });
            }

            const targets = this.activeEnemies.filter(e => {
                if (e.isFlying && unit.config.placement === "Ground") return false;
                return Math.hypot(e.x - p.x, e.y - p.y) <= radius;
            });

            targets.forEach(t => this.applyDamage(unit, t));
        } else {
            // Single target
            if (uId === "abyssal_gunner") {
                this.visualEffects.push({ type: "bullet_blast", x: p.x, y: p.y, duration: 0.25 });
            } else {
                this.visualEffects.push({ type: "hit_spark", x: p.x, y: p.y, color: this.getElementColor(unit.config.element), duration: 0.2 });
            }

            if (this.activeEnemies.includes(p.target)) {
                this.applyDamage(unit, p.target);
            }
        }
    },

    executeLineSlash(unit, target) {
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const range = unit.stats.range;
        const angle = Math.atan2(dy, dx);
        const endX = unit.x + Math.cos(angle) * range;
        const endY = unit.y + Math.sin(angle) * range;

        const isStarMage = (unit.config.id || "").startsWith("star_mage");

        this.visualEffects.push({
            type: isStarMage ? "cosmic_stellar_beam" : "excalibur_slash",
            x1: unit.x, y1: unit.y,
            x2: endX, y2: endY,
            angle: angle,
            duration: isStarMage ? 0.55 : 0.45
        });

        // Star Mage wide beam (d <= 95) covers entire path width so it hits all enemies in the lane!
        const hitWidth = isStarMage ? 95 : 55;

        this.activeEnemies.forEach(e => {
            if (e.isFlying && unit.config.placement === "Ground") return;
            const d = this.distToSegment({ x: e.x, y: e.y }, { x: unit.x, y: unit.y }, { x: endX, y: endY });
            if (d <= hitWidth) {
                this.applyDamage(unit, e);
            }
        });
    },

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    },

    getElementColor(elem) {
        const map = {
            "Fire": "#ef4444", "Ice": "#38bdf8", "Dark": "#a855f7",
            "Lightning": "#facc15", "Light": "#ffffff", "Nature": "#22c55e"
        };
        return map[elem] || "#facc15";
    },

    executeChainLightning(unit, initialTarget) {
        let current = initialTarget;
        const chained = [current];
        const maxChains = (unit.config && unit.config.chainTargets) || (unit.stats && unit.stats.chainTargets) || 4;
        const falloff = (unit.config && unit.config.chainFalloff) || 0.25;

        this.applyDamage(unit, current, 1.0);

        let curMult = 1.0;
        for (let i = 1; i < maxChains; i++) {
            const next = this.activeEnemies.find(e => {
                if (chained.includes(e)) return false;
                if (e.isFlying && unit.config.placement === "Ground") return false;
                if (e.isSoaring && !unit.stats.soaringActive) return false;
                return Math.hypot(e.x - current.x, e.y - current.y) <= 130;
            });

            if (!next) break;

            curMult *= (1.0 - falloff);
            this.visualEffects.push({ type: "chain_arc", x1: current.x, y1: current.y, x2: next.x, y2: next.y, duration: 0.2 });
            this.applyDamage(unit, next, curMult);

            // Shock stun check
            if (unit.config && unit.config.shockStunChance && Math.random() < unit.config.shockStunChance) {
                next.isStunned = true;
                next.stunTimer = unit.config.shockStunDuration || 1.0;
                this.addFloatingText(next.x, next.y - 20, "⚡ SHOCKED!", "#facc15", 13);
            }

            chained.push(next);
            current = next;
        }
    },

    executeCircleAOE(unit) {
        const radius = unit.stats.splashRadius || 110;
        if (unit.config.id === "sepsis") {
            this.visualEffects.push({ type: "sepsis_decay", x: unit.x, y: unit.y, radius: radius, duration: 0.5 });
        } else {
            this.visualEffects.push({ type: "whirlwind", x: unit.x, y: unit.y, radius: radius, duration: 0.3 });
        }

        this.activeEnemies.forEach(e => {
            if (e.isFlying && unit.config.placement === "Ground") return;
            if (e.isSoaring && !unit.stats.soaringActive) return;
            if (Math.hypot(e.x - unit.x, e.y - unit.y) <= radius) {
                this.applyDamage(unit, e);
            }
        });
    },

    executeConeAOE(unit, target) {
        const centerAngle = Math.atan2(target.y - unit.y, target.x - unit.x);
        const halfAngle = ((unit.config.coneAngle || 75) / 2) * (Math.PI / 180);
        this.visualEffects.push({ type: "shockwave", x: unit.x, y: unit.y, tx: target.x, ty: target.y, duration: 0.35 });

        this.activeEnemies.forEach(e => {
            if (e.isFlying && unit.config.placement === "Ground") return;
            if (e.isSoaring && !unit.stats.soaringActive) return;
            const dist = Math.hypot(e.x - unit.x, e.y - unit.y);
            if (dist <= unit.stats.range) {
                const angleToEnemy = Math.atan2(e.y - unit.y, e.x - unit.x);
                let diff = Math.abs(centerAngle - angleToEnemy);
                while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
                if (diff <= halfAngle) {
                    this.applyDamage(unit, e);
                }
            }
        });
    },

    executeFullAOE(unit) {
        this.visualEffects.push({ type: "hellfire_meteor", x: unit.x, y: unit.y, radius: unit.stats.range, duration: 0.5 });
        this.activeEnemies.forEach(e => {
            if (e.isFlying && unit.config.placement === "Ground") return;
            if (e.isSoaring && !unit.stats.soaringActive) return;
            if (Math.hypot(e.x - unit.x, e.y - unit.y) <= unit.stats.range) {
                this.applyDamage(unit, e);
            }
        });
    },

    executeBlackHole(unit, target) {
        const radius = unit.stats.splashRadius || 140;
        this.visualEffects.push({ type: "cosmic_singularity", x: target.x, y: target.y, radius: radius, duration: 0.65 });

        this.activeEnemies.forEach(e => {
            if (e.isSoaring && !unit.stats.soaringActive) return;
            if (Math.hypot(e.x - target.x, e.y - target.y) <= radius) {
                // Pull inward
                e.x += (target.x - e.x) * 0.3;
                e.y += (target.y - e.y) * 0.3;
                this.applyDamage(unit, e);
            }
        });
    },

    executeMultiTarget(unit) {
        const maxTargets = unit.config.maxTargets || 3;
        const targets = this.activeEnemies.filter(e => {
            if (e.isFlying && unit.config.placement === "Ground") return false;
            if (e.isSoaring && !unit.stats.soaringActive) return false;
            return Math.hypot(e.x - unit.x, e.y - unit.y) <= unit.stats.range;
        }).slice(0, maxTargets);

        targets.forEach(t => {
            this.visualEffects.push({ type: "blade_cyclone", x: t.x, y: t.y, duration: 0.3 });
            this.applyDamage(unit, t);
        });
    },

    // Calculates and applies exact damage with all modifiers
    applyDamage(unit, enemy, damageMult = 1.0) {
        let finalDamage = unit.stats.damage * damageMult;
        // 0. Freeze & Slow Status Effects (Frost Weaver)
        if (unit.config && unit.config.freezeChance) {
            if (Math.random() < unit.config.freezeChance) {
                enemy.isFrozen = true;
                enemy.freezeTimer = unit.config.freezeDuration || 2.0;
                this.addFloatingText(enemy.x, enemy.y - 20, "❄️ FROZEN!", "#67e8f9", 14);
                this.visualEffects.push({ type: "ice_burst", x: enemy.x, y: enemy.y, radius: 25, duration: 0.4 });
            }
        }
        if (unit.config && unit.config.slowPercent) {
            enemy.isSlowed = true;
            enemy.slowTimer = unit.config.slowDuration || 3.0;
            enemy.slowMultiplier = 1.0 - unit.config.slowPercent;
        }


        // 1. Support Buffer Passives (Magic Girl for Magical, Commander for Physical)
        if (unit.config.damageType === "Magical") {
            let maxMagicBonus = 0;
            this.placedUnits.forEach(b => {
                if (b.config.id === "magic_girl" && b !== unit) {
                    const dist = Math.hypot(b.x - unit.x, b.y - unit.y);
                    if (dist <= b.stats.range) {
                        const bonus = 0.30 + (b.upgradeLevel || 0) * 0.05;
                        if (bonus > maxMagicBonus) maxMagicBonus = bonus;
                    }
                }
            });
            if (maxMagicBonus > 0) finalDamage *= (1 + Math.min(0.60, maxMagicBonus));
        }

        if (unit.config.damageType === "Physical") {
            let maxPhysBonus = 0;
            this.placedUnits.forEach(b => {
                if (b.config.id === "commander" && b !== unit) {
                    const dist = Math.hypot(b.x - unit.x, b.y - unit.y);
                    if (dist <= b.stats.range) {
                        // Base Commander War Cry aura is +30%, scaling with upgrades up to +60%
                        const bonus = 0.30 + (b.upgradeLevel || 0) * 0.05;
                        if (bonus > maxPhysBonus) maxPhysBonus = bonus;
                    }
                }
            });
            if (maxPhysBonus > 0) finalDamage *= (1 + Math.min(0.60, maxPhysBonus));
        }

        // 2. Stage Modifiers (Physical vs Magical and Elements)
        const diffConfig = this.isHardMode ? this.stageConfig.hard : this.stageConfig.normal;
        if (diffConfig && diffConfig.modifier) {
            const mod = diffConfig.modifier;
            if (unit.config.damageType === "Physical" && mod.physicalDamageBonus) {
                finalDamage *= (1 + mod.physicalDamageBonus);
            }
            if (unit.config.damageType === "Magical" && mod.magicalDamageBonus) {
                finalDamage *= (1 + mod.magicalDamageBonus);
            }
            if (mod.elementalBonus && mod.elementalBonus[unit.config.element]) {
                finalDamage *= (1 + mod.elementalBonus[unit.config.element]);
            }
            if (mod.combinedBonus && mod.combinedBonus.damageType === unit.config.damageType && mod.combinedBonus.element === unit.config.element) {
                finalDamage *= (1 + mod.combinedBonus.bonus);
            }
        }

        // 3. Enemy Resistances & Shinobi Susanoo Bypass
        const isSusanooBypass = (unit.config.id === "shinobi_god" && unit.upgradeLevel >= 6);
        if (!isSusanooBypass) {
            if (unit.config.damageType === "Physical" && enemy.config.physicalResistance) {
                finalDamage *= (1 - enemy.config.physicalResistance);
            }
            if (unit.config.damageType === "Magical" && enemy.config.magicalResistance) {
                finalDamage *= (1 - enemy.config.magicalResistance);
            }
        }

        // 4. Trait Special Bonuses
        if (unit.stats.traitDetails) {
            const td = unit.stats.traitDetails;
            if (enemy.isBoss && td.bossDamageBonus) {
                finalDamage *= (1 + td.bossDamageBonus);
            }
            if (td.cullingBonus && (enemy.hp / enemy.maxHp) <= 0.30) {
                finalDamage *= (1 + td.cullingBonus);
            }
        }

        // 5. Shadow Assassin Passives
        if (unit.config.id === "shadow_assassin" || unit.config.id === "shadow_assassin_awakened") {
            // Passive 1: Shadow Mark (Every 8 attacks against same target marks it; next attack deals +35% bonus)
            unit.shadowMarkHits = unit.shadowMarkHits || {};
            const hits = (unit.shadowMarkHits[enemy.id] || 0) + 1;
            if (hits >= 8) {
                finalDamage *= 1.35;
                unit.shadowMarkHits[enemy.id] = 0;
                this.addFloatingText(enemy.x, enemy.y - 28, "SHADOW MARK +35%!", "#c084fc");
            } else {
                unit.shadowMarkHits[enemy.id] = hits;
            }

            // Awakened Passives
            if (unit.config.id === "shadow_assassin_awakened") {
                // Passive 2: Endless Hunt (+0.5% damage per kill during match, max 30%)
                const huntBonus = Math.min(0.30, (unit.endlessHuntKills || 0) * 0.005);
                if (huntBonus > 0) finalDamage *= (1 + huntBonus);

                // Passive 3: Phantom Rhythm (Every 10 attacks, next attack deals +50% bonus damage)
                unit.phantomRhythmCount = (unit.phantomRhythmCount || 0) + 1;
                if (unit.phantomRhythmCount >= 10) {
                    finalDamage *= 1.50;
                    unit.phantomRhythmCount = 0;
                    this.addFloatingText(unit.x, unit.y - 20, "PHANTOM RHYTHM +50%!", "#38bdf8");
                }
            }
        }

        // 6. Vampire King Passives
        if (unit.config.id === "vampire_king") {
            // Passive 2: Crimson Feast (+15% additional direct attack damage to bleeding targets)
            if (enemy.bleedTimer > 0) {
                finalDamage *= 1.15;
            }

            // Passive 1: Blood Curse (Applies Bleed for 8s, 4 ticks, 12.5% attack damage per tick = 50% total)
            enemy.bleedTimer = 8.0;
            enemy.bleedDamagePerTick = finalDamage * 0.125;
            enemy.bleedTickTimer = 2.0;
            enemy.bleedSource = unit;
        }

        // 7. Star Mage Passives
        if (unit.config.id === "star_mage" || unit.config.id === "star_mage_explosion") {
            // Passive 1: Shining Stars (Stuns all enemies in range after 3 attacks on same enemy)
            unit.starMageHits = unit.starMageHits || {};
            const sHits = (unit.starMageHits[enemy.id] || 0) + 1;
            if (sHits >= 3) {
                unit.starMageHits[enemy.id] = 0;
                this.stunAllEnemiesInRange(unit.x, unit.y, unit.stats.range, 2.0);
                this.addFloatingText(enemy.x, enemy.y - 24, "SHINING STARS STUN!", "#facc15");
            } else {
                unit.starMageHits[enemy.id] = sHits;
            }

            // Passive 3: Explosion! (+50% Light damage on enemies hit 3x by Explosion!)
            if (unit.config.id === "star_mage_explosion") {
                enemy.explosionHits = (enemy.explosionHits || 0) + 1;
                if (enemy.explosionHits >= 3) {
                    enemy.isExplosionVulnerable = true;
                }
            }
        }
        if (enemy.isExplosionVulnerable && unit.config.element === "Light") {
            finalDamage *= 1.50;
        }

        // Relic Damage Enhancements (Equipped to this unit)
        const unitRelic = window.SaveService && window.SaveService.getUnitEquippedRelic ? window.SaveService.getUnitEquippedRelic(unit.id || unit.instanceId) : null;
        if (unitRelic === "relic_blazing_core" && (unit.config.element === "Fire" || unit.config.damageType === "Physical")) {
            finalDamage *= 1.15;
        }
        if (unitRelic === "relic_shadow_cloak" && (unit.config.element === "Dark" || unit.config.damageType === "Magical")) {
            finalDamage *= 1.15;
        }

        // 8. Shinobi Passives (Black Flames Burn for 3s, 6 ticks @ 50% unit damage)
        if (unit.config.id === "shinobi" || unit.config.id === "shinobi_god") {
            const eqRelic = window.SaveService && window.SaveService.getUnitEquippedRelic ? window.SaveService.getUnitEquippedRelic(unit.id || unit.instanceId) : null;
            const hasRedEyes = eqRelic === "relic_mangekyou" || eqRelic === "red_eyes" || (window.SaveService && window.SaveService.hasRelic && window.SaveService.hasRelic("red_eyes"));
            enemy.burnTimer = hasRedEyes ? 6.0 : 3.0;
            enemy.burnDamagePerTick = finalDamage * 0.50;
            enemy.burnTickTimer = 0.5;
            enemy.burnSource = unit;
        }

        finalDamage = Math.max(1, Math.round(finalDamage));
        enemy.hp -= finalDamage;
        unit.totalDamageDealt += finalDamage;

        // Floating Damage Number
        const color = unit.config.damageType === "Magical" ? "#c084fc" : "#fbbf24";
        this.addFloatingText(enemy.x, enemy.y - 12, finalDamage, color);

        // Apply Slow if unit has it
        if (unit.stats.slowPercent && enemy.slowTimer <= 0) {
            enemy.speed = enemy.baseSpeed * (1 - unit.stats.slowPercent);
            enemy.slowTimer = unit.config.slowDuration || 2.0;
        }

        // Enemy Defeated
        if (enemy.hp <= 0) {
            this.killEnemy(enemy, unit);
        }
    },

    stunAllEnemiesInRange(x, y, range, duration = 2.0) {
        this.activeEnemies.forEach(e => {
            if (Math.hypot(e.x - x, e.y - y) <= range) {
                e.stunTimer = Math.max(e.stunTimer || 0, duration);
            }
        });
    },

    killEnemy(enemy, killerUnit) {
        const idx = this.activeEnemies.indexOf(enemy);
        if (idx !== -1) {
            this.activeEnemies.splice(idx, 1);
            if (killerUnit) {
                killerUnit.kills = (killerUnit.kills || 0) + 1;

                // Shadow Assassin Endless Hunt
                if (killerUnit.config.id === "shadow_assassin_awakened") {
                    killerUnit.endlessHuntKills = (killerUnit.endlessHuntKills || 0) + 1;
                }

                // Vampire King Army of the Fallen Summon
                if (killerUnit.config.id === "vampire_king") {
                    this.spawnArmyOfFallen(killerUnit, enemy);
                }
            }

            // Award in-match bounty cash
            const bounty = enemy.config.cashReward || 20;
            this.matchCash += bounty;

            // Record kill in Enemy Index
            if (window.SaveService && window.SaveService.recordEnemyKill) {
                window.SaveService.recordEnemyKill(enemy.type, enemy.isBoss);
            }

            this.visualEffects.push({ type: "death_smoke", x: enemy.x, y: enemy.y, duration: 0.3 });
            if (window.AudioService) window.AudioService.playHitSound();

            if (window.UIController) {
                window.UIController.updateBattleHUD();
            }
        }
    },

    spawnArmyOfFallen(vampireKing, enemy) {
        this.alliedMinions = this.alliedMinions || [];
        // Cap summons at 6 active minions
        const currentFallen = this.alliedMinions.filter(m => m.type === "fallen_summon").length;
        if (currentFallen >= 6) return;

        const baseIdx = this.pathWaypoints.length - 1;
        const baseWp = this.pathWaypoints[baseIdx];
        if (!baseWp) return;

        this.alliedMinions.push({
            id: 'fallen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
            type: "fallen_summon",
            name: "Fallen " + (enemy.config.name || "Soldier"),
            x: baseWp.x,
            y: baseWp.y,
            waypointIndex: baseIdx,
            damage: Math.round(vampireKing.stats.damage * 0.5),
            speed: 2.5,
            hp: 3,
            maxHp: 3,
            sourceUnit: vampireKing
        });
        this.addFloatingText(baseWp.x, baseWp.y - 15, "ARMY OF THE FALLEN!", "#ef4444");
    },

    spawnCommanderCavalry(commander) {
        this.alliedMinions = this.alliedMinions || [];
        const baseIdx = this.pathWaypoints.length - 1;
        const baseWp = this.pathWaypoints[baseIdx];
        if (!baseWp) return;

        const count = commander.config.upgrades && commander.config.upgrades[commander.upgradeLevel - 1] && commander.config.upgrades[commander.upgradeLevel - 1].summonCount
            ? commander.config.upgrades[commander.upgradeLevel - 1].summonCount
            : (commander.upgradeLevel >= 9 ? 3 : (commander.upgradeLevel >= 4 ? 2 : 1));

        for (let i = 0; i < count; i++) {
            this.alliedMinions.push({
                id: 'cavalry_' + Date.now() + '_' + i,
                type: "cavalry_horse",
                name: "War Horse",
                x: baseWp.x - (i * 18),
                y: baseWp.y,
                waypointIndex: baseIdx,
                damage: commander.stats.damage,
                speed: 3.5,
                hp: 2,
                maxHp: 2,
                sourceUnit: commander
            });
        }
        this.addFloatingText(baseWp.x, baseWp.y - 15, "CAVALRY CHARGE!", "#38bdf8");
    },

    triggerHealAura(healer) {
        const radius = healer.config.healRadius || 90;
        this.visualEffects.push({ type: "heal_circle", x: healer.x, y: healer.y, radius: radius, duration: 0.4 });

        this.activeEnemies.forEach(e => {
            if (Math.hypot(e.x - healer.x, e.y - healer.y) <= radius) {
                const healAmt = Math.round(e.maxHp * (healer.config.healPercent || 0.15));
                e.hp = Math.min(e.maxHp, e.hp + healAmt);
                this.addFloatingText(e.x, e.y - 15, `+${healAmt}`, "#22c55e");
            }
        });
    },

    addFloatingText(x, y, text, color = "#ffffff") {
        this.floatingTexts.push({
            x: x + (Math.random() * 16 - 8),
            y: y,
            text: text,
            color: color,
            alpha: 1.0,
            vy: -35
        });
    },

    // ----------------------------------------------------
    // GAME LOOP & RENDER PIPELINE
    // ----------------------------------------------------
    gameLoop() {
        if (!this.isActive) return;

        const now = performance.now();
        const rawDt = (now - this.lastTime) / 1000;
        this.lastTime = now;
        const dt = Math.min(0.1, rawDt) * this.gameSpeed;

        if (!this.isPaused) {
            this.update(dt);
        }

        this.render();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    },

    update(dt) {
        // Ready / Preparation phase before Wave 1
        if (this.waveState === "ready_phase") {
            this.readyTimer -= dt / this.gameSpeed;
            const timerEl = document.getElementById("battle-ready-timer");
            if (timerEl) timerEl.textContent = `${Math.max(0, Math.ceil(this.readyTimer))}s`;
            if (this.readyTimer <= 0) {
                this.startBattleWaves();
            }
            return;
        }

        // Intermission state: countdown to next wave
        if (this.waveState === "intermission") {
            this.intermissionTimer -= dt;
            if (this.intermissionTimer <= 0) {
                this.startNextWave();
            }
        } else if (this.waveState === "spawning") {
            this.spawnTimer += dt;
            // Spawn queued enemies
            while (this.spawnQueue.length > 0 && this.spawnTimer >= this.spawnQueue[0].delay) {
                const nextSpawn = this.spawnQueue.shift();
                this.spawnEnemy(nextSpawn);
            }

            if (this.spawnQueue.length === 0) {
                this.waveState = "clearing";
            }
        } else if (this.waveState === "clearing") {
            // Auto Skip Wave (balanced: triggers when enemy reaches 25% of path)
            const settings = (window.SaveService && window.SaveService.state && window.SaveService.state.settings) || {};
            if (settings.autoSkipWave && this.currentWave < this.totalWaves && !this.hasAutoSkippedWave) {
                const maxWaypointIndex = this.activeEnemies.reduce((max, e) => Math.max(max, e.waypointIndex || 0), 0);
                const progressRatio = this.pathWaypoints.length > 1 ? maxWaypointIndex / (this.pathWaypoints.length - 1) : 0;
                if (progressRatio >= 0.25) {
                    this.hasAutoSkippedWave = true;
                    this.handleWaveCompletion();
                    this.addFloatingText(this.WIDTH / 2, 140, "⚡ AUTO-SKIPPED WAVE!", "#a855f7", 16);
                }
            }

            // Wave cleared when all enemies are killed
            if (this.activeEnemies.length === 0 && !this.hasAutoSkippedWave) {
                this.handleWaveCompletion();
                if (this.waveState === "victory" || !this.isActive) return;
            }
        }

        // Update combat (towers, projectiles, enemy movements)
        this.updateCombat(dt);

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.alpha -= dt * 1.2;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update visual effects
        for (let i = this.visualEffects.length - 1; i >= 0; i--) {
            const fx = this.visualEffects[i];
            fx.duration -= dt;
            if (fx.duration <= 0) {
                this.visualEffects.splice(i, 1);
            }
        }
    },

    handleWaveCompletion() {
        // Wave End Income from Farming Units (Speedwagon / Bulma scaling)
        let totalFarmIncome = 0;
        this.placedUnits.forEach(u => {
            const uId = (u.unitInstance && u.unitInstance.unitId) || (u.config && u.config.id);
            const conf = window.UNIT_CONFIG[uId];
            if (conf && conf.isFarm) {
                let unitIncome = conf.incomePerWave || 200;
                if (u.upgradeLevel > 0 && conf.upgrades && conf.upgrades[u.upgradeLevel - 1]) {
                    const upg = conf.upgrades[u.upgradeLevel - 1];
                    unitIncome = upg.incomePerWave || upg.income || unitIncome;
                }
                // Check if Golden Fortune Ring is attached to this unit (+15% income)
                const uRelic = window.SaveService && window.SaveService.getUnitEquippedRelic ? window.SaveService.getUnitEquippedRelic(u.unitInstance.id || u.id) : null;
                if (uRelic === "relic_fortune_ring") {
                    unitIncome = Math.round(unitIncome * 1.15);
                }
                // Check Fortune Trait (+20% income)
                if (u.unitInstance && u.unitInstance.trait === "Fortune") {
                    unitIncome = Math.round(unitIncome * 1.20);
                }
                totalFarmIncome += unitIncome;
                this.addFloatingText(u.x, u.y - 25, `+${unitIncome} ¥`, "#fde047", 15);
            }
        });
        this.matchCash += totalFarmIncome;
        this.matchYen = this.matchCash;

        // Wave Clear Guaranteed Yen Bonus (+500 + wave * 75)
        const waveBonusYen = 500 + (this.currentWave * 75);
        this.matchCash += waveBonusYen;
        this.matchYen = this.matchCash;
        this.addFloatingText(this.WIDTH / 2, 80, `+${waveBonusYen} ¥ (Wave ${this.currentWave} Bonus!)`, "#facc15", 16);

        // Infinite Mode: Every 5 waves gives Gems!
        if (this.stageConfig && this.stageConfig.isInfinite && this.currentWave % 5 === 0) {
            const milestoneGems = Math.min(800, Math.floor(35 * (this.currentWave / 5) * 1.5));
            if (window.SaveService) {
                window.SaveService.addGems(milestoneGems);
            }
            this.addFloatingText(this.WIDTH / 2, 115, `💎 WAVE ${this.currentWave} BONUS: +${milestoneGems} GEMS!`, "#38bdf8", 18);
        }

        // Infinite Mode Food Drop: 1-2 Food every wave cleared!
        if (this.stageConfig && this.stageConfig.isInfinite) {
            const foods = ["rice_ball", "bento_box"];
            const foodPick = foods[Math.floor(Math.random() * foods.length)];
            const foodCount = Math.floor(Math.random() * 2) + 1;
            if (window.SaveService) window.SaveService.addItem("food", foodPick, foodCount);
            this.addFloatingText(this.WIDTH / 2, 135, `🍱 +${foodCount}x Food Drop!`, "#38bdf8", 15);
        }

        // Infinite Mode Wave Essence Drops: 5% Thunder Essence & 5% Nature Essence per wave
        if (this.stageConfig && this.stageConfig.isInfinite) {
            if (Math.random() < 0.05) {
                if (window.SaveService) window.SaveService.addItem("materials", "thunder_essence", 1);
                this.addFloatingText(this.WIDTH / 2, 135, `⚡ +1 THUNDER ESSENCE!`, "#c084fc", 16);
                if (window.UIController && window.UIController.showToast) {
                    window.UIController.showToast("⚡ You obtained 1x Thunder Essence from Infinite wave!", "info");
                }
            }
            if (Math.random() < 0.05) {
                if (window.SaveService) window.SaveService.addItem("materials", "nature_essence", 1);
                this.addFloatingText(this.WIDTH / 2, 155, `🍃 +1 NATURE ESSENCE!`, "#4ade80", 16);
                if (window.UIController && window.UIController.showToast) {
                    window.UIController.showToast("🍃 You obtained 1x Nature Essence from Infinite wave!", "info");
                }
            }
        }

        if (this.currentWave >= this.totalWaves) {
            this.triggerVictory();
            return;
        } else {
            this.waveState = "intermission";
            this.intermissionTimer = 4;
            if (window.UIController) window.UIController.updateBattleHUD();
        }
    },

    triggerVictory() {
        this.waveState = "victory";
        this.isActive = false;
        if (window.AudioService && window.AudioService.playVictorySound) {
            window.AudioService.playVictorySound();
        }

        let result = { gemsAwarded: 0, isFirstClear: false };
        let randomFood = 0;
        let legendDrops = [];

        try {
            if (this.stageConfig && this.stageConfig.isLegend) {
                // World 2 (Hills) Legend Stages: Light Energy, Blazes, Daggers (+10% Relic Shard)
                if (this.stageConfig.id === "legend_act1" || this.stageConfig.id === "legend_hills_act1") {
                    const energyCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 Light Energy
                    window.SaveService.addItem("materials", "light_energy", energyCount);
                    legendDrops.push({ id: "light_energy", name: "Light Energy", count: energyCount, icon: "✨" });
                } else if (this.stageConfig.id === "legend_act2" || this.stageConfig.id === "legend_hills_act2") {
                    const blazeCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 Blazes
                    window.SaveService.addItem("materials", "blaze", blazeCount);
                    legendDrops.push({ id: "blaze", name: "Blaze", count: blazeCount, icon: "🔥" });
                } else if (this.stageConfig.id === "legend_act3" || this.stageConfig.id === "legend_hills_act3") {
                    const daggerCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 Daggers
                    window.SaveService.addItem("materials", "dagger", daggerCount);
                    legendDrops.push({ id: "dagger", name: "Dagger", count: daggerCount, icon: "🗡️" });
                    
                    // 10% chance for Relic Shard
                    if (Math.random() < 0.10) {
                        window.SaveService.addItem("materials", "relic_shard", 1);
                        legendDrops.push({ id: "relic_shard", name: "Relic Shard", count: 1, icon: "💠" });
                    }
                } 
                // World 3 (Mountains) Legend Stages: 5-10 Scrolls (100% Drop Rate)
                else if (this.stageConfig.id === "legend_mountains_act1") {
                    const scrollCount = Math.floor(Math.random() * 6) + 5; // 5 to 10 Fire Scrolls
                    window.SaveService.addItem("materials", "fire_scroll", scrollCount);
                    legendDrops.push({ id: "fire_scroll", name: "Fire Scroll", count: scrollCount, icon: "📜" });
                } else if (this.stageConfig.id === "legend_mountains_act2") {
                    const scrollCount = Math.floor(Math.random() * 6) + 5; // 5 to 10 Water Scrolls
                    window.SaveService.addItem("materials", "water_scroll", scrollCount);
                    legendDrops.push({ id: "water_scroll", name: "Water Scroll", count: scrollCount, icon: "📜" });
                } else if (this.stageConfig.id === "legend_mountains_act3") {
                    const scrollCount = Math.floor(Math.random() * 6) + 5; // 5 to 10 Nature Scrolls
                    window.SaveService.addItem("materials", "nature_scroll", scrollCount);
                    legendDrops.push({ id: "nature_scroll", name: "Nature Scroll", count: scrollCount, icon: "📜" });
                }

                const prog = (window.SaveService.state.stageProgress && window.SaveService.state.stageProgress[this.stageConfig.id]) || {};
                const stNorm = this.stageConfig.normal || {};
                const stHard = this.stageConfig.hard || {};
                if (!this.isHardMode) {
                    if (!prog.normalGemsClaimed) {
                        result.gemsAwarded = stNorm.firstClearGems || 80;
                        result.isFirstClear = true;
                    } else {
                        result.gemsAwarded = stNorm.repeatGems || 25;
                    }
                } else {
                    if (!prog.hardGemsClaimed) {
                        result.gemsAwarded = stHard.firstClearGems || 160;
                        result.isFirstClear = true;
                    } else {
                        result.gemsAwarded = stHard.repeatGems || 40;
                    }
                }

                window.SaveService.addGems(result.gemsAwarded);
                window.SaveService.addPlayerExp(this.isHardMode ? 150 : 80);
                if (window.SaveService.recordStageClear) { window.SaveService.recordStageClear(this.stageConfig.id, this.isHardMode); }
                window.SaveService.save();
            } else if (this.stageConfig && (this.stageConfig.isEvent || this.stageConfig.id === "event_release" || this.stageConfig.id === "event_genesis_rift")) {
                // Limited Release Event Mode: 500 Gems every match + 0.75% Star Mage Secret Drop with 100-run Pity!
                result.gemsAwarded = 500;
                window.SaveService.addGems(500);
                window.SaveService.addPlayerExp(200);

                if (!window.SaveService.state.releaseEventPity) window.SaveService.state.releaseEventPity = 0;
                window.SaveService.state.releaseEventPity++;

                let rolledStarMage = Math.random() < 0.0075; // 0.75% base drop chance
                if (window.SaveService.state.releaseEventPity >= 100) {
                    rolledStarMage = true; // 100% Pity Guarantee!
                }

                if (rolledStarMage) {
                    window.SaveService.state.releaseEventPity = 0; // Reset pity after obtaining
                    window.SaveService.addUnit("star_mage");
                    if (window.UIController && window.UIController.showToast) {
                        window.UIController.showToast("🎉 INCREDIBLE! You obtained Secret unit: Star Mage from the Release Event!", "success");
                    }
                }
                if (window.SaveService.recordStageClear) { window.SaveService.recordStageClear(this.stageConfig.id, false); }
                window.SaveService.save();
            } else if (this.isChallenge && this.challengeOptions) {
                // Challenge Mode Rewards
                const ch = this.challengeOptions;
                if (ch.cycleKey) {
                    window.SaveService.state.challengeClaims[ch.cycleKey] = true;
                }
                if (ch.rewards) {
                    if (ch.rewards.gems) {
                        window.SaveService.addGems(ch.rewards.gems);
                        result.gemsAwarded = ch.rewards.gems;
                    }
                    if (ch.rewards.traitRerolls) {
                        window.SaveService.addTraitRerolls(ch.rewards.traitRerolls);
                    }
                    if (ch.rewards.starFruits) {
                        for (const [fruitId, count] of Object.entries(ch.rewards.starFruits)) {
                            window.SaveService.addItem("starFruits", fruitId, count);
                        }
                    }
                }
                window.SaveService.addPlayerExp(100);
                window.SaveService.save();
            } else {
                // Story Mode Food Drop: ALWAYS 1 to 8 random food!
                randomFood = Math.floor(Math.random() * 8) + 1; // 1 to 8 inclusive

                // Grant rewards and save to Supabase / LocalStorage
                result = window.SaveService.grantStoryClear(
                    this.currentStageId,
                    this.isHardMode,
                    randomFood
                );
            }
        } catch (err) {
            console.error("[PTD Combat] Error calculating victory rewards:", err);
        }

        // Award Unit EXP to all equipped team units (No unit exp on Infinite Mode)
        let unitExpAwarded = 0;
        if (!this.stageConfig || !this.stageConfig.isInfinite) {
            if (this.stageConfig && this.stageConfig.isEvent) {
                unitExpAwarded = 8000;
            } else if (this.stageConfig && this.stageConfig.isLegend) {
                unitExpAwarded = 4500;
            } else if (this.isChallenge) {
                unitExpAwarded = 3500;
            } else {
                const act = (this.stageConfig && this.stageConfig.actNum) || 1;
                const worldId = (this.stageConfig && this.stageConfig.worldId) || "world_1";
                if (worldId === "world_3") unitExpAwarded = 5000 + act * 1200;
                else if (worldId === "world_2") unitExpAwarded = 2500 + act * 500;
                else unitExpAwarded = 800 + act * 200;
            }
            if (this.isHardMode) unitExpAwarded = Math.round(unitExpAwarded * 1.5);

            // Award to all equipped team units
            const state = window.SaveService && window.SaveService.state;
            if (state && state.team && state.inventoryUnits) {
                state.team.forEach(instId => {
                    const u = state.inventoryUnits.find(unit => unit.id === instId);
                    if (u) {
                        let bonus = 1.0;
                        if (u.trait === "Adept") bonus = 1.5;
                        const gained = Math.round(unitExpAwarded * bonus);
                        u.exp = (u.exp || 0) + gained;
                        let reqExp = window.SaveService.getRequiredExpForLevel ? window.SaveService.getRequiredExpForLevel(u.level) : (u.level * 100);
                        while (u.exp >= reqExp && u.level < 100) {
                            u.exp -= reqExp;
                            u.level += 1;
                            reqExp = window.SaveService.getRequiredExpForLevel ? window.SaveService.getRequiredExpForLevel(u.level) : (u.level * 100);
                        }
                    }
                });
                window.SaveService.save();
            }
        }

        try {
            if (window.UIController) {
                window.UIController.showMatchResultModal({
                    victory: true,
                    stageName: this.isChallenge ? (this.challengeOptions.title || "Challenge Complete") : this.stageConfig.name,
                    isHard: this.isHardMode,
                    isChallenge: this.isChallenge,
                    isLegend: this.stageConfig && this.stageConfig.isLegend,
                    legendDrops: legendDrops,
                    challengeRewards: this.isChallenge ? this.challengeOptions.rewards : null,
                    gemsAwarded: result.gemsAwarded,
                    unitExpAwarded: unitExpAwarded,
                    isFirstClear: result.isFirstClear,
                    foodAmount: randomFood,
                    playerLevel: (window.SaveService && window.SaveService.state && window.SaveService.state.playerLevel) || 1
                });
            }
        } catch (uiErr) {
            console.error("[PTD Combat] Error displaying match result modal:", uiErr);
        }
    },

    triggerGameOver() {
        this.waveState = "gameover";
        this.isActive = false;
        if (window.AudioService) window.AudioService.playDefeatSound();

        if (window.UIController) {
            window.UIController.showMatchResultModal({
                victory: false,
                stageName: this.stageConfig.name,
                wavesCleared: this.currentWave - 1
            });
        }
    },

    // ----------------------------------------------------
    // HANDCRAFTED 2D PIXEL-ART MAP ENVIRONMENT
    // ----------------------------------------------------
    renderMapEnvironment(ctx) {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 16; c++) {
                const x = c * this.TILE_SIZE;
                const y = r * this.TILE_SIZE;
                const type = this.mapTiles[r][c];

                if (type === 'road') {
                    // Cobblestone Road with Paved Bricks & Mortar
                    ctx.fillStyle = "#1e293b";
                    ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);

                    // Cobblestone Pavers
                    ctx.fillStyle = "#334155";
                    ctx.fillRect(x + 2, y + 2, 22, 21);
                    ctx.fillRect(x + 26, y + 2, 22, 21);
                    ctx.fillRect(x + 2, y + 26, 22, 21);
                    ctx.fillRect(x + 26, y + 26, 22, 21);

                    // Stone Highlights
                    ctx.fillStyle = "#475569";
                    ctx.fillRect(x + 4, y + 4, 18, 2);
                    ctx.fillRect(x + 28, y + 4, 18, 2);
                    ctx.fillRect(x + 4, y + 28, 18, 2);
                    ctx.fillRect(x + 28, y + 28, 18, 2);

                    // Kerb borders adjoining grass
                    ctx.fillStyle = "#64748b";
                    if (r > 0 && this.mapTiles[r - 1][c] !== 'road') ctx.fillRect(x, y, this.TILE_SIZE, 3);
                    if (r < 9 && this.mapTiles[r + 1][c] !== 'road') ctx.fillRect(x, y + 47, this.TILE_SIZE, 3);
                    if (c > 0 && this.mapTiles[r][c - 1] !== 'road') ctx.fillRect(x, y, 3, this.TILE_SIZE);
                    if (c < 15 && this.mapTiles[r][c + 1] !== 'road') ctx.fillRect(x + 47, y, 3, this.TILE_SIZE);

                } else if (type === 'hill') {
                    // 3D Elevated Cliff Hill (Plateau with Rock Strata Drop Shadow)
                    // Cliff Shadow Base
                    ctx.fillStyle = "#1c1917";
                    ctx.fillRect(x, y + 10, this.TILE_SIZE, this.TILE_SIZE - 10);

                    // Rock Cliff Face Strata
                    ctx.fillStyle = "#292524";
                    ctx.fillRect(x + 2, y + 15, this.TILE_SIZE - 4, this.TILE_SIZE - 17);
                    ctx.fillStyle = "#44403c";
                    ctx.fillRect(x + 6, y + 18, 14, 2);
                    ctx.fillRect(x + 26, y + 25, 16, 2);

                    // Elevated Top Plateau Terrace
                    ctx.fillStyle = "#57534e";
                    ctx.fillRect(x, y - 6, this.TILE_SIZE, 34);
                    ctx.fillStyle = "#78716c";
                    ctx.fillRect(x + 2, y - 4, this.TILE_SIZE - 4, 30);
                    ctx.fillStyle = "#a8a29e";
                    ctx.fillRect(x + 4, y - 2, this.TILE_SIZE - 8, 4);

                    // Center Ancient Mystic Vantage Rune (Glows for Soaring & Flying Defense)
                    ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(x + 25, y + 12, 10, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.fillStyle = "#38bdf8";
                    ctx.font = "bold 9px monospace";
                    ctx.fillText("▲ HILL", x + 10, y + 15);

                } else {
                    // Lush Forest Grass with Terrain Shading & Wildflowers
                    const isEven = (r + c) % 2 === 0;
                    ctx.fillStyle = isEven ? "#0f2317" : "#0d1e14";
                    ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);

                    // Subtle Grass Blades
                    ctx.fillStyle = "#163825";
                    const seed = (r * 17 + c * 31);
                    if (seed % 3 === 0) {
                        ctx.fillRect(x + 8, y + 12, 2, 4);
                        ctx.fillRect(x + 11, y + 10, 2, 6);
                    }
                    if (seed % 4 === 0) {
                        ctx.fillRect(x + 32, y + 26, 2, 5);
                        ctx.fillRect(x + 35, y + 28, 2, 3);
                    }

                    // Tiny Wildflower Dots
                    if (seed % 7 === 0) {
                        ctx.fillStyle = "#facc15"; // Yellow Buttercup
                        ctx.fillRect(x + 20, y + 18, 2, 2);
                    } else if (seed % 11 === 0) {
                        ctx.fillStyle = "#f472b6"; // Pink Clover
                        ctx.fillRect(x + 38, y + 14, 2, 2);
                    }
                }

                // Grid Divider Line
                ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
                ctx.strokeRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
            }
        }
    },

    renderSpawnAndBase(ctx) {
        // 1. Spawning Abyssal Void Rift (Start: Waypoint 0)
        const spWp = this.pathWaypoints[0];
        if (spWp) {
            // Swirling Void Vortex
            ctx.fillStyle = "rgba(76, 29, 149, 0.4)";
            ctx.beginPath();
            ctx.arc(45, 150, 32, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(45, 150, 22, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(45, 150, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#c084fc";
            ctx.font = "bold 9px monospace";
            ctx.fillText("VOID RIFT", 22, 110);
        }

        // 2. Kingdom Fortress Citadel Base (End: Waypoint End)
        // Positioned at the very end of the road at the right edge
        const bx = 760;
        const by = 350;

        // Fortress Stone Shadow
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(bx - 15, by - 30, 50, 65);

        // Castle Tower Walls
        ctx.fillStyle = "#334155";
        ctx.fillRect(bx - 10, by - 35, 45, 55);

        // Battlements / Crenellations
        ctx.fillStyle = "#475569";
        ctx.fillRect(bx - 12, by - 42, 48, 8);
        ctx.fillRect(bx - 12, by - 48, 12, 8);
        ctx.fillRect(bx + 6, by - 48, 12, 8);
        ctx.fillRect(bx + 24, by - 48, 12, 8);

        // Iron-Banded Arched Wooden Door
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(bx + 4, by - 5, 22, 25);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(bx + 6, by - 3, 18, 23);

        // Royal Blue Pennant Banner
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.moveTo(bx + 15, by - 48);
        ctx.lineTo(bx + 35, by - 42);
        ctx.lineTo(bx + 15, by - 36);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        // Fortress 3 Lives Badge
        const hpRatio = Math.max(0, this.baseHp / 3);
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(bx - 15, by - 58, 50, 6);
        ctx.fillStyle = this.baseHp >= 3 ? "#22c55e" : (this.baseHp === 2 ? "#eab308" : "#ef4444");
        ctx.fillRect(bx - 15, by - 58, 50 * hpRatio, 6);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText(`BASE: ${this.baseHp}/3`, bx - 10, by - 62);
    },

    // ----------------------------------------------------
    // 2D PIXEL ART RENDERER
    // ----------------------------------------------------
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        // 1. Draw Handcrafted Pixel-Art Map (Ground, Cobblestone Road, 3D Cliff Hills)
        this.renderMapEnvironment(ctx);

        // 2. Draw Spawn Portal (Start) & Kingdom Citadel (End)
        this.renderSpawnAndBase(ctx);

        // 3. Draw Placed Units
        const now = Date.now();
        for (const u of this.placedUnits) {
            const bobY = Math.sin((now / 280) + (u.x * 0.15)) * 2.5;

            // Base shadow
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.beginPath();
            ctx.arc(u.x, u.y + 12, 16, 0, Math.PI * 2);
            ctx.fill();

            // Ambient Runic Aura for High-Tier Units
            if (u.config.rarity === "Mythic" || u.config.rarity === "Secret" || u.config.rarity === "Legendary") {
                const auraColor = u.config.rarity === "Secret" ? "#06b6d4" : (u.config.rarity === "Mythic" ? "#ef4444" : "#eab308");
                const rot = (now / 1000) % (Math.PI * 2);

                ctx.save();
                ctx.translate(u.x, u.y + 10);
                ctx.rotate(rot);
                ctx.strokeStyle = auraColor;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.6;
                ctx.strokeRect(-12, -12, 24, 24);
                ctx.beginPath();
                ctx.arc(0, 0, 16, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // Unit Model / Sprite
            const spriteUrl = window.PixelSprites.getUnitModel(u.config.id, 48, 56);
            const spriteImg = this.getImage(spriteUrl);
            if (spriteImg.complete && spriteImg.naturalWidth > 0) {
                ctx.drawImage(spriteImg, u.x - 24, u.y - 28 + bobY, 48, 56);
            } else {
                ctx.fillStyle = u.config.rarity === "Mythic" ? "#ef4444" : "#3b82f6";
                ctx.fillRect(u.x - 14, u.y - 14 + bobY, 28, 28);
            }

            // Shiny Sparkle
            if (u.isShiny) {
                ctx.fillStyle = "#facc15";
                ctx.font = "12px sans-serif";
                ctx.fillText("✨", u.x + 8, u.y - 18 + bobY);
            }

            // Level / Upgrade tag
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px monospace";
            ctx.fillText(`Lv${u.upgradeLevel}`, u.x - 10, u.y + 18);

            // If Soaring is active, draw wing icon
            if (u.stats.soaringActive) {
                ctx.fillStyle = "#38bdf8";
                ctx.font = "12px sans-serif";
                ctx.fillText("🪽", u.x - 6, u.y - 24 + bobY);
            }
        }

        // 4. Draw Selected Placed Unit Range Circle
        if (this.selectedPlacedUnit) {
            const u = this.selectedPlacedUnit;
            ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
            ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(u.x, u.y, u.stats.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // 5. Draw Placement Preview Cursor
        if (this.selectedUnitToPlace && this.hoverTile.col >= 0 && this.hoverTile.row >= 0) {
            const c = this.hoverTile.col;
            const r = this.hoverTile.row;
            const x = c * this.TILE_SIZE;
            const y = r * this.TILE_SIZE;
            const uConfig = window.UNIT_CONFIG[this.selectedUnitToPlace.unitId];
            const check = this.canPlaceUnitOnTile(uConfig, c, r);

            ctx.fillStyle = check.valid ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)";
            ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
            ctx.strokeStyle = check.valid ? "#22c55e" : "#ef4444";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, this.TILE_SIZE, this.TILE_SIZE);

            // Range circle preview
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.beginPath();
            ctx.arc(x + 25, y + 25, uConfig.baseRange, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 5b. Draw Pending Active Abilities (e.g. Heavenly Meteor Countdown Zone)
        this.pendingActiveAbilities = this.pendingActiveAbilities || [];
        for (const pa of this.pendingActiveAbilities) {
            ctx.save();
            const pulse = (Math.sin(Date.now() / 150) + 1) / 2; // 0 to 1
            const r = pa.radius || 160;

            // Target ground warning zone
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.4 + 0.4 * pulse})`;
            ctx.fillStyle = `rgba(239, 68, 68, ${0.12 + 0.08 * pulse})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(pa.x, pa.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);

            // Inner Runic Hexagram
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pa.x, pa.y, r * 0.35, 0, Math.PI * 2);
            ctx.stroke();

            // Countdown timer display
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px monospace";
            ctx.textAlign = "center";
            ctx.shadowColor = "#f97316";
            ctx.shadowBlur = 10;
            ctx.fillText(`☄️ METEOR: ${Math.max(0, pa.delayTimer).toFixed(1)}s`, pa.x, pa.y - 12);
            ctx.font = "bold 11px sans-serif";
            ctx.fillStyle = "#fef08a";
            ctx.fillText(`AOE: ${r}px (${Math.round(pa.damageMultiplier * 100)}% DMG)`, pa.x, pa.y + 12);
            ctx.textAlign = "start";
            ctx.shadowBlur = 0;

            // In the final 1.2s, draw the meteor streaking down from above the screen
            if (pa.delayTimer <= 1.2) {
                const dropRatio = 1 - (pa.delayTimer / 1.2); // 0 at 1.2s, 1 at 0s
                const startX = pa.x - 180;
                const startY = pa.y - 360;
                const curX = startX + (pa.x - startX) * dropRatio;
                const curY = startY + (pa.y - startY) * dropRatio;

                // Fire trail streak
                ctx.strokeStyle = "rgba(249, 115, 22, 0.8)";
                ctx.lineWidth = 14 * (1 - dropRatio * 0.3);
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(curX, curY);
                ctx.stroke();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.stroke();

                // Falling Meteor Ball
                ctx.fillStyle = "#ea580c";
                ctx.beginPath();
                ctx.arc(curX, curY, 22, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(curX, curY, 12, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // 5c. Draw Active Ability Targeting Reticle (follows mouse)
        if (this.activeAbilityTargeting && this.mousePos) {
            const mx = this.mousePos.x || 0;
            const my = this.mousePos.y || 0;
            const u = this.activeAbilityTargeting.placedUnit;
            const aoe = (u && u.activeAbility && u.activeAbility.aoeRadius) || 160;

            ctx.save();
            ctx.strokeStyle = "#f97316";
            ctx.fillStyle = "rgba(249, 115, 22, 0.2)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(mx, my, aoe, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Reticle Crosshairs
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mx - 25, my); ctx.lineTo(mx + 25, my);
            ctx.moveTo(mx, my - 25); ctx.lineTo(mx, my + 25);
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.shadowColor = "#f97316";
            ctx.shadowBlur = 8;
            ctx.fillText("☄️ CLICK TO CAST METEOR", mx, my - aoe - 10);
            ctx.font = "11px sans-serif";
            ctx.fillStyle = "#cbd5e1";
            ctx.fillText(`AoE Radius: ${aoe}px | 5s Delay | 350% DMG`, mx, my - aoe + 6);
            ctx.textAlign = "start";
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // 6. Draw Enemies
        for (const e of this.activeEnemies) {
            // Soaring visual slipstream aura under enemy
            if (e.isSoaring) {
                ctx.save();
                ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.ellipse(e.x, e.y + e.config.size * 0.45, e.config.size * 1.35, e.config.size * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = "rgba(250, 204, 21, 0.75)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.ellipse(e.x, e.y + e.config.size * 0.45, e.config.size * 0.85, e.config.size * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // Distinct Soaring Badge above
                ctx.fillStyle = "#facc15";
                ctx.font = "bold 9px sans-serif";
                ctx.textAlign = "center";
                ctx.shadowColor = "rgba(0,0,0,0.95)";
                ctx.shadowBlur = 5;
                ctx.fillText("🦅 SOARING", e.x, e.y - e.config.size - 22);
                ctx.shadowBlur = 0;
            } else if (e.isFlying) {
                // Flying wing indicator
                ctx.fillStyle = "#38bdf8";
                ctx.font = "12px sans-serif";
                ctx.fillText("🪽", e.x - 6, e.y - e.config.size - 22);
            }

            // Status effect indicators (Bleed / Burn / Stun) - placed higher up so no overlap
            if (e.bleedTimer > 0) {
                ctx.fillStyle = "#ef4444";
                ctx.font = "bold 9px monospace";
                ctx.fillText("🩸BLEED", e.x - 14, e.y - e.config.size - 22);
            } else if (e.burnTimer > 0) {
                ctx.fillStyle = "#f97316";
                ctx.font = "bold 9px monospace";
                ctx.fillText("🔥BURN", e.x - 14, e.y - e.config.size - 22);
            } else if (e.stunTimer > 0) {
                ctx.fillStyle = "#facc15";
                ctx.font = "bold 9px monospace";
                ctx.fillText("⚡STUN", e.x - 14, e.y - e.config.size - 22);
            }

            // Enemy Pixel Sprite
            const eSpriteUrl = window.PixelSprites.getEnemySprite(e.type, e.config.size * 2);
            const eImg = this.getImage(eSpriteUrl);
            if (eImg.complete && eImg.naturalWidth > 0) {
                const s = Math.max(28, e.config.size * 2);
                ctx.drawImage(eImg, e.x - s / 2, e.y - s / 2, s, s);
            } else {
                ctx.fillStyle = e.config.color || "#8b5cf6";
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.config.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = e.isBoss ? "#facc15" : "#ffffff";
                ctx.lineWidth = e.isBoss ? 3 : 1.5;
                ctx.stroke();
            }

            // Health Bar
            const barW = Math.max(26, e.config.size * 2);
            const barH = 4;
            const hpRatio = Math.max(0, e.hp / e.maxHp);
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(e.x - barW / 2, e.y - e.config.size - 8, barW, barH);
            ctx.fillStyle = hpRatio > 0.5 ? "#22c55e" : (hpRatio > 0.25 ? "#eab308" : "#ef4444");
            ctx.fillRect(e.x - barW / 2, e.y - e.config.size - 8, barW * hpRatio, barH);

            // Numerical HP text (Clean, non-overlapping, high-contrast)
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 8.5px sans-serif";
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
            ctx.shadowBlur = 3;
            const curHp = Math.ceil(e.hp);
            const maxHp = Math.ceil(e.maxHp);
            const hpStr = maxHp >= 10000 ? `${(curHp / 1000).toFixed(1)}k/${(maxHp / 1000).toFixed(1)}k` : `${curHp}/${maxHp}`;
            ctx.fillText(hpStr, e.x, e.y - e.config.size - 10);
            ctx.shadowBlur = 0;
            ctx.textAlign = "start";
        }

        // 6b. Draw Allied Minions (Army of the Fallen & Commander Cavalry)
        this.alliedMinions = this.alliedMinions || [];
        for (const m of this.alliedMinions) {
            ctx.save();
            if (m.type === "cavalry_horse") {
                // Pixel Art Galloping War Horse
                ctx.shadowColor = "#38bdf8";
                ctx.shadowBlur = 10;
                const hx = m.x, hy = m.y;
                const bob = Math.sin(Date.now() / 80) * 3;

                // Horse Body (armored blue/white steed)
                ctx.fillStyle = "#0284c7";
                ctx.fillRect(hx - 14, hy - 6 + bob, 24, 12);
                // Armor plating
                ctx.fillStyle = "#38bdf8";
                ctx.fillRect(hx - 10, hy - 4 + bob, 16, 8);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(hx - 6, hy - 2 + bob, 8, 4);

                // Horse Neck & Head
                ctx.fillStyle = "#0369a1";
                ctx.fillRect(hx + 8, hy - 12 + bob, 7, 10); // neck
                ctx.fillRect(hx + 12, hy - 15 + bob, 9, 7);  // head
                ctx.fillStyle = "#38bdf8";
                ctx.fillRect(hx + 17, hy - 13 + bob, 3, 4);  // snout
                // Glowing eyes & ears
                ctx.fillStyle = "#facc15";
                ctx.fillRect(hx + 14, hy - 14 + bob, 2, 2);  // eye
                ctx.fillStyle = "#0284c7";
                ctx.fillRect(hx + 11, hy - 18 + bob, 3, 4);  // ear

                // Galloping Legs
                const legSwing = Math.sin(Date.now() / 60) * 6;
                ctx.fillStyle = "#075985";
                ctx.fillRect(hx - 12 - legSwing, hy + 6 + bob, 4, 8);
                ctx.fillRect(hx - 6 + legSwing, hy + 6 + bob, 4, 8);
                ctx.fillRect(hx + 4 + legSwing, hy + 6 + bob, 4, 8);
                ctx.fillRect(hx + 10 - legSwing, hy + 6 + bob, 4, 8);

                // Flowing Spirit Tail & Mane
                ctx.fillStyle = "#7dd3fc";
                ctx.fillRect(hx - 18, hy - 4 + bob, 5, 4);
                ctx.fillRect(hx - 21, hy - 1 + bob, 4, 5);
                ctx.fillRect(hx + 7, hy - 14 + bob, 3, 6);
            } else {
                // Fallen Soldier Summon (Vampire King)
                ctx.fillStyle = "#7f1d1d";
                ctx.shadowColor = "#ef4444";
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#dc2626";
                ctx.font = "bold 9px monospace";
                ctx.fillText("💀FALLEN", m.x - 18, m.y - 12);
            }
            ctx.restore();
        }

        // 7. Draw Projectiles with Elemental Glow & Streaks
        for (const p of this.activeProjectiles) {
            const u = p.unit;
            const elemColor = this.getElementColor(u.config.element);

            ctx.save();
            ctx.shadowColor = elemColor;
            ctx.shadowBlur = 8;
            ctx.fillStyle = elemColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Motion Streak
            ctx.strokeStyle = elemColor;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
            ctx.stroke();
            ctx.restore();
        }

        // 8. Draw High-Tier Visual Effects for All Units
        for (const fx of this.visualEffects) {
            ctx.save();
            if (fx.type === "cosmic_stellar_beam") {
                // Star Mage: Massive Piercing Cosmic Stellar Beam
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 42;
                ctx.shadowColor = "#06b6d4";
                ctx.shadowBlur = 24;
                ctx.beginPath();
                ctx.moveTo(fx.x1, fx.y1);
                ctx.lineTo(fx.x2, fx.y2);
                ctx.stroke();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 18;
                ctx.stroke();

                ctx.strokeStyle = "#fef08a";
                ctx.lineWidth = 8;
                ctx.stroke();

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(fx.x1, fx.y1, 14, 0, Math.PI * 2);
                ctx.arc(fx.x2, fx.y2, 18, 0, Math.PI * 2);
                ctx.fill();
            } else if (fx.type === "base_repel_blast") {
                // Outward Hit-Away Blast Defending the Kingdom Base
                const progress = 1 - (fx.duration / 0.5);
                const radius = progress * 65;
                ctx.strokeStyle = `rgba(239, 68, 68, ${1 - progress})`;
                ctx.lineWidth = 5;
                ctx.shadowColor = "#ef4444";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, radius, Math.PI * 0.5, Math.PI * 1.5);
                ctx.stroke();

                ctx.strokeStyle = `rgba(250, 204, 21, ${1 - progress})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, radius * 0.6, Math.PI * 0.5, Math.PI * 1.5);
                ctx.stroke();
            } else if (fx.type === "excalibur_slash") {
                // Sword Queen: Piercing Holy Excalibur Light Beam
                ctx.strokeStyle = "#fef08a";
                ctx.lineWidth = 14;
                ctx.shadowColor = "#facc15";
                ctx.shadowBlur = 16;
                ctx.beginPath();
                ctx.moveTo(fx.x1, fx.y1);
                ctx.lineTo(fx.x2, fx.y2);
                ctx.stroke();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 6;
                ctx.stroke();

                // Cross Starburst at origin
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(fx.x1 - 10, fx.y1 - 2, 20, 4);
                ctx.fillRect(fx.x1 - 2, fx.y1 - 10, 4, 20);
            } else if (fx.type === "sepsis_decay") {
                // Sepsis: Demonic Abyssal Necrotic Spikes & Decay Pool
                ctx.fillStyle = "rgba(76, 29, 149, 0.4)";
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
                ctx.fill();

                // Erupting Bone Spikes
                ctx.strokeStyle = "#06b6d4";
                ctx.lineWidth = 3;
                ctx.shadowColor = "#06b6d4";
                ctx.shadowBlur = 10;
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                    const sx = fx.x + Math.cos(a) * (fx.radius * 0.7);
                    const sy = fx.y + Math.sin(a) * (fx.radius * 0.7);
                    ctx.beginPath();
                    ctx.moveTo(fx.x, fx.y);
                    ctx.lineTo(sx, sy);
                    ctx.stroke();
                }
            } else if (fx.type === "hellfire_meteor") {
                // Lucifer: Roaring Hellfire Meteor Cataclysm
                ctx.strokeStyle = "#ef4444";
                ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
                ctx.lineWidth = 4;
                ctx.shadowColor = "#f97316";
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Fire Spikes Ring
                ctx.strokeStyle = "#facc15";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
            } else if (fx.type === "solar_pillar") {
                // Solar Valkyrie: Golden Sky Pillar & Halo
                ctx.fillStyle = "rgba(250, 204, 21, 0.4)";
                ctx.fillRect(fx.x - 18, 0, 36, fx.y);
                ctx.strokeStyle = "#fef08a";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (fx.type === "cosmic_singularity") {
                // Void Sovereign Genesis: Cosmic Singularity Black Hole
                ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Swirling Accretion Disk
                ctx.strokeStyle = "#06b6d4";
                ctx.lineWidth = 3.5;
                ctx.shadowColor = "#a855f7";
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = "#c084fc";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius * 0.8, 0, Math.PI * 2);
                ctx.stroke();
            } else if (fx.type === "thunder_burst") {
                // Thunder Striker: Jagged Lightning Bolt
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 3;
                ctx.shadowColor = "#facc15";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.moveTo(fx.x, 0);
                ctx.lineTo(fx.x - 15, fx.y * 0.4);
                ctx.lineTo(fx.x + 15, fx.y * 0.7);
                ctx.lineTo(fx.x, fx.y);
                ctx.stroke();
            } else if (fx.type === "frost_blizzard") {
                // Frost Weaver: Ice Shard Blossom
                ctx.strokeStyle = "#38bdf8";
                ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Crystalline Cross
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(fx.x - fx.radius, fx.y); ctx.lineTo(fx.x + fx.radius, fx.y);
                ctx.moveTo(fx.x, fx.y - fx.radius); ctx.lineTo(fx.x, fx.y + fx.radius);
                ctx.stroke();
            } else if (fx.type === "blade_cyclone") {
                // Blade Dancer: Silver Razor Slashes
                ctx.strokeStyle = "#e2e8f0";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, 25, 0, Math.PI * 1.5);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, 18, Math.PI * 0.5, Math.PI * 2);
                ctx.stroke();
            } else if (fx.type === "bullet_blast") {
                // Abyssal Gunner: Muzzle Explosion
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, 15, 0, Math.PI * 2);
                ctx.fill();
            } else if (fx.type === "meteor_impact") {
                // Heavenly Meteor Strike: Colossal Nuclear-scale Cosmic Impact
                const progress = 1 - (fx.duration / (fx.initialDuration || 1.2));
                const currentRadius = fx.radius * Math.min(1, progress * 1.5);
                const alpha = Math.max(0, 1 - progress);

                // Fiery Ground Shockwave Ring
                ctx.save();
                ctx.shadowColor = "#f97316";
                ctx.shadowBlur = 30;
                ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
                ctx.lineWidth = 6 * (1 - progress);
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, currentRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Blazing Plasma Core
                ctx.fillStyle = `rgba(254, 240, 138, ${alpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, currentRadius * 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Radiating Fire Sparks & Debris
                for (let k = 0; k < 12; k++) {
                    const ang = (k / 12) * Math.PI * 2 + progress * 2;
                    const sparkDist = currentRadius * (0.5 + 0.5 * progress);
                    ctx.fillStyle = k % 2 === 0 ? "#ffffff" : (k % 3 === 0 ? "#f97316" : "#facc15");
                    ctx.fillRect(fx.x + Math.cos(ang) * sparkDist - 3, fx.y + Math.sin(ang) * sparkDist - 3, 6, 6);
                }
                ctx.restore();
            } else if (fx.type === "earth_quake") {
                // Earth Titan: Ground Fissure
                ctx.strokeStyle = "#78716c";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (fx.type === "hit_spark") {
                // Standard Hit Spark
                ctx.fillStyle = fx.color || "#ffffff";
                ctx.fillRect(fx.x - 6, fx.y - 1.5, 12, 3);
                ctx.fillRect(fx.x - 1.5, fx.y - 6, 3, 12);
            } else if (fx.type === "chain_arc") {
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(fx.x1, fx.y1);
                ctx.lineTo(fx.x2, fx.y2);
                ctx.stroke();
            } else {
                // Fallback Explosion
                ctx.strokeStyle = "#f97316";
                ctx.fillStyle = "rgba(249, 115, 22, 0.25)";
                ctx.beginPath();
                ctx.arc(fx.x, fx.y, fx.radius || 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        // 9. Draw Floating Texts
        for (const ft of this.floatingTexts) {
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.fillStyle = ft.color;
            ctx.font = "bold 12px monospace";
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.globalAlpha = 1.0;
        }
    }
};

if (typeof window !== 'undefined') {
    window.CombatEngine = CombatEngine;
}
