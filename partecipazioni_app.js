/**
 * NEW LIFE Sàrl - Application Portefeuille Participations & Filiales (Classe PCN 23)
 */

let activeTab = 'tab-part-cards';
let partDoughnutChart = null;
let partGeoChart = null;

// --- State Management ---
function getParticipations() {
    const raw = localStorage.getItem('new_life_partecipazioni');
    let items;
    if (!raw) {
        items = JSON.parse(JSON.stringify(window.DEFAULT_PARTECIPAZIONI || []));
    } else {
        try {
            items = JSON.parse(raw);
        } catch {
            items = JSON.parse(JSON.stringify(window.DEFAULT_PARTECIPAZIONI || []));
        }
    }

    // Ensure default core participations (PART-SEF, PART-SAF, PART-GEB, PART-CREANCES) are always present and restored
    const defaults = window.DEFAULT_PARTECIPAZIONI || [];
    let updated = false;
    defaults.forEach(defPart => {
        const existingIdx = items.findIndex(p => p.id === defPart.id);
        if (existingIdx === -1) {
            items.push(JSON.parse(JSON.stringify(defPart)));
            updated = true;
        }
    });

    // Ensure SEF Srl, Green Enerbras One SCSp and Sombra e Agua Fresca Resort Sàrl have full accurate corporate data
    items = items.map(p => {
        if (p.id === 'PART-SEF') {
            p.name = "SEF Srl (Italie)";
            p.short_name = "SEF Srl";
            p.country = "Italie";
            p.country_code = "it";
            p.flag = "🇮🇹";
            p.legal_form = "Società a Responsabilità Limitata (S.r.l.)";
            p.pcn_account = "233 - PARTICIPATIONS";
            p.pcn_code = "233";
            p.sector = "Servizi alle Imprese & Attività Commerciali";
            p.rcs_number = "P.IVA / Cod. Fiscale IT-04892180261";
            p.headquarters = "Torino (Italia)";
            p.rep_name = "Tubia Edoardo / Amm. Unico";
            p.entry_date = "2026-09-07";
            p.initial_invested = 4000.00;
            p.divested_amount = 0.00;
            p.vnc = 4000.00;
            p.pct_ownership = "20.00%";
            p.status = "active";
            p.status_label = "Actif (Acquisition 09/2026)";
            p.notes = "Acquisition de participation finalisée le 07/09/2026 pour un montant de 4.000 € (solde d'achat), avec acte notarié et modification statutaire New Life (honoraires 1.800 €).";
            updated = true;
        }
        if (p.id === 'PART-GEB') {
            p.name = "Green Enerbras One SCSp";
            p.short_name = "Green Enerbras One SCSp";
            p.country = "Luxembourg (Projets Brésil)";
            p.legal_form = "Société en Commandite Spéciale (SCSp)";
            p.pcn_account = "2330 - GREEN ENERBRAS ONE SCSp";
            p.sector = "Investimenti Fotovoltaico a terra (Brasile)";
            p.rcs_number = "RCS Luxembourg (SCSp)";
            p.headquarters = "Luxembourg";
            p.rep_name = "NEW LIFE Sàrl (General Partner & Gérant Commandité)";
            p.pct_ownership = "Contrôle (General Partner)";
            p.status_label = "Actif (Contrôle GP)";
            p.notes = "Società lussemburghese (SCSp) controllata e gestita da NEW LIFE Sàrl in qualità di General Partner. Attiva negli investimenti in impianti fotovoltaici a terra in Brasile. Ha acquisito la società operativa brasiliana TRI STAR ENERBRAS ONE SCP con sede a Natal (RN, Brasile).";
            updated = true;
        }
        if (p.id === 'PART-SAF') {
            p.name = "Sombra e Agua Fresca Resort Sàrl";
            p.short_name = "Sombra e Agua Fresca Resort Sàrl";
            p.country = "Luxembourg (Filiale au Brésil)";
            p.legal_form = "Société à Responsabilité Limitée (Sàrl)";
            p.headquarters = "Luxembourg";
            p.sector = "Hospitality & Luxury Resort (Praia de Pipa)";
            p.rcs_number = "RCS Luxembourg B228941";
            p.notes = "Società holding lussemburghese (Sàrl) con sede in Lussemburgo, controlla a sua volta la società operativa brasiliana Sombra Resort Brasil Sociedade Unipessoal Limitada con sede a Natal (Brasile), attiva nel settore dell'hospitality e resort di lusso a Praia de Pipa. Investimento storico di € 302.245,51 con cessione parziale di quote e 520 azioni a nov 2024 per € 70.520,00 (VNC a bilancio: € 232.725,00).";
            updated = true;
        }
        return p;
    });
    if (updated) {
        saveParticipations(items);
    }

    return items;
}

function saveParticipations(items) {
    localStorage.setItem('new_life_partecipazioni', JSON.stringify(items));
}

function getPartDocs() {
    const raw = localStorage.getItem('new_life_partecipazioni_docs');
    let docs;
    if (!raw) {
        docs = JSON.parse(JSON.stringify(window.DEFAULT_PARTECIPAZIONI_DOCS || []));
        localStorage.setItem('new_life_partecipazioni_docs', JSON.stringify(docs));
        return docs;
    }
    try {
        docs = JSON.parse(raw);
    } catch {
        docs = JSON.parse(JSON.stringify(window.DEFAULT_PARTECIPAZIONI_DOCS || []));
    }

    let updated = false;

    // Ensure DOC-SEF-02 (Visura Camerale) has the official file attached
    docs = docs.map(d => {
        if (d.id === 'DOC-SEF-02') {
            d.title = "Visura Camerale Storica CCIAA Registro Imprese SEF Srl";
            d.date = "2026-09-28";
            d.filename = "SEF srl - visura del 28.9.26.pdf";
            d.filepath = "docs/SEF srl - visura del 28.9.26.pdf";
            d.available = true;
            d.size = "81.56 Ko";
            updated = true;
        }
        return d;
    });

    // Deduplicate extra test visura documents for PART-SEF
    const hasOfficialSefVisura = docs.some(d => d.id === 'DOC-SEF-02');
    if (hasOfficialSefVisura) {
        const initialLen = docs.length;
        docs = docs.filter(d => {
            if (d.part_id === 'PART-SEF' && d.id !== 'DOC-SEF-02' && (d.title.trim().toLowerCase() === 'visura camerale' || d.title.trim().toLowerCase() === 'visura camerale storica cciaa registro imprese sef srl')) {
                return false;
            }
            return true;
        });
        if (docs.length !== initialLen) updated = true;
    }

    // Merge missing defaults without overwriting user changes or uploaded files
    const defaults = window.DEFAULT_PARTECIPAZIONI_DOCS || [];
    defaults.forEach(defDoc => {
        const existingIdx = docs.findIndex(d => d.id === defDoc.id);
        if (existingIdx === -1) {
            docs.push(JSON.parse(JSON.stringify(defDoc)));
            updated = true;
        }
    });

    // Clean duplicate test entries for SEF
    const sefDocs = docs.filter(d => d.part_id === 'PART-SEF');
    if (sefDocs.length > 4) {
        const seenTitles = new Set();
        docs = docs.filter(d => {
            if (d.part_id !== 'PART-SEF') return true;
            const key = `${d.title.trim().toLowerCase()}_${d.date}`;
            if (seenTitles.has(key)) return false;
            seenTitles.add(key);
            return true;
        });
        updated = true;
    }

    if (updated) {
        savePartDocs(docs);
    }

    return docs;
}

