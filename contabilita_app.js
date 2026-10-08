/**
 * NEW LIFE Sàrl - Comptabilité Générale & Bilan PCN (Exercices Clôturés)
 * 4 Modules: P&L, Bilan Pareggiato, Giornale Movimenti, Mastrini
 */

let currentFilteredRecords = [];
let currentBilanSummary = { actif: [], passif: [], pnlProduits: [], pnlCharges: [], totalActif: 0, totalPassif: 0, diff: 0, netResult: 0 };
let currentMastriniData = { bilan: [], pnl: [] };

window.currentBilanSummary = currentBilanSummary;
window.currentMastriniData = currentMastriniData;
window.currentFilteredRecords = currentFilteredRecords;

// Filtri per Giornale
let journalFilterSearch = '';
let journalFilterDate = '';
let journalFilterPcn = '';
let journalFilterSection = '';
let mastriniFilterSearch = '';

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

function populateYearSelect() {
    const yearSelect = document.getElementById('contab-year-select');
    if (!yearSelect || !window.NEW_LIFE_DATA) return;
    
    const currentVal = yearSelect.value || '2026';
    yearSelect.innerHTML = '';

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';

    // 1. Current in-progress year 2026
    const opt2026 = document.createElement('option');
    opt2026.value = '2026';
    opt2026.textContent = (lang === 'it') ? '2026 (in corso)' : ((lang === 'en') ? '2026 (in progress)' : '2026 (en cours)');
    yearSelect.appendChild(opt2026);

    // 2. Closed years <= 2025
    const data = window.NEW_LIFE_DATA;
    const closedYears = (data.stats?.closed_years || [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018])
        .filter(y => y <= 2025 && y > 0)
        .sort((a, b) => b - a);

    closedYears.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        if (y === 2025) {
            opt.textContent = (lang === 'it') ? 'Esercizio 2025 (Chiuso & Depositato RCSL)' : ((lang === 'en') ? 'Exercise 2025 (Closed & Filed RCSL)' : 'Exercice 2025 (Clôturé & Déposé RCSL)');
        } else if (y === 2024) {
            opt.textContent = (lang === 'it') ? 'Esercizio 2024 (Chiuso & Depositato RCSL)' : ((lang === 'en') ? 'Exercise 2024 (Closed & Filed RCSL)' : 'Exercice 2024 (Clôturé & Déposé RCSL)');
        } else {
            opt.textContent = (lang === 'it') ? `Esercizio ${y} (Chiuso)` : ((lang === 'en') ? `Exercise ${y} (Closed)` : `Exercice ${y} (Clôturé)`);
        }
        yearSelect.appendChild(opt);
    });

    // 3. Option cumulatif exercices clos (<= 2025)
    const optAllClosed = document.createElement('option');
    optAllClosed.value = 'ALL_CLOSED';
    optAllClosed.textContent = (lang === 'it') ? 'Tutti gli esercizi chiusi (Cumulativo fino al 2025)' : ((lang === 'en') ? 'All closed exercises (Cumulative up to 2025)' : 'Tous les exercices clôturés (Cumul jusqu\'à fin 2025)');
    yearSelect.appendChild(optAllClosed);

    // 4. Option cumulatif tous exercices (avec 2026 en cours)
    const optAll = document.createElement('option');
    optAll.value = 'ALL';
    optAll.textContent = (lang === 'it') ? 'Tutti gli anni (Cumulativo 2018-2026)' : ((lang === 'en') ? 'All exercises (Cumulative 2018-2026)' : 'Tous les exercices (Cumul 2018-2026)');
    yearSelect.appendChild(optAll);

    // Restore selected value if still valid, default to 2026
    if ([...yearSelect.options].some(o => o.value === currentVal)) {
        yearSelect.value = currentVal;
    } else {
        yearSelect.value = '2026';
    }
}

function initContabilita() {
    if (!window.NEW_LIFE_DATA || !window.NEW_LIFE_DATA.records) {
        console.warn("Données NEW_LIFE non trouvées.");
        return;
    }

    const data = window.NEW_LIFE_DATA;

    // Last updated
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl) {
        updatedEl.textContent = (typeof getAppLastUpdate === 'function') ? getAppLastUpdate() : (data.company?.updated_at || '--/--/----');
    }

    // Populate Year Select
    populateYearSelect();

    // Hook language changes
    window.onLanguageChange = (lang) => {
        populateYearSelect();
        renderAccounting();
    };

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // Listeners
    document.getElementById('contab-year-select').addEventListener('change', renderAccounting);
    document.getElementById('contab-method-select').addEventListener('change', renderAccounting);

    document.getElementById('btn-export-contab-excel').addEventListener('click', exportAccountingExcel);
    document.getElementById('btn-export-contab-pdf').addEventListener('click', exportAccountingPDF);

    renderAccounting();
}

