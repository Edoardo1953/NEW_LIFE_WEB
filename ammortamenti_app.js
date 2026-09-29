/**
 * NEW LIFE Sàrl - Amortissements & Immobilisations Logic
 */

function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return "0,00 €";
    const val = Number(num);
    const parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",") + " €";
}

function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    const val = Number(num);
    const parts = val.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimals > 0 ? parts.join(",") : parts[0];
}

let currentCategoryFilter = 'ALL';
let currentAmortYear = 2026;

function populateAmortYearSelect() {
    const select = document.getElementById('amort-year-select');
    if (!select) return;

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    const years = [2026, 2025, 2024, 2023, 2022];

    select.innerHTML = '';
    years.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr;
        if (yr === 2026) {
            opt.textContent = (lang === 'it') ? '2026 (in corso)' : ((lang === 'en') ? '2026 (in progress)' : '2026 (en cours)');
        } else {
            opt.textContent = (lang === 'it') ? `${yr} (chiuso)` : ((lang === 'en') ? `${yr} (closed)` : `${yr} (clôturé)`);
        }
        if (yr === currentAmortYear) opt.selected = true;
        select.appendChild(opt);
    });

    select.onchange = (e) => {
        currentAmortYear = parseInt(e.target.value) || 2026;
        updateAmortView();
    };
}

function updateAmortKPIs() {
    const amort = window.NEW_LIFE_AMORT || { assets: [], totals_by_year: {} };
    const yr = currentAmortYear;
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    const isCurrent = (yr === 2026);

    let t = (amort.totals_by_year && amort.totals_by_year[yr]) ? { ...amort.totals_by_year[yr] } : null;

    if (!t) {
        let val_brute = 0, annuite = 0, cumul = 0, vnc = 0;
        if (amort.assets) {
            amort.assets.forEach(ast => {
                const s = ast.schedule ? ast.schedule.find(x => x.year === yr) : null;
                if (s) {
                    val_brute += ast.initial_value;
                    annuite += s.annuite;
                    cumul += s.cumul;
                    vnc += s.vnc;
                }
            });
        }
        t = { val_brute, annuite, cumul, vnc };
    }

    const elBrute = document.getElementById('ammo-kpi-brute');
    const elDot = document.getElementById('ammo-kpi-dotation');
    const elCumul = document.getElementById('ammo-kpi-cumul');
    const elVnc = document.getElementById('ammo-kpi-vnc');

    if (elBrute) elBrute.textContent = formatCurrency(t.val_brute);
    if (elDot) elDot.textContent = formatCurrency(t.annuite);
    if (elCumul) elCumul.textContent = formatCurrency(t.cumul);
    if (elVnc) elVnc.textContent = formatCurrency(t.vnc);

    // Update Year Badges in KPI cards
    const bBrute = document.getElementById('badge-kpi-brute');
    const bDot = document.getElementById('badge-kpi-dotation');
    const bCumul = document.getElementById('badge-kpi-cumul');
    const bVnc = document.getElementById('badge-kpi-vnc');

    const yearSuffix = isCurrent ? (lang === 'it' ? ' (in corso)' : (lang === 'en' ? ' (in progress)' : ' (en cours)')) : '';

    if (bBrute) bBrute.textContent = `${yr}${yearSuffix}`;
    if (bDot) bDot.textContent = `${yr}${yearSuffix}`;
    if (bCumul) bCumul.textContent = `${yr}${yearSuffix}`;
    if (bVnc) bVnc.textContent = (lang === 'it') ? `Fine ${yr}` : ((lang === 'en') ? `End ${yr}` : `Fin ${yr}`);

    const badgeExercise = document.getElementById('amort-exercise-badge');
    if (badgeExercise) {
        const title = (lang === 'it') ? `Esercizio ${yr}${yearSuffix}` : ((lang === 'en') ? `Fiscal Year ${yr}${yearSuffix}` : `Exercice ${yr}${yearSuffix}`);
        badgeExercise.innerHTML = `<i class="fa-solid fa-calendar-check"></i> ${title}`;
    }
}