function savePartDocs(docs) {
    localStorage.setItem('new_life_partecipazioni_docs', JSON.stringify(docs));
}

// --- Formatters (Punto per le migliaia, virgola per i decimali) ---
function formatCurrency(val) {
    if (val === undefined || val === null || isNaN(val)) return '0,00 €';
    const num = Number(val);
    const parts = Math.abs(num).toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1];
    const sign = num < 0 ? '-' : '';
    return `${sign}${integerPart},${decimalPart} €`;
}

function formatNumber(val, decimals = 2) {
    if (val === undefined || val === null || isNaN(val)) return '0';
    const num = Number(val);
    const parts = Math.abs(num).toFixed(decimals).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1];
    const sign = num < 0 ? '-' : '';
    return decimals > 0 ? `${sign}${integerPart},${decimalPart}` : `${sign}${integerPart}`;
}

function getCategoryBadge(cat) {
    switch (cat) {
        case 'acte':
            return '<span class="badge badge-entree"><i class="fa-solid fa-file-contract"></i> Acte Notarié / Achat</span>';
        case 'statuts':
            return '<span class="badge badge-ord"><i class="fa-solid fa-landmark"></i> Statuts / Registre</span>';
        case 'visura':
            return '<span class="badge badge-ext"><i class="fa-solid fa-stamp"></i> Visura / RCS</span>';
        case 'bilan':
            return '<span class="badge badge-sortie"><i class="fa-solid fa-file-invoice-dollar"></i> Bilan Filiale</span>';
        case 'pacte':
            return '<span class="badge badge-ord"><i class="fa-solid fa-handshake"></i> Pacte d\'Associés</span>';
        case 'financement':
            return '<span class="badge badge-entree"><i class="fa-solid fa-money-bill-transfer"></i> Financement / Avance</span>';
        case 'quittance':
            return '<span class="badge badge-ext"><i class="fa-solid fa-receipt"></i> Quittance / Paiement</span>';
        default:
            return '<span class="badge badge-ord"><i class="fa-solid fa-file"></i> Autre Document</span>';
    }
}

function getCategoryLabel(cat) {
    switch (cat) {
        case 'acte': return 'Acte Notarié / Acquisition';
        case 'statuts': return 'Statuts & Modifications';
        case 'visura': return 'Visura Camerale / RCS';
        case 'bilan': return 'Bilan & Comptes';
        case 'pacte': return 'Pacte d\'Associés';
        case 'financement': return 'Financement & Prêts';
        case 'quittance': return 'Quittance / Virement';
        default: return 'Document Juridique';
    }
}

// --- Initialization ---
function initPartecipazioni() {
    const data = window.NEW_LIFE_DATA || { company: {} };

    // Last updated in sidebar
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl && data.company && data.company.updated_at) {
        updatedEl.textContent = data.company.updated_at;
    }

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Populate entity filter dropdowns
    populateEntityFilters();

    // Event listeners for filters
    const searchInput = document.getElementById('part-search-input');
    if (searchInput) searchInput.addEventListener('input', renderCurrentView);

    const filterEntity = document.getElementById('part-entity-filter');
    if (filterEntity) filterEntity.addEventListener('change', renderCurrentView);

    const filterStatus = document.getElementById('part-status-filter');
    if (filterStatus) filterStatus.addEventListener('change', renderCurrentView);

    const filterDocEntity = document.getElementById('part-doc-entity-filter');
    if (filterDocEntity) filterDocEntity.addEventListener('change', renderPartDocsArchive);

    const filterDocCat = document.getElementById('part-doc-cat-filter');
    if (filterDocCat) filterDocCat.addEventListener('change', renderPartDocsArchive);

    const searchDocInput = document.getElementById('part-doc-search-input');
    if (searchDocInput) searchDocInput.addEventListener('input', renderPartDocsArchive);

    // Initial render
    updateKPIs();
    renderPartCards();
    renderPartTable();
    renderPartDocsArchive();
    renderPartHistory();
    initCharts();
}

function isCreance(p) {
    if (!p) return false;
    return p.id === 'PART-CREANCES' || p.pcn_code === '234' || (p.pcn_account && p.pcn_account.includes('234')) || (p.name && p.name.toLowerCase().includes('créance'));
}

function populateEntityFilters() {
    const parts = getParticipations();
    const entityFilter = document.getElementById('part-entity-filter');
    const docEntityFilter = document.getElementById('part-doc-entity-filter');
    const modalPartSelect = document.getElementById('modal-doc-part-id');

    const pureParts = parts.filter(p => !isCreance(p));
    const creances = parts.filter(p => isCreance(p));

    if (entityFilter) {
        entityFilter.innerHTML = `
            <option value="ALL">Toutes les immobilisations (PCN 23)</option>
            <option value="ONLY_PARTS">🏢 Participations Détenues Uniquement (PCN 233)</option>
            <option value="ONLY_CREANCES">💶 Créances & Financements (PCN 234)</option>
            <optgroup label="🏢 Participations Détenues (PCN 233)">
                ${pureParts.map(p => `<option value="${p.id}">${p.flag || '🏢'} ${p.name}</option>`).join('')}
            </optgroup>
            ${creances.length > 0 ? `
            <optgroup label="💶 Créances Financières (PCN 234)">
                ${creances.map(p => `<option value="${p.id}">${p.flag || '💶'} ${p.name}</option>`).join('')}
            </optgroup>` : ''}
        `;
    }

    if (docEntityFilter) {
        docEntityFilter.innerHTML = `
            <option value="ALL">Toutes les entités & créances</option>
            <optgroup label="🏢 Participations Détenues (PCN 233)">
                ${pureParts.map(p => `<option value="${p.id}">${p.flag || '🏢'} ${p.name}</option>`).join('')}
            </optgroup>
            ${creances.length > 0 ? `
            <optgroup label="💶 Créances Financières (PCN 234)">
                ${creances.map(p => `<option value="${p.id}">${p.flag || '💶'} ${p.name}</option>`).join('')}
            </optgroup>` : ''}
        `;
    }

    if (modalPartSelect) {
        modalPartSelect.innerHTML = `
            <optgroup label="🏢 Participations Détenues (PCN 233)">
                ${pureParts.map(p => `<option value="${p.id}">${p.flag || '🏢'} ${p.name}</option>`).join('')}
            </optgroup>
            ${creances.length > 0 ? `
            <optgroup label="💶 Créances Financières (PCN 234)">
                ${creances.map(p => `<option value="${p.id}">${p.flag || '💶'} ${p.name}</option>`).join('')}
            </optgroup>` : ''}
        `;
    }
}

function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(tc => {
        tc.classList.toggle('active', tc.id === tabId);
    });

    if (tabId === 'tab-part-cards' || tabId === 'tab-part-table') {
        renderCurrentView();
    } else if (tabId === 'tab-part-docs') {
        renderPartDocsArchive();
    } else if (tabId === 'tab-part-history') {
        renderPartHistory();
    }
}

