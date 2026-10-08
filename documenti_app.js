/**
 * NEW LIFE Sàrl - Documents Société & Archive Logic
 */

const DEFAULT_DOCUMENTS = [
    {
        id: "DOC-2025-BILAN",
        title: "Bilan & Comptes Annuels 2025 Déposés",
        category: "bilan",
        date: "2025-12-31",
        filename: "NEW_LIFE_bilan_2025_RCSL_déposé.pdf",
        filepath: "docs/NEW_LIFE_bilan_2025_RCSL_déposé.pdf",
        size: "3.32 Mo",
        type: "PDF Document",
        notes: "Bilan complet et compte de résultat 2025 officiellement déposés au RCS Luxembourg (RCSL).",
        available: true
    },
    {
        id: "DOC-STATUTS",
        title: "Acte Constitutif & Statuts Coordonnés",
        category: "juridique",
        date: "2018-12-01",
        filename: "Statuts_NEW_LIFE_Sarl.pdf",
        filepath: "docs/Statuts_NEW_LIFE_Sarl.pdf",
        size: "En attente",
        type: "PDF Document",
        notes: "Statuts d'origine et modifications statutaires de la société.",
        available: false
    },
    {
        id: "DOC-RCS",
        title: "Extrait d'Immatriculation RCS Luxembourg (10/2025)",
        category: "registres",
        date: "2025-10-06",
        filename: "Extrait RCS New Life 10.2025.pdf",
        filepath: "docs/Extrait RCS New Life 10.2025.pdf",
        size: "379.38 Ko",
        type: "PDF Document",
        notes: "Certificat d'immatriculation officiel au Registre de Commerce et des Sociétés.",
        available: true
    },
    {
        id: "DOC-RBE",
        title: "Déclaration Registre des Bénéficiaires Effectifs (RBE 10/2025)",
        category: "registres",
        date: "2025-10-03",
        filename: "NEW LIFE - Extrait RBE 10.2025.pdf",
        filepath: "docs/NEW LIFE - Extrait RBE 10.2025.pdf",
        size: "360.09 Ko",
        type: "PDF Document",
        notes: "Attestation de conformité et déclaration légale RBE Luxembourg.",
        available: true
    },
    {
        id: "DOC-AML-MANUAL-IT",
        title: "Manuale di Conformità AML & Guida Metodologica Antiriciclaggio (IT)",
        category: "conformite",
        date: "2026-10-08",
        filename: "Manuale_Conformita_AML_Antiriciclaggio_NEW_LIFE_IT.pdf",
        filepath: "docs/Manuale_Conformita_AML_Antiriciclaggio_NEW_LIFE_IT.pdf",
        size: "85.00 Ko",
        type: "PDF Document",
        notes: "Manuale operativo e normativo AML/LBC-FT per NEW LIFE Sàrl (Legge 12 Nov. 2004, AED, RBE, Mandati di Amministratore e Simulatore di Due Diligence).",
        available: true
    },
    {
        id: "DOC-AML-MANUAL-FR",
        title: "Manuel de Conformité AML & Guide Méthodologique LBC-FT (FR)",
        category: "conformite",
        date: "2026-10-08",
        filename: "Manuel_Conformite_AML_LBC-FT_NEW_LIFE_FR.pdf",
        filepath: "docs/Manuel_Conformite_AML_LBC-FT_NEW_LIFE_FR.pdf",
        size: "85.00 Ko",
        type: "PDF Document",
        notes: "Manuel officiel de conformité LBC-FT et procédures de Due Diligence pour NEW LIFE Sàrl selon la Loi du 12 novembre 2004 et la supervision AED.",
        available: true
    },
    {
        id: "DOC-AML-MANUAL-EN",
        title: "AML / CFT Compliance Manual & Due Diligence Guide (EN)",
        category: "conformite",
        date: "2026-10-08",
        filename: "User_Manual_AML_CFT_Compliance_NEW_LIFE_EN.pdf",
        filepath: "docs/User_Manual_AML_CFT_Compliance_NEW_LIFE_EN.pdf",
        size: "85.00 Ko",
        type: "PDF Document",
        notes: "Operational AML/CFT Compliance Manual and Due Diligence Risk Assessment guide under Luxembourg Law and AED supervision.",
        available: true
    }
];

