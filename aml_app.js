/**
 * NEW LIFE Sàrl - Logique Métier Conformité AML / LBC-FT & KYC
 * Contrôle des Entrées de Fonds, Mandats d'Administrateur et RBE
 */

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

// État global des filtres
let amlFilterYear = 'ALL';
let amlFilterClient = 'ALL';
let amlFilterEntityType = 'ALL';
let amlFilterKycStatus = 'ALL';
let amlFilterThreshold = 0; // 0, 5000, 10000, 25000
let amlFilterPepOnly = false;
let amlSearchQuery = '';

// Récupération des données personnalisées / mémorisées dans localStorage
function getAmlCustomStorage() {
    try {
        const raw = localStorage.getItem('new_life_aml_custom_clients');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveAmlCustomStorage(data) {
    try {
        localStorage.setItem('new_life_aml_custom_clients', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving AML storage:', e);
    }
}

// Obtenir la fiche enrichie d'un client
function getEnrichedClient(clientName) {
    const defaultRegistry = window.NEW_LIFE_AML_CLIENTS || {};
    const customStorage = getAmlCustomStorage();
    
    let resolvedKey = clientName;
    if (clientName === 'ERSEL GESTION INTERNATIONALE SA' || clientName === 'ERSEL GESTION INTERNATIONALE' || clientName === 'ERSEL INTERNATIONAL S.A.') {
        resolvedKey = 'ERSEL INTERNATIONAL';
    } else if (clientName === 'EUROPA PLUS S.A.' || clientName === 'EUROPA PLUS SA' || clientName === 'EUROPA PLUS Sàrl') {
        resolvedKey = 'EUROPA PLUS';
    } else if (clientName && clientName.startsWith('PALS ADVISORS')) {
        resolvedKey = 'PALS ADVISORS';
    } else if (clientName && clientName.startsWith('MACRO INTERNATIONAL')) {
        resolvedKey = 'MACRO INTERNATIONAL SA';
    }

    let base = defaultRegistry[resolvedKey] || defaultRegistry[clientName];
    if (!base) {
        // Détecter ou générer un profil par défaut si nouveau
        base = {
            id: 'CLI-' + Math.floor(Math.random() * 900 + 100),
            name: clientName || 'Client Non Référencé',
            legal_name: clientName || 'Société Non Spécifiée',
            entity_type: 'SARL_COMMERCIALE',
            entity_type_label: 'Société Commerciale',
            rcs_number: 'En cours',
            matricule: '',
            tva_number: '',
            address: 'Siège social à compléter',
            postal_code: '',
            city: 'Luxembourg',
            country: 'Luxembourg',
            country_code: 'LU',
            mandate_nature: "Mandat d'Administrateur / Conseil en Gestion",
            mandate_start_date: '2020-01-01',
            ubo_list: [{ name: 'Bénéficiaire Effectif', nationality: 'Européenne', percentage: 100, rbe_verified: false }],
            is_pep: false,
            pep_details: '',
            aml_risk_level: 'LOW',
            aml_kyc_status: 'A_COMPLETER',
            last_review_date: '2026-01-01',
            next_review_date: '2027-01-01',
            documents: [
                { name: 'Extrait RCSL', status: 'PENDING', date: '' },
                { name: 'Déclaration RBE', status: 'PENDING', date: '' },
                { name: 'Pièce Identité UBO', status: 'PENDING', date: '' },
                { name: 'Contrat / Mandat', status: 'VALID', date: '2020-01-01' }
            ],
            notes: 'Dossier à compléter lors de la prochaine revue périodique.'
        };
    }

    if (customStorage[clientName]) {
        return { ...base, ...customStorage[clientName] };
    }
    return base;
}

// Récupérer toutes les recettes réelles de prestations & mandats d'administrateur éligibles au contrôle AML
function getAmlInflows() {
    const data = window.NEW_LIFE_DATA || { records: [] };
    const records = data.records || [];
    
    // Filtrer strictement les encaissements réels de clients (hors remboursements de frais, hors stornos et hors opérations personnelles)
    const rawInflows = records.filter(r => {
        if (r.is_storno || r.is_transfert) return false;

        const fourn = (r.fournisseur || '').trim();
        const desc = (r.description || '').toLowerCase();
        const macro = (r.macro || '').trim();
        const classe = (r.class || '').trim();
        const nrFatt = (r.nr_fatt || '').trim();

        // 1. Exclure expressément les opérations personnelles / rimborsi spese Tubia Edoardo
        if (fourn.toLowerCase().includes('tubia') || desc.includes('tubia')) return false;

        // 2. Exclure les écritures de storno, remboursements de frais avancés, financements associés, acomptes dividendes
        if (desc.includes('storno') || desc.includes('rimborso') || desc.includes('frais diverses') || 
            desc.includes('finanziamento') || desc.includes('dividend') || desc.includes('extourne') || 
            desc.includes('saldo conto banca') || desc.includes("prime d'etat")) {
            return false;
        }

        // 3. Exclure les administrations fiscales et sécurité sociale (ACD, CCSS, Notaire, Banque directe)
        if (fourn.toLowerCase().includes('contributions directes') || fourn.toLowerCase().includes('ccss') || 
            fourn.toLowerCase().includes('notaire') || fourn.toLowerCase().includes('administration') || 
            fourn.toLowerCase() === 'ing') {
            return false;
        }

        // 4. Exclure les amortissements et refacturations fournisseurs
        if (desc.includes('amortissement') || macro.toLowerCase().includes('consomm.') || macro.toLowerCase().includes('immobilisations')) {
            return false;
        }

        // 5. Ne retenir que le Chiffre d'Affaires (Classe 70), les Factures Clients (FACT) ou les Sociétés Clientes Référencées
        const isChiffreAffaires = macro.startsWith('70') || classe.startsWith('70');
        const isClientInvoice = nrFatt.startsWith('FACT') || desc.includes('facturation');
        const isKnownClient = [
            'PALS ADVISORS', 'EUROPA PLUS', 'EUROPA PLUS S.A.', 'ERSEL INTERNATIONAL', 'ERSEL GESTION INTERNATIONALE SA', 'ERSEL GESTION INTERNATIONALE',
            'BG COLLECTION INVETMENTS (ex SELECTION) SICAV', 'BG COLLECTION INVESTMENTS SICAV',
            'LUX IM SICAV (ex BG Sicav)', 'LUX IM SICAV',
            'BG PRIVATE MARKETS (ex ALTERNATIVE) SICAV', 'BG PRIVATE MARKETS SICAV',
            'ARIEL SPF SA', 'FORTAU INVESTMENTS SPF SA', 'OIRA INVESTMENTS SPF SA', 
            'ORTE INVESTMENTS SPF SA', 'MICRO INTERNATIONAL SA', 'MACRO INTERNATIONAL SA', 
            'GREEN ENERBRAS ONE SCSp', 'GLENELG SA'
        ].includes(fourn);

        const totalAmt = Math.abs(r.total || r.montant || 0);
        return (isChiffreAffaires || isClientInvoice || isKnownClient) && totalAmt > 0;
    });

    return rawInflows.map(r => {
        const clientName = r.fournisseur || 'EUROPA PLUS';
        const clientProfile = getEnrichedClient(clientName);
        const amount = Math.abs(r.total || r.montant || 0);
        
        let thresholdCat = 'STANDARD';
        if (amount >= 25000) thresholdCat = 'MAJOR_25K';
        else if (amount >= 10000) thresholdCat = 'DUE_DILIGENCE_10K';
        else if (amount >= 5000) thresholdCat = 'VIGILANCE_5K';

        return {
            ...r,
            client_name: clientName,
            client_profile: clientProfile,
            threshold_cat: thresholdCat,
            is_pep: clientProfile.is_pep || false,
            aml_risk_level: clientProfile.aml_risk_level || 'LOW',
            aml_kyc_status: clientProfile.aml_kyc_status || 'CONFORME'
        };
    });
}

// Filtrage dynamique
function getFilteredAmlInflows() {
    const all = getAmlInflows();
    const query = amlSearchQuery.toLowerCase().trim();

    return all.filter(item => {
        // Année
        if (amlFilterYear !== 'ALL') {
            const yr = parseInt(amlFilterYear);
            if (item.an !== yr && item.compet_contabile !== yr) return false;
        }

        // Client
        if (amlFilterClient !== 'ALL' && item.client_name !== amlFilterClient) {
            return false;
        }

        // Type d'entité
        if (amlFilterEntityType !== 'ALL') {
            if (item.client_profile.entity_type !== amlFilterEntityType) return false;
        }

        // Statut KYC
        if (amlFilterKycStatus !== 'ALL') {
            if (item.aml_kyc_status !== amlFilterKycStatus) return false;
        }

        // Seuil AML
        const amt = Math.abs(item.total || 0);
        if (amt < amlFilterThreshold) {
            return false;
        }

        // Filtre PEP
        if (amlFilterPepOnly && !item.is_pep) {
            return false;
        }

        // Recherche texte
        if (query) {
            const matchName = (item.client_name || '').toLowerCase().includes(query);
            const matchLegal = (item.client_profile.legal_name || '').toLowerCase().includes(query);
            const matchDesc = (item.description || '').toLowerCase().includes(query);
            const matchFatt = (item.nr_fatt || '').toLowerCase().includes(query);
            const matchRcs = (item.client_profile.rcs_number || '').toLowerCase().includes(query);
            if (!matchName && !matchLegal && !matchDesc && !matchFatt && !matchRcs) return false;
        }

        return true;
    }).sort((a, b) => {
        const dtA = a.date || '';
        const dtB = b.date || '';
        if (dtA !== dtB) {
            return dtB.localeCompare(dtA);
        }
        return (b.id || 0) - (a.id || 0);
    });
}

// Mise à jour des KPIs
function updateAmlKPIs() {
    const filtered = getFilteredAmlInflows();
    const all = getAmlInflows();

    const totalVol = filtered.reduce((sum, r) => sum + Math.abs(r.total || 0), 0);
    const countOps = filtered.length;

    // Statuts de conformité
    const compliantCount = filtered.filter(r => r.aml_kyc_status === 'CONFORME').length;
    const attentionCount = filtered.filter(r => r.aml_kyc_status === 'A_COMPLETER' || r.aml_kyc_status === 'VIGILANCE_RENFORCEE').length;
    const highRiskCount = filtered.filter(r => r.aml_risk_level === 'HIGH' || r.is_pep).length;

    const complianceRate = countOps > 0 ? ((compliantCount / countOps) * 100).toFixed(1) + '%' : '100%';

    const elVol = document.getElementById('aml-kpi-volume');
    const elOps = document.getElementById('aml-kpi-ops');
    const elComp = document.getElementById('aml-kpi-compliance');
    const elAtt = document.getElementById('aml-kpi-attention');
    const elPep = document.getElementById('aml-kpi-pep');

    if (elVol) elVol.textContent = formatCurrency(totalVol);
    if (elOps) elOps.textContent = formatNumber(countOps);
    if (elComp) elComp.textContent = complianceRate;
    if (elAtt) elAtt.textContent = formatNumber(attentionCount);
    if (elPep) elPep.textContent = formatNumber(highRiskCount);
}

// Rendu du Tableau 1 : Registre des recettes & AML
function renderAmlRegistryTable() {
    const tbody = document.getElementById('aml-registry-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const records = getFilteredAmlInflows();
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';

    if (records.length === 0) {
        const msg = (lang === 'it') ? 'Nessuna operazione trovata con i filtri selezionati.' : ((lang === 'en') ? 'No operations match the selected filters.' : 'Aucune opération trouvée avec les filtres sélectionnés.');
        tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">${msg}</td></tr>`;
        return;
    }

    records.forEach(r => {
        const cp = r.client_profile;
        const amtHt = r.montant || 0;
        const amtTva = r.tva || 0;
        const amtTotal = r.total || 0;

        // Badges Risque & KYC
        let riskLabel = (lang === 'it') ? 'Basso' : ((lang === 'en') ? 'Low' : 'Faible');
        let riskBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); font-weight: 700;"><i class="fa-solid fa-shield-check"></i> ${riskLabel}</span>`;
        if (r.aml_risk_level === 'HIGH') {
            riskLabel = (lang === 'it') ? 'Elevato' : ((lang === 'en') ? 'High' : 'Élevé');
            riskBadge = `<span class="badge" style="background: rgba(244, 63, 94, 0.2); color: var(--accent-rose); font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> ${riskLabel}</span>`;
        } else if (r.aml_risk_level === 'MEDIUM') {
            riskLabel = (lang === 'it') ? 'Medio' : ((lang === 'en') ? 'Medium' : 'Moyen');
            riskBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); font-weight: 700;"><i class="fa-solid fa-shield"></i> ${riskLabel}</span>`;
        }

        let kycBadge = '';
        if (r.aml_kyc_status === 'CONFORME') {
            const kycTxt = (lang === 'en') ? 'Compliant' : 'Conforme';
            kycBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); font-weight: 700;"><i class="fa-solid fa-circle-check"></i> ${kycTxt}</span>`;
        } else if (r.aml_kyc_status === 'VIGILANCE_RENFORCEE') {
            const kycTxt = (lang === 'it') ? 'Vigilanza Raff.' : ((lang === 'en') ? 'Enhanced Vig.' : 'Vigilance Renf.');
            kycBadge = `<span class="badge" style="background: rgba(244, 63, 94, 0.2); color: var(--accent-rose); font-weight: 700;"><i class="fa-solid fa-circle-exclamation"></i> ${kycTxt}</span>`;
        } else {
            const kycTxt = (lang === 'it') ? 'Da Completare' : ((lang === 'en') ? 'Pending' : 'À Compléter');
            kycBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); font-weight: 700;"><i class="fa-solid fa-clock"></i> ${kycTxt}</span>`;
        }

        let thresholdBadge = '';
        if (amtTotal >= 25000) {
            thresholdBadge = '<span class="badge" style="background: rgba(139, 92, 246, 0.2); color: #a78bfa; font-size: 0.75rem;">≥ 25.000 €</span>';
        } else if (amtTotal >= 10000) {
            const ueLabel = (lang === 'en') ? 'EU' : 'UE';
            thresholdBadge = `<span class="badge" style="background: rgba(6, 182, 212, 0.2); color: var(--accent-cyan); font-size: 0.75rem;">≥ 10.000 € (${ueLabel})</span>`;
        } else if (amtTotal >= 5000) {
            thresholdBadge = '<span class="badge" style="background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); font-size: 0.75rem;">≥ 5.000 €</span>';
        } else {
            thresholdBadge = '<span class="badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted); font-size: 0.75rem;">Standard</span>';
        }

        const kycBtnTitle = (lang === 'it') ? 'Apri fascicolo KYC' : ((lang === 'en') ? 'Open KYC file' : 'Ouvrir le dossier KYC');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 600; white-space: nowrap;">${r.date}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <strong style="color: var(--text-main);">${r.client_name}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${cp.legal_name} &bull; RCS: ${cp.rcs_number}</span>
                </div>
            </td>
            <td>
                <div style="font-size: 0.85rem;">
                    <span style="color: var(--accent-blue); font-weight: 600;">${cp.mandate_nature.split('/')[0]}</span>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">${r.description || ''}</p>
                </div>
            </td>
            <td style="white-space: nowrap;"><span class="badge badge-ord">${r.nr_fatt || '--'}</span></td>
            <td class="text-right" style="font-weight: 600; white-space: nowrap;">${formatCurrency(amtHt)}</td>
            <td class="text-right" style="color: var(--text-muted); font-size: 0.85rem; white-space: nowrap;">${formatCurrency(amtTva)}</td>
            <td class="text-right" style="font-weight: 800; color: var(--accent-emerald); font-size: 1.05rem; white-space: nowrap;">${formatCurrency(amtTotal)}</td>
            <td style="text-align: center; white-space: nowrap;">${thresholdBadge}</td>
            <td style="text-align: center; white-space: nowrap;">${riskBadge}</td>
            <td style="text-align: center; white-space: nowrap;">${kycBadge}</td>
            <td style="text-align: center; white-space: nowrap;">
                <button class="btn btn-secondary btn-sm" onclick="openAmlKycModal('${r.client_name.replace(/'/g, "\\'")}')" title="${kycBtnTitle}">
                    <i class="fa-solid fa-folder-open text-emerald"></i> KYC
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Gestion de l'ordre personnalisé des fiches Cartographie (Drag & Drop)
function getAmlCardsOrder() {
    const clientsRegistry = window.NEW_LIFE_AML_CLIENTS || {};
    const defaultKeys = Object.keys(clientsRegistry);
    try {
        const raw = localStorage.getItem('new_life_aml_cards_order');
        if (raw) {
            const saved = JSON.parse(raw);
            if (Array.isArray(saved) && saved.length > 0) {
                const validSaved = saved.filter(k => defaultKeys.includes(k));
                const missingKeys = defaultKeys.filter(k => !validSaved.includes(k));
                return [...validSaved, ...missingKeys];
            }
        }
    } catch (e) {
        console.error('Error loading card order:', e);
    }
    return defaultKeys;
}

function saveAmlCardsOrder(orderArray) {
    try {
        localStorage.setItem('new_life_aml_cards_order', JSON.stringify(orderArray));
    } catch (e) {
        console.error('Error saving card order:', e);
    }
}

function resetAmlCardsOrder() {
    localStorage.removeItem('new_life_aml_cards_order');
    renderAmlClientsGrid();
}

let draggedClientKey = null;

// Rendu du Tableau 2 : Cartographie des Clients & Mandats (avec Drag & Drop libre)
function renderAmlClientsGrid() {
    const container = document.getElementById('aml-clients-container');
    if (!container) return;
    container.innerHTML = '';

    const allInflows = getAmlInflows();
    const orderedKeys = getAmlCardsOrder();
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';

    const handleTitle = (lang === 'it') ? 'Trascina per riordinare' : ((lang === 'en') ? 'Drag to reorder' : 'Glisser-déposer pour réorganiser');
    const exemptLabel = (lang === 'it') ? 'Esente' : ((lang === 'en') ? 'Exempt' : 'Exonéré');

    orderedKeys.forEach(clientKey => {
        const client = getEnrichedClient(clientKey);
        
        // Calculer totaux historiques pour ce client
        const clientOps = allInflows.filter(r => r.client_name === clientKey);
        const totalVol = clientOps.reduce((s, r) => s + Math.abs(r.total || 0), 0);
        const countOps = clientOps.length;

        // Badges
        const riskColor = client.aml_risk_level === 'HIGH' ? 'var(--accent-rose)' : (client.aml_risk_level === 'MEDIUM' ? 'var(--accent-amber)' : 'var(--accent-emerald)');
        const riskText = client.aml_risk_level === 'HIGH' ? ((lang === 'it') ? 'Elevato' : ((lang === 'en') ? 'High' : 'Élevé')) : (client.aml_risk_level === 'MEDIUM' ? ((lang === 'it') ? 'Medio' : ((lang === 'en') ? 'Medium' : 'Moyen')) : ((lang === 'it') ? 'Basso' : ((lang === 'en') ? 'Low' : 'Faible')));

        const kycBadge = client.aml_kyc_status === 'CONFORME' 
            ? `<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); font-weight: 700;"><i class="fa-solid fa-circle-check"></i> ${lang === 'en' ? 'Compliant' : 'Conforme'}</span>`
            : `<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); font-weight: 700;"><i class="fa-solid fa-clock"></i> ${lang === 'it' ? 'Da Completare' : (lang === 'en' ? 'Pending' : 'À Compléter')}</span>`;

        const uboNames = (client.ubo_list || []).map(u => `${u.name} (${u.percentage}%)`).join(', ');

        const pepText = client.is_pep 
            ? `<span class="text-rose">${(lang === 'it' ? 'SÌ (PEP)' : (lang === 'en' ? 'YES (PEP)' : 'OUI (PEP)'))}</span>` 
            : `<span class="text-emerald">${(lang === 'it' ? 'No' : (lang === 'en' ? 'No' : 'Non'))}</span>`;

        const card = document.createElement('div');
        card.className = 'asset-card draggable-card';
        card.setAttribute('draggable', 'true');
        card.dataset.clientKey = clientKey;
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="drag-handle" title="${handleTitle}"><i class="fa-solid fa-grip-vertical"></i></span>
                    <span class="asset-badge-pcn" style="background: rgba(59, 130, 246, 0.15); color: var(--accent-blue);">${client.entity_type_label}</span>
                </div>
                ${kycBadge}
            </div>

            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">
                <i class="fa-solid fa-building text-emerald"></i> ${client.legal_name}
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.85rem;">
                <i class="fa-solid fa-location-dot"></i> ${client.address}, ${client.postal_code} ${client.city} (${client.country})
            </p>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 0.85rem; margin-bottom: 1rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.8rem;">
                    <div>
                        <span style="color: var(--text-muted);">${t('aml_lbl_rcsl')}</span>
                        <strong>${client.rcs_number}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted);">${t('aml_lbl_tva')}</span>
                        <strong>${client.tva_number || exemptLabel}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted);">${t('aml_lbl_risk')}</span>
                        <strong style="color: ${riskColor};">${riskText}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted);">${t('aml_lbl_pep')}</span>
                        <strong>${pepText}</strong>
                    </div>
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; font-size: 0.8rem;">
                    <span style="color: var(--text-muted); display: block;">${t('aml_lbl_mandate')}</span>
                    <strong style="color: var(--accent-blue);">${client.mandate_nature}</strong>
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; margin-top: 0.5rem; font-size: 0.8rem;">
                    <span style="color: var(--text-muted); display: block;">${t('aml_lbl_ubo')}</span>
                    <span style="font-weight: 600; color: var(--text-main);">${uboNames}</span>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
                <div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${t('aml_lbl_vol_invoiced')} (${countOps} ${t('aml_lbl_ops_count')}) :</span>
                    <p style="font-weight: 800; font-size: 1.1rem; color: var(--accent-emerald); margin: 0;">${formatCurrency(totalVol)}</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="openAmlKycModal('${clientKey.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-id-card-clip"></i> ${t('aml_btn_dossier_kyc')}
                </button>
            </div>
        `;

        // Événements Drag & Drop
        card.addEventListener('dragstart', (e) => {
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
                e.preventDefault();
                return;
            }
            draggedClientKey = clientKey;
            card.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', clientKey);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('is-dragging');
            document.querySelectorAll('.asset-card').forEach(c => c.classList.remove('drag-over-target'));
            draggedClientKey = null;
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedClientKey && draggedClientKey !== clientKey) {
                card.classList.add('drag-over-target');
            }
        });

        card.addEventListener('dragleave', (e) => {
            if (!card.contains(e.relatedTarget)) {
                card.classList.remove('drag-over-target');
            }
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over-target');
            const sourceKey = e.dataTransfer.getData('text/plain') || draggedClientKey;
            const targetKey = clientKey;

            if (sourceKey && targetKey && sourceKey !== targetKey) {
                const currentOrder = getAmlCardsOrder();
                const fromIdx = currentOrder.indexOf(sourceKey);
                const toIdx = currentOrder.indexOf(targetKey);
                if (fromIdx !== -1 && toIdx !== -1) {
                    currentOrder.splice(fromIdx, 1);
                    currentOrder.splice(toIdx, 0, sourceKey);
                    saveAmlCardsOrder(currentOrder);
                    renderAmlClientsGrid();
                }
            }
        });

        container.appendChild(card);
    });
}

// Rendu du Tableau 3 : Cadre réglementaire & Matrice des risques
function renderAmlMatrix() {
    const matrixContainer = document.getElementById('aml-matrix-content');
    if (!matrixContainer) return;

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';

    const supervisors = {
        'fr': [
            { name: "AED (Administration de l'Enregistrement, des Domaines et de la TVA)", scope: "Professionnels TCSP, administrateurs indépendants et sociétés luxembourgeoises non régulées par un ordre professionnel." },
            { name: "CSSF (Commission de Surveillance du Secteur Financier)", scope: "Établissements financiers, SICAV, fonds d'investissement et professionnels du secteur financier (PSF)." },
            { name: "CRF (Cellule de Renseignement Financier / Parquet)", scope: "Réception et traitement du renseignement financier lié aux déclarations de soupçon (STR / goAML)." }
        ],
        'it': [
            { name: "AED (Administration de l'Enregistrement, des Domaines et de la TVA)", scope: "Professionisti TCSP, amministratori societari indipendenti e società commerciali lussemburghesi non soggette a ordini professionali." },
            { name: "CSSF (Commission de Surveillance du Secteur Financier)", scope: "Istituti finanziari, banche, SICAV, fondi d'investimento e professionisti del settore finanziario (PSF)." },
            { name: "CRF (Cellule de Renseignement Financier / Procura)", scope: "Ricezione e analisi delle dichiarazioni di operazioni sospette (STR) tramite il portale goAML." }
        ],
        'en': [
            { name: "AED (Administration de l'Enregistrement, des Domaines et de la TVA)", scope: "Trust and Company Service Providers (TCSPs), independent directors, and unregulated commercial companies." },
            { name: "CSSF (Commission de Surveillance du Secteur Financier)", scope: "Credit institutions, SICAVs, investment funds, and specialized financial sector professionals (PSFs)." },
            { name: "CRF (Financial Intelligence Unit / Parquet)", scope: "Receipt, analysis, and dissemination of Suspicious Transaction Reports (STRs) via goAML." }
        ]
    };

    const obligations = {
        'fr': [
            "Identification et vérification de l'identité du client et de ses bénéficiaires effectifs (UBO / RBE)",
            "Évaluation du profil de risque AML de la relation d'affaires (Risk-Based Approach)",
            "Surveillance continue des transactions et contrôle de cohérence avec la nature du mandat",
            "Conservation obligatoire de tous les dossiers et pièces justificatives pendant au moins 5 ans",
            "Obligation légale de déclaration sans délai de toute transaction suspecte auprès de la CRF (goAML)"
        ],
        'it': [
            "Identificazione e adeguata verifica dell'identità del cliente e dei titolari effettivi (UBO / RBE)",
            "Valutazione del profilo di rischio antiriciclaggio della relazione d'affari (Risk-Based Approach)",
            "Monitoraggio continuo delle transazioni e verifica della coerenza con il mandato di amministrazione",
            "Conservazione obbligatoria di tutti i fascicoli e dei giustificativi contabili per almeno 5 anni",
            "Obbligo di legge di segnalazione tempestiva di qualsiasi operazione sospetta alla CRF (goAML)"
        ],
        'en': [
            "Customer Due Diligence (CDD) and identification of Ultimate Beneficial Owners (UBO / RBE)",
            "Assessment of the customer AML/CFT risk profile using a structured Risk-Based Approach",
            "Ongoing monitoring of transactions and verifying consistency with the directorship engagement",
            "Mandatory 5-year record keeping for all KYC files and accounting supporting documentation",
            "Statutory obligation to immediately file Suspicious Transaction Reports (STR) with the CRF (goAML)"
        ]
    };

    const supervisorList = supervisors[lang] || supervisors['fr'];
    const obligationList = obligations[lang] || obligations['fr'];

    let supHtml = supervisorList.map(s => `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem;">
            <h4 style="color: var(--accent-emerald); font-size: 0.95rem; margin-bottom: 0.25rem;"><i class="fa-solid fa-building-columns"></i> ${s.name}</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">${s.scope}</p>
        </div>
    `).join('');

    let oblHtml = obligationList.map(o => `
        <li style="margin-bottom: 0.5rem; color: var(--text-main); font-size: 0.9rem;">
            <i class="fa-solid fa-circle-check text-emerald" style="margin-right: 0.5rem;"></i> ${o}
        </li>
    `).join('');

    matrixContainer.innerHTML = `
        <div class="charts-grid-equal" style="margin-bottom: 1.5rem;">
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title"><i class="fa-solid fa-scale-balanced text-emerald"></i> ${t('aml_mat_title_legal')}</h3>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                    ${t('aml_mat_legal_intro')}
                </p>
                ${supHtml}
            </div>

            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title"><i class="fa-solid fa-list-check text-emerald"></i> ${t('aml_mat_title_obligations')}</h3>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                    ${t('aml_mat_obligations_intro')}
                </p>
                <ul style="list-style: none; padding: 0;">
                    ${oblHtml}
                </ul>
                <div style="margin-top: 1.25rem; background: rgba(59, 130, 246, 0.1); border: 1px solid var(--accent-blue); border-radius: 8px; padding: 0.85rem;">
                    <p style="margin: 0; font-size: 0.8rem; color: var(--accent-blue); font-weight: 600;">
                        <i class="fa-solid fa-info-circle"></i> ${t('aml_mat_retention_note')}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Modal KYC : Ouvrir
let currentEditingClient = null;

function openAmlKycModal(clientName) {
    const client = getEnrichedClient(clientName);
    currentEditingClient = clientName;

    const modal = document.getElementById('aml-kyc-modal');
    if (!modal) return;

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    const modalPrefix = (lang === 'it') ? 'Fascicolo KYC / AML' : ((lang === 'en') ? 'KYC / AML File' : 'Dossier KYC / AML');
    document.getElementById('modal-kyc-title').innerHTML = `<i class="fa-solid fa-shield-halved text-emerald"></i> ${modalPrefix} : ${client.legal_name}`;
    
    // Remplir les champs du formulaire
    document.getElementById('kyc-input-legal-name').value = client.legal_name || '';
    document.getElementById('kyc-input-rcs').value = client.rcs_number || '';
    document.getElementById('kyc-input-matricule').value = client.matricule || '';
    document.getElementById('kyc-input-tva').value = client.tva_number || '';
    document.getElementById('kyc-input-entity-type').value = client.entity_type || 'SARL_COMMERCIALE';
    document.getElementById('kyc-input-address').value = client.address || '';
    document.getElementById('kyc-input-city').value = client.city || '';
    document.getElementById('kyc-input-postal-code').value = client.postal_code || '';
    document.getElementById('kyc-input-country').value = client.country || 'Luxembourg';
    document.getElementById('kyc-input-mandate').value = client.mandate_nature || '';
    document.getElementById('kyc-input-risk-level').value = client.aml_risk_level || 'LOW';
    document.getElementById('kyc-input-kyc-status').value = client.aml_kyc_status || 'CONFORME';
    document.getElementById('kyc-input-is-pep').checked = client.is_pep || false;
    document.getElementById('kyc-input-pep-details').value = client.pep_details || '';
    document.getElementById('kyc-input-notes').value = client.notes || '';

    // UBO & Documents
    const uboContainer = document.getElementById('kyc-ubo-list-container');
    if (uboContainer) {
        const phName = (lang === 'it') ? 'Nome UBO' : ((lang === 'en') ? 'UBO Name' : 'Nom UBO');
        const phNat = (lang === 'it') ? 'Nazionalità' : ((lang === 'en') ? 'Nationality' : 'Nationalité');
        const emptyUboMsg = (lang === 'it') ? 'Nessun UBO registrato.' : ((lang === 'en') ? 'No UBO recorded.' : 'Aucun UBO enregistré.');

        let uboRows = (client.ubo_list || []).map((u, i) => `
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
                <input type="text" class="filter-input ubo-name" style="flex: 2;" value="${u.name}" placeholder="${phName}">
                <input type="text" class="filter-input ubo-nat" style="flex: 1;" value="${u.nationality}" placeholder="${phNat}">
                <input type="number" class="filter-input ubo-pct" style="width: 80px;" value="${u.percentage}" placeholder="%">
                <span class="badge" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald); font-size: 0.75rem;"><i class="fa-solid fa-check"></i> RBE</span>
            </div>
        `).join('');
        uboContainer.innerHTML = uboRows || `<p style="color: var(--text-muted); font-size: 0.8rem;">${emptyUboMsg}</p>`;
    }

    modal.classList.add('active');
}

function closeAmlKycModal() {
    const modal = document.getElementById('aml-kyc-modal');
    if (modal) modal.classList.remove('active');
    currentEditingClient = null;
}

function saveAmlKycModalData() {
    if (!currentEditingClient) return;

    const customStorage = getAmlCustomStorage();
    const existing = getEnrichedClient(currentEditingClient);

    const ubos = [];
    const nameInputs = document.querySelectorAll('.ubo-name');
    const natInputs = document.querySelectorAll('.ubo-nat');
    const pctInputs = document.querySelectorAll('.ubo-pct');

    nameInputs.forEach((inp, idx) => {
        const name = inp.value.trim();
        if (name) {
            ubos.push({
                name: name,
                nationality: natInputs[idx] ? natInputs[idx].value.trim() : 'Européenne',
                percentage: pctInputs[idx] ? parseFloat(pctInputs[idx].value) || 100 : 100,
                rbe_verified: true
            });
        }
    });

    const updated = {
        ...existing,
        legal_name: document.getElementById('kyc-input-legal-name').value.trim(),
        rcs_number: document.getElementById('kyc-input-rcs').value.trim(),
        matricule: document.getElementById('kyc-input-matricule').value.trim(),
        tva_number: document.getElementById('kyc-input-tva').value.trim(),
        entity_type: document.getElementById('kyc-input-entity-type').value,
        address: document.getElementById('kyc-input-address').value.trim(),
        city: document.getElementById('kyc-input-city').value.trim(),
        postal_code: document.getElementById('kyc-input-postal-code').value.trim(),
        country: document.getElementById('kyc-input-country').value.trim(),
        mandate_nature: document.getElementById('kyc-input-mandate').value.trim(),
        aml_risk_level: document.getElementById('kyc-input-risk-level').value,
        aml_kyc_status: document.getElementById('kyc-input-kyc-status').value,
        is_pep: document.getElementById('kyc-input-is-pep').checked,
        pep_details: document.getElementById('kyc-input-pep-details').value.trim(),
        notes: document.getElementById('kyc-input-notes').value.trim(),
        ubo_list: ubos.length > 0 ? ubos : existing.ubo_list,
        last_review_date: new Date().toISOString().split('T')[0]
    };

    customStorage[currentEditingClient] = updated;
    saveAmlCustomStorage(customStorage);

    closeAmlKycModal();
    updateAmlView();

    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    const msg = (lang === 'it') ? 'Fascicolo di conformità KYC aggiornato con successo!' : ((lang === 'en') ? 'KYC Compliance file updated successfully!' : 'Dossier de conformité KYC mis à jour avec succès !');
    if (typeof showGlobalToast === 'function') {
        showGlobalToast(msg, 'fa-circle-check');
    } else {
        alert(msg);
    }
}

// Simulateur de Risque AML (Onglet 4)
function calculateDueDiligenceScore() {
    const entityType = document.getElementById('sim-entity-type').value;
    const country = document.getElementById('sim-country').value;
    const isPep = document.getElementById('sim-is-pep').value === 'YES';
    const structure = document.getElementById('sim-structure').value;
    const volume = parseFloat(document.getElementById('sim-volume').value) || 0;
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';

    let score = 10; // Base score (Faible)
    let factors = [];

    // Facteur Entité
    if (entityType === 'SICAV_REGULEE' || entityType === 'INSTITUTION_REGULEE') {
        score += 5;
        factors.push((lang === 'it') ? "Entità finanziaria regolata sotto vigilanza diretta (CSSF/BCE) - Fattore attenuante." : ((lang === 'en') ? "Regulated financial entity under direct supervisory authority (CSSF/ECB) - Mitigating factor." : "Entité financière régulée sous supervision directe (CSSF/BCE) - Facteur atténuant."));
    } else if (entityType === 'SPF_PATRIMONIALE') {
        score += 15;
        factors.push((lang === 'it') ? "SPF Familiare (Legge 2007): Gestione di patrimonio privato, verifica UBO obbligatoria." : ((lang === 'en') ? "Family SPF (2007 Law): Private wealth management, mandatory UBO verification." : "SPF Familiale (Loi 2007) : Gestion de patrimoine privé, contrôle UBO obligatoire."));
    } else if (entityType === 'SCSP_INVESTISSEMENT') {
        score += 20;
        factors.push((lang === 'it') ? "Società in Accomandita Speciale (SCSp): Veicolo d'investimento, verifica dei soci accomandanti." : ((lang === 'en') ? "Special Limited Partnership (SCSp): Investment vehicle, verification of limited partners." : "Société en Commandite Spéciale (SCSp) : Véhicule d'investissement, vérification des associés commanditaires."));
    } else {
        score += 10;
        factors.push((lang === 'it') ? "Società commerciale standard (SA/Sàrl)." : ((lang === 'en') ? "Standard commercial company (SA/Sàrl)." : "Société commerciale standard (SA/Sàrl)."));
    }

    // Facteur Pays
    if (country === 'LU' || country === 'IT' || country === 'FR' || country === 'BE' || country === 'DE') {
        score += 5;
        factors.push((lang === 'it') ? "Giurisdizione UE / Area Euro ad alto livello di equivalenza AML." : ((lang === 'en') ? "EU / Eurozone jurisdiction with high AML equivalence standards." : "Juridiction UE / Zone Euro à haut niveau d'équivalence AML."));
    } else if (country === 'CH' || country === 'UK' || country === 'US') {
        score += 10;
        factors.push((lang === 'it') ? "Piazza finanziaria terza equivalente GAFI/FATF." : ((lang === 'en') ? "FATF-equivalent third-country financial centre." : "Place financière tierce équivalente GAFI."));
    } else {
        score += 35;
        factors.push((lang === 'it') ? "Giurisdizione extra-UE / Paese terzo a vigilanza rafforzata." : ((lang === 'en') ? "Non-EU international jurisdiction / High-risk third country." : "Juridiction internationale non-UE / Pays tiers à vigilance renforcée."));
    }

    // Facteur PEP
    if (isPep) {
        score += 35;
        factors.push((lang === 'it') ? "Presenza di Persona Politicamente Esposta (PEP): Vigilanza rafforzata per legge obbligatoria." : ((lang === 'en') ? "Presence of Politically Exposed Person (PEP): Statutory Enhanced Due Diligence (EDD) mandatory." : "Présence d'une Personne Politiquement Exposée (PEP) : Vigilance renforcée légale requise."));
    }

    // Facteur Structure Actionnariat
    if (structure === 'COMPLEX') {
        score += 25;
        factors.push((lang === 'it') ? "Catena proprietaria complessa / Holding multiple: Risalita obbligatoria fino alla persona fisica (UBO)." : ((lang === 'en') ? "Complex multi-tiered holding structure: Mandatory ultimate natural person (UBO) tracing." : "Chaîne de détention complexe / Holdings multiples : Remontée obligatoire jusqu'à la personne physique (UBO)."));
    } else if (structure === 'TRUST') {
        score += 30;
        factors.push((lang === 'it') ? "Presenza di Trust / Struttura fiduciaria: Due Diligence approfondita sul disponente e sui beneficiari." : ((lang === 'en') ? "Fiduciary / Trust structure: In-depth due diligence on settlor, protector, and beneficiaries." : "Présence de Fiducie / Trust : Due Diligence approfondie sur le constituant et les bénéficiaires."));
    }

    // Facteur Volume
    if (volume >= 50000) {
        score += 15;
        factors.push((lang === 'it') ? "Volume di compensi previsti elevato (≥ 50.000 €)." : ((lang === 'en') ? "High projected annual fee volume (≥ €50,000)." : "Volume d'honoraires prévus élevé (≥ 50.000 €)."));
    } else if (volume >= 25000) {
        score += 10;
        factors.push((lang === 'it') ? "Volume di compensi significativo (≥ 25.000 €)." : ((lang === 'en') ? "Significant projected annual fee volume (≥ €25,000)." : "Volume d'honoraires standard significatif (≥ 25.000 €)."));
    }

    // Qualification Finale
    let riskLevel = (lang === 'it') ? 'BASSO (Low)' : ((lang === 'en') ? 'LOW (Faible)' : 'FAIBLE (Low)');
    let badgeClass = 'text-emerald';
    let recommendations = (lang === 'it') 
        ? "Adeguata verifica standard: Visura RCS recente, documento d'identità dell'UBO, certificato RBE e contratto di mandato." 
        : ((lang === 'en') 
            ? "Standard Customer Due Diligence: Recent RCS extract, valid UBO ID, official RBE extract, and signed engagement agreement." 
            : "Due Diligence standard : Extrait RCS récent, pièce d'identité de l'UBO, déclaration RBE et convention de mandat.");

    if (score >= 60 || isPep) {
        riskLevel = (lang === 'it') ? 'ELEVATO (High) - Vigilanza Rafforzata' : ((lang === 'en') ? 'HIGH (Élevé) - Enhanced Due Diligence' : 'ÉLEVÉ (High) - Vigilance Renforcée');
        badgeClass = 'text-rose';
        recommendations = (lang === 'it')
            ? "Vigilanza Rafforzata (EDD) obbligatoria: Giustificazione documentata dell'origine dei fondi, approvazione preventiva della direzione, riesame annuale rafforzato e conservazione fascicolo per 5 anni."
            : ((lang === 'en')
                ? "Mandatory Enhanced Due Diligence (EDD): Documented source of funds/wealth, senior management pre-approval, annual compliance review, and 5-year strict file retention."
                : "Vigilance Renforcée (EDD) obligatoire : Justification documentée de l'origine des fonds, approbation préalable de la direction, revue annuelle renforcée et conservation intégrale des pièces 5 ans.");
    } else if (score >= 35) {
        riskLevel = (lang === 'it') ? 'MEDIO (Medium) - Vigilanza Attiva' : ((lang === 'en') ? 'MEDIUM (Moyen) - Active Vigilance' : 'MOYEN (Medium) - Vigilance Active');
        badgeClass = 'text-amber';
        recommendations = (lang === 'it')
            ? "Adeguata verifica standard approfondita: Certificato RBE verificato presso il registro LBR, organigramma del gruppo firmato, riesame periodico ogni 2 anni."
            : ((lang === 'en')
                ? "Enhanced Standard Due Diligence: RBE verified with LBR registry, signed ownership chart, biennial periodic review."
                : "Due Diligence standard approfondie : Contrôle RBE vérifié auprès du LBR, organigramme de détention signé, revue périodique tous les 2 ans.");
    }

    const resContainer = document.getElementById('sim-results-box');
    if (resContainer) {
        resContainer.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${t('aml_sim_res_title')}</span>
                        <h3 style="font-size: 1.6rem; font-weight: 800;" class="${badgeClass}">${score} / 100 &bull; ${riskLevel}</h3>
                    </div>
                </div>

                <h4 style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.5rem;"><i class="fa-solid fa-list-check text-emerald"></i> ${t('aml_sim_res_factors')}</h4>
                <ul style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; padding-left: 1.25rem;">
                    ${factors.map(f => `<li>${f}</li>`).join('')}
                </ul>

                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid var(--accent-emerald); border-radius: 8px; padding: 0.85rem;">
                    <strong style="color: var(--accent-emerald); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;"><i class="fa-solid fa-shield-check"></i> ${t('aml_sim_res_recommendations')}</strong>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-main);">${recommendations}</p>
                </div>
            </div>
        `;
    }
}

// Exportation Excel Complète (24 colonnes normées LBC-FT)
function exportAmlExcel() {
    const records = getFilteredAmlInflows();
    
    const rows = records.map(r => {
        const cp = r.client_profile;
        const uboNames = (cp.ubo_list || []).map(u => `${u.name} (${u.percentage}%)`).join(', ');
        return {
            "ID Opération": r.id,
            "Date Opération": r.date,
            "Date Valeur": r.valeur || r.date,
            "Exercice Fiscal": r.an,
            "Société Débitrice": r.client_name,
            "Dénomination Légale": cp.legal_name,
            "Forme Juridique": cp.entity_type_label,
            "N° RCSL Luxembourg": cp.rcs_number,
            "N° Matricule National": cp.matricule,
            "N° TVA Intracommunautaire": cp.tva_number || 'Exonéré',
            "Adresse Siège Social": cp.address,
            "Code Postal": cp.postal_code,
            "Ville": cp.city,
            "Pays du Siège": cp.country,
            "Nature du Mandat / Prestation": cp.mandate_nature,
            "N° Facture Emise": r.nr_fatt || '--',
            "Libellé de l'Opération": r.description,
            "Montant Hors TVA (€)": r.montant,
            "Montant TVA (€)": r.tva,
            "Total Encaissé TTC (€)": r.total,
            "Seuil de Vigilance AML": r.threshold_cat,
            "Niveau de Risque LBC-FT": r.aml_risk_level,
            "Statut Dossier KYC": r.aml_kyc_status,
            "Personne Politiquement Exposée (PEP)": r.is_pep ? 'OUI' : 'NON',
            "Bénéficiaires Effectifs (RBE / UBO)": uboNames,
            "Dernière Revue Due Diligence": cp.last_review_date || '',
            "Notes & Vérifications AML": cp.notes || ''
        };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registre_AML_Recettes");
    XLSX.writeFile(wb, "NEW_LIFE_Registre_Conformite_AML_LBC-FT.xlsx");
}

// Exportation CSV
function exportAmlCsv() {
    const records = getFilteredAmlInflows();
    const rows = records.map(r => {
        const cp = r.client_profile;
        return [
            r.id,
            r.date,
            r.an,
            `"${(r.client_name || '').replace(/"/g, '""')}"`,
            `"${(cp.legal_name || '').replace(/"/g, '""')}"`,
            `"${(cp.rcs_number || '').replace(/"/g, '""')}"`,
            `"${(r.nr_fatt || '').replace(/"/g, '""')}"`,
            r.montant,
            r.tva,
            r.total,
            r.threshold_cat,
            r.aml_risk_level,
            r.aml_kyc_status,
            r.is_pep ? 'OUI' : 'NON'
        ].join(';');
    });

    const header = ["ID;Date;Exercice;Client;Denomination;RCS;Facture;Montant_HT;TVA;Total_TTC;Seuil_AML;Risque_AML;Statut_KYC;PEP"];
    const csvContent = "\uFEFF" + [header, ...rows].join("\r\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "NEW_LIFE_Registre_AML.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Exportation Rapport Officiel PDF (jsPDF + autoTable)
function exportAmlPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Bibliothèque jsPDF non chargée.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    const records = getFilteredAmlInflows();
    const totalVol = records.reduce((s, r) => s + Math.abs(r.total || 0), 0);
    const compCount = records.filter(r => r.aml_kyc_status === 'CONFORME').length;

    // En-tête
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text("NEW LIFE Sàrl - REGISTRE DE CONFORMITÉ AML & KYC (LBC-FT)", 40, 45);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Règlementation AED / CSSF (Loi du 12 novembre 2004) • Date d'extraction : ${new Date().toLocaleDateString('fr-FR')}`, 40, 62);
    doc.text(`Total Contrôlé : ${formatCurrency(totalVol)} • Opérations : ${records.length} • Dossiers Conformes : ${compCount} (${((compCount / (records.length || 1)) * 100).toFixed(0)}%)`, 40, 77);

    // Table
    const tableData = records.map(r => {
        const cp = r.client_profile;
        return [
            r.date,
            r.client_name,
            cp.rcs_number,
            cp.mandate_nature.split('/')[0],
            r.nr_fatt || '--',
            formatCurrency(r.montant),
            formatCurrency(r.total),
            r.aml_risk_level,
            r.aml_kyc_status,
            r.is_pep ? 'OUI' : 'NON'
        ];
    });

    doc.autoTable({
        startY: 90,
        head: [['Date', 'Société Débitrice', 'N° RCS', 'Mandat / Prestation', 'N° Facture', 'Montant HT', 'Total TTC', 'Risque', 'Statut KYC', 'PEP']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 40, right: 40 }
    });

    doc.save("NEW_LIFE_Rapport_Officiel_Conformite_AML.pdf");
}

