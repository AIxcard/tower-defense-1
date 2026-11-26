// Pixel Tower Defense — Trait Engine
// Server-grade RNG using exact 100% trait probability distribution

const TraitEngine = {
    // Rolls a trait from the exact 100% trait pool
    rollTrait() {
        const rand = Math.random() * 100; // 0.00 to 100.00
        let cumulative = 0;

        // Iterate through all configured traits
        for (const [traitName, config] of Object.entries(window.TRAIT_CONFIG)) {
            cumulative += config.chance;
            if (rand <= cumulative) {
                return traitName;
            }
        }
        return "Superior I"; // Fallback safeguard
    },

    // Rerolls a unit's trait
    rerollUnitTrait(unitInstanceId) {
        const state = window.SaveService.state;
        const unit = state.inventoryUnits.find(u => u.id === unitInstanceId);
        if (!unit) return { success: false, message: "Unit not found" };

        // Cost: 1 Trait Reroll Token per reroll
        if (!window.SaveService.spendTraitReroll()) {
            return { success: false, message: "You need 1 Trait Reroll Token (Trait RR) to roll! Obtain more via Quests or Challenges." };
        }

        const newTrait = this.rollTrait();
        unit.trait = newTrait;
        window.SaveService.save();

        return {
            success: true,
            newTrait: newTrait,
            traitDetails: window.TRAIT_CONFIG[newTrait],
            unit: unit
        };
    },

    // Calculates effective stats for a unit with level scaling and trait bonuses applied
    calculateEffectiveStats(baseUnitConfig, upgradeLevel = 0, traitName = null, isPlacedOnHill = false, unitLevel = 1) {
        // Base stats from config
        let damage = baseUnitConfig.baseDamage;
        let spa = baseUnitConfig.baseSpa;
        let range = baseUnitConfig.baseRange;
        let income = baseUnitConfig.incomePerWave || 0;
        let splashRadius = baseUnitConfig.splashRadius || 0;
        let chainTargets = baseUnitConfig.chainTargets || 1;
        let slowPercent = baseUnitConfig.slowPercent || 0;

        // Apply upgrades
        if (upgradeLevel > 0 && baseUnitConfig.upgrades) {
            for (let i = 0; i < upgradeLevel; i++) {
                const up = baseUnitConfig.upgrades[i];
                if (!up) break;
                if (up.damage !== undefined) damage = up.damage;
                if (up.spa !== undefined) spa = up.spa;
                if (up.range !== undefined) range = up.range;
                if (up.income !== undefined) income = up.income;
                if (up.incomePerWave !== undefined) income = up.incomePerWave;
                if (up.splashRadius !== undefined) splashRadius = up.splashRadius;
                if (up.chainTargets !== undefined) chainTargets = up.chainTargets;
                if (up.slowPercent !== undefined) slowPercent = up.slowPercent;
            }
        }

        // Apply Compounded Unit Level Scaling:
        // Final Damage = Base Damage × 1.01^(Unit Level - 1)
        // Only damage increases with level; SPA and range must not change.
        const lvl = Math.max(1, Math.min(100, Math.round(unitLevel || 1)));
        const levelMult = Math.pow(1.01, lvl - 1);
        damage = damage * levelMult;

        // Soaring capability active IF placed on a Hill (allows hitting Soaring enemies)
        let soaringActive = !!(baseUnitConfig.hasSoaring && isPlacedOnHill);

        // Apply Trait Bonuses
        let traitDetails = null;
        if (traitName && window.TRAIT_CONFIG[traitName]) {
            traitDetails = window.TRAIT_CONFIG[traitName];
            // Damage %
            if (traitDetails.damageBonus) {
                damage *= (1 + traitDetails.damageBonus);
            }
            // SPA reduction %
            if (traitDetails.spaReduction) {
                spa *= (1 - traitDetails.spaReduction);
            }
            // Range %
            if (traitDetails.rangeBonus) {
                range *= (1 + traitDetails.rangeBonus);
            }
            // Farming income %
            if (traitDetails.incomeBonus && income > 0) {
                income = Math.round(income * (1 + traitDetails.incomeBonus));
            }
        }

        return {
            damage: Math.round(damage),
            spa: parseFloat(spa.toFixed(2)),
            range: Math.round(range),
            income: income,
            splashRadius: splashRadius,
            chainTargets: chainTargets,
            slowPercent: slowPercent,
            soaringActive: soaringActive,
            traitDetails: traitDetails,
            levelMult: levelMult,
            unitLevel: lvl
        };
    }
};

if (typeof window !== 'undefined') {
    window.TraitEngine = TraitEngine;
}
