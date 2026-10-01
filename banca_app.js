/**
 * NEW LIFE Sàrl - Compte Courant & Banque Logic
 */

let currentFilteredRecords = [];
let deletedBankIds = new Set(JSON.parse(localStorage.getItem('new_life_deleted_records') || '[]'));

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

function initBanca() {
    if (!window.NEW_LIFE_DATA || !window.NEW_LIFE_DATA.records) {
        console.warn("Données NEW_LIFE non trouvées.");
        return;
    }

    const data = window.NEW_LIFE_DATA;
    const records = data.records;

    // Last updated
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl) {
        updatedEl.textContent = (typeof getAppLastUpdate === 'function') ? getAppLastUpdate() : (data.company?.updated_at || '--/--/----');
    }

    // Populate Filters
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect && data.stats.years) {
        data.stats.years.slice().reverse().forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `Année ${y}`;
            yearSelect.appendChild(opt);
        });
    }

    const catSelect = document.getElementById('filter-category');
    if (catSelect) {
        const macros = Array.from(new Set(records.map(r => r.macro).filter(Boolean))).sort();
        macros.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            catSelect.appendChild(opt);
        });
    }

    // Event listeners
    document.getElementById('filter-year').addEventListener('change', applyFilters);
    document.getElementById('filter-month').addEventListener('change', applyFilters);
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('filter-compte').addEventListener('change', applyFilters);
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    document.getElementById('filter-search').addEventListener('input', applyFilters);
    document.getElementById('filter-hide-storni').addEventListener('change', applyFilters);

    document.getElementById('btn-reset-filters').addEventListener('click', () => {
        document.getElementById('filter-year').value = 'ALL';
        document.getElementById('filter-month').value = 'ALL';
        document.getElementById('filter-type').value = 'ALL';
        document.getElementById('filter-compte').value = 'ALL';
        document.getElementById('filter-category').value = 'ALL';
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-hide-storni').checked = true;
        applyFilters();
    });

    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
    document.getElementById('btn-export-pdf').addEventListener('click', exportToPDF);

    applyFilters();
}

function applyFilters() {
    const data = window.NEW_LIFE_DATA;
    const records = data.records;

    const yearVal = document.getElementById('filter-year').value;
    const monthVal = document.getElementById('filter-month').value;
    const typeVal = document.getElementById('filter-type').value;
    const compteVal = document.getElementById('filter-compte').value;
    const catVal = document.getElementById('filter-category').value;
    const searchVal = document.getElementById('filter-search').value.toLowerCase().trim();
    const hideStorni = document.getElementById('filter-hide-storni').checked;

    currentFilteredRecords = records.filter(r => {
        if (deletedBankIds.has(r.id)) return false;
        if (!r.an || r.an === 0 || !r.date || !/^\d{4}/.test(r.date)) return false;
        if (hideStorni && r.is_storno) return false;
        if (yearVal !== 'ALL' && r.an != yearVal) return false;
        if (monthVal !== 'ALL' && r.month != monthVal) return false;
        if (typeVal === 'ENTREES' && r.total < 0) return false;
        if (typeVal === 'SORTIES' && r.total >= 0) return false;
        if (compteVal !== 'ALL' && r.compte !== compteVal) return false;
        if (catVal !== 'ALL' && r.macro !== catVal && r.class !== catVal) return false;

        if (searchVal) {
            const fullText = `${r.code_op} ${r.description} ${r.fournisseur} ${r.nr_fatt} ${r.macro} ${r.detail} ${r.compte}`.toLowerCase();
            if (!fullText.includes(searchVal)) return false;
        }

        return true;
    });

    // Invert order: most recent operations first (descending by date and ID)
    currentFilteredRecords.sort((a, b) => {
        if (a.date && b.date) {
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;
        } else if (a.date && !b.date) {
            return -1;
        } else if (!a.date && b.date) {
            return 1;
        }
        return (b.id || 0) - (a.id || 0);
    });

    renderStatsAndTable(yearVal);
}

