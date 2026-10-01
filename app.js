/**
 * NEW LIFE Sàrl - Dashboard / Vue d'ensemble Logic
 */

let cashflowChartInstance = null;
let expenseChartInstance = null;

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

    const isAll = (selectedYear === "ALL" || !selectedYear);
    const filtered = isAll ? records : records.filter(r => r.an == selectedYear);

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

    // Actual latest balance from all records if isAll
    let displayBalance = lastProgressiveBalance;
    if (isAll && records.length > 0) {
        for (let i = records.length - 1; i >= 0; i--) {
            if (records[i].progressivo_banca !== 0) {
                displayBalance = records[i].progressivo_banca;
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

    // Render Charts
    renderCashflowChart(filtered, isAll);
    renderExpenseChart(filtered);

    // Render Recent Transactions
    renderRecentTable(records);
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

function renderRecentTable(records) {
    const tbody = document.getElementById('recent-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Take last 8 transactions
    const recent = records.slice(-8).reverse();

    recent.forEach(r => {
        const tr = document.createElement('tr');
        const isEntree = r.total >= 0;
        const badgeClass = isEntree ? 'badge-entree' : 'badge-sortie';
        let badgeText = isEntree ? 'Entrée' : 'Sortie';
        if (isEntree && (r.description.toLowerCase().includes('storno') || r.e_s.includes('SORTIE') || r.code_op === 'DIV' || r.code_op === 'CHA')) {
            badgeText = 'Storno (+)';
        }
        const totalFormatted = formatCurrency(r.total);
        const soldeFormatted = formatCurrency(r.progressivo_banca);

        tr.innerHTML = `
            <td style="font-weight: 600;">${r.date || '-'}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td><strong style="color: var(--text-main);">${r.description || '-'}</strong></td>
            <td>${r.fournisseur || '<span style="color: var(--text-muted);">-</span>'}</td>
            <td><span class="badge badge-ord">${r.macro || r.class || '-'}</span></td>
            <td class="text-right" style="font-weight: 700; color: ${isEntree ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${isEntree && r.total > 0 ? '+' : ''}${totalFormatted}</td>
            <td class="text-right" style="font-weight: 600;">${soldeFormatted}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Hook language change
window.onLanguageChange = function() {
    const yearSelect = document.getElementById('dash-year-select');
    if (yearSelect) {
        renderDashboardData(yearSelect.value);
    }
};

document.addEventListener('DOMContentLoaded', initDashboard);