// --- AML MANUAL VIEWER & MANAGEMENT ---

const AML_MANUAL_DOCS = {
    'it': {
        title: "Manuale di Conformità AML & Guida Metodologica Antiriciclaggio",
        subtitle: "Normativa Lussemburghese, Supervisione AED, Mandati di Amministrazione e Simulatore di Due Diligence",
        pdfPath: "docs/Manuale_Conformita_AML_Antiriciclaggio_NEW_LIFE_IT.pdf",
        pdfFileName: "Manuale_Conformita_AML_Antiriciclaggio_NEW_LIFE_IT.pdf",
        html: `
            <div class="manual-content-view">
                <div style="background: rgba(16,185,129,0.08); border-left: 4px solid var(--accent-emerald); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--accent-emerald); margin: 0 0 0.5rem 0; font-size: 1.1rem;"><i class="fa-solid fa-circle-info"></i> Inquadramento Generale & Supervisione AED</h3>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-main);">
                        Questo Manuale operativo disciplina i presidi antiriciclaggio e di contrasto al finanziamento del terrorismo (AML/CFT) adottati da <strong>NEW LIFE Sàrl</strong> (R.C.S. Luxembourg B 229.740). La società esercita prestazioni fiduciarie e mandati di Amministratore di Società ed è soggetta alla vigilanza dell'<strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA)</strong> ai sensi dell'Art. 2-1 (8) della Legge del 12 novembre 2004 e relative circolari (Circolari 779 e 800).
                    </p>
                </div>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-scale-balanced text-emerald"></i> 1. Quadro Giuridico & Distinzione AED vs CSSF
                </h4>
                <p>Nel sistema giuridico lussemburghese, la supervisione antiriciclaggio è ripartita tra diverse autorità amministrative:</p>
                <ul>
                    <li><strong>CSSF (Commission de Surveillance du Secteur Financier):</strong> vigila su istituti di credito, fondi d'investimento, PSF (Professionnels du Secteur Financier) e imprese finanziarie.</li>
                    <li><strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA):</strong> è l'autorità di vigilanza competente per i prestatori di servizi a società e trust (TCSP non regolati da ordini professionali), commercianti di beni ad alto valore e società commerciali che svolgono domiciliazione o mandati di amministrazione per terzi.</li>
                </ul>
                <p><strong>NEW LIFE Sàrl NON ricade sotto la vigilanza diretta della CSSF</strong>, bensì sotto la giurisdizione di vigilanza dell'<strong>AED</strong>. Ne derivano obblighi stringenti di identificazione della clientela, conservazione documentale per 5 anni, profilazione del rischio e monitoraggio costante delle entrate finanziarie.</p>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-id-card-clip text-emerald"></i> 2. Obblighi di Adeguata Verifica (CDD & KYC)
                </h4>
                <p>Per ciascuna società cliente o mandante da cui NEW LIFE Sàrl riceve compensi di amministrazione o consulenza, viene costituito un <em>Fascicolo KYC Permanente</em> comprendente:</p>
                <ol>
                    <li><strong>Identificazione dell'Entità Giuridica:</strong> Visura aggiornata del Registro di Commercio (RCSL o registro estero equivalente), statuti coordinati, numero di partita IVA intracomunitaria.</li>
                    <li><strong>Identificazione del Titolare Effettivo (UBO / RBE):</strong> Individuazione di tutte le persone fisiche che detengono direttamente o indirettamente oltre il 25% del capitale o dei diritti di voto, con copia del documento d'identità valido e certificato RBE ufficiale.</li>
                    <li><strong>Verifica delle Persone Politicamente Esposte (PEP):</strong> Screening preventivo di amministratori e titolari effettivi per individuare cariche pubbliche di rilievo o legami familiari diretti.</li>
                    <li><strong>Scopo e Natura del Mandato:</strong> Delibera assembleare o contratto di mandato societario che legittima l'emissione delle fatture periodiche.</li>
                </ol>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-money-bill-transfer text-emerald"></i> 3. Registro delle Entrate & Criteri di Screening
                </h4>
                <p>Il modulo AML traccia e monitora al 100% tutte le entrate sul conto corrente bancario derivanti da prestazioni di amministrazione societaria:</p>
                <ul>
                    <li><strong>Soglia Standard (≥ 5.000 €):</strong> Monitoraggio ordinario e riconciliazione automatica con la fattura emessa.</li>
                    <li><strong>Soglia Legale AED / UE (≥ 10.000 €):</strong> Livello di controllo rafforzato e verifica formale dell'origine dei fondi della società mandante.</li>
                    <li><strong>Grandi Operazioni (≥ 25.000 €):</strong> Riesame completo del fascicolo KYC e aggiornamento della scheda di rischio.</li>
                    <li><strong>Esclusioni Specifiche:</strong> Sono tassativamente escluse dal registro AML le operazioni non costituenti ricavi da prestazioni, in particolare i rimborsi spese per anticipazioni personali (<em>TUBIA Edoardo / Storni</em>) e i movimenti puramente patrimoniali interni.</li>
                </ul>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-microchip text-emerald"></i> 4. Il Simulatore di Due Diligence (Risk Assessment)
                </h4>
                <p>Il modulo integra un motore algoritmico di scoring del rischio (da 0 a 100 punti) basato su quattro pilastri ponderati:</p>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">
                    <p style="margin: 0 0 0.4rem 0;"><strong>A. Tipo di Entità (+0 a +25 pts):</strong> Holding finanziarie (SOPARFI) e fiduciarie presentano un rischio intrinseco più elevato rispetto a società commerciali operative (Sàrl/SA).</p>
                    <p style="margin: 0 0 0.4rem 0;"><strong>B. Rischio Geografico (+0 a +30 pts):</strong> Giurisdizioni UE/OCSE sono classificate a basso rischio; territori a fiscalità privilegiata o liste grigie FATF/GAFI comportano maggiorazioni di rischio fino a +30 punti.</p>
                    <p style="margin: 0 0 0.4rem 0;"><strong>C. Presenza di PEP (+35 pts):</strong> La presenza di figure politicamente esposte fa scattare automaticamente l'obbligo di Vigilanza Rafforzata (EDD - Enhanced Due Diligence).</p>
                    <p style="margin: 0;"><strong>D. Struttura UBO & Volume (+5 a +20 pts):</strong> Catene di controllo complesse o volumi di fatturazione annui superiori a 50.000 € richiedono adeguate verifiche supplementari.</p>
                </div>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-triangle-exclamation text-emerald"></i> 5. Obblighi di Segnalazione alla CRF (Cellule de Renseignement Financier)
                </h4>
                <p>Qualora emergano anomalie non giustificate, tentativi di occultamento del titolare effettivo o fondati sospetti di riciclaggio o finanziamento del terrorismo, NEW LIFE Sàrl ha l'obbligo di legge di:</p>
                <ul>
                    <li>Inviare tempestiva <strong>Dichiarazione di Sospetto (STR / SAR)</strong> alla <em>Cellule de Renseignement Financier (CRF)</em> del Parquet di Lussemburgo tramite il portale <strong>goAML</strong>.</li>
                    <li>Rispettare il rigoroso divieto di informare il cliente (<em>No Tipping-Off</em>, Art. 5 Legge 12/11/2004).</li>
                    <li>Conservare tutti i registri informatici e cartacei per almeno <strong>5 anni</strong> dalla cessazione della relazione d'affari.</li>
                </ul>
            </div>
        `
    },
    'fr': {
        title: "Manuel de Conformité AML & Guide Méthodologique LBC-FT",
        subtitle: "Règlementation Luxembourgeoise, Supervision AED, Mandats d'Administrateur et Simulateur Due Diligence",
        pdfPath: "docs/Manuel_Conformite_AML_LBC-FT_NEW_LIFE_FR.pdf",
        pdfFileName: "Manuel_Conformite_AML_LBC-FT_NEW_LIFE_FR.pdf",
        html: `
            <div class="manual-content-view">
                <div style="background: rgba(16,185,129,0.08); border-left: 4px solid var(--accent-emerald); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--accent-emerald); margin: 0 0 0.5rem 0; font-size: 1.1rem;"><i class="fa-solid fa-circle-info"></i> Cadre Général & Supervision AED</h3>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-main);">
                        Le présent manuel opérationnel régit les procédures de lutte contre le blanchiment de capitaux et le financement du terrorisme (LBC-FT) mises en œuvre par <strong>NEW LIFE Sàrl</strong> (R.C.S. Luxembourg B 229.740). La société exerce des prestations de direction et mandats d'Administrateur de société et est placée sous la surveillance de l'<strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA)</strong> conformément à l'article 2-1 (8) de la Loi modifiée du 12 novembre 2004 (Circulaires 779 et 800).
                    </p>
                </div>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-scale-balanced text-emerald"></i> 1. Cadre Juridique & Distinction AED vs CSSF
                </h4>
                <p>Au Luxembourg, les compétences de supervision LBC-FT sont distinctement réparties :</p>
                <ul>
                    <li><strong>CSSF (Commission de Surveillance du Secteur Financier) :</strong> supervise les banques, institutions financières, PSF et fonds d'investissement régulés.</li>
                    <li><strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA) :</strong> est l'autorité de tutelle compétente pour les prestataires de services aux sociétés (TCSP non régulés par un ordre), négociants et sociétés commerciales exerçant des mandats de direction pour compte de tiers.</li>
                </ul>
                <p><strong>NEW LIFE Sàrl n'est PAS assujettie à la CSSF</strong> mais relève de la supervision de l'<strong>AED</strong>. Cela implique des obligations strictes d'identification de la clientèle (KYC), de conservation des données pendant 5 ans et de suivi rigoureux des recettes.</p>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-id-card-clip text-emerald"></i> 2. Obligations de Due Diligence (CDD & KYC)
                </h4>
                <p>Pour chaque entreprise cliente auprès de laquelle NEW LIFE Sàrl perçoit des honoraires d'administration, un <em>Dossier KYC Permanent</em> est tenu à jour :</p>
                <ol>
                    <li><strong>Identification de l'Entité :</strong> Extrait RCSL récent, statuts coordonnés, numéro de TVA intracommunautaire.</li>
                    <li><strong>Identification des Bénéficiaires Effectifs (UBO / RBE) :</strong> Recensement des personnes physiques détenant directement ou indirectement plus de 25% du capital ou des droits de vote, avec copie d'identité valide et extrait officiel du Registre des Bénéficiaires Effectifs.</li>
                    <li><strong>Filtrage Personnes Politiquement Exposées (PEP) :</strong> Vérification de l'existence de mandats publics ou liens étroits.</li>
                    <li><strong>Objet du Mandat :</strong> Convention de prestation ou procès-verbal de nomination justifiant la facturation.</li>
                </ol>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-money-bill-transfer text-emerald"></i> 3. Registre des Recettes & Seuils de Vigilance
                </h4>
                <p>Le module AML assure un contrôle exhaustif des flux créditeurs bancaires :</p>
                <ul>
                    <li><strong>Seuil Standard (≥ 5.000 €) :</strong> Rapprochement systématique facture / flux bancaire.</li>
                    <li><strong>Seuil Légal AED / UE (≥ 10.000 €) :</strong> Vigilance renforcée et vérification formelle de l'origine des fonds.</li>
                    <li><strong>Opérations Majeures (≥ 25.000 €) :</strong> Révision complète du dossier de conformité.</li>
                    <li><strong>Exclusions Spécifiques :</strong> Sont expressément exclues du registre AML les opérations de pur remboursement de frais avancés (<em>TUBIA Edoardo / Storno</em>) et les flux patrimoniaux internes.</li>
                </ul>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-microchip text-emerald"></i> 4. Simulateur Due Diligence (Évaluation des Risques)
                </h4>
                <p>Le moteur algorithmique calcule un score de risque de 0 à 100 points fondé sur quatre composantes :</p>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">
                    <p style="margin: 0 0 0.4rem 0;"><strong>A. Forme Juridique (+0 à +25 pts) :</strong> SOPARFI et structures fiduciaires présentent un risque supérieur aux sociétés commerciales opérationnelles.</p>
                    <p style="margin: 0 0 0.4rem 0;"><strong>B. Risque Géographique (+0 à +30 pts) :</strong> Les pays UE/OCDE sont à faible risque, tandis que les pays tiers à fiscalité privilégiée ou listes GAFI majorent fortement le score.</p>
                    <p style="margin: 0 0 0.4rem 0;"><strong>C. Exposition PEP (+35 pts) :</strong> La qualification PEP déclenche immédiatement l'obligation de Vigilance Renforcée (EDD).</p>
                    <p style="margin: 0;"><strong>D. Complexité de l'Actionnariat & Volume (+5 à +20 pts) :</strong> Chaînes de détention complexes ou volumes annuels > 50.000 €.</p>
                </div>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-triangle-exclamation text-emerald"></i> 5. Déclarations de Soupçon auprès de la CRF
                </h4>
                <p>En cas de soupçon avéré ou de tentative de dissimulation de l'UBO, NEW LIFE Sàrl a l'obligation légale de :</p>
                <ul>
                    <li>Transmettre sans délai une <strong>Déclaration de Soupçon (STR)</strong> à la <em>Cellule de Renseignement Financier (CRF)</em> via le portail <strong>goAML</strong>.</li>
                    <li>Respecter l'interdiction stricte de divulgation (<em>Tipping-Off</em>, art. 5 de la Loi de 2004).</li>
                    <li>Conserver l'ensemble des pièces probantes pendant au moins <strong>5 ans</strong>.</li>
                </ul>
            </div>
        `
    },
    'en': {
        title: "AML / CFT Compliance Manual & Methodological Guide",
        subtitle: "Luxembourg Regulations, AED Supervision, Directorship Mandates and Due Diligence Simulator",
        pdfPath: "docs/User_Manual_AML_CFT_Compliance_NEW_LIFE_EN.pdf",
        pdfFileName: "User_Manual_AML_CFT_Compliance_NEW_LIFE_EN.pdf",
        html: `
            <div class="manual-content-view">
                <div style="background: rgba(16,185,129,0.08); border-left: 4px solid var(--accent-emerald); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--accent-emerald); margin: 0 0 0.5rem 0; font-size: 1.1rem;"><i class="fa-solid fa-circle-info"></i> Regulatory Overview & AED Supervision</h3>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-main);">
                        This operational Compliance Manual establishes the anti-money laundering and countering the financing of terrorism (AML/CFT) framework implemented by <strong>NEW LIFE Sàrl</strong> (R.C.S. Luxembourg B 229.740). Operating as a corporate service provider and professional director, NEW LIFE Sàrl is supervised by the <strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA)</strong> pursuant to Article 2-1 (8) of the amended Law of 12 November 2004 and AED Circulars 779 and 800.
                    </p>
                </div>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-scale-balanced text-emerald"></i> 1. Legal Architecture: AED vs CSSF Supervision
                </h4>
                <p>Under Luxembourg law, AML/CFT regulatory oversight is allocated across designated supervisory authorities:</p>
                <ul>
                    <li><strong>CSSF (Commission de Surveillance du Secteur Financier):</strong> oversees credit institutions, investment funds, regulated management companies, and financial sector professionals (PSF).</li>
                    <li><strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA):</strong> is the competent supervisory authority for Trust and Company Service Providers (TCSPs), high-value goods traders, and corporate entities providing directorship and domiciliation services.</li>
                </ul>
                <p><strong>NEW LIFE Sàrl is NOT regulated by the CSSF</strong>, but falls under the supervisory jurisdiction of the <strong>AED</strong>. This entails formal Customer Due Diligence (CDD/KYC), 5-year record retention, and ongoing inflows monitoring.</p>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-id-card-clip text-emerald"></i> 2. Customer Due Diligence (CDD & KYC) Requirements
                </h4>
                <p>For each client company generating director or advisory fees, a <em>Permanent KYC File</em> is maintained:</p>
                <ol>
                    <li><strong>Legal Entity Identification:</strong> Updated Trade and Companies Register (RCSL) extract, certified Articles of Association, intra-EU VAT identification.</li>
                    <li><strong>Ultimate Beneficial Owner (UBO / RBE) Identification:</strong> Verification of natural persons holding directly or indirectly > 25% ownership or voting rights, supported by valid ID and official Luxembourg RBE certificate.</li>
                    <li><strong>Politically Exposed Persons (PEP) Screening:</strong> Mandatory screening for political or public exposure.</li>
                    <li><strong>Mandate Legitimacy & Commercial Purpose:</strong> Board appointment resolutions and director service agreements justifying invoices.</li>
                </ol>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-money-bill-transfer text-emerald"></i> 3. Inflow Screening & Risk Thresholds
                </h4>
                <p>The AML register systematically captures and reviews all bank inflows from client billings:</p>
                <ul>
                    <li><strong>Standard Vigilance (≥ €5,000):</strong> Automatic reconciliation between invoice and bank receipt.</li>
                    <li><strong>Statutory AED / EU Threshold (≥ €10,000):</strong> Heightened vigilance with source of funds verification.</li>
                    <li><strong>High Volume (≥ €25,000):</strong> Comprehensive KYC file audit and score review.</li>
                    <li><strong>Strict Exclusions:</strong> Personal expense advances/reimbursements (<em>TUBIA Edoardo / Storno</em>) and equity transfers are strictly excluded from AML revenue monitoring.</li>
                </ul>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-microchip text-emerald"></i> 4. Due Diligence Risk Assessment Simulator
                </h4>
                <p>The multi-factor risk engine scores potential engagements on a 0 to 100 scale:</p>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">
                    <p style="margin: 0 0 0.4rem 0;"><strong>A. Entity Type (+0 to +25 pts):</strong> Financial holdings (SOPARFI) and trusts carry inherently higher risk than active commercial firms.</p>
                    <p style="margin: 0 0 0.4rem 0;"><strong>B. Country & Jurisdiction (+0 to +30 pts):</strong> EU/OECD nations represent baseline low risk, while non-cooperative or FATF monitored jurisdictions trigger heavy risk weightings.</p>
                    <p style="margin: 0 0 0.4rem 0;"><strong>C. PEP Involvement (+35 pts):</strong> Instantly mandates Enhanced Due Diligence (EDD).</p>
                    <p style="margin: 0;"><strong>D. UBO Complexity & Billing Scale (+5 to +20 pts):</strong> Multi-layered ownership chains and annual fees exceeding €50,000 require senior approval.</p>
                </div>

                <h4 style="color: var(--text-main); border-bottom: 1px solid var(--border-color); padding-bottom: 0.4rem; margin-top: 1.25rem;">
                    <i class="fa-solid fa-triangle-exclamation text-emerald"></i> 5. Mandatory Reporting to FIU Luxembourg (CRF)
                </h4>
                <p>Upon identifying unverified funds, UBO concealment, or suspicious transactions, NEW LIFE Sàrl must:</p>
                <ul>
                    <li>Immediately file a <strong>Suspicious Transaction Report (STR)</strong> with the <em>Financial Intelligence Unit (CRF - Cellule de Renseignement Financier)</em> via <strong>goAML</strong>.</li>
                    <li>Strictly adhere to the <strong>No Tipping-Off rule</strong> (Art. 5 of the 2004 Law).</li>
                    <li>Preserve all compliance logs and audit trails for at least <strong>5 years</strong>.</li>
                </ul>
            </div>
        `
    }
};

