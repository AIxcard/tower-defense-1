with open('pixel_tower_defense/js/ui/uiController.js', 'r', encoding='utf-8') as f:
    text = f.read()

start_idx = text.find('renderTraitTemple() {')
if start_idx != -1:
    # backtrack to include leading indentation '    '
    while start_idx > 0 and text[start_idx-1] == ' ':
        start_idx -= 1

end_idx = text.find('// ----------------------------------------------------\n    // GEM SHOP VIEW')
if end_idx == -1:
    end_idx = text.find('// ----------------------------------------------------\n    // GOLD SHOP VIEW')

print('Replacing from', start_idx, 'to', end_idx)

new_block = '''    handleTraitUnitSearch(val) {
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

                            <!-- Warning Protection Filters Panel (Mythic default ON, Legendary) -->
                            <div style="background:#0f172a;border:1px solid #475569;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;">
                                <div style="font-weight:800;color:#facc15;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
                                    🛡️ <span>Trait Protection Filters (Warns Before Reroll)</span>
                                </div>
                                <div style="display:flex;gap:14px;flex-wrap:wrap;color:#e2e8f0;">
                                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                                        <input type="checkbox" ${protectMythic ? 'checked' : ''} onchange="UIController.toggleTraitFilter('protectMythic', this.checked)">
                                        <span class="mythic-rainbow-name" style="font-weight:800;">Protect Mythics</span>
                                    </label>
                                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                                        <input type="checkbox" ${protectLegendary ? 'checked' : ''} onchange="UIController.toggleTraitFilter('protectLegendary', this.checked)">
                                        <span style="color:#eab308;font-weight:800;">Protect Legendaries</span>
                                    </label>
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

        container.innerHTML = html;

        // Render Trait Chances Table (Sorted by chance descending: easiest at top, hardest at bottom)
        const probTable = document.getElementById("trait-probability-table");
        if (probTable && window.TRAIT_CONFIG) {
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
        if (tConf) {
            if (tConf.rarity === "Mythic" && protectMythic) isProtected = true;
            if (tConf.rarity === "Legendary" && protectLegendary) isProtected = true;
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
            alert(res.message);
            return;
        }

        if (window.AudioService) window.AudioService.playUpgradeSound();
        this.updateTopBar();
        this.renderTraitTemple();

        if (res.newTrait === "Unique") {
            this.openUniqueAwakeningModal();
        } else {
            alert(`Congratulations! Obtained Trait: ${res.newTrait}\\n${res.traitDetails.description}`);
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
        alert("All settings and trait filters have been reset to default values!");
    },\n\n'''

updated_text = text[:start_idx] + new_block + text[end_idx:]
with open('pixel_tower_defense/js/ui/uiController.js', 'w', encoding='utf-8') as f:
    f.write(updated_text)

print("Pass 2 successfully written! Total chars:", len(updated_text))
