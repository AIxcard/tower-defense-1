// Pixel Tower Defense — Gold Shop & Challenge Rewards Configuration
// Strict 7:00 AM Bangkok reset, 30-min challenge cycles, balanced prices and limits

const SHOP_CONFIG = {
    // ----------------------------------------------------
    // CATEGORY 1: FOOD (Used exclusively for Unit EXP)
    // ----------------------------------------------------
    food: [
        {
            id: "rice_ball",
            name: "Rice Ball",
            exp: 250,
            goldPrice: 80,
            icon: "🍙",
            description: "A simple snack that grants 250 EXP to a unit."
        },
        {
            id: "bento_box",
            name: "Bento Box",
            exp: 1000,
            goldPrice: 280,
            icon: "🍱",
            description: "Nutritious meal that grants 1,000 EXP to a unit."
        },
        {
            id: "roast_meat",
            name: "Roast Beast Feast",
            exp: 800,
            goldPrice: 1000,
            icon: "🍖",
            description: "Hearty cooked roast that grants 800 EXP to a unit."
        },
        {
            id: "dragon_ramen",
            name: "Dragon Fire Ramen",
            exp: 3000,
            goldPrice: 3500,
            icon: "🍜",
            description: "Legendary gourmet ramen that grants 3,000 EXP to a unit."
        }
    ],

    // ----------------------------------------------------
    // CATEGORY 2: MATERIALS (Star Fruits for Evolution/Ascension)
    // Max 3 daily purchase limit per Star Fruit type
    // Price order: Normal (cheapest) -> Colored (middle) -> Rainbow (most expensive)
    // ----------------------------------------------------
    materials: [
        {
            id: "normal_star_fruit",
            name: "Normal Star Fruit",
            goldPrice: 200,          // Cheapest
            dailyLimit: 3,
            color: "#facc15",
            icon: "⭐",
            description: "Fundamental evolution fruit."
        },
        {
            id: "pink_star_fruit",
            name: "Pink Star Fruit",
            goldPrice: 650,          // Middle
            dailyLimit: 3,
            color: "#ec4899",
            icon: "🌸",
            description: "Attuned to vitality and speed."
        },
        {
            id: "red_star_fruit",
            name: "Red Star Fruit",
            goldPrice: 650,
            dailyLimit: 3,
            color: "#ef4444",
            icon: "🔥",
            description: "Attuned to fury and fire."
        },
        {
            id: "green_star_fruit",
            name: "Green Star Fruit",
            goldPrice: 650,
            dailyLimit: 3,
            color: "#22c55e",
            icon: "🍃",
            description: "Attuned to nature and life."
        },
        {
            id: "blue_star_fruit",
            name: "Blue Star Fruit",
            goldPrice: 650,
            dailyLimit: 3,
            color: "#3b82f6",
            icon: "💧",
            description: "Attuned to water and ice."
        },
        {
            id: "yellow_star_fruit",
            name: "Yellow Star Fruit",
            goldPrice: 650,
            dailyLimit: 3,
            color: "#eab308",
            icon: "⚡",
            description: "Attuned to lightning and holy light."
        },
        {
            id: "rainbow_star_fruit",
            name: "Rainbow Star Fruit",
            goldPrice: 2800,         // Most expensive
            dailyLimit: 3,
            color: "#a855f7",
            icon: "🌈",
            description: "Ultra-rare pristine fruit attuned to all cosmic elements."
        }
    ],

    // ----------------------------------------------------
    // CATEGORY 3: GAME PASSES
    // Exactly ONE Game Pass: VIP
    // Price: 50,000 Gold. 0.5% chance to appear in daily stock.
    // ----------------------------------------------------
    gamePasses: [
        {
            id: "vip_pass",
            name: "VIP Pass",
            goldPrice: 50000,
            restockProbability: 0.005, // 0.5% chance to appear during daily restock
            icon: "👑",
            benefits: [
                "20% reduced summon Gem cost on all banners",
                "+25% player account EXP gain (levels up account faster)"
            ],
            description: "Exclusive lifetime VIP privilege. Restocks with a 0.5% daily chance."
        }
    ]
};

if (typeof window !== 'undefined') {
    window.SHOP_CONFIG = SHOP_CONFIG;
}