function getStoredDocuments() {
    const raw = localStorage.getItem('new_life_docs');
    let docs;
    if (!raw) {
        docs = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS));
        localStorage.setItem('new_life_docs', JSON.stringify(docs));
        return docs;
    }
    try {
        docs = JSON.parse(raw);
    } catch {
        docs = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS));
        localStorage.setItem('new_life_docs', JSON.stringify(docs));
    }
    return docs;
}

function saveDocuments(docs) {
    localStorage.setItem('new_life_docs', JSON.stringify(docs));
}

function restoreDefaultDocs() {
    const isIt = (localStorage.getItem('new_life_lang') || 'fr') === 'it';
    const msg = isIt 
        ? "Vuoi ripristinare i documenti societari ufficiali predefiniti? I documenti caricati non verranno rimossi."
        : "Voulez-vous restaurer les documents par défaut de la société ? Les documents personnalisés ne seront pas supprimés.";
    
    if (!confirm(msg)) return;

    let docs = getStoredDocuments();
    DEFAULT_DOCUMENTS.forEach(defDoc => {
        const exists = docs.some(d => d.id === defDoc.id);
        if (!exists) {
            docs.push(JSON.parse(JSON.stringify(defDoc)));
        }
    });
    saveDocuments(docs);
    renderDocGrid();
}

function initDocumenti() {
    const data = window.NEW_LIFE_DATA || { company: {} };

    // Last updated
    const updatedEl = document.getElementById('sidebar-updated-at');
    if (updatedEl) {
        updatedEl.textContent = (typeof getAppLastUpdate === 'function') ? getAppLastUpdate() : (data.company?.updated_at || '--/--/----');
    }

    document.getElementById('doc-cat-filter').addEventListener('change', renderDocGrid);
    document.getElementById('doc-search-input').addEventListener('input', renderDocGrid);

    renderDocGrid();
}

function getCategoryBadge(cat) {
    switch (cat) {
        case 'bilan':
            return '<span class="badge badge-entree"><i class="fa-solid fa-file-invoice"></i> Bilan RCSL</span>';
        case 'conformite':
            return '<span class="badge badge-entree" style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3);"><i class="fa-solid fa-shield-halved"></i> Conformité AML</span>';
        case 'juridique':
            return '<span class="badge badge-ord"><i class="fa-solid fa-scale-balanced"></i> Juridique</span>';
        case 'registres':
            return '<span class="badge badge-ext"><i class="fa-solid fa-stamp"></i> RCS / RBE</span>';
        case 'fiscal':
            return '<span class="badge badge-sortie"><i class="fa-solid fa-landmark"></i> Fiscalité</span>';
        default:
            return '<span class="badge badge-ord"><i class="fa-solid fa-folder"></i> Divers</span>';
    }
}

