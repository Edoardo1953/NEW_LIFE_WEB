/**
 * NEW LIFE Sàrl - Dashboard / Vue d'ensemble Logic
 */

let cashflowChartInstance = null;
let expenseChartInstance = null;

function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return "0,00\u00A0€";
    const val = Number(num);
    const parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",") + "\u00A0€";
}

function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    const val = Number(num);
    const parts = val.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimals > 0 ? parts.join(",") : parts[0];
}

function initDashboard() {
    if (!window.NEW_LIFE_DATA || !window.NEW_LIFE_DATA.records) {
        console.warn("Données NEW_LIFE non trouvées.");
        return;
    }

    const data = window.NEW_LIFE_DATA;
    const records = data.records;
    const amort = window.NEW_LIFE_AMORT || { assets: [], totals_by_year: {} };

    // Update last update timestamp
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl) {
        updatedEl.textContent = (typeof getAppLastUpdate === 'function') ? getAppLastUpdate() : (data.company?.updated_at || '--/--/----');
    }

    // Populate Year Select Filter
    const yearSelect = document.getElementById('dash-year-select');
    if (yearSelect && data.stats.years) {
        // Clear existing except first
        while (yearSelect.options.length > 1) {
            yearSelect.remove(1);
        }
        data.stats.years.slice().reverse().forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `Année ${y}`;
            yearSelect.appendChild(opt);
        });

        yearSelect.addEventListener('change', () => {
            renderDashboardData(yearSelect.value);
        });
    }

    renderDashboardData("ALL");
}

function renderDashboardData(selectedYear) {
    const data = window.NEW_LIFE_DATA;
    const records = data.records;
    const amort = window.NEW_LIFE_AMORT || { assets: [], totals_by_year: {} };

    const deletedBankIds = new Set(JSON.parse(localStorage.getItem('new_life_deleted_records') || '[]'));
    const validRecords = records.filter(r => {
        if (deletedBankIds.has(r.id)) return false;
        if (!r.an || r.an === 0 || !r.date || !/^\d{4}/.test(r.date)) return false;
        return true;
    });

    const isAll = (selectedYear === "ALL" || !selectedYear);
    const filtered = isAll ? validRecords : validRecords.filter(r => r.an == selectedYear);

    // Calculate Inflows, Outflows, Net
    let totalIn = 0;
    let totalOut = 0;
    let lastProgressiveBalance = 0;

    filtered.forEach(r => {
        if (r.code_op === 'SALDO' && !isAll) return;
        if (r.is_transfert) return; // Exclude internal transfers between bank accounts

        if (!r.is_storno) {
            if (r.total >= 0) {
                totalIn += r.total;
            } else {
                totalOut += Math.abs(r.total);
            }
        }
        if (r.progressivo_banca !== 0) {
            lastProgressiveBalance = r.progressivo_banca;
        }
    });

    const netResult = totalIn - totalOut;

    // Actual latest balance from all valid records if isAll
    let displayBalance = lastProgressiveBalance;
    if (isAll && validRecords.length > 0) {
        for (let i = validRecords.length - 1; i >= 0; i--) {
            if (validRecords[i].progressivo_banca !== 0) {
                displayBalance = validRecords[i].progressivo_banca;
                break;
            }
        }
    }

    // VNC Amortissements calculation
    let currentVNC = 0;
    const currentYearNum = isAll ? 2025 : parseInt(selectedYear);
    if (amort.totals_by_year && amort.totals_by_year[currentYearNum]) {
        currentVNC = amort.totals_by_year[currentYearNum].vnc;
    } else if (amort.assets) {
        amort.assets.forEach(ast => {
            const sched = ast.schedule.find(s => s.year === currentYearNum);
            if (sched) currentVNC += sched.vnc;
        });
    }

    // Update DOM KPIs
    const balEl = document.getElementById('kpi-balance');
    if (balEl) balEl.textContent = formatCurrency(displayBalance);
    const inEl = document.getElementById('kpi-inflows');
    if (inEl) inEl.textContent = formatCurrency(totalIn);
    const outEl = document.getElementById('kpi-outflows');
    if (outEl) outEl.textContent = formatCurrency(totalOut);
    
    const netEl = document.getElementById('kpi-net');
    if (netEl) {
        netEl.textContent = formatCurrency(netResult);
        if (netResult >= 0) {
            netEl.className = "kpi-value text-emerald";
        } else {
            netEl.className = "kpi-value text-rose";
        }
    }

    const vncEl = document.getElementById('kpi-vnc');
    if (vncEl) vncEl.textContent = formatCurrency(currentVNC);

    // Count documents
    const savedDocs = JSON.parse(localStorage.getItem('new_life_docs') || 'null');
    const docsCount = savedDocs ? savedDocs.length : 1;
    const docsEl = document.getElementById('kpi-docs');
    if (docsEl) docsEl.textContent = formatNumber(docsCount);

    // Render Charts if elements exist
    renderCashflowChart(filtered, isAll);
    renderExpenseChart(filtered);
}