let currentManualLang = localStorage.getItem('new_life_lang') || 'it';

function openAmlManualModal(lang) {
    const activeAppLang = localStorage.getItem('new_life_lang') || 'it';
    const targetLang = lang || activeAppLang;
    setManualModalLang(targetLang);
    const modal = document.getElementById('aml-manual-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAmlManualModal() {
    const modal = document.getElementById('aml-manual-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function setManualModalLang(lang) {
    if (!AML_MANUAL_DOCS[lang]) lang = 'it';
    currentManualLang = lang;

    // Update active pill
    document.querySelectorAll('.manual-lang-pill').forEach(btn => {
        if (btn.getAttribute('data-manual-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const docInfo = AML_MANUAL_DOCS[lang];
    const readerBody = document.getElementById('aml-manual-reader-body');
    if (readerBody) {
        readerBody.innerHTML = docInfo.html;
    }

    const footerName = document.getElementById('manual-footer-pdf-name');
    if (footerName) {
        footerName.textContent = docInfo.pdfPath;
    }
}

function downloadCurrentManualPdf() {
    const docInfo = AML_MANUAL_DOCS[currentManualLang] || AML_MANUAL_DOCS['it'];
    const a = document.createElement('a');
    a.href = docInfo.pdfPath;
    a.download = docInfo.pdfFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function openManualPdfTab() {
    const docInfo = AML_MANUAL_DOCS[currentManualLang] || AML_MANUAL_DOCS['it'];
    window.open(docInfo.pdfPath, '_blank');
}

function printManualContent() {
    const docInfo = AML_MANUAL_DOCS[currentManualLang] || AML_MANUAL_DOCS['it'];
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
        window.print();
        return;
    }
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${docInfo.title} - NEW LIFE Sàrl</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; line-height: 1.6; color: #111; }
                h1 { color: #059669; font-size: 20pt; margin-bottom: 5px; }
                h2 { color: #475569; font-size: 13pt; margin-top: 0; font-weight: normal; margin-bottom: 25px; border-bottom: 2px solid #059669; padding-bottom: 8px; }
                h3 { color: #0f172a; font-size: 13pt; margin-top: 20px; }
                h4 { color: #0f172a; font-size: 11pt; margin-top: 15px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
                p, li { font-size: 10pt; }
                ul, ol { padding-left: 20px; }
                @media print {
                    body { padding: 10mm; }
                }
            </style>
        </head>
        <body>
            <h1>${docInfo.title}</h1>
            <h2>${docInfo.subtitle}</h2>
            ${docInfo.html}
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Initialisation de la vue AML
function populateAmlSimulatorOptions() {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    const selEntity = document.getElementById('sim-entity-type');
    if (selEntity) {
        const curVal = selEntity.value || 'SARL_COMMERCIALE';
        if (lang === 'it') {
            selEntity.innerHTML = `
                <option value="SICAV_REGULEE">SICAV / Fondo Regolato CSSF (Basso rischio)</option>
                <option value="INSTITUTION_REGULEE">Società di Gestione / Banca (Basso rischio)</option>
                <option value="SARL_COMMERCIALE">Società Commerciale Sàrl (Rischio Standard)</option>
                <option value="SA_COMMERCIALE">Società per Azioni SA (Rischio Standard)</option>
                <option value="SPF_PATRIMONIALE">SPF - Gestione di Patrimonio Familiare</option>
                <option value="SCSP_INVESTISSEMENT">SCSp - Società in Accomandita Speciale</option>
            `;
        } else if (lang === 'en') {
            selEntity.innerHTML = `
                <option value="SICAV_REGULEE">CSSF Regulated SICAV / Fund (Low Risk)</option>
                <option value="INSTITUTION_REGULEE">Management Company / Bank (Low Risk)</option>
                <option value="SARL_COMMERCIALE">Commercial Sàrl Company (Standard Risk)</option>
                <option value="SA_COMMERCIALE">Commercial SA Company (Standard Risk)</option>
                <option value="SPF_PATRIMONIALE">SPF - Private Wealth Management Company</option>
                <option value="SCSP_INVESTISSEMENT">SCSp - Special Limited Partnership</option>
            `;
        } else {
            selEntity.innerHTML = `
                <option value="SICAV_REGULEE">SICAV / Fonds Régulé CSSF (Faible risque)</option>
                <option value="INSTITUTION_REGULEE">Société de Gestion / Banque (Faible risque)</option>
                <option value="SARL_COMMERCIALE">Société Commerciale Sàrl (Risque Standard)</option>
                <option value="SA_COMMERCIALE">Société Anonyme SA (Risque Standard)</option>
                <option value="SPF_PATRIMONIALE">SPF - Société de Gestion de Patrimoine Familial</option>
                <option value="SCSP_INVESTISSEMENT">SCSp - Société en Commandite Spéciale</option>
            `;
        }
        selEntity.value = curVal;
    }

    const selCountry = document.getElementById('sim-country');
    if (selCountry) {
        const curVal = selCountry.value || 'LU';
        if (lang === 'it') {
            selCountry.innerHTML = `
                <option value="LU">Lussemburgo (Piazza finanziaria regolata)</option>
                <option value="IT">Italia (Unione Europea)</option>
                <option value="FR">Francia (Unione Europea)</option>
                <option value="BE">Belgio (Unione Europea)</option>
                <option value="DE">Germania (Unione Europea)</option>
                <option value="CH">Svizzera (Paese terzo equivalente)</option>
                <option value="BR">Brasile (Vigilanza investimenti internazionali)</option>
                <option value="OTHER">Altro Paese Terzo (Extra UE)</option>
            `;
        } else if (lang === 'en') {
            selCountry.innerHTML = `
                <option value="LU">Luxembourg (Regulated financial centre)</option>
                <option value="IT">Italy (European Union)</option>
                <option value="FR">France (European Union)</option>
                <option value="BE">Belgium (European Union)</option>
                <option value="DE">Germany (European Union)</option>
                <option value="CH">Switzerland (Equivalent third country)</option>
                <option value="BR">Brazil (International investment vigilance)</option>
                <option value="OTHER">Other Third Country (Non-EU)</option>
            `;
        } else {
            selCountry.innerHTML = `
                <option value="LU">Luxembourg (Place financière régulée)</option>
                <option value="IT">Italie (Union Européenne)</option>
                <option value="FR">France (Union Européenne)</option>
                <option value="BE">Belgique (Union Européenne)</option>
                <option value="DE">Allemagne (Union Européenne)</option>
                <option value="CH">Suisse (Pays tiers équivalent)</option>
                <option value="BR">Brésil (Vigilance investissement international)</option>
                <option value="OTHER">Autre Pays Tiers (Hors UE)</option>
            `;
        }
        selCountry.value = curVal;
    }

    const selPep = document.getElementById('sim-is-pep');
    if (selPep) {
        const curVal = selPep.value || 'NO';
        if (lang === 'it') {
            selPep.innerHTML = `
                <option value="NO">No (Nessun dirigente o UBO è PEP)</option>
                <option value="YES">Sì (Dirigente o Titolare Effettivo PEP)</option>
            `;
        } else if (lang === 'en') {
            selPep.innerHTML = `
                <option value="NO">No (No director or UBO is PEP)</option>
                <option value="YES">Yes (Director or Beneficial Owner is PEP)</option>
            `;
        } else {
            selPep.innerHTML = `
                <option value="NO">Non (Aucun dirigeant ou UBO n'est PEP)</option>
                <option value="YES">Oui (Dirigeant ou Bénéficiaire Effectif PEP)</option>
            `;
        }
        selPep.value = curVal;
    }

    const selStructure = document.getElementById('sim-structure');
    if (selStructure) {
        const curVal = selStructure.value || 'DIRECT';
        if (lang === 'it') {
            selStructure.innerHTML = `
                <option value="DIRECT">Diretta & Trasparente (Persona fisica diretta)</option>
                <option value="COMPLEX">Catena di controllo con diverse holding</option>
                <option value="TRUST">Fiducia / Trust / Struttura fiduciaria</option>
            `;
        } else if (lang === 'en') {
            selStructure.innerHTML = `
                <option value="DIRECT">Direct & Transparent (Direct natural person)</option>
                <option value="COMPLEX">Multi-layered holding structure</option>
                <option value="TRUST">Fiduciary / Trust structure</option>
            `;
        } else {
            selStructure.innerHTML = `
                <option value="DIRECT">Directe & Transparente (Personne physique directe)</option>
                <option value="COMPLEX">Chaîne de détention avec plusieurs holdings</option>
                <option value="TRUST">Fiducie / Trust / Structure fiduciaire</option>
            `;
        }
        selStructure.value = curVal;
    }
}

// Initialisation de la vue AML
function populateAmlFilters() {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'fr';
    // Client Filter
    const selClient = document.getElementById('aml-filter-client');
    if (selClient) {
        const registry = window.NEW_LIFE_AML_CLIENTS || {};
        const curVal = amlFilterClient || 'ALL';
        const allClientsLabel = (lang === 'it') ? 'Tutte le società debitrici' : ((lang === 'en') ? 'All debtor companies' : 'Toutes les sociétés débitrices');
        selClient.innerHTML = `<option value="ALL">${allClientsLabel}</option>`;
        Object.keys(registry).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            selClient.appendChild(opt);
        });
        selClient.value = curVal;
        selClient.onchange = (e) => {
            amlFilterClient = e.target.value;
            updateAmlView();
        };
    }

    // Year Filter
    const selYear = document.getElementById('aml-filter-year');
    if (selYear) {
        selYear.onchange = (e) => {
            amlFilterYear = e.target.value;
            updateAmlView();
        };
    }

    // Entity Type Filter
    const selEntity = document.getElementById('aml-filter-entity-type');
    if (selEntity) {
        selEntity.onchange = (e) => {
            amlFilterEntityType = e.target.value;
            updateAmlView();
        };
    }

    // KYC Status Filter
    const selKyc = document.getElementById('aml-filter-kyc-status');
    if (selKyc) {
        selKyc.onchange = (e) => {
            amlFilterKycStatus = e.target.value;
            updateAmlView();
        };
    }

    // Search Input
    const searchInput = document.getElementById('aml-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            amlSearchQuery = e.target.value;
            updateAmlView();
        };
    }

    // Threshold Buttons
    document.querySelectorAll('.aml-threshold-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.aml-threshold-btn').forEach(b => {
                b.classList.remove('active', 'btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-secondary');
            amlFilterThreshold = parseFloat(btn.getAttribute('data-threshold')) || 0;
            updateAmlView();
        };
    });
}

function updateAmlView() {
    updateAmlKPIs();
    renderAmlRegistryTable();
    renderAmlClientsGrid();
}

function initAmlApp() {
    // Navigation onglets
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

    populateAmlFilters();
    populateAmlSimulatorOptions();
    updateAmlView();
    renderAmlMatrix();

    // Boutons d'export
    const btnExcel = document.getElementById('btn-export-aml-excel');
    if (btnExcel) btnExcel.onclick = exportAmlExcel;

    const btnCsv = document.getElementById('btn-export-aml-csv');
    if (btnCsv) btnCsv.onclick = exportAmlCsv;

    const btnPdf = document.getElementById('btn-export-aml-pdf');
    if (btnPdf) btnPdf.onclick = exportAmlPdf;

    // Simulateur
    const btnSim = document.getElementById('btn-calc-due-diligence');
    if (btnSim) btnSim.onclick = calculateDueDiligenceScore;

    // Simulation initiale
    calculateDueDiligenceScore();
}

// Hook language changes
const prevAmlLangChange = window.onLanguageChange;
window.onLanguageChange = function(lang) {
    if (typeof prevAmlLangChange === 'function') prevAmlLangChange(lang);
    populateAmlFilters();
    populateAmlSimulatorOptions();
    updateAmlView();
    renderAmlMatrix();
    calculateDueDiligenceScore();
    if (typeof setManualModalLang === 'function') {
        setManualModalLang(lang);
    }
};

document.addEventListener('DOMContentLoaded', initAmlApp);