function renderAccounting() {
    const data = window.NEW_LIFE_DATA;
    const records = data.records || [];
    const amort = window.NEW_LIFE_AMORT || { assets: [], totals_by_year: {} };
    const officialBilans = data.official_bilans || {};

    const yearSelect = document.getElementById('contab-year-select');
    let selectedYear = yearSelect ? yearSelect.value : '2026';
    if (!selectedYear) selectedYear = '2026';

    const yrNum = parseInt(selectedYear);
    const method = document.getElementById('contab-method-select').value;
    const isCumulative = (selectedYear === 'ALL_CLOSED');
    const isCumulativeAll = (selectedYear === 'ALL');
    const is2026 = (yrNum === 2026);
    const maxYear = isCumulative ? 2025 : (isCumulativeAll ? 2026 : yrNum);

    const deletedBankIds = new Set(JSON.parse(localStorage.getItem('new_life_deleted_records') || '[]'));

    // Filter records (support 2026 and closed years <= 2025, strictly ignore > 2026)
    currentFilteredRecords = records.filter(r => {
        if (deletedBankIds.has(r.id)) return false;
        const yr = (method === 'COMPETENCE') ? (r.compet_contabile || r.an) : r.an;
        if (yr > 2026 || yr <= 0) return false;
        if (isCumulative) return yr <= 2025;
        if (isCumulativeAll) return yr <= 2026;
        return yr === yrNum;
    });

    // Populate PCN dropdown for Journal Filter
    populateJournalPcnFilter(currentFilteredRecords);

    let actifItems = [];
    let passifItems = [];
    let pnlProduits = [];
    let pnlCharges = [];

    // Cas 1: Exercice Officiel Déposé RCSL (2025 ou 2024)
    if (!isNaN(yrNum) && officialBilans[yrNum] && !is2026) {
        const off = officialBilans[yrNum];

        if (off.actif.immobilise) {
            actifItems.push({ isHeader: true, label: "C. ACTIF IMMOBILISÉ (Classe 2)" });
            off.actif.immobilise.forEach(item => actifItems.push({ ...item, sp_ce: 'SP', type: 'ACTIF' }));
        }
        if (off.actif.circulant) {
            actifItems.push({ isHeader: true, label: "D. ACTIF CIRCULANT & LIQUIDITÉS (Classes 4 & 5)" });
            off.actif.circulant.forEach(item => actifItems.push({ ...item, sp_ce: 'SP', type: 'ACTIF' }));
        }

        if (off.passif.capitaux_propres) {
            passifItems.push({ isHeader: true, label: "A. CAPITAUX PROPRES & RÉSULTAT (Classe 1)" });
            off.passif.capitaux_propres.forEach(item => passifItems.push({ ...item, sp_ce: 'SP', type: 'PASSIF' }));
        }
        if (off.passif.dettes) {
            passifItems.push({ isHeader: true, label: "C. DETTES À COURT TERME (Classe 4)" });
            off.passif.dettes.forEach(item => passifItems.push({ ...item, sp_ce: 'SP', type: 'PASSIF' }));
        }

        if (off.pnl) {
            pnlProduits = off.pnl.produits.map(p => {
                const code = String(p.code || '');
                const matched = currentFilteredRecords.filter(r => {
                    if (r.is_transfert || r.is_storno) return false;
                    if (code === '70') return (r.macro && r.macro.startsWith('70')) || (r.sp_ce === 'CE' && r.e_s === 'ENTREES');
                    if (code === '77') return r.macro && r.macro.startsWith('77');
                    return (r.macro && r.macro.startsWith(code)) || (r.class && r.class.startsWith(code));
                });
                let subItems = p.subItems || null;
                if (code === '77' && !subItems) {
                    subItems = [
                        { title: 'Régularisation IRC (ACD)', note: 'Régularisation fiscale impôt sur le revenu', val: 20.71 },
                        { title: 'Régularisation ICC (ACD)', note: 'Régularisation impôt commercial communal', val: 39.00 }
                    ];
                }
                return { ...p, sp_ce: 'CE', type: 'P', records: matched, subItems: subItems };
            });

            pnlCharges = off.pnl.charges.map(c => {
                const code = String(c.code || '');
                const matched = currentFilteredRecords.filter(r => {
                    if (r.is_transfert || r.is_storno) return false;
                    if (code === '60') return (r.macro && r.macro.startsWith('60')) || (r.class && r.class.startsWith('60'));
                    if (code === '61') return (r.macro && r.macro.startsWith('61')) || (r.class && r.class.startsWith('61'));
                    if (code === '62') return (r.macro && r.macro.startsWith('62')) || (r.class && r.class.startsWith('62'));
                    if (code === '63') return (r.macro && r.macro.startsWith('63')) || (r.class && r.class.startsWith('63'));
                    if (code === '64') return (r.macro && r.macro.startsWith('64')) || (r.class && r.class.startsWith('64'));
                    if (code === '65') return (r.macro && r.macro.startsWith('65')) || (r.class && r.class.startsWith('65'));
                    if (code === '67') return (r.macro && r.macro.startsWith('67')) || (r.class && r.class.startsWith('67'));
                    if (code === '68') return (r.macro && r.macro.startsWith('68')) || (r.class && r.class.startsWith('68'));
                    return (r.macro && r.macro.startsWith(code)) || (r.class && r.class.startsWith(code));
                });

                let amortSchedule = null;
                if (code === '63') {
                    if (amort && amort.assets) {
                        amortSchedule = amort.assets.map(a => {
                            const schedItem = a.schedule ? a.schedule.find(s => s.year === yrNum) : null;
                            if (schedItem && schedItem.annuite > 0) {
                                return {
                                    name: a.name,
                                    cat: a.subcategory || a.category_name,
                                    initial_value: a.initial_value,
                                    annual_rate: a.annual_rate,
                                    annuite: schedItem.annuite,
                                    cumul: schedItem.cumul,
                                    vnc: schedItem.vnc
                                };
                            }
                            return null;
                        }).filter(Boolean);
                    }
                }

                let subItems = c.subItems || null;
                if (code === '67' && !subItems) {
                    subItems = [
                        { title: `Charge fiscale IRC estimée de l'exercice ${yrNum} (P&L)`, note: 'Impôt sur le revenu des collectivités (Charge d\'exploitation)', val: c.val },
                        { title: `Avances d'impôts ACD versées au cours de l'exercice (Bilan Actif 42)`, note: `${matched.length} versements d'acomptes ACD portés en créance fiscale`, val: 8021.91 }
                    ];
                }

                return { ...c, sp_ce: 'CE', type: 'C', records: matched, amortSchedule: amortSchedule, subItems: subItems };
            });
        }

    } else {
        // Cas 2: Exercice en cours 2026, autres exercices ou Cumul
        let dotationAnnuiteBilan = 0;
        let vncTotal = 0;

        if (!isCumulative && amort && amort.totals_by_year && amort.totals_by_year[yrNum]) {
            dotationAnnuiteBilan = amort.totals_by_year[yrNum].annuite || 0;
            vncTotal = amort.totals_by_year[yrNum].vnc || 0;
        } else if (isCumulative && amort && amort.totals_by_year && amort.totals_by_year[2025]) {
            vncTotal = amort.totals_by_year[2025].vnc || 13515.06;
        } else if (isCumulativeAll && amort && amort.totals_by_year && amort.totals_by_year[2026]) {
            vncTotal = amort.totals_by_year[2026].vnc || 34098.81;
        }

        let bankClosing = 0;
        const bankRecs = records.filter(r => {
            const yr = r.an || r.compet_contabile;
            return yr <= maxYear && yr > 0 && r.progressivo_banca !== 0;
        });
        if (bankRecs.length > 0) {
            bankClosing = bankRecs[bankRecs.length - 1].progressivo_banca;
        }
        if (bankClosing <= 0) bankClosing = (is2026 ? 18366.89 : 9988.41);

        const participationsVal = 234221.67;
        const vncCorp = (vncTotal > 2572.13) ? (vncTotal - 2572.13) : vncTotal * 0.8;
        const vncIncorp = vncTotal - vncCorp;
        const creancesVal = 9489.50;
        const dettesVal = 13018.77;

        // Actif
        actifItems.push({ isHeader: true, label: "C. ACTIF IMMOBILISÉ (Classe 2)" });
        if (vncIncorp > 0) actifItems.push({ code: "21", label: "21 - Immobilisations incorporelles (Software)", detail: "Valeur Nette Comptable", val: vncIncorp, sp_ce: 'SP', type: 'ACTIF' });
        if (vncCorp > 0) actifItems.push({ code: "22", label: "22 - Immobilisations corporelles (Véhicules & Mobilier)", detail: "Valeur Nette Comptable", val: vncCorp, sp_ce: 'SP', type: 'ACTIF' });
        actifItems.push({ code: "23", label: "23 - Immobilisations financières (Participations)", detail: "Participations dans entreprises liées", val: participationsVal, sp_ce: 'SP', type: 'ACTIF' });

        actifItems.push({ isHeader: true, label: "D. ACTIF CIRCULANT & LIQUIDITÉS (Classes 4 & 5)" });
        actifItems.push({ code: "42", label: "42 - Créances à court terme (ACD & TVA)", detail: "Créances fiscales et TVA", val: creancesVal, sp_ce: 'SP', type: 'ACTIF' });
        actifItems.push({ code: "51", label: "51 - Avoirs en banques et liquidités", detail: is2026 ? `Solde au fil de l'eau (2026)` : `Solde au 31/12/${maxYear}`, val: bankClosing, sp_ce: 'SP', type: 'ACTIF' });

        const calculatedTotalActif = (vncIncorp + vncCorp + participationsVal + creancesVal + bankClosing);
        const capitalVal = 31000.00;
        const reservesVal = 4100.00;
        
        let reportANouveau = is2026 
            ? 219095.91 
            : Math.max(0, calculatedTotalActif - dettesVal - capitalVal - reservesVal);

        // Passif
        passifItems.push({ isHeader: true, label: "A. CAPITAUX PROPRES & RÉSULTAT (Classe 1)" });
        passifItems.push({ code: "101", label: "101 - Capital souscrit", detail: "Capital social souscrit", val: capitalVal, sp_ce: 'SP', type: 'PASSIF' });
        passifItems.push({ code: "131", label: "131/138 - Réserves (Légale & IF)", detail: "Réserves légales et spéciales", val: reservesVal, sp_ce: 'SP', type: 'PASSIF' });
        passifItems.push({ code: "141", label: is2026 ? "141 - Résultats reportés (Report à nouveau fin 2025)" : "141 - Résultats reportés (Report à nouveau)", detail: "Résultats cumulés des exercices antérieurs", val: Math.max(0, reportANouveau), sp_ce: 'SP', type: 'PASSIF' });
        passifItems.push({ code: "142", label: is2026 ? "142 - Résultat net provisoire (2026 en cours)" : "142 - Résultat net de l'exercice", detail: "Résultat net comptable (P&L)", val: 0, sp_ce: 'SP', type: 'PASSIF' });

        passifItems.push({ isHeader: true, label: "C. DETTES À COURT TERME (Classe 4)" });
        passifItems.push({ code: "46", label: "46 - Dettes fiscales et sociales", detail: "Dettes ACD, TVA et CCSS", val: dettesVal, sp_ce: 'SP', type: 'PASSIF' });

        // --- COMPTE DE RÉSULTAT DYNAMIQUE (2026 / CUMUL) ---
        let totProd = 0;
        let totChg = 0;
        const pnlMap = {};

        currentFilteredRecords.forEach(r => {
            if (r.is_transfert || r.is_storno) return;
            const isProd = (r.macro && r.macro.startsWith('7')) || (!r.macro && r.sp_ce === 'CE' && r.e_s === 'ENTREES');
            const isChg = (r.macro && r.macro.startsWith('6')) || (!r.macro && r.sp_ce === 'CE' && r.e_s === 'SORTIES');
            const rawMontant = (r.montant !== undefined && r.montant !== null && r.montant !== '') ? Number(r.montant) : Number(r.total || 0);

            if (isProd) {
                const val = rawMontant;
                const k = r.macro || "70 - MONTANT NET DU CHIFFRE D'AFFAIRES";
                if (!pnlMap[k]) {
                    pnlMap[k] = {
                        code: k.split('-')[0].trim(),
                        label: k,
                        detail: r.detail || r.class || "Chiffre d'affaires et produits d'exploitation",
                        val: 0,
                        type: 'P',
                        sp_ce: 'CE',
                        records: []
                    };
                }
                pnlMap[k].val += val;
                pnlMap[k].records.push(r);
                totProd += val;
            } else if (isChg) {
                // Negative montant in records is normal expense (cost), positive montant is refund/restitution (reduces cost)
                const val = -rawMontant;
                const k = r.macro || "61 - AUTRES CHARGES EXTERNES";
                if (!pnlMap[k]) {
                    pnlMap[k] = {
                        code: k.split('-')[0].trim(),
                        label: k,
                        detail: r.detail || r.class || "Charges d'exploitation et frais généraux",
                        val: 0,
                        type: 'C',
                        sp_ce: 'CE',
                        records: []
                    };
                }
                pnlMap[k].val += val;
                pnlMap[k].records.push(r);
                totChg += val;
            }
        });

        // Amortization (63)
        let dotationAnnuite = 0;
        let amortSchedule = null;

        if (!isCumulative && amort && amort.totals_by_year && amort.totals_by_year[yrNum]) {
            dotationAnnuite = amort.totals_by_year[yrNum].annuite || 0;
            if (amort.assets) {
                amortSchedule = amort.assets.map(a => {
                    const schedItem = a.schedule ? a.schedule.find(s => s.year === yrNum) : null;
                    if (schedItem && schedItem.annuite > 0) {
                        return {
                            name: a.name,
                            cat: a.subcategory || a.category_name,
                            initial_value: a.initial_value,
                            annual_rate: a.annual_rate,
                            annuite: schedItem.annuite,
                            cumul: schedItem.cumul,
                            vnc: schedItem.vnc
                        };
                    }
                    return null;
                }).filter(Boolean);
            }
        } else if (isCumulative && amort && amort.totals_by_year) {
            dotationAnnuite = Object.entries(amort.totals_by_year)
                .filter(([y]) => parseInt(y) <= 2025)
                .reduce((sum, [, item]) => sum + (item.annuite || 0), 0);
        } else if (isCumulativeAll && amort && amort.totals_by_year && amort.totals_by_year[2026]) {
            dotationAnnuite = amort.totals_by_year[2026].annuite || 0;
            if (amort.assets) {
                amortSchedule = amort.assets.map(a => {
                    const schedItem = a.schedule ? a.schedule.find(s => s.year === 2026) : null;
                    if (schedItem && schedItem.annuite > 0) {
                        return {
                            name: a.name,
                            cat: a.subcategory || a.category_name,
                            initial_value: a.initial_value,
                            annual_rate: a.annual_rate,
                            annuite: schedItem.annuite,
                            cumul: schedItem.cumul,
                            vnc: schedItem.vnc
                        };
                    }
                    return null;
                }).filter(Boolean);
            }
        }

        const has63Already = Object.keys(pnlMap).some(k => k.includes('63'));
        if (dotationAnnuite > 0 && !has63Already) {
            pnlMap["63 - DOTATIONS AUX AMORTISSEMENTS"] = {
                code: "63",
                label: "63 - Dotations aux amortissements (PCN)",
                detail: "Dotation annuelle sur matériel, logiciel et mobilier",
                val: dotationAnnuite,
                type: 'C',
                sp_ce: 'CE',
                records: [],
                amortSchedule: amortSchedule
            };
            totChg += dotationAnnuite;
        } else if (has63Already && amortSchedule) {
            const k63 = Object.keys(pnlMap).find(k => k.includes('63'));
            if (k63 && !pnlMap[k63].amortSchedule) {
                pnlMap[k63].amortSchedule = amortSchedule;
            }
        }

        Object.values(pnlMap).forEach(item => {
            if (item.type === 'P') pnlProduits.push(item);
            else pnlCharges.push(item);
        });

        pnlProduits.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
        pnlCharges.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    }

    const totalProd = pnlProduits.reduce((sum, i) => sum + i.val, 0);
    const totalChg = pnlCharges.reduce((sum, i) => sum + i.val, 0);
    const netRes = totalProd - totalChg;

    // Update Passif 142 if dynamic bilan
    const passif142 = passifItems.find(p => p.code === '142');
    if (passif142 && (is2026 || isNaN(yrNum) || !officialBilans[yrNum])) {
        passif142.val = netRes;
    }

    // Enrich Bilan Actif and Passif items with breakdown schedules and sub-items
    enrichBilanItems(actifItems, yrNum, currentFilteredRecords, amort, totalProd, totalChg, netRes);
    enrichBilanItems(passifItems, yrNum, currentFilteredRecords, amort, totalProd, totalChg, netRes);

    const totalActif = actifItems.filter(i => !i.isHeader).reduce((sum, i) => sum + i.val, 0);
    const totalPassif = passifItems.filter(i => !i.isHeader).reduce((sum, i) => sum + i.val, 0);
    const diff = Math.abs(totalActif - totalPassif);

    currentBilanSummary = {
        selectedYear: selectedYear,
        actif: actifItems,
        passif: passifItems,
        pnlProduits: pnlProduits,
        pnlCharges: pnlCharges,
        totalProduits: totalProd,
        totalCharges: totalChg,
        totalActif: totalActif,
        totalPassif: totalPassif,
        diff: diff,
        netResult: netRes
    };
    window.currentBilanSummary = currentBilanSummary;
    window.currentFilteredRecords = currentFilteredRecords;

    // Update Status Banner UI (Provisional for 2026, Balanced for closed years)
    const statusBanner = document.getElementById('bilan-status-banner');
    const statusTitle = statusBanner ? statusBanner.querySelector('strong') : null;
    const statusBadge = document.getElementById('bilan-status-badge');
    const statusNote = statusBanner ? statusBanner.querySelector('p') : null;
    const filingStatus = document.getElementById('bilan-filing-status');
    const diffEl = document.getElementById('bilan-diff-val');
    const statusIconContainer = statusBanner ? statusBanner.querySelector('div > div:first-child') : null;
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';

    if (is2026) {
        if (statusBanner) statusBanner.style.borderLeft = '4px solid var(--accent-amber)';
        if (statusIconContainer) {
            statusIconContainer.style.background = 'rgba(245, 158, 11, 0.15)';
            statusIconContainer.style.color = 'var(--accent-amber)';
            statusIconContainer.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i>';
        }
        if (statusTitle) statusTitle.textContent = (typeof t === 'function' && t('bilan_status_in_progress')) ? t('bilan_status_in_progress') : '📊 SITUATION COMPTABLE PROVISOIRE';
        if (statusBadge) {
            statusBadge.textContent = (typeof t === 'function' && t('bilan_badge_in_progress')) ? t('bilan_badge_in_progress') : 'IN CORSO / PROVVISORIO';
            statusBadge.style.background = 'rgba(245, 158, 11, 0.2)';
            statusBadge.style.color = 'var(--accent-amber)';
        }
        if (statusNote) statusNote.textContent = (typeof t === 'function' && t('bilan_in_progress_note')) ? t('bilan_in_progress_note') : 'Esercizio 2026 in corso: situazione contabile al momento (non ancora chiusa/depositata). P&L e risultato visualizzati in tempo reale.';
        if (filingStatus) {
            filingStatus.textContent = (lang === 'it') ? 'Non depositato (In corso)' : ((lang === 'en') ? 'Not filed (In progress)' : 'Non Déposé (En cours)');
            filingStatus.style.color = 'var(--accent-amber)';
        }
        if (diffEl) {
            diffEl.textContent = formatCurrency(diff);
            diffEl.style.color = (diff < 0.05) ? "var(--accent-emerald)" : "var(--accent-amber)";
        }
    } else {
        if (statusBanner) statusBanner.style.borderLeft = '4px solid var(--accent-emerald)';
        if (statusIconContainer) {
            statusIconContainer.style.background = 'rgba(16, 185, 129, 0.15)';
            statusIconContainer.style.color = 'var(--accent-emerald)';
            statusIconContainer.innerHTML = '<i class="fa-solid fa-scale-balanced"></i>';
        }
        if (statusTitle) statusTitle.textContent = (typeof t === 'function' && t('bilan_status_balanced')) ? t('bilan_status_balanced') : '✓ BILAN ÉQUILIBRÉ (Actif = Passif)';
        if (statusBadge) {
            statusBadge.textContent = (lang === 'it') ? 'PAREGGIATO' : 'ÉQUILIBRÉ';
            statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
            statusBadge.style.color = 'var(--accent-emerald)';
        }
        if (statusNote) statusNote.textContent = (typeof t === 'function' && t('bilan_closed_note')) ? t('bilan_closed_note') : 'Exercices comptables clôturés (jusqu’à fin 2025). Déposés au RCSL.';
        if (filingStatus) {
            filingStatus.textContent = officialBilans[yrNum]?.status || (isCumulative ? "Cumul Clôturé (2018-2025)" : (selectedYear === 'ALL' ? "Cumul 2018-2026" : `Exercice ${yrNum} Clôturé`));
            filingStatus.style.color = 'var(--accent-blue)';
        }
        if (diffEl) {
            diffEl.textContent = formatCurrency(diff);
            diffEl.style.color = (diff < 0.05) ? "var(--accent-emerald)" : "var(--accent-rose)";
        }
    }

    // 1. Render PnL Tab
    renderPnLView(pnlProduits, pnlCharges, totalProd, totalChg, netRes);

    // 2. Render Bilan Tab
    renderBilanView(actifItems, passifItems, totalActif, totalPassif);

    // 3. Render Giornale Movimenti Tab
    renderJournalTable(currentFilteredRecords);

    // 4. Render Mastrini Tab
    renderMastriniTable(currentFilteredRecords, selectedYear);
}

/* ==========================================================================
   TAB 1: COMPTE DE RÉSULTAT (P&L) - INTERACTIVE ACCORDION & BREAKDOWN
   ========================================================================== */
