import re

# ---------------------------------------------------------
# UPDATE AIChatbot.js
# ---------------------------------------------------------
with open('pixel_tower_defense/js/engine/aiChatbot.js', 'r', encoding='utf-8') as f:
    chat_code = f.read()

# Replace Chrono Astral Watch with Star Staff
chat_code = re.sub(
    r'• \*\*Chrono Astral Watch\*\*:[^\n]+',
    '• **Star Staff**: 2 Rainbow, 5 Pink, 5 Blue, 5 Yellow Star Fruits (Secret evolution catalyst for Star Mage!)',
    chat_code
)

# Replace Chrono Pocket Watch with Mangekyou Sharingan
chat_code = re.sub(
    r'• \*\*Chrono Pocket Watch\*\*[^\n]+',
    '• **Mangekyou Sharingan** (10 Shards): 2x Burn Duration & Piercing Damage',
    chat_code
)

# Update legend stage description
new_legend_desc = """            keywords: ["legend", "legend stage", "light energy", "blaze", "dagger", "scrolls", "fire scroll", "water scroll", "nature scroll", "legend acts"],
            response: "Legend Stages are special high-difficulty challenges in the PLAY menu with **100% Guaranteed Material Drops**!\\n\\n" +
                      "**World 2 (Hills) Legend Stages:**\\n" +
                      "• **Hills Act 1**: 100% drops **1-3 Light Energy** ✨\\n" +
                      "• **Hills Act 2**: 100% drops **1-3 Blazes** 🔥\\n" +
                      "• **Hills Act 3**: 100% drops **1-3 Daggers** 🗡️ + 10% chance for **💠 Relic Shard**!\\n\\n" +
                      "**World 3 (Mountains) Legend Stages:**\\n" +
                      "• **Mountain Act 1**: 100% drops **5-10 Fire Scrolls** 📜\\n" +
                      "• **Mountain Act 2**: 100% drops **5-10 Water Scrolls** 📜\\n" +
                      "• **Mountain Act 3**: 100% drops **5-10 Nature Scrolls** 📜\\n\\n" +
                      "*(Note: World 1 Plains has NO legend stages).*",
            links: [
                { label: "👉 Play Legend Stages", tab: "battle" }
            ]"""

chat_code = re.sub(
    r'keywords:\s*\["legend",\s*"legend stage"[^\]]*\],[\s\S]*?links:\s*\[\s*\{\s*label:\s*"👉 Play Legend Stages"[^\}]*\}\s*\]',
    new_legend_desc,
    chat_code
)

# Update evolutions section in chatbot
new_evo_desc = """            keywords: ["evolve", "evolution", "awakening", "awaken", "catalyst", "star staff", "holy knight", "thunder god", "wind master", "flame emperor"],
            response: "Units can be evolved into their supreme awakened forms at the **Evolution Altar**!\\n\\n" +
                      "• **Holy Knight (Awakened):** Requires 12 Light Energy + 10,000 Gold.\\n" +
                      "• **Flame Emperor (Awakened):** Requires 12 Blazes + 10,000 Gold.\\n" +
                      "• **Thunder God (Awakened):** Requires 10 Thunder Essence + 10,000 Gold.\\n" +
                      "• **Wind Master (Awakened):** Requires 10 Nature Essence + 10,000 Gold.\\n" +
                      "• **Shadow Assassin (Awakened):** Requires 1x Abyssal Shadow Dagger + 10,000 Gold.\\n" +
                      "• **Shinobi (God):** Requires 1x Red Eyes Relic + 10,000 Gold.\\n" +
                      "• **Star Mage (Explosion):** Requires 1x Star Staff + 15,000 Gold.\\n\\n" +
                      "*(Thunder & Nature Essence drop in Infinite Mode with a 5% chance per wave).*",
            links: [
                { label: "👉 Evolution Altar", tab: "evolution" },
                { label: "👉 Craft Catalysts", tab: "crafting" }
            ]"""

chat_code = re.sub(
    r'keywords:\s*\["evolve",\s*"evolution"[^\]]*\],[\s\S]*?links:\s*\[\s*\{\s*label:\s*"👉 Evolution Altar"[^\}]*\}\s*\]',
    new_evo_desc,
    chat_code
)

# Update Star Mage obtainment in chatbot
chat_code = chat_code.replace("Cosmic Clock", "Star Staff")
chat_code = chat_code.replace("Genesis", "Release Event")
chat_code = chat_code.replace("0.75% from Release Event Stage (Cost: 1,750 ¥, 2 Placements)", "Obtainable ONLY from Release Event (0.75% Drop Rate, 20 Waves) - Not available in summon banners!")

# Update greeting
chat_code = chat_code.replace("Pixel Tower Defense AI Guide", "TD AI Guide")

with open('pixel_tower_defense/js/engine/aiChatbot.js', 'w', encoding='utf-8') as f:
    f.write(chat_code)
print("Updated aiChatbot.js successfully!")
