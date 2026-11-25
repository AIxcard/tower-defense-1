// Pixel Tower Defense — Time Service
// Enforces 7:00 AM Asia/Bangkok (UTC+7) Daily Resets and 30-minute Hourly Challenge cycles

const TimeService = {
    // Offset for Asia/Bangkok is UTC + 7 hours = 7 * 60 * 60 * 1000 ms
    BANGKOK_OFFSET_MS: 7 * 60 * 60 * 1000,
    RESET_HOUR_BANGKOK: 7, // 7:00 AM

    // Returns current Date object shifted to Bangkok wall time
    getBangkokNow() {
        const utc = Date.now() + (new Date().getTimezoneOffset() * 60000);
        return new Date(utc + this.BANGKOK_OFFSET_MS);
    },

    // Returns the current Daily Cycle Key (changes at 7:00 AM Bangkok)
    getDailyCycleKey() {
        const bNow = this.getBangkokNow();
        const year = bNow.getFullYear();
        const month = bNow.getMonth();
        const date = bNow.getDate();
        const hour = bNow.getHours();

        // If before 7:00 AM Bangkok, the active cycle is from yesterday's 7:00 AM
        const cycleDate = new Date(year, month, date);
        if (hour < this.RESET_HOUR_BANGKOK) {
            cycleDate.setDate(cycleDate.getDate() - 1);
        }

        const y = cycleDate.getFullYear();
        const m = String(cycleDate.getMonth() + 1).padStart(2, '0');
        const d = String(cycleDate.getDate()).padStart(2, '0');
        return `BANGKOK_DAY_${y}-${m}-${d}`;
    },

    // Returns milliseconds remaining until the next 7:00 AM Bangkok reset
    getTimeUntilDailyReset() {
        const bNow = this.getBangkokNow();
        const nextReset = new Date(bNow);
        nextReset.setHours(this.RESET_HOUR_BANGKOK, 0, 0, 0);

        if (bNow.getHours() >= this.RESET_HOUR_BANGKOK) {
            nextReset.setDate(nextReset.getDate() + 1);
        }

        const diff = nextReset.getTime() - bNow.getTime();
        return Math.max(0, diff);
    },

    // Returns the current 30-minute Hourly Challenge Cycle Key
    getHourlyCycleKey() {
        const bNow = this.getBangkokNow();
        const y = bNow.getFullYear();
        const m = String(bNow.getMonth() + 1).padStart(2, '0');
        const d = String(bNow.getDate()).padStart(2, '0');
        const h = String(bNow.getHours()).padStart(2, '0');
        const half = bNow.getMinutes() >= 30 ? "30" : "00";
        return `HOURLY_${y}-${m}-${d}_${h}:${half}`;
    },

    // Returns the current true 1-hour Banner Rotation Cycle Key (resets on the hour :00)
    getBannerHourlyCycleKey() {
        const bNow = this.getBangkokNow();
        const y = bNow.getFullYear();
        const m = String(bNow.getMonth() + 1).padStart(2, '0');
        const d = String(bNow.getDate()).padStart(2, '0');
        const h = String(bNow.getHours()).padStart(2, '0');
        return `BANNER_HOURLY_${y}-${m}-${d}_${h}`;
    },

    // Returns milliseconds remaining until the next 30-minute challenge refresh
    getTimeUntilHourlyRefresh() {
        const bNow = this.getBangkokNow();
        const nextRefresh = new Date(bNow);
        const mins = bNow.getMinutes();

        if (mins < 30) {
            nextRefresh.setMinutes(30, 0, 0);
        } else {
            nextRefresh.setHours(bNow.getHours() + 1, 0, 0, 0);
        }

        const diff = nextRefresh.getTime() - bNow.getTime();
        return Math.max(0, diff);
    },

    // Simple pseudo-random generator with a string seed (deterministic for a given cycle)
    seededRandom(seedStr) {
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = (hash << 5) - hash + seedStr.charCodeAt(i);
            hash |= 0;
        }
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    },

    // Generates consistent Hourly Challenge details for the current 30-min window
    getHourlyChallengeForCurrentCycle() {
        const cycleKey = this.getHourlyCycleKey();
        const rand1 = this.seededRandom(cycleKey + "_fruit1");
        const rand2 = this.seededRandom(cycleKey + "_fruit2");
        const randQtyNormal = this.seededRandom(cycleKey + "_qtyNorm");
        const randObj = this.seededRandom(cycleKey + "_obj");

        // Normal Star Fruit is ALWAYS included: 3 - 4 random
        const normalQty = Math.floor(randQtyNormal * 2) + 3; // 3 or 4

        // Pool of colored + rainbow
        const otherFruitTypes = [
            "pink_star_fruit",
            "red_star_fruit",
            "green_star_fruit",
            "blue_star_fruit",
            "yellow_star_fruit",
            "rainbow_star_fruit"
        ];

        // Pick exactly TWO distinct fruit types
        const idx1 = Math.floor(rand1 * otherFruitTypes.length);
        const fruit1 = otherFruitTypes[idx1];
        
        const remainingTypes = otherFruitTypes.filter((_, i) => i !== idx1);
        const idx2 = Math.floor(rand2 * remainingTypes.length);
        const fruit2 = remainingTypes[idx2];

        const computeQty = (fruitType, seedSalt) => {
            if (fruitType === "rainbow_star_fruit") {
                return 1; // Always exactly 1 for Rainbow
            }
            const r = this.seededRandom(cycleKey + seedSalt);
            return Math.floor(r * 3) + 1; // 1 to 3
        };

        const rewards = [
            { type: "normal_star_fruit", name: "Normal Star Fruit", count: normalQty, icon: "⭐" },
            { type: fruit1, name: this.formatFruitName(fruit1), count: computeQty(fruit1, "_q1"), icon: this.getFruitIcon(fruit1) },
            { type: fruit2, name: this.formatFruitName(fruit2), count: computeQty(fruit2, "_q2"), icon: this.getFruitIcon(fruit2) }
        ];

        return {
            cycleKey,
            rewards
        };
    },

    // Checks if VIP pass is in stock for the current Bangkok day (2% chance rebalanced)
    isVipInStockForCurrentDay() {
        const dayKey = this.getDailyCycleKey();
        const rand = this.seededRandom(dayKey + "_vip_restock_v2");
        return rand < 0.02;
    },

    // Checks if Shiny Hunter pass is in stock for current Bangkok day (2% chance rebalanced)
    isShinyHunterInStockForCurrentDay() {
        const dayKey = this.getDailyCycleKey();
        const rand = this.seededRandom(dayKey + "_shiny_hunter_restock_v2");
        return rand < 0.02;
    },

    formatFruitName(type) {
        return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    },

    getFruitIcon(type) {
        if (type.includes("pink")) return "🌸";
        if (type.includes("red")) return "🔥";
        if (type.includes("green")) return "🍃";
        if (type.includes("blue")) return "💧";
        if (type.includes("yellow")) return "⚡";
        if (type.includes("rainbow")) return "🌈";
        return "⭐";
    },

    formatTime(ms) {
        const totalSecs = Math.floor(ms / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
};

if (typeof window !== 'undefined') {
    window.TimeService = TimeService;
}