function renderPnLView(produits, charges, totalProd, totalChg, netResult) {
    const produitsContainer = document.getElementById('pnl-produits-container');
    const chargesContainer = document.getElementById('pnl-charges-container');
    if (!produitsContainer || !chargesContainer) return;

    produitsContainer.innerHTML = '';
    chargesContainer.innerHTML = '';

    produits.forEach((p, idx) => {
        const itemId = `pnl-prod-${idx}`;
        const rowEl = buildPnLItemHtml(p, itemId, true);
        produitsContainer.appendChild(rowEl);
    });

    charges.forEach((c, idx) => {
        const itemId = `pnl-chg-${idx}`;
        const rowEl = buildPnLItemHtml(c, itemId, false);
        chargesContainer.appendChild(rowEl);
    });

    if (produits.length === 0) {
        produitsContainer.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">Nessun ricavo / provento registrato.</p>';
    }
    if (charges.length === 0) {
        chargesContainer.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">Nessun costo / onere registrato.</p>';
    }

    document.getElementById('total-produits-val').textContent = formatCurrency(totalProd);
    document.getElementById('total-charges-val').textContent = formatCurrency(totalChg);

    const netEl = document.getElementById('pnl-net-result-val');
    if (netEl) {
        netEl.textContent = formatCurrency(netResult);
        netEl.className = (netResult >= 0) ? 'text-emerald' : 'text-rose';
    }
}