function renderDocGrid() {
    const docs = getStoredDocuments();
    const catFilter = document.getElementById('doc-cat-filter').value;
    const searchFilter = document.getElementById('doc-search-input').value.toLowerCase().trim();

    const container = document.getElementById('doc-grid-container');
    container.innerHTML = '';

    const filtered = docs.filter(d => {
        if (catFilter !== 'ALL' && d.category !== catFilter) return false;
        if (searchFilter) {
            const text = `${d.title} ${d.filename} ${d.notes} ${d.category}`.toLowerCase();
            if (!text.includes(searchFilter)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fa-regular fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Aucun document trouvé pour cette sélection.</p>
            </div>
        `;
        return;
    }

    initContainerDragEvents();

    filtered.forEach((d, index) => {
        const card = document.createElement('div');
        card.className = 'doc-card';

        const isAvailable = d.available === true;
        const fileIconClass = d.filename.endsWith('.pdf') ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-lines';
        const fileIconColor = isAvailable ? 'var(--accent-rose)' : 'var(--text-muted)';
        const viewBtnClass = isAvailable ? 'doc-btn-icon view available' : 'doc-btn-icon view empty';
        const viewBtnTitle = isAvailable ? "Visualizza documento PDF disponibile" : "Nessun file caricato (Clicca per allegare)";
        const iconColor = isAvailable ? '#10b981' : '#64748b';
        const isFirst = index === 0;
        const isLast = index === filtered.length - 1;

        card.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="doc-drag-handle" title="Trascina la scheda per riordinare o usa le frecce">
                            <button type="button" class="doc-move-btn" onclick="event.stopPropagation(); moveDoc('${d.id}', -1);" title="Sposta a sinistra / prima" ${isFirst ? 'disabled' : ''}>
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <i class="fa-solid fa-grip-vertical" style="opacity: 0.6; font-size: 0.85rem; margin: 0 1px;"></i>
                            <button type="button" class="doc-move-btn" onclick="event.stopPropagation(); moveDoc('${d.id}', 1);" title="Sposta a destra / dopo" ${isLast ? 'disabled' : ''}>
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="doc-icon-wrapper" style="color: ${fileIconColor};">
                            <i class="${fileIconClass}"></i>
                        </div>
                    </div>
                    ${getCategoryBadge(d.category)}
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
                    ${isAvailable ? '<span style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-check"></i> Disponible</span>' : '<span style="font-size: 0.72rem; color: var(--accent-amber); font-weight: 600;"><i class="fa-solid fa-clock"></i> Emplacement réservé</span>'}
                </div>
                <div class="doc-action-group">
                    <button class="${viewBtnClass}" onclick="viewDocument('${d.id}')" title="${viewBtnTitle}">
                        <i class="fa-solid fa-eye" style="color: ${iconColor};"></i>
                    </button>
                    <button class="doc-btn-icon" onclick="downloadDocument('${d.id}')" title="${isAvailable ? 'Télécharger' : 'Télécharger (Non disponible)'}">
                        <i class="fa-solid fa-download" style="${isAvailable ? '' : 'opacity: 0.4;'}"></i>
                    </button>
                    <button class="doc-btn-icon edit" onclick="openEditModal('${d.id}')" title="Modifier nom / métadonnées">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="doc-btn-icon delete" onclick="deleteDocument('${d.id}')" title="Supprimer">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;

        setupCardDragEvents(card, d.id);
        container.appendChild(card);
    });
}

let draggedDocId = null;

function initContainerDragEvents() {
    const container = document.getElementById('doc-grid-container');
    if (!container || container._dndBound) return;
    container._dndBound = true;

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const targetCard = e.target.closest('.doc-card');
        container.querySelectorAll('.doc-card').forEach(c => {
            if (c !== targetCard) c.classList.remove('drag-over');
        });

        if (targetCard && targetCard.dataset.docId && targetCard.dataset.docId !== draggedDocId) {
            targetCard.classList.add('drag-over');
        }
    });

    container.addEventListener('dragleave', (e) => {
        if (!container.contains(e.relatedTarget)) {
            container.querySelectorAll('.doc-card').forEach(c => c.classList.remove('drag-over'));
        }
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.querySelectorAll('.doc-card').forEach(c => c.classList.remove('drag-over', 'dragging'));

        const targetCard = e.target.closest('.doc-card');
        const sourceId = e.dataTransfer.getData('text/plain') || draggedDocId;

        if (targetCard && sourceId) {
            const targetId = targetCard.dataset.docId;
            if (targetId && sourceId !== targetId) {
                reorderDocuments(sourceId, targetId);
            }
        }
        draggedDocId = null;
    });
}

function setupCardDragEvents(card, docId) {
    card.setAttribute('draggable', 'true');
    card.dataset.docId = docId;

    card.addEventListener('dragstart', (e) => {
        if (e.target.closest('button, a, input, select, textarea')) {
            e.preventDefault();
            return;
        }
        draggedDocId = docId;
        try {
            e.dataTransfer.setData('text/plain', docId);
            e.dataTransfer.effectAllowed = 'move';
        } catch (err) {}
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.doc-card').forEach(c => c.classList.remove('drag-over', 'dragging'));
        draggedDocId = null;
    });
}

function reorderDocuments(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    let docs = getStoredDocuments();
    const fromIndex = docs.findIndex(doc => doc.id === sourceId);
    const toIndex = docs.findIndex(doc => doc.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
        const [movedItem] = docs.splice(fromIndex, 1);
        docs.splice(toIndex, 0, movedItem);
        saveDocuments(docs);
        renderDocGrid();
    }
}

function moveDoc(docId, delta) {
    let docs = getStoredDocuments();
    const fromIndex = docs.findIndex(doc => doc.id === docId);
    if (fromIndex === -1) return;

    const toIndex = fromIndex + delta;
    if (toIndex < 0 || toIndex >= docs.length) return;

    const [movedItem] = docs.splice(fromIndex, 1);
    docs.splice(toIndex, 0, movedItem);
    saveDocuments(docs);
    renderDocGrid();
}

let currentViewingDocId = null;

async function viewDocument(docId) {
    const docs = getStoredDocuments();
    const d = docs.find(item => item.id === docId);
    if (!d) return;

    currentViewingDocId = docId;

    document.getElementById('view-modal-title').innerHTML = `<i class="fa-solid fa-file-pdf text-rose"></i> ${d.title}`;
    const frame = document.getElementById('pdf-viewer-frame');
    const dlLink = document.getElementById('modal-download-link');
    const tabLink = document.getElementById('modal-open-tab-link');
    const emptyNotice = document.getElementById('pdf-viewer-empty-notice');

    let fileUrl = null;
    if (window.DocStorage) {
        fileUrl = await window.DocStorage.getFileUrl(docId, d.filepath);
    } else {
        fileUrl = d.filepath;
    }

    if (!fileUrl && d.available) {
        if (d.id === 'DOC-2025-BILAN' || (d.title && d.title.toLowerCase().includes('bilan'))) {
            fileUrl = 'docs/NEW_LIFE_bilan_2025_RCSL_depose.pdf';
        } else if (d.id === 'DOC-RCS' || (d.title && d.title.toLowerCase().includes('rcs'))) {
            fileUrl = 'docs/Extrait RCS New Life 10.2025.pdf';
        } else if (d.id === 'DOC-RBE' || (d.title && d.title.toLowerCase().includes('rbe'))) {
            fileUrl = 'docs/NEW LIFE - Extrait RBE 10.2025.pdf';
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
                        Documento registrato nell'archivio societario.<br>
                        Il file PDF non è ancora presente in memoria locale o nella cartella <code>docs/</code>.
                    </p>
                    <label class="btn btn-primary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; padding: 0.65rem 1.25rem;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Carica e Visualizza PDF adesso
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style="display: none;" onchange="handleDirectUploadDoc('${d.id}', this)">
                    </label>
                </div>
            `;
        }
    }

    document.getElementById('view-doc-modal').classList.add('active');
}

async function downloadDocument(docId) {
    const docs = getStoredDocuments();
    const d = docs.find(item => item.id === docId);
    if (!d) return;

    let fileUrl = null;
    if (window.DocStorage) {
        fileUrl = await window.DocStorage.getFileUrl(docId, d.filepath);
    } else {
        fileUrl = d.filepath;
    }

    if (!fileUrl && d.available) {
        if (d.id === 'DOC-2025-BILAN' || (d.title && d.title.toLowerCase().includes('bilan'))) {
            fileUrl = 'docs/NEW_LIFE_bilan_2025_RCSL_depose.pdf';
        } else if (d.id === 'DOC-RCS' || (d.title && d.title.toLowerCase().includes('rcs'))) {
            fileUrl = 'docs/Extrait RCS New Life 10.2025.pdf';
        } else if (d.id === 'DOC-RBE' || (d.title && d.title.toLowerCase().includes('rbe'))) {
            fileUrl = 'docs/NEW LIFE - Extrait RBE 10.2025.pdf';
        }
    }

    if (fileUrl && (d.available !== false || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:'))) {
        const a = document.createElement('a');
        a.href = encodeURI(fileUrl);
        a.download = d.filename || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        await viewDocument(docId);
    }
}

async function handleModalDeleteDoc() {
    if (!currentViewingDocId) return;
    const docId = currentViewingDocId;
    closeViewModal();
    await deleteDocument(docId);
}

async function handleDirectUploadDoc(docId, inputElement) {
    if (!inputElement.files || inputElement.files.length === 0) return;
    const file = inputElement.files[0];

    if (window.DocStorage) {
        await window.DocStorage.saveFile(docId, file, file.name, file.type);
    }

    const docs = getStoredDocuments();
    const idx = docs.findIndex(d => d.id === docId);
    if (idx !== -1) {
        docs[idx].available = true;
        docs[idx].filename = file.name;
        docs[idx].size = `${(file.size / (1024 * 1024)).toFixed(2)} Mo`;
        saveDocuments(docs);
    }

    renderDocGrid();
    await viewDocument(docId);
}

function closeViewModal() {
    const frame = document.getElementById('pdf-viewer-frame');
    frame.src = '';
    document.getElementById('view-doc-modal').classList.remove('active');
}

function openEditModal(docId) {
    const docs = getStoredDocuments();
    const d = docs.find(item => item.id === docId);
    if (!d) return;

    document.getElementById('edit-doc-id').value = d.id;
    document.getElementById('edit-doc-title').value = d.title;
    document.getElementById('edit-doc-cat').value = d.category;
    document.getElementById('edit-doc-date').value = d.date;
    document.getElementById('edit-doc-notes').value = d.notes || '';

    document.getElementById('edit-doc-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-doc-modal').classList.remove('active');
}

function saveDocEdit() {
    const id = document.getElementById('edit-doc-id').value;
    const title = document.getElementById('edit-doc-title').value.trim();
    const cat = document.getElementById('edit-doc-cat').value;
    const date = document.getElementById('edit-doc-date').value;
    const notes = document.getElementById('edit-doc-notes').value.trim();

    if (!title) {
        alert("Veuillez saisir un titre de document.");
        return;
    }

    const docs = getStoredDocuments();
    const idx = docs.findIndex(item => item.id === id);
    if (idx !== -1) {
        docs[idx].title = title;
        docs[idx].category = cat;
        docs[idx].date = date;
        docs[idx].notes = notes;
        saveDocuments(docs);
        closeEditModal();
        renderDocGrid();
    }
}

async function deleteDocument(docId) {
    let docs = getStoredDocuments();
    const targetDoc = docs.find(d => d.id === docId);
    if (!targetDoc) return;

    const lang = localStorage.getItem('new_life_lang') || 'fr';
    let confirmMsg = `Êtes-vous sûr de vouloir supprimer définitivement le document "${targetDoc.title}" ?`;
    if (lang === 'it') {
        confirmMsg = `Sei sicuro di voler eliminare definitivamente il documento "${targetDoc.title}"?`;
    } else if (lang === 'en') {
        confirmMsg = `Are you sure you want to permanently delete the document "${targetDoc.title}"?`;
    }

    if (!confirm(confirmMsg)) return;

    docs = docs.filter(item => item.id !== docId);
    saveDocuments(docs);

    if (window.DocStorage) {
        try {
            await window.DocStorage.deleteFile(docId);
        } catch (err) {
            console.warn("DocStorage delete error:", err);
        }
    }

    if (currentViewingDocId === docId) {
        closeViewModal();
    }

    renderDocGrid();
}

function openUploadModal() {
    document.getElementById('upload-doc-title').value = '';
    document.getElementById('upload-doc-notes').value = '';
    document.getElementById('upload-file-input').value = '';
    document.getElementById('upload-doc-modal').classList.add('active');
}

function closeUploadModal() {
    document.getElementById('upload-doc-modal').classList.remove('active');
}

async function submitUploadDoc() {
    const title = document.getElementById('upload-doc-title').value.trim();
    const cat = document.getElementById('upload-doc-cat').value;
    const date = document.getElementById('upload-doc-date').value;
    const notes = document.getElementById('upload-doc-notes').value.trim();
    const fileInput = document.getElementById('upload-file-input');

    if (!title) {
        alert("Veuillez indiquer un titre pour le document.");
        return;
    }

    const file = fileInput.files && fileInput.files.length > 0 ? fileInput.files[0] : null;
    const filename = file ? file.name : `${title.replace(/\s+/g, '_')}.pdf`;
    const docId = "DOC-" + Date.now();
    const size = file ? `${(file.size / (1024 * 1024)).toFixed(2)} Mo` : "1.00 Mo";

    if (file && window.DocStorage) {
        await window.DocStorage.saveFile(docId, file, filename, file.type);
    }

    const newDoc = {
        id: docId,
        title: title,
        category: cat,
        date: date || new Date().toISOString().split('T')[0],
        filename: filename,
        filepath: `docs/${filename}`,
        size: size,
        type: file ? file.type : "PDF Document",
        notes: notes,
        available: !!file
    };

    const docs = getStoredDocuments();
    docs.unshift(newDoc);
    saveDocuments(docs);

    closeUploadModal();
    renderDocGrid();

    if (file) {
        await viewDocument(docId);
    }
}

window.onLanguageChange = function() {
    renderDocGrid();
};

document.addEventListener('DOMContentLoaded', initDocumenti);
