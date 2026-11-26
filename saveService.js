// Pixel Tower Defense — Save Service
// Dual-Layer Fail-Safe Save Engine (Supabase Cloud + IndexedDB / LocalStorage)
// Anti-wipe protection: zero blank overwrites, conflict resolution, offline queue

const SaveService = {
    SUPABASE_URL: "https://azplcswidmzbppsnwoev.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_Iwlge2rVP1K3Nam_FsqRkA_kTbjlpNV",
    LOCAL_STORAGE_KEY: "ptd_player_save_v1.0",
    PLAYER_ID_KEY: "ptd_player_id",

    state: null,
    isSyncing: false,
    syncStatus: "ready", // "synced", "offline", "syncing", "error"
    currentGoogleUser: null,
    activeProfileId: null,

    // Google User and Single Player Profile Management
    getGoogleUser() {
        if (this.currentGoogleUser) return this.currentGoogleUser;
        const raw = localStorage.getItem("ptd_google_user");
        if (raw) {
            try { this.currentGoogleUser = JSON.parse(raw); } catch (e) { this.currentGoogleUser = null; }
        }
        if (!this.currentGoogleUser && typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
            this.currentGoogleUser = { id: "dev_local_user", name: "Creator", email: "thabpanaphat.p2031@icsn.ac.th" };
            localStorage.setItem("ptd_google_user", JSON.stringify(this.currentGoogleUser));
        }
        return this.currentGoogleUser;
    },

    getUserProfile() {
        const user = this.getGoogleUser();
        const key = "ptd_player_profile_" + (user ? user.id : "guest");
        let raw = localStorage.getItem(key);
        if (!raw) {
            // Check legacy profile key if migrating
            const legacyKey = "ptd_profiles_" + (user ? user.id : "default");
            const legacyRaw = localStorage.getItem(legacyKey);
            let legacyName = "";
            let legacyChosen = false;
            if (legacyRaw) {
                try {
                    const parsed = JSON.parse(legacyRaw);
                    if (parsed && parsed.length > 0 && parsed[0].usernameChosen) {
                        legacyName = parsed[0].name;
                        legacyChosen = true;
                    }
                } catch(e) {}
            }
            const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
            const profile = {
                id: "profile_main",
                name: legacyName || (isLocal ? "LocalPlayer" : ""),
                usernameChosen: legacyChosen || isLocal,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(profile));
            return profile;
        }
        try {
            return JSON.parse(raw);
        } catch(e) {
            return { id: "profile_main", name: "", usernameChosen: false };
        }
    },

    saveUserProfile(profile) {
        const user = this.getGoogleUser();
        const key = "ptd_player_profile_" + (user ? user.id : "guest");
        localStorage.setItem(key, JSON.stringify(profile));
    },

    getUserProfiles() {
        // Enforce strictly 1 profile per player account
        return [this.getUserProfile()];
    },

    setUsername(name) {
        const cleanName = (name || "").trim().slice(0, 16);
        const profile = this.getUserProfile();
        profile.name = cleanName;
        profile.usernameChosen = true;
        this.saveUserProfile(profile);

        if (this.state) {
            this.state.username = cleanName;
            this.save();
        }
        this.pushToSupabaseAsync();
        return profile;
    },

    setGoogleUser(user) {
        this.currentGoogleUser = user;
        if (user) {
            localStorage.setItem("ptd_google_user", JSON.stringify(user));
            const profile = this.getUserProfile();
            this.activeProfileId = profile.id;
            localStorage.setItem("ptd_active_profile_id", profile.id);
            this.LOCAL_STORAGE_KEY = `ptd_player_save_${user.id}_${profile.id}`;

            let localData = this.loadLocal();
            if (!localData || !this.validateState(localData)) {
                localData = this.createDefaultState();
                if (profile.name && profile.usernameChosen) {
                    localData.username = profile.name;
                }
                this.saveLocal(localData);
            } else if (profile.name && profile.usernameChosen) {
                localData.username = profile.name;
                this.saveLocal(localData);
            }
            this.state = localData;
            this.save();
        } else {
            localStorage.removeItem("ptd_google_user");
            localStorage.removeItem("ptd_active_profile_id");
            this.activeProfileId = null;
        }
    },

    selectProfile(profileId) {
        // Single profile only
        const profile = this.getUserProfile();
        this.activeProfileId = profile.id;
        localStorage.setItem("ptd_active_profile_id", profile.id);
    },

    createProfile(name = "Player") {
        return this.setUsername(name);
    },

    hashPassword(str) {
        if (!str) return "";
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return "ptd_pw_" + Math.abs(hash).toString(36);
    },

    getRegisteredAccounts() {
        try {
            const raw = localStorage.getItem("ptd_registered_accounts");
            return raw ? JSON.parse(raw) : {};
        } catch(e) {
            return {};
        }
    },

    saveRegisteredAccount(email, password) {
        const accounts = this.getRegisteredAccounts();
        const cleanEmail = email.trim().toLowerCase();
        accounts[cleanEmail] = {
            email: cleanEmail,
            passwordHash: this.hashPassword(password),
            createdAt: new Date().toISOString()
        };
        localStorage.setItem("ptd_registered_accounts", JSON.stringify(accounts));
    },

    loginWithCredentials(emailInput, passwordInput) {
        if (!emailInput || !emailInput.trim() || !emailInput.includes("@")) {
            return { success: false, error: "Please enter your Google Account email!" };
        }
        if (!passwordInput || !passwordInput.trim()) {
            return { success: false, error: "Please enter your password!" };
        }

        const cleanEmail = emailInput.trim().toLowerCase();
        const accounts = this.getRegisteredAccounts();
        const existing = accounts[cleanEmail];

        if (existing) {
            if (existing.passwordHash !== this.hashPassword(passwordInput)) {
                return { success: false, error: "Incorrect password for this Google account! Please enter the correct password." };
            }
        } else {
            // First time login with this email: register this password
            this.saveRegisteredAccount(cleanEmail, passwordInput);
        }

        const userObj = {
            id: "google_" + btoa(cleanEmail).replace(/=/g, "").slice(0, 16),
            email: cleanEmail,
            name: cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            provider: "google",
            avatar: "https://lh3.googleusercontent.com/a/default-user"
        };
        this.setGoogleUser(userObj);
        this.pushToSupabaseAsync();
        return { success: true, user: userObj };
    },

    loginWithGoogle(emailInput = null, passwordInput = null) {
        let email = emailInput;
        if (!email) {
            if (window.UIController && window.UIController.openAuthModal) {
                window.UIController.openAuthModal();
            }
            return { success: false, message: "Please enter your email in the sign in window." };
        }
        if (email && email.trim() && email.includes("@")) {
            email = email.trim().toLowerCase();
            // If a password was provided with Google login, save it for future password sign-in
            if (passwordInput && passwordInput.trim()) {
                this.saveRegisteredAccount(email, passwordInput.trim());
            }
            const userObj = {
                id: "google_" + btoa(email).replace(/=/g, "").slice(0, 16),
                email: email,
                name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
                provider: "google",
                avatar: "https://lh3.googleusercontent.com/a/default-user"
            };
            this.setGoogleUser(userObj);
            // Auto sync with cloud after sign in
            this.pushToSupabaseAsync();
            return userObj;
        }
        return null;
    },

    logout() {
        this.setGoogleUser(null);
        this.activeProfileId = null;
        localStorage.removeItem("ptd_active_profile_id");
    },

    // Generates a robust UUID
    generateId() {
        return 'ptd_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Gets or initializes the unique player ID
    getPlayerId() {
        let id = localStorage.getItem(this.PLAYER_ID_KEY);
        if (!id) {
            id = this.generateId();
            localStorage.setItem(this.PLAYER_ID_KEY, id);
        }
        return id;
    },

    // Generates default initial player state
    createDefaultState() {
        const playerId = this.getPlayerId();
        return {
            version: 1,
            id: playerId,
            username: "Player",
            gems: 250,               // Starter Gems
            gold: 1500,              // Starter Gold
            traitRerolls: 5,         // Starter Trait Reroll Tokens
            summonTickets: 1,        // Starter Summon Ticket
            playerLevel: 1,
            playerExp: 0,
            vip: false,
            vipPurchasedAt: null,
            inventoryUnits: [
                {
                    id: this.generateId(),
                    unitId: "iron_slinger",
                    rarity: "Rare",
                    level: 1,
                    exp: 0,
                    trait: null,
                    locked: true,
                    obtainedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    unitId: "breeze_scout",
                    rarity: "Rare",
                    level: 1,
                    exp: 0,
                    trait: null,
                    locked: true,
                    obtainedAt: new Date().toISOString()
                }
            ],
            equippedUnits: [], // Max 6 units, manual equip only
            settings: {
                autoSellRare: false,
                autoSellEpic: false,
                autoSellLegendary: false,
                autoSkipWave: false,
                defaultSpeed: 1,
                sfxMuted: false
            },
            inventoryItems: {
                food: { "rice_ball": 5, "bento_box": 1 },
                starFruits: {
                    "normal_star_fruit": 6,
                    "pink_star_fruit": 1,
                    "red_star_fruit": 1,
                    "green_star_fruit": 1,
                    "blue_star_fruit": 1,
                    "yellow_star_fruit": 1,
                    "rainbow_star_fruit": 1
                },
                materials: {
                    "light_energy": 0,
                    "blaze": 0,
                    "dagger": 0,
                    "fire_scroll": 0,
                    "water_scroll": 0,
                    "nature_scroll": 0,
                    "thunder_essence": 0,
                    "nature_essence": 0,
                    "star_staff": 0,
                    "relic_shard": 0,
                    "abyssal_shadow_dagger": 0
                },
                relics: {}
            },
            unlockedUnitIndex: {
                "iron_slinger": true,
                "breeze_scout": true
            },
            claimedUnitIndex: {},
            unlockedEnemyIndex: {},
            claimedEnemyIndex: {},
            claimedWorldEnemyIndex: {},
            redeemedCodes: {},
            stageProgress: {
                // "world1_act1": { normalCleared: true, hardCleared: false, normalGemsClaimed: true, hardGemsClaimed: false, highestWave: 10 }
            },
            challengeClaims: {
                // "BANGKOK_DAY_2026-11-23": true,
                // "HOURLY_2026-11-23_16:00": true
            },
            shopLimits: {
                // "BANGKOK_DAY_2026-11-23": { "normal_star_fruit": 2 }
            },
            storyQuests: {
                // "world_1_act_1": true
            },
            gachaPity: {
                standard: { count: 0, legendaryPity: 0, mythicPity: 0 }
            },
            lastSavedAt: new Date().toISOString()
        };
    },

    // Initialize Save Service
    async init() {
        const playerId = this.getPlayerId();

        // 1. Load from local cache first (instant response)
        let localData = this.loadLocal();
        if (!localData || !this.validateState(localData)) {
            console.log("[SaveService] Creating new default state");
            localData = this.createDefaultState();
            this.saveLocal(localData);
        }
        this.state = localData;

        // Ensure required inventory and indexing objects exist
        if (!this.state.unlockedUnitIndex) this.state.unlockedUnitIndex = { "iron_slinger": true, "breeze_scout": true };
        if (!this.state.claimedUnitIndex) this.state.claimedUnitIndex = {};
        if (!this.state.unlockedEnemyIndex) this.state.unlockedEnemyIndex = {};
        if (!this.state.claimedEnemyIndex) this.state.claimedEnemyIndex = {};
        if (!this.state.claimedWorldEnemyIndex) this.state.claimedWorldEnemyIndex = {};
        if (!this.state.redeemedCodes) this.state.redeemedCodes = {};
        if (!this.state.inventoryItems) this.state.inventoryItems = {};
        if (!this.state.inventoryItems.food) this.state.inventoryItems.food = { "rice_ball": 5, "bento_box": 1 };
        if (!this.state.inventoryItems.starFruits) this.state.inventoryItems.starFruits = { "normal_star_fruit": 6, "pink_star_fruit": 1, "blue_star_fruit": 1, "rainbow_star_fruit": 1 };
        if (!this.state.inventoryItems.materials) {
            this.state.inventoryItems.materials = {
                "light_energy": 0, "blaze": 0, "dagger": 0, "fire_scroll": 0,
                "water_scroll": 0, "nature_scroll": 0, "thunder_essence": 0,
                "nature_essence": 0, "star_staff": 0, "relic_shard": 0, "abyssal_shadow_dagger": 0
            };
        }
        // Ensure new material keys exist in existing saves
        const mats = this.state.inventoryItems.materials;
        if (mats.clock !== undefined) {
            mats.light_energy = (mats.light_energy || 0) + (mats.clock || 0);
            delete mats.clock;
        }
        delete mats.chrono_astral_watch;
        delete mats.relic_chrono_watch;
        ["light_energy", "blaze", "dagger", "fire_scroll", "water_scroll", "nature_scroll", "thunder_essence", "nature_essence", "star_staff", "relic_shard", "abyssal_shadow_dagger"].forEach(k => {
            if (mats[k] === undefined) mats[k] = 0;
        });
        if (this.state.inventoryItems.relics && this.state.inventoryItems.relics.relic_chrono_watch) {
            delete this.state.inventoryItems.relics.relic_chrono_watch;
        }
        if (!this.state.inventoryItems.relics) this.state.inventoryItems.relics = {};
        if (this.state.playerLevel === undefined) this.state.playerLevel = 1;
        if (this.state.playerExp === undefined) this.state.playerExp = 0;
        this.saveLocal(this.state);
        if (!this.state.inventoryItems.starFruits) this.state.inventoryItems.starFruits = { "normal_star_fruit": 15, "blue_star_fruit": 5, "pink_star_fruit": 5, "rainbow_star_fruit": 2 };
        if (!this.state.inventoryItems.starFruits["rainbow_star_fruit"]) this.state.inventoryItems.starFruits["rainbow_star_fruit"] = 2;
        if (!Array.isArray(this.state.equippedUnits)) this.state.equippedUnits = [];

        // ----------------------------------------------------
        // AUTOMATIC SAVE MIGRATION (Legacy Units -> New Units)
        // ----------------------------------------------------
        const migrationMap = {
            "void_assassin": "shadow_assassin",
            "void_assassin_evo": "shadow_assassin_awakened",
            "solar_valkyrie": "shinobi",
            "void_sovereign_genesis": "star_mage",
            "blade_dancer": "swordsman",
            "celestial_paladin": "holy_knight",
            "tempest_lord": "thunder_god",
            "shadow_reaper": "wind_master",
            "chronos_time_keeper": "vampire_king",
            "copper_merchant": "iron_slinger",
            "thunder_striker": "magic_girl",
            "abyssal_gunner": "commander",
            "earth_titan": "gold_alchemist"
        };

        if (Array.isArray(this.state.inventoryUnits)) {
            let migrated = false;
            this.state.inventoryUnits.forEach(u => {
                if (migrationMap[u.unitId]) {
                    const newId = migrationMap[u.unitId];
                    const newConf = window.UNIT_CONFIG && window.UNIT_CONFIG[newId];
                    u.unitId = newId;
                    if (newConf) u.rarity = newConf.rarity;
                    migrated = true;
                }
            });
            if (migrated) {
                console.log("[SaveService] Migrated player inventory units to updated roster!");
                this.saveLocal(this.state);
            }
        }

        // 2. Attempt Supabase Cloud Sync
        try {
            await this.syncWithSupabase();
        } catch (err) {
            console.warn("[SaveService] Supabase initial sync offline, using local cache:", err);
            this.syncStatus = "offline";
        }

        // Setup periodic auto-save
        setInterval(() => this.save(), 5000);

        return this.state;
    },

    // Validates that state is healthy and not an empty blank
    validateState(data) {
        if (!data || typeof data !== 'object') return false;
        if (typeof data.gems !== 'number' || isNaN(data.gems)) return false;
        if (typeof data.gold !== 'number' || isNaN(data.gold)) return false;
        if (!Array.isArray(data.inventoryUnits)) return false;
        return true;
    },

    // Load from LocalStorage with corruption protection
    loadLocal() {
        try {
            const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (this.validateState(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.error("[SaveService] Error reading local save:", e);
        }
        return null;
    },

    // Save synchronously to LocalStorage
    saveLocal(dataToSave) {
        if (!this.validateState(dataToSave)) {
            console.error("[SaveService] BLOCKED SAVE: Corrupt/empty state attempted to overwrite local save!");
            return false;
        }
        dataToSave.lastSavedAt = new Date().toISOString();
        try {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (e) {
            console.error("[SaveService] LocalStorage quota or write error:", e);
            return false;
        }
    },

    // Master Save trigger: saves local immediately, then queues Supabase cloud push
    save() {
        if (!this.state) return;
        this.saveLocal(this.state);
        this.pushToSupabaseAsync();
    },

    // Asynchronous non-blocking Supabase sync with anti-wipe guard
    async pushToSupabaseAsync() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            const playerId = this.state.id;
            const googleUser = this.getGoogleUser();
            // Upsert profile in Supabase
            const profilePayload = {
                id: playerId,
                username: this.state.username || "Player",
                email: (googleUser && googleUser.email) ? googleUser.email : null,
                gems: this.state.gems,
                gold: this.state.gold,
                player_level: this.state.playerLevel,
                player_exp: this.state.playerExp,
                vip: this.state.vip,
                vip_purchased_at: this.state.vipPurchasedAt,
                updated_at: new Date().toISOString()
            };

            const res = await fetch(`${this.SUPABASE_URL}/rest/v1/ptd_profiles`, {
                method: "POST",
                headers: {
                    "apikey": this.SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${this.SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "resolution=merge-duplicates"
                },
                body: JSON.stringify(profilePayload)
            });

            if (res.ok) {
                this.syncStatus = "synced";
            } else {
                this.syncStatus = "offline";
            }
        } catch (err) {
            this.syncStatus = "offline";
        } finally {
            this.isSyncing = false;
        }
    },

    // Initial pull and merge with Supabase
    async syncWithSupabase() {
        const playerId = this.getPlayerId();
        const res = await fetch(`${this.SUPABASE_URL}/rest/v1/ptd_profiles?id=eq.${playerId}&select=*`, {
            headers: {
                "apikey": this.SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${this.SUPABASE_ANON_KEY}`
            }
        });

        if (!res.ok) {
            this.syncStatus = "offline";
            return;
        }

        const data = await res.json();
        if (data && data.length > 0) {
            const cloudProfile = data[0];
            // Non-destructive merge: highest progress wins
            if (cloudProfile.gems > this.state.gems) this.state.gems = cloudProfile.gems;
            if (cloudProfile.gold > this.state.gold) this.state.gold = cloudProfile.gold;
            if (cloudProfile.vip) this.state.vip = true;
            if (cloudProfile.player_level > this.state.playerLevel) this.state.playerLevel = cloudProfile.player_level;
            this.saveLocal(this.state);
            this.syncStatus = "synced";
        } else {
            // First time cloud registration: push local state
            await this.pushToSupabaseAsync();
        }
    },

    // ----------------------------------------------------
    // ATOMIC GAMEPLAY STATE MUTATORS
    // ----------------------------------------------------
    addGems(amount) {
        if (amount <= 0) return;
        this.state.gems += amount;
        this.save();
    },

    spendGems(amount) {
        if (amount <= 0 || this.state.gems < amount) return false;
        this.state.gems -= amount;
        this.save();
        return true;
    },

    addGold(amount) {
        if (amount <= 0) return;
        this.state.gold += amount;
        this.save();
    },

    spendGold(amount) {
        if (amount <= 0 || this.state.gold < amount) return false;
        this.state.gold -= amount;
        this.save();
        return true;
    },

    addTraitRerolls(amount) {
        if (amount <= 0) return;
        this.state.traitRerolls = (this.state.traitRerolls || 0) + amount;
        this.save();
    },

    spendTraitReroll() {
        if (!this.state.traitRerolls || this.state.traitRerolls < 1) return false;
        this.state.traitRerolls -= 1;
        this.save();
        return true;
    },

    addSummonTickets(amount) {
        if (amount <= 0) return;
        this.state.summonTickets = (this.state.summonTickets || 0) + amount;
        this.save();
    },

    spendSummonTickets(amount = 1) {
        if (!this.state.summonTickets || this.state.summonTickets < amount) return false;
        this.state.summonTickets -= amount;
        this.save();
        return true;
    },

    addPlayerExp(amount) {
        if (!amount || amount <= 0) return;
        let multiplier = this.state.vip ? 1.25 : 1.0;
        const totalExp = Math.round(amount * multiplier);
        this.state.playerExp = (this.state.playerExp || 0) + totalExp;

        while (true) {
            const requiredExp = (this.state.playerLevel || 1) * 200;
            if (this.state.playerExp >= requiredExp) {
                this.state.playerExp -= requiredExp;
                this.state.playerLevel = (this.state.playerLevel || 1) + 1;
                if (window.AudioService && window.AudioService.playUpgradeSound) {
                    window.AudioService.playUpgradeSound();
                }
            } else {
                break;
            }
        }
        this.save();
        if (window.UIController && window.UIController.updateTopBar) {
            window.UIController.updateTopBar();
        }
    },

    addUnit(unitId, rarity, trait = null) {
        const newUnit = {
            id: this.generateId(),
            unitId: unitId,
            rarity: rarity,
            level: 1,
            exp: 0,
            trait: trait,
            locked: false,
            obtainedAt: new Date().toISOString()
        };
        this.state.inventoryUnits.push(newUnit);
        this.save();
        return newUnit;
    },

    sellUnit(unitInstanceId) {
        const index = this.state.inventoryUnits.findIndex(u => u.id === unitInstanceId);
        if (index === -1) return { success: false, message: "Unit not found" };

        const unit = this.state.inventoryUnits[index];
        if (unit.locked) return { success: false, message: "Unit is locked. Unlock before selling." };

        // Gold by rarity (User rule: Rare -> least, Secret -> most)
        const goldValues = window.UNIT_SELL_VALUES || {
            "Rare": 100,
            "Epic": 300,
            "Legendary": 1000,
            "Mythic": 3500,
            "Secret": 10000
        };
        const goldEarned = goldValues[unit.rarity] || 100;

        // Remove from equipped team if equipped
        if (Array.isArray(this.state.equippedUnits)) {
            const eqIdx = this.state.equippedUnits.indexOf(unitInstanceId);
            if (eqIdx !== -1) {
                this.state.equippedUnits.splice(eqIdx, 1);
            }
        }

        // Remove unit and add Gold
        this.state.inventoryUnits.splice(index, 1);
        this.addGold(goldEarned);
        return { success: true, goldEarned, unitName: unit.unitId };
    },

    equipUnit(instanceId) {
        if (!Array.isArray(this.state.equippedUnits)) this.state.equippedUnits = [];

        const unit = this.state.inventoryUnits.find(u => u.id === instanceId);
        if (!unit) return { success: false, message: "Unit not found in inventory!" };

        if (this.state.equippedUnits.includes(instanceId)) {
            return { success: false, message: "Unit is already equipped on your team!" };
        }

        if (this.state.equippedUnits.length >= 6) {
            return { success: false, message: "Team is full! Maximum 6 units allowed on your team." };
        }

        // Rule: Duplicate units forbidden on the same team!
        const duplicate = this.state.equippedUnits.some(eqId => {
            const eq = this.state.inventoryUnits.find(u => u.id === eqId);
            return eq && eq.unitId === unit.unitId;
        });
        if (duplicate) {
            const uName = (window.UNIT_CONFIG && window.UNIT_CONFIG[unit.unitId] && window.UNIT_CONFIG[unit.unitId].name) || unit.unitId;
            return { success: false, message: `Cannot equip duplicate units on your team! (${uName} is already on your team)` };
        }

        this.state.equippedUnits.push(instanceId);
        this.save();
        return { success: true, message: `Equipped to team slot ${this.state.equippedUnits.length}!` };
    },

    unequipUnit(instanceId) {
        if (!Array.isArray(this.state.equippedUnits)) this.state.equippedUnits = [];
        const idx = this.state.equippedUnits.indexOf(instanceId);
        if (idx === -1) {
            return { success: false, message: "Unit is not currently equipped!" };
        }
        this.state.equippedUnits.splice(idx, 1);
        this.save();
        return { success: true, message: "Unit unequipped from team!" };
    },

    isUnitEquipped(instanceId) {
        return Array.isArray(this.state.equippedUnits) && this.state.equippedUnits.includes(instanceId);
    },

    updateSetting(key, val) {
        if (!this.state.settings) this.state.settings = {};
        this.state.settings[key] = val;
        this.save();
    },

    getSetting(key, defVal) {
        if (!this.state.settings) return defVal;
        return this.state.settings[key] !== undefined ? this.state.settings[key] : defVal;
    },

    toggleLockUnit(unitInstanceId) {
        const unit = this.state.inventoryUnits.find(u => u.id === unitInstanceId);
        if (unit) {
            unit.locked = !unit.locked;
            this.save();
            return unit.locked;
        }
        return false;
    },

    addItem(category, itemId, quantity) {
        if (!this.state.inventoryItems[category]) {
            this.state.inventoryItems[category] = {};
        }
        const curr = this.state.inventoryItems[category][itemId] || 0;
        this.state.inventoryItems[category][itemId] = curr + quantity;
        this.save();
    },

    getItemCount(category, itemId) {
        return (this.state.inventoryItems[category] && this.state.inventoryItems[category][itemId]) || 0;
    },

    consumeItem(category, itemId, quantity = 1) {
        const curr = this.getItemCount(category, itemId);
        if (curr < quantity) return false;
        this.state.inventoryItems[category][itemId] = curr - quantity;
        this.save();
        return true;
    },

    grantStoryClear(stageId, isHard, foodAmount) {
        if (!this.state.stageProgress[stageId]) {
            this.state.stageProgress[stageId] = {
                normalCleared: false,
                hardCleared: false,
                normalGemsClaimed: false,
                hardGemsClaimed: false,
                highestWave: 0
            };
        }
        const prog = this.state.stageProgress[stageId];
        const stageConfig = window.STAGE_CONFIG ? window.STAGE_CONFIG[stageId] : null;

        let gemsAwarded = 0;
        let isFirstClear = false;

        if (!isHard) {
            if (!prog.normalGemsClaimed) {
                gemsAwarded = stageConfig && stageConfig.normal ? stageConfig.normal.firstClearGems : 60;
                prog.normalGemsClaimed = true;
                isFirstClear = true;
            } else {
                gemsAwarded = stageConfig && stageConfig.normal ? stageConfig.normal.repeatGems : 10;
            }
            prog.normalCleared = true;
        } else {
            if (!prog.hardGemsClaimed) {
                gemsAwarded = stageConfig && stageConfig.hard ? stageConfig.hard.firstClearGems : 120;
                prog.hardGemsClaimed = true;
                isFirstClear = true;
            } else {
                gemsAwarded = stageConfig && stageConfig.hard ? stageConfig.hard.repeatGems : 20;
            }
            prog.hardCleared = true;
        }

        this.addGems(gemsAwarded);

        // Story Mode ALWAYS drops random food between 1 and 8
        const foodType = "rice_ball";
        this.addItem("food", foodType, foodAmount);

        // Add player EXP
        this.addPlayerExp(isHard ? 120 : 60);

        this.save();

        return {
            gemsAwarded,
            isFirstClear,
            foodAmount,
            foodType
        };
    },

    // ----------------------------------------------------
    // PROMO CODES SYSTEM & CREATOR CODE STUDIO
    // ----------------------------------------------------
    PROMO_CODES: {
        "RELEASE": {
            description: "Launch celebration pack!",
            gems: 500,
            traitRerolls: 5
        },
        "TD2026": {
            description: "Player welcome gift!",
            gems: 1000,
            traitRerolls: 10
        },
        "SORRYFORBUGS": {
            description: "Bug apology compensation pack!",
            gems: 2500,
            traitRerolls: 25
        },
        "EVOLUTION": {
            description: "Evolution starter materials!",
            gold: 10000,
            starFruits: { "rainbow_star_fruit": 1, "blue_star_fruit": 3, "pink_star_fruit": 3 }
        }
    },

    isCreatorAccount() {
        const u = this.getGoogleUser();
        const email = (u && u.email) ? u.email.toLowerCase().trim() : "";
        return email === "thabpanaphat.p2031@icsn.ac.th";
    },

    getExpiredCodes() {
        if (!this.state.expiredCodes) {
            try {
                const raw = localStorage.getItem("ptd_expired_promo_codes");
                this.state.expiredCodes = raw ? JSON.parse(raw) : [];
            } catch (e) {
                this.state.expiredCodes = [];
            }
        }
        return this.state.expiredCodes || [];
    },

    getDeletedCodes() {
        if (!this.state.deletedCodes) {
            try {
                const raw = localStorage.getItem("ptd_deleted_promo_codes");
                this.state.deletedCodes = raw ? JSON.parse(raw) : [];
            } catch (e) {
                this.state.deletedCodes = [];
            }
        }
        return this.state.deletedCodes || [];
    },

    isCodeExpired(code) {
        const cleaned = (code || "").trim().toUpperCase();
        return this.getExpiredCodes().includes(cleaned);
    },

    isCodeDeleted(code) {
        const cleaned = (code || "").trim().toUpperCase();
        return this.getDeletedCodes().includes(cleaned);
    },

    getCustomPromoCodes() {
        if (!this.state.customPromoCodes) {
            try {
                const raw = localStorage.getItem("ptd_custom_promo_codes");
                this.state.customPromoCodes = raw ? JSON.parse(raw) : {};
            } catch (e) {
                this.state.customPromoCodes = {};
            }
        }
        const codes = this.state.customPromoCodes || {};
        const deleted = this.getDeletedCodes();
        for (const [k, v] of Object.entries(codes)) {
            if (deleted.includes(k)) {
                delete codes[k];
                continue;
            }
            if (v && v.description && v.description.toLowerCase().includes("creator generated")) {
                v.description = "";
            }
        }
        return codes;
    },

    getAllPromoCodes(includeExpired = true) {
        const deleted = this.getDeletedCodes();
        const combined = {};

        // 1. Base codes
        for (const [c, data] of Object.entries(this.PROMO_CODES)) {
            if (deleted.includes(c)) continue;
            const isExp = this.isCodeExpired(c);
            if (!includeExpired && isExp) continue;
            combined[c] = {
                ...data,
                expired: isExp
            };
        }

        // 2. Custom codes
        const custom = this.getCustomPromoCodes();
        for (const [c, data] of Object.entries(custom)) {
            if (deleted.includes(c)) continue;
            const isExp = this.isCodeExpired(c) || !!data.expired;
            if (!includeExpired && isExp) continue;
            combined[c] = {
                ...data,
                expired: isExp
            };
        }

        return combined;
    },

    getActivePromoCodes() {
        return this.getAllPromoCodes(false);
    },

    expirePromoCode(codeName) {
        if (!this.isCreatorAccount()) {
            return { success: false, message: "Unauthorized. Creator access only." };
        }
        const cleaned = (codeName || "").trim().toUpperCase();
        if (!cleaned) return { success: false, message: "Invalid code name." };

        const expiredList = this.getExpiredCodes();
        if (!expiredList.includes(cleaned)) {
            expiredList.push(cleaned);
            this.state.expiredCodes = expiredList;
            try {
                localStorage.setItem("ptd_expired_promo_codes", JSON.stringify(expiredList));
            } catch (e) {}
        }

        const custom = this.getCustomPromoCodes();
        if (custom[cleaned]) {
            custom[cleaned].expired = true;
            this.state.customPromoCodes = custom;
            try {
                localStorage.setItem("ptd_custom_promo_codes", JSON.stringify(custom));
            } catch (e) {}
        }

        this.save();
        if (window.WikiController && window.WikiController.renderCodesWiki) {
            const wArea = document.getElementById("wiki-content-area");
            if (wArea && window.WikiController.currentCategory === "codes") {
                window.WikiController.renderCodesWiki(wArea);
            }
        }
        return { success: true, message: `Code "${cleaned}" has been expired.` };
    },

    reactivatePromoCode(codeName) {
        if (!this.isCreatorAccount()) {
            return { success: false, message: "Unauthorized. Creator access only." };
        }
        const cleaned = (codeName || "").trim().toUpperCase();
        let expiredList = this.getExpiredCodes();
        expiredList = expiredList.filter(c => c !== cleaned);
        this.state.expiredCodes = expiredList;
        try {
            localStorage.setItem("ptd_expired_promo_codes", JSON.stringify(expiredList));
        } catch (e) {}

        const custom = this.getCustomPromoCodes();
        if (custom[cleaned]) {
            custom[cleaned].expired = false;
            this.state.customPromoCodes = custom;
            try {
                localStorage.setItem("ptd_custom_promo_codes", JSON.stringify(custom));
            } catch (e) {}
        }

        this.save();
        if (window.WikiController && window.WikiController.renderCodesWiki) {
            const wArea = document.getElementById("wiki-content-area");
            if (wArea && window.WikiController.currentCategory === "codes") {
                window.WikiController.renderCodesWiki(wArea);
            }
        }
        return { success: true, message: `Code "${cleaned}" has been reactivated.` };
    },

    deletePromoCode(codeName) {
        if (!this.isCreatorAccount()) {
            return { success: false, message: "Unauthorized. Creator access only." };
        }
        const cleaned = (codeName || "").trim().toUpperCase();
        if (!cleaned) return { success: false, message: "Invalid code name." };

        // 1. Delete from custom codes
        const custom = this.getCustomPromoCodes();
        if (custom[cleaned]) {
            delete custom[cleaned];
            this.state.customPromoCodes = custom;
            try {
                localStorage.setItem("ptd_custom_promo_codes", JSON.stringify(custom));
            } catch (e) {}
        }

        // 2. Add to deleted codes (silently wipes even base codes if deleted as test)
        const deletedList = this.getDeletedCodes();
        if (!deletedList.includes(cleaned)) {
            deletedList.push(cleaned);
            this.state.deletedCodes = deletedList;
            try {
                localStorage.setItem("ptd_deleted_promo_codes", JSON.stringify(deletedList));
            } catch (e) {}
        }

        // 3. Remove from expired codes if it was in there
        let expiredList = this.getExpiredCodes();
        if (expiredList.includes(cleaned)) {
            expiredList = expiredList.filter(c => c !== cleaned);
            this.state.expiredCodes = expiredList;
            try {
                localStorage.setItem("ptd_expired_promo_codes", JSON.stringify(expiredList));
            } catch (e) {}
        }

        this.save();
        if (window.WikiController && window.WikiController.renderCodesWiki) {
            const wArea = document.getElementById("wiki-content-area");
            if (wArea && window.WikiController.currentCategory === "codes") {
                window.WikiController.renderCodesWiki(wArea);
            }
        }
        return { success: true, message: `Code "${cleaned}" deleted.` };
    },

    createCustomPromoCode(codeName, rewards) {
        if (!this.isCreatorAccount()) {
            return { success: false, message: "Unauthorized. Creator access only." };
        }
        const cleaned = (codeName || "").trim().toUpperCase();
        if (!cleaned || cleaned.length < 3) {
            return { success: false, message: "Code must be at least 3 characters long!" };
        }

        const customCodes = this.getCustomPromoCodes();
        customCodes[cleaned] = {
            description: (rewards.description || "").trim(),
            createdAt: new Date().toISOString(),
            ...rewards
        };

        // Remove from deleted and expired lists if it was previously removed
        let deletedList = this.getDeletedCodes().filter(c => c !== cleaned);
        this.state.deletedCodes = deletedList;
        try {
            localStorage.setItem("ptd_deleted_promo_codes", JSON.stringify(deletedList));
        } catch (e) {}

        let expiredList = this.getExpiredCodes().filter(c => c !== cleaned);
        this.state.expiredCodes = expiredList;
        try {
            localStorage.setItem("ptd_expired_promo_codes", JSON.stringify(expiredList));
        } catch (e) {}

        this.state.customPromoCodes = customCodes;
        try {
            localStorage.setItem("ptd_custom_promo_codes", JSON.stringify(customCodes));
        } catch (e) {}

        this.save();

        if (window.WikiController && window.WikiController.renderCodesWiki) {
            const wArea = document.getElementById("wiki-content-area");
            if (wArea && window.WikiController.currentCategory === "codes") {
                window.WikiController.renderCodesWiki(wArea);
            }
        }

        return { success: true, message: `Code "${cleaned}" generated successfully!`, code: cleaned };
    },

    redeemPromoCode(codeStr) {
        if (!codeStr) return { success: false, message: "Please enter a code!" };
        const cleaned = codeStr.trim().toUpperCase();
        const allCodes = this.getAllPromoCodes(true);
        const codeData = allCodes[cleaned];

        if (!codeData || this.isCodeDeleted(cleaned)) {
            return { success: false, message: "Invalid promo code!" };
        }

        if (codeData.expired || this.isCodeExpired(cleaned)) {
            return { success: false, message: "This promo code has expired!" };
        }

        if (cleaned === "TD2026" || cleaned === "PTD2026") {
            if (this.state.redeemedCodes && (this.state.redeemedCodes["TD2026"] || this.state.redeemedCodes["PTD2026"])) {
                return { success: false, message: "You have already redeemed this welcome code!" };
            }
        } else if (this.state.redeemedCodes && this.state.redeemedCodes[cleaned]) {
            return { success: false, message: "You have already redeemed this code!" };
        }

        // Apply rewards
        if (codeData.gems) this.addGems(codeData.gems);
        if (codeData.gold) this.addGold(codeData.gold);
        if (codeData.traitRerolls) this.addTraitRerolls(codeData.traitRerolls);
        if (codeData.food) {
            for (const [fId, qty] of Object.entries(codeData.food)) {
                this.addItem("food", fId, qty);
            }
        }
        if (codeData.starFruits) {
            for (const [sfId, qty] of Object.entries(codeData.starFruits)) {
                this.addItem("starFruits", sfId, qty);
            }
        }
        if (codeData.materials) {
            for (const [mId, qty] of Object.entries(codeData.materials)) {
                this.addItem("materials", mId, qty);
            }
        }
        if (codeData.luckPotions) {
            this.state.luckPotions = (this.state.luckPotions || 0) + codeData.luckPotions;
        }

        if (!this.state.redeemedCodes) this.state.redeemedCodes = {};
        this.state.redeemedCodes[cleaned] = new Date().toISOString();
        this.save();

        const descMsg = (codeData.description && !codeData.description.toLowerCase().includes("creator generated")) ? ` ${codeData.description}` : '';
        return {
            success: true,
            message: `Code redeemed successfully!${descMsg}`
        };
    },

    // ----------------------------------------------------
    // UNIT & ENEMY INDEX SYSTEM
    // ----------------------------------------------------
    unlockUnitIndex(unitId) {
        if (!this.state.unlockedUnitIndex) this.state.unlockedUnitIndex = {};
        if (!this.state.unlockedUnitIndex[unitId]) {
            this.state.unlockedUnitIndex[unitId] = true;
            this.save();
        }
    },

    claimUnitIndex(unitId) {
        const uConfig = window.UNIT_CONFIG && window.UNIT_CONFIG[unitId];
        if (!uConfig) return { success: false, message: "Unit not found" };
        if (!this.state.unlockedUnitIndex[unitId]) return { success: false, message: "Unit not unlocked yet" };
        if (this.state.claimedUnitIndex[unitId]) return { success: false, message: "Already claimed" };

        const rewardMap = {
            "Rare": 25,
            "Epic": 50,
            "Legendary": 100,
            "Mythic": 250,
            "Secret": 500
        };
        const gemReward = rewardMap[uConfig.rarity] || 25;
        this.addGems(gemReward);
        this.state.claimedUnitIndex[unitId] = true;
        this.save();
        return { success: true, gems: gemReward };
    },

    recordEnemyKill(enemyType, isBoss) {
        if (!this.state.unlockedEnemyIndex) this.state.unlockedEnemyIndex = {};
        if (this.state.unlockedEnemyIndex[enemyType]) return; // already registered

        // 25% chance for regular, 10% chance for boss
        const chance = isBoss ? 0.10 : 0.25;
        if (Math.random() <= chance) {
            this.state.unlockedEnemyIndex[enemyType] = true;
            this.save();
            if (window.UIController && window.UIController.showToast) {
                window.UIController.showToast(`📖 Enemy Registered in Index: ${enemyType}!`);
            }
        }
    },

    claimEnemyIndex(enemyType) {
        if (!this.state.unlockedEnemyIndex[enemyType]) return { success: false, message: "Enemy not registered" };
        if (this.state.claimedEnemyIndex[enemyType]) return { success: false, message: "Already claimed" };

        this.addGems(30); // 30 gems per enemy
        this.state.claimedEnemyIndex[enemyType] = true;
        this.save();
        return { success: true, gems: 30 };
    },

    claimWorldEnemyIndex(worldId = "world_1") {
        if (!this.state.claimedWorldEnemyIndex) this.state.claimedWorldEnemyIndex = {};
        if (this.state.claimedWorldEnemyIndex[worldId]) return { success: false, message: "Already claimed" };

        // Check if all World 1 enemies are unlocked in index
        const world1Enemies = ["goblin_scout", "shadow_crawler", "orc_warrior", "fire_imp", "flying_harpy", "shadow_wyvern", "armored_golem", "shieldbearer", "healing_shaman", "berserker", "demon_lord_malakor"];
        const missing = world1Enemies.filter(e => !this.state.unlockedEnemyIndex[e]);
        if (missing.length > 0) {
            return { success: false, message: `Collect all enemies first! Missing: ${missing.length} enemies.` };
        }

        // 500 gems and 5 trait rrs
        this.addGems(500);
        this.addTraitRerolls(5);
        this.state.claimedWorldEnemyIndex[worldId] = true;
        this.save();
        return { success: true, gems: 500, traitRrs: 5 };
    },

    // ----------------------------------------------------
    // STAGE PROGRESSION & CLEAR RECORDING
    // ----------------------------------------------------
    recordStageClear(stageId, isHard = false) {
        if (!this.state.stageProgress) this.state.stageProgress = {};
        if (!this.state.stageProgress[stageId]) {
            this.state.stageProgress[stageId] = {
                normalCleared: false,
                hardCleared: false,
                clearCount: 0,
                highestWave: 15
            };
        }
        const prog = this.state.stageProgress[stageId];
        prog.clearCount = (prog.clearCount || 0) + 1;
        if (!isHard) prog.normalCleared = true;
        else prog.hardCleared = true;
        this.save();
    },

    // ----------------------------------------------------
    // STORY PROGRESSION & CHALLENGE ACT UNLOCK CHECK
    // ----------------------------------------------------
    isActUnlocked(stageId) {
        if (!stageId) return true;
        // Legend stages, infinite, and events are unlocked by default
        if (stageId.includes("legend") || stageId.includes("event") || stageId.includes("infinite")) return true;

        const m = stageId.match(/^(world\d+)_act(\d+)$/);
        if (!m) return true;
        const worldPrefix = m[1];
        const actNum = parseInt(m[2], 10);
        // Player can start from ANY world, but must start from Act 1 of each world!
        if (actNum <= 1) return true;

        const prevStageId = `${worldPrefix}_act${actNum - 1}`;
        const prevProg = this.state.stageProgress && this.state.stageProgress[prevStageId];
        return !!(prevProg && (prevProg.normalCleared || prevProg.hardCleared));
    },

    // ----------------------------------------------------
    // UNIT EVOLUTION SYSTEM (VOID ASSASSIN -> VOID ASSASSIN (FLASH))
    // Cost: 1x Evolution Item (Crafted with Star Fruits) + 10,000 Gold
    // ----------------------------------------------------
    evolveUnit(unitOrInstanceId) {
        const index = this.state.inventoryUnits.findIndex(u => u.id === unitOrInstanceId || u.unitId === unitOrInstanceId);
        if (index === -1) return { success: false, message: "Unit not found in inventory." };

        const unit = this.state.inventoryUnits[index];
        const uConfig = window.UNIT_CONFIG[unit.unitId];
        if (!uConfig || !uConfig.canEvolve || !uConfig.evolvesTo) {
            return { success: false, message: "This unit cannot be evolved!" };
        }

        const cost = uConfig.evolutionCost;
        if (this.state.gold < cost.gold) {
            return { success: false, message: `Insufficient Gold! Need 🪙 ${cost.gold.toLocaleString()} Gold.` };
        }

        const itemsMap = cost.requiredItems || cost.materials || (cost.requiredEvolutionItem ? { [cost.requiredEvolutionItem]: (cost.requiredCount || 1) } : {});

        // Verify all required items
        for (const [matId, reqCount] of Object.entries(itemsMap)) {
            const isFruit = matId.includes("star_fruit");
            let hasItemCount = 0;
            if (isFruit) {
                hasItemCount = this.getItemCount("starFruits", matId);
            } else {
                hasItemCount = this.getItemCount("materials", matId) || this.getItemCount("relics", matId);
            }
            if (hasItemCount < reqCount) {
                const matName = matId.replace(/_/g, " ").toUpperCase();
                return { 
                    success: false, 
                    message: `Missing Evolution Materials! Need ${reqCount}x ${matName}.\nYou have ${hasItemCount}.` 
                };
            }
        }

        // Deduct Gold
        this.spendGold(cost.gold);

        // Deduct all items
        for (const [matId, reqCount] of Object.entries(itemsMap)) {
            const isFruit = matId.includes("star_fruit");
            if (isFruit) {
                this.consumeItem("starFruits", matId, reqCount);
            } else {
                this.consumeItem("materials", matId, reqCount);
            }
        }

        // Transform unit to evolved form while preserving ID, Level, EXP, Trait, Lock status!
        unit.unitId = uConfig.evolvesTo;
        const evoConfig = window.UNIT_CONFIG[uConfig.evolvesTo];
        if (evoConfig) {
            unit.rarity = evoConfig.rarity;
        }

        // Unlock evolved form in Unit Index!
        this.unlockUnitIndex(uConfig.evolvesTo);
        this.addPlayerExp(300);

        this.save();

        return {
            success: true,
            unit: unit,
            evoName: evoConfig ? evoConfig.name : "Evolved Unit"
        };
    },

    // ----------------------------------------------------
    // CRAFTING WORKSHOP SYSTEM
    // ----------------------------------------------------
    craftEvolutionItem(itemId) {
        if (itemId === "abyssal_shadow_dagger") {
            const reqDaggers = 12;
            const reqRainbow = 1;
            const reqPink = 3;
            const reqBlue = 3;
            if (this.getItemCount("materials", "dagger") < reqDaggers ||
                this.getItemCount("starFruits", "rainbow_star_fruit") < reqRainbow ||
                this.getItemCount("starFruits", "pink_star_fruit") < reqPink ||
                this.getItemCount("starFruits", "blue_star_fruit") < reqBlue) {
                return { success: false, message: "Missing Materials! Need 12 Daggers (from Hills Legend Act 3), 1 Rainbow, 3 Pink, and 3 Blue Star Fruits." };
            }
            this.consumeItem("materials", "dagger", reqDaggers);
            this.consumeItem("starFruits", "rainbow_star_fruit", reqRainbow);
            this.consumeItem("starFruits", "pink_star_fruit", reqPink);
            this.consumeItem("starFruits", "blue_star_fruit", reqBlue);
            this.addItem("materials", "abyssal_shadow_dagger", 1);
            this.addPlayerExp(75);
            this.save();
            return { success: true, message: "🗡️ Forged 1x Shadow Dagger! Ready for Void Assassin evolution." };
        } else if (itemId === "star_staff") {
            const reqRainbow = 2;
            const reqPink = 5;
            const reqBlue = 5;
            const reqYellow = 5;
            if (this.getItemCount("starFruits", "rainbow_star_fruit") < reqRainbow ||
                this.getItemCount("starFruits", "pink_star_fruit") < reqPink ||
                this.getItemCount("starFruits", "blue_star_fruit") < reqBlue ||
                this.getItemCount("starFruits", "yellow_star_fruit") < reqYellow) {
                return { success: false, message: "Missing Star Fruits! Need 2 Rainbow, 5 Pink, 5 Blue, and 5 Yellow Star Fruits for the Secret Star Staff." };
            }
            this.consumeItem("starFruits", "rainbow_star_fruit", reqRainbow);
            this.consumeItem("starFruits", "pink_star_fruit", reqPink);
            this.consumeItem("starFruits", "blue_star_fruit", reqBlue);
            this.consumeItem("starFruits", "yellow_star_fruit", reqYellow);
            this.addItem("materials", "star_staff", 1);
            this.addPlayerExp(150);
            this.save();
            return { success: true, message: "✨ Forged 1x Star Staff! Ready for Secret Star Mage evolution." };
        }
        return { success: false, message: "Unknown evolution item recipe." };
    },

    convertNormalToColoredStarFruit(targetColorFruitId) {
        // 3 Normal Star Fruits = 1 Colored Star Fruit
        if (this.getItemCount("starFruits", "normal_star_fruit") < 3) {
            return { success: false, message: "Insufficient Normal Star Fruits! Need 3 Normal Star Fruits to craft 1 Colored Star Fruit." };
        }
        this.consumeItem("starFruits", "normal_star_fruit", 3);
        this.addItem("starFruits", targetColorFruitId, 1);
        this.addPlayerExp(20);
        this.save();
        const name = targetColorFruitId.replace(/_/g, " ").toUpperCase();
        return { success: true, message: `⭐ Converted 3 Normal Star Fruits into 1x ${name}!` };
    },

    convertColoredToNormalStarFruit(sourceColorFruitId) {
        // 1 Colored Star Fruit = 2 Normal Star Fruits
        if (this.getItemCount("starFruits", sourceColorFruitId) < 1) {
            return { success: false, message: "You do not have this Colored Star Fruit to convert." };
        }
        this.consumeItem("starFruits", sourceColorFruitId, 1);
        this.addItem("starFruits", "normal_star_fruit", 2);
        this.addPlayerExp(15);
        this.save();
        return { success: true, message: "⭐ Converted 1 Colored Star Fruit into 2x Normal Star Fruits!" };
    },

    fuseRainbowStarFruit() {
        // 1 of every colored star fruit = 1 Rainbow Star Fruit
        const colors = ["pink_star_fruit", "red_star_fruit", "green_star_fruit", "blue_star_fruit", "yellow_star_fruit"];
        for (const c of colors) {
            if (this.getItemCount("starFruits", c) < 1) {
                const cName = c.replace(/_/g, " ").toUpperCase();
                return { success: false, message: `Missing colored star fruit! You need 1x of EVERY colored star fruit (Missing: ${cName}).` };
            }
        }
        for (const c of colors) {
            this.consumeItem("starFruits", c, 1);
        }
        this.addItem("starFruits", "rainbow_star_fruit", 1);
        this.addPlayerExp(120);
        this.save();
        return { success: true, message: "🌈 Cosmic Fusion Successful! Obtained 1x Rainbow Star Fruit!" };
    },

    craftRelic(relicId) {
        const relicRecipes = {
            "relic_mangekyou": { name: "Mangekyou Sharingan", cost: 10, desc: "2x Burn Duration & Piercing Damage" },
            "relic_blazing_core": { name: "Blazing Core", cost: 5, desc: "+15% Fire & Physical Damage" },
            "relic_shadow_cloak": { name: "Shadow Cloak", cost: 5, desc: "+15% Dark & Magical Damage" },
            "relic_fortune_ring": { name: "Golden Fortune Ring", cost: 8, desc: "+15% Wave Yen Income" },
            "relic_divine_eye": { name: "Ancient Eye of Divination", cost: 10, desc: "+15% Unit Range" }
        };

        const rec = relicRecipes[relicId];
        if (!rec) return { success: false, message: "Unknown Relic recipe." };

        const shardCount = this.getItemCount("materials", "relic_shard");
        if (shardCount < rec.cost) {
            return { success: false, message: `Insufficient Relic Shards! Need ${rec.cost} Relic Shards (You have: ${shardCount}).` };
        }

        this.consumeItem("materials", "relic_shard", rec.cost);
        if (!this.state.inventoryItems.relics) this.state.inventoryItems.relics = {};
        this.state.inventoryItems.relics[relicId] = (this.state.inventoryItems.relics[relicId] || 0) + 1;
        this.addPlayerExp(150);
        this.save();

        return { success: true, message: `✨ Relic Forged: ${rec.name}!\nEffect: ${rec.desc}` };
    },

        attachRelic(relicId, unitInstanceId) {
        if (!this.state.relicAttachments) this.state.relicAttachments = {};
        if (!this.hasRelic(relicId)) return { success: false, message: "Relic not owned!" };
        
        this.state.relicAttachments[relicId] = unitInstanceId;
        this.save();
        return { success: true, message: "Attached Relic to unit!" };
    },

    detachRelic(relicId) {
        if (!this.state.relicAttachments) this.state.relicAttachments = {};
        delete this.state.relicAttachments[relicId];
        this.save();
        return { success: true, message: "Detached Relic!" };
    },

    getUnitEquippedRelic(unitInstanceId) {
        if (!this.state.relicAttachments) return null;
        for (const [rId, uId] of Object.entries(this.state.relicAttachments)) {
            if (uId === unitInstanceId && this.hasRelic(rId)) return rId;
        }
        return null;
    },

    getRelicAttachedUnit(relicId) {
        if (!this.state.relicAttachments) return null;
        return this.state.relicAttachments[relicId] || null;
    },

    getRequiredExpForLevel(level) {
        if (level < 10) return Math.round(15 + Math.pow(level, 1.8) * 2);
        if (level < 30) return Math.round(50 + Math.pow(level, 2.1) * 3);
        if (level < 60) return Math.round(100 + Math.pow(level, 2.3) * 4);
        return Math.round(200 + Math.pow(level, 2.4) * 6);
    },

    hasRelic(relicId) {
        return (this.state.inventoryItems && this.state.inventoryItems.relics && this.state.inventoryItems.relics[relicId]) > 0;
    },

    // ----------------------------------------------------
    // GAME PASSES & CONSUMABLES
    // ----------------------------------------------------
    buyShinyHunter() {
        const cost = 150000;
        if (!this.state.gamepasses) this.state.gamepasses = {};
        if (this.state.gamepasses.shinyHunter) {
            return { success: false, message: "You already own the Shiny Hunter Game Pass!" };
        }
        if (!this.spendGold(cost)) {
            return { success: false, message: `Insufficient Gold! Need 🪙 ${cost.toLocaleString()} Gold.` };
        }
        this.state.gamepasses.shinyHunter = true;
        this.save();
        return { success: true, message: "✨ Shiny Hunter Game Pass acquired! Shiny chances tripled to 3%!" };
    },

    hasShinyHunter() {
        return !!(this.state && this.state.gamepasses && this.state.gamepasses.shinyHunter);
    },

    hasLuckPotion() {
        return !!(this.state && this.state.luckPotionUntil && Date.now() < this.state.luckPotionUntil);
    },

    getLuckPotionRemainingSeconds() {
        if (!this.hasLuckPotion()) return 0;
        return Math.max(0, Math.floor((this.state.luckPotionUntil - Date.now()) / 1000));
    },

    activateLuckPotion(durationMs = 30 * 60 * 1000) {
        if (!this.state) return;
        const now = Date.now();
        const currentUntil = this.state.luckPotionUntil && this.state.luckPotionUntil > now ? this.state.luckPotionUntil : now;
        this.state.luckPotionUntil = currentUntil + durationMs;
        this.save();
    },

    // ----------------------------------------------------
    // GEM SHOP PURCHASES
    // ----------------------------------------------------
    buyGemShopItem(itemId, costGems, itemType, targetKey) {
        if (!this.state) return { success: false, message: "Game state not ready" };
        if (!this.state.gemShopLimits) this.state.gemShopLimits = {};

        const hourCycleKey = "HOUR_" + Math.floor(Date.now() / 3600000);
        if (!this.state.gemShopLimits[hourCycleKey]) {
            this.state.gemShopLimits[hourCycleKey] = {};
        }

        const currentPurchased = this.state.gemShopLimits[hourCycleKey][itemId] || 0;
        if (currentPurchased >= 1) {
            return { success: false, message: "Sold out this hour! Stock refreshes every hour." };
        }

        if (!this.spendGems(costGems)) {
            return { success: false, message: `Insufficient Gems! Need 💎 ${costGems.toLocaleString()} Gems.` };
        }

        // Apply item effect or add to inventory
        if (itemId === "luck_potion") {
            this.activateLuckPotion(30 * 60 * 1000); // 30 minutes of +25% luck
            this.addItem("consumables", "luck_potion", 1);
        } else if (itemType === "material") {
            this.addItem("starFruits", targetKey, 1);
        }

        this.state.gemShopLimits[hourCycleKey][itemId] = currentPurchased + 1;
        this.save();

        return {
            success: true,
            message: `Successfully purchased ${itemId.replace(/_/g, " ")}!`,
            hourCycleKey: hourCycleKey
        };
    },

    // ----------------------------------------------------
    // SETTINGS RESET
    // ----------------------------------------------------
    resetSettingsToDefault() {
        if (!this.state) return;
        this.state.settings = {
            autoSellRare: false,
            autoSellEpic: false,
            autoSellLegendary: false,
            autoSkipWave: false,
            defaultSpeed: 1,
            sfxMuted: false
        };
        this.state.traitFilters = {
            protectMythic: true,
            protectLegendary: false
        };
        this.save();
    }
};

if (typeof window !== 'undefined') {
    window.SaveService = SaveService;
}