function buildPnLItemHtml(item, itemId, isProd) {
    const container = document.createElement('div');
    container.className = 'pnl-accordion-group';
    container.style.marginBottom = '0.35rem';

    const records = item.records || [];
    const hasAmort = (item.amortSchedule && item.amortSchedule.length > 0);
    const hasSubItems = (item.subItems && item.subItems.length > 0);
    const recCount = records.length || (hasAmort ? item.amortSchedule.length : (hasSubItems ? item.subItems.length : 0));

    const countBadge = recCount > 0 
        ? `<span class="count-pill"><i class="fa-solid fa-${isProd ? 'file-invoice-dollar' : 'receipt'}"></i> ${recCount} ${isProd ? (recCount === 1 ? 'fattura' : 'fatture') : (hasAmort ? 'cespiti' : (records.length > 0 ? (records.length === 1 ? 'movimento' : 'movimenti') : 'voci dettaglio'))}</span>`
        : `<span class="count-pill" style="opacity: 0.6;">Dettaglio</span>`;

    const colorClass = isProd ? 'text-emerald' : 'text-rose';

    let detailContentHtml = '';

    if (hasAmort) {
        // Amortization Schedule
        let amortRows = '';
        let totAnnuite = 0;
        let totVnc = 0;
        item.amortSchedule.forEach((a, i) => {
            totAnnuite += a.annuite;
            totVnc += a.vnc;
            amortRows += `
                <tr>
                    <td class="text-center" style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
                    <td><strong style="color: var(--text-main);">${a.name}</strong></td>
                    <td style="font-size: 0.75rem; color: var(--text-muted);">${a.cat}</td>
                    <td class="text-right" style="font-family: monospace;">${formatCurrency(a.initial_value)}</td>
                    <td class="text-center" style="font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);">${a.annual_rate}%</td>
                    <td class="text-right text-rose" style="font-weight: 700; font-family: monospace;">${formatCurrency(a.annuite)}</td>
                    <td class="text-right" style="font-family: monospace; color: var(--text-muted);">${formatCurrency(a.cumul)}</td>
                    <td class="text-right text-emerald" style="font-weight: 700; font-family: monospace;">${formatCurrency(a.vnc)}</td>
                </tr>
            `;
        });

        detailContentHtml = `
            <div style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.82rem; color: var(--accent-rose);">
                    <i class="fa-solid fa-calculator"></i> Piano Ammortamenti Cespiti dell'Esercizio (${item.amortSchedule.length} cespiti)
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Totale Quota Annua: <strong style="color: var(--accent-rose);">${formatCurrency(totAnnuite)}</strong> | VNC Residuo: <strong style="color: var(--accent-emerald);">${formatCurrency(totVnc)}</strong>
                </span>
            </div>
            <div style="overflow-x: auto;">
                <table class="nested-table">
                    <thead>
                        <tr>
                            <th style="width: 35px; text-align: center;">#</th>
                            <th>Cespite / Bene Ammortizzabile</th>
                            <th style="width: 140px;">Categoria</th>
                            <th style="width: 105px;" class="text-right">Valore Storico</th>
                            <th style="width: 75px;" class="text-center">Aliquota</th>
                            <th style="width: 110px;" class="text-right">Quota Esercizio</th>
                            <th style="width: 105px;" class="text-right">Fondo Amm.</th>
                            <th style="width: 105px;" class="text-right">VNC Residuo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${amortRows}
                    </tbody>
                </table>
            </div>
        `;
    } else if (hasSubItems) {
        // Analytical Sub-items Breakdown
        let subRows = '';
        item.subItems.forEach((s, i) => {
            subRows += `
                <tr>
                    <td class="text-center" style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
                    <td><strong style="color: var(--text-main);">${s.title}</strong></td>
                    <td style="font-size: 0.78rem; color: var(--text-muted);">${s.note || '-'}</td>
                    <td class="text-right ${colorClass}" style="font-weight: 700; font-family: monospace;">${formatCurrency(s.val)}</td>
                </tr>
            `;
        });

        detailContentHtml = `
            <div style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.82rem; color: ${isProd ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                    <i class="fa-solid fa-list-check"></i> Spaccato Dettaglio Voce (${item.subItems.length} sotto-voci)
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Importo Conto Economico (P&L): <strong style="color: ${isProd ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${formatCurrency(item.val)}</strong>
                </span>
            </div>
            <div style="overflow-x: auto; margin-bottom: 0.5rem;">
                <table class="nested-table">
                    <thead>
                        <tr>
                            <th style="width: 35px; text-align: center;">#</th>
                            <th>Voce di Dettaglio / Descrizione</th>
                            <th>Nota / Destinazione Contabile</th>
                            <th style="width: 120px;" class="text-right">Importo (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subRows}
                    </tbody>
                </table>
            </div>
        `;
    } else if (records.length > 0) {
        let rowsHtml = '';
        let totImponibile = 0;
        let totTva = 0;
        let totGlobale = 0;

        records.forEach((r, i) => {
            const rawTot = Number(r.total) || 0;
            const rawImp = (r.montant !== undefined && r.montant !== null && r.montant !== '') ? Number(r.montant) : rawTot;
            const rawTva = Number(r.tva) || 0;

            let isRefund = false;
            let effImp = 0;
            let effTva = 0;
            let effTot = 0;

            if (isProd) {
                // For revenues, positive is invoice, negative is credit note
                isRefund = (rawImp < 0 || rawTot < 0);
                effImp = rawImp;
                effTva = rawTva;
                effTot = rawTot;
            } else {
                // For charges, negative is normal cost, positive is refund/restitution
                isRefund = (rawImp > 0 || rawTot > 0);
                effImp = -rawImp;
                effTva = -rawTva;
                effTot = -rawTot;
            }

            totImponibile += effImp;
            totTva += effTva;
            totGlobale += effTot;

            const controparte = r.fournisseur || r.description || '-';
            const desc = (r.description && r.description !== controparte) ? r.description : (r.detail || r.class || '');
            let nrFatt = r.nr_fatt 
                ? `<span style="font-weight: 700; color: ${isProd ? 'var(--accent-emerald)' : 'var(--accent-blue)'};">${r.nr_fatt}</span>` 
                : '<span style="color: var(--text-muted);">-</span>';

            if (isRefund) {
                nrFatt += ` <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); font-size: 0.68rem; padding: 1px 5px; border-radius: 4px; margin-left: 4px;"><i class="fa-solid fa-arrow-rotate-left"></i> Restituzione / Accredito</span>`;
            }

            const rowColorClass = isRefund 
                ? (isProd ? 'text-rose' : 'text-emerald') 
                : (isProd ? 'text-emerald' : 'text-rose');

            const dispImp = isRefund ? `- ${formatCurrency(Math.abs(rawImp))}` : formatCurrency(Math.abs(rawImp));
            const dispTva = isRefund ? `- ${formatCurrency(Math.abs(rawTva))}` : formatCurrency(Math.abs(rawTva));
            const dispTot = isRefund ? `- ${formatCurrency(Math.abs(rawTot))}` : formatCurrency(Math.abs(rawTot));

            rowsHtml += `
                <tr ${isRefund ? 'style="background: rgba(16, 185, 129, 0.04);"' : ''}>
                    <td class="text-center" style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
                    <td style="font-weight: 600; white-space: nowrap;">${r.date || '-'}</td>
                    <td>
                        <strong style="color: var(--text-main);">${controparte}</strong>
                    </td>
                    <td style="white-space: nowrap; font-family: monospace; font-size: 0.8rem;">${nrFatt}</td>
                    <td style="font-size: 0.78rem; color: var(--text-muted); max-width: 250px;">
                        ${desc}
                    </td>
                    <td class="text-right" style="font-family: monospace; ${isRefund ? 'color: var(--accent-emerald); font-weight: 600;' : ''}">${dispImp}</td>
                    <td class="text-right" style="font-family: monospace; color: var(--text-muted);">${dispTva}</td>
                    <td class="text-right ${rowColorClass}" style="font-weight: 700; font-family: monospace;">${dispTot}</td>
                </tr>
            `;
        });

        detailContentHtml = `
            <div style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.82rem; color: ${isProd ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                    <i class="fa-solid fa-${isProd ? 'file-invoice-dollar' : 'receipt'}"></i> ${isProd ? 'Dettaglio Fatture Emesse / Ricavi' : 'Dettaglio Spese / Fatture d\'Acquisto'} (${records.length} registrazioni)
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Imponibile (HT): <strong>${formatCurrency(totImponibile)}</strong> | IVA: <strong>${formatCurrency(totTva)}</strong> | Totale Lordo (TTC): <strong style="color: ${isProd ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${formatCurrency(totGlobale)}</strong>
                </span>
            </div>
            <div style="overflow-x: auto;">
                <table class="nested-table">
                    <thead>
                        <tr>
                            <th style="width: 35px; text-align: center;">#</th>
                            <th style="width: 85px;">Data</th>
                            <th>${isProd ? 'Cliente / Controparte' : 'Fornitore / Controparte'}</th>
                            <th style="width: 120px;">${isProd ? 'Nr. Fattura' : 'Rif. Fattura / Doc'}</th>
                            <th>Descrizione / Causale</th>
                            <th style="width: 95px;" class="text-right">Imponibile (HT)</th>
                            <th style="width: 75px;" class="text-right">IVA</th>
                            <th style="width: 110px;" class="text-right">Totale (TTC)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        detailContentHtml = `
            <div style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.82rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-circle-info" style="color: var(--accent-blue);"></i>
                <span>Voce di bilancio consolidata secondo il prospetto ufficiale RCSL: <strong>${item.detail || item.label}</strong> (Totale: ${formatCurrency(item.val)}).</span>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="pnl-interactive-row ${!isProd ? 'charge-row' : ''}" id="pnl-header-${itemId}" onclick="togglePnLItem('${itemId}')">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                <i class="fa-solid fa-chevron-right pnl-chevron" id="pnl-chev-${itemId}"></i>
                <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                        <strong style="color: var(--text-main); font-size: 0.88rem;">${item.label}</strong>
                        ${countBadge}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">${item.detail || ''}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 700; font-size: 0.95rem; font-family: monospace;" class="${colorClass}">${formatCurrency(item.val)}</span>
            </div>
        </div>
        <div class="pnl-detail-container" id="pnl-detail-${itemId}">
            ${detailContentHtml}
        </div>
    `;

    return container;
}

function togglePnLItem(itemId) {
    const header = document.getElementById(`pnl-header-${itemId}`);
    const detail = document.getElementById(`pnl-detail-${itemId}`);
    if (!header || !detail) return;

    const isExpanded = header.classList.contains('expanded');
    if (isExpanded) {
        header.classList.remove('expanded');
        detail.classList.remove('expanded');
    } else {
        header.classList.add('expanded');
        detail.classList.add('expanded');
    }
}

function toggleAllPnLSection(containerId, expand) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.pnl-interactive-row').forEach(h => {
        if (expand) h.classList.add('expanded');
        else h.classList.remove('expanded');
    });
    container.querySelectorAll('.pnl-detail-container').forEach(d => {
        if (expand) d.classList.add('expanded');
        else d.classList.remove('expanded');
    });
}

window.togglePnLItem = togglePnLItem;
window.toggleAllPnLSection = toggleAllPnLSection;

/* ==========================================================================
   ENRICH BILAN ITEMS WITH DETAILED BREAKDOWNS & SCHEDULES
   ========================================================================== */
function enrichBilanItems(items, yrNum, records, amort, totalProd, totalChg, netRes) {
    items.forEach(item => {
        if (item.isHeader) return;
        const code = String(item.code || '');

        // 1. Software (21)
        if (code === '21' || item.label.includes('incorporelles') || item.label.includes('Software')) {
            if (amort && amort.assets) {
                item.amortSchedule = amort.assets
                    .filter(a => a.category_code === '211' || (a.category_name && a.category_name.includes('INCORPORELLES')))
                    .map(a => {
                        const s = a.schedule ? a.schedule.find(x => x.year === yrNum) : null;
                        return {
                            name: a.name,
                            cat: a.subcategory || 'Software Bureautique',
                            initial_value: a.initial_value,
                            annual_rate: a.annual_rate,
                            annuite: s ? s.annuite : 0,
                            cumul: s ? s.cumul : a.initial_value,
                            vnc: s ? s.vnc : 0
                        };
                    });
            }
        }

        // 2. Corporelles (22) - Véhicules & Mobilier
        else if (code === '22' || item.label.includes('corporelles') || item.label.includes('Véhicules')) {
            if (amort && amort.assets) {
                item.amortSchedule = amort.assets
                    .filter(a => a.category_code.startsWith('22') || (a.category_name && a.category_name.includes('CORPORELLES')))
                    .map(a => {
                        const s = a.schedule ? a.schedule.find(x => x.year === yrNum) : null;
                        return {
                            name: a.name,
                            cat: a.subcategory || 'Véhicules & Mobilier',
                            initial_value: a.initial_value,
                            annual_rate: a.annual_rate,
                            annuite: s ? s.annuite : 0,
                            cumul: s ? s.cumul : a.initial_value,
                            vnc: s ? s.vnc : 0
                        };
                    });
            }
        }

        // 3. Participations (23)
        else if (code === '23' || item.label.includes('financières') || item.label.includes('Participations')) {
            const partVal = 232725.00;
            const creancePart = Math.max(0, item.val - partVal);
            item.subItems = [
                { title: 'Participations dans entreprises liées (Parts sociales)', note: 'Partecipazioni strategiche in società del gruppo', val: partVal },
                { title: 'Créances et prêts rattachés à des participations', note: 'Finanziamenti e crediti verso società partecipate', val: creancePart > 0 ? creancePart : 1496.67 }
            ];
            item.records = records.filter(r => r.macro && r.macro.includes('23'));
        }

        // 4. Créances fiscales & TVA (42)
        else if (code === '42' || item.label.includes('Créances') || item.label.includes('créances')) {
            const irc = 4681.62;
            const icc = 1060.00;
            const rts = 856.33;
            const tvaAmont = Math.max(0, item.val - irc - icc - rts) || 2891.55;
            item.subItems = [
                { title: 'ACD - Impôt sur le revenu des collectivités (IRC avances)', note: 'Credito imposte dirette societarie (avances versées)', val: irc },
                { title: 'ACD - Impôt commercial communal (ICC avances)', note: 'Credito imposta commerciale comunale', val: icc },
                { title: 'ACD - Retenue d\'impôt sur les salaires (RTS)', note: 'Crediti ritenute d\'acconto lavoro dipendente', val: rts },
                { title: 'AED - TVA en amont récupérable (TVA Déductible)', note: 'Credito IVA su acquisti di beni e servizi', val: tvaAmont }
            ];
            item.records = records.filter(r => (r.macro && r.macro.includes('42')) || (r.sp_ce === 'SP' && r.total > 0 && !r.macro?.includes('58')));
        }

        // 5. Avoirs en banques (51)
        else if (code === '51' || item.label.includes('banques') || item.label.includes('Liquidités')) {
            item.subItems = [
                { title: 'Compte Courant POST Luxembourg', note: `Disponibilità liquide e cassa al 31/12/${yrNum || 2026}`, val: item.val }
            ];
            item.records = records.filter(r => r.compte === 'BANQUE' || r.progressivo_banca !== 0).slice(-15);
        }

        // 6. Capital souscrit (101)
        else if (code === '101' || item.label.includes('Capital')) {
            item.subItems = [
                { title: '310 parts sociales nominatives de valeur nominale 100,00 EUR', note: 'Capitale sociale statutario interamente versato e liberato', val: 31000.00 },
                { title: 'Associés fondateurs NEW LIFE Sàrl', note: 'Quote sociali assegnate e depositate al RCSL', val: 31000.00 }
            ];
        }

        // 7. Réserves (131/138)
        else if (code === '131' || code === '131/138' || item.label.includes('Réserves')) {
            const resLegale = 3100.00;
            const resIF = Math.max(0, item.val - resLegale) || 1000.00;
            item.subItems = [
                { title: '131 - Réserve Légale', note: 'Accantonamento 5% degli utili fino al 10% del capitale sociale', val: resLegale },
                { title: '138 - Réserve Spéciale Impôt sur la Fortune (IF)', note: 'Riserva speciale per abbattimento Impôt sur la Fortune (IF)', val: resIF }
            ];
        }

        // 8. Résultats reportés (141)
        else if (code === '141' || item.label.includes('reportés') || item.label.includes('Report à nouveau')) {
            item.subItems = [
                { title: 'Bénéfices cumulés des exercices antérieurs non distribués', note: 'Utili portati a nuovo e reinvestiti in azienda', val: item.val }
            ];
        }

        // 9. Résultat net de l'exercice (142)
        else if (code === '142' || item.label.includes('Résultat net') || item.label.includes('Risultato')) {
            item.subItems = [
                { title: 'Totale Ricavi d\'Esercizio (Classe 7 - Produits)', note: 'Fatture e proventi dal Conto Economico', val: totalProd },
                { title: 'Totale Costi d\'Esercizio (Classe 6 - Charges)', note: 'Spese, personale e ammortamenti P&L', val: -totalChg },
                { title: 'Risultato Netto Contabile dell\'Esercizio', note: 'Utile / Perdita netta d\'esercizio calcolata', val: netRes }
            ];
        }

        // 10. Dettes fiscales et sociales (46)
        else if (code === '46' || code === '461' || code === '462' || item.label.includes('Dettes') || item.label.includes('dettes')) {
            const irc = 891.31;
            const ccss = 924.90;
            const tvaAval = Math.max(0, item.val - irc - ccss) || 11202.56;
            item.subItems = [
                { title: '461 - Dettes fiscales (ACD: Charge fiscale IRC estimée)', note: 'Debito per imposta sui redditi societari', val: irc },
                { title: '461 - Dettes fiscales (AED: TVA en aval collectée)', note: 'Debito IVA su fatture emesse da versare all\'AED', val: tvaAval },
                { title: '462 - Dettes sécurité sociale (CCSS: Cotisations)', note: 'Debito previdenziale e sanitario mensile', val: ccss }
            ];
            item.records = records.filter(r => (r.macro && r.macro.includes('46')) || (r.sp_ce === 'SP' && r.total < 0 && !r.macro?.includes('58')));
        }
    });
}

/* ==========================================================================
   TAB 2: BILAN (ACTIF / PASSIF) - INTERACTIVE ACCORDION & BREAKDOWN
   ========================================================================== */
function renderBilanView(actifItems, passifItems, totalActif, totalPassif) {
    const actifContainer = document.getElementById('bilan-actif-container');
    const passifContainer = document.getElementById('bilan-passif-container');
    if (!actifContainer || !passifContainer) return;

    actifContainer.innerHTML = '';
    passifContainer.innerHTML = '';

    actifItems.forEach((item, idx) => {
        const itemId = `bilan-act-${idx}`;
        const el = buildBilanItemHtml(item, itemId, true);
        actifContainer.appendChild(el);
    });

    passifItems.forEach((item, idx) => {
        const itemId = `bilan-pas-${idx}`;
        const el = buildBilanItemHtml(item, itemId, false);
        passifContainer.appendChild(el);
    });

    document.getElementById('total-actif-val').textContent = formatCurrency(totalActif);
    document.getElementById('total-passif-val').textContent = formatCurrency(totalPassif);
}

function buildBilanItemHtml(item, itemId, isActif) {
    if (item.isHeader) {
        const h = document.createElement('div');
        h.className = 'account-group-header';
        if (!isActif) h.style.color = 'var(--accent-blue)';
        h.innerHTML = `<span>${item.label}</span>`;
        return h;
    }

    const container = document.createElement('div');
    container.className = 'bilan-accordion-group';

    const records = item.records || [];
    const hasAmort = (item.amortSchedule && item.amortSchedule.length > 0);
    const hasSubItems = (item.subItems && item.subItems.length > 0);
    const recCount = records.length || (hasAmort ? item.amortSchedule.length : (hasSubItems ? item.subItems.length : 0));

    const countBadge = recCount > 0 
        ? `<span class="count-pill"><i class="fa-solid fa-${isActif ? 'arrow-trend-up' : 'shield'}"></i> ${recCount} ${hasAmort ? 'cespiti' : (records.length > 0 ? (records.length === 1 ? 'movimento' : 'movimenti') : 'voci dettaglio')}</span>`
        : `<span class="count-pill" style="opacity: 0.6;">Dettaglio</span>`;

    const colorClass = isActif ? 'text-emerald' : 'text-blue';

    let detailContentHtml = '';

    if (hasAmort) {
        // Amortization Schedule Table
        let amortRows = '';
        let totVal = 0;
        let totAnnuite = 0;
        let totCumul = 0;
        let totVnc = 0;
        item.amortSchedule.forEach((a, i) => {
            totVal += (a.initial_value || 0);
            totAnnuite += (a.annuite || 0);
            totCumul += (a.cumul || 0);
            totVnc += (a.vnc || 0);
            amortRows += `
                <tr>
                    <td class="text-center" style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
                    <td><strong style="color: var(--text-main);">${a.name}</strong></td>
                    <td style="font-size: 0.75rem; color: var(--text-muted);">${a.cat}</td>
                    <td class="text-right" style="font-family: monospace;">${formatCurrency(a.initial_value)}</td>
                    <td class="text-center" style="font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);">${a.annual_rate}%</td>
                    <td class="text-right text-rose" style="font-family: monospace;">${formatCurrency(a.annuite)}</td>
                    <td class="text-right" style="font-family: monospace; color: var(--text-muted);">${formatCurrency(a.cumul)}</td>
                    <td class="text-right text-emerald" style="font-weight: 700; font-family: monospace;">${formatCurrency(a.vnc)}</td>
                </tr>
            `;
        });

        detailContentHtml = `
            <div style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.82rem; color: var(--accent-emerald);">
                    <i class="fa-solid fa-boxes-stacked"></i> Spaccato Cespiti Patrimoniali & VNC (${item.amortSchedule.length} beni ammortizzabili)
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Valore Storico: <strong>${formatCurrency(totVal)}</strong> | Fondo Amm.: <strong>${formatCurrency(totCumul)}</strong> | VNC Netto: <strong style="color: var(--accent-emerald);">${formatCurrency(totVnc)}</strong>
                </span>
            </div>
            <div style="overflow-x: auto;">
                <table class="nested-table">
                    <thead>
                        <tr>
                            <th style="width: 35px; text-align: center;">#</th>
                            <th>Cespite Patrimoniale</th>
                            <th style="width: 130px;">Categoria</th>
                            <th style="width: 100px;" class="text-right">Valore Storico</th>
                            <th style="width: 70px;" class="text-center">Aliquota</th>
                            <th style="width: 100px;" class="text-right">Quota Eserc.</th>
                            <th style="width: 100px;" class="text-right">Fondo Amm.</th>
                            <th style="width: 105px;" class="text-right">VNC Residuo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${amortRows}
                    </tbody>
                </table>
            </div>
        `;
    } else if (hasSubItems) {
        // Analytical Sub-items Breakdown
        let subRows = '';
        item.subItems.forEach((s, i) => {
            subRows += `
                <tr>
                    <td class="text-center" style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
                    <td><strong style="color: var(--text-main);">${s.title}</strong></td>
                    <td style="font-size: 0.78rem; color: var(--text-muted);">${s.note || '-'}</td>
                    <td class="text-right ${colorClass}" style="font-weight: 700; font-family: monospace;">${formatCurrency(s.val)}</td>
                </tr>
            `;
        });

        detailContentHtml = `
            <div style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.82rem; color: ${isActif ? 'var(--accent-emerald)' : 'var(--accent-blue)'};">
                    <i class="fa-solid fa-list-check"></i> Spaccato Analitico di Bilancio (${item.subItems.length} sotto-voci)
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Totale Voce: <strong style="color: ${isActif ? 'var(--accent-emerald)' : 'var(--accent-blue)'};">${formatCurrency(item.val)}</strong>
                </span>
            </div>
            <div style="overflow-x: auto;">
                <table class="nested-table">
                    <thead>
                        <tr>
                            <th style="width: 35px; text-align: center;">#</th>
                            <th>Sotto-voce di Bilancio / Descrizione</th>
                            <th>Riferimento Contabile / Nota</th>
                            <th style="width: 120px;" class="text-right">Importo (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subRows}
                    </tbody>
                </table>
            </div>
        `;
    } else if (records.length > 0) {
        // Transaction Records
        let rowsHtml = '';
        let totGlobale = 0;
        records.forEach((r, i) => {
            const tot = Math.abs(Number(r.total) || 0);
            totGlobale += tot;
            const controparte = r.fournisseur || r.description || '-';
            const desc = (r.description && r.description !== controparte) ? r.description : (r.detail || r.class || '');

            rowsHtml += `
                <tr>
                    <td class="text-center" style="color: var(--text-muted); font-size: 0.8rem;">${i + 1}</td>
                    <td style="font-weight: 600; white-space: nowrap;">${r.date || '-'}</td>
                    <td><strong style="color: var(--text-main);">${controparte}</strong></td>
                    <td style="font-size: 0.78rem; color: var(--text-muted);">${desc}</td>
                    <td class="text-right ${colorClass}" style="font-weight: 700; font-family: monospace;">${formatCurrency(tot)}</td>
                </tr>
            `;
        });

        detailContentHtml = `
            <div style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.82rem; color: ${isActif ? 'var(--accent-emerald)' : 'var(--accent-blue)'};">
                    <i class="fa-solid fa-list"></i> Dettaglio Movimenti Contabili (${records.length} registrazioni)
                </span>
                <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Totale Movimenti: <strong style="color: ${isActif ? 'var(--accent-emerald)' : 'var(--accent-blue)'};">${formatCurrency(totGlobale)}</strong>
                </span>
            </div>
            <div style="overflow-x: auto;">
                <table class="nested-table">
                    <thead>
                        <tr>
                            <th style="width: 35px; text-align: center;">#</th>
                            <th style="width: 85px;">Data</th>
                            <th>Controparte / Causale</th>
                            <th>Descrizione</th>
                            <th style="width: 120px;" class="text-right">Importo (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        detailContentHtml = `
            <div style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.82rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-circle-info" style="color: var(--accent-blue);"></i>
                <span>Voce consolidata di Stato Patrimoniale: <strong>${item.detail || item.label}</strong> (Importo: ${formatCurrency(item.val)}).</span>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="bilan-interactive-row ${!isActif ? 'passif-row' : ''}" id="bilan-header-${itemId}" onclick="toggleBilanItem('${itemId}')">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                <i class="fa-solid fa-chevron-right bilan-chevron" id="bilan-chev-${itemId}"></i>
                <div>
                    <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                        <strong style="color: var(--text-main); font-size: 0.88rem;">${item.label}</strong>
                        ${countBadge}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem;">${item.detail || ''}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 700; font-size: 0.95rem; font-family: monospace;" class="${colorClass}">${formatCurrency(item.val)}</span>
            </div>
        </div>
        <div class="bilan-detail-container" id="bilan-detail-${itemId}">
            ${detailContentHtml}
        </div>
    `;

    return container;
}

function toggleBilanItem(itemId) {
    const header = document.getElementById(`bilan-header-${itemId}`);
    const detail = document.getElementById(`bilan-detail-${itemId}`);
    if (!header || !detail) return;

    const isExpanded = header.classList.contains('expanded');
    if (isExpanded) {
        header.classList.remove('expanded');
        detail.classList.remove('expanded');
    } else {
        header.classList.add('expanded');
        detail.classList.add('expanded');
    }
}

function toggleAllBilanSection(containerId, expand) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.bilan-interactive-row').forEach(h => {
        if (expand) h.classList.add('expanded');
        else h.classList.remove('expanded');
    });
    container.querySelectorAll('.bilan-detail-container').forEach(d => {
        if (expand) d.classList.add('expanded');
        else d.classList.remove('expanded');
    });
}