function renderCashflowChart(filteredRecords, isAll) {
    const ctx = document.getElementById('cashflowChart');
    if (!ctx) return;

    if (cashflowChartInstance) {
        cashflowChartInstance.destroy();
    }

    // Group by Month or Year
    const labels = [];
    const inData = [];
    const outData = [];

    if (isAll) {
        // Group by Year
        const yearMap = {};
        filteredRecords.forEach(r => {
            if (r.code_op === 'SALDO' || r.is_storno || r.is_transfert) return;
            const yr = r.an || 2024;
            if (!yearMap[yr]) yearMap[yr] = { in: 0, out: 0 };
            if (r.total >= 0) {
                yearMap[yr].in += r.total;
            } else {
                yearMap[yr].out += Math.abs(r.total);
            }
        });

        const sortedYears = Object.keys(yearMap).sort();
        sortedYears.forEach(y => {
            labels.push(y);
            inData.push(yearMap[y].in);
            outData.push(yearMap[y].out);
        });
    } else {
        // Group by Months 1-12
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthMap = {};
        for (let m = 1; m <= 12; m++) monthMap[m] = { in: 0, out: 0 };

        filteredRecords.forEach(r => {
            if (r.code_op === 'SALDO' || r.is_storno || r.is_transfert) return;
            const m = r.month || 1;
            if (monthMap[m]) {
                if (r.total >= 0) {
                    monthMap[m].in += r.total;
                } else {
                    monthMap[m].out += Math.abs(r.total);
                }
            }
        });

        for (let m = 1; m <= 12; m++) {
            labels.push(monthNames[m - 1]);
            inData.push(monthMap[m].in);
            outData.push(monthMap[m].out);
        }
    }

    const isLight = document.body.classList.contains('theme-light');
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';

    cashflowChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entrées (€)',
                    data: inData,
                    backgroundColor: 'rgba(16, 185, 129, 0.75)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Sorties (€)',
                    data: outData,
                    backgroundColor: 'rgba(244, 63, 94, 0.75)',
                    borderColor: '#f43f5e',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: textColor, font: { weight: '600' } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const val = context.parsed.y || 0;
                            return `${label}: ${formatCurrency(val)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        callback: function(value) { return formatCurrency(value); }
                    }
                }
            }
        }
    });
}

function renderExpenseChart(filteredRecords) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    const categoryMap = {};
    filteredRecords.forEach(r => {
        if (r.total < 0 && r.code_op !== 'SALDO' && !r.is_storno && !r.is_transfert && r.sp_ce !== 'SP') {
            const cat = r.macro || r.class || "Autres Charges";
            const val = Math.abs(r.total);
            categoryMap[cat] = (categoryMap[cat] || 0) + val;
        }
    });

    const sortedCats = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const labels = sortedCats.map(c => c[0].length > 25 ? c[0].substring(0, 25) + '...' : c[0]);
    const dataVals = sortedCats.map(c => c[1]);

    const colors = [
        '#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'
    ];

    const isLight = document.body.classList.contains('theme-light');
    const textColor = isLight ? '#475569' : '#94a3b8';

    expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataVals,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const val = context.raw || 0;
                            return `${label}: ${formatCurrency(val)}`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// -------------------------------------------------------------
// Fiche Sociétaire & Données Officielles (Éditable & Persistante)
// -------------------------------------------------------------

const DEFAULT_CORPORATE_PROFILE = {
    company_name: "NEW LIFE Sàrl",
    legal_form: "Société à responsabilité limitée (Sàrl)",
    share_capital: "31.000 € (interamente versato e liberato)",
    rcs_number: "B 225.643",
    matricule: "2018 2432 026",
    tva_number: "TVA 11773678",
    incorporation_date: "01/12/2018",
    registered_office: "Luxembourg (Grand-Duché)",
    nationality: "Luxembourgeoise (UE)",
    gerant: "Edoardo Tubia",
    powers: "Signature Individuelle",
    ubo_name: "Edoardo Tubia",
    ubo_percentage: 100,
    ubo_nationality: "Italienne (Résident Lux)",
    rbe_status: "Déposée & Validée LBR (10/2025)",
    pep_status: "Non PEP",
    activity_primary: "Conseil & Mandats Corporate",
    nace_code: "70.220 (Conseil pour les affaires et la gestion)",
    mandates_count: "14 Sociétés & Fonds Régulés",
    currency: "EUR (€)",
    fiscal_period: "01/01 - 31/12",
    services_nature: "Administrateur Indépendant & Advisory",
    aml_authority: "AED Luxembourg",
    legal_framework: "Loi du 12 Nov. 2004",
    last_bilan: "Exercice 2025 RCSL déposé",
    primary_bank: "POST Luxembourg (WebBanking Pro)",
    accounting_standard: "PCN Luxembourg",
    cssf_supervision: "Non-assujettie (Régime AED)"
};

function getCorporateProfile() {
    try {
        const raw = localStorage.getItem('new_life_corporate_profile');
        if (raw) {
            return { ...DEFAULT_CORPORATE_PROFILE, ...JSON.parse(raw) };
        }
    } catch (e) {
        console.error('Error loading corporate profile:', e);
    }
    return { ...DEFAULT_CORPORATE_PROFILE };
}

function saveCorporateProfile(data) {
    try {
        localStorage.setItem('new_life_corporate_profile', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving corporate profile:', e);
    }
}

function resetCorporateProfile() {
    const confirmMsg = (typeof currentLang !== 'undefined' && currentLang === 'it')
        ? "Ripristinare tutti i dati societari ai valori predefiniti?"
        : "Voulez-vous restaurer les données sociétaires aux valeurs par défaut ?";
    if (confirm(confirmMsg)) {
        localStorage.removeItem('new_life_corporate_profile');
        renderCorporateProfile();
    }
}

function renderCorporateProfile() {
    const container = document.getElementById('corporate-profile-card-content');
    if (!container) return;

    const p = getCorporateProfile();

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            
            <!-- 1. Identité & Immatriculation -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.15rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem; color: var(--accent-emerald); font-weight: 700; font-size: 0.95rem;">
                    <i class="fa-solid fa-id-card"></i>
                    <span data-i18n="corp_identity_title">${t('corp_identity_title')}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_denomination')} :</span>
                        <strong style="color: var(--text-main);">${p.company_name}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_legal_form')} :</span>
                        <strong>${p.legal_form}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_capital')} :</span>
                        <strong style="color: var(--accent-emerald);">${p.share_capital || '31.000 € (interamente versato e liberato)'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_rcs')} :</span>
                        <strong style="color: var(--accent-blue);">${p.rcs_number}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_matricule')} :</span>
                        <strong style="color: var(--accent-purple);">${p.matricule}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_tva')} :</span>
                        <strong style="color: #f59e0b;">${p.tva_number || 'TVA 11773678'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_constitution')} :</span>
                        <strong>${p.incorporation_date}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_office')} :</span>
                        <strong>${p.registered_office}</strong>
                    </div>
                </div>
            </div>

            <!-- 2. Gouvernance & Actionnariat -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.15rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem; color: var(--accent-blue); font-weight: 700; font-size: 0.95rem;">
                    <i class="fa-solid fa-user-tie"></i>
                    <span data-i18n="corp_gov_title">${t('corp_gov_title')}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_gerant')} :</span>
                        <strong style="color: var(--text-main);">${p.gerant}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_powers')} :</span>
                        <strong>${p.powers}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_ubo_name')} :</span>
                        <strong style="color: var(--accent-emerald);">${p.ubo_name} (${p.ubo_percentage}%)</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_rbe_status')} :</span>
                        <span class="text-emerald" style="font-weight: 600;"><i class="fa-solid fa-check-double"></i> ${p.rbe_status}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_pep_status')} :</span>
                        <strong class="text-emerald">${p.pep_status}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_ubo_nat')} :</span>
                        <strong>${p.ubo_nationality}</strong>
                    </div>
                </div>
            </div>

            <!-- 3. Objet Social & Activité -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.15rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem; color: var(--accent-amber); font-weight: 700; font-size: 0.95rem;">
                    <i class="fa-solid fa-briefcase"></i>
                    <span data-i18n="corp_activity_title">${t('corp_activity_title')}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_activity')} :</span>
                        <strong style="color: var(--text-main);">${p.activity_primary}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_nace')} :</span>
                        <strong>${p.nace_code}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_mandates')} :</span>
                        <strong style="color: var(--accent-blue);">${p.mandates_count}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_currency')} :</span>
                        <strong>${p.currency}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_fiscal_period')} :</span>
                        <strong>${p.fiscal_period}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_services')} :</span>
                        <strong>${p.services_nature}</strong>
                    </div>
                </div>
            </div>

            <!-- 4. Conformité, Fiscalité & Banque -->
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.15rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem; color: #a855f7; font-weight: 700; font-size: 0.95rem;">
                    <i class="fa-solid fa-scale-balanced"></i>
                    <span data-i18n="corp_compliance_title">${t('corp_compliance_title')}</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_aml_auth')} :</span>
                        <strong style="color: var(--accent-emerald);">${p.aml_authority}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_framework')} :</span>
                        <strong>${p.legal_framework}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_last_bilan')} :</span>
                        <strong style="color: var(--accent-emerald);"><i class="fa-solid fa-file-circle-check"></i> ${p.last_bilan}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_bank')} :</span>
                        <strong>${p.primary_bank}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 0.35rem;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_accounting_std')} :</span>
                        <strong>${p.accounting_standard}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-muted);">${t('corp_lbl_cssf')} :</span>
                        <span style="color: var(--text-muted);">${p.cssf_supervision}</span>
                    </div>
                </div>
            </div>

        </div>
    `;
}