function renderCurrentView() {
    updateKPIs();
    renderPartCards();
    renderPartTable();
    updateCharts();
}

// --- KPIs ---
function updateKPIs() {
    const parts = getParticipations();

    let totalVnc = 0;
    let partVnc = 0;
    let creancesVnc = 0;
    let totalInvested = 0;
    let totalDivested = 0;
    let activePartCount = 0;

    parts.forEach(p => {
        const vnc = Number(p.vnc) || 0;
        totalVnc += vnc;
        totalInvested += Number(p.initial_invested) || 0;
        totalDivested += Number(p.divested_amount) || 0;

        if (isCreance(p)) {
            creancesVnc += vnc;
        } else {
            partVnc += vnc;
            if (p.status === 'active') activePartCount++;
        }
    });

    const kpiVncEl = document.getElementById('kpi-part-vnc');
    if (kpiVncEl) kpiVncEl.textContent = formatCurrency(totalVnc);

    const kpiCountEl = document.getElementById('kpi-part-count');
    if (kpiCountEl) kpiCountEl.textContent = formatCurrency(partVnc);

    const kpiCountSubEl = document.getElementById('kpi-part-count-sub');
    if (kpiCountSubEl) kpiCountSubEl.innerHTML = `<i class="fa-solid fa-shapes text-blue"></i> ${activePartCount} Sociétés en portefeuille`;

    const kpiCreancesEl = document.getElementById('kpi-part-creances');
    if (kpiCreancesEl) kpiCreancesEl.textContent = formatCurrency(creancesVnc);

    const kpiInvestedEl = document.getElementById('kpi-part-invested');
    if (kpiInvestedEl) kpiInvestedEl.textContent = formatCurrency(totalInvested);

    const kpiDivestedEl = document.getElementById('kpi-part-divested');
    if (kpiDivestedEl) kpiDivestedEl.textContent = formatCurrency(totalDivested);
}