function updateAmortView() {
    const amort = window.NEW_LIFE_AMORT || { assets: [], totals_by_year: {} };
    updateAmortKPIs();
    renderAssetCards(amort.assets);
}

function initAmortissements() {
    const amort = window.NEW_LIFE_AMORT || { assets: [], totals_by_year: {} };
    const data = window.NEW_LIFE_DATA || { company: {} };

    // Last updated
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl && data.company.updated_at) {
        updatedEl.textContent = data.company.updated_at;
    }

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Category filter buttons
    document.querySelectorAll('.asset-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.asset-filter-btn').forEach(b => {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-secondary');
            currentCategoryFilter = btn.getAttribute('data-cat');
            renderAssetCards(amort.assets);
        });
    });

    const countAllEl = document.getElementById('count-all-assets');
    if (countAllEl && amort.assets) {
        countAllEl.textContent = formatNumber(amort.assets.length);
    }

    populateAmortYearSelect();
    updateAmortView();
    renderConsolidatedTotals(amort.totals_by_year);

    document.getElementById('btn-calc-sim').addEventListener('click', calculateSimulation);
    document.getElementById('btn-export-amort-excel').addEventListener('click', exportAmortExcel);

    // Initial simulation
    calculateSimulation();
}

// Hook language changes
const prevOnLangChange = window.onLanguageChange;
window.onLanguageChange = function(lang) {
    if (typeof prevOnLangChange === 'function') prevOnLangChange(lang);
    populateAmortYearSelect();
    updateAmortView();
};