function openCorporateProfileModal() {
    const modal = document.getElementById('corporate-profile-modal');
    if (!modal) return;

    const p = getCorporateProfile();

    document.getElementById('edit-corp-company-name').value = p.company_name || '';
    document.getElementById('edit-corp-legal-form').value = p.legal_form || '';
    document.getElementById('edit-corp-share-capital').value = p.share_capital || '31.000 € (interamente versato e liberato)';
    document.getElementById('edit-corp-rcs').value = p.rcs_number || '';
    document.getElementById('edit-corp-matricule').value = p.matricule || '';
    document.getElementById('edit-corp-tva').value = p.tva_number || 'TVA 11773678';
    document.getElementById('edit-corp-inc-date').value = p.incorporation_date || '';
    document.getElementById('edit-corp-office').value = p.registered_office || '';
    document.getElementById('edit-corp-nationality').value = p.nationality || '';

    document.getElementById('edit-corp-gerant').value = p.gerant || '';
    document.getElementById('edit-corp-powers').value = p.powers || '';
    document.getElementById('edit-corp-ubo-name').value = p.ubo_name || '';
    document.getElementById('edit-corp-ubo-pct').value = p.ubo_percentage || 100;
    document.getElementById('edit-corp-ubo-nat').value = p.ubo_nationality || '';
    document.getElementById('edit-corp-rbe-status').value = p.rbe_status || '';
    document.getElementById('edit-corp-pep-status').value = p.pep_status || 'Non PEP';

    document.getElementById('edit-corp-activity').value = p.activity_primary || '';
    document.getElementById('edit-corp-nace').value = p.nace_code || '';
    document.getElementById('edit-corp-mandates').value = p.mandates_count || '';
    document.getElementById('edit-corp-currency').value = p.currency || 'EUR (€)';
    document.getElementById('edit-corp-fiscal-period').value = p.fiscal_period || '01/01 - 31/12';
    document.getElementById('edit-corp-services').value = p.services_nature || '';

    document.getElementById('edit-corp-aml-authority').value = p.aml_authority || '';
    document.getElementById('edit-corp-legal-framework').value = p.legal_framework || '';
    document.getElementById('edit-corp-last-bilan').value = p.last_bilan || '';
    document.getElementById('edit-corp-primary-bank').value = p.primary_bank || '';
    document.getElementById('edit-corp-accounting-std').value = p.accounting_standard || '';
    document.getElementById('edit-corp-cssf-supervision').value = p.cssf_supervision || '';

    modal.classList.add('active');
}

