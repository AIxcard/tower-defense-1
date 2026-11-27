// Pixel Tower Defense — High-Tier Vector & Pixel Character Model Engine
// Renders high-definition stylized anime character models, busts, battle sprites, star fruits, and food

const PixelSprites = {
    cache: {},

    createSvgDataUrl(svgContent, width = 64, height = 64, viewBox = "0 0 32 32") {
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${svgContent}</svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
    },

    // ----------------------------------------------------
    // CUSTOM DESIGNED ICONS (YEN, ELEMENTS, DAMAGE TYPES, FARM)
    // Compact, high-definition SVG vector icons with zero text overflow
    // ----------------------------------------------------
    // OFFICIAL TD VECTOR CURRENCIES & TOKENS
    // ----------------------------------------------------
    getYenIcon(size = 18) {
        return this.getGoldIcon(size);
    },

    getGoldIcon(size = 20) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Gold / Yen" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 4px rgba(234,179,8,0.5));">
            <g transform="translate(14, 28)">
                <ellipse cx="14" cy="8" rx="13" ry="5" fill="#000000"/>
                <path d="M1 8 L1 15 A13 5 0 0 0 27 15 L27 8 Z" fill="#713f12" stroke="#000000" stroke-width="2.5"/>
                <ellipse cx="14" cy="8" rx="12" ry="4" fill="#eab308"/>
            </g>
            <g transform="translate(24, 28)">
                <ellipse cx="14" cy="8" rx="13" ry="5" fill="#000000"/>
                <path d="M1 8 L1 15 A13 5 0 0 0 27 15 L27 8 Z" fill="#713f12" stroke="#000000" stroke-width="2.5"/>
                <ellipse cx="14" cy="8" rx="12" ry="4" fill="#eab308"/>
            </g>
            <g transform="translate(18, 14)">
                <path d="M1 18 L1 26 A14 6 0 0 0 29 26 L29 18 Z" fill="#854d0e" stroke="#000000" stroke-width="2.5"/>
                <ellipse cx="15" cy="18" rx="13" ry="5" fill="#ca8a04"/>
                <path d="M1 11 L1 18 A14 6 0 0 0 29 18 L29 11 Z" fill="#a16207" stroke="#000000" stroke-width="2.5"/>
                <ellipse cx="15" cy="11" rx="13" ry="5" fill="#eab308"/>
                <path d="M1 4 L1 11 A14 6 0 0 0 29 11 L29 4 Z" fill="#ca8a04" stroke="#000000" stroke-width="2.5"/>
                <ellipse cx="15" cy="4" rx="14" ry="6" fill="#000000"/>
                <ellipse cx="15" cy="4" rx="12" ry="5" fill="#facc15"/>
                <ellipse cx="15" cy="4" rx="9" ry="3.5" fill="#fef08a"/>
                <polygon points="15,2 16.5,4 19,4 17,5.5 17.8,7.5 15,6.2 12.2,7.5 13,5.5 11,4 13.5,4" fill="#854d0e"/>
            </g>
        </svg>`;
    },

    getGemIcon(size = 20) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Summon Gems" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 6px rgba(56,189,248,0.7));">
            <polygon points="32,10 54,26 32,56 10,26" fill="#000000" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
            <polygon points="32,12 52,26 32,54" fill="#0284c7"/>
            <polygon points="32,12 12,26 32,54" fill="#0369a1"/>
            <polygon points="32,12 42,26 32,54" fill="#38bdf8"/>
            <polygon points="32,12 22,26 32,54" fill="#0ea5e9"/>
            <polygon points="22,26 32,12 42,26" fill="#e0f2fe"/>
            <line x1="32" y1="12" x2="32" y2="54" stroke="#ffffff" stroke-width="2"/>
            <circle cx="32" cy="14" r="2" fill="#ffffff"/>
        </svg>`;
    },

    getTraitRRIcon(size = 20) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Trait Reroll Token" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 6px rgba(192,132,252,0.8));">
            <path d="M14 44 C10 32, 16 16, 32 12 C48 8, 54 22, 50 36 C46 50, 26 54, 18 46" fill="none" stroke="#c084fc" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
            <path d="M20 20 C24 14, 40 14, 44 24 C48 34, 38 44, 28 42" fill="none" stroke="#e9d5ff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <g transform="rotate(-15 32 32)">
                <polygon points="32,6 50,26 32,58 14,38" fill="#000000" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
                <polygon points="32,8 48,26 32,56" fill="#7e22ce"/>
                <polygon points="32,8 16,38 32,56" fill="#581c87"/>
                <polygon points="32,8 38,28 32,56" fill="#a855f7"/>
                <polygon points="32,8 24,34 32,56" fill="#6b21a8"/>
                <polygon points="24,34 32,8 38,28" fill="#c084fc"/>
                <polygon points="32,16 35,28 32,46 29,32" fill="#f3e8ff" opacity="0.9"/>
                <line x1="32" y1="8" x2="32" y2="56" stroke="#ffffff" stroke-width="2"/>
            </g>
        </svg>`;
    },

    getSummonTicketIcon(size = 20) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Summon Ticket" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 4px rgba(245,158,11,0.6));">
            <g transform="rotate(-15 32 32)">
                <rect x="12" y="18" width="40" height="28" rx="4" fill="#000000"/>
                <rect x="14" y="20" width="36" height="24" rx="3" fill="#b45309"/>
                <rect x="16" y="22" width="32" height="20" rx="2" fill="#f59e0b"/>
                <circle cx="12" cy="32" r="4" fill="#0b0f19" stroke="#000000" stroke-width="2"/>
                <circle cx="52" cy="32" r="4" fill="#0b0f19" stroke="#000000" stroke-width="2"/>
                <circle cx="32" cy="32" r="6" fill="#fef3c7" stroke="#92400e" stroke-width="1.5"/>
                <polygon points="32,28 33.5,31 36.5,31 34,33 35,36 32,34.5 29,36 30,33 27.5,31 30.5,31" fill="#d97706"/>
            </g>
        </svg>`;
    },

    getPromoCodeIcon(size = 20) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Promo Code" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 4px rgba(56,189,248,0.6));">
            <g transform="rotate(-10 32 32)">
                <rect x="8" y="16" width="48" height="32" rx="4" fill="#0369a1"/>
                <rect x="10" y="18" width="44" height="28" rx="3" fill="#0284c7"/>
                <rect x="12" y="20" width="40" height="24" rx="2" fill="#38bdf8"/>
                <line x1="26" y1="20" x2="26" y2="44" stroke="#0284c7" stroke-width="2" stroke-dasharray="2,2"/>
                <circle cx="8" cy="32" r="4" fill="#0b0f19" stroke="#0369a1" stroke-width="2"/>
                <circle cx="56" cy="32" r="4" fill="#0b0f19" stroke="#0369a1" stroke-width="2"/>
                <rect x="32" y="27" width="14" height="4" rx="1" fill="#0c4a6e"/>
                <rect x="32" y="33" width="10" height="4" rx="1" fill="#0c4a6e"/>
                <polygon points="19,26 21,30 25,30 22,33 23,37 19,35 15,37 16,33 13,30 17,30" fill="#fef08a"/>
            </g>
        </svg>`;
    },

    getDamageTypeIcon(type, size = 20) {
        const tLower = (type || "").toLowerCase();
        if (tLower === "magical" || tLower === "magic") {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Magical Damage" class="dmg-icon-svg" style="vertical-align:middle;display:inline-block;">
                <circle cx="32" cy="32" r="26" fill="rgba(168, 85, 247, 0.22)"/>
                <g transform="rotate(-30 32 32)">
                    <line x1="32" y1="22" x2="32" y2="58" stroke="#000000" stroke-width="5" stroke-linecap="round"/>
                    <line x1="32" y1="22" x2="32" y2="58" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
                    <path d="M22 18 C26 24 38 24 42 18" stroke="#000000" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <path d="M22 18 C26 24 38 24 42 18" stroke="#d97706" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <circle cx="32" cy="14" r="8" fill="#000000"/>
                    <circle cx="32" cy="14" r="6" fill="#c084fc"/>
                    <circle cx="32" cy="14" r="4" fill="#f3e8ff"/>
                </g>
            </svg>`;
        }
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Physical Damage" class="dmg-icon-svg" style="vertical-align:middle;display:inline-block;">
            <circle cx="32" cy="32" r="26" fill="rgba(244, 63, 94, 0.22)"/>
            <g transform="rotate(45 32 32)">
                <polygon points="32,4 35,16 33,46 31,46 29,16" fill="#000000" stroke="#000000" stroke-width="2"/>
                <polygon points="32,6 34,16 32,44" fill="#e2e8f0"/>
                <polygon points="32,6 30,16 32,44" fill="#94a3b8"/>
                <rect x="24" y="44" width="16" height="4" rx="1.5" fill="#475569" stroke="#000000" stroke-width="1.5"/>
                <rect x="30" y="48" width="4" height="8" fill="#991b1b" stroke="#000000" stroke-width="1.5"/>
            </g>
            <g transform="rotate(-45 32 32)">
                <polygon points="32,4 35,16 33,46 31,46 29,16" fill="#000000" stroke="#000000" stroke-width="2"/>
                <polygon points="32,6 34,16 32,44" fill="#e2e8f0"/>
                <polygon points="32,6 30,16 32,44" fill="#94a3b8"/>
                <rect x="24" y="44" width="16" height="4" rx="1.5" fill="#475569" stroke="#000000" stroke-width="1.5"/>
                <rect x="30" y="48" width="4" height="8" fill="#991b1b" stroke="#000000" stroke-width="1.5"/>
            </g>
        </svg>`;
    },

    getElementBadge(elem, size = 22) {
        return this.getElementIcon(elem, size);
    },

    getDamageTypeBadge(dmgType, size = 22) {
        return this.getDamageTypeIcon(dmgType, size);
    },

    getElementIcon(elem, size = 20) {
        const eLower = (elem || "").toLowerCase();
        switch (eLower) {
            case "fire":
                return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Fire Element" class="elem-icon-svg" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 5px rgba(239,68,68,0.6));">
                    <path d="M32 6 C36 16, 52 26, 50 44 C48 56, 16 56, 14 44 C12 30, 24 22, 32 6 Z" fill="#000000" stroke="#000000" stroke-width="3.5" stroke-linejoin="round"/>
                    <path d="M32 8 C36 18, 50 28, 48 42 C46 52, 18 52, 16 42 C14 30, 26 22, 32 8 Z" fill="#dc2626"/>
                    <path d="M32 18 C36 26, 44 32, 42 42 C40 48, 24 48, 22 42 C20 34, 28 28, 32 18 Z" fill="#ea580c"/>
                    <path d="M32 26 C35 32, 39 36, 37 42 C35 46, 27 46, 27 42 C25 36, 29 32, 32 26 Z" fill="#facc15"/>
                    <circle cx="32" cy="38" r="3.5" fill="#ffffff"/>
                </svg>`;
            case "aqua":
            case "water":
            case "ice":
                return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Aqua Element" class="elem-icon-svg" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 5px rgba(6,182,212,0.6));">
                    <path d="M32 6 C40 18, 52 28, 50 44 C48 56, 16 56, 14 44 C12 28, 24 18, 32 6 Z" fill="#000000" stroke="#000000" stroke-width="3.5" stroke-linejoin="round"/>
                    <path d="M32 8 C39 20, 50 29, 48 42 C46 52, 18 52, 16 42 C14 28, 25 19, 32 8 Z" fill="#0369a1"/>
                    <path d="M32 14 C38 24, 46 32, 44 42 C42 49, 22 49, 20 42 C18 32, 27 24, 32 14 Z" fill="#0284c7"/>
                    <path d="M32 20 C36 28, 42 34, 40 42 C38 47, 24 47, 22 42 C21 34, 28 28, 32 20 Z" fill="#38bdf8"/>
                    <path d="M22 38 C26 30, 36 26, 42 32 C40 33, 36 32, 34 35 C32 38, 28 40, 22 38 Z" fill="#ffffff"/>
                    <circle cx="26" cy="44" r="2.5" fill="#e0f2fe"/>
                    <circle cx="36" cy="42" r="1.8" fill="#ffffff"/>
                </svg>`;
            case "nature":
                return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Nature Element" class="elem-icon-svg" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 5px rgba(34,197,94,0.6));">
                    <path d="M14 50 C14 26, 36 10, 50 12 C52 26, 48 50, 14 50 Z" fill="#000000" stroke="#000000" stroke-width="3.5" stroke-linejoin="round"/>
                    <path d="M16 48 C16 28, 35 12, 48 14 C50 26, 46 48, 16 48 Z" fill="#15803d"/>
                    <path d="M20 46 C20 30, 34 16, 44 18 C46 28, 42 46, 20 46 Z" fill="#22c55e"/>
                    <path d="M16 46 C12 36, 16 26, 24 22 C26 30, 24 40, 16 46 Z" fill="#166534"/>
                    <path d="M17 44 C14 36, 18 28, 23 24 C24 30, 23 38, 17 44 Z" fill="#4ade80"/>
                    <path d="M18 46 Q32 30 46 16" stroke="#bbf7d0" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                    <path d="M26 38 Q34 36 38 30" stroke="#bbf7d0" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                    <circle cx="34" cy="26" r="3.5" fill="#a7f3d0" stroke="#14532d" stroke-width="1"/>
                    <circle cx="33" cy="25" r="1.2" fill="#ffffff"/>
                </svg>`;
            case "storm":
            case "lightning":
                return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Storm Element" class="elem-icon-svg" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 4px rgba(234,179,8,0.6));">
                    <polygon points="36,6 18,32 30,32 24,58 48,26 34,26" fill="#000000" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
                    <polygon points="36,8 20,32 32,32 26,54 46,28 34,28" fill="#ca8a04"/>
                    <polygon points="36,10 23,32 32,32 28,48 43,29 34,29" fill="#facc15"/>
                    <polygon points="36,12 26,32 32,32 30,42 40,30 34,30" fill="#fef08a"/>
                    <line x1="34" y1="14" x2="32" y2="34" stroke="#ffffff" stroke-width="2"/>
                </svg>`;
            case "light":
                return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Light Element" class="elem-icon-svg" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 5px rgba(250,204,21,0.7));">
                    <polygon points="32,4 37,22 55,16 43,30 58,40 40,43 36,60 27,45 12,52 20,36 6,26 23,24" fill="#000000" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
                    <polygon points="32,6 36,22 52,17 41,29 55,38 38,41 35,56 27,43 14,49 21,35 9,26 24,24" fill="#eab308"/>
                    <polygon points="32,10 35,24 46,20 38,29 48,36 36,38 33,50 28,40 18,44 23,33 14,27 25,25" fill="#facc15"/>
                    <circle cx="32" cy="32" r="9" fill="#fef08a"/>
                    <circle cx="32" cy="32" r="5" fill="#ffffff"/>
                </svg>`;
            case "dark":
                return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Dark Element" class="elem-icon-svg" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 5px rgba(168,85,247,0.7));">
                    <circle cx="32" cy="32" r="20" fill="#3b0764"/>
                    <circle cx="32" cy="32" r="17" fill="#6b21a8"/>
                    <circle cx="32" cy="32" r="14" fill="#a855f7"/>
                    <circle cx="32" cy="32" r="12" fill="#000000"/>
                    <path d="M24 22 C30 18, 42 22, 44 32 C38 24, 28 24, 24 22 Z" fill="#e9d5ff"/>
                </svg>`;
            case "none":
            default:
                return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" title="No Element" class="elem-icon-svg" style="vertical-align:middle;display:inline-block;">
                    <circle cx="12" cy="12" r="10" fill="#334155" stroke="#94a3b8" stroke-width="1.2"/>
                    <line x1="6" y1="18" x2="18" y2="6" stroke="#94a3b8" stroke-width="2"/>
                </svg>`;
        }
    },

    getFarmIcon(size = 18) {
        return `<span class="badge-farm" title="Farm Unit (Generates Yen every wave!)" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#ca8a04,#854d0e);border:1px solid #facc15;color:#fef08a;font-size:10px;font-weight:900;padding:2px 7px;border-radius:4px;box-shadow:0 0 8px rgba(234,179,8,0.5);">
            <svg width="${size}" height="${size}" viewBox="0 0 64 64" style="vertical-align:middle;display:inline-block;">
                <g transform="translate(18, 12)">
                    <ellipse cx="6" cy="12" rx="4" ry="7" fill="#facc15" stroke="#713f12" stroke-width="1.5" transform="rotate(-35 6 12)"/>
                    <ellipse cx="4" cy="18" rx="4" ry="7" fill="#eab308" stroke="#713f12" stroke-width="1.5" transform="rotate(-40 4 18)"/>
                    <ellipse cx="5" cy="24" rx="4" ry="7" fill="#ca8a04" stroke="#713f12" stroke-width="1.5" transform="rotate(-30 5 24)"/>
                    <path d="M8 8 Q8 22 12 34" stroke="#854d0e" stroke-width="2.5" fill="none"/>
                </g>
                <g transform="translate(32, 12)">
                    <ellipse cx="8" cy="12" rx="4" ry="7" fill="#facc15" stroke="#713f12" stroke-width="1.5" transform="rotate(35 8 12)"/>
                    <ellipse cx="10" cy="18" rx="4" ry="10" fill="#eab308" stroke="#713f12" stroke-width="1.5" transform="rotate(40 10 18)"/>
                    <ellipse cx="9" cy="24" rx="4" ry="7" fill="#ca8a04" stroke="#713f12" stroke-width="1.5" transform="rotate(30 9 24)"/>
                    <path d="M6 8 Q6 22 2 34" stroke="#854d0e" stroke-width="2.5" fill="none"/>
                </g>
                <circle cx="32" cy="42" r="11" fill="#000000"/>
                <circle cx="32" cy="42" r="9.5" fill="#ca8a04"/>
                <circle cx="32" cy="42" r="7.5" fill="#facc15"/>
                <circle cx="32" cy="42" r="6" fill="#fef08a"/>
                <text x="32" y="47" font-size="12" font-weight="900" fill="#713f12" text-anchor="middle" font-family="'Segoe UI', sans-serif">¥</text>
            </svg>
            FARM
        </span>`;
    },

    // ----------------------------------------------------
    // OFFICIAL TD LEGEND DROPS & MATERIALS
    // ----------------------------------------------------
    getLightEnergyIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Light Energy" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(250,204,21,0.6));">
            <polygon points="32,4 36,22 54,16 42,28 60,32 42,36 54,48 36,42 32,60 28,42 10,48 22,36 4,32 22,28 10,16 28,22" fill="#000000" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
            <polygon points="32,6 35,22 51,17 40,28 56,32 40,36 51,47 35,42 32,58 29,42 13,47 24,36 8,32 24,28 13,17 29,22" fill="#eab308"/>
            <polygon points="32,10 35,24 45,20 37,29 48,32 37,35 45,44 35,40 32,54 29,40 19,44 27,35 16,32 27,29 19,20 29,24" fill="#facc15"/>
            <circle cx="32" cy="32" r="14" fill="#000000"/>
            <circle cx="32" cy="32" r="12" fill="#fef08a"/>
            <circle cx="32" cy="32" r="8" fill="#ffffff"/>
            <ellipse cx="30" cy="28" rx="4" ry="2.5" fill="#ffffff"/>
        </svg>`;
    },

    getBlazeIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Blaze" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(239,68,68,0.6));">
            <path d="M22 52 C16 42, 18 24, 30 10 C34 18, 48 20, 48 36 C48 48, 36 56, 22 52 Z" fill="#b91c1c" opacity="0.6"/>
            <polygon points="32,6 48,22 44,48 32,58 18,48 16,24" fill="#000000" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
            <polygon points="32,8 46,22 32,56" fill="#dc2626"/>
            <polygon points="32,8 18,24 32,56" fill="#991b1b"/>
            <polygon points="32,8 40,28 32,56" fill="#f97316"/>
            <polygon points="32,8 24,30 32,56" fill="#b91c1c"/>
            <polygon points="24,30 32,8 40,28" fill="#fb923c"/>
            <polygon points="32,16 37,28 32,46 27,28" fill="#fef08a"/>
            <polygon points="32,20 35,28 32,38 29,28" fill="#ffffff"/>
            <circle cx="16" cy="18" r="2" fill="#facc15"/>
            <circle cx="48" cy="14" r="1.5" fill="#f87171"/>
        </svg>`;
    },

    // Abyssal Shadow Dagger (No random purple line, pure sharp void blade)
    getShadowDaggerIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Shadow Dagger" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(168,85,247,0.7));">
            <g transform="rotate(-40 32 32)">
                <polygon points="32,4 40,22 36,40 32,44 28,40 24,22" fill="#000000" stroke="#000000" stroke-width="3.5" stroke-linejoin="round"/>
                <polygon points="32,6 38,22 32,42" fill="#c084fc"/>
                <polygon points="32,6 26,22 32,42" fill="#6b21a8"/>
                <line x1="32" y1="8" x2="32" y2="40" stroke="#ffffff" stroke-width="2"/>
                <rect x="24" y="42" width="16" height="4" rx="2" fill="#1e1b4b" stroke="#000000" stroke-width="2"/>
                <rect x="29" y="46" width="6" height="12" fill="#4c1d95" stroke="#000000" stroke-width="2"/>
                <line x1="29" y1="49" x2="35" y2="49" stroke="#c084fc" stroke-width="1.5"/>
                <line x1="29" y1="53" x2="35" y2="53" stroke="#c084fc" stroke-width="1.5"/>
                <circle cx="32" cy="62" r="4.5" fill="none" stroke="#000000" stroke-width="3"/>
                <circle cx="32" cy="62" r="3.5" fill="none" stroke="#c084fc" stroke-width="2"/>
            </g>
        </svg>`;
    },

    // Normal Dagger (Stone / Steel / Metal, dark hilt, absolutely NO purple)
    getNormalDaggerIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Dagger" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 6px rgba(148,163,184,0.6));">
            <g transform="rotate(-40 32 32)">
                <polygon points="32,4 40,22 36,40 32,44 28,40 24,22" fill="#0f172a" stroke="#0f172a" stroke-width="3.5" stroke-linejoin="round"/>
                <polygon points="32,6 38,22 32,42" fill="#e2e8f0"/>
                <polygon points="32,6 26,22 32,42" fill="#94a3b8"/>
                <line x1="32" y1="8" x2="32" y2="40" stroke="#ffffff" stroke-width="2"/>
                <rect x="23" y="42" width="18" height="4" rx="2" fill="#475569" stroke="#0f172a" stroke-width="2"/>
                <rect x="29" y="46" width="6" height="12" fill="#334155" stroke="#0f172a" stroke-width="2"/>
                <line x1="29" y1="49" x2="35" y2="49" stroke="#94a3b8" stroke-width="1.5"/>
                <line x1="29" y1="53" x2="35" y2="53" stroke="#94a3b8" stroke-width="1.5"/>
                <circle cx="32" cy="62" r="4.5" fill="none" stroke="#0f172a" stroke-width="3"/>
                <circle cx="32" cy="62" r="3.5" fill="none" stroke="#cbd5e1" stroke-width="2"/>
            </g>
        </svg>`;
    },

    getDaggerIcon(size = 48) {
        return this.getNormalDaggerIcon(size);
    },

    getFireScrollIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Fire Scroll" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(239,68,68,0.7));">
            <g transform="rotate(-25 32 32)">
                <rect x="14" y="16" width="36" height="32" rx="3" fill="#000000" stroke="#000000" stroke-width="3"/>
                <rect x="15" y="17" width="34" height="30" rx="2" fill="#fee2e2"/>
                <rect x="20" y="17" width="24" height="30" fill="#f87171"/>
                <rect x="22" y="17" width="20" height="30" fill="#dc2626"/>
                <!-- Golden Wooden Scroll Spindles -->
                <rect x="10" y="12" width="8" height="40" rx="3" fill="#000000"/>
                <rect x="11" y="13" width="6" height="38" rx="2" fill="#ca8a04"/>
                <rect x="12" y="15" width="4" height="34" rx="1" fill="#facc15"/>
                <rect x="46" y="12" width="8" height="40" rx="3" fill="#000000"/>
                <rect x="47" y="13" width="6" height="38" rx="2" fill="#ca8a04"/>
                <rect x="48" y="15" width="4" height="34" rx="1" fill="#facc15"/>
                <!-- Golden Ribbon Ties & Flame Crest -->
                <rect x="29" y="17" width="6" height="30" fill="#fef08a"/>
                <circle cx="32" cy="32" r="6" fill="#000000"/>
                <circle cx="32" cy="32" r="4.5" fill="#f97316"/>
                <polygon points="32,29 34,34 30,34" fill="#ffffff"/>
            </g>
            <circle cx="16" cy="18" r="2" fill="#ef4444"/>
            <circle cx="50" cy="46" r="2.5" fill="#f97316"/>
        </svg>`;
    },

    getWaterScrollIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Water Scroll" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(56,189,248,0.7));">
            <g transform="rotate(-25 32 32)">
                <rect x="14" y="16" width="36" height="32" rx="3" fill="#000000" stroke="#000000" stroke-width="3"/>
                <rect x="15" y="17" width="34" height="30" rx="2" fill="#e0f2fe"/>
                <rect x="20" y="17" width="24" height="30" fill="#38bdf8"/>
                <rect x="22" y="17" width="20" height="30" fill="#0284c7"/>
                <!-- Azure Sapphire Spindles -->
                <rect x="10" y="12" width="8" height="40" rx="3" fill="#000000"/>
                <rect x="11" y="13" width="6" height="38" rx="2" fill="#0369a1"/>
                <rect x="12" y="15" width="4" height="34" rx="1" fill="#bae6fd"/>
                <rect x="46" y="12" width="8" height="40" rx="3" fill="#000000"/>
                <rect x="47" y="13" width="6" height="38" rx="2" fill="#0369a1"/>
                <rect x="48" y="15" width="4" height="34" rx="1" fill="#bae6fd"/>
                <!-- White Silk Ribbon & Aqua Crest -->
                <rect x="29" y="17" width="6" height="30" fill="#ffffff"/>
                <circle cx="32" cy="32" r="6" fill="#000000"/>
                <circle cx="32" cy="32" r="4.5" fill="#38bdf8"/>
                <path d="M30 33 Q32 30 34 33" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            </g>
            <circle cx="15" cy="48" r="2.5" fill="#38bdf8"/>
            <circle cx="48" cy="16" r="2" fill="#bae6fd"/>
        </svg>`;
    },

    getNatureScrollIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Nature Scroll" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(34,197,94,0.7));">
            <g transform="rotate(-25 32 32)">
                <rect x="14" y="16" width="36" height="32" rx="3" fill="#000000" stroke="#000000" stroke-width="3"/>
                <rect x="15" y="17" width="34" height="30" rx="2" fill="#dcfce7"/>
                <rect x="20" y="17" width="24" height="30" fill="#4ade80"/>
                <rect x="22" y="17" width="20" height="30" fill="#16a34a"/>
                <!-- Polished Wood Spindles -->
                <rect x="10" y="12" width="8" height="40" rx="3" fill="#000000"/>
                <rect x="11" y="13" width="6" height="38" rx="2" fill="#854d0e"/>
                <rect x="12" y="15" width="4" height="34" rx="1" fill="#ca8a04"/>
                <rect x="46" y="12" width="8" height="40" rx="3" fill="#000000"/>
                <rect x="47" y="13" width="6" height="38" rx="2" fill="#854d0e"/>
                <rect x="48" y="15" width="4" height="34" rx="1" fill="#ca8a04"/>
                <!-- Leaf Green Ribbon & Floral Crest -->
                <rect x="29" y="17" width="6" height="30" fill="#bbf7d0"/>
                <circle cx="32" cy="32" r="6" fill="#000000"/>
                <circle cx="32" cy="32" r="4.5" fill="#22c55e"/>
                <circle cx="32" cy="32" r="2" fill="#ffffff"/>
            </g>
            <circle cx="18" cy="16" r="2" fill="#22c55e"/>
            <circle cx="48" cy="46" r="2.5" fill="#86efac"/>
        </svg>`;
    },

    getThunderEssenceIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Thunder Essence" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 10px rgba(168,85,247,0.8));">
            <!-- Outer Lightning Aura Rings -->
            <circle cx="32" cy="32" r="24" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="8 4" opacity="0.6"/>
            <circle cx="32" cy="32" r="20" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="4 6"/>
            <!-- Pulsing Electric Core -->
            <polygon points="32,8 50,22 46,46 32,56 18,46 14,22" fill="#000000" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
            <polygon points="32,10 48,23 44,45 32,54 20,45 16,23" fill="#6b21a8"/>
            <polygon points="32,12 44,24 32,50 20,24" fill="#9333ea"/>
            <polygon points="32,16 40,26 32,44 24,26" fill="#c084fc"/>
            <polygon points="32,20 37,28 32,38 27,28" fill="#fef08a"/>
            <!-- Lightning Bolt Slashes -->
            <polygon points="30,14 36,26 32,27 38,40 26,28 31,27" fill="#ffffff" stroke="#facc15" stroke-width="1"/>
            <circle cx="16" cy="18" r="2" fill="#facc15"/>
            <circle cx="48" cy="44" r="2" fill="#c084fc"/>
        </svg>`;
    },

    getNatureEssenceIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Nature Essence" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 10px rgba(34,197,94,0.8));">
            <!-- Verdant Leaf Swirl Aura -->
            <path d="M12 32 C12 16, 28 8, 44 14 C36 24, 48 40, 36 52 C20 54, 12 44, 12 32 Z" fill="#15803d" opacity="0.4"/>
            <!-- Faceted Emerald Crystal -->
            <polygon points="32,6 50,22 44,48 32,58 20,48 14,22" fill="#000000" stroke="#000000" stroke-width="3" stroke-linejoin="round"/>
            <polygon points="32,8 48,23 42,46 32,56 22,46 16,23" fill="#166534"/>
            <polygon points="32,10 44,24 32,52 20,24" fill="#16a34a"/>
            <polygon points="32,14 40,26 32,46 24,26" fill="#4ade80"/>
            <polygon points="32,18 36,28 32,40 28,28" fill="#bbf7d0"/>
            <!-- Floating Spores & Leaf Icon -->
            <path d="M30 22 C30 22, 38 26, 36 34 C32 36, 28 32, 30 22 Z" fill="#ffffff" opacity="0.9"/>
            <circle cx="16" cy="46" r="2.5" fill="#4ade80"/>
            <circle cx="48" cy="16" r="2" fill="#86efac"/>
        </svg>`;
    },

    getStarStaffIcon(size = 48) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Star Staff" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 12px rgba(250,204,21,0.85));">
            <g transform="rotate(-35 32 32)">
                <!-- Golden Shaft -->
                <rect x="30" y="18" width="4" height="42" rx="2" fill="#000000" stroke="#000000" stroke-width="2.5"/>
                <rect x="30.5" y="19" width="3" height="40" rx="1.5" fill="#facc15"/>
                <!-- Bottom Pommel Ring -->
                <circle cx="32" cy="58" r="4" fill="#000000"/>
                <circle cx="32" cy="58" r="3" fill="#eab308"/>
                <circle cx="32" cy="58" r="1.5" fill="#ffffff"/>
                <!-- Winged Headpiece Bracket -->
                <path d="M22 22 Q32 26 42 22 Q36 18 32 18 Q28 18 22 22 Z" fill="#ca8a04" stroke="#000000" stroke-width="2"/>
                <!-- Radiant 8-Pointed Star Crystal -->
                <polygon points="32,2 35,11 44,8 38,15 45,21 36,21 34,30 32,22 30,30 28,21 19,21 26,15 20,8 29,11" fill="#000000" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
                <polygon points="32,4 34,12 42,9 37,15 43,20 35,20 32,18 29,20 21,20 27,15 22,9 30,12" fill="#facc15"/>
                <circle cx="32" cy="16" r="6" fill="#000000"/>
                <circle cx="32" cy="16" r="5" fill="#fef08a"/>
                <circle cx="32" cy="16" r="3" fill="#ffffff"/>
            </g>
            <!-- Celestial Glints -->
            <polygon points="50,10 52,14 56,15 52,17 50,21 48,17 44,15 48,14" fill="#38bdf8"/>
            <polygon points="12,46 14,49 17,50 14,52 12,55 11,52 8,50 11,49" fill="#e879f9"/>
        </svg>`;
    },

    getMaterialIcon(id, size = 24) {
        const mLower = (id || "").toLowerCase();
        if (mLower === "trait_crystal" || mLower === "trait_rr" || mLower === "trait_reroll" || mLower === "trait_reroll_crystal") return this.getTraitRRIcon(size);
        if (mLower === "gem" || mLower === "gems") return this.getGemIcon(size);
        if (mLower === "gold") return this.getGoldCoinIcon ? this.getGoldCoinIcon(size) : '🪙';
        if (mLower === "relic_shard") return this.getRelicShardIcon(size);
        if (mLower === "light_energy" || mLower === "clock") return this.getLightEnergyIcon(size);
        if (mLower === "blaze") return this.getBlazeIcon(size);
        if (mLower === "shadow_dagger" || mLower === "abyssal_shadow_dagger") return this.getShadowDaggerIcon(size);
        if (mLower === "dagger" || mLower === "normal_dagger") return this.getNormalDaggerIcon(size);
        if (mLower === "fire_scroll") return this.getFireScrollIcon(size);
        if (mLower === "water_scroll") return this.getWaterScrollIcon(size);
        if (mLower === "nature_scroll") return this.getNatureScrollIcon(size);
        if (mLower === "thunder_essence") return this.getThunderEssenceIcon(size);
        if (mLower === "nature_essence") return this.getNatureEssenceIcon(size);
        if (mLower === "star_staff") return this.getStarStaffIcon(size);
        return `<span style="font-size:${size}px;line-height:${size}px;">📦</span>`;
    },

    // ----------------------------------------------------
    // OFFICIAL TD ANCIENT RELICS (SMITHY FORGED)
    // ----------------------------------------------------
    getRelicIcon(id, size = 48) {
        const rLower = (id || "").toLowerCase();
        if (rLower.includes("chrono") || rLower.includes("watch")) {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Chrono Pocket Watch" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(234,179,8,0.6));">
                <circle cx="32" cy="11" r="5" fill="none" stroke="#000000" stroke-width="3"/>
                <circle cx="32" cy="11" r="4.5" fill="none" stroke="#facc15" stroke-width="2"/>
                <rect x="30" y="14" width="4" height="4" fill="#ca8a04" stroke="#000000" stroke-width="1.5"/>
                <circle cx="32" cy="34" r="20" fill="#000000"/>
                <circle cx="32" cy="34" r="18" fill="#ca8a04"/>
                <circle cx="32" cy="34" r="15" fill="#fef9c3"/>
                <line x1="32" y1="21" x2="32" y2="24" stroke="#713f12" stroke-width="2"/>
                <line x1="32" y1="44" x2="32" y2="47" stroke="#713f12" stroke-width="2"/>
                <line x1="19" y1="34" x2="22" y2="34" stroke="#713f12" stroke-width="2"/>
                <line x1="42" y1="34" x2="45" y2="34" stroke="#713f12" stroke-width="2"/>
                <line x1="32" y1="34" x2="26" y2="27" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="32" y1="34" x2="39" y2="30" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
                <circle cx="32" cy="34" r="2.5" fill="#ca8a04"/>
                <ellipse cx="27" cy="27" rx="3" ry="1.5" fill="#ffffff" opacity="0.6"/>
            </svg>`;
        }
        if (rLower.includes("blaze") || rLower.includes("blazing")) {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Blazing Core" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(239,68,68,0.7));">
                <ellipse cx="32" cy="32" rx="27" ry="11" fill="none" stroke="#f97316" stroke-width="3.5" stroke-dasharray="8,4" transform="rotate(-30 32 32)"/>
                <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="#fde047" stroke-width="1.5" stroke-dasharray="5,7" transform="rotate(-30 32 32)"/>
                <circle cx="32" cy="32" r="17" fill="#000000"/>
                <circle cx="32" cy="32" r="15" fill="#7f1d1d"/>
                <circle cx="32" cy="32" r="14" fill="#ea580c"/>
                <circle cx="30" cy="30" r="10" fill="#facc15"/>
                <circle cx="28" cy="28" r="5" fill="#ffffff"/>
                <path d="M24 30 Q30 36 38 28" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/>
            </svg>`;
        }
        if (rLower.includes("shadow") || rLower.includes("cloak")) {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Shadow Cloak" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(168,85,247,0.7));">
                <path d="M32 8 C20 8, 12 24, 10 50 C16 54, 48 54, 54 50 C52 24, 44 8, 32 8 Z" fill="#000000" stroke="#000000" stroke-width="3.5"/>
                <path d="M32 10 C22 10, 14 26, 12 48 C18 50, 46 50, 52 48 C50 26, 42 10, 32 10 Z" fill="#2e1065"/>
                <path d="M32 18 C26 18, 22 26, 21 38 C26 42, 38 42, 43 38 C42 26, 38 18, 32 18 Z" fill="#090d16"/>
                <ellipse cx="27" cy="30" rx="3" ry="1.5" fill="#f43f5e" transform="rotate(-15 27 30)"/>
                <ellipse cx="37" cy="30" rx="3" ry="1.5" fill="#f43f5e" transform="rotate(15 37 30)"/>
                <polygon points="32,42 36,47 32,52 28,47" fill="#c084fc" stroke="#000000" stroke-width="1.5"/>
                <circle cx="32" cy="47" r="1.5" fill="#ffffff"/>
            </svg>`;
        }
        if (rLower.includes("fortune") || rLower.includes("ring")) {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Golden Fortune Ring" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(234,179,8,0.7));">
                <g transform="rotate(-15 32 32)">
                    <ellipse cx="32" cy="36" rx="19" ry="15" fill="#000000"/>
                    <ellipse cx="32" cy="36" rx="14" ry="10" fill="#0b0f19"/>
                    <path d="M13 36 A19 15 0 0 0 51 36 L46 36 A14 10 0 0 1 18 36 Z" fill="#ca8a04"/>
                    <path d="M13 36 A19 15 0 0 1 51 36 L46 36 A14 10 0 0 0 18 36 Z" fill="#facc15"/>
                    <polygon points="24,18 40,18 44,27 20,27" fill="#854d0e" stroke="#000000" stroke-width="2"/>
                    <polygon points="25,19 39,19 42,26 22,26" fill="#fef08a"/>
                    <polygon points="32,10 42,19 32,28 22,19" fill="#000000" stroke="#000000" stroke-width="2"/>
                    <polygon points="32,12 40,19 32,26 24,19" fill="#ffffff"/>
                    <polygon points="32,14 38,19 32,24 26,19" fill="#38bdf8"/>
                    <circle cx="32" cy="19" r="2" fill="#ffffff"/>
                </g>
            </svg>`;
        }
        if (rLower.includes("divine") || rLower.includes("eye_of_divination")) {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Ancient Eye of Divination" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(56,189,248,0.7));">
                <path d="M8 32 Q32 10 56 32 Q32 54 8 32 Z" fill="#000000" stroke="#000000" stroke-width="3"/>
                <path d="M10 32 Q32 14 54 32 Q32 50 10 32 Z" fill="#eab308"/>
                <path d="M14 32 Q32 19 50 32 Q32 45 14 32 Z" fill="#f8fafc"/>
                <circle cx="32" cy="32" r="10" fill="#000000"/>
                <circle cx="32" cy="32" r="8.5" fill="#0284c7"/>
                <circle cx="32" cy="32" r="5.5" fill="#38bdf8"/>
                <circle cx="32" cy="32" r="3" fill="#000000"/>
                <circle cx="34" cy="30" r="1.5" fill="#ffffff"/>
                <circle cx="29" cy="34" r="1" fill="#e0f2fe"/>
            </svg>`;
        }
        // Mangekyou Sharingan (relic_mangekyou or relic_red_eyes)
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Mangekyou Sharingan" style="vertical-align:middle;display:inline-block;filter:drop-shadow(0 0 8px rgba(239,68,68,0.8));">
            <circle cx="32" cy="32" r="22" fill="#000000"/>
            <circle cx="32" cy="32" r="19" fill="#991b1b"/>
            <circle cx="32" cy="32" r="17.5" fill="#dc2626"/>
            <circle cx="32" cy="32" r="17.5" fill="none" stroke="#000000" stroke-width="2"/>
            <g transform="translate(32, 32)">
                <path d="M0,0 C-4,-8 -4,-15 0,-17 C4,-15 6,-7 0,0 Z" fill="#000000"/>
                <path d="M0,0 C-4,-8 -4,-15 0,-17 C4,-15 6,-7 0,0 Z" fill="#000000" transform="rotate(120)"/>
                <path d="M0,0 C-4,-8 -4,-15 0,-17 C4,-15 6,-7 0,0 Z" fill="#000000" transform="rotate(240)"/>
                <circle cx="0" cy="0" r="3.5" fill="#000000"/>
                <circle cx="-1" cy="-1" r="1.2" fill="#ffffff"/>
            </g>
            <path d="M20 22 A15 15 0 0 1 38 18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
        </svg>`;
    },

    // ----------------------------------------------------
    // OFFICIAL TD FOOD & EXP ITEMS
    // ----------------------------------------------------
    getFoodIcon(id, size = 48) {
        const fLower = (id || "").toLowerCase();
        if (fLower === "rice_ball" || fLower.includes("onigiri")) {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Rice Ball" style="vertical-align:middle;display:inline-block;">
                <path d="M32 10 C36 10, 52 42, 50 48 C48 52, 16 52, 14 48 C12 42, 28 10, 32 10 Z" fill="#000000" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
                <path d="M32 12 C35 12, 50 42, 48 47 C46 50, 18 50, 16 47 C14 42, 29 12, 32 12 Z" fill="#f8fafc"/>
                <path d="M32 12 C34 12, 46 36, 44 44 C40 48, 20 48, 18 44 C20 36, 30 12, 32 12 Z" fill="#e2e8f0"/>
                <path d="M30 14 C32 14, 40 32, 38 40 C34 44, 22 44, 20 40 C22 32, 28 14, 30 14 Z" fill="#ffffff"/>
                <rect x="23" y="34" width="18" height="15" rx="3" fill="#000000"/>
                <rect x="24" y="35" width="16" height="13" rx="2" fill="#1e293b"/>
                <rect x="26" y="37" width="12" height="9" rx="1" fill="#0f172a"/>
            </svg>`;
        }
        if (fLower === "dorayaki") {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Dorayaki" style="vertical-align:middle;display:inline-block;">
                <g transform="rotate(-6 32 34)">
                    <ellipse cx="32" cy="34" rx="22" ry="14" fill="#000000"/>
                    <path d="M12 30 C12 18, 52 18, 52 30 C52 38, 12 38, 12 30 Z" fill="#b45309"/>
                    <path d="M14 29 C14 20, 50 20, 50 29 C50 35, 14 35, 14 29 Z" fill="#d97706"/>
                    <ellipse cx="32" cy="26" rx="16" ry="6" fill="#f59e0b"/>
                    <ellipse cx="28" cy="24" rx="10" ry="3" fill="#fef3c7" opacity="0.6"/>
                    <rect x="13" y="32" width="38" height="7" rx="3" fill="#450a0a"/>
                    <rect x="15" y="33" width="34" height="5" rx="2" fill="#7f1d1d"/>
                    <ellipse cx="32" cy="40" rx="20" ry="8" fill="#92400e"/>
                    <ellipse cx="32" cy="39" rx="18" ry="6" fill="#b45309"/>
                </g>
            </svg>`;
        }
        if (fLower === "kings_feast" || fLower === "bento_box") {
            return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="King's Feast" style="vertical-align:middle;display:inline-block;">
                <path d="M32 10 C36 10, 52 42, 50 48 C48 52, 16 52, 14 48 C12 42, 28 10, 32 10 Z" fill="#000000" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
                <path d="M32 12 C35 12, 50 42, 48 47 C46 50, 18 50, 16 47 C14 42, 29 12, 32 12 Z" fill="#fef9c3"/>
                <path d="M30 14 C32 14, 40 32, 38 40 C34 44, 22 44, 20 40 C22 32, 28 14, 30 14 Z" fill="#ffffff"/>
                <rect x="20" y="32" width="24" height="18" rx="3" fill="#000000"/>
                <rect x="21" y="33" width="22" height="16" rx="2" fill="#1e293b"/>
                <polygon points="25,44 25,38 27.5,41 32,36 36.5,41 39,38 39,44" fill="#facc15" stroke="#854d0e" stroke-width="1"/>
                <rect x="25" y="44" width="14" height="2" fill="#ca8a04"/>
                <circle cx="32" cy="38" r="1.5" fill="#ef4444"/>
            </svg>`;
        }
        // Dragon Fire Ramen
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" title="Dragon Ramen" style="vertical-align:middle;display:inline-block;">
            <path d="M26 12 Q28 6 26 2" stroke="#fca5a5" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M34 14 Q36 8 34 4" stroke="#fecaca" stroke-width="2" fill="none" stroke-linecap="round"/>
            <line x1="16" y1="18" x2="48" y2="12" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
            <ellipse cx="32" cy="32" rx="22" ry="10" fill="#000000"/>
            <path d="M10 32 C10 48, 54 48, 54 32 Z" fill="#991b1b" stroke="#000000" stroke-width="3"/>
            <path d="M14 34 C14 45, 50 45, 50 34 Z" fill="#dc2626"/>
            <ellipse cx="32" cy="31" rx="19" ry="7" fill="#f59e0b"/>
            <path d="M18 30 Q24 33 32 29 T46 31" stroke="#fde68a" stroke-width="2" fill="none"/>
            <circle cx="26" cy="30" r="4.5" fill="#ffffff"/>
            <circle cx="26" cy="30" r="2.5" fill="#f43f5e"/>
            <ellipse cx="38" cy="30" rx="5" ry="3.5" fill="#ffffff"/>
            <ellipse cx="38" cy="30" rx="3" ry="2" fill="#ea580c"/>
        </svg>`;
    },

    // ----------------------------------------------------
    // HIGH-DEFINITION ANIME CHARACTER MODELS (FOR BANNER & SUMMON THEATRE)
    // Detailed vector illustrations with hair strands, anime eyes, horns, wings, armor, and glowing auras
    // ----------------------------------------------------
    getUnitModel(unitId, width = 180, height = 220) {
        if ((unitId === "breeze_scout" || unitId === "archer") && window.ARCHER_8DIR_SPRITES && window.ARCHER_8DIR_SPRITES["S"]) {
            return window.ARCHER_8DIR_SPRITES["S"];
        }
        const key = `model_${unitId}_${width}_${height}`;
        if (this.cache[key]) return this.cache[key];

        let bodySvg = "";
        const u = (window.UNIT_CONFIG && window.UNIT_CONFIG[unitId]) || { rarity: "Mythic", name: unitId };

        switch (unitId) {
            case "shinobi":
            case "solar_valkyrie":
                // Shinobi / Solar Valkyrie: Master of infernal ninjutsu & solar flames
                bodySvg = `
                    <defs>
                        <radialGradient id="shinobiAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.6" />
                            <stop offset="50%" stop-color="#7f1d1d" stop-opacity="0.4" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="85" fill="url(#shinobiAura)" />
                    <!-- Black Flame Wisps -->
                    <path d="M40,160 Q20,120 45,95 Q35,130 55,145 Z" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/>
                    <path d="M140,160 Q160,120 135,95 Q145,130 125,145 Z" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/>
                    <!-- Shinobi Haori & Robe -->
                    <path d="M50,140 Q90,128 130,140 L136,210 L44,210 z" fill="#18181b" stroke="#dc2626" stroke-width="2.5" />
                    <!-- Crimson Headband with Metal Plate -->
                    <rect x="62" y="66" width="56" height="18" rx="3" fill="#991b1b" />
                    <rect x="74" y="69" width="32" height="12" rx="2" fill="#94a3b8" stroke="#f8fafc" stroke-width="1" />
                    <!-- Spiky Ninja Hair -->
                    <path d="M54,75 Q40,40 68,36 Q82,22 96,36 Q115,24 126,45 Q140,55 126,80 Q90,70 54,75 z" fill="#09090b" stroke="#dc2626" stroke-width="1.5" />
                    <!-- Face & Sharingan Crimson Eyes -->
                    <path d="M68,82 Q65,122 90,135 Q115,122 112,82 Q90,78 68,82 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="98" rx="6" ry="4" fill="#ef4444" />
                    <circle cx="78" cy="98" r="2.5" fill="#000000" />
                    <circle cx="79" cy="96" r="1" fill="#fef08a" />
                    <ellipse cx="102" cy="98" rx="6" ry="4" fill="#ef4444" />
                    <circle cx="102" cy="98" r="2.5" fill="#000000" />
                    <circle cx="103" cy="96" r="1" fill="#fef08a" />
                `;
                break;

            case "shinobi_god":
                // Shinobi (God): Complete Susanoo Chakra Armor, Purple Tengu Mask, Giant Spectral Arrows & Blades
                bodySvg = `
                    <defs>
                        <radialGradient id="susanooAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#c084fc" stop-opacity="0.8" />
                            <stop offset="40%" stop-color="#7e22ce" stop-opacity="0.6" />
                            <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="95" fill="url(#susanooAura)">
                        <animate attributeName="r" values="90;98;90" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <!-- Colossal Spectral Susanoo Ribs / Wings -->
                    <path d="M25,60 Q10,120 40,190 Q60,130 50,75 Z" fill="#9333ea" opacity="0.6" stroke="#e9d5ff" stroke-width="2"/>
                    <path d="M155,60 Q170,120 140,190 Q120,130 130,75 Z" fill="#9333ea" opacity="0.6" stroke="#e9d5ff" stroke-width="2"/>
                    <!-- Susanoo Giant Sword Blade -->
                    <line x1="150" y1="20" x2="165" y2="195" stroke="#c084fc" stroke-width="6"/>
                    <line x1="150" y1="20" x2="165" y2="195" stroke="#ffffff" stroke-width="2"/>
                    <!-- Godly Chakra Robes -->
                    <path d="M46,140 Q90,125 134,140 L140,210 L40,210 z" fill="#3b0764" stroke="#a855f7" stroke-width="3" />
                    <!-- Crown of Susanoo Horns -->
                    <polygon points="60,40 70,60 55,55" fill="#a855f7" stroke="#f3e8ff" stroke-width="1.5"/>
                    <polygon points="120,40 110,60 125,55" fill="#a855f7" stroke="#f3e8ff" stroke-width="1.5"/>
                    <!-- Shinobi Face with Mangekyo Eyes -->
                    <path d="M66,80 Q64,122 90,135 Q116,122 114,80 Q90,75 66,80 z" fill="#faf5ff" />
                    <ellipse cx="78" cy="98" rx="6.5" ry="4.5" fill="#dc2626" />
                    <circle cx="78" cy="98" r="2" fill="#000000" />
                    <ellipse cx="102" cy="98" rx="6.5" ry="4.5" fill="#dc2626" />
                    <circle cx="102" cy="98" r="2" fill="#000000" />
                `;
                break;

            case "shadow_assassin":
            case "void_assassin":
                // Shadow Assassin / Void Assassin: Dark Shadow Cowl, Dual Void Blades, Crimson Eyes
                bodySvg = `
                    <defs>
                        <radialGradient id="vaAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.5" />
                            <stop offset="70%" stop-color="#1e1b4b" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="85" fill="url(#vaAura)">
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                    </circle>

                    <!-- Dual Dark Matter Katanas -->
                    <line x1="25" y1="35" x2="65" y2="185" stroke="#a855f7" stroke-width="3.5" />
                    <line x1="25" y1="35" x2="65" y2="185" stroke="#ffffff" stroke-width="1.5" />
                    <line x1="155" y1="35" x2="115" y2="185" stroke="#a855f7" stroke-width="3.5" />
                    <line x1="155" y1="35" x2="115" y2="185" stroke="#ffffff" stroke-width="1.5" />

                    <!-- Shinobi Trenchcoat & Cowl -->
                    <path d="M50,145 Q90,132 130,145 L136,210 L44,210 z" fill="#0f172a" stroke="#581c87" stroke-width="2.5" />
                    <rect x="70" y="155" width="40" height="55" fill="#1e1b4b" />

                    <!-- Dark Assassin Mask & Cowl -->
                    <path d="M62,75 Q90,60 118,75 Q125,120 114,136 Q90,144 66,136 Q55,120 62,75 z" fill="#0f172a" stroke="#7c3aed" stroke-width="2" />
                    <rect x="74" y="112" width="32" height="20" rx="3" fill="#1e293b" />

                    <!-- Piercing Crimson Shinobi Slit Eyes -->
                    <ellipse cx="78" cy="98" rx="6" ry="3.5" fill="#ef4444">
                        <animate attributeName="fill" values="#ef4444;#f87171;#ef4444" dur="1.5s" repeatCount="indefinite" />
                    </ellipse>
                    <circle cx="79" cy="97" r="1.5" fill="#fef08a" />
                    <ellipse cx="102" cy="98" rx="6" ry="3.5" fill="#ef4444">
                        <animate attributeName="fill" values="#ef4444;#f87171;#ef4444" dur="1.5s" repeatCount="indefinite" />
                    </ellipse>
                    <circle cx="103" cy="97" r="1.5" fill="#fef08a" />
                `;
                break;

            case "shadow_assassin_awakened":
            case "void_assassin_evo":
                // Shadow Assassin (Awakened): Master of Shadow Speed with Void Scythe & Shrouded Eclipse
                bodySvg = `
                    <defs>
                        <radialGradient id="flashAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.6" />
                            <stop offset="50%" stop-color="#a855f7" stop-opacity="0.4" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <ellipse cx="72" cy="110" rx="45" ry="60" fill="rgba(6, 182, 212, 0.25)" />
                    <ellipse cx="108" cy="110" rx="45" ry="60" fill="rgba(168, 85, 247, 0.25)" />
                    <circle cx="90" cy="110" r="88" fill="url(#flashAura)">
                        <animate attributeName="r" values="84;92;84" dur="1.2s" repeatCount="indefinite" />
                    </circle>

                    <line x1="20" y1="25" x2="65" y2="190" stroke="#06b6d4" stroke-width="4.5" />
                    <line x1="20" y1="25" x2="65" y2="190" stroke="#ffffff" stroke-width="2" />
                    <line x1="160" y1="25" x2="115" y2="190" stroke="#06b6d4" stroke-width="4.5" />
                    <line x1="160" y1="25" x2="115" y2="190" stroke="#ffffff" stroke-width="2" />

                    <path d="M48,142 Q90,130 132,142 L138,210 L42,210 z" fill="#030712" stroke="#06b6d4" stroke-width="3" />
                    <line x1="90" y1="145" x2="90" y2="205" stroke="#06b6d4" stroke-width="3" />

                    <path d="M60,72 Q90,55 120,72 Q126,120 114,136 Q90,144 66,136 Q54,120 60,72 z" fill="#0b0f19" stroke="#06b6d4" stroke-width="2.5" />
                    <polygon points="90,55 84,68 96,68" fill="#facc15" />

                    <ellipse cx="78" cy="98" rx="6.5" ry="4" fill="#06b6d4" />
                    <circle cx="79" cy="97" r="2" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="6.5" ry="4" fill="#a855f7" />
                    <circle cx="103" cy="97" r="2" fill="#ffffff" />
                `;
                break;

            case "tempest_lord":
            case "thunder_god":
            case "thunder_god_awakened":
                // Tempest Lord (Storm Nimbus, Lightning Crown, Electric Spear)
                bodySvg = `
                    <defs>
                        <radialGradient id="tempestAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
                            <stop offset="70%" stop-color="#1e3a8a" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="85" fill="url(#tempestAura)" />
                    <!-- Storm Cloud Base -->
                    <ellipse cx="90" cy="195" rx="60" ry="18" fill="#475569" opacity="0.8" />

                    <!-- Lightning Crown & Flowing Electric Blue Hair -->
                    <path d="M50,82 Q90,50 130,82 Q136,125 122,140 Q90,148 58,140 z" fill="#7dd3fc" stroke="#0284c7" stroke-width="2" />
                    <polygon points="68,55 76,35 84,48 90,28 96,48 104,35 112,55" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />

                    <!-- Crackling Lightning Spear -->
                    <path d="M150,15 L142,65 L154,85 L144,145 L155,195" stroke="#facc15" stroke-width="4" fill="none" />
                    <line x1="150" y1="15" x2="150" y2="195" stroke="#ffffff" stroke-width="2" />

                    <!-- Demigod Robes & Armor -->
                    <path d="M52,145 Q90,132 128,145 L132,210 L48,210 z" fill="#1e3a8a" stroke="#38bdf8" stroke-width="2.5" />

                    <!-- Electric Eyes -->
                    <path d="M68,85 Q65,125 90,136 Q115,125 112,85 Q90,80 68,85 z" fill="#f8fafc" />
                    <ellipse cx="78" cy="98" rx="6" ry="4" fill="#38bdf8" />
                    <circle cx="78" cy="98" r="2" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="6" ry="4" fill="#38bdf8" />
                    <circle cx="102" cy="98" r="2" fill="#ffffff" />
                `;
                break;

            case "star_mage":
            case "void_sovereign_genesis":
                // Star Mage / Void Sovereign: Starlight robes, piercing light beam staff, celestial cyan eyes
                bodySvg = `
                    <defs>
                        <radialGradient id="starMageAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.6" />
                            <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.4" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="85" fill="url(#starMageAura)" />
                    <!-- Orbiting Starlight Spheres -->
                    <circle cx="30" cy="110" r="10" fill="#facc15" stroke="#ffffff" stroke-width="2" />
                    <circle cx="150" cy="110" r="10" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
                    <!-- Starlight Flowing Silver Hair -->
                    <path d="M45,85 Q20,150 40,210 Q90,200 140,210 Q160,150 135,85 z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2" />
                    <!-- Cosmic Star Crown -->
                    <polygon points="65,45 75,25 85,38 90,18 95,38 105,25 115,45" fill="#facc15" stroke="#ffffff" stroke-width="1.5" />
                    <circle cx="90" cy="24" r="3" fill="#ffffff" />
                    <!-- Radiant Light Staff -->
                    <line x1="145" y1="20" x2="145" y2="195" stroke="#facc15" stroke-width="4" />
                    <circle cx="145" cy="20" r="8" fill="#ffffff" stroke="#fde047" stroke-width="2" />
                    <!-- Robes with Light Core -->
                    <path d="M50,148 Q90,135 130,148 L138,210 L42,210 z" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
                    <circle cx="90" cy="178" r="12" fill="#ffffff" stroke="#facc15" stroke-width="2.5" />
                    <!-- Face & Celestial Cyan Eyes -->
                    <path d="M66,82 Q64,122 90,135 Q116,122 114,82 Q90,78 66,82 z" fill="#f8fafc" />
                    <ellipse cx="78" cy="98" rx="6" ry="4" fill="#38bdf8" />
                    <circle cx="78" cy="98" r="2" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="6" ry="4" fill="#38bdf8" />
                    <circle cx="102" cy="98" r="2" fill="#ffffff" />
                `;
                break;

            case "star_mage_explosion":
                // Star Mage (Explosion): Supernova Staff, Crimson-Gold Galactic Nova Robes, Radiant Stellar Burst
                bodySvg = `
                    <defs>
                        <radialGradient id="novaAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
                            <stop offset="35%" stop-color="#facc15" stop-opacity="0.7" />
                            <stop offset="70%" stop-color="#ea580c" stop-opacity="0.4" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="95" fill="url(#novaAura)">
                        <animate attributeName="r" values="90;98;90" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                    <!-- Supernova Flare Rays -->
                    <path d="M90,15 L95,60 L90,45 L85,60 Z" fill="#ffffff" />
                    <path d="M15,90 L60,95 L45,90 L60,85 Z" fill="#ffffff" />
                    <path d="M165,90 L120,95 L135,90 L120,85 Z" fill="#ffffff" />
                    <!-- Majestic Celestial Robes -->
                    <path d="M46,140 Q90,125 134,140 L142,210 L38,210 z" fill="#1e1b4b" stroke="#facc15" stroke-width="3" />
                    <!-- Giant Supernova Wand -->
                    <line x1="150" y1="10" x2="150" y2="200" stroke="#facc15" stroke-width="5" />
                    <polygon points="150,5 140,25 160,25" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
                    <circle cx="150" cy="18" r="10" fill="#fef08a" opacity="0.8"/>
                    <!-- Face & Blazing Golden Eyes -->
                    <path d="M66,80 Q64,122 90,135 Q116,122 114,80 Q90,75 66,80 z" fill="#fffbeb" />
                    <ellipse cx="78" cy="98" rx="6.5" ry="4" fill="#f59e0b" />
                    <circle cx="78" cy="98" r="2" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="6.5" ry="4" fill="#f59e0b" />
                    <circle cx="102" cy="98" r="2" fill="#ffffff" />
                `;
                break;

            case "vampire_king":
                // Vampire King: Sovereign Blood Crown, Crimson Velvet Cloak, Crimson Eyes, Fangs, Blood Bat Aura
                bodySvg = `
                    <defs>
                        <radialGradient id="bloodAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#991b1b" stop-opacity="0.8" />
                            <stop offset="60%" stop-color="#450a0a" stop-opacity="0.5" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="92" fill="url(#bloodAura)">
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <!-- High Vampiric Collar & Velvet Cape -->
                    <path d="M42,120 Q15,70 30,195 Q90,210 150,195 Q165,70 138,120 Z" fill="#450a0a" stroke="#dc2626" stroke-width="2.5" />
                    <path d="M48,142 Q90,130 132,142 L136,210 L44,210 z" fill="#18181b" stroke="#7f1d1d" stroke-width="2" />
                    <!-- Blood Ruby Amulet -->
                    <polygon points="90,150 96,162 90,174 84,162" fill="#dc2626" stroke="#f87171" stroke-width="1.5" />
                    <!-- Jet Black Noble Vampire Hair -->
                    <path d="M56,76 Q40,40 68,36 Q88,26 112,36 Q140,40 124,76 Q128,110 118,125 L110,95 Q90,105 70,95 L62,125 Q52,110 56,76 z" fill="#0a0a0a" stroke="#450a0a" stroke-width="1.5" />
                    <!-- Obsidian Gold Crown -->
                    <polygon points="68,48 76,28 84,40 90,20 96,40 104,28 112,48" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5" />
                    <circle cx="90" cy="28" r="2.5" fill="#dc2626" />
                    <!-- Pale Aristocratic Face & Piercing Blood Eyes -->
                    <path d="M68,82 Q65,124 90,136 Q115,124 112,82 Q90,78 68,82 z" fill="#f8fafc" />
                    <ellipse cx="78" cy="98" rx="6" ry="3.8" fill="#dc2626" />
                    <circle cx="79" cy="97" r="1.5" fill="#fef2f2" />
                    <ellipse cx="102" cy="98" rx="6" ry="3.8" fill="#dc2626" />
                    <circle cx="103" cy="97" r="1.5" fill="#fef2f2" />
                    <!-- Subtle Fangs -->
                    <polygon points="84,118 86,123 88,118" fill="#ffffff" />
                    <polygon points="92,118 94,123 96,118" fill="#ffffff" />
                `;
                break;

            case "magic_girl":
                // Magic Girl: Pink/Lavender Twin-Tails, Cute Star Wand, Magical Ribbon Dress
                bodySvg = `
                    <defs>
                        <radialGradient id="mgAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#f472b6" stop-opacity="0.6" />
                            <stop offset="60%" stop-color="#c084fc" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="85" fill="url(#mgAura)" />
                    <!-- Bouncy Twin-Tails Hair -->
                    <path d="M52,82 Q20,100 25,170 Q45,150 48,110 Z" fill="#f472b6" stroke="#db2777" stroke-width="1.5" />
                    <path d="M128,82 Q160,100 155,170 Q135,150 132,110 Z" fill="#f472b6" stroke="#db2777" stroke-width="1.5" />
                    <!-- Star Hairpins -->
                    <polygon points="46,75 50,70 54,75 50,80" fill="#facc15" />
                    <polygon points="134,75 130,70 126,75 130,80" fill="#facc15" />
                    <!-- Magical Frilled Dress -->
                    <path d="M54,145 Q90,135 126,145 L132,210 L48,210 z" fill="#fdf2f8" stroke="#f472b6" stroke-width="2" />
                    <!-- Big Ribbon -->
                    <polygon points="90,152 78,142 78,162" fill="#db2777" />
                    <polygon points="90,152 102,142 102,162" fill="#db2777" />
                    <circle cx="90" cy="152" r="4" fill="#facc15" />
                    <!-- Star Wand -->
                    <line x1="145" y1="40" x2="135" y2="185" stroke="#f472b6" stroke-width="3" />
                    <polygon points="145,25 152,40 138,40" fill="#facc15" stroke="#eab308" stroke-width="1" />
                    <!-- Cute Big Anime Eyes -->
                    <path d="M68,82 Q65,122 90,135 Q115,122 112,82 Q90,78 68,82 z" fill="#fff1f2" />
                    <ellipse cx="78" cy="98" rx="6.5" ry="5" fill="#ec4899" />
                    <circle cx="77" cy="96" r="2.5" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="6.5" ry="5" fill="#ec4899" />
                    <circle cx="101" cy="96" r="2.5" fill="#ffffff" />
                `;
                break;

                        case "hunter":
                // Hunter: Camo Cloak, Sniper Beret, Long Sniper Rifle with Scope
                bodySvg = `
                    <defs>
                        <radialGradient id="hunterAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#10b981" stop-opacity="0.4" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="90" fill="url(#hunterAura)" />
                    <!-- Cloak / Coat -->
                    <path d="M 60,110 L 140,110 L 155,185 L 45,185 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4" />
                    <path d="M 75,115 L 125,115 L 130,185 L 70,185 Z" fill="#047857" />
                    <!-- Head & Camo Beret -->
                    <circle cx="100" cy="75" r="28" fill="#fde68a" stroke="#0f172a" stroke-width="3.5" />
                    <path d="M 68,68 Q 100,40 135,60 L 140,75 L 70,78 Z" fill="#065f46" stroke="#0f172a" stroke-width="3.5" />
                    <circle cx="85" cy="58" r="5" fill="#facc15" />
                    <!-- Sniper Scope Monocle / Eye -->
                    <circle cx="110" cy="74" r="8" fill="#ef4444" stroke="#0f172a" stroke-width="2.5" />
                    <circle cx="110" cy="74" r="3" fill="#ffffff" />
                    <rect x="85" y="72" width="6" height="4" rx="1" fill="#0f172a" />
                    <!-- Long Sniper Rifle Barrel with Scope -->
                    <rect x="110" y="80" width="75" height="8" rx="2" fill="#334155" stroke="#0f172a" stroke-width="2" />
                    <rect x="140" y="72" width="28" height="6" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="2" />
                    <circle cx="168" cy="75" r="4" fill="#06b6d4" />
                    <rect x="180" y="78" width="12" height="12" rx="2" fill="#0f172a" />
                `;
                break;

            case "robot":
                // Robot: Cybernetic Chassis, Visor Sensor, Power Core, Laser Cannon
                bodySvg = `
                    <defs>
                        <radialGradient id="botCore" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.6" />
                            <stop offset="60%" stop-color="#0284c7" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="100" cy="100" r="90" fill="url(#botCore)" />
                    <!-- Metal Torso / Plates -->
                    <rect x="65" y="100" width="70" height="75" rx="10" fill="#475569" stroke="#1e293b" stroke-width="4" />
                    <rect x="75" y="110" width="50" height="55" rx="6" fill="#1e293b" />
                    <!-- Glowing Power Reactor in Chest -->
                    <circle cx="100" cy="135" r="16" fill="#06b6d4" stroke="#e0f2fe" stroke-width="3" />
                    <circle cx="100" cy="135" r="8" fill="#ffffff" />
                    <!-- Robot Head -->
                    <rect x="72" y="48" width="56" height="48" rx="8" fill="#64748b" stroke="#1e293b" stroke-width="4" />
                    <!-- Dual Antennas -->
                    <rect x="75" y="32" width="4" height="18" fill="#334155" />
                    <circle cx="77" cy="30" r="4" fill="#ef4444" />
                    <rect x="121" y="32" width="4" height="18" fill="#334155" />
                    <circle cx="123" cy="30" r="4" fill="#06b6d4" />
                    <!-- Glowing Horizontal Cyan Sensor Visor -->
                    <rect x="78" y="64" width="44" height="12" rx="3" fill="#0891b2" stroke="#0f172a" stroke-width="2" />
                    <rect x="85" y="67" width="30" height="6" rx="2" fill="#67e8f9" />
                    <!-- Shoulder Cannon -->
                    <rect x="135" y="90" width="35" height="18" rx="4" fill="#334155" stroke="#0f172a" stroke-width="3" />
                    <circle cx="170" cy="99" r="6" fill="#06b6d4" />
                `;
                break;

            case "commander":
                // Commander: Military General Cap, Golden Epaulets, Officer Trenchcoat, Sabre
                bodySvg = `
                    <defs>
                        <radialGradient id="cmdAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5" />
                            <stop offset="60%" stop-color="#1e3a8a" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="85" fill="url(#cmdAura)" />
                    <!-- Officer Trenchcoat with Golden Epaulets -->
                    <path d="M48,140 Q90,128 132,140 L138,210 L42,210 z" fill="#1e293b" stroke="#3b82f6" stroke-width="2.5" />
                    <!-- Epaulets -->
                    <rect x="42" y="140" width="16" height="8" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1" />
                    <rect x="122" y="140" width="16" height="8" rx="2" fill="#eab308" stroke="#ca8a04" stroke-width="1" />
                    <!-- Officer Sabre -->
                    <line x1="30" y1="90" x2="30" y2="195" stroke="#94a3b8" stroke-width="3" />
                    <circle cx="30" cy="100" r="5" fill="#eab308" />
                    <!-- Military Peaked Cap -->
                    <path d="M58,58 Q90,42 122,58 L126,72 Q90,66 54,72 Z" fill="#0f172a" stroke="#eab308" stroke-width="2" />
                    <polygon points="90,48 85,55 95,55" fill="#eab308" />
                    <path d="M56,70 Q90,82 124,70" stroke="#000000" stroke-width="4" fill="none" />
                    <!-- Stern Veteran Face & Sharp Blue Eyes -->
                    <path d="M68,82 Q65,124 90,136 Q115,124 112,82 Q90,78 68,82 z" fill="#f8fafc" />
                    <ellipse cx="78" cy="98" rx="5.5" ry="3.5" fill="#2563eb" />
                    <circle cx="79" cy="97" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="5.5" ry="3.5" fill="#2563eb" />
                    <circle cx="103" cy="97" r="1.5" fill="#ffffff" />
                `;
                break;

            case "swordsman":
                // Swordsman: Martial Robes, Dual Steel Blades, Samurai Headband
                bodySvg = `
                    <circle cx="90" cy="110" r="82" fill="rgba(34, 197, 94, 0.25)" />
                    <!-- Dual Crossed Steel Katanas on Back -->
                    <line x1="30" y1="30" x2="150" y2="190" stroke="#cbd5e1" stroke-width="3.5" />
                    <line x1="150" y1="30" x2="30" y2="190" stroke="#cbd5e1" stroke-width="3.5" />
                    <!-- Martial Gi -->
                    <path d="M52,142 Q90,132 128,142 L134,210 L46,210 z" fill="#15803d" stroke="#22c55e" stroke-width="2.5" />
                    <rect x="70" y="150" width="40" height="60" fill="#14532d" />
                    <!-- Forest Headband -->
                    <rect x="62" y="68" width="56" height="14" rx="2" fill="#166534" />
                    <!-- Face & Sharp Eyes -->
                    <path d="M68,82 Q65,122 90,135 Q115,122 112,82 Q90,78 68,82 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="98" rx="5.5" ry="3.5" fill="#22c55e" />
                    <circle cx="79" cy="97" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="5.5" ry="3.5" fill="#22c55e" />
                    <circle cx="103" cy="97" r="1.5" fill="#ffffff" />
                `;
                break;

            // ----------------------------------------------------
            // RARE UNITS (Distinct visual kits, weapons, and outfits)
            // ----------------------------------------------------
            case "iron_slinger":
                // Cowboy: Western wide-brim Stetson hat, bandit bandana, leather vest with star sheriff badge, dual revolvers
                bodySvg = `
                    <circle cx="90" cy="110" r="82" fill="rgba(217, 119, 6, 0.2)" />
                    <!-- Dual Revolvers in hands -->
                    <line x1="135" y1="130" x2="160" y2="125" stroke="#94a3b8" stroke-width="4.5" />
                    <rect x="150" y="120" width="12" height="6" fill="#475569" />
                    <line x1="160" y1="125" x2="168" y2="125" stroke="#334155" stroke-width="3" />
                    <circle cx="170" cy="122" r="2.5" fill="#facc15" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.8s" repeatCount="indefinite" />
                    </circle>
                    <!-- Leather Duster & Vest -->
                    <path d="M50,146 Q90,132 130,146 L138,210 L42,210 z" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
                    <rect x="74" y="152" width="32" height="58" fill="#92400e" />
                    <!-- Silver Sheriff Star Badge -->
                    <polygon points="90,165 92,170 97,170 93,173 95,178 90,175 85,178 87,173 83,170 88,170" fill="#facc15" stroke="#ca8a04" stroke-width="0.8" />
                    <!-- Red Bandit Bandana -->
                    <polygon points="76,128 104,128 90,145" fill="#dc2626" stroke="#991b1b" stroke-width="1.5" />
                    <!-- Wide-Brimmed Stetson Cowboy Hat -->
                    <path d="M60,65 Q90,32 120,65 Q110,75 70,75 z" fill="#54381e" stroke="#291a0c" stroke-width="2" />
                    <ellipse cx="90" cy="72" rx="46" ry="12" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
                    <rect x="66" y="66" width="48" height="6" rx="2" fill="#b45309" />
                    <circle cx="90" cy="69" r="3" fill="#facc15" />
                    <!-- Face & Sharp Amber Eyes -->
                    <path d="M68,78 Q66,118 90,130 Q114,118 112,78 Q90,72 68,78 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="95" rx="5" ry="3.5" fill="#78350f" />
                    <circle cx="79" cy="94" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="95" rx="5" ry="3.5" fill="#78350f" />
                    <circle cx="103" cy="94" r="1.5" fill="#ffffff" />
                `;
                break;

            case "ember_apprentice":
                // Ember Apprentice: Wizard cowl with fiery ruby, magical flame staff, burning embers
                bodySvg = `
                    <circle cx="90" cy="110" r="82" fill="rgba(239, 68, 68, 0.25)" />
                    <!-- Flame Staff -->
                    <line x1="145" y1="20" x2="145" y2="200" stroke="#7f1d1d" stroke-width="4.5" />
                    <polygon points="145,10 135,32 155,32" fill="#ef4444" stroke="#facc15" stroke-width="2" />
                    <circle cx="145" cy="22" r="7" fill="#facc15">
                        <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <!-- Crimson Pyromancer Robes -->
                    <path d="M50,146 Q90,132 130,146 L138,210 L42,210 z" fill="#7f1d1d" stroke="#ef4444" stroke-width="2.5" />
                    <path d="M72,146 L90,185 L108,146" fill="#b91c1c" />
                    <!-- Pointed Wizard Hat with Flame Peak -->
                    <polygon points="90,15 55,75 125,75" fill="#991b1b" stroke="#ef4444" stroke-width="2" />
                    <ellipse cx="90" cy="75" rx="42" ry="10" fill="#7f1d1d" stroke="#facc15" stroke-width="2" />
                    <circle cx="90" cy="74" r="5" fill="#facc15" />
                    <!-- Glowing Amber Eyes & Young Wizard Face -->
                    <path d="M66,82 Q64,122 90,135 Q116,122 114,82 Q90,76 66,82 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="98" rx="5" ry="3.5" fill="#ea580c" />
                    <circle cx="79" cy="97" r="1.5" fill="#fef08a" />
                    <ellipse cx="102" cy="98" rx="5" ry="3.5" fill="#ea580c" />
                    <circle cx="103" cy="97" r="1.5" fill="#fef08a" />
                `;
                break;

            case "breeze_scout":
                // Archer: Forest hunter hood, feathered crest, tall recurve bow with drawn green arrow, back quiver
                bodySvg = `
                    <circle cx="90" cy="110" r="82" fill="rgba(16, 185, 129, 0.25)" />
                    <!-- Recurve Longbow with Drawn Wind Arrow -->
                    <path d="M148,25 Q172,110 148,195" stroke="#065f46" stroke-width="5" fill="none" />
                    <line x1="148" y1="25" x2="130" y2="110" stroke="#bae6fd" stroke-width="1.5" />
                    <line x1="148" y1="195" x2="130" y2="110" stroke="#bae6fd" stroke-width="1.5" />
                    <!-- Glowing Green Arrow -->
                    <line x1="105" y1="110" x2="155" y2="110" stroke="#34d399" stroke-width="3" />
                    <polygon points="155,106 165,110 155,114" fill="#10b981" />
                    <!-- Archer Quiver on Back -->
                    <rect x="28" y="65" width="16" height="65" rx="4" fill="#047857" stroke="#064e3b" stroke-width="2" />
                    <polygon points="36,45 32,65 40,65" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
                    <polygon points="42,48 38,65 46,65" fill="#22c55e" stroke="#15803d" stroke-width="1" />
                    <!-- Green Hunter Tunic & Belt -->
                    <path d="M50,146 Q90,132 130,146 L136,210 L44,210 z" fill="#064e3b" stroke="#10b981" stroke-width="2.5" />
                    <rect x="70" y="180" width="40" height="8" rx="2" fill="#78350f" />
                    <!-- Forest Ranger Hood with Feathered Crest -->
                    <path d="M54,68 Q90,30 126,68 Q130,125 114,136 Q90,146 66,136 Q50,125 54,68 z" fill="#047857" stroke="#064e3b" stroke-width="2.5" />
                    <path d="M62,50 Q48,25 54,12 Q68,32 64,55" fill="#34d399" stroke="#059669" stroke-width="1.5" />
                    <!-- Face & Sharp Emerald Eyes -->
                    <path d="M68,80 Q66,118 90,128 Q114,118 112,80 Q90,74 68,80 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="96" rx="5.5" ry="3.5" fill="#059669" />
                    <circle cx="79" cy="95" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="96" rx="5.5" ry="3.5" fill="#059669" />
                    <circle cx="103" cy="95" r="1.5" fill="#ffffff" />
                `;
                break;

            case "copper_merchant":
                // Copper Merchant: Merchant travel vest, brass monocle, giant coins backpack
                bodySvg = `
                    <circle cx="90" cy="110" r="80" fill="rgba(245, 158, 11, 0.25)" />
                    <!-- Oversized Merchant Backpack packed with coin sacks -->
                    <rect x="25" y="70" width="30" height="75" rx="6" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
                    <circle cx="40" cy="65" r="10" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
                    <circle cx="34" cy="55" r="8" fill="#f59e0b" stroke="#ca8a04" stroke-width="2" />
                    <!-- Trader Vest & Gold Belt Pouch -->
                    <path d="M52,148 Q90,135 128,148 L134,210 L46,210 z" fill="#92400e" stroke="#ca8a04" stroke-width="2.5" />
                    <rect x="70" y="150" width="40" height="60" fill="#fef3c7" />
                    <circle cx="90" cy="180" r="8" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
                    <!-- Merchant Felt Hat with Gold Feather -->
                    <ellipse cx="90" cy="68" rx="42" ry="12" fill="#78350f" stroke="#b45309" stroke-width="2" />
                    <path d="M68,68 Q90,45 112,68 z" fill="#92400e" />
                    <path d="M108,60 Q120,40 125,25 Q115,45 105,58" fill="#facc15" />
                    <!-- Face with Brass Monocle on Right Eye -->
                    <path d="M66,82 Q64,122 90,135 Q116,122 114,82 Q90,76 66,82 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="98" rx="5" ry="3.5" fill="#451a03" />
                    <!-- Monocle -->
                    <circle cx="102" cy="98" r="7.5" fill="rgba(56, 189, 248, 0.3)" stroke="#facc15" stroke-width="2" />
                    <line x1="109" y1="102" x2="120" y2="120" stroke="#facc15" stroke-width="1.5" />
                    <circle cx="102" cy="98" r="1.5" fill="#ffffff" />
                `;
                break;

            // ----------------------------------------------------
            // NEW MYTHIC UNITS (Bespoke Artwork & Models)
            // ----------------------------------------------------
            case "flame_emperor":
            case "flame_emperor_awakened":
                // Flame Emperor: Horned Dragonfire Crown, Magma Robes, Blazing Fire Aura
                bodySvg = `
                    <defs>
                        <radialGradient id="magmaAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#f97316" stop-opacity="0.6" />
                            <stop offset="60%" stop-color="#dc2626" stop-opacity="0.35" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="88" fill="url(#magmaAura)">
                        <animate attributeName="r" values="84;92;84" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <!-- Draconic Magma Shoulders -->
                    <polygon points="35,120 18,145 45,155" fill="#7f1d1d" stroke="#f97316" stroke-width="2" />
                    <polygon points="145,120 162,145 135,155" fill="#7f1d1d" stroke="#f97316" stroke-width="2" />
                    <!-- Imperial Magma Armor -->
                    <path d="M48,145 Q90,130 132,145 L138,210 L42,210 z" fill="#450a0a" stroke="#f97316" stroke-width="3" />
                    <polygon points="90,145 102,175 90,205 78,175" fill="#ea580c" stroke="#facc15" stroke-width="2" />
                    <!-- Horned Dragonfire Crown & Wild Crimson Hair -->
                    <path d="M45,82 Q35,35 65,30 Q90,15 115,30 Q145,35 135,82 z" fill="#dc2626" stroke="#7f1d1d" stroke-width="2.5" />
                    <polygon points="62,45 50,15 72,32 90,8 108,32 130,15 118,45" fill="#facc15" stroke="#78350f" stroke-width="2" />
                    <!-- Fierce Amber-Red Dragon Eyes -->
                    <path d="M66,82 Q64,122 90,135 Q116,122 114,82 Q90,76 66,82 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="98" rx="6" ry="3.5" fill="#f97316" />
                    <line x1="78" y1="94" x2="78" y2="102" stroke="#450a0a" stroke-width="2" />
                    <ellipse cx="102" cy="98" rx="6" ry="3.5" fill="#f97316" />
                    <line x1="102" y1="94" x2="102" y2="102" stroke="#450a0a" stroke-width="2" />
                `;
                break;

            case "celestial_paladin":
            case "holy_knight":
            case "holy_knight_awakened":
                // Celestial Paladin: Platinum Holy Plate Armor, Radiant Halo, Sacred Light Greatsword
                bodySvg = `
                    <defs>
                        <radialGradient id="holyPaladinAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.5" />
                            <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.25" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="88" fill="url(#holyPaladinAura)" />
                    <!-- Sacred Radiant Halo -->
                    <ellipse cx="90" cy="35" rx="36" ry="10" fill="none" stroke="#facc15" stroke-width="3.5">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                    </ellipse>
                    <!-- Giant Platinum Light Greatsword -->
                    <line x1="150" y1="10" x2="150" y2="200" stroke="#94a3b8" stroke-width="6" />
                    <line x1="150" y1="10" x2="150" y2="200" stroke="#ffffff" stroke-width="2.5" />
                    <line x1="135" y1="55" x2="165" y2="55" stroke="#facc15" stroke-width="4.5" />
                    <polygon points="150,5 142,30 158,30" fill="#facc15" />
                    <!-- Platinum Holy Knight Plate Armor -->
                    <path d="M48,145 Q90,132 132,145 L138,210 L42,210 z" fill="#f1f5f9" stroke="#64748b" stroke-width="3" />
                    <polygon points="90,150 100,175 90,200 80,175" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
                    <!-- Silver-Blonde Flowing Paladin Hair -->
                    <path d="M52,82 Q45,45 68,36 Q90,28 112,36 Q135,45 128,82 z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
                    <!-- Face & Resolute Azure Eyes -->
                    <path d="M66,82 Q64,122 90,135 Q116,122 114,82 Q90,76 66,82 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="98" rx="5.5" ry="4" fill="#0284c7" />
                    <circle cx="79" cy="96" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="5.5" ry="4" fill="#0284c7" />
                    <circle cx="103" cy="96" r="1.5" fill="#ffffff" />
                `;
                break;

            case "shadow_reaper":
                // Shadow Reaper: Grim Obsidian Cowl, Giant Curved Death Scythe, Glowing Purple Soul Eye
                bodySvg = `
                    <defs>
                        <radialGradient id="reaperAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6" />
                            <stop offset="65%" stop-color="#1e1b4b" stop-opacity="0.4" />
                            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="88" fill="url(#reaperAura)" />
                    <!-- Giant Curved Death Scythe -->
                    <line x1="40" y1="200" x2="145" y2="15" stroke="#334155" stroke-width="5" />
                    <path d="M145,15 Q175,5 178,35 Q170,75 125,55" fill="#a855f7" stroke="#ffffff" stroke-width="2.5" />
                    <!-- Obsidian Grim Reaper Shroud -->
                    <path d="M46,140 Q90,126 134,140 L140,210 L40,210 z" fill="#020617" stroke="#581c87" stroke-width="3" />
                    <!-- Deep Obsidian Cowl / Hood -->
                    <path d="M52,65 Q90,40 128,65 Q135,130 114,142 Q90,152 66,142 Q45,130 52,65 z" fill="#090d16" stroke="#9333ea" stroke-width="2.5" />
                    <!-- Soul Void Face & Piercing Violet Eyes -->
                    <ellipse cx="90" cy="104" rx="26" ry="18" fill="#020617" />
                    <ellipse cx="78" cy="104" rx="6" ry="3.5" fill="#c084fc">
                        <animate attributeName="fill" values="#c084fc;#e879f9;#c084fc" dur="1.5s" repeatCount="indefinite" />
                    </ellipse>
                    <circle cx="79" cy="103" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="104" rx="6" ry="3.5" fill="#c084fc">
                        <animate attributeName="fill" values="#c084fc;#e879f9;#c084fc" dur="1.5s" repeatCount="indefinite" />
                    </ellipse>
                    <circle cx="103" cy="103" r="1.5" fill="#ffffff" />
                `;
                break;

            case "wind_master":
            case "wind_master_awakened":
                // Wind Master: Flowing emerald & teal robes, wind-swept spiky jade hair, swirling cyclone vortexes, cyan eyes
                bodySvg = `
                    <defs>
                        <radialGradient id="windAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#34d399" stop-opacity="0.6" />
                            <stop offset="60%" stop-color="#059669" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#022c22" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="90" cy="110" r="88" fill="url(#windAura)">
                        <animate attributeName="r" values="85;92;85" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <!-- Swirling Wind Cyclones around Body -->
                    <ellipse cx="90" cy="175" rx="55" ry="14" fill="none" stroke="#6ee7b7" stroke-width="3" stroke-dasharray="12 6">
                        <animateTransform attributeName="transform" type="rotate" from="0 90 175" to="360 90 175" dur="2.5s" repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="90" cy="150" rx="42" ry="10" fill="none" stroke="#a7f3d0" stroke-width="2.5" stroke-dasharray="8 4">
                        <animateTransform attributeName="transform" type="rotate" from="360 90 150" to="0 90 150" dur="2s" repeatCount="indefinite" />
                    </ellipse>
                    <!-- Flowing Emerald Elemental Robes -->
                    <path d="M46,140 Q90,126 134,140 L144,210 L36,210 z" fill="#064e3b" stroke="#10b981" stroke-width="3" />
                    <path d="M68,140 L90,195 L112,140" fill="#047857" stroke="#34d399" stroke-width="1.5" />
                    <!-- Flowing Wind Scarf billowing outward -->
                    <path d="M55,130 Q30,110 15,135 Q35,145 60,138" fill="#34d399" stroke="#6ee7b7" stroke-width="2" />
                    <path d="M125,130 Q150,110 165,135 Q145,145 120,138" fill="#34d399" stroke="#6ee7b7" stroke-width="2" />
                    <!-- Spiky Wind-Swept Jade Hair -->
                    <path d="M45,75 Q30,40 65,32 Q85,15 110,25 Q135,20 142,55 Q145,85 130,95 Q90,65 45,75 z" fill="#059669" stroke="#022c22" stroke-width="2.5" />
                    <path d="M70,30 Q90,5 115,20 Q105,35 90,32" fill="#34d399" />
                    <!-- Elemental Face & Piercing Cyan Eyes -->
                    <path d="M64,76 Q62,118 90,132 Q118,118 116,76 Q90,70 64,76 z" fill="#f0fdf4" stroke="#059669" stroke-width="1.5" />
                    <ellipse cx="78" cy="94" rx="6" ry="3.5" fill="#06b6d4">
                        <animate attributeName="fill" values="#06b6d4;#22d3ee;#06b6d4" dur="1.5s" repeatCount="indefinite" />
                    </ellipse>
                    <circle cx="79" cy="93" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="94" rx="6" ry="3.5" fill="#06b6d4">
                        <animate attributeName="fill" values="#06b6d4;#22d3ee;#06b6d4" dur="1.5s" repeatCount="indefinite" />
                    </ellipse>
                    <circle cx="103" cy="93" r="1.5" fill="#ffffff" />
                `;
                break;

            default:
                // High-tier generalized Anime Character Model for all other units
                const colorMap = {
                    "Rare": { primary: "#3b82f6", hair: "#38bdf8", armor: "#1e293b" },
                    "Epic": { primary: "#a855f7", hair: "#c084fc", armor: "#3b0764" },
                    "Legendary": { primary: "#eab308", hair: "#fde047", armor: "#78350f" },
                    "Mythic": { primary: "#ef4444", hair: "#f87171", armor: "#450a0a" },
                    "Secret": { primary: "#06b6d4", hair: "#67e8f9", armor: "#083344" }
                };
                const pal = colorMap[u.rarity] || colorMap["Rare"];

                bodySvg = `
                    <circle cx="90" cy="110" r="80" fill="${pal.primary}" opacity="0.25" />
                    <!-- Battle Armor Torso -->
                    <path d="M52,148 Q90,135 128,148 L132,210 L48,210 z" fill="${pal.armor}" stroke="${pal.primary}" stroke-width="2.5" />
                    <!-- Layered Anime Hair -->
                    <path d="M58,82 Q45,45 70,38 Q90,30 110,38 Q135,45 122,82 Q125,120 115,135 L108,100 Q90,110 72,100 L65,135 Q55,120 58,82 z" fill="${pal.hair}" stroke="#0f172a" stroke-width="1.5" />
                    <!-- Head & Expressive Eyes -->
                    <path d="M66,82 Q64,122 90,135 Q116,122 114,82 Q90,76 66,82 z" fill="#fef2f2" />
                    <ellipse cx="78" cy="98" rx="5.5" ry="3.8" fill="${pal.primary}" />
                    <circle cx="79" cy="96" r="1.5" fill="#ffffff" />
                    <ellipse cx="102" cy="98" rx="5.5" ry="3.8" fill="${pal.primary}" />
                    <circle cx="103" cy="96" r="1.5" fill="#ffffff" />
                    <path d="M72,92 Q78,89 84,93" stroke="#0f172a" stroke-width="2" fill="none" />
                    <path d="M96,93 Q102,89 108,92" stroke="#0f172a" stroke-width="2" fill="none" />
                    <line x1="90" y1="106" x2="89" y2="112" stroke="#fed7aa" stroke-width="1.5" />
                    <path d="M85,120 Q90,123 95,120" stroke="#0f172a" stroke-width="2" fill="none" />
                `;
                break;
        }

        const fullSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 220" width="${width}" height="${height}">
                ${bodySvg}
            </svg>
        `;
        const url = `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
        this.cache[key] = url;
        return url;
    },

    // ----------------------------------------------------
    // IN-GAME COMBAT & INVENTORY SPRITE
    // High-clarity 48x48 icon with drop shadows and distinct silhouettes
    // ----------------------------------------------------
    getUnitSprite(unitId, size = 48) {
        if ((unitId === "breeze_scout" || unitId === "archer") && window.ARCHER_8DIR_SPRITES && window.ARCHER_8DIR_SPRITES["S"]) {
            return window.ARCHER_8DIR_SPRITES["S"];
        }
        // Reuse the rich model scaled for crisp canvas rendering
        return this.getUnitModel(unitId, size, size);
    },

    // ----------------------------------------------------
    // STAR FRUITS (Classic 5-Pointed Golden Star Fruit Design)
    // ----------------------------------------------------
    getStarFruitIcon(type, size = 48) {
        return this.getStarFruit(type, size);
    },

    getStarFruit(type, size = 48) {
        const key = `sf_${type}_${size}`;
        if (this.cache[key]) return this.cache[key];

        let primary = "#facc15";
        let shadow = "#ca8a04";
        let highlight = "#fef08a";
        let strokeColor = "#a16207";
        let aura = "rgba(250, 204, 21, 0.4)";
        let glowG = "";

        if (type.includes("pink")) {
            primary = "#f472b6"; shadow = "#db2777"; highlight = "#fbcfe8"; strokeColor = "#be185d"; aura = "rgba(244, 114, 182, 0.4)";
        } else if (type.includes("red")) {
            primary = "#ef4444"; shadow = "#b91c1c"; highlight = "#fca5a5"; strokeColor = "#991b1b"; aura = "rgba(239, 68, 68, 0.4)";
        } else if (type.includes("green")) {
            primary = "#22c55e"; shadow = "#15803d"; highlight = "#86efac"; strokeColor = "#166534"; aura = "rgba(34, 197, 94, 0.4)";
        } else if (type.includes("blue")) {
            primary = "#38bdf8"; shadow = "#0284c7"; highlight = "#bae6fd"; strokeColor = "#0369a1"; aura = "rgba(56, 189, 248, 0.4)";
        } else if (type.includes("yellow")) {
            primary = "#fbbf24"; shadow = "#d97706"; highlight = "#fef3c7"; strokeColor = "#b45309"; aura = "rgba(251, 191, 36, 0.4)";
        } else if (type.includes("rainbow")) {
            primary = "url(#rainbowGrad)"; shadow = "#7c3aed"; highlight = "#ffffff"; strokeColor = "#6d28d9"; aura = "rgba(168, 85, 247, 0.5)";
            glowG = `
                <defs>
                    <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#ef4444" />
                        <stop offset="25%" stop-color="#facc15" />
                        <stop offset="50%" stop-color="#22c55e" />
                        <stop offset="75%" stop-color="#38bdf8" />
                        <stop offset="100%" stop-color="#a855f7" />
                    </linearGradient>
                </defs>
            `;
        }

        const svg = `
            ${glowG}
            <!-- Outer Glow -->
            <polygon points="16,4 19.8,12 28.5,13.2 22.2,19.3 23.7,28 16,23.8 8.3,28 9.8,19.3 3.5,13.2 12.2,12" fill="${aura}" transform="scale(1.08) translate(-1.3, -1)" />
            <!-- Stem & Leaf -->
            <path d="M16 2 C16 4, 18 5, 20 4 C19 6, 17 6, 16 5.5 Z" fill="#22c55e" stroke="#15803d" stroke-width="0.8" />
            <!-- Main Star Fruit Body -->
            <polygon points="16,5 19.8,12.5 28,13.8 22,19.5 23.5,27.5 16,23.5 8.5,27.5 10,19.5 4,13.8 12.2,12.5" fill="${primary}" stroke="${strokeColor}" stroke-width="1.2" stroke-linejoin="round" />
            <!-- Shadow Facets -->
            <polygon points="16,16 16,5 19.8,12.5" fill="${highlight}" opacity="0.5" />
            <polygon points="16,16 19.8,12.5 28,13.8" fill="${highlight}" opacity="0.3" />
            <polygon points="16,16 28,13.8 22,19.5" fill="${shadow}" opacity="0.4" />
            <polygon points="16,16 22,19.5 23.5,27.5" fill="${shadow}" opacity="0.6" />
            <polygon points="16,16 23.5,27.5 16,23.5" fill="${shadow}" opacity="0.5" />
            <polygon points="16,16 16,23.5 8.5,27.5" fill="${shadow}" opacity="0.4" />
            <polygon points="16,16 8.5,27.5 10,19.5" fill="${shadow}" opacity="0.3" />
            <polygon points="16,16 10,19.5 4,13.8" fill="${highlight}" opacity="0.4" />
            <polygon points="16,16 4,13.8 12.2,12.5" fill="${highlight}" opacity="0.6" />
            <polygon points="16,16 12.2,12.5 16,5" fill="${highlight}" opacity="0.7" />
            <!-- Center Shine Core -->
            <circle cx="16" cy="15" r="2" fill="#ffffff" opacity="0.85" />
        `;

        const url = this.createSvgDataUrl(svg, size, size, "0 0 32 32");
        this.cache[key] = url;
        return url;
    },

    // ----------------------------------------------------
    // FOOD ITEMS (Gourmet Dishes)
    // ----------------------------------------------------
    getFood(id, size = 48) {
        const key = `food_${id}_${size}`;
        if (this.cache[key]) return this.cache[key];

        let svgContent = this.getFoodIcon(id, 64);
        // Extract inner svg contents to wrap into data url
        const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
        const inner = innerMatch ? innerMatch[1] : svgContent;

        const url = this.createSvgDataUrl(inner, size, size, "0 0 64 64");
        this.cache[key] = url;
        return url;
    },

    // ----------------------------------------------------
    // ENEMIES (Monsters & Bosses)
    // ----------------------------------------------------
        getEnemySprite(type, size = 48) {
        const key = `enemy_${type}_${size}`;
        if (this.cache[key]) return this.cache[key];

        let svg = "";
        if (type === "grunt") {
            // 1. Goblin Grunt: Pointed ears, green skin, ragged leather tunic, wooden club
            svg = `
                <!-- Goblin Grunt -->
                <polygon points="4,12 8,14 6,18" fill="#15803d" stroke="#052e16" stroke-width="1"/>
                <polygon points="28,12 24,14 26,18" fill="#15803d" stroke="#052e16" stroke-width="1"/>
                <circle cx="16" cy="14" r="8" fill="#22c55e" stroke="#052e16" stroke-width="1.5"/>
                <circle cx="13" cy="13" r="2" fill="#ef4444"/>
                <circle cx="19" cy="13" r="2" fill="#ef4444"/>
                <polygon points="16,14 14,17 18,17" fill="#15803d"/>
                <rect x="11" y="21" width="10" height="9" rx="2" fill="#78350f" stroke="#052e16" stroke-width="1.5"/>
                <line x1="22" y1="18" x2="27" y2="10" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
                <circle cx="28" cy="9" r="2.5" fill="#78350f"/>
            `;
        } else if (type === "scout_dasher") {
            // 2. Scout Dasher: Shadowy rogue ninja with crimson visor and speed trail
            svg = `
                <!-- Scout Dasher -->
                <path d="M4,22 L10,20 L6,25 Z" fill="#991b1b" opacity="0.6"/>
                <path d="M2,26 L8,24 L4,28 Z" fill="#991b1b" opacity="0.4"/>
                <circle cx="17" cy="15" r="7.5" fill="#18181b" stroke="#7f1d1d" stroke-width="1.5"/>
                <rect x="11" y="13" width="12" height="3.5" rx="1" fill="#ef4444"/>
                <polygon points="12,18 22,18 19,29 15,29" fill="#27272a" stroke="#09090b" stroke-width="1.5"/>
                <line x1="22" y1="16" x2="28" y2="12" stroke="#e4e4e7" stroke-width="2"/>
                <polygon points="28,12 26,10 30,11" fill="#ef4444"/>
            `;
        } else if (type === "armored_golem") {
            // 3. Armored Golem: Heavy steel & stone titan with glowing cyan visor slit
            svg = `
                <!-- Armored Golem -->
                <rect x="6" y="8" width="20" height="20" rx="3" fill="#334155" stroke="#0f172a" stroke-width="2"/>
                <rect x="9" y="11" width="14" height="4" rx="1" fill="#020617"/>
                <line x1="11" y1="13" x2="21" y2="13" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
                <rect x="4" y="11" width="4" height="10" rx="2" fill="#64748b" stroke="#0f172a" stroke-width="1.5"/>
                <rect x="24" y="11" width="4" height="10" rx="2" fill="#64748b" stroke="#0f172a" stroke-width="1.5"/>
                <circle cx="16" cy="21" r="2" fill="#38bdf8"/>
                <line x1="9" y1="18" x2="23" y2="18" stroke="#0f172a" stroke-width="1.5"/>
            `;
        } else if (type === "flying_harpy") {
            // 4. Flying Harpy: Winged avian beast with violet feathers and talons
            svg = `
                <!-- Flying Harpy -->
                <path d="M2,14 Q10,6 15,14 Q8,18 2,14 Z" fill="#7c3aed" stroke="#3b0764" stroke-width="1.5"/>
                <path d="M30,14 Q22,6 17,14 Q24,18 30,14 Z" fill="#7c3aed" stroke="#3b0764" stroke-width="1.5"/>
                <circle cx="16" cy="13" r="6" fill="#a855f7" stroke="#3b0764" stroke-width="1.5"/>
                <polygon points="16,8 14,5 18,5" fill="#facc15"/>
                <circle cx="14" cy="12" r="1.5" fill="#fde047"/>
                <circle cx="18" cy="12" r="1.5" fill="#fde047"/>
                <polygon points="16,14 14,16 18,16" fill="#eab308"/>
                <polygon points="13,26 15,22 17,22 19,26 16,28" fill="#4c1d95"/>
            `;
        } else if (type === "flying_wyvern" || type === "shadow_wyvern") {
            // 5. Flying Wyvern: Draconic beast with spreading horned wings and fire eye
            svg = `
                <!-- Flying Wyvern -->
                <path d="M1,12 Q12,2 16,12 Q9,20 1,12 Z" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
                <path d="M31,12 Q20,2 16,12 Q23,20 31,12 Z" fill="#3b0764" stroke="#c084fc" stroke-width="1.5"/>
                <polygon points="16,6 12,12 20,12" fill="#581c87" stroke="#0f172a" stroke-width="1.5"/>
                <polygon points="11,7 8,3 12,5" fill="#eab308"/>
                <polygon points="21,7 24,3 20,5" fill="#eab308"/>
                <circle cx="14" cy="10" r="1.5" fill="#ef4444"/>
                <circle cx="18" cy="10" r="1.5" fill="#ef4444"/>
                <path d="M14,18 L16,28 L18,18 Z" fill="#2e1065" stroke="#c084fc" stroke-width="1.2"/>
            `;
        } else if (type === "magic_shieldbearer") {
            // 6. Magic Shieldbearer: Heavy knight holding glowing hexagonal shield
            svg = `
                <!-- Magic Shieldbearer -->
                <rect x="11" y="9" width="10" height="11" rx="2" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
                <line x1="13" y1="13" x2="19" y2="13" stroke="#94a3b8" stroke-width="2"/>
                <polygon points="5,8 15,8 18,16 15,24 5,24 2,16" fill="#1e40af" stroke="#60a5fa" stroke-width="2"/>
                <polygon points="7,10 13,10 15,16 13,22 7,22 5,16" fill="#3b82f6" opacity="0.6"/>
                <line x1="10" y1="12" x2="10" y2="20" stroke="#ffffff" stroke-width="1.5"/>
                <line x1="6" y1="16" x2="14" y2="16" stroke="#ffffff" stroke-width="1.5"/>
            `;
        } else if (type === "shadow_healer") {
            // 7. Shadow Healer: Hooded occult cultist with glowing amethyst skull staff
            svg = `
                <!-- Shadow Healer -->
                <path d="M9,28 Q16,8 23,28 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
                <circle cx="16" cy="13" r="5" fill="#0f172a"/>
                <circle cx="14" cy="13" r="1.5" fill="#a855f7"/>
                <circle cx="18" cy="13" r="1.5" fill="#a855f7"/>
                <line x1="24" y1="6" x2="24" y2="28" stroke="#78350f" stroke-width="2"/>
                <circle cx="24" cy="6" r="3.5" fill="#c084fc" stroke="#6b21a8" stroke-width="1.5"/>
                <circle cx="24" cy="6" r="1.5" fill="#ffffff"/>
            `;
        } else if (type === "berserker_orc") {
            // 8. Berserker Orc: Muscular green orc with dual spiked axes and war horns
            svg = `
                <!-- Berserker Orc -->
                <polygon points="8,10 5,6 10,8" fill="#fef08a"/>
                <polygon points="24,10 27,6 22,8" fill="#fef08a"/>
                <rect x="9" y="8" width="14" height="13" rx="3" fill="#15803d" stroke="#052e16" stroke-width="1.5"/>
                <circle cx="13" cy="12" r="2" fill="#dc2626"/>
                <circle cx="19" cy="12" r="2" fill="#dc2626"/>
                <line x1="11" y1="10" x2="14" y2="10" stroke="#7f1d1d" stroke-width="1.5"/>
                <line x1="18" y1="10" x2="21" y2="10" stroke="#7f1d1d" stroke-width="1.5"/>
                <polygon points="12,18 14,15 16,18" fill="#ffffff"/>
                <polygon points="16,18 18,15 20,18" fill="#ffffff"/>
                <rect x="7" y="21" width="18" height="9" fill="#78350f" stroke="#052e16" stroke-width="1.5"/>
                <line x1="4" y1="14" x2="4" y2="26" stroke="#475569" stroke-width="2"/>
                <polygon points="4,14 1,18 7,18" fill="#94a3b8"/>
                <line x1="28" y1="14" x2="28" y2="26" stroke="#475569" stroke-width="2"/>
                <polygon points="28,14 25,18 31,18" fill="#94a3b8"/>
            `;
        } else if (type === "world_boss_demon" || type === "demon_lord_malakor") {
            // 9. World Boss Demon: Giant archdemon with curled obsidian horns and hellfire core
            svg = `
                <!-- World Boss Demon -->
                <path d="M4,10 Q2,2 10,6 Q8,12 12,12" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
                <path d="M28,10 Q30,2 22,6 Q24,12 20,12" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
                <polygon points="16,6 9,13 12,24 20,24 23,13" fill="#18181b" stroke="#dc2626" stroke-width="2"/>
                <circle cx="13" cy="14" r="2.5" fill="#facc15" stroke="#ef4444" stroke-width="1"/>
                <circle cx="19" cy="14" r="2.5" fill="#facc15" stroke="#ef4444" stroke-width="1"/>
                <polygon points="16,18 13,22 19,22" fill="#ef4444"/>
                <path d="M7,22 L16,30 L25,22 L20,31 L12,31 Z" fill="#450a0a" stroke="#f87171" stroke-width="1.5"/>
            `;
        } else if (type === "abyssal_colossus") {
            // 10. Abyssal Colossus: Ancient cyclopean void colossus with a single burning eye
            svg = `
                <!-- Abyssal Colossus -->
                <rect x="5" y="7" width="22" height="22" rx="4" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
                <circle cx="16" cy="15" r="5" fill="#020617" stroke="#a855f7" stroke-width="2"/>
                <circle cx="16" cy="15" r="2.5" fill="#facc15"/>
                <line x1="8" y1="12" x2="12" y2="10" stroke="#818cf8" stroke-width="2"/>
                <line x1="24" y1="12" x2="20" y2="10" stroke="#818cf8" stroke-width="2"/>
                <line x1="16" y1="21" x2="16" y2="26" stroke="#c084fc" stroke-width="2"/>
            `;
        } else if (type === "genesis_void_behemoth") {
            // 11. Genesis Void Behemoth: Cosmic raid boss with void tendrils and singularity core
            svg = `
                <!-- Genesis Void Behemoth -->
                <circle cx="16" cy="16" r="14" fill="#09090b" stroke="#a855f7" stroke-width="2.5"/>
                <polygon points="8,4 12,12 6,10" fill="#7e22ce"/>
                <polygon points="24,4 20,12 26,10" fill="#7e22ce"/>
                <polygon points="16,2 14,8 18,8" fill="#c084fc"/>
                <circle cx="16" cy="16" r="6" fill="#3b0764" stroke="#ec4899" stroke-width="2"/>
                <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
                <circle cx="11" cy="15" r="1.5" fill="#ec4899"/>
                <circle cx="21" cy="15" r="1.5" fill="#ec4899"/>
            `;
        } else if (type === "soaring_sky_serpent") {
            // Soaring Sky Serpent: Ethereal stratosphere dragon with azure dragon scales and whirlwind feathers
            svg = `
                <!-- Soaring Sky Serpent -->
                <path d="M2,14 Q8,8 14,14 T26,14 T30,10" fill="none" stroke="#0284c7" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M2,14 Q8,8 14,14 T26,14 T30,10" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M6,10 L10,3 L15,10 Z" fill="#0ea5e9" opacity="0.85"/>
                <path d="M18,10 L22,3 L27,10 Z" fill="#0ea5e9" opacity="0.85"/>
                <circle cx="28" cy="11" r="4" fill="#0369a1" stroke="#38bdf8" stroke-width="1.2"/>
                <circle cx="29" cy="10" r="1.5" fill="#facc15"/>
                <path d="M25,18 Q20,24 14,21 T6,25" fill="none" stroke="#7dd3fc" stroke-width="1.5" stroke-dasharray="2,2"/>
            `;
        } else if (type === "celestial_soarer") {
            // Celestial Soarer: Radiant solar roc bird with glowing sun wings and starlight tail
            svg = `
                <!-- Celestial Soarer -->
                <path d="M2,18 Q7,4 16,11 Q25,4 30,18 L24,20 Q16,14 8,20 Z" fill="#eab308" stroke="#fef08a" stroke-width="1.5"/>
                <polygon points="16,8 19,16 13,16" fill="#facc15"/>
                <circle cx="16" cy="10" r="3" fill="#ffffff" stroke="#f59e0b" stroke-width="1"/>
                <circle cx="16" cy="10" r="1.2" fill="#ef4444"/>
                <polygon points="16,16 12,28 16,25 20,28" fill="#ca8a04" stroke="#facc15" stroke-width="1"/>
                <circle cx="6" cy="11" r="1.5" fill="#fef08a"/>
                <circle cx="26" cy="11" r="1.5" fill="#fef08a"/>
            `;
        } else {
            // Fallback distinct minion
            svg = `
                <polygon points="16,6 24,14 21,26 11,26 8,14" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
                <circle cx="13" cy="14" r="2" fill="#ef4444"/>
                <circle cx="19" cy="14" r="2" fill="#ef4444"/>
            `;
        }

        const url = this.createSvgDataUrl(svg, size, size, "0 0 32 32");
        this.cache[key] = url;
        return url;
    },

    getTraitIcon(traitName, size = 20) {
        const tConf = (window.TRAIT_CONFIG && window.TRAIT_CONFIG[traitName]) || {};
        const type = tConf.symbolType || "muscles";
        const rarity = tConf.rarity || "Rare";

        let primaryColor = "#3b82f6";
        if (traitName === "Unique") primaryColor = "#f59e0b";
        else if (traitName === "Eternal") primaryColor = "#c084fc";
        else if (traitName === "Divine") primaryColor = "#facc15";
        else if (traitName === "Celestial") primaryColor = "#38bdf8";
        else if (traitName === "Reaper") primaryColor = "#ef4444";
        else if (rarity === "Legendary") primaryColor = "#eab308";
        else if (rarity === "Epic") primaryColor = "#a855f7";
        else primaryColor = "#3b82f6";

        let symbolPaths = "";

        if (type === "crown" || traitName === "Unique") {
            // Imperial Golden Crown with Ruby and Sapphires (Unique)
            symbolPaths = `
                <path d="M4,24 L28,24 L26,10 L20,17 L16,6 L12,17 L6,10 Z" fill="#facc15" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
                <rect x="4" y="24" width="24" height="4" rx="1.5" fill="#f59e0b" stroke="#ffffff" stroke-width="0.8"/>
                <circle cx="16" cy="6" r="2.2" fill="#facc15" stroke="#ffffff" stroke-width="0.6"/>
                <circle cx="6" cy="10" r="1.8" fill="#facc15" stroke="#ffffff" stroke-width="0.6"/>
                <circle cx="26" cy="10" r="1.8" fill="#facc15" stroke="#ffffff" stroke-width="0.6"/>
                <circle cx="16" cy="18" r="2.2" fill="#ef4444" stroke="#ffffff" stroke-width="0.5"/>
                <circle cx="11" cy="22" r="1.5" fill="#38bdf8"/>
                <circle cx="21" cy="22" r="1.5" fill="#38bdf8"/>
            `;
        } else if (type === "moon" || traitName === "Celestial") {
            // Celestial Shimmering Crescent Moon with Golden Stars (Celestial)
            symbolPaths = `
                <path d="M22,5 C13,6 7,13 7,21 C7,27 12,31 18,31 C22,31 25,29 27,27 C19,26 15,20 15,14 C15,9 18,6 22,5 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="1.2"/>
                <path d="M25,8 L26,11 L29,12 L26,13 L25,16 L24,13 L21,12 L24,11 Z" fill="#facc15"/>
                <circle cx="11" cy="9" r="1.4" fill="#ffffff"/>
                <circle cx="27" cy="22" r="1" fill="#e0f2fe"/>
            `;
        } else if (type === "divine_eye" || traitName === "Divine") {
            // Radiant Golden All-Seeing Eye with Light Rays (Divine)
            symbolPaths = `
                <g stroke="#facc15" stroke-width="1.6" stroke-linecap="round">
                    <line x1="16" y1="3" x2="16" y2="7"/>
                    <line x1="16" y1="25" x2="16" y2="29"/>
                    <line x1="3" y1="16" x2="7" y2="16"/>
                    <line x1="25" y1="16" x2="29" y2="16"/>
                    <line x1="7" y1="7" x2="10" y2="10"/>
                    <line x1="22" y1="22" x2="25" y2="25"/>
                    <line x1="25" y1="7" x2="22" y2="10"/>
                    <line x1="7" y1="25" x2="10" y2="22"/>
                </g>
                <path d="M4,16 Q16,7 28,16 Q16,25 4,16 Z" fill="#1e1b4b" stroke="#facc15" stroke-width="1.8"/>
                <circle cx="16" cy="16" r="5" fill="#facc15"/>
                <circle cx="16" cy="16" r="2.5" fill="#0f172a"/>
                <circle cx="17.5" cy="14.5" r="1.1" fill="#ffffff"/>
            `;
        } else if (type === "infinity" || traitName === "Eternal") {
            // Cosmic Glowing Infinity Loop in Neon Violet (Eternal)
            symbolPaths = `
                <path d="M10,16 C5,10 5,22 10,22 C14,22 18,10 22,10 C27,10 27,22 22,22 C18,22 14,10 10,10 C5,10 5,22 10,22" fill="none" stroke="#c084fc" stroke-width="3.5" stroke-linecap="round"/>
                <path d="M10,16 C5,10 5,22 10,22 C14,22 18,10 22,10 C27,10 27,22 22,22 C18,22 14,10 10,10 C5,10 5,22 10,22" fill="none" stroke="#f3e8ff" stroke-width="1.2" stroke-linecap="round"/>
                <circle cx="10" cy="16" r="1.5" fill="#ffffff"/>
                <circle cx="22" cy="16" r="1.5" fill="#ffffff"/>
            `;
        } else if (type === "scythe" || traitName === "Reaper") {
            // Blood Scythe (Reaper)
            symbolPaths = `
                <path d="M6,29 L23,7" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M19,6 Q26,3 29,10 Q24,9 18,14 Z" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
                <path d="M18,14 Q23,10 28,11" stroke="#ffffff" stroke-width="1.2" fill="none"/>
                <circle cx="21" cy="9" r="1.5" fill="#ffffff"/>
            `;
        } else if (type === "gold_bars") {
            // Stacked Gold Bars (Fortune)
            symbolPaths = `
                <path d="M4,20 L16,20 L14,25 L2,25 Z" fill="#ca8a04" stroke="#facc15" stroke-width="0.8"/>
                <path d="M16,20 L28,20 L26,25 L14,25 Z" fill="#eab308" stroke="#fef08a" stroke-width="0.8"/>
                <path d="M10,14 L22,14 L20,19 L8,19 Z" fill="#facc15" stroke="#ffffff" stroke-width="0.8"/>
                <polygon points="10,14 12,10 24,10 22,14" fill="#fef08a"/>
                <polygon points="22,14 24,10 26,15 20,19" fill="#ca8a04"/>
            `;
        } else if (type === "skull") {
            // Warrior Skull (Culling)
            symbolPaths = `
                <path d="M8,14 C8,7 24,7 24,14 C24,18 22,20 20,22 L20,25 L12,25 L12,22 C10,20 8,18 8,14 Z" fill="${primaryColor}" stroke="#0f172a" stroke-width="1"/>
                <ellipse cx="12" cy="14" rx="2.5" ry="3" fill="#0f172a"/>
                <ellipse cx="20" cy="14" rx="2.5" ry="3" fill="#0f172a"/>
                <polygon points="16,16 15,19 17,19" fill="#0f172a"/>
                <line x1="14" y1="23" x2="14" y2="25" stroke="#0f172a" stroke-width="1"/>
                <line x1="16" y1="23" x2="16" y2="25" stroke="#0f172a" stroke-width="1"/>
                <line x1="18" y1="23" x2="18" y2="25" stroke="#0f172a" stroke-width="1"/>
            `;
        } else if (type === "eye") {
            // Precision Sniper Eye (Sniper)
            symbolPaths = `
                <path d="M4,16 Q16,8 28,16 Q16,24 4,16 Z" fill="none" stroke="${primaryColor}" stroke-width="2"/>
                <circle cx="16" cy="16" r="5" fill="${primaryColor}"/>
                <circle cx="16" cy="16" r="2" fill="#0f172a"/>
                <circle cx="17" cy="15" r="0.9" fill="#ffffff"/>
                <line x1="16" y1="7" x2="16" y2="11" stroke="${primaryColor}" stroke-width="1.5"/>
                <line x1="16" y1="21" x2="16" y2="25" stroke="${primaryColor}" stroke-width="1.5"/>
                <line x1="7" y1="16" x2="11" y2="16" stroke="${primaryColor}" stroke-width="1.5"/>
                <line x1="21" y1="16" x2="25" y2="16" stroke="${primaryColor}" stroke-width="1.5"/>
            `;
        } else if (type === "lightning") {
            // Godspeed Lightning Bolt (Godspeed)
            symbolPaths = `
                <polygon points="18,3 8,16 15,16 13,29 24,14 17,14" fill="${primaryColor}" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="miter"/>
            `;
        } else if (type === "muscles" || type === "superior") {
            // Radiant Crossed Battle Blades (Superior)
            symbolPaths = `
                <!-- Sword 1 (top-left to bottom-right) -->
                <line x1="6" y1="6" x2="26" y2="26" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
                <line x1="7" y1="7" x2="25" y2="25" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="8" y1="8" x2="22" y2="22" stroke="#ffffff" stroke-width="1"/>
                <line x1="20" y1="24" x2="24" y2="20" stroke="#f8fafc" stroke-width="2" stroke-linecap="round"/>
                <circle cx="26" cy="26" r="1.5" fill="#f8fafc"/>
                
                <!-- Sword 2 (top-right to bottom-left) -->
                <line x1="26" y1="6" x2="6" y2="26" stroke="#0f172a" stroke-width="4.5" stroke-linecap="round"/>
                <line x1="25" y1="7" x2="7" y2="25" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="24" y1="8" x2="10" y2="22" stroke="#ffffff" stroke-width="1"/>
                <line x1="8" y1="20" x2="12" y2="24" stroke="#f8fafc" stroke-width="2" stroke-linecap="round"/>
                <circle cx="6" cy="26" r="1.5" fill="#f8fafc"/>

                <!-- Central Radiant Power Diamond -->
                <polygon points="16,9 19,16 16,23 13,16" fill="#ffffff" stroke="${primaryColor}" stroke-width="1"/>
                <circle cx="16" cy="16" r="2" fill="${primaryColor}"/>
                <circle cx="16" cy="16" r="0.8" fill="#ffffff"/>
            `;
        } else if (type === "kunai") {
            // Ninja Kunai Dagger (Nimble)
            symbolPaths = `
                <polygon points="16,4 12,14 15,16 15,24 17,24 17,16 20,14" fill="${primaryColor}" stroke="#ffffff" stroke-width="1"/>
                <circle cx="16" cy="27" r="2.5" fill="none" stroke="${primaryColor}" stroke-width="1.5"/>
                <line x1="16" y1="4" x2="16" y2="14" stroke="#ffffff" stroke-width="0.8"/>
            `;
        } else if (type === "crosshair") {
            // Sniper Crosshair (Range)
            symbolPaths = `
                <circle cx="16" cy="16" r="10" fill="none" stroke="${primaryColor}" stroke-width="1.8"/>
                <circle cx="16" cy="16" r="4" fill="none" stroke="${primaryColor}" stroke-width="1"/>
                <circle cx="16" cy="16" r="1.5" fill="${primaryColor}"/>
                <line x1="16" y1="4" x2="16" y2="9" stroke="${primaryColor}" stroke-width="1.8"/>
                <line x1="16" y1="23" x2="16" y2="28" stroke="${primaryColor}" stroke-width="1.8"/>
                <line x1="4" y1="16" x2="9" y2="16" stroke="${primaryColor}" stroke-width="1.8"/>
                <line x1="23" y1="16" x2="28" y2="16" stroke="${primaryColor}" stroke-width="1.8"/>
            `;
        } else if (type === "tome" || type === "adept") {
            // Illuminated Arcane Grimoire (Adept)
            symbolPaths = `
                <!-- Book Base & Cover Shadow -->
                <path d="M4,25 Q16,22 28,25 L28,14 Q16,11 4,14 Z" fill="#1e1b4b" stroke="#0f172a" stroke-width="1.5"/>
                
                <!-- Open Pages (Left & Right) -->
                <path d="M5,23 Q16,20 16,12 Q9,10 5,12 Z" fill="#f8fafc" stroke="#334155" stroke-width="0.8"/>
                <path d="M27,23 Q16,20 16,12 Q23,10 27,12 Z" fill="#e2e8f0" stroke="#334155" stroke-width="0.8"/>
                
                <!-- Page Runic Text Lines -->
                <line x1="8" y1="15" x2="13" y2="15" stroke="${primaryColor}" stroke-width="1" stroke-linecap="round"/>
                <line x1="8" y1="18" x2="13" y2="18" stroke="${primaryColor}" stroke-width="1" stroke-linecap="round"/>
                <line x1="19" y1="15" x2="24" y2="15" stroke="${primaryColor}" stroke-width="1" stroke-linecap="round"/>
                <line x1="19" y1="18" x2="24" y2="18" stroke="${primaryColor}" stroke-width="1" stroke-linecap="round"/>

                <!-- Golden Bookmark Ribbon -->
                <path d="M16,12 L16,25 L14,23 L16,25 L18,23" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
                
                <!-- Floating Arcane Wisdom Spark Above Grimoire -->
                <polygon points="16,3 17.5,6.5 21,7.5 17.5,8.5 16,12 14.5,8.5 11,7.5 14.5,6.5" fill="#facc15" stroke="#ffffff" stroke-width="0.5"/>
                <circle cx="16" cy="7.5" r="1.2" fill="#ffffff"/>
            `;
        }

        return `
            <svg class="trait-symbol-svg" width="${size}" height="${size}" viewBox="0 0 32 32" style="display:inline-block;vertical-align:middle;">
                ${symbolPaths}
            </svg>
        `.replace(/[\r\n]+/g, ' ').trim();
    },

    getLuckPotionIcon(size = 48) {
        return `
            <svg class="luck-potion-svg" width="${size}" height="${size}" viewBox="0 0 48 48" style="display:inline-block;vertical-align:middle;filter:drop-shadow(0 0 8px rgba(16,185,129,0.7));">
                <defs>
                    <linearGradient id="luckPotionElixir" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#34d399"/>
                        <stop offset="50%" stop-color="#10b981"/>
                        <stop offset="100%" stop-color="#059669"/>
                    </linearGradient>
                    <linearGradient id="luckGlassShine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0.8)"/>
                        <stop offset="100%" stop-color="rgba(255,255,255,0.05)"/>
                    </linearGradient>
                </defs>
                <!-- Cork Stopper & Neck -->
                <rect x="21" y="4" width="6" height="5" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1"/>
                <rect x="19" y="9" width="10" height="3" rx="1.5" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
                <!-- Flask Neck -->
                <path d="M20,12 L20,17 L10,32 C7,36 10,43 16,43 L32,43 C38,43 41,36 38,32 L28,17 L28,12 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
                <!-- Liquid Fill -->
                <path d="M12,33 L14,30 Q24,28 34,30 L36,33 C39,37 36,41 32,41 L16,41 C12,41 9,37 12,33 Z" fill="url(#luckPotionElixir)"/>
                <!-- Four-leaf clover seal in potion -->
                <g transform="translate(24, 35) scale(0.7)">
                    <circle cx="-5" cy="-5" r="4.5" fill="#facc15"/>
                    <circle cx="5" cy="-5" r="4.5" fill="#facc15"/>
                    <circle cx="-5" cy="5" r="4.5" fill="#facc15"/>
                    <circle cx="5" cy="5" r="4.5" fill="#facc15"/>
                    <path d="M0,0 L0,8" stroke="#ca8a04" stroke-width="2" stroke-linecap="round"/>
                </g>
                <!-- Bubbles & Sparkles -->
                <circle cx="21" cy="27" r="1.8" fill="#a7f3d0">
                    <animate attributeName="cy" values="32;22" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="27" cy="25" r="1.2" fill="#fef08a">
                    <animate attributeName="cy" values="30;19" dur="1.7s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="1;0" dur="1.7s" repeatCount="indefinite"/>
                </circle>
                <!-- Glass Highlight Curve -->
                <path d="M14,32 C12,35 14,40 18,40" stroke="url(#luckGlassShine)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <!-- Magic Star Glint -->
                <path d="M37,12 L38,15 L41,16 L38,17 L37,20 L36,17 L33,16 L36,15 Z" fill="#facc15"/>
            </svg>
        `;
    },

    getRelicShardIcon(size = 48) {
        return `
            <svg class="relic-shard-svg" width="${size}" height="${size}" viewBox="0 0 64 64" style="display:inline-block;vertical-align:middle;filter:drop-shadow(0 0 8px rgba(165,180,252,0.6));">
                <defs>
                    <radialGradient id="rsShardAura" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#a5b4fc" stop-opacity="0.4"/>
                        <stop offset="60%" stop-color="#c084fc" stop-opacity="0.18"/>
                        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="rsTopLeft" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#67e8f9"/>
                        <stop offset="40%" stop-color="#34d399"/>
                        <stop offset="100%" stop-color="#a7f3d0"/>
                    </linearGradient>
                    <linearGradient id="rsTopRight" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#c7d2fe"/>
                        <stop offset="50%" stop-color="#bfdbfe"/>
                        <stop offset="100%" stop-color="#f8fafc"/>
                    </linearGradient>
                    <linearGradient id="rsBotRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#e9d5ff"/>
                        <stop offset="50%" stop-color="#d8b4fe"/>
                        <stop offset="100%" stop-color="#f472b6"/>
                    </linearGradient>
                    <linearGradient id="rsBotLeft" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#c7d2fe"/>
                        <stop offset="60%" stop-color="#a78bfa"/>
                        <stop offset="100%" stop-color="#c4b5fd"/>
                    </linearGradient>
                    <linearGradient id="rsBevelTL" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#0f766e"/>
                        <stop offset="100%" stop-color="#2dd4bf"/>
                    </linearGradient>
                    <linearGradient id="rsBevelTR" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#6366f1"/>
                        <stop offset="100%" stop-color="#e0e7ff"/>
                    </linearGradient>
                    <linearGradient id="rsBevelBR" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#86198f"/>
                        <stop offset="100%" stop-color="#e879f9"/>
                    </linearGradient>
                    <linearGradient id="rsBevelBL" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#4338ca"/>
                        <stop offset="100%" stop-color="#818cf8"/>
                    </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill="url(#rsShardAura)"/>
                <path d="M32 17 L44 8 L56 20 L47 32 L56 44 L44 56 L32 47 L20 56 L8 44 L17 32 L8 20 L20 8 Z" fill="#09090b" stroke="#09090b" stroke-width="4.5" stroke-linejoin="round"/>
                <polygon points="32,17 20,8 8,20 17,32 23,30 14,21 21,14 30,23" fill="url(#rsBevelTL)"/>
                <polygon points="32,17 44,8 56,20 47,32 41,30 50,21 43,14 34,23" fill="url(#rsBevelTR)"/>
                <polygon points="47,32 56,44 44,56 32,47 34,41 43,50 50,43 41,34" fill="url(#rsBevelBR)"/>
                <polygon points="17,32 8,44 20,56 32,47 30,41 21,50 14,43 23,34" fill="url(#rsBevelBL)"/>
                <polygon points="32,24 43,14 50,21 41,30 32,32" fill="url(#rsTopRight)"/>
                <polygon points="32,24 21,14 14,21 23,30 32,32" fill="url(#rsTopLeft)"/>
                <polygon points="41,34 50,43 43,50 34,41 32,32" fill="url(#rsBotRight)"/>
                <polygon points="23,34 14,43 21,50 30,41 32,32" fill="url(#rsBotLeft)"/>
                <polygon points="32,24 21,14 32,32" fill="#5eead4" opacity="0.35"/>
                <polygon points="43,14 50,21 32,32" fill="#93c5fd" opacity="0.4"/>
                <polygon points="50,43 43,50 32,32" fill="#c084fc" opacity="0.35"/>
                <polygon points="14,43 21,50 32,32" fill="#818cf8" opacity="0.35"/>
                <polygon points="40,17 48,25 45,28 37,20" fill="#ffffff" opacity="0.85"/>
                <polygon points="34,24 41,17 43,19 36,26" fill="#ffffff" opacity="0.5"/>
                <line x1="20" y1="8" x2="8" y2="20" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.95"/>
                <line x1="44" y1="56" x2="56" y2="44" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
                <polygon points="32,24 40,32 32,40 24,32" fill="#09090b" stroke="#09090b" stroke-width="1.5"/>
                <polygon points="32,25 25,32 28,32 32,28" fill="#1e1b4b"/>
                <polygon points="25,32 32,39 32,36 28,32" fill="#172554"/>
                <polygon points="32,25 39,32 36,32 32,28" fill="#1e293b"/>
                <polygon points="39,32 32,39 32,36 36,32" fill="#0f172a"/>
                <polygon points="32,27 37,32 32,37 27,32" fill="#020617"/>
            </svg>
        `;
    },

    getMeteorArtwork(size = 56) {
        const key = `meteor_artwork_${size}`;
        if (this.cache[key]) return this.cache[key];

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
                <defs>
                    <radialGradient id="meteorFire" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#ffffff"/>
                        <stop offset="25%" stop-color="#fef08a"/>
                        <stop offset="55%" stop-color="#f97316"/>
                        <stop offset="85%" stop-color="#dc2626"/>
                        <stop offset="100%" stop-color="rgba(153, 27, 27, 0)"/>
                    </radialGradient>
                    <linearGradient id="meteorTrail" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fbbf24"/>
                        <stop offset="40%" stop-color="#ea580c"/>
                        <stop offset="80%" stop-color="#7f1d1d"/>
                        <stop offset="100%" stop-color="transparent"/>
                    </linearGradient>
                    <radialGradient id="rockCore" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#44403c"/>
                        <stop offset="60%" stop-color="#1c1917"/>
                        <stop offset="100%" stop-color="#0c0a09"/>
                    </radialGradient>
                </defs>
                <circle cx="38" cy="38" r="24" fill="url(#meteorFire)" opacity="0.9"/>
                <path d="M48 48 L10 10 M44 54 L6 16 M54 44 L16 6 M40 58 L2 20 M58 40 L20 2" stroke="url(#meteorTrail)" stroke-width="3.5" stroke-linecap="round" opacity="0.8"/>
                <path d="M46 46 L14 14 M42 50 L10 18 M50 42 L18 10" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
                <polygon points="26,42 32,54 46,58 58,46 54,32 42,26 30,30" fill="url(#rockCore)" stroke="#f97316" stroke-width="2" stroke-linejoin="round"/>
                <path d="M30 36 L38 42 L48 38 M38 42 L42 52 M34 48 L44 48" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
                <path d="M33 37 L39 43 L47 39" stroke="#facc15" stroke-width="1" stroke-linecap="round"/>
                <circle cx="48" cy="48" r="4" fill="#ffffff" opacity="0.95"/>
                <circle cx="36" cy="36" r="2.5" fill="#fef08a" opacity="0.9"/>
                <circle cx="52" cy="38" r="2" fill="#f97316"/>
                <circle cx="16" cy="12" r="1.5" fill="#facc15"/>
                <circle cx="10" cy="22" r="2" fill="#f97316"/>
                <circle cx="22" cy="8" r="1.5" fill="#ef4444"/>
            </svg>
        `;
        const res = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
        this.cache[key] = res;
        return res;
    }
};

if (typeof window !== 'undefined') {
    window.PixelSprites = PixelSprites;
}