function createParticipationCard(p, allDocs) {
    const entityDocs = allDocs.filter(d => d.part_id === p.id);
    const card = document.createElement('div');
    card.className = 'part-card';

    // Build docs HTML list
    let docsHtml = '';
    if (entityDocs.length === 0) {
        docsHtml = `<div style="color: var(--text-muted); font-size: 0.78rem; font-style: italic; padding: 0.5rem 0;">Aucun document archivé pour cette entité.</div>`;
    } else {
        docsHtml = entityDocs.map(d => {
            const isAvailable = d.available === true;
            const viewBtnClass = isAvailable ? 'doc-btn-icon view available' : 'doc-btn-icon view empty';
            const viewBtnTitle = isAvailable ? "Visualizza documento PDF disponibile" : "Nessun file caricato (Clicca per allegare)";
            const iconColor = isAvailable ? '#10b981' : '#64748b';
            const fileIconColor = isAvailable ? 'var(--accent-rose, #f43f5e)' : 'var(--text-muted, #64748b)';
            return `
            <div class="part-doc-item">
                <div class="part-doc-info" title="${d.title}">
                    <i class="fa-solid fa-file-pdf" style="color: ${fileIconColor};"></i>
                    <span class="part-doc-name">${d.title}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <span class="part-doc-date">${d.date || ''}</span>
                    <button class="${viewBtnClass}" onclick="viewPartDocument('${d.id}')" title="${viewBtnTitle}">
                        <i class="fa-solid fa-eye" style="color: ${iconColor};"></i>
                    </button>
                    <button class="doc-btn-icon delete" onclick="deletePartDocument('${d.id}')" title="Elimina / Rimuovi file">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }

    const isReceivable = isCreance(p);

    card.innerHTML = `
        <div>
            <div class="part-card-header">
                <div class="part-entity-info">
                    <div class="part-flag-icon">${p.flag || (isReceivable ? '💶' : '🏢')}</div>
                    <div>
                        <div class="part-entity-title">${p.name}</div>
                        <div class="part-entity-subtitle">
                            <span class="badge-country"><i class="fa-solid fa-location-dot"></i> ${p.country}</span>
                            <span class="badge-pcn" style="${isReceivable ? 'border-color: rgba(59, 130, 246, 0.4); color: var(--accent-blue);' : ''}"><i class="fa-solid fa-book"></i> PCN ${p.pcn_code || (isReceivable ? '234' : '233')}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="badge ${p.status === 'active' ? 'badge-entree' : 'badge-ord'}">
                        ${p.status_label || 'Actif'}
                    </span>
                </div>
            </div>

            <!-- Financial Metric Box -->
            <div class="part-metrics-box" style="${isReceivable ? 'background: rgba(59, 130, 246, 0.05); border-color: rgba(59, 130, 246, 0.2);' : ''}">
                <div class="part-metric-item">
                    <span class="part-metric-label">${isReceivable ? 'Montant Créance (VNC)' : 'Valeur Bilan (VNC)'}</span>
                    <span class="part-metric-val ${isReceivable ? 'text-cyan' : 'text-emerald'}">${formatCurrency(p.vnc)}</span>
                </div>
                <div class="part-metric-item">
                    <span class="part-metric-label">${isReceivable ? 'Nature' : 'Détention'}</span>
                    <span class="part-metric-val text-cyan">${isReceivable ? 'Financement' : (p.pct_ownership || '100%')}</span>
                </div>
                <div class="part-metric-item">
                    <span class="part-metric-label">${isReceivable ? 'Montant Initial' : 'Investi Initial'}</span>
                    <span class="part-metric-val" style="font-size: 0.95rem; color: var(--text-muted);">${formatCurrency(p.initial_invested)}</span>
                </div>
                <div class="part-metric-item">
                    <span class="part-metric-label">${isReceivable ? 'Remboursements' : 'Cessions / Retraits'}</span>
                    <span class="part-metric-val text-amber" style="font-size: 0.95rem;">${formatCurrency(p.divested_amount)}</span>
                </div>
            </div>

            <!-- Corporate Metadata Grid -->
            <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.85rem;">
                <div><i class="fa-solid fa-industry text-blue" style="width: 16px;"></i> <strong>Secteur / Objet :</strong> ${p.sector || '-'}</div>
                <div><i class="fa-solid fa-hashtag text-blue" style="width: 16px;"></i> <strong>${isReceivable ? 'Compte Comptable :' : 'Immatriculation :'}</strong> ${p.rcs_number || p.pcn_account || '-'}</div>
                <div><i class="fa-solid fa-building text-blue" style="width: 16px;"></i> <strong>Siège :</strong> ${p.headquarters || '-'}</div>
                <div><i class="fa-solid fa-user-tie text-blue" style="width: 16px;"></i> <strong>${isReceivable ? 'Gestionnaire :' : 'Mandataire :'}</strong> ${p.rep_name || '-'}</div>
                <div><i class="fa-regular fa-calendar-check text-blue" style="width: 16px;"></i> <strong>Date de référence :</strong> ${p.entry_date || '-'}</div>
                ${p.notes ? `<div style="margin-top: 0.25rem; font-style: italic; background: rgba(255,255,255,0.02); padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-subtle);"><i class="fa-solid fa-circle-info text-cyan"></i> ${p.notes}</div>` : ''}
            </div>

            <!-- Attached Documents Vault -->
            <div class="part-doc-vault">
                <div class="part-doc-vault-title">
                    <span><i class="fa-solid fa-folder-open text-blue"></i> Documents & Conventions (${entityDocs.length})</span>
                    <button class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="openAddDocModal('${p.id}')">
                        <i class="fa-solid fa-plus"></i> Ajouter
                    </button>
                </div>
                <div class="part-doc-list">
                    ${docsHtml}
                </div>
            </div>
        </div>

        <!-- Footer Action Buttons -->
        <div class="part-footer-actions">
            <div style="font-size: 0.75rem; color: var(--text-muted);">
                ID: <code>${p.id}</code>
            </div>
            <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-secondary btn-sm" onclick="openEditPartModal('${p.id}')" title="Modifier les informations">
                    <i class="fa-solid fa-pen-to-square"></i> Modifier
                </button>
                <button class="btn btn-secondary btn-sm" style="color: var(--accent-rose);" onclick="deleteParticipation('${p.id}')" title="Supprimer">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

// --- Tab 1: Cards View ---
function renderPartCards() {
    const parts = getParticipations();
    const allDocs = getPartDocs();
    const container = document.getElementById('part-cards-grid');
    if (!container) return;

    const entityFilter = document.getElementById('part-entity-filter') ? document.getElementById('part-entity-filter').value : 'ALL';
    const statusFilter = document.getElementById('part-status-filter') ? document.getElementById('part-status-filter').value : 'ALL';
    const searchFilter = document.getElementById('part-search-input') ? document.getElementById('part-search-input').value.toLowerCase().trim() : '';

    container.innerHTML = '';

    const filtered = parts.filter(p => {
        if (entityFilter === 'ONLY_PARTS' && isCreance(p)) return false;
        if (entityFilter === 'ONLY_CREANCES' && !isCreance(p)) return false;
        if (entityFilter !== 'ALL' && entityFilter !== 'ONLY_PARTS' && entityFilter !== 'ONLY_CREANCES' && p.id !== entityFilter) return false;
        if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
        if (searchFilter) {
            const query = `${p.name} ${p.short_name} ${p.country} ${p.pcn_account} ${p.sector} ${p.rcs_number} ${p.notes}`.toLowerCase();
            if (!query.includes(searchFilter)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);" class="glass-panel">
                <i class="fa-solid fa-shapes" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4;"></i>
                <p>Aucune participation ou créance trouvée avec ces critères.</p>
            </div>
        `;
        return;
    }

    const participationsList = filtered.filter(p => !isCreance(p));
    const creancesList = filtered.filter(p => isCreance(p));

    // Section 1: Participations (PCN 233)
    if (participationsList.length > 0) {
        const totalPartVnc = participationsList.reduce((acc, p) => acc + (Number(p.vnc) || 0), 0);
        const headerEl = document.createElement('div');
        headerEl.style.gridColumn = '1 / -1';
        headerEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.15rem; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); padding: 0.35rem 0.65rem; border-radius: 6px; font-weight: 700; font-size: 0.82rem; letter-spacing: 0.5px;">
                        <i class="fa-solid fa-shapes"></i> COMPTE PCN 233
                    </span>
                    <div>
                        <strong style="color: var(--text-main); font-size: 1rem;">Participations & Filiales Détenues</strong>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">Titres de participation, parts sociales et filiales opérationnelles</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.78rem; color: var(--text-muted);">${participationsList.length} Sociétés &bull; Valeur Bilan : </span>
                    <strong style="color: var(--accent-emerald); font-size: 1.05rem;">${formatCurrency(totalPartVnc)}</strong>
                </div>
            </div>
        `;
        container.appendChild(headerEl);

        participationsList.forEach(p => {
            container.appendChild(createParticipationCard(p, allDocs));
        });
    }

    // Section 2: Créances Financières & Financement Associés (PCN 234)
    if (creancesList.length > 0) {
        const totalCreanceVnc = creancesList.reduce((acc, p) => acc + (Number(p.vnc) || 0), 0);
        const headerEl = document.createElement('div');
        headerEl.style.gridColumn = '1 / -1';
        headerEl.style.marginTop = participationsList.length > 0 ? '1.5rem' : '0';
        headerEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.15rem; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 10px; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); padding: 0.35rem 0.65rem; border-radius: 6px; font-weight: 700; font-size: 0.82rem; letter-spacing: 0.5px;">
                        <i class="fa-solid fa-money-bill-transfer"></i> COMPTE PCN 234
                    </span>
                    <div>
                        <strong style="color: var(--text-main); font-size: 1rem;">Créances Rattachées aux Participations & Financement Associés</strong>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">Avances de trésorerie, comptes courants d'associés et prêts intra-groupe immobilisés</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.78rem; color: var(--text-muted);">${creancesList.length} Ligne(s) &bull; Montant : </span>
                    <strong style="color: var(--accent-cyan, #06b6d4); font-size: 1.05rem;">${formatCurrency(totalCreanceVnc)}</strong>
                </div>
            </div>
        `;
        container.appendChild(headerEl);

        creancesList.forEach(p => {
            container.appendChild(createParticipationCard(p, allDocs));
        });
    }
}

// --- Tab 2: Table View ---
function renderPartTable() {
    const parts = getParticipations();
    const allDocs = getPartDocs();
    const tbody = document.getElementById('part-table-body');
    if (!tbody) return;

    const entityFilter = document.getElementById('part-entity-filter') ? document.getElementById('part-entity-filter').value : 'ALL';
    const statusFilter = document.getElementById('part-status-filter') ? document.getElementById('part-status-filter').value : 'ALL';
    const searchFilter = document.getElementById('part-search-input') ? document.getElementById('part-search-input').value.toLowerCase().trim() : '';

    tbody.innerHTML = '';

    const filtered = parts.filter(p => {
        if (entityFilter === 'ONLY_PARTS' && isCreance(p)) return false;
        if (entityFilter === 'ONLY_CREANCES' && !isCreance(p)) return false;
        if (entityFilter !== 'ALL' && entityFilter !== 'ONLY_PARTS' && entityFilter !== 'ONLY_CREANCES' && p.id !== entityFilter) return false;
        if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
        if (searchFilter) {
            const query = `${p.name} ${p.short_name} ${p.country} ${p.pcn_account} ${p.sector} ${p.rcs_number}`.toLowerCase();
            if (!query.includes(searchFilter)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-muted);">Aucune participation ou créance trouvée.</td></tr>`;
        return;
    }

    const participationsList = filtered.filter(p => !isCreance(p));
    const creancesList = filtered.filter(p => isCreance(p));

    function renderRow(p) {
        const entityDocs = allDocs.filter(d => d.part_id === p.id);
        const tr = document.createElement('tr');
        const isReceivable = isCreance(p);

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.2rem;">${p.flag || (isReceivable ? '💶' : '🏢')}</span>
                    <div>
                        <strong style="color: var(--text-main);">${p.name}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${p.sector || ''}</div>
                    </div>
                </div>
            </td>
            <td><span class="badge-country">${p.country}</span></td>
            <td><span class="badge-pcn" style="${isReceivable ? 'border-color: rgba(59, 130, 246, 0.4); color: var(--accent-blue);' : ''}">${p.pcn_code || (isReceivable ? '234' : '233')}</span></td>
            <td>${p.entry_date || '-'}</td>
            <td class="text-right">${formatCurrency(p.initial_invested)}</td>
            <td class="text-right text-amber">${formatCurrency(p.divested_amount)}</td>
            <td class="text-right text-bold ${isReceivable ? 'text-cyan' : 'text-emerald'}" style="font-size: 0.95rem;">${formatCurrency(p.vnc)}</td>
            <td class="text-center"><span class="badge badge-ord">${isReceivable ? 'Financement' : (p.pct_ownership || '-')}</span></td>
            <td class="text-center">
                <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem;" onclick="filterDocsForEntity('${p.id}')">
                    <i class="fa-solid fa-paperclip"></i> ${entityDocs.length} docs
                </button>
            </td>
            <td class="text-center">
                <div style="display: flex; gap: 0.3rem; justify-content: center;">
                    <button class="doc-btn-icon edit" onclick="openEditPartModal('${p.id}')" title="Modifier">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="doc-btn-icon delete" onclick="deleteParticipation('${p.id}')" title="Supprimer">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        return tr;
    }

    // Section 1: PCN 233
    if (participationsList.length > 0) {
        const subHead = document.createElement('tr');
        subHead.style.background = 'rgba(16, 185, 129, 0.1)';
        subHead.innerHTML = `
            <td colspan="10" style="padding: 0.65rem 1rem; font-weight: 700; color: var(--accent-emerald);">
                <i class="fa-solid fa-shapes"></i> COMPTE PCN 233 — PARTICIPATIONS DANS DES ENTREPRISES LIÉES / ASSOCIÉES
            </td>
        `;
        tbody.appendChild(subHead);

        let subInit = 0, subDiv = 0, subVnc = 0;
        participationsList.forEach(p => {
            subInit += Number(p.initial_invested) || 0;
            subDiv += Number(p.divested_amount) || 0;
            subVnc += Number(p.vnc) || 0;
            tbody.appendChild(renderRow(p));
        });

        const subFoot = document.createElement('tr');
        subFoot.style.background = 'rgba(255, 255, 255, 0.02)';
        subFoot.style.borderBottom = '2px solid rgba(16, 185, 129, 0.3)';
        subFoot.innerHTML = `
            <td colspan="4" style="font-weight: 700; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">
                Sous-total Participations (PCN 233)
            </td>
            <td class="text-right text-bold">${formatCurrency(subInit)}</td>
            <td class="text-right text-bold text-amber">${formatCurrency(subDiv)}</td>
            <td class="text-right text-bold text-emerald" style="font-size: 0.95rem;">${formatCurrency(subVnc)}</td>
            <td colspan="3"></td>
        `;
        tbody.appendChild(subFoot);
    }

    // Section 2: PCN 234
    if (creancesList.length > 0) {
        const subHead = document.createElement('tr');
        subHead.style.background = 'rgba(59, 130, 246, 0.1)';
        subHead.innerHTML = `
            <td colspan="10" style="padding: 0.65rem 1rem; font-weight: 700; color: var(--accent-blue);">
                <i class="fa-solid fa-money-bill-transfer"></i> COMPTE PCN 234 — CRÉANCES RATTACHÉES AUX PARTICIPATIONS & FINANCEMENT ASSOCIÉS
            </td>
        `;
        tbody.appendChild(subHead);

        let subInit = 0, subDiv = 0, subVnc = 0;
        creancesList.forEach(p => {
            subInit += Number(p.initial_invested) || 0;
            subDiv += Number(p.divested_amount) || 0;
            subVnc += Number(p.vnc) || 0;
            tbody.appendChild(renderRow(p));
        });

        const subFoot = document.createElement('tr');
        subFoot.style.background = 'rgba(255, 255, 255, 0.02)';
        subFoot.style.borderBottom = '2px solid rgba(59, 130, 246, 0.3)';
        subFoot.innerHTML = `
            <td colspan="4" style="font-weight: 700; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">
                Sous-total Créances Financières (PCN 234)
            </td>
            <td class="text-right text-bold">${formatCurrency(subInit)}</td>
            <td class="text-right text-bold text-amber">${formatCurrency(subDiv)}</td>
            <td class="text-right text-bold text-cyan" style="font-size: 0.95rem;">${formatCurrency(subVnc)}</td>
            <td colspan="3"></td>
        `;
        tbody.appendChild(subFoot);
    }

    // Grand Total Row
    const grandInit = filtered.reduce((a, b) => a + (Number(b.initial_invested) || 0), 0);
    const grandDiv = filtered.reduce((a, b) => a + (Number(b.divested_amount) || 0), 0);
    const grandVnc = filtered.reduce((a, b) => a + (Number(b.vnc) || 0), 0);

    const grandRow = document.createElement('tr');
    grandRow.style.background = 'rgba(255, 255, 255, 0.05)';
    grandRow.style.fontWeight = '700';
    grandRow.innerHTML = `
        <td colspan="4" style="color: var(--text-main); font-size: 0.85rem; text-transform: uppercase; padding: 0.85rem 1rem;">
            TOTAL GÉNÉRAL CLASSE PCN 23 (IMMOBILISATIONS FINANCIÈRES)
        </td>
        <td class="text-right" style="color: var(--text-main); font-size: 0.95rem;">${formatCurrency(grandInit)}</td>
        <td class="text-right text-amber" style="font-size: 0.95rem;">${formatCurrency(grandDiv)}</td>
        <td class="text-right text-emerald" style="font-size: 1.05rem;">${formatCurrency(grandVnc)}</td>
        <td colspan="3"></td>
    `;
    tbody.appendChild(grandRow);
}

// --- Tab 3: Dedicated Documents Archive ---
function renderPartDocsArchive() {
    const docs = getPartDocs();
    const container = document.getElementById('part-doc-archive-grid');
    if (!container) return;

    const entityFilter = document.getElementById('part-doc-entity-filter') ? document.getElementById('part-doc-entity-filter').value : 'ALL';
    const catFilter = document.getElementById('part-doc-cat-filter') ? document.getElementById('part-doc-cat-filter').value : 'ALL';
    const searchFilter = document.getElementById('part-doc-search-input') ? document.getElementById('part-doc-search-input').value.toLowerCase().trim() : '';

    container.innerHTML = '';

    const filtered = docs.filter(d => {
        if (entityFilter !== 'ALL' && d.part_id !== entityFilter) return false;
        if (catFilter !== 'ALL' && d.category !== catFilter) return false;
        if (searchFilter) {
            const query = `${d.title} ${d.part_name} ${d.filename} ${d.notes} ${d.category}`.toLowerCase();
            if (!query.includes(searchFilter)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);" class="glass-panel">
                <i class="fa-regular fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4;"></i>
                <p>Aucun document trouvé pour ces filtres.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(d => {
        const card = document.createElement('div');
        card.className = 'doc-card';

        const isAvailable = d.available === true;
        const fileIconClass = d.filename && d.filename.endsWith('.pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-contract';
        const fileIconColor = isAvailable ? 'var(--accent-rose)' : 'var(--text-muted)';
        const viewBtnClass = isAvailable ? 'doc-btn-icon view available' : 'doc-btn-icon view empty';
        const viewBtnTitle = isAvailable ? "Visualizza documento PDF disponibile" : "Nessun file caricato (Clicca per allegare)";
        const iconColor = isAvailable ? '#10b981' : '#64748b';

        card.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div class="doc-icon-wrapper" style="color: ${fileIconColor};">
                        <i class="${fileIconClass}"></i>
                    </div>
                    ${getCategoryBadge(d.category)}
                </div>

                <div style="font-size: 0.72rem; color: var(--accent-blue); font-weight: 700; text-transform: uppercase; margin-bottom: 0.2rem;">
                    <i class="fa-solid fa-building"></i> ${d.part_name || 'Participation'}
                </div>

                <div class="doc-name">${d.title}</div>
                <div class="doc-meta">
                    <span><i class="fa-regular fa-calendar"></i> Date réf. : <strong>${d.date || '-'}</strong></span>
                    <span><i class="fa-solid fa-paperclip"></i> Fichier : <em>${d.filename}</em> (${d.size || 'PDF'})</span>
                    ${d.notes ? `<span style="margin-top: 0.35rem; color: var(--text-muted); font-size: 0.75rem;"><i class="fa-solid fa-circle-info"></i> ${d.notes}</span>` : ''}
                </div>
            </div>

            <div class="doc-actions">
                <div>
                    ${isAvailable ? '<span style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-check"></i> Acte Archivé</span>' : '<span style="font-size: 0.72rem; color: var(--accent-amber); font-weight: 600;"><i class="fa-solid fa-clock"></i> Référence / À Déposer</span>'}
                </div>
                <div class="doc-action-group">
                    <button class="${viewBtnClass}" onclick="viewPartDocument('${d.id}')" title="${viewBtnTitle}">
                        <i class="fa-solid fa-eye" style="color: ${iconColor};"></i>
                    </button>
                    <button class="doc-btn-icon" onclick="downloadPartDocument('${d.id}')" title="Télécharger">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <button class="doc-btn-icon edit" onclick="openEditDocModal('${d.id}')" title="Modifier">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="doc-btn-icon delete" onclick="deletePartDocument('${d.id}')" title="Supprimer">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function filterDocsForEntity(partId) {
    const docEntityFilter = document.getElementById('part-doc-entity-filter');
    if (docEntityFilter) {
        docEntityFilter.value = partId;
    }
    switchTab('tab-part-docs');
    renderPartDocsArchive();
}

// --- Tab 4: Historical Movements ---
function renderPartHistory() {
    const movements = window.HISTORICAL_PART_MOVEMENTS || [];
    const tbody = document.getElementById('part-history-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    movements.forEach(m => {
        const tr = document.createElement('tr');
        const isEntree = m.direction === 'ENTRÉE';
        const badgeClass = isEntree ? 'badge-entree' : 'badge-sortie';
        const colorClass = isEntree ? 'text-emerald' : 'text-rose';

        tr.innerHTML = `
            <td><strong>${m.date}</strong></td>
            <td><strong style="color: var(--text-main);">${m.entity}</strong></td>
            <td><span class="badge ${badgeClass}">${m.type}</span></td>
            <td><code>${m.compte}</code></td>
            <td>${m.description}</td>
            <td class="text-right text-bold ${colorClass}">${formatCurrency(m.montant)}</td>
            <td class="text-center">
                ${m.doc_ref ? `<button class="btn btn-secondary btn-sm" style="font-size: 0.72rem;" onclick="viewPartDocument('${m.doc_ref}')"><i class="fa-solid fa-file-pdf"></i> Acte</button>` : '-'}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// --- Charts ---
function initCharts() {
    const doughnutCanvas = document.getElementById('chart-part-doughnut');
    const geoCanvas = document.getElementById('chart-part-geo');
    if (!doughnutCanvas || !geoCanvas) return;

    const parts = getParticipations();
    const labels = parts.map(p => p.short_name || p.name);
    const values = parts.map(p => Number(p.vnc) || 0);

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#8b5cf6'];

    if (partDoughnutChart) partDoughnutChart.destroy();
    partDoughnutChart = new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#1c2541'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ` ${ctx.label}: ${formatCurrency(ctx.raw)}`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });

    // Geo exposure
    const geoCounts = {};
    parts.forEach(p => {
        const country = p.country || 'Autre';
        geoCounts[country] = (geoCounts[country] || 0) + (Number(p.vnc) || 0);
    });

    const geoLabels = Object.keys(geoCounts);
    const geoValues = Object.values(geoCounts);

    if (partGeoChart) partGeoChart.destroy();
    partGeoChart = new Chart(geoCanvas, {
        type: 'bar',
        data: {
            labels: geoLabels,
            datasets: [{
                label: 'Valeur au Bilan (€)',
                data: geoValues,
                backgroundColor: ['#3b82f6', '#10b981', '#06b6d4', '#f59e0b'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ` ${ctx.label}: ${formatCurrency(ctx.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function updateCharts() {
    initCharts();
}

let currentViewingDocId = null;

// --- Document Viewer Modal ---
async function viewPartDocument(docId) {
    const docs = getPartDocs();
    const d = docs.find(item => item.id === docId);
    if (!d) return;

    currentViewingDocId = docId;

    const titleEl = document.getElementById('view-modal-title');
    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-file-pdf text-rose"></i> ${d.title} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted); margin-left: 0.5rem;">(${d.part_name || ''})</span>`;
    }

    const frame = document.getElementById('pdf-viewer-frame');
    const dlLink = document.getElementById('modal-download-link');
    const tabLink = document.getElementById('modal-open-tab-link');
    const emptyNotice = document.getElementById('pdf-viewer-empty-notice');

    // Check file in DocStorage or relative path
    let fileUrl = null;
    if (window.DocStorage) {
        fileUrl = await window.DocStorage.getFileUrl(docId, d.filepath);
    } else {
        fileUrl = d.filepath;
    }

    if (!fileUrl && d.available) {
        if (d.id === 'DOC-SEF-02' || (d.title && d.title.toLowerCase().includes('visura') && d.part_id === 'PART-SEF')) {
            fileUrl = 'docs/SEF srl - visura del 28.9.26.pdf';
        }
    }

    if (fileUrl && (d.available !== false || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:'))) {
        const encodedUrl = encodeURI(fileUrl);
        if (frame) {
            frame.style.display = 'block';
            frame.src = encodedUrl;
        }
        if (emptyNotice) emptyNotice.style.display = 'none';
        if (tabLink) {
            tabLink.style.display = 'inline-flex';
            tabLink.href = encodedUrl;
        }
        if (dlLink) {
            dlLink.style.display = 'inline-flex';
            dlLink.href = encodedUrl;
            dlLink.setAttribute('download', d.filename || 'document.pdf');
        }
    } else {
        // Not physically stored yet: show direct uploader inside viewer modal
        if (frame) {
            frame.style.display = 'none';
            frame.src = '';
        }
        if (tabLink) tabLink.style.display = 'none';
        if (dlLink) dlLink.style.display = 'none';
        if (emptyNotice) {
            emptyNotice.style.display = 'flex';
            emptyNotice.innerHTML = `
                <div style="text-align: center; max-width: 520px; padding: 2.5rem 1.5rem; background: var(--card-bg, #1e293b); border: 1px dashed var(--border-color, #334155); border-radius: 12px;">
                    <i class="fa-solid fa-file-pdf" style="font-size: 3.5rem; color: var(--accent-rose, #f43f5e); margin-bottom: 1rem; opacity: 0.85;"></i>
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-main, #f8fafc); font-size: 1.15rem;">${d.title}</h3>
                    <p style="color: var(--text-muted, #94a3b8); font-size: 0.88rem; margin-bottom: 1.5rem; line-height: 1.4;">
                        Documento registrato per <strong>${d.part_name || 'SEF Srl'}</strong>.<br>
                        Il file PDF non è ancora presente in memoria locale o nella cartella <code>docs/</code>.
                    </p>
                    <label class="btn btn-primary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; padding: 0.65rem 1.25rem;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Carica e Visualizza PDF adesso
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style="display: none;" onchange="handleDirectDocUpload('${d.id}', this)">
                    </label>
                    <div style="font-size: 0.75rem; color: var(--text-muted, #94a3b8); margin-top: 1rem;">
                        Puoi anche copiare il file <code>${d.filename}</code> nella cartella <code>docs/</code> dell'applicazione.
                    </div>
                </div>
            `;
        }
    }

    const modal = document.getElementById('view-doc-modal');
    if (modal) modal.classList.add('active');
}

async function handleModalDeleteDoc() {
    if (!currentViewingDocId) return;
    const docId = currentViewingDocId;
    closeViewModal();
    await deletePartDocument(docId);
}

async function handleDirectDocUpload(docId, inputElement) {
    if (!inputElement.files || inputElement.files.length === 0) return;
    const file = inputElement.files[0];

    if (window.DocStorage) {
        await window.DocStorage.saveFile(docId, file, file.name, file.type);
    }

    const docs = getPartDocs();
    const idx = docs.findIndex(d => d.id === docId);
    if (idx !== -1) {
        docs[idx].available = true;
        docs[idx].has_stored_file = true;
        docs[idx].filename = file.name;
        docs[idx].size = (file.size / (1024 * 1024)).toFixed(2) + ' Mo';
        savePartDocs(docs);
    }

    renderCurrentView();
    renderPartDocsArchive();
    await viewPartDocument(docId);
}

async function downloadPartDocument(docId) {
    const docs = getPartDocs();
    const d = docs.find(item => item.id === docId);
    if (!d) return;

    let fileUrl = null;
    if (window.DocStorage) {
        fileUrl = await window.DocStorage.getFileUrl(docId, d.filepath);
    } else {
        fileUrl = d.filepath;
    }

    if (!fileUrl && d.available) {
        if (d.id === 'DOC-SEF-02' || (d.title && d.title.toLowerCase().includes('visura') && d.part_id === 'PART-SEF')) {
            fileUrl = 'docs/SEF srl - visura del 28.9.26.pdf';
        }
    }

    if (fileUrl) {
        const a = document.createElement('a');
        a.href = encodeURI(fileUrl);
        a.download = d.filename || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        await viewPartDocument(docId);
    }
}

function closeViewModal() {
    const frame = document.getElementById('pdf-viewer-frame');
    if (frame) frame.src = '';
    const modal = document.getElementById('view-doc-modal');
    if (modal) modal.classList.remove('active');
}

// --- Add / Edit Participation Modal ---
function openAddPartModal() {
    document.getElementById('part-form-id').value = '';
    document.getElementById('part-form-name').value = '';
    document.getElementById('part-form-short-name').value = '';
    document.getElementById('part-form-country').value = '';
    document.getElementById('part-form-flag').value = '🏢';
    document.getElementById('part-form-pcn').value = '233 - PARTICIPATIONS';
    document.getElementById('part-form-sector').value = '';
    document.getElementById('part-form-rcs').value = '';
    document.getElementById('part-form-headquarters').value = '';
    document.getElementById('part-form-rep').value = '';
    document.getElementById('part-form-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('part-form-initial').value = '0.00';
    document.getElementById('part-form-divested').value = '0.00';
    document.getElementById('part-form-vnc').value = '0.00';
    document.getElementById('part-form-pct').value = '100%';
    document.getElementById('part-form-status').value = 'active';
    document.getElementById('part-form-notes').value = '';

    document.getElementById('modal-part-title').textContent = 'Ajouter une Nouvelle Participation';
    document.getElementById('edit-part-modal').classList.add('active');
}

function openEditPartModal(partId) {
    const parts = getParticipations();
    const p = parts.find(item => item.id === partId);
    if (!p) return;

    document.getElementById('part-form-id').value = p.id;
    document.getElementById('part-form-name').value = p.name || '';
    document.getElementById('part-form-short-name').value = p.short_name || '';
    document.getElementById('part-form-country').value = p.country || '';
    document.getElementById('part-form-flag').value = p.flag || '🏢';
    document.getElementById('part-form-pcn').value = p.pcn_account || '233 - PARTICIPATIONS';
    document.getElementById('part-form-sector').value = p.sector || '';
    document.getElementById('part-form-rcs').value = p.rcs_number || '';
    document.getElementById('part-form-headquarters').value = p.headquarters || '';
    document.getElementById('part-form-rep').value = p.rep_name || '';
    document.getElementById('part-form-date').value = p.entry_date || '';
    document.getElementById('part-form-initial').value = p.initial_invested || 0;
    document.getElementById('part-form-divested').value = p.divested_amount || 0;
    document.getElementById('part-form-vnc').value = p.vnc || 0;
    document.getElementById('part-form-pct').value = p.pct_ownership || '';
    document.getElementById('part-form-status').value = p.status || 'active';
    document.getElementById('part-form-notes').value = p.notes || '';

    document.getElementById('modal-part-title').textContent = 'Modifier la Participation';
    document.getElementById('edit-part-modal').classList.add('active');
}

function closePartModal() {
    document.getElementById('edit-part-modal').classList.remove('active');
}

function savePartForm() {
    const id = document.getElementById('part-form-id').value;
    const name = document.getElementById('part-form-name').value.trim();
    if (!name) {
        alert('Veuillez saisir le nom de la société.');
        return;
    }

    const shortName = document.getElementById('part-form-short-name').value.trim() || name;
    const country = document.getElementById('part-form-country').value.trim() || 'International';
    const flag = document.getElementById('part-form-flag').value.trim() || '🏢';
    const pcn = document.getElementById('part-form-pcn').value.trim() || '233 - PARTICIPATIONS';
    const sector = document.getElementById('part-form-sector').value.trim();
    const rcs = document.getElementById('part-form-rcs').value.trim();
    const headquarters = document.getElementById('part-form-headquarters').value.trim();
    const rep = document.getElementById('part-form-rep').value.trim();
    const date = document.getElementById('part-form-date').value;
    const initial = parseFloat(document.getElementById('part-form-initial').value) || 0;
    const divested = parseFloat(document.getElementById('part-form-divested').value) || 0;
    const vnc = parseFloat(document.getElementById('part-form-vnc').value) || (initial - divested);
    const pct = document.getElementById('part-form-pct').value.trim() || '100%';
    const status = document.getElementById('part-form-status').value;
    const notes = document.getElementById('part-form-notes').value.trim();

    const parts = getParticipations();

    if (id) {
        // Edit existing
        const idx = parts.findIndex(p => p.id === id);
        if (idx !== -1) {
            parts[idx] = {
                ...parts[idx],
                name,
                short_name: shortName,
                country,
                flag,
                pcn_account: pcn,
                pcn_code: pcn.split(' ')[0] || '233',
                sector,
                rcs_number: rcs,
                headquarters,
                rep_name: rep,
                entry_date: date,
                initial_invested: initial,
                divested_amount: divested,
                vnc,
                pct_ownership: pct,
                status,
                notes
            };
        }
    } else {
        // Create new
        const newId = 'PART-' + Date.now().toString().slice(-4);
        parts.push({
            id: newId,
            name,
            short_name: shortName,
            country,
            flag,
            legal_form: 'Société',
            pcn_account: pcn,
            pcn_code: pcn.split(' ')[0] || '233',
            sector,
            rcs_number: rcs,
            headquarters,
            rep_name: rep,
            entry_date: date,
            initial_invested: initial,
            divested_amount: divested,
            vnc,
            pct_ownership: pct,
            status,
            status_label: status === 'active' ? 'Actif' : 'Cédé',
            notes
        });
    }

    saveParticipations(parts);
    populateEntityFilters();
    closePartModal();
    renderCurrentView();
}

function deleteParticipation(partId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette participation du portefeuille ?")) return;
    let parts = getParticipations();
    parts = parts.filter(p => p.id !== partId);
    saveParticipations(parts);
    populateEntityFilters();
    renderCurrentView();
}

// --- Add / Edit Document Modal ---
function openAddDocModal(preselectedPartId) {
    populateEntityFilters();
    document.getElementById('modal-doc-id').value = '';
    document.getElementById('modal-doc-title').value = '';
    document.getElementById('modal-doc-category').value = 'acte';
    document.getElementById('modal-doc-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-doc-filename').value = '';
    document.getElementById('modal-doc-notes').value = '';

    if (preselectedPartId) {
        document.getElementById('modal-doc-part-id').value = preselectedPartId;
    }

    document.getElementById('modal-doc-form-title').textContent = 'Rattacher un Document à une Participation';
    document.getElementById('edit-doc-modal').classList.add('active');
}

function openEditDocModal(docId) {
    populateEntityFilters();
    const docs = getPartDocs();
    const d = docs.find(item => item.id === docId);
    if (!d) return;

    document.getElementById('modal-doc-id').value = d.id;
    document.getElementById('modal-doc-part-id').value = d.part_id || '';
    document.getElementById('modal-doc-title').value = d.title || '';
    document.getElementById('modal-doc-category').value = d.category || 'acte';
    document.getElementById('modal-doc-date').value = d.date || '';
    document.getElementById('modal-doc-filename').value = d.filename || '';
    document.getElementById('modal-doc-notes').value = d.notes || '';

    document.getElementById('modal-doc-form-title').textContent = 'Modifier le Document';
    document.getElementById('edit-doc-modal').classList.add('active');
}

function closeDocModal() {
    document.getElementById('edit-doc-modal').classList.remove('active');
}

async function saveDocForm() {
    const id = document.getElementById('modal-doc-id').value;
    const partId = document.getElementById('modal-doc-part-id').value;
    const title = document.getElementById('modal-doc-title').value.trim();
    if (!title) {
        alert('Veuillez saisir un titre de document.');
        return;
    }

    const category = document.getElementById('modal-doc-category').value;
    const date = document.getElementById('modal-doc-date').value;
    let filename = document.getElementById('modal-doc-filename').value.trim();
    const fileInput = document.getElementById('modal-doc-file-input');
    const selectedFile = fileInput && fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null;

    if (selectedFile) {
        filename = selectedFile.name;
    }
    if (!filename) {
        filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    }

    const notes = document.getElementById('modal-doc-notes').value.trim();

    const parts = getParticipations();
    const partObj = parts.find(p => p.id === partId);
    const partName = partObj ? partObj.name : 'Participation';

    const docs = getPartDocs();

    let targetDocId = id;
    if (id) {
        // Edit existing
        const idx = docs.findIndex(d => d.id === id);
        if (idx !== -1) {
            docs[idx].part_id = partId;
            docs[idx].part_name = partName;
            docs[idx].title = title;
            docs[idx].category = category;
            docs[idx].date = date;
            docs[idx].filename = filename;
            docs[idx].notes = notes;
            if (selectedFile) {
                docs[idx].size = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo`;
                docs[idx].available = true;
                docs[idx].has_stored_file = true;
            }
        }
    } else {
        // Create new
        targetDocId = 'DOC-PART-' + Date.now().toString().slice(-4);
        const newDoc = {
            id: targetDocId,
            part_id: partId,
            part_name: partName,
            title: title,
            category: category,
            date: date || new Date().toISOString().split('T')[0],
            filename: filename,
            filepath: `docs/${filename}`,
            size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo` : '1.20 Mo',
            type: selectedFile ? selectedFile.type : 'PDF Document',
            notes: notes,
            available: !!selectedFile,
            has_stored_file: !!selectedFile
        };
        docs.unshift(newDoc);
    }

    if (selectedFile && window.DocStorage) {
        await window.DocStorage.saveFile(targetDocId, selectedFile, selectedFile.name, selectedFile.type);
    }

    savePartDocs(docs);
    closeDocModal();
    renderCurrentView();
    renderPartDocsArchive();

    if (selectedFile) {
        await viewPartDocument(targetDocId);
    }
}

async function deletePartDocument(docId) {
    const docs = getPartDocs();
    const targetDoc = docs.find(d => d.id === docId);
    if (!targetDoc) return;

    const isSystemDoc = targetDoc.id.startsWith('DOC-SEF-') || targetDoc.id.startsWith('DOC-SAF-') || targetDoc.id.startsWith('DOC-GEB-') || targetDoc.id.startsWith('DOC-CRE-');

    let confirmMsg = `Sei sicuro di voler eliminare il documento "${targetDoc.title}"?`;
    if (isSystemDoc && targetDoc.available) {
        confirmMsg = `Vuoi rimuovere il file PDF allegato a "${targetDoc.title}"? (L'icona tornerà grigia e il file verrà staccato)`;
    }

    if (!confirm(confirmMsg)) return;

    if (isSystemDoc) {
        targetDoc.available = false;
        targetDoc.has_stored_file = false;
        targetDoc.filename = targetDoc.title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
        targetDoc.size = 'Non caricato';
    } else {
        const idx = docs.findIndex(d => d.id === docId);
        if (idx !== -1) docs.splice(idx, 1);
    }

    savePartDocs(docs);
    if (window.DocStorage) {
        await window.DocStorage.deleteFile(docId);
    }
    renderCurrentView();
    renderPartDocsArchive();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initPartecipazioni);