function closeCorporateProfileModal() {
    const modal = document.getElementById('corporate-profile-modal');
    if (modal) modal.classList.remove('active');
}

function saveCorporateProfileFromModal() {
    const updated = {
        company_name: document.getElementById('edit-corp-company-name').value.trim() || DEFAULT_CORPORATE_PROFILE.company_name,
        legal_form: document.getElementById('edit-corp-legal-form').value.trim() || DEFAULT_CORPORATE_PROFILE.legal_form,
        share_capital: document.getElementById('edit-corp-share-capital').value.trim() || DEFAULT_CORPORATE_PROFILE.share_capital,
        rcs_number: document.getElementById('edit-corp-rcs').value.trim() || DEFAULT_CORPORATE_PROFILE.rcs_number,
        matricule: document.getElementById('edit-corp-matricule').value.trim() || DEFAULT_CORPORATE_PROFILE.matricule,
        tva_number: document.getElementById('edit-corp-tva').value.trim() || DEFAULT_CORPORATE_PROFILE.tva_number,
        incorporation_date: document.getElementById('edit-corp-inc-date').value.trim() || DEFAULT_CORPORATE_PROFILE.incorporation_date,
        registered_office: document.getElementById('edit-corp-office').value.trim() || DEFAULT_CORPORATE_PROFILE.registered_office,
        nationality: document.getElementById('edit-corp-nationality').value.trim() || DEFAULT_CORPORATE_PROFILE.nationality,

        gerant: document.getElementById('edit-corp-gerant').value.trim() || DEFAULT_CORPORATE_PROFILE.gerant,
        powers: document.getElementById('edit-corp-powers').value.trim() || DEFAULT_CORPORATE_PROFILE.powers,
        ubo_name: document.getElementById('edit-corp-ubo-name').value.trim() || DEFAULT_CORPORATE_PROFILE.ubo_name,
        ubo_percentage: parseFloat(document.getElementById('edit-corp-ubo-pct').value) || 100,
        ubo_nationality: document.getElementById('edit-corp-ubo-nat').value.trim() || DEFAULT_CORPORATE_PROFILE.ubo_nationality,
        rbe_status: document.getElementById('edit-corp-rbe-status').value.trim() || DEFAULT_CORPORATE_PROFILE.rbe_status,
        pep_status: document.getElementById('edit-corp-pep-status').value.trim() || DEFAULT_CORPORATE_PROFILE.pep_status,

        activity_primary: document.getElementById('edit-corp-activity').value.trim() || DEFAULT_CORPORATE_PROFILE.activity_primary,
        nace_code: document.getElementById('edit-corp-nace').value.trim() || DEFAULT_CORPORATE_PROFILE.nace_code,
        mandates_count: document.getElementById('edit-corp-mandates').value.trim() || DEFAULT_CORPORATE_PROFILE.mandates_count,
        currency: document.getElementById('edit-corp-currency').value.trim() || DEFAULT_CORPORATE_PROFILE.currency,
        fiscal_period: document.getElementById('edit-corp-fiscal-period').value.trim() || DEFAULT_CORPORATE_PROFILE.fiscal_period,
        services_nature: document.getElementById('edit-corp-services').value.trim() || DEFAULT_CORPORATE_PROFILE.services_nature,

        aml_authority: document.getElementById('edit-corp-aml-authority').value.trim() || DEFAULT_CORPORATE_PROFILE.aml_authority,
        legal_framework: document.getElementById('edit-corp-legal-framework').value.trim() || DEFAULT_CORPORATE_PROFILE.legal_framework,
        last_bilan: document.getElementById('edit-corp-last-bilan').value.trim() || DEFAULT_CORPORATE_PROFILE.last_bilan,
        primary_bank: document.getElementById('edit-corp-primary-bank').value.trim() || DEFAULT_CORPORATE_PROFILE.primary_bank,
        accounting_standard: document.getElementById('edit-corp-accounting-std').value.trim() || DEFAULT_CORPORATE_PROFILE.accounting_standard,
        cssf_supervision: document.getElementById('edit-corp-cssf-supervision').value.trim() || DEFAULT_CORPORATE_PROFILE.cssf_supervision
    };

    saveCorporateProfile(updated);
    renderCorporateProfile();
    closeCorporateProfileModal();

    const successMsg = (typeof t === 'function') ? t('corp_saved_success') : "Fiche sociétaire mise à jour avec succès !";
    if (typeof showGlobalToast === 'function') {
        showGlobalToast(successMsg, 'fa-circle-check');
    } else {
        alert(successMsg);
    }
}

// Hook language change
window.onLanguageChange = function() {
    const yearSelect = document.getElementById('dash-year-select');
    if (yearSelect) {
        renderDashboardData(yearSelect.value);
    }
    renderCorporateProfile();
};

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    renderCorporateProfile();
});