function renderStatsAndTable(yearVal) {
    let totalIn = 0;
    let totalOut = 0;
    let endingBalance = 0;
    let balanceSet = false;

    currentFilteredRecords.forEach(r => {
        if (!balanceSet && r.progressivo_banca !== 0 && r.progressivo_banca !== undefined && r.progressivo_banca !== null) {
            endingBalance = r.progressivo_banca;
            balanceSet = true;
        }

        if (r.code_op === 'SALDO' && yearVal !== 'ALL') return;

        if (r.is_storno) {
            return;
        }

        if (r.total >= 0) {
            totalIn += r.total;
        } else {
            totalOut += Math.abs(r.total);
        }
    });

    const netFlow = totalIn - totalOut;

    const statInEl = document.getElementById('bank-stat-in');
    if (statInEl) statInEl.textContent = formatCurrency(totalIn);
    const statOutEl = document.getElementById('bank-stat-out');
    if (statOutEl) statOutEl.textContent = formatCurrency(totalOut);
    
    const netEl = document.getElementById('bank-stat-net');
    if (netEl) {
        netEl.textContent = formatCurrency(netFlow);
        netEl.className = netFlow >= 0 ? 'kpi-value text-emerald' : 'kpi-value text-rose';
    }

    const balEl = document.getElementById('bank-stat-balance');
    if (balEl) balEl.textContent = formatCurrency(endingBalance);
    const rowsEl = document.getElementById('count-rows');
    if (rowsEl) rowsEl.textContent = formatNumber(currentFilteredRecords.length);

    // Update restore deleted button visibility
    const restoreBtn = document.getElementById('btn-restore-records');
    const countDeletedEl = document.getElementById('count-deleted-records');
    if (restoreBtn && countDeletedEl) {
        if (deletedBankIds.size > 0) {
            restoreBtn.style.display = 'inline-flex';
            countDeletedEl.textContent = formatNumber(deletedBankIds.size);
        } else {
            restoreBtn.style.display = 'none';
        }
    }

    // Render Table Body (limit to 400 rows at once for fast DOM rendering)
    const tbody = document.getElementById('bank-tbody');
    tbody.innerHTML = '';

    const maxRender = 400;
    const slice = currentFilteredRecords.slice(0, maxRender);

    slice.forEach(r => {
        const tr = document.createElement('tr');
        const isEntree = r.total >= 0;
        let badgeClass = isEntree ? 'badge-entree' : 'badge-sortie';
        let badgeText = isEntree ? 'Entrée' : 'Sortie';
        if (r.is_transfert) {
            badgeClass = 'badge-ord';
            badgeText = isEntree ? 'Giriconto (+)' : 'Giriconto (-)';
        } else if (r.is_storno) {
            badgeClass = 'badge-ext';
            badgeText = 'Storno (Comp.)';
        } else if (isEntree && (r.description.toLowerCase().includes('storno') || r.e_s.includes('SORTIE') || r.code_op === 'DIV' || r.code_op === 'CHA')) {
            badgeText = 'Storno (+)';
        }

        let compteBadge = '<span style="color: var(--text-muted);">-</span>';
        if (r.compte === 'POST') {
            compteBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 700;">POST</span>`;
        } else if (r.compte === 'BANQUE') {
            compteBadge = `<span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); font-weight: 600;">ING</span>`;
        } else if (r.compte === 'CAISSE') {
            compteBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); font-weight: 600;">CAISSE</span>`;
        }

        tr.innerHTML = `
            <td><code style="font-weight: 700; color: var(--accent-blue);">${r.code_op || '-'}</code></td>
            <td style="font-weight: 600; white-space: nowrap;">${r.date || '-'}</td>
            <td style="text-align: center;">${compteBadge}</td>
            <td><span class="badge ${badgeClass}">${badgeText}</span></td>
            <td><strong>${r.description || '-'}</strong></td>
            <td>${r.fournisseur || '<span style="color: var(--text-muted);">-</span>'}</td>
            <td><span class="badge badge-ord">${r.macro || r.class || '-'}</span></td>
            <td class="text-right" style="font-weight: 700; color: ${isEntree ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${isEntree && r.total > 0 ? '+' : ''}${formatCurrency(r.total)}</td>
            <td class="text-right" style="font-weight: 600;">${formatCurrency(r.progressivo_banca)}</td>
            <td class="text-center">
                <div style="display: flex; gap: 0.35rem; justify-content: center;">
                    <button class="doc-btn-icon view" onclick="openDetailModal(${r.id})" title="Voir détails">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="doc-btn-icon delete" onclick="deleteBankRecord(${r.id})" title="Supprimer cette opération">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (currentFilteredRecords.length > maxRender) {
        const noteTr = document.createElement('tr');
        noteTr.innerHTML = `
            <td colspan="10" class="text-center" style="padding: 1rem; color: var(--text-muted); font-style: italic;">
                Affichage des ${formatNumber(maxRender)} premières lignes sur ${formatNumber(currentFilteredRecords.length)}. Affinez vos filtres de recherche si nécessaire.
            </td>
        `;
        tbody.appendChild(noteTr);
    }
}

function deleteBankRecord(id) {
    const data = window.NEW_LIFE_DATA;
    const rec = data.records.find(r => r.id === id);
    if (!rec) return;

    const msg = `${t('confirm_delete_op') || 'Êtes-vous sûr de vouloir supprimer cette opération ?'}\n\n• Date : ${rec.date}\n• Libellé : ${rec.description}\n• Montant : ${formatCurrency(rec.total)}`;
    if (!confirm(msg)) return;

    deletedBankIds.add(id);
    localStorage.setItem('new_life_deleted_records', JSON.stringify(Array.from(deletedBankIds)));
    applyFilters();
}

function restoreAllDeletedRecords() {
    if (deletedBankIds.size === 0) return;
    if (confirm("Voulez-vous restaurer toutes les opérations supprimées ?")) {
        deletedBankIds.clear();
        localStorage.removeItem('new_life_deleted_records');
        applyFilters();
    }
}

function openDetailModal(recordId) {
    const data = window.NEW_LIFE_DATA;
    const rec = data.records.find(r => r.id === recordId);
    if (!rec) return;

    const content = document.getElementById('modal-detail-content');
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Code Opération & ID</p>
                <p style="font-weight: 700; font-size: 1.1rem; color: var(--accent-blue);">${rec.code_op} (ID #${rec.id})</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Date d'opération / Date Valeur</p>
                <p style="font-weight: 600;">${rec.date} (Valeur: ${rec.valeur})</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Sens du Flux</p>
                <p><span class="badge ${rec.e_s.includes('ENTREE') ? 'badge-entree' : 'badge-sortie'}">${rec.e_s}</span> (D/C: ${rec.d_c})</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Compétence Contable / Exercice</p>
                <p style="font-weight: 600;">Année ${rec.compet_contabile} (Exercice: ${rec.exercice})</p>
            </div>
        </div>

        <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1rem 0;">

        <div style="margin-bottom: 1rem;">
            <p style="color: var(--text-muted); font-size: 0.8rem;">Libellé / Description</p>
            <p style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">${rec.description}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Fournisseur / Tiers</p>
                <p style="font-weight: 600;">${rec.fournisseur || 'Non spécifié'}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">N° Facture & Date</p>
                <p style="font-weight: 600;">${rec.nr_fatt || '-'} ${rec.date_facture ? '(' + rec.date_facture + ')' : ''}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Macro Catégorie & Classe PCN</p>
                <p style="font-weight: 600;">${rec.macro} &bull; ${rec.class}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Compte PCN & Type</p>
                <p style="font-weight: 600;">${rec.compte || '-'} (${rec.sp_ce || '-'})</p>
            </div>
        </div>

        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; display: flex; justify-content: space-around; text-align: center;">
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Montant HT</p>
                <p style="font-size: 1.2rem; font-weight: 700;">${formatCurrency(rec.montant)}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">TVA (${(rec.taux_tva * 100).toFixed(0)}%)</p>
                <p style="font-size: 1.2rem; font-weight: 700; color: var(--accent-amber);">${formatCurrency(rec.tva)}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Total TTC</p>
                <p style="font-size: 1.3rem; font-weight: 800; color: ${rec.e_s.includes('ENTREE') ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${formatCurrency(rec.total)}</p>
            </div>
            <div>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Solde Banque</p>
                <p style="font-size: 1.2rem; font-weight: 700; color: var(--accent-blue);">${formatCurrency(rec.progressivo_banca)}</p>
            </div>
        </div>
    `;

    document.getElementById('detail-modal').classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.remove('active');
}

function exportToExcel() {
    if (!currentFilteredRecords || currentFilteredRecords.length === 0) {
        alert("Aucune opération à exporter.");
        return;
    }

    const exportRows = currentFilteredRecords.map(r => ({
        "Code Op.": r.code_op,
        "Date": r.date,
        "Date Valeur": r.valeur,
        "Sens": r.e_s,
        "Description": r.description,
        "Fournisseur": r.fournisseur,
        "N° Facture": r.nr_fatt,
        "Macro": r.macro,
        "Classe PCN": r.class,
        "Compte": r.compte,
        "Montant HT (€)": r.montant,
        "Taux TVA": r.taux_tva,
        "TVA (€)": r.tva,
        "Total TTC (€)": r.total,
        "Solde Reconstitué (€)": r.progressivo_banca
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compte_Courant_NL");
    XLSX.writeFile(wb, "NEW_LIFE_Compte_Courant.xlsx");
}

function exportToPDF() {
    if (!currentFilteredRecords || currentFilteredRecords.length === 0) {
        alert("Aucune opération à exporter.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.text("NEW LIFE Sàrl - Grand Livre de Trésorerie", 14, 15);
    doc.setFontSize(10);
    doc.text(`Export du ${new Date().toLocaleDateString('fr-FR')} - Total ${currentFilteredRecords.length} opérations`, 14, 22);

    const tableData = currentFilteredRecords.slice(0, 100).map(r => [
        r.code_op,
        r.date,
        r.compte || '-',
        r.e_s,
        r.description.substring(0, 30),
        r.fournisseur.substring(0, 18),
        r.macro.substring(0, 20),
        formatCurrency(r.montant),
        formatCurrency(r.total),
        formatCurrency(r.progressivo_banca)
    ]);

    doc.autoTable({
        head: [['Code', 'Date', 'Compte', 'Sens', 'Description', 'Fournisseur', 'Catégorie PCN', 'Montant HT', 'Total TTC', 'Solde']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save("NEW_LIFE_Grand_Livre.pdf");
}

window.onLanguageChange = function() {
    applyFilters();
};

document.addEventListener('DOMContentLoaded', initBanca);
