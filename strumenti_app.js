/**
 * NEW LIFE Sàrl - Gestione Utenti & Password (Versione Semplificata e Diretta)
 */

const INITIAL_ENTRIES = [
    {
        id: 'usr_1',
        name: 'TUBIA EDOARDO',
        username: 'tubia.edoardo@gmail.com',
        password: 'edo2bia',
        role: 'Gérant / Administrateur',
        pin: 'LuxTrust Mobile',
        notes: 'Gérant / Amministratore Unico NEW LIFE Sàrl - Accesso Principale',
        updatedAt: '2026-09-29'
    },
    {
        id: 'usr_2',
        name: 'CABINET FIDUCIAIRE (Comptable)',
        username: 'fidu.compta@luxfiduciaire.lu',
        password: 'Fidu*Lux2026#Compta',
        role: 'Comptable / Fiduciaire',
        pin: '2FA Email',
        notes: 'Accesso per revisione contabile e bilanci PCN',
        updatedAt: '2026-09-25'
    },
    {
        id: 'usr_3',
        name: 'POST LUXEMBOURG (Banque)',
        username: 'NL_POST_PRO',
        password: 'NL*Post2026!LuxVault#99',
        role: 'Compte Bancaire (POST)',
        pin: 'Token LuxTrust',
        notes: 'Compte courant principal POST WebBanking Pro',
        updatedAt: '2026-09-20'
    },
    {
        id: 'usr_4',
        name: 'MYGUICHET & RCSL (Administration)',
        username: 'EDOARDO_TUBIA_RCS',
        password: 'Rcs*Luxembourg2026!B225643',
        role: 'Administration / RCSL',
        pin: 'Matricule 2018 2432 026',
        notes: 'Portale LBR.lu e MyGuichet.lu per depositi legali e RCS',
        updatedAt: '2026-09-15'
    },
    {
        id: 'usr_5',
        name: 'EMAIL & CLOUD GOOGLE WORKSPACE',
        username: 'admin@newlife.lu',
        password: 'GSuite*NL#9842Key!',
        role: 'Messagerie / Email',
        pin: 'Google 2FA',
        notes: 'Caselle email aziendali e archivio cloud',
        updatedAt: '2026-09-10'
    }
];

class SimpleUserManager {
    constructor() {
        this.entries = this.loadData();
        this.revealed = new Set();
        this.init();
    }

    loadData() {
        try {
            const saved = localStorage.getItem('new_life_simple_users_pwd');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
        return [...INITIAL_ENTRIES];
    }

    saveData() {
        try {
            localStorage.setItem('new_life_simple_users_pwd', JSON.stringify(this.entries));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Search
        document.getElementById('user-search-input')?.addEventListener('input', () => this.render());

        // Add Button
        document.getElementById('btn-add-user')?.addEventListener('click', () => this.openModal());

        // Modal Close / Cancel
        document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.closeModal());

        // Modal Save
        document.getElementById('btn-modal-save')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveEntry();
        });

        // Quick Generate Password
        document.getElementById('btn-gen-pwd')?.addEventListener('click', () => {
            const pwdField = document.getElementById('entry-password');
            if (pwdField) {
                pwdField.value = this.generateStrongPassword();
                this.showToast('Password sicura generata!');
            }
        });