function renderAssetCards(assets) {
    const container = document.getElementById('asset-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    const yr = currentAmortYear;

    const filtered = (currentCategoryFilter === 'ALL')
        ? assets
        : assets.filter(a => a.category_code === currentCategoryFilter);

    if (filtered.length === 0) {
        const msg = (lang === 'it') ? 'Nessun cespite in questa categoria.' : ((lang === 'en') ? 'No assets in this category.' : 'Aucun bien dans cette catégorie.');
        container.innerHTML = `<p style="grid-column: 1 / -1; color: var(--text-muted); padding: 2rem; text-align: center;">${msg}</p>`;
        return;
    }

    filtered.forEach(ast => {
        const card = document.createElement('div');
        card.className = 'asset-card';

        // Find schedule for selected year
        const schedYear = ast.schedule ? ast.schedule.find(s => s.year === yr) : null;
        let vncYear = 0;
        let annuiteYear = 0;

        if (schedYear) {
            vncYear = schedYear.vnc;
            annuiteYear = schedYear.annuite;
        } else {
            vncYear = 0;
            annuiteYear = 0;
        }

        const lblDotation = (lang === 'it') ? `Quota ${yr}` : ((lang === 'en') ? `Depreciation ${yr}` : `Dotation ${yr}`);
        const lblVnc = (lang === 'it') ? `VNC Fine ${yr}` : ((lang === 'en') ? `NBV End ${yr}` : `VNC Fin ${yr}`);
        const lblValInit = (lang === 'it') ? `Valore Storico` : ((lang === 'en') ? `Initial Value` : `Valeur Initiale`);
        const lblDuration = (lang === 'it') ? `Durata & Aliquota` : ((lang === 'en') ? `Duration & Rate` : `Durée & Taux`);
        const lblAcq = (lang === 'it') ? `Acquistato il` : ((lang === 'en') ? `Acquired on` : `Acquis le`);
        const lblPlan = (lang === 'it') ? `Vedi Piano Completo` : ((lang === 'en') ? `View Full Schedule` : `Voir Plan Complet`);
        const yearsText = (lang === 'it') ? `anni` : ((lang === 'en') ? `yrs` : `ans`);

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <span class="asset-badge-pcn">${ast.category_name}</span>
                <span class="badge badge-ord">${ast.id}</span>
            </div>

            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">${ast.name}</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;"><i class="fa-solid fa-truck-field"></i> ${ast.supplier}</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.85rem; margin-bottom: 1rem;">
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${lblValInit}</span>
                    <p style="font-weight: 700; font-size: 1.05rem;">${formatCurrency(ast.initial_value)}</p>
                </div>
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${lblDuration}</span>
                    <p style="font-weight: 700; font-size: 1.05rem; color: var(--accent-blue);">${ast.duration_years} ${yearsText} (${ast.annual_rate}%)</p>
                </div>
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${lblDotation}</span>
                    <p style="font-weight: 700; font-size: 1.05rem; color: var(--accent-rose);">${formatCurrency(annuiteYear)}</p>
                </div>
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${lblVnc}</span>
                    <p style="font-weight: 700; font-size: 1.05rem; color: var(--accent-emerald);">${formatCurrency(vncYear)}</p>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--text-muted);">${lblAcq} : <strong>${ast.acquisition_date}</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="openAssetModal('${ast.id}')">
                    <i class="fa-solid fa-table"></i> ${lblPlan}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderConsolidatedTotals(totalsByYear) {
    const tbody = document.getElementById('totals-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const amort = window.NEW_LIFE_AMORT || { assets: [] };
    const years = Object.keys(totalsByYear).sort();
    
    years.forEach(yr => {
        const rowData = totalsByYear[yr];
        const yrNum = parseInt(yr);
        let acq = 0;
        if (amort.assets) {
            amort.assets.forEach(a => {
                const aYr = parseInt(a.acquisition_date.split('-')[0]);
                if (aYr === yrNum) acq += a.initial_value;
            });
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 700; color: var(--accent-blue);">Exercice ${yr}</td>
            <td class="text-right" style="color: ${acq > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-weight: ${acq > 0 ? '700' : 'normal'};">
                ${acq > 0 ? '+' + formatCurrency(acq) : '0,00 €'}
            </td>
            <td class="text-right" style="color: var(--text-muted);">0,00 €</td>
            <td class="text-right" style="font-weight: 700;">${formatCurrency(rowData.val_brute)}</td>
            <td class="text-right" style="font-weight: 700; color: var(--accent-rose);">${formatCurrency(rowData.annuite)}</td>
            <td class="text-right" style="color: var(--accent-amber);">${formatCurrency(rowData.cumul)}</td>
            <td class="text-right" style="font-weight: 700; color: var(--accent-emerald);">${formatCurrency(rowData.vnc)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openAssetModal(assetId) {
    const amort = window.NEW_LIFE_AMORT || { assets: [] };
    const ast = amort.assets.find(a => a.id === assetId);
    if (!ast) return;

    document.getElementById('asset-modal-title').innerHTML = `<i class="fa-solid fa-cube text-emerald"></i> ${ast.name} (${ast.id})`;

    const body = document.getElementById('asset-modal-body');
    let scheduleRows = '';
    ast.schedule.forEach(s => {
        scheduleRows += `
            <tr>
                <td style="font-weight: 700;">Exercice ${s.year}</td>
                <td class="text-right">${formatCurrency(s.val_debut)}</td>
                <td class="text-right" style="color: var(--accent-rose); font-weight: 700;">${formatCurrency(s.annuite)}</td>
                <td class="text-right" style="color: var(--accent-amber);">${formatCurrency(s.cumul)}</td>
                <td class="text-right" style="color: var(--accent-emerald); font-weight: 700;">${formatCurrency(s.vnc)}</td>
            </tr>
        `;
    });

    body.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Catégorie & Sous-compte PCN</p>
                <p style="font-weight: 700;">${ast.subcategory}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Fournisseur & Date d'achat</p>
                <p style="font-weight: 600;">${ast.supplier} (${ast.acquisition_date})</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Valeur d'Acquisition HT</p>
                <p style="font-size: 1.2rem; font-weight: 800; color: var(--accent-emerald);">${formatCurrency(ast.initial_value)}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Durée & Méthode</p>
                <p style="font-weight: 700;">${ast.duration_years} Ans &bull; ${ast.method} (${ast.annual_rate}%)</p>
            </div>
        </div>

        <h4 style="font-size: 0.95rem; margin-bottom: 0.75rem; color: var(--text-main);"><i class="fa-solid fa-list-ol"></i> Échéancier Annuel d'Amortissement</h4>
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>Année</th>
                        <th class="text-right">Valeur Début (€)</th>
                        <th class="text-right">Dotation (€)</th>
                        <th class="text-right">Amort. Cumulés (€)</th>
                        <th class="text-right">Valeur Nette Fin (€)</th>
                    </tr>
                </thead>
                <tbody>
                    ${scheduleRows}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('asset-modal').classList.add('active');
}

function closeAssetModal() {
    document.getElementById('asset-modal').classList.remove('active');
}

function calculateSimulation() {
    const val = parseFloat(document.getElementById('sim-val').value) || 0;
    const years = parseInt(document.getElementById('sim-years').value) || 1;
    const dateStr = document.getElementById('sim-date').value || '2025-01-01';
    const method = document.getElementById('sim-method').value;

    const startYear = parseInt(dateStr.split('-')[0]) || 2025;
    const rate = 100 / years;

    const tbody = document.getElementById('sim-tbody');
    tbody.innerHTML = '';

    let currentVal = val;
    let cumul = 0;

    for (let i = 0; i < years; i++) {
        const yr = startYear + i;
        let annuite = 0;

        if (method === 'linear') {
            annuite = val / years;
            if (i === years - 1) {
                annuite = val - cumul;
            }
        } else {
            // Dégressif luxembourgeois (coef 1.75 ou 2.25)
            const coef = years <= 4 ? 1.5 : (years <= 6 ? 2.0 : 2.5);
            const degRate = Math.min((rate * coef) / 100, 0.4);
            annuite = currentVal * degRate;
            // Bascule en linéaire quand annuité linéaire restante > dégressive
            const remYears = years - i;
            if ((currentVal / remYears) > annuite || i === years - 1) {
                annuite = currentVal / remYears;
            }
        }

        annuite = Math.min(annuite, currentVal);
        cumul += annuite;
        const vnc = Math.max(0, val - cumul);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 700;">Exercice ${yr}</td>
            <td class="text-right">${formatCurrency(currentVal)}</td>
            <td class="text-right" style="color: var(--accent-blue);">${formatNumber(method === 'linear' ? rate : (rate * 1.75), 2)}%</td>
            <td class="text-right" style="font-weight: 700; color: var(--accent-rose);">${formatCurrency(annuite)}</td>
            <td class="text-right" style="color: var(--accent-amber);">${formatCurrency(cumul)}</td>
            <td class="text-right" style="font-weight: 700; color: var(--accent-emerald);">${formatCurrency(vnc)}</td>
        `;
        tbody.appendChild(tr);

        currentVal = vnc;
    }
}

function exportAmortExcel() {
    const amort = window.NEW_LIFE_AMORT || { assets: [], totals_by_year: {} };
    const years = Object.keys(amort.totals_by_year).sort();
    
    const rows = years.map(yr => {
        const data = amort.totals_by_year[yr];
        const yrNum = parseInt(yr);
        let acq = 0;
        if (amort.assets) {
            amort.assets.forEach(a => {
                const aYr = parseInt(a.acquisition_date.split('-')[0]);
                if (aYr === yrNum) acq += a.initial_value;
            });
        }
        return {
            "Exercice": yr,
            "Acquisitions (+) (€)": acq,
            "Cessions / Ventes (-) (€)": 0,
            "Valeur Brute Totale (€)": data.val_brute,
            "Dotation Annuelle (€)": data.annuite,
            "Amortissements Cumulés (€)": data.cumul,
            "Valeur Nette Comptable (VNC €)": data.vnc
        };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Amortissements_Consolides");
    XLSX.writeFile(wb, "NEW_LIFE_Tableau_Amortissements.xlsx");
}

document.addEventListener('DOMContentLoaded', initAmortissements);