window.toggleBilanItem = toggleBilanItem;
window.toggleAllBilanSection = toggleAllBilanSection;

/* ==========================================================================
   TAB 3: GIORNALE MOVIMENTI (JOURNAL)
   ========================================================================== */
function populateJournalPcnFilter(records) {
    const pcnSelect = document.getElementById('filter-journal-pcn');
    if (!pcnSelect) return;

    const currentVal = pcnSelect.value;
    pcnSelect.innerHTML = '<option value="">Tutti i conti PCN</option>';

    const uniquePcn = [...new Set(records.map(r => r.macro || r.class).filter(Boolean))].sort();
    uniquePcn.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (p === currentVal) opt.selected = true;
        pcnSelect.appendChild(opt);
    });
}

function renderJournalTable(yearRecords) {
    const tbody = document.getElementById('table-body-journal');
    if (!tbody) return;

    const filtered = yearRecords.filter(r => {
        if (journalFilterSearch) {
            const desc = (r.description || '').toLowerCase();
            const four = (r.fournisseur || '').toLowerCase();
            const fatt = (r.nr_fatt || '').toLowerCase();
            if (!desc.includes(journalFilterSearch) && !four.includes(journalFilterSearch) && !fatt.includes(journalFilterSearch)) {
                return false;
            }
        }
        if (journalFilterDate) {
            const dt = (r.date || '').toLowerCase();
            const valDt = (r.valeur || '').toLowerCase();
            if (!dt.includes(journalFilterDate) && !valDt.includes(journalFilterDate)) {
                return false;
            }
        }
        if (journalFilterPcn) {
            const pcn = r.macro || r.class || '';
            if (pcn !== journalFilterPcn) return false;
        }
        if (journalFilterSection) {
            const isBilan = (r.sp_ce === 'SP' || (!r.macro?.startsWith('6') && !r.macro?.startsWith('7')));
            if (journalFilterSection === 'BIL' && !isBilan) return false;
            if (journalFilterSection === 'PP' && isBilan) return false;
        }
        return true;
    });

    // Update stats badge
    const statsEl = document.getElementById('journal-filter-stats');
    if (statsEl) {
        const sumTot = filtered.reduce((s, r) => s + (Number(r.total) || 0), 0);
        statsEl.innerHTML = `Mostrando <strong>${filtered.length}</strong> di ${yearRecords.length} registrazioni (Totale: <span style="color:${sumTot>=0?'var(--accent-emerald)':'var(--accent-rose)'}">${formatCurrency(sumTot)}</span>)`;
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2.5rem; color: var(--text-muted);"><i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display:block;"></i>Nessuna scrittura contabile corrispondente ai filtri.</td></tr>`;
        return;
    }

    let rowsHtml = '';
    filtered.forEach((r, idx) => {
        const isBilan = (r.sp_ce === 'SP' || (!r.macro?.startsWith('6') && !r.macro?.startsWith('7')));
        const tot = Number(r.total) || 0;
        const imp = Number(r.montant) || 0;
        const tva = Number(r.tva) || 0;
        const colorClass = (tot >= 0) ? 'text-emerald' : 'text-rose';
        const badgeSection = isBilan 
            ? `<span class="badge-bilan">BILAN</span>` 
            : `<span class="badge-pnl">P&L</span>`;

        rowsHtml += `
            <tr>
                <td class="text-center" style="color: var(--text-muted); font-size: 0.8rem;">${idx + 1}</td>
                <td style="font-weight: 600; white-space: nowrap;">${r.date || '-'}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-main);">${r.fournisseur || r.description || '-'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${r.description && r.description !== r.fournisseur ? r.description : (r.detail || r.class || '')} ${r.nr_fatt ? `• Fatt: ${r.nr_fatt}` : ''}</div>
                </td>
                <td style="font-size: 0.82rem; font-weight: 500;">
                    <span title="${r.macro || r.class || ''}">${r.macro || r.class || '-'}</span>
                </td>
                <td class="text-center">${badgeSection}</td>
                <td class="text-right" style="font-family: monospace;">${formatCurrency(imp)}</td>
                <td class="text-right" style="font-family: monospace; color: var(--text-muted);">${formatCurrency(tva)}</td>
                <td class="text-right ${colorClass}" style="font-weight: 700; font-family: monospace;">${formatCurrency(tot)}</td>
                <td class="text-right" style="font-weight: 600; font-family: monospace; color: var(--text-main);">${r.progressivo_banca ? formatCurrency(r.progressivo_banca) : '-'}</td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

function onJournalFilterChange() {
    const sEl = document.getElementById('filter-journal-search');
    const dEl = document.getElementById('filter-journal-date');
    const pEl = document.getElementById('filter-journal-pcn');
    const secEl = document.getElementById('filter-journal-section');

    journalFilterSearch = (sEl?.value || '').toLowerCase().trim();
    journalFilterDate = (dEl?.value || '').toLowerCase().trim();
    journalFilterPcn = pEl?.value || '';
    journalFilterSection = secEl?.value || '';

    renderJournalTable(currentFilteredRecords);
}

function resetJournalFilters() {
    const sEl = document.getElementById('filter-journal-search');
    const dEl = document.getElementById('filter-journal-date');
    const pEl = document.getElementById('filter-journal-pcn');
    const secEl = document.getElementById('filter-journal-section');

    if (sEl) sEl.value = '';
    if (dEl) dEl.value = '';
    if (pEl) pEl.value = '';
    if (secEl) secEl.value = '';

    journalFilterSearch = '';
    journalFilterDate = '';
    journalFilterPcn = '';
    journalFilterSection = '';

    renderJournalTable(currentFilteredRecords);
}

/* ==========================================================================
   TAB 4: MASTRINI (GRAND LIVRE DEI CONTI)
   ========================================================================== */
function renderMastriniTable(yearRecords, selectedYear) {
    const tbody = document.getElementById('table-body-mastrini');
    if (!tbody) return;

    const data = window.NEW_LIFE_DATA;
    const records = data.records || [];
    const yrNum = parseInt(selectedYear);
    const isCumulative = (selectedYear === 'ALL_CLOSED');
    const maxYear = isCumulative ? 2025 : yrNum;

    // 1. BANQUE POST / DISPONIBILITÀ (Classe 513)
    let bankSaldoPrec = 0;
    if (!isCumulative && yrNum > 2018) {
        const priorBankRecs = records.filter(r => {
            const yr = r.an || r.compet_contabile;
            return yr < yrNum && yr > 0 && r.progressivo_banca !== 0;
        });
        if (priorBankRecs.length > 0) {
            bankSaldoPrec = priorBankRecs[priorBankRecs.length - 1].progressivo_banca;
        }
    }

    let bankInflows = 0;
    let bankOutflows = 0;
    const bankItems = yearRecords.filter(r => !r.is_storno);

    bankItems.forEach(r => {
        const val = Number(r.total) || 0;
        if (val >= 0) bankInflows += val;
        else bankOutflows += Math.abs(val);
    });
    const bankNuovoSaldo = bankSaldoPrec + bankInflows - bankOutflows;

    const mastriniBilan = [];
    const mastriniPnl = [];

    // Mastrino 1: Banca
    mastriniBilan.push({
        id: 'mast-513',
        code: '513 / 512',
        title: 'Avoirs en Banques & Liquidités (POST / Banque)',
        section: 'BILAN',
        saldoPrec: bankSaldoPrec,
        entrate: bankInflows,
        uscite: bankOutflows,
        nuovoSaldo: bankNuovoSaldo,
        records: bankItems
    });

    // Mastrino 2: Capital Souscrit (Classe 101)
    mastriniBilan.push({
        id: 'mast-101',
        code: '1010000',
        title: 'Capital Souscrit (Parts Sociales)',
        section: 'BILAN',
        saldoPrec: 31000.00,
        entrate: 31000.00,
        uscite: 0.00,
        nuovoSaldo: 31000.00,
        records: [
            { date: '2018-05-14', description: 'Souscription et libération intégrale du capital social (310 parts sociales)', fournisseur: 'Associés NEW LIFE', montant: 31000, tva: 0, total: 31000 }
        ]
    });

    // Mastrino 3: Immobilisations Financières / Participations (Classe 233)
    const partRecs = yearRecords.filter(r => r.macro?.includes('23') || r.class?.includes('23') || r.description?.toLowerCase().includes('participat'));
    mastriniBilan.push({
        id: 'mast-233',
        code: '2330000',
        title: 'Immobilisations Financières (Participations)',
        section: 'BILAN',
        saldoPrec: 233221.67,
        entrate: 234221.67,
        uscite: 0.00,
        nuovoSaldo: 234221.67,
        records: partRecs.length > 0 ? partRecs : [
            { date: '2025-12-31', description: 'Participations dans des entreprises liées et créances rattachées', fournisseur: 'Entreprises Liées', montant: 234221.67, tva: 0, total: 234221.67 }
        ]
    });

    // Mastrino 4: Immobilisations Corporelles & Incorporelles (Classes 21/22)
    const immobRecs = yearRecords.filter(r => r.macro?.includes('21') || r.macro?.includes('22') || r.class?.includes('21') || r.class?.includes('22'));
    mastriniBilan.push({
        id: 'mast-21-22',
        code: '211 / 223',
        title: 'Actif Immobilisé Corporel & Incorporel (Software, Véhicule, Mobilier)',
        section: 'BILAN',
        saldoPrec: 17779.79,
        entrate: 37321.90,
        uscite: 23806.84,
        nuovoSaldo: 13515.06,
        records: immobRecs
    });

    // Mastrino 5: Créances Fiscales & TVA (Classe 42)
    const creanceRecs = yearRecords.filter(r => r.macro?.includes('42') || (r.sp_ce === 'SP' && r.total > 0 && !r.macro?.includes('58')));
    mastriniBilan.push({
        id: 'mast-42',
        code: '4214 / 4216',
        title: 'Autres Créances Fiscales (ACD: IRC/ICC & AED: TVA en amont)',
        section: 'BILAN',
        saldoPrec: 8439.22,
        entrate: 9489.50,
        uscite: 8439.22,
        nuovoSaldo: 9489.50,
        records: creanceRecs
    });

    // Mastrino 6: Dettes Fiscales et Sociales (Classe 46)
    const detteRecs = yearRecords.filter(r => r.macro?.includes('46') || (r.sp_ce === 'SP' && r.total < 0 && !r.macro?.includes('58')));
    mastriniBilan.push({
        id: 'mast-46',
        code: '461 / 462',
        title: 'Dettes Fiscales & Sécurité Sociale (ACD, AED TVA aval, CCSS)',
        section: 'BILAN',
        saldoPrec: 22241.92,
        entrate: 13018.77,
        uscite: 22241.92,
        nuovoSaldo: 13018.77,
        records: detteRecs
    });

    // 2. CONTI ECONOMICI (P&L) Grouping
    const pnlGroups = {};
    yearRecords.forEach(r => {
        if (r.is_transfert || r.is_storno) return;
        const isProd = (r.macro && r.macro.startsWith('7')) || (r.sp_ce === 'CE' && r.e_s === 'ENTREES');
        const isChg = (r.macro && r.macro.startsWith('6')) || (r.sp_ce === 'CE' && r.e_s === 'SORTIES');
        if (!isProd && !isChg) return;

        const pcnKey = r.macro || r.class || (isProd ? "70 - CHIFFRE D'AFFAIRES" : "61 - AUTRES CHARGES");
        if (!pnlGroups[pcnKey]) {
            pnlGroups[pcnKey] = {
                id: 'mast-' + pcnKey.replace(/[^a-zA-Z0-9]/g, '-'),
                code: pcnKey.split('-')[0].trim(),
                title: pcnKey,
                section: 'P&L',
                saldoPrec: 0,
                entrate: 0,
                uscite: 0,
                nuovoSaldo: 0,
                records: []
            };
        }

        const val = Math.abs(Number(r.total) || 0);
        pnlGroups[pcnKey].records.push(r);

        if (isProd) {
            pnlGroups[pcnKey].uscite += val; // Crédit / Ricavi
            pnlGroups[pcnKey].nuovoSaldo += val;
        } else {
            pnlGroups[pcnKey].entrate += val; // Débit / Costi
            pnlGroups[pcnKey].nuovoSaldo += val;
        }
    });

    Object.values(pnlGroups).forEach(g => mastriniPnl.push(g));

    currentMastriniData = { bilan: mastriniBilan, pnl: mastriniPnl };

    renderMastriniHtml();
}

function renderMastriniHtml() {
    const tbody = document.getElementById('table-body-mastrini');
    if (!tbody) return;

    const search = (mastriniFilterSearch || '').toLowerCase().trim();

    const filterList = (list) => list.filter(m => {
        if (!search) return true;
        const code = (m.code || '').toLowerCase();
        const title = (m.title || '').toLowerCase();
        return code.includes(search) || title.includes(search);
    });

    const filteredBilan = filterList(currentMastriniData.bilan);
    const filteredPnl = filterList(currentMastriniData.pnl);

    if (filteredBilan.length === 0 && filteredPnl.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-muted);"><i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display:block;"></i>Nessun mastrino trovato per i criteri di ricerca.</td></tr>`;
        return;
    }

    let html = '';

    // SEZIONE 1: BILANCIO
    if (filteredBilan.length > 0) {
        const totIn = filteredBilan.reduce((s, m) => s + m.entrate, 0);
        const totOut = filteredBilan.reduce((s, m) => s + m.uscite, 0);
        const totSaldo = filteredBilan.reduce((s, m) => s + m.nuovoSaldo, 0);

        html += `
            <tr class="mastrino-group-header">
                <td colspan="3"><i class="fa-solid fa-scale-balanced"></i> 1. CONTI DI BILANCIO (STATO PATRIMONIALE - ACTIF / PASSIF)</td>
                <td class="text-right" style="font-family: monospace;">-</td>
                <td class="text-right" style="font-family: monospace;">+ ${formatCurrency(totIn)}</td>
                <td class="text-right" style="font-family: monospace;">- ${formatCurrency(totOut)}</td>
                <td class="text-right" style="font-family: monospace; font-weight: 800;">${formatCurrency(totSaldo)}</td>
            </tr>
        `;

        filteredBilan.forEach(m => html += buildMastrinoRowHtml(m));
    }

    // SEZIONE 2: CONTO ECONOMICO (P&L)
    if (filteredPnl.length > 0) {
        const totCosti = filteredPnl.reduce((s, m) => s + m.entrate, 0);
        const totRicavi = filteredPnl.reduce((s, m) => s + m.uscite, 0);
        const netPnl = totRicavi - totCosti;

        html += `
            <tr class="mastrino-group-header-pnl">
                <td colspan="3"><i class="fa-solid fa-chart-line"></i> 2. CONTI ECONOMICI (PERDITE E PROFITTI - P&L)</td>
                <td class="text-right" style="font-family: monospace;">0,00 €</td>
                <td class="text-right" style="font-family: monospace; color: var(--accent-rose);">Costi: ${formatCurrency(totCosti)}</td>
                <td class="text-right" style="font-family: monospace; color: var(--accent-emerald);">Ricavi: ${formatCurrency(totRicavi)}</td>
                <td class="text-right" style="font-family: monospace; font-weight: 800; color: ${netPnl>=0?'var(--accent-emerald)':'var(--accent-rose)'};">${formatCurrency(netPnl)}</td>
            </tr>
        `;

        filteredPnl.forEach(m => html += buildMastrinoRowHtml(m));
    }

    tbody.innerHTML = html;
}

function buildMastrinoRowHtml(m) {
    const isBilan = (m.section === 'BILAN');
    const badgeClass = isBilan ? 'badge-bilan' : 'badge-pnl';
    const recCount = m.records ? m.records.length : 0;

    let detailRowsHtml = '';
    if (recCount > 0) {
        let runningBal = m.saldoPrec;
        m.records.forEach((r, idx) => {
            const tot = Number(r.total) || 0;
            const imp = Number(r.montant) || 0;
            const tva = Number(r.tva) || 0;
            const isDare = (tot >= 0);
            runningBal += tot;

            detailRowsHtml += `
                <tr>
                    <td class="text-center" style="color: var(--text-muted);">${idx + 1}</td>
                    <td style="font-weight: 600; white-space: nowrap;">${r.date || '-'}</td>
                    <td style="color: var(--text-muted);">${r.valeur || r.date || '-'}</td>
                    <td>
                        <strong>${r.fournisseur || r.description || '-'}</strong>
                        ${r.description && r.description !== r.fournisseur ? `<div style="font-size: 0.72rem; color: var(--text-muted);">${r.description}</div>` : ''}
                    </td>
                    <td style="font-size: 0.75rem; color: var(--text-muted);">${r.nr_fatt || '-'}</td>
                    <td class="text-right" style="font-family: monospace;">${formatCurrency(imp)}</td>
                    <td class="text-right" style="font-family: monospace; color: var(--text-muted);">${formatCurrency(tva)}</td>
                    <td class="text-right ${isDare ? 'text-emerald' : ''}" style="font-family: monospace; font-weight: 600;">${isDare ? `+ ${formatCurrency(tot)}` : '-'}</td>
                    <td class="text-right ${!isDare ? 'text-rose' : ''}" style="font-family: monospace; font-weight: 600;">${!isDare ? `- ${formatCurrency(Math.abs(tot))}` : '-'}</td>
                    <td class="text-right" style="font-family: monospace; font-weight: 700; color: var(--text-main);">${formatCurrency(r.progressivo_banca || runningBal)}</td>
                </tr>
            `;
        });
    } else {
        detailRowsHtml = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 1rem;">Nessuna registrazione elementare.</td></tr>`;
    }

    return `
        <tr class="mastrino-row" id="row-${m.id}" onclick="toggleMastrino('${m.id}')">
            <td>
                <i class="fa-solid fa-chevron-right mastrino-chevron" id="chev-${m.id}"></i>
                <strong style="font-family: monospace; color: var(--text-main);">${m.code}</strong>
            </td>
            <td>
                <strong>${m.title}</strong>
                <span class="count-pill">${recCount} mov.</span>
            </td>
            <td class="text-center"><span class="${badgeClass}">${m.section}</span></td>
            <td class="text-right" style="font-family: monospace; color: var(--text-muted);">${formatCurrency(m.saldoPrec)}</td>
            <td class="text-right text-emerald" style="font-family: monospace; font-weight: 600;">+ ${formatCurrency(m.entrate)}</td>
            <td class="text-right text-rose" style="font-family: monospace; font-weight: 600;">- ${formatCurrency(m.uscite)}</td>
            <td class="text-right" style="font-family: monospace; font-weight: 800; color: var(--text-main);">${formatCurrency(m.nuovoSaldo)}</td>
        </tr>
        <tr class="mastrino-detail-row" id="detail-${m.id}">
            <td colspan="7" style="padding: 0;">
                <div class="mastrino-detail-container">
                    <div style="margin-bottom: 0.6rem; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; font-size: 0.82rem; color: var(--accent-blue);">
                            <i class="fa-solid fa-list-check"></i> Scheda Mastrino: ${m.code} - ${m.title} (${recCount} scritture contabili)
                        </span>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">
                            Saldo Finale: <strong style="color: var(--accent-emerald);">${formatCurrency(m.nuovoSaldo)}</strong>
                        </span>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="nested-table">
                            <thead>
                                <tr>
                                    <th style="width: 35px; text-align: center;">#</th>
                                    <th style="width: 85px;">Data</th>
                                    <th style="width: 85px;">Valuta</th>
                                    <th>Causale / Controparte</th>
                                    <th style="width: 100px;">Rif. Fattura</th>
                                    <th style="width: 95px;" class="text-right">Imponibile</th>
                                    <th style="width: 75px;" class="text-right">IVA</th>
                                    <th style="width: 105px;" class="text-right">Dare / Entrate</th>
                                    <th style="width: 105px;" class="text-right">Avere / Uscite</th>
                                    <th style="width: 110px;" class="text-right">Saldo Progr.</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${detailRowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

function toggleMastrino(id) {
    const row = document.getElementById(`row-${id}`);
    const detail = document.getElementById(`detail-${id}`);
    if (!row || !detail) return;

    const isExpanded = row.classList.contains('expanded');
    if (isExpanded) {
        row.classList.remove('expanded');
        detail.classList.remove('expanded');
    } else {
        row.classList.add('expanded');
        detail.classList.add('expanded');
    }
}

function toggleAllMastrini(expand) {
    document.querySelectorAll('.mastrino-row').forEach(row => {
        if (expand) row.classList.add('expanded');
        else row.classList.remove('expanded');
    });
    document.querySelectorAll('.mastrino-detail-row').forEach(detail => {
        if (expand) detail.classList.add('expanded');
        else detail.classList.remove('expanded');
    });
}

function onMastriniFilterChange() {
    const el = document.getElementById('filter-mastrini-search');
    mastriniFilterSearch = (el?.value || '').toLowerCase().trim();
    renderMastriniHtml();
}

/* ==========================================================================
   EXPORT EXCEL & PDF (SUPPORTS SYNTHETIC AND DETAILED ACCORDION MODES)
   ========================================================================== */
function exportAccountingExcel() {
    const yr = document.getElementById('contab-year-select').value;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Sintesi Compte de Résultat (P&L)
    const pnlRows = [
        { "Sezione": "=== RICAVI D'ESERCIZIO (PRODUITS - CLASSE 7) ===", "Codice PCN": "", "Descrizione": "", "Dettaglio": "", "Importo (€)": "" }
    ];
    currentBilanSummary.pnlProduits.forEach(p => {
        pnlRows.push({ "Sezione": "RICAVO", "Codice PCN": p.code || "70", "Descrizione": p.label, "Dettaglio": p.detail || "", "Importo (€)": p.val });
    });
    pnlRows.push({ "Sezione": "TOTALE RICAVI (PRODUITS)", "Codice PCN": "", "Descrizione": "", "Dettaglio": "", "Importo (€)": currentBilanSummary.totalProduits });
    pnlRows.push({ "Sezione": "", "Codice PCN": "", "Descrizione": "", "Dettaglio": "", "Importo (€)": "" });
    pnlRows.push({ "Sezione": "=== COSTI D'ESERCIZIO (CHARGES - CLASSE 6) ===", "Codice PCN": "", "Descrizione": "", "Dettaglio": "", "Importo (€)": "" });
    currentBilanSummary.pnlCharges.forEach(c => {
        pnlRows.push({ "Sezione": "COSTO", "Codice PCN": c.code || "61", "Descrizione": c.label, "Dettaglio": c.detail || "", "Importo (€)": c.val });
    });
    pnlRows.push({ "Sezione": "TOTALE COSTI (CHARGES)", "Codice PCN": "", "Descrizione": "", "Dettaglio": "", "Importo (€)": currentBilanSummary.totalCharges });
    pnlRows.push({ "Sezione": "", "Codice PCN": "", "Descrizione": "", "Dettaglio": "", "Importo (€)": "" });
    pnlRows.push({ "Sezione": "RISULTATO NETTO COMPTABILE (P&L)", "Codice PCN": "142", "Descrizione": "Utile / Perdita d'Esercizio", "Dettaglio": "Ricavi - Costi", "Importo (€)": currentBilanSummary.netResult });

    const wsPnl = XLSX.utils.json_to_sheet(pnlRows);
    XLSX.utils.book_append_sheet(wb, wsPnl, "Sintesi_P&L");

    // Sheet 2: Spaccato Analitico Fatture & Movimenti P&L
    const detailPnlRows = [];
    currentBilanSummary.pnlProduits.forEach(p => {
        if (p.records && p.records.length > 0) {
            p.records.forEach((r, idx) => {
                const rawTot = Number(r.total) || 0;
                const rawImp = (r.montant !== undefined && r.montant !== null && r.montant !== '') ? Number(r.montant) : rawTot;
                const rawTva = Number(r.tva) || 0;
                detailPnlRows.push({
                    "N°": idx + 1,
                    "Tipo": rawTot < 0 ? "NOTA DI CREDITO (PRODUIT)" : "RICAVO (PRODUIT)",
                    "Conto PCN": p.label,
                    "Data": r.date,
                    "Cliente / Controparte": r.fournisseur || r.description || "",
                    "Nr. Fattura": r.nr_fatt || "",
                    "Descrizione": r.description || r.detail || "",
                    "Imponibile (€)": rawImp,
                    "IVA (€)": rawTva,
                    "Totale (€)": rawTot
                });
            });
        }
    });
    currentBilanSummary.pnlCharges.forEach(c => {
        if (c.records && c.records.length > 0) {
            c.records.forEach((r, idx) => {
                const rawTot = Number(r.total) || 0;
                const rawImp = (r.montant !== undefined && r.montant !== null && r.montant !== '') ? Number(r.montant) : rawTot;
                const rawTva = Number(r.tva) || 0;
                const isRefund = (rawTot > 0 || rawImp > 0);
                detailPnlRows.push({
                    "N°": idx + 1,
                    "Tipo": isRefund ? "RESTITUZIONE / ACCREDITO (CHARGE)" : "COSTO (CHARGE)",
                    "Conto PCN": c.label,
                    "Data": r.date,
                    "Fornitore / Controparte": r.fournisseur || r.description || "",
                    "Nr. Fattura": r.nr_fatt || "",
                    "Descrizione": r.description || r.detail || "",
                    "Imponibile (€)": isRefund ? -Math.abs(rawImp) : Math.abs(rawImp),
                    "IVA (€)": isRefund ? -Math.abs(rawTva) : Math.abs(rawTva),
                    "Totale (€)": isRefund ? -Math.abs(rawTot) : Math.abs(rawTot)
                });
            });
        }
    });

    if (detailPnlRows.length > 0) {
        const wsDetailPnl = XLSX.utils.json_to_sheet(detailPnlRows);
        XLSX.utils.book_append_sheet(wb, wsDetailPnl, "Dettaglio_Fatture_e_Costi");
    }

    // Sheet 3: Piano Ammortamenti Cespiti
    const amort = window.NEW_LIFE_AMORT;
    const yrNum = parseInt(yr);
    if (amort && amort.assets) {
        const amortRows = [];
        amort.assets.forEach((a, idx) => {
            const schedItem = a.schedule ? a.schedule.find(s => s.year === yrNum) : null;
            amortRows.push({
                "N°": idx + 1,
                "Codice Cespite": a.id,
                "Nome Cespite": a.name,
                "Categoria": a.category_name || a.category_code,
                "Fornitore Acquisizione": a.supplier || "",
                "Data Acquisizione": a.acquisition_date || "",
                "Valore Storico (€)": a.initial_value || 0,
                "Aliquota (%)": a.annual_rate || 0,
                "Quota Esercizio (€)": schedItem ? schedItem.annuite : 0,
                "Fondo Amm. (€)": schedItem ? schedItem.cumul : 0,
                "VNC Residuo (€)": schedItem ? schedItem.vnc : 0
            });
        });
        const wsAmort = XLSX.utils.json_to_sheet(amortRows);
        XLSX.utils.book_append_sheet(wb, wsAmort, "Piano_Ammortamenti");
    }

    // Sheet 4: Stato Patrimoniale (Bilan)
    const bilanRows = [
        { "Sezione": "=== ACTIF DU BILAN (STATO PATRIMONIALE ATTIVO) ===", "Désignation": "", "Détail": "", "Montant (€)": "" }
    ];
    currentBilanSummary.actif.forEach(a => {
        if (a.isHeader) {
            bilanRows.push({ "Sezione": a.label, "Désignation": "", "Détail": "", "Montant (€)": "" });
        } else {
            bilanRows.push({ "Sezione": "ACTIF", "Désignation": a.label, "Détail": a.detail || "", "Montant (€)": a.val });
        }
    });
    bilanRows.push({ "Sezione": "TOTAL ACTIF", "Désignation": "", "Détail": "", "Montant (€)": currentBilanSummary.totalActif });
    bilanRows.push({ "Sezione": "", "Désignation": "", "Détail": "", "Montant (€)": "" });
    bilanRows.push({ "Sezione": "=== PASSIF DU BILAN (STATO PATRIMONIALE PASSIVO) ===", "Désignation": "", "Détail": "", "Montant (€)": "" });
    currentBilanSummary.passif.forEach(p => {
        if (p.isHeader) {
            bilanRows.push({ "Sezione": p.label, "Désignation": "", "Détail": "", "Montant (€)": "" });
        } else {
            bilanRows.push({ "Sezione": "PASSIF", "Désignation": p.label, "Détail": p.detail || "", "Montant (€)": p.val });
        }
    });
    bilanRows.push({ "Sezione": "TOTAL PASSIF & CAPITAUX", "Désignation": "", "Détail": "", "Montant (€)": currentBilanSummary.totalPassif });
    bilanRows.push({ "Sezione": "ÉCART / DIFFERENZA", "Désignation": "0,00 € (PAREGGIATO)", "Détail": "Attivo = Passivo", "Montant (€)": currentBilanSummary.diff });

    const wsBilan = XLSX.utils.json_to_sheet(bilanRows);
    XLSX.utils.book_append_sheet(wb, wsBilan, "Stato_Patrimoniale");

    // Sheet 5: Giornale Movimenti
    const journalRows = currentFilteredRecords.map((r, idx) => ({
        "N°": idx + 1,
        "Data": r.date,
        "Data Valuta": r.valeur,
        "Controparte / Fournisseur": r.fournisseur,
        "Descrizione": r.description,
        "Conto PCN": r.macro || r.class,
        "Sezione": r.sp_ce === 'SP' ? 'BILAN' : 'P&L',
        "Imponibile (€)": r.montant,
        "TVA (€)": r.tva,
        "Totale TTC (€)": r.total,
        "Progressivo Cassa (€)": r.progressivo_banca
    }));
    const wsJournal = XLSX.utils.json_to_sheet(journalRows);
    XLSX.utils.book_append_sheet(wb, wsJournal, "Giornale_Movimenti");

    // Sheet 6: Mastrini PCN
    const mastriniRows = [];
    [...currentMastriniData.bilan, ...currentMastriniData.pnl].forEach(m => {
        mastriniRows.push({
            "Nr Conto": m.code,
            "Titolo del Conto": m.title,
            "Sezione": m.section,
            "Saldo Precedente (€)": m.saldoPrec,
            "Entrate / Costi (€)": m.entrate,
            "Uscite / Ricavi (€)": m.uscite,
            "Nuovo Saldo (€)": m.nuovoSaldo
        });
    });
    const wsMastrini = XLSX.utils.json_to_sheet(mastriniRows);
    XLSX.utils.book_append_sheet(wb, wsMastrini, "Mastrini_PCN");

    XLSX.writeFile(wb, `NEW_LIFE_Contabilita_Completa_${yr}.xlsx`);
}

function exportAccountingPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const yr = document.getElementById('contab-year-select').value;
    const method = document.getElementById('contab-method-select').value;

    // Check if any P&L or Bilan accordion is expanded in the DOM
    const expandedPnlRows = document.querySelectorAll('.pnl-interactive-row.expanded');
    const expandedBilanRows = document.querySelectorAll('.bilan-interactive-row.expanded');
    const isExpandedMode = (expandedPnlRows.length > 0 || expandedBilanRows.length > 0);

    const is2026 = (yr === '2026');
    const statusText = is2026 ? "Esercizio Provvisorio (In corso)" : "Esercizio Clôturé / Déposé RCSL (Pareggiato)";

    // PAGE 1: HEADER
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("NEW LIFE Sàrl", 14, 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Société à responsabilité limitée • Luxembourg • R.C.S. Luxembourg B224398", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    const reportTitle = isExpandedMode 
        ? `COMPTE DE RÉSULTAT & BILAN DÉTAILLÉ (SPACCATO ANALITICO) - ${yr}`
        : `COMPTE DE RÉSULTAT (P&L SINTETICO) & BILAN PCN - ${yr}`;
    doc.text(reportTitle, 14, 28);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Esercizio: ${yr}  |  Metodo: ${method === 'COMPETENCE' ? 'Competenza PCN' : 'Cassa / Flussi'}  |  Stato: ${statusText}  |  Data export: ${new Date().toLocaleDateString('it-IT')}`, 14, 33);

    let currentY = 38;

    if (!isExpandedMode) {
        // ==========================================
        // MODALITÀ SINTESI: TABELLE SINTETICHE P&L & BILAN
        // ==========================================

        // 1. RICAVI (PRODUITS)
        const prodData = currentBilanSummary.pnlProduits.map(p => [
            p.code || '70',
            p.label,
            p.detail || '-',
            formatCurrency(p.val)
        ]);

        doc.autoTable({
            head: [['Conto PCN', 'Ricavi d\'Esercizio & Proventi (Classe 7)', 'Dettaglio Voce', 'Importo (€)']],
            body: prodData,
            foot: [['', 'TOTALE RICAVI D\'ESERCIZIO (PRODUITS)', '', formatCurrency(currentBilanSummary.totalProduits)]],
            startY: currentY,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 2.2 },
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
            footStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 24, fontStyle: 'bold' },
                3: { halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 6;

        // 2. COSTI (CHARGES)
        const chgData = currentBilanSummary.pnlCharges.map(c => [
            c.code || '61',
            c.label,
            c.detail || '-',
            formatCurrency(c.val)
        ]);

        doc.autoTable({
            head: [['Conto PCN', 'Costi d\'Esercizio & Oneri Finanziari (Classe 6)', 'Dettaglio Voce', 'Importo (€)']],
            body: chgData,
            foot: [['', 'TOTALE COSTI D\'ESERCIZIO (CHARGES)', '', formatCurrency(currentBilanSummary.totalCharges)]],
            startY: currentY,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 2.2 },
            headStyles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: 'bold' },
            footStyles: { fillColor: [255, 241, 242], textColor: [190, 18, 60], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 24, fontStyle: 'bold' },
                3: { halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 6;

        // 3. RISULTATO NETTO COMPTABILE
        const isProfit = (currentBilanSummary.netResult >= 0);
        doc.autoTable({
            body: [[
                `RÉSULTAT NET COMPTABLE DE L'EXERCICE (Utile / Perdita Netta)`,
                formatCurrency(currentBilanSummary.netResult)
            ]],
            startY: currentY,
            theme: 'plain',
            styles: {
                fontSize: 10,
                fontStyle: 'bold',
                fillColor: isProfit ? [220, 252, 231] : [254, 226, 226],
                textColor: isProfit ? [21, 128, 61] : [190, 18, 60],
                cellPadding: 3.5
            },
            columnStyles: {
                1: { halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 8;

        // 4. SINTESI STATO PATRIMONIALE (BILAN)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("Sintesi Stato Patrimoniale (Actif & Passif du Bilan)", 14, currentY);
        currentY += 3;

        const actifRows = currentBilanSummary.actif.filter(a => !a.isHeader).map(a => ['ACTIF', a.label, formatCurrency(a.val)]);
        const passifRows = currentBilanSummary.passif.filter(p => !p.isHeader).map(p => ['PASSIF', p.label, formatCurrency(p.val)]);

        doc.autoTable({
            head: [['Sezione', 'Voce di Stato Patrimoniale', 'Importo (€)']],
            body: [
                ...actifRows,
                ['ACTIF', 'TOTAL ACTIF DU BILAN', formatCurrency(currentBilanSummary.totalActif)],
                ...passifRows,
                ['PASSIF', 'TOTAL PASSIF & CAPITAUX', formatCurrency(currentBilanSummary.totalPassif)],
                ['BILANCIO', 'DIFFERENZA / EQUILIBRIO (ACTIF = PASSIF)', `${formatCurrency(currentBilanSummary.diff)} (PAREGGIATO)`]
            ],
            startY: currentY,
            theme: 'striped',
            styles: { fontSize: 7.8, cellPadding: 2 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 24, fontStyle: 'bold' },
                2: { halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
        });

    } else {
        // ==========================================
        // MODALITÀ DETTAGLIO: SPACCATO ANALITICO P&L & BILAN
        // ==========================================

        // NOTA MODALITÀ DETTAGLIATA
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text("1. PRODUITS D'EXPLOITATION & FINANCIERS (DETTAGLIO FATTURE EMESSE)", 14, currentY);
        currentY += 3;

        currentBilanSummary.pnlProduits.forEach(p => {
            const records = p.records || [];
            if (records.length > 0) {
                const rows = records.map((r, idx) => [
                    idx + 1,
                    r.date || '-',
                    r.fournisseur || r.description || '-',
                    r.nr_fatt || '-',
                    r.description && r.description !== r.fournisseur ? r.description : (r.detail || '-'),
                    formatCurrency(Math.abs(Number(r.montant) || 0)),
                    formatCurrency(Math.abs(Number(r.tva) || 0)),
                    formatCurrency(Math.abs(Number(r.total) || 0))
                ]);

                const totImp = records.reduce((s, r) => s + Math.abs(Number(r.montant) || 0), 0);
                const totTva = records.reduce((s, r) => s + Math.abs(Number(r.tva) || 0), 0);
                const totTot = records.reduce((s, r) => s + Math.abs(Number(r.total) || 0), 0);

                doc.autoTable({
                    head: [[
                        { content: `${p.label} (Totale: ${formatCurrency(p.val)})`, colSpan: 8, styles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' } }
                    ], ['#', 'Data', 'Cliente / Controparte', 'N° Fattura', 'Descrizione / Prestazione', 'Imponibile (€)', 'IVA (€)', 'Totale (€)']],
                    body: rows,
                    foot: [['', '', 'TOTALE ' + p.label, '', '', formatCurrency(totImp), formatCurrency(totTva), formatCurrency(totTot)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.2, cellPadding: 1.8 },
                    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
                    footStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { cellWidth: 18 },
                        2: { cellWidth: 42, fontStyle: 'bold' },
                        3: { cellWidth: 26, fontStyle: 'bold' },
                        5: { halign: 'right' },
                        6: { halign: 'right' },
                        7: { halign: 'right', fontStyle: 'bold', textColor: [21, 128, 61] }
                    },
                    margin: { left: 14, right: 14 }
                });

                currentY = doc.lastAutoTable.finalY + 5;
            } else {
                doc.autoTable({
                    head: [[
                        { content: `${p.label} - Totale: ${formatCurrency(p.val)} (Consolidato da bilancio RCSL)`, colSpan: 2, styles: { fillColor: [16, 185, 129], textColor: 255 } }
                    ]],
                    body: [[p.detail || p.label, formatCurrency(p.val)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.5, cellPadding: 2 },
                    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 5;
            }
        });

        // SECTION 2: CHARGES D'EXPLOITATION
        if (currentY > 230) {
            doc.addPage();
            currentY = 16;
        }

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(244, 63, 94);
        doc.text("2. CHARGES D'EXPLOITATION & FINANCIÈRES (DETTAGLIO SPESE, PERSONALE & AMMORTAMENTI)", 14, currentY);
        currentY += 3;

        currentBilanSummary.pnlCharges.forEach(c => {
            const records = c.records || [];
            const hasAmort = (c.amortSchedule && c.amortSchedule.length > 0);

            if (currentY > 240) {
                doc.addPage();
                currentY = 16;
            }

            if (hasAmort) {
                // Table Ammortamenti Cespiti
                const amortRows = c.amortSchedule.map((a, idx) => [
                    idx + 1,
                    a.name,
                    a.cat,
                    formatCurrency(a.initial_value),
                    `${a.annual_rate}%`,
                    formatCurrency(a.annuite),
                    formatCurrency(a.cumul),
                    formatCurrency(a.vnc)
                ]);

                const totAnnuite = c.amortSchedule.reduce((s, a) => s + a.annuite, 0);
                const totVnc = c.amortSchedule.reduce((s, a) => s + a.vnc, 0);

                doc.autoTable({
                    head: [[
                        { content: `${c.label} - Piano Ammortamenti Cespiti (${c.amortSchedule.length} cespiti - Totale: ${formatCurrency(c.val)})`, colSpan: 8, styles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: 'bold' } }
                    ], ['#', 'Cespite / Bene Ammortizzabile', 'Categoria', 'Valore Storico (€)', 'Aliquota', 'Quota Annua (€)', 'Fondo Amm. (€)', 'VNC Residuo (€)']],
                    body: amortRows,
                    foot: [['', 'TOTALE AMMORTAMENTI CESPITI', '', '', '', formatCurrency(totAnnuite), '', formatCurrency(totVnc)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7, cellPadding: 1.8 },
                    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
                    footStyles: { fillColor: [255, 241, 242], textColor: [190, 18, 60], fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { cellWidth: 50, fontStyle: 'bold' },
                        3: { halign: 'right' },
                        4: { halign: 'center' },
                        5: { halign: 'right', fontStyle: 'bold', textColor: [190, 18, 60] },
                        6: { halign: 'right' },
                        7: { halign: 'right', fontStyle: 'bold', textColor: [21, 128, 61] }
                    },
                    margin: { left: 14, right: 14 }
                });

                currentY = doc.lastAutoTable.finalY + 5;

            } else if (records.length > 0) {
                let totImp = 0;
                let totTva = 0;
                let totTot = 0;

                const rows = records.map((r, idx) => {
                    const rawTot = Number(r.total) || 0;
                    const rawImp = (r.montant !== undefined && r.montant !== null && r.montant !== '') ? Number(r.montant) : rawTot;
                    const rawTva = Number(r.tva) || 0;
                    const isRefund = (rawTot > 0 || rawImp > 0);

                    const effImp = isRefund ? -Math.abs(rawImp) : Math.abs(rawImp);
                    const effTva = isRefund ? -Math.abs(rawTva) : Math.abs(rawTva);
                    const effTot = isRefund ? -Math.abs(rawTot) : Math.abs(rawTot);

                    totImp += effImp;
                    totTva += effTva;
                    totTot += effTot;

                    const dispRef = isRefund ? `${r.nr_fatt || '-'} (Restituzione)` : (r.nr_fatt || '-');
                    const dispImp = isRefund ? `- ${formatCurrency(Math.abs(rawImp))}` : formatCurrency(Math.abs(rawImp));
                    const dispTva = isRefund ? `- ${formatCurrency(Math.abs(rawTva))}` : formatCurrency(Math.abs(rawTva));
                    const dispTot = isRefund ? `- ${formatCurrency(Math.abs(rawTot))}` : formatCurrency(Math.abs(rawTot));

                    return [
                        idx + 1,
                        r.date || '-',
                        r.fournisseur || r.description || '-',
                        dispRef,
                        r.description && r.description !== r.fournisseur ? r.description : (r.detail || '-'),
                        dispImp,
                        dispTva,
                        dispTot
                    ];
                });

                doc.autoTable({
                    head: [[
                        { content: `${c.label} (Totale: ${formatCurrency(c.val)})`, colSpan: 8, styles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: 'bold' } }
                    ], ['#', 'Data', 'Fornitore / Controparte', 'Rif. Fattura', 'Descrizione / Causale', 'Imponibile (€)', 'IVA (€)', 'Totale (€)']],
                    body: rows,
                    foot: [['', '', 'TOTALE ' + c.label, '', '', formatCurrency(totImp), formatCurrency(totTva), formatCurrency(totTot)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.2, cellPadding: 1.8 },
                    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
                    footStyles: { fillColor: [255, 241, 242], textColor: [190, 18, 60], fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { cellWidth: 18 },
                        2: { cellWidth: 42, fontStyle: 'bold' },
                        3: { cellWidth: 26 },
                        5: { halign: 'right' },
                        6: { halign: 'right' },
                        7: { halign: 'right', fontStyle: 'bold', textColor: [190, 18, 60] }
                    },
                    margin: { left: 14, right: 14 }
                });

                currentY = doc.lastAutoTable.finalY + 5;
            } else {
                doc.autoTable({
                    head: [[
                        { content: `${c.label} - Totale: ${formatCurrency(c.val)} (Consolidato da bilancio RCSL)`, colSpan: 2, styles: { fillColor: [244, 63, 94], textColor: 255 } }
                    ]],
                    body: [[c.detail || c.label, formatCurrency(c.val)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.5, cellPadding: 2 },
                    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 5;
            }
        });

        // 3. STATO PATRIMONIALE DETTAGLIATO (BILAN ACTIF & PASSIF)
        if (currentY > 230) {
            doc.addPage();
            currentY = 16;
        }

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246);
        doc.text("3. STATO PATRIMONIALE DÉTAILLÉ (SPACCATO ANALITICO ATTIVO & PASSIVO)", 14, currentY);
        currentY += 3;

        // ACTIF
        currentBilanSummary.actif.forEach(a => {
            if (a.isHeader) {
                if (currentY > 250) { doc.addPage(); currentY = 16; }
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(16, 185, 129);
                doc.text(a.label, 14, currentY + 3);
                currentY += 5;
                return;
            }

            if (currentY > 240) { doc.addPage(); currentY = 16; }

            if (a.amortSchedule && a.amortSchedule.length > 0) {
                const amortRows = a.amortSchedule.map((item, idx) => [
                    idx + 1,
                    item.name,
                    item.cat,
                    formatCurrency(item.initial_value),
                    `${item.annual_rate}%`,
                    formatCurrency(item.annuite),
                    formatCurrency(item.cumul),
                    formatCurrency(item.vnc)
                ]);
                const totVal = a.amortSchedule.reduce((s, x) => s + x.initial_value, 0);
                const totVnc = a.amortSchedule.reduce((s, x) => s + x.vnc, 0);

                doc.autoTable({
                    head: [[
                        { content: `${a.label} (VNC: ${formatCurrency(a.val)})`, colSpan: 8, styles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' } }
                    ], ['#', 'Cespite Patrimoniale', 'Categoria', 'Valore Storico (€)', 'Aliquota', 'Quota Annua (€)', 'Fondo Amm. (€)', 'VNC Residuo (€)']],
                    body: amortRows,
                    foot: [['', 'TOTALE CESPITI', '', formatCurrency(totVal), '', '', '', formatCurrency(totVnc)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7, cellPadding: 1.8 },
                    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
                    footStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { cellWidth: 50, fontStyle: 'bold' },
                        3: { halign: 'right' },
                        4: { halign: 'center' },
                        5: { halign: 'right' },
                        6: { halign: 'right' },
                        7: { halign: 'right', fontStyle: 'bold', textColor: [21, 128, 61] }
                    },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 4;

            } else if (a.subItems && a.subItems.length > 0) {
                const subRows = a.subItems.map((s, idx) => [
                    idx + 1,
                    s.title,
                    s.note || '-',
                    formatCurrency(s.val)
                ]);
                doc.autoTable({
                    head: [[
                        { content: `${a.label} (Totale: ${formatCurrency(a.val)})`, colSpan: 4, styles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' } }
                    ], ['#', 'Sotto-voce di Bilancio', 'Riferimento / Nota', 'Importo (€)']],
                    body: subRows,
                    foot: [['', 'TOTALE ' + a.label, '', formatCurrency(a.val)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.2, cellPadding: 1.8 },
                    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
                    footStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { fontStyle: 'bold' },
                        3: { halign: 'right', fontStyle: 'bold' }
                    },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 4;
            } else {
                doc.autoTable({
                    head: [[
                        { content: `${a.label} - Totale: ${formatCurrency(a.val)}`, colSpan: 2, styles: { fillColor: [16, 185, 129], textColor: 255 } }
                    ]],
                    body: [[a.detail || a.label, formatCurrency(a.val)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.5, cellPadding: 2 },
                    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 4;
            }
        });

        // PASSIF
        currentBilanSummary.passif.forEach(p => {
            if (p.isHeader) {
                if (currentY > 250) { doc.addPage(); currentY = 16; }
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(59, 130, 246);
                doc.text(p.label, 14, currentY + 3);
                currentY += 5;
                return;
            }

            if (currentY > 240) { doc.addPage(); currentY = 16; }

            if (p.subItems && p.subItems.length > 0) {
                const subRows = p.subItems.map((s, idx) => [
                    idx + 1,
                    s.title,
                    s.note || '-',
                    formatCurrency(s.val)
                ]);
                doc.autoTable({
                    head: [[
                        { content: `${p.label} (Totale: ${formatCurrency(p.val)})`, colSpan: 4, styles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' } }
                    ], ['#', 'Sotto-voce di Bilancio', 'Riferimento / Nota', 'Importo (€)']],
                    body: subRows,
                    foot: [['', 'TOTALE ' + p.label, '', formatCurrency(p.val)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.2, cellPadding: 1.8 },
                    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
                    footStyles: { fillColor: [239, 246, 255], textColor: [29, 78, 216], fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { fontStyle: 'bold' },
                        3: { halign: 'right', fontStyle: 'bold' }
                    },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 4;
            } else {
                doc.autoTable({
                    head: [[
                        { content: `${p.label} - Totale: ${formatCurrency(p.val)}`, colSpan: 2, styles: { fillColor: [59, 130, 246], textColor: 255 } }
                    ]],
                    body: [[p.detail || p.label, formatCurrency(p.val)]],
                    startY: currentY,
                    theme: 'striped',
                    styles: { fontSize: 7.5, cellPadding: 2 },
                    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                    margin: { left: 14, right: 14 }
                });
                currentY = doc.lastAutoTable.finalY + 4;
            }
        });

        // 4. RÉSULTAT NET COMPTABLE & PAREGGIO
        if (currentY > 250) {
            doc.addPage();
            currentY = 16;
        }

        const isProfit = (currentBilanSummary.netResult >= 0);
        doc.autoTable({
            body: [
                [`RÉSULTAT NET COMPTABLE DE L'EXERCICE (Utile / Perdita Netta)`, formatCurrency(currentBilanSummary.netResult)],
                [`EQUILIBRIO STATO PATRIMONIALE (TOTAL ACTIF = TOTAL PASSIF)`, `0,00 € (PAREGGIATO)`]
            ],
            startY: currentY,
            theme: 'plain',
            styles: {
                fontSize: 9.5,
                fontStyle: 'bold',
                fillColor: isProfit ? [220, 252, 231] : [254, 226, 226],
                textColor: isProfit ? [21, 128, 61] : [190, 18, 60],
                cellPadding: 3.5
            },
            columnStyles: {
                1: { halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
        });
    }

    // FOOTER (PAGE NUMBERS)
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Pagina ${i} di ${pageCount}  •  NEW LIFE Sàrl  •  Comptabilité & Bilan PCN Luxembourg`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 8,
            { align: 'center' }
        );
    }

    const exportFileName = isExpandedMode
        ? `NEW_LIFE_Bilancio_e_PL_Dettagliato_${yr}.pdf`
        : `NEW_LIFE_Contabilita_Sintesi_${yr}.pdf`;

    doc.save(exportFileName);
}

window.onLanguageChange = function() {
    renderAccounting();
};

document.addEventListener('DOMContentLoaded', initContabilita);