        // Export Backup
        document.getElementById('btn-export-json')?.addEventListener('click', () => this.exportBackup());
    }

    render() {
        const container = document.getElementById('users-cards-container');
        if (!container) return;

        const query = document.getElementById('user-search-input')?.value.toLowerCase().trim() || '';

        const filtered = this.entries.filter(e => {
            return (
                (e.name && e.name.toLowerCase().includes(query)) ||
                (e.username && e.username.toLowerCase().includes(query)) ||
                (e.role && e.role.toLowerCase().includes(query)) ||
                (e.notes && e.notes.toLowerCase().includes(query))
            );
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <i class="fa-solid fa-user-slash" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">Nessun utente trovato per questa ricerca.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => {
            const isRevealed = this.revealed.has(item.id);
            const pwdText = isRevealed ? this.escapeHtml(item.password) : '••••••••••••••••';
            const initials = item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const roleBadge = this.getRoleBadge(item.role);

            return `
                <div class="vault-card draggable" draggable="true" data-id="${item.id}" style="border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem;">
                    <div class="vault-card-header" style="margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="display: flex; align-items: center; gap: 0.85rem;">
                            <div class="user-card-avatar" style="width: 44px; height: 44px; font-size: 1.1rem;">${initials}</div>
                            <div>
                                <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 0;">${this.escapeHtml(item.name)}</h3>
                                <div style="margin-top: 0.2rem;">${roleBadge}</div>
                            </div>
                        </div>
                        <div class="drag-handle" title="Trascina per spostare d'ordine">
                            <i class="fa-solid fa-grip-vertical"></i>
                        </div>
                    </div>

                    <div class="vault-fields-box" style="margin-bottom: 1rem;">
                        <!-- Email / Username -->
                        <div class="vault-field-row">
                            <span class="vault-field-label">Email / Login di Accesso</span>
                            <div class="vault-field-value-wrapper">
                                <span class="vault-field-text" style="color: var(--accent-blue); font-weight: 600;">${this.escapeHtml(item.username)}</span>
                                <div class="vault-field-actions">
                                    <button class="btn-icon-action" onclick="appSimpleUser.copy('${this.escapeJs(item.username)}')" title="Copia Email/Login">
                                        <i class="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Password Field -->
                        <div class="vault-field-row">
                            <span class="vault-field-label">Password Attuale</span>
                            <div class="vault-field-value-wrapper">
                                <span class="vault-field-text" style="${isRevealed ? 'color: var(--accent-emerald); font-weight: 800;' : ''}">${pwdText}</span>
                                <div class="vault-field-actions">
                                    <button class="btn-icon-action" onclick="appSimpleUser.toggleReveal('${item.id}')" title="${isRevealed ? 'Nascondi' : 'Mostra Password'}">
                                        <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                    </button>
                                    <button class="btn-icon-action" onclick="appSimpleUser.copy('${this.escapeJs(item.password)}')" title="Copia Password">
                                        <i class="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- PIN (if exists) -->
                        ${item.pin ? `
                            <div class="vault-field-row">
                                <span class="vault-field-label">PIN / 2FA</span>
                                <div class="vault-field-value-wrapper">
                                    <span class="vault-field-text" style="color: var(--accent-amber);">${this.escapeHtml(item.pin)}</span>
                                    <div class="vault-field-actions">
                                        <button class="btn-icon-action" onclick="appSimpleUser.copy('${this.escapeJs(item.pin)}')" title="Copia PIN">
                                            <i class="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Notes (if exists) -->
                        ${item.notes ? `
                            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.35rem; font-style: italic;">
                                <i class="fa-regular fa-comment-dots" style="margin-right: 0.3rem;"></i>${this.escapeHtml(item.notes)}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem;">
                        <button class="btn btn-primary btn-sm" onclick="appSimpleUser.openModal('${item.id}')" style="flex: 1; padding: 0.45rem 0.75rem;">
                            <i class="fa-solid fa-key"></i> <strong>Modifica Password / Dati</strong>
                        </button>
                        <button class="btn btn-outline-rose btn-sm" onclick="appSimpleUser.delete('${item.id}')" title="Elimina Utente">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachDragAndDrop();
    }

    attachDragAndDrop() {
        const cards = document.querySelectorAll('.vault-card.draggable');
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedId = card.getAttribute('data-id');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', this.draggedId);
                setTimeout(() => card.classList.add('dragging'), 0);
            });

            card.addEventListener('dragend', () => {
                cards.forEach(c => c.classList.remove('dragging', 'drag-over'));
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (!card.classList.contains('dragging')) {
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cards.forEach(c => c.classList.remove('drag-over', 'dragging'));

                const targetId = card.getAttribute('data-id');
                if (this.draggedId && targetId && this.draggedId !== targetId) {
                    const fromIdx = this.entries.findIndex(entry => entry.id === this.draggedId);
                    const toIdx = this.entries.findIndex(entry => entry.id === targetId);

                    if (fromIdx !== -1 && toIdx !== -1) {
                        const [movedItem] = this.entries.splice(fromIdx, 1);
                        this.entries.splice(toIdx, 0, movedItem);
                        this.saveData();
                        this.render();
                        this.showToast('Ordine schede aggiornato!');
                    }
                }
            });
        });
    }

    openModal(id = null) {
        const modal = document.getElementById('modal-user-pwd');
        const form = document.getElementById('form-user-pwd');
        const titleEl = document.getElementById('modal-title');

        if (!modal || !form) return;

        form.reset();

        if (id) {
            const item = this.entries.find(e => e.id === id);
            if (item) {
                document.getElementById('entry-id').value = item.id;
                document.getElementById('entry-name').value = item.name || '';
                document.getElementById('entry-username').value = item.username || '';
                document.getElementById('entry-password').value = item.password || '';
                document.getElementById('entry-role').value = item.role || 'Gérant / Administrateur';
                document.getElementById('entry-pin').value = item.pin || '';
                document.getElementById('entry-notes').value = item.notes || '';
                if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-key text-emerald"></i> Modifica Password: <strong>${this.escapeHtml(item.name)}</strong>`;
            }
        } else {
            document.getElementById('entry-id').value = '';
            document.getElementById('entry-password').value = this.generateStrongPassword();
            if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-plus text-emerald"></i> Aggiungi Nuovo Utente & Password';
        }

        modal.classList.add('active');
        document.getElementById('entry-password')?.focus();
    }

    closeModal() {
        document.getElementById('modal-user-pwd')?.classList.remove('active');
    }

    saveEntry() {
        const id = document.getElementById('entry-id')?.value;
        const name = document.getElementById('entry-name')?.value.trim();
        const username = document.getElementById('entry-username')?.value.trim();
        const password = document.getElementById('entry-password')?.value.trim();
        const role = document.getElementById('entry-role')?.value;
        const pin = document.getElementById('entry-pin')?.value.trim();
        const notes = document.getElementById('entry-notes')?.value.trim();

        if (!name || !username || !password) {
            alert('Per favore compila i campi obbligatori: Nome, Email/Login e Password.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        if (id) {
            const idx = this.entries.findIndex(e => e.id === id);
            if (idx !== -1) {
                this.entries[idx] = {
                    ...this.entries[idx],
                    name, username, password, role, pin, notes,
                    updatedAt: today
                };
            }
        } else {
            const newEntry = {
                id: 'usr_' + Date.now(),
                name, username, password, role, pin, notes,
                updatedAt: today
            };
            this.entries.unshift(newEntry);
        }

        this.saveData();
        this.render();
        this.closeModal();
        this.showToast('Dati e Password salvati con successo!');
    }

    delete(id) {
        const item = this.entries.find(e => e.id === id);
        const name = item ? item.name : 'questo utente';
        if (confirm(`Sei sicuro di voler eliminare ${name}?`)) {
            this.entries = this.entries.filter(e => e.id !== id);
            this.revealed.delete(id);
            this.saveData();
            this.render();
            this.showToast('Utente eliminato.');
        }
    }

    toggleReveal(id) {
        if (this.revealed.has(id)) {
            this.revealed.delete(id);
        } else {
            this.revealed.add(id);
        }
        this.render();
    }

    copy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copiato negli appunti!');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast('Copiato negli appunti!');
        } catch (err) {
            console.error('Copy error', err);
        }
        document.body.removeChild(textArea);
    }

    showToast(msg) {
        const toast = document.getElementById('toast-notify');
        const text = document.getElementById('toast-text');
        if (toast && text) {
            text.innerText = msg;
            toast.classList.add('show');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        }
    }

    generateStrongPassword(length = 16) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
        let res = '';
        const cryptoObj = window.crypto || window.msCrypto;
        if (cryptoObj && cryptoObj.getRandomValues) {
            const rand = new Uint32Array(length);
            cryptoObj.getRandomValues(rand);
            for (let i = 0; i < length; i++) res += chars[rand[i] % chars.length];
        } else {
            for (let i = 0; i < length; i++) res += chars[Math.floor(Math.random() * chars.length)];
        }
        return res;
    }

    exportBackup() {
        const dataStr = JSON.stringify(this.entries, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NEW_LIFE_Utenti_Password_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Backup salvato su file!');
    }

    getRoleBadge(role) {
        if (!role) return '<span class="badge badge-ext">Utente</span>';
        if (role.includes('Gérant') || role.includes('Admin')) {
            return '<span class="badge badge-entree"><i class="fa-solid fa-crown"></i> Gérant / Admin</span>';
        }
        if (role.includes('Comptable') || role.includes('Fiduciaire')) {
            return '<span class="badge badge-ord"><i class="fa-solid fa-calculator"></i> Fiduciaire</span>';
        }
        if (role.includes('Banque') || role.includes('POST')) {
            return '<span class="badge" style="background: rgba(59,130,246,0.15); color: #60a5fa;"><i class="fa-solid fa-building-columns"></i> Banque</span>';
        }
        return `<span class="badge badge-ext">${this.escapeHtml(role)}</span>`;
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }

    escapeJs(str) {
        if (!str) return '';
        return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
}

let appSimpleUser = null;
document.addEventListener('DOMContentLoaded', () => {
    appSimpleUser = new SimpleUserManager();
});
