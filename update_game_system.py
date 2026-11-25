import re

# 1. Update wikiController.js
with open('pixel_tower_defense/js/ui/wikiController.js', 'r', encoding='utf-8') as f:
    wiki_code = f.read()

# Replace Chrono Astral Watch with Star Staff in Wiki
old_wiki_catalyst = """                        <div style="background:#1e293b;border:1px solid #475569;border-radius:8px;padding:12px;">
                            <div style="font-weight:900;color:#facc15;font-size:15px;">🕰️ Chrono Astral Watch</div>
                            <div style="font-size:11.5px;color:#94a3b8;margin-top:2px;">Celestial Catalyst for high-tier evolutions!</div>
                            <div style="margin-top:6px;font-size:12px;color:#facc15;"><b>Recipe:</b> 1x Rainbow + 2x Yellow + 2x Blue Star Fruits</div>
                        </div>"""

new_wiki_catalyst = """                        <div style="background:#1e293b;border:1px solid #475569;border-radius:8px;padding:12px;">
                            <div style="font-weight:900;color:#facc15;font-size:15px;">✨ Star Staff</div>
                            <div style="font-size:11.5px;color:#94a3b8;margin-top:2px;">Secret Evolution Catalyst for Star Mage!</div>
                            <div style="margin-top:6px;font-size:12px;color:#facc15;"><b>Recipe:</b> 2x Rainbow + 5x Pink + 5x Blue + 5x Yellow Star Fruits</div>
                        </div>"""

if old_wiki_catalyst in wiki_code:
    wiki_code = wiki_code.replace(old_wiki_catalyst, new_wiki_catalyst)

# Replace Chrono Pocket Watch with Mangekyou Sharingan in Wiki Relics
old_wiki_relic = """                        <div style="background:#1e293b;border:1px solid #eab308;border-radius:8px;padding:10px;">
                            <div style="font-weight:800;color:#facc15;">⏳ Chrono Pocket Watch (5 Shards)</div>
                            <div style="font-size:12px;color:#4ade80;">+10% Attack Speed to all units in battle</div>
                        </div>"""

new_wiki_relic = """                        <div style="background:#1e293b;border:1px solid #eab308;border-radius:8px;padding:10px;">
                            <div style="font-weight:800;color:#facc15;">👁️ Mangekyou Sharingan (10 Shards)</div>
                            <div style="font-size:12px;color:#4ade80;">2x Burn Duration & Piercing Attack Damage</div>
                        </div>"""

if old_wiki_relic in wiki_code:
    wiki_code = wiki_code.replace(old_wiki_relic, new_wiki_relic)

with open('pixel_tower_defense/js/ui/wikiController.js', 'w', encoding='utf-8') as f:
    f.write(wiki_code)
print("Updated wikiController.js successfully!")
