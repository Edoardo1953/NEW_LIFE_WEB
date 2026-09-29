/**
 * NEW LIFE Sàrl - Module Strumenti, Gestione Utenti & Password Manager
 */

// Initial Default Credentials for NEW LIFE Sàrl
const DEFAULT_CREDENTIALS = [
    {
        id: 'cred_1',
        title: 'POST Luxembourg - WebBanking Pro',
        category: 'banking',
        url: 'https://www.post.lu/fr/particuliers/finance/ebanking',
        username: 'NL_POST_PRO',
        password: 'NL*Post2026!LuxVault#99',
        pin: 'LuxTrust Mobile / Token 2FA',
        notes: 'Compte courant principal de la société NEW LIFE Sàrl. Validation via LuxTrust App.',
        updatedAt: '2026-09-28'
    },
    {
        id: 'cred_2',
        title: 'MyGuichet.lu - Espace Entreprise',
        category: 'gov',
        url: 'https://myguichet.lu',
        username: 'tubia.edoardo@gmail.com',
        password: 'MyGuichet#NL2026$Secure',
        pin: 'Certificat LuxTrust ID',
        notes: 'Dépôt des actes, démarches administratives et accès ministères luxembourgeois.',
        updatedAt: '2026-09-25'
    },
    {
        id: 'cred_3',
        title: 'RCSL - Registre de Commerce et des Sociétés',
        category: 'gov',
        url: 'https://www.lbr.lu',
        username: 'EDOARDO_TUBIA_RCS',
        password: 'Rcs*Luxembourg2026!B225643',
        pin: 'Matricule: 2018 2432 026',
        notes: 'Dépôt des comptes annuels, modifications statutaires et consultations RBE.',
        updatedAt: '2026-09-20'
    },
    {
        id: 'cred_4',
        title: 'Administration de l\'Enregistrement (AED / TVA)',
        category: 'gov',
        url: 'https://pfi.public.lu',
        username: 'LU30456108_TVA',
        password: 'Aed#TvaLux2026*NewLife',
        pin: 'Code Sécurité AED',
        notes: 'Déclarations périodiques et annuelles de TVA luxembourgeoise.',
        updatedAt: '2026-09-15'
    },
    {
        id: 'cred_5',
        title: 'Administration des Contributions Directes (ACD)',
        category: 'gov',
        url: 'https://impotsdirects.public.lu',
        username: 'NEWLIFE_ACD_2018',
        password: 'Acd*DirectTaxes2026!NL',
        pin: 'N° Dossier Fiscal: 2018 2432 026',
        notes: 'Impôt sur le revenu des collectivités (IRC), ICC et impôt sur la fortune (IF).',
        updatedAt: '2026-09-10'
    },
    {
        id: 'cred_6',
        title: 'Google Workspace / Messagerie Entreprise',
        category: 'email',
        url: 'https://workspace.google.com',
        username: 'admin@newlife.lu',
        password: 'GSuite*NL#9842MasterKey!',
        pin: 'Google Authenticator 2FA',
        notes: 'Gestion des adresses emails professionnelles et stockage Google Drive archivage.',
        updatedAt: '2026-09-01'
    }
];

// Initial Default Users for NEW LIFE Sàrl
const DEFAULT_USERS = [
    {
        id: 'user_1',
        fullname: 'Edoardo Tubia',
        email: 'tubia.edoardo@gmail.com',
        role: 'admin',
        modules: ['Vue d’ensemble', 'Compte Courant', 'Comptabilité PCN', 'Amortissements', 'Participations', 'Documents', 'Outils'],
        status: 'active',
        createdAt: '2026-01-01'
    },
    {
        id: 'user_2',
        fullname: 'Cabinet Fiduciaire & Expert-Comptable',
        email: 'fidu.compta@luxfiduciaire.lu',
        role: 'accountant',
        modules: ['Vue d’ensemble', 'Compte Courant', 'Comptabilité PCN', 'Amortissements', 'Documents'],
        status: 'active',
        createdAt: '2026-02-15'
    },
    {
        id: 'user_3',
        fullname: 'Auditeur / Réviseur Externe',
        email: 'audit@luxembourg-audit.lu',
        role: 'viewer',
        modules: ['Vue d’ensemble', 'Comptabilité PCN', 'Documents'],
        status: 'active',
        createdAt: '2026-03-10'
    }
];

class StrumentiManager {
    constructor() {
        this.credentials = this.loadCredentials();
        this.users = this.loadUsers();
        this.revealedPasswords = new Set();
        this.init();
    }

    loadCredentials() {
        try {
            const saved = localStorage.getItem('new_life_vault_credentials');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading credentials:', e);
        }
        return [...DEFAULT_CREDENTIALS];
    }

    saveCredentials() {
        try {
            localStorage.setItem('new_life_vault_credentials', JSON.stringify(this.credentials));
            this.updateKPIs();
        } catch (e) {
            console.error('Error saving credentials:', e);
        }
    }

    loadUsers() {
        try {
            const saved = localStorage.getItem('new_life_vault_users');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading users:', e);
        }
        return [...DEFAULT_USERS];
    }

    saveUsers() {
        try {
            localStorage.setItem('new_life_vault_users', JSON.stringify(this.users));
            this.updateKPIs();
        } catch (e) {
            console.error('Error saving users:', e);
        }
    }

    init() {
        this.bindEvents();
        this.renderCredentials();
        this.renderUsers();
        this.updateKPIs();
        this.generateRandomPassword();
        this.initCalculator();
    }

    bindEvents() {
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

        // Filter / Search for credentials
        const credSearch = document.getElementById('vault-search-input');
        const credCat = document.getElementById('vault-cat-filter');
        if (credSearch) credSearch.addEventListener('input', () => this.renderCredentials());
        if (credCat) credCat.addEventListener('change', () => this.renderCredentials());

        // Filter / Search for users
        const userSearch = document.getElementById('users-search-input');
        if (userSearch) userSearch.addEventListener('input', () => this.renderUsers());

        // Credential Modal Buttons
        document.getElementById('btn-open-add-credential')?.addEventListener('click', () => this.openCredentialModal());
        document.getElementById('btn-close-modal-cred')?.addEventListener('click', () => this.closeCredentialModal());
        document.getElementById('btn-cancel-cred')?.addEventListener('click', () => this.closeCredentialModal());
        document.getElementById('btn-save-cred')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveCredentialFromForm();
        });
        document.getElementById('btn-modal-gen-pwd')?.addEventListener('click', () => {
            const pwdInput = document.getElementById('cred-password');
            if (pwdInput) {
                pwdInput.value = this.generateCustomPassword(18, true, true, true, true);
                this.showToast('Nouveau mot de passe généré !');
            }
        });

        // User Modal Buttons
        document.getElementById('btn-open-add-user')?.addEventListener('click', () => this.openUserModal());
        document.getElementById('btn-close-modal-user')?.addEventListener('click', () => this.closeUserModal());
        document.getElementById('btn-cancel-user')?.addEventListener('click', () => this.closeUserModal());
        document.getElementById('btn-save-user')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveUserFromForm();
        });

        // Export / Import
        document.getElementById('btn-export-vault')?.addEventListener('click', () => this.exportVaultBackup());
        document.getElementById('btn-import-vault-trigger')?.addEventListener('click', () => {
            document.getElementById('vault-import-file')?.click();
        });
        document.getElementById('vault-import-file')?.addEventListener('change', (e) => this.handleVaultImport(e));

        // Generator events
        document.getElementById('btn-generate-now')?.addEventListener('click', () => this.generateRandomPassword());
        document.getElementById('btn-copy-generated')?.addEventListener('click', () => {
            const text = document.getElementById('gen-output')?.innerText;
            if (text) this.copyToClipboard(text);
        });
        const slider = document.getElementById('gen-length-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                document.getElementById('gen-length-val').innerText = e.target.value;
                this.generateRandomPassword();
            });
        }
        ['gen-opt-upper', 'gen-opt-lower', 'gen-opt-numbers', 'gen-opt-symbols'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.generateRandomPassword());
        });

        // VIES Validator
        document.getElementById('btn-check-vies')?.addEventListener('click', () => this.validateViesVat());
    }

    renderCredentials() {
        const container = document.getElementById('vault-grid-container');
        if (!container) return;

        const query = document.getElementById('vault-search-input')?.value.toLowerCase().trim() || '';
        const cat = document.getElementById('vault-cat-filter')?.value || 'ALL';

        const filtered = this.credentials.filter(c => {
            const matchCat = (cat === 'ALL' || c.category === cat);
            const matchQuery = (
                (c.title && c.title.toLowerCase().includes(query)) ||
                (c.username && c.username.toLowerCase().includes(query)) ||
                (c.url && c.url.toLowerCase().includes(query)) ||
                (c.notes && c.notes.toLowerCase().includes(query))
            );
            return matchCat && matchQuery;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <i class="fa-solid fa-key" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4;"></i>
                    <p style="font-size: 1rem; font-weight: 600;">Aucun identifiant trouvé pour ces critères.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(c => {
            const isRevealed = this.revealedPasswords.has(c.id);
            const pwdDisplay = isRevealed ? this.escapeHtml(c.password) : '••••••••••••••••';
            const iconData = this.getCategoryIcon(c.category);
            const strengthBadge = this.getStrengthBadge(c.password);

            return `
                <div class="vault-card">
                    <div class="vault-card-header">
                        <div class="vault-service-info">
                            <div class="vault-icon-badge" style="background: ${iconData.bg}; color: ${iconData.color}; border-color: ${iconData.border};">
                                <i class="${iconData.icon}"></i>
                            </div>
                            <div>
                                <div class="vault-service-title">${this.escapeHtml(c.title)}</div>
                                ${c.url ? `
                                    <a href="${this.escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer" class="vault-service-url">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Accéder au site
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                        <span class="badge" style="background: ${iconData.bg}; color: ${iconData.color}; font-size: 0.7rem;">${iconData.label}</span>
                    </div>

                    <div class="vault-fields-box">
                        <!-- Username Row -->
                        <div class="vault-field-row">
                            <span class="vault-field-label">Identifiant / Login</span>
                            <div class="vault-field-value-wrapper">
                                <span class="vault-field-text">${this.escapeHtml(c.username)}</span>
                                <div class="vault-field-actions">
                                    <button class="btn-icon-action" onclick="appStrumenti.copyToClipboard('${this.escapeJs(c.username)}')" title="Copier l'identifiant">
                                        <i class="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Password Row -->
                        <div class="vault-field-row">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="vault-field-label">Mot de Passe</span>
                                ${strengthBadge}
                            </div>
                            <div class="vault-field-value-wrapper">
                                <span class="vault-field-text" style="${isRevealed ? 'color: var(--accent-emerald); font-weight: 700;' : ''}">${pwdDisplay}</span>
                                <div class="vault-field-actions">
                                    <button class="btn-icon-action" onclick="appStrumenti.toggleRevealPassword('${c.id}')" title="${isRevealed ? 'Masquer' : 'Afficher'}">
                                        <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                    </button>
                                    <button class="btn-icon-action" onclick="appStrumenti.copyToClipboard('${this.escapeJs(c.password)}')" title="Copier le mot de passe">
                                        <i class="fa-regular fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- PIN / 2FA Row (if exists) -->
                        ${c.pin ? `
                            <div class="vault-field-row">
                                <span class="vault-field-label">PIN / 2FA / Info</span>
                                <div class="vault-field-value-wrapper">
                                    <span class="vault-field-text" style="color: var(--accent-amber);">${this.escapeHtml(c.pin)}</span>
                                    <div class="vault-field-actions">
                                        <button class="btn-icon-action" onclick="appStrumenti.copyToClipboard('${this.escapeJs(c.pin)}')" title="Copier">
                                            <i class="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Notes (if exists) -->
                        ${c.notes ? `
                            <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.2rem; font-style: italic;">
                                <i class="fa-regular fa-comment-dots" style="margin-right: 0.3rem;"></i>${this.escapeHtml(c.notes)}
                            </div>
                        ` : ''}
                    </div>

                    <div class="vault-footer-meta">
                        <span><i class="fa-regular fa-clock"></i> Màj: ${c.updatedAt || 'Récent'}</span>
                        <div style="display: flex; gap: 0.4rem;">
                            <button class="btn btn-secondary btn-sm" onclick="appStrumenti.openCredentialModal('${c.id}')">
                                <i class="fa-solid fa-pen-to-square"></i> Modifier
                            </button>
                            <button class="btn btn-outline-rose btn-sm" onclick="appStrumenti.deleteCredential('${c.id}')">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        const query = document.getElementById('users-search-input')?.value.toLowerCase().trim() || '';

        const filtered = this.users.filter(u => {
            return (
                (u.fullname && u.fullname.toLowerCase().includes(query)) ||
                (u.email && u.email.toLowerCase().includes(query)) ||
                (u.role && u.role.toLowerCase().includes(query))
            );
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">
                        Aucun utilisateur trouvé.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(u => {
            const initials = u.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const roleBadge = this.getRoleBadge(u.role);
            const statusBadge = u.status === 'active' 
                ? '<span class="badge badge-entree"><i class="fa-solid fa-circle-check"></i> Actif</span>'
                : '<span class="badge badge-sortie"><i class="fa-solid fa-circle-xmark"></i> Inactif</span>';

            const moduleTags = (u.modules || []).map(m => `<span class="tag-module">${this.escapeHtml(m)}</span>`).join('');

            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="user-card-avatar">${initials}</div>
                            <div>
                                <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${this.escapeHtml(u.fullname)}</div>
                                <div style="font-size: 0.72rem; color: var(--text-muted);">Créé le: ${u.createdAt || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td><strong style="color: var(--accent-blue);">${this.escapeHtml(u.email)}</strong></td>
                    <td>${roleBadge}</td>
                    <td>
                        <div class="user-module-tags">${moduleTags}</div>
                    </td>
                    <td>${statusBadge}</td>
                    <td class="text-right">
                        <div style="display: inline-flex; gap: 0.4rem;">
                            <button class="btn btn-secondary btn-sm" onclick="appStrumenti.openUserModal('${u.id}')">
                                <i class="fa-solid fa-user-pen"></i>
                            </button>
                            <button class="btn btn-outline-rose btn-sm" onclick="appStrumenti.deleteUser('${u.id}')">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateKPIs() {
        const vaultCountEl = document.getElementById('kpi-vault-count');
        const usersCountEl = document.getElementById('kpi-users-count');
        const strongCountEl = document.getElementById('kpi-strong-count');
        const backupStatusEl = document.getElementById('kpi-backup-status');

        if (vaultCountEl) vaultCountEl.innerText = this.credentials.length;
        if (usersCountEl) usersCountEl.innerText = this.users.filter(u => u.status === 'active').length;
        
        if (strongCountEl) {
            const strong = this.credentials.filter(c => (c.password && c.password.length >= 12)).length;
            strongCountEl.innerText = `${strong} / ${this.credentials.length}`;
        }

        if (backupStatusEl) {
            const total = this.credentials.length + this.users.length;
            backupStatusEl.innerText = `Prêt (${total} entrées)`;
        }
    }

    toggleRevealPassword(id) {
        if (this.revealedPasswords.has(id)) {
            this.revealedPasswords.delete(id);
        } else {
            this.revealedPasswords.add(id);
        }
        this.renderCredentials();
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copié dans le presse-papier !');
            }).catch(() => {
                this.fallbackCopyText(text);
            });
        } else {
            this.fallbackCopyText(text);
        }
    }

    fallbackCopyText(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showToast('Copié dans le presse-papier !');
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
    }

    showToast(msg) {
        const toast = document.getElementById('toast-notify');
        const text = document.getElementById('toast-text');
        if (toast && text) {
            text.innerText = msg;
            toast.classList.add('show');
            clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        }
    }

    // Modal Credential Actions
    openCredentialModal(id = null) {
        const modal = document.getElementById('modal-credential');
        const form = document.getElementById('form-credential');
        const titleEl = document.getElementById('modal-credential-title');

        if (!modal || !form) return;

        form.reset();
        if (id) {
            const cred = this.credentials.find(c => c.id === id);
            if (cred) {
                document.getElementById('cred-id').value = cred.id;
                document.getElementById('cred-title').value = cred.title || '';
                document.getElementById('cred-category').value = cred.category || 'banking';
                document.getElementById('cred-url').value = cred.url || '';
                document.getElementById('cred-username').value = cred.username || '';
                document.getElementById('cred-password').value = cred.password || '';
                document.getElementById('cred-pin').value = cred.pin || '';
                document.getElementById('cred-notes').value = cred.notes || '';
                if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-pen text-emerald"></i> Modifier l\'Identifiant';
            }
        } else {
            document.getElementById('cred-id').value = '';
            document.getElementById('cred-password').value = this.generateCustomPassword(16, true, true, true, true);
            if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-key text-emerald"></i> Ajouter un Identifiant';
        }

        modal.classList.add('active');
    }

    closeCredentialModal() {
        document.getElementById('modal-credential')?.classList.remove('active');
    }

    saveCredentialFromForm() {
        const id = document.getElementById('cred-id')?.value;
        const title = document.getElementById('cred-title')?.value.trim();
        const category = document.getElementById('cred-category')?.value;
        const url = document.getElementById('cred-url')?.value.trim();
        const username = document.getElementById('cred-username')?.value.trim();
        const password = document.getElementById('cred-password')?.value;
        const pin = document.getElementById('cred-pin')?.value.trim();
        const notes = document.getElementById('cred-notes')?.value.trim();

        if (!title || !username || !password) {
            alert('Veuillez remplir les champs obligatoires (Titre, Identifiant, Mot de passe).');
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        if (id) {
            const idx = this.credentials.findIndex(c => c.id === id);
            if (idx !== -1) {
                this.credentials[idx] = {
                    ...this.credentials[idx],
                    title, category, url, username, password, pin, notes,
                    updatedAt: today
                };
            }
        } else {
            const newCred = {
                id: 'cred_' + Date.now(),
                title, category, url, username, password, pin, notes,
                updatedAt: today
            };
            this.credentials.unshift(newCred);
        }

        this.saveCredentials();
        this.renderCredentials();
        this.closeCredentialModal();
        this.showToast('Identifiant enregistré avec succès !');
    }

    deleteCredential(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet identifiant ?')) {
            this.credentials = this.credentials.filter(c => c.id !== id);
            this.revealedPasswords.delete(id);
            this.saveCredentials();
            this.renderCredentials();
            this.showToast('Identifiant supprimé.');
        }
    }

    // Modal User Actions
    openUserModal(id = null) {
        const modal = document.getElementById('modal-user');
        const form = document.getElementById('form-user');
        const titleEl = document.getElementById('modal-user-title');

        if (!modal || !form) return;

        form.reset();
        if (id) {
            const user = this.users.find(u => u.id === id);
            if (user) {
                document.getElementById('user-id').value = user.id;
                document.getElementById('user-fullname').value = user.fullname || '';
                document.getElementById('user-email').value = user.email || '';
                document.getElementById('user-role').value = user.role || 'viewer';
                document.getElementById('user-status').value = user.status || 'active';

                const modCbs = document.querySelectorAll('.user-mod-cb');
                modCbs.forEach(cb => {
                    cb.checked = (user.modules || []).includes(cb.value);
                });

                if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-pen text-blue"></i> Modifier l\'Utilisateur';
            }
        } else {
            document.getElementById('user-id').value = '';
            document.querySelectorAll('.user-mod-cb').forEach(cb => cb.checked = true);
            if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-user-plus text-blue"></i> Ajouter un Utilisateur';
        }

        modal.classList.add('active');
    }

    closeUserModal() {
        document.getElementById('modal-user')?.classList.remove('active');
    }

    saveUserFromForm() {
        const id = document.getElementById('user-id')?.value;
        const fullname = document.getElementById('user-fullname')?.value.trim();
        const email = document.getElementById('user-email')?.value.trim();
        const role = document.getElementById('user-role')?.value;
        const status = document.getElementById('user-status')?.value;

        const selectedModules = [];
        document.querySelectorAll('.user-mod-cb:checked').forEach(cb => {
            selectedModules.push(cb.value);
        });

        if (!fullname || !email) {
            alert('Veuillez renseigner le nom et l\'adresse email.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        if (id) {
            const idx = this.users.findIndex(u => u.id === id);
            if (idx !== -1) {
                this.users[idx] = {
                    ...this.users[idx],
                    fullname, email, role, status,
                    modules: selectedModules
                };
            }
        } else {
            const newUser = {
                id: 'user_' + Date.now(),
                fullname, email, role, status,
                modules: selectedModules,
                createdAt: today
            };
            this.users.push(newUser);
        }

        this.saveUsers();
        this.renderUsers();
        this.closeUserModal();
        this.showToast('Utilisateur enregistré avec succès !');
    }

    deleteUser(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            this.users = this.users.filter(u => u.id !== id);
            this.saveUsers();
            this.renderUsers();
            this.showToast('Utilisateur supprimé.');
        }
    }

    // Export & Import Vault
    exportVaultBackup() {
        const backupData = {
            app: 'NEW_LIFE_SARL_VAULT',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            credentials: this.credentials,
            users: this.users
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NEW_LIFE_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Sauvegarde exportée avec succès !');
    }

    handleVaultImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.credentials && Array.isArray(data.credentials)) {
                    this.credentials = data.credentials;
                    this.saveCredentials();
                    this.renderCredentials();
                }
                if (data.users && Array.isArray(data.users)) {
                    this.users = data.users;
                    this.saveUsers();
                    this.renderUsers();
                }
                this.showToast('Sauvegarde restaurée avec succès !');
            } catch (err) {
                alert('Erreur lors de la lecture du fichier JSON de sauvegarde.');
            }
        };
        reader.readAsText(file);
    }

    // Password Generator
    generateRandomPassword() {
        const length = parseInt(document.getElementById('gen-length-slider')?.value || 18, 10);
        const useUpper = document.getElementById('gen-opt-upper')?.checked ?? true;
        const useLower = document.getElementById('gen-opt-lower')?.checked ?? true;
        const useNumbers = document.getElementById('gen-opt-numbers')?.checked ?? true;
        const useSymbols = document.getElementById('gen-opt-symbols')?.checked ?? true;

        const pwd = this.generateCustomPassword(length, useUpper, useLower, useNumbers, useSymbols);
        const out = document.getElementById('gen-output');
        if (out) out.innerText = pwd;

        this.updateStrengthUI(pwd);
    }

    generateCustomPassword(length = 16, upper = true, lower = true, numbers = true, symbols = true) {
        let chars = '';
        if (upper) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        if (lower) chars += 'abcdefghijkmnpqrstuvwxyz';
        if (numbers) chars += '23456789';
        if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) chars = 'abcdefghjkmnpqrstuvwxyz23456789';

        let result = '';
        const cryptoObj = window.crypto || window.msCrypto;
        if (cryptoObj && cryptoObj.getRandomValues) {
            const randomValues = new Uint32Array(length);
            cryptoObj.getRandomValues(randomValues);
            for (let i = 0; i < length; i++) {
                result += chars[randomValues[i] % chars.length];
            }
        } else {
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        return result;
    }

    updateStrengthUI(pwd) {
        const bar = document.getElementById('gen-strength-bar');
        const label = document.getElementById('gen-strength-label');
        const entropyEl = document.getElementById('gen-entropy-label');

        if (!pwd) return;

        let score = 0;
        if (pwd.length >= 12) score += 1;
        if (pwd.length >= 16) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        const entropy = Math.round(pwd.length * Math.log2(70));

        if (bar && label) {
            bar.className = 'pwd-strength-bar';
            if (score <= 2 || pwd.length < 10) {
                bar.classList.add('strength-weak');
                label.innerText = 'Faible';
                label.className = 'text-rose';
            } else if (score <= 4 || pwd.length < 14) {
                bar.classList.add('strength-medium');
                label.innerText = 'Moyen';
                label.className = 'text-amber';
            } else {
                bar.classList.add('strength-strong');
                label.innerText = 'Très Robuste';
                label.className = 'text-emerald';
            }
        }

        if (entropyEl) {
            entropyEl.innerText = `~${entropy} bits`;
        }
    }

    // Interactive VAT Calculator
    initCalculator() {
        const htInput = document.getElementById('calc-tva-ht');
        const ttcInput = document.getElementById('calc-tva-ttc');
        const rateSelect = document.getElementById('calc-tva-rate');

        if (!htInput || !ttcInput || !rateSelect) return;

        const recalcFromHT = () => {
            const ht = parseFloat(htInput.value) || 0;
            const rate = parseFloat(rateSelect.value) || 0;
            const tva = ht * rate;
            const ttc = ht + tva;

            ttcInput.value = ttc > 0 ? ttc.toFixed(2) : '';
            document.getElementById('calc-tva-val-display').innerText = tva.toFixed(2) + ' €';
            document.getElementById('calc-tva-rate-display').innerText = (rate * 100).toFixed(1) + ' %';
        };

        const recalcFromTTC = () => {
            const ttc = parseFloat(ttcInput.value) || 0;
            const rate = parseFloat(rateSelect.value) || 0;
            const ht = ttc / (1 + rate);
            const tva = ttc - ht;

            htInput.value = ht > 0 ? ht.toFixed(2) : '';
            document.getElementById('calc-tva-val-display').innerText = tva.toFixed(2) + ' €';
            document.getElementById('calc-tva-rate-display').innerText = (rate * 100).toFixed(1) + ' %';
        };

        htInput.addEventListener('input', recalcFromHT);
        rateSelect.addEventListener('change', recalcFromHT);
        ttcInput.addEventListener('input', recalcFromTTC);

        // Pre-fill
        htInput.value = '1000.00';
        recalcFromHT();
    }

    validateViesVat() {
        const input = document.getElementById('calc-vies-input')?.value.trim().toUpperCase() || '';
        const resBox = document.getElementById('vies-result-box');
        const badge = document.getElementById('vies-status-badge');
        const msg = document.getElementById('vies-message');

        if (!resBox || !badge || !msg) return;

        resBox.style.display = 'block';

        if (!input) {
            badge.className = 'badge badge-sortie';
            badge.innerText = 'Numéro Vide';
            msg.innerText = 'Veuillez saisir un numéro de TVA intracommunautaire (ex: LU30456108, IT12345678901).';
            return;
        }

        // Standard EU VAT Regex
        const vatRegex = {
            'LU': /^LU\d{8}$/,
            'IT': /^IT\d{11}$/,
            'FR': /^FR[A-Z0-9]{2}\d{9}$/,
            'DE': /^DE\d{9}$/,
            'BE': /^BE[01]\d{9}$/
        };

        const country = input.substring(0, 2);
        const isKnownCountry = vatRegex[country];

        if (isKnownCountry) {
            if (vatRegex[country].test(input)) {
                badge.className = 'badge badge-entree';
                badge.innerText = 'Format Valide (' + country + ')';
                msg.innerText = `Le format du numéro ${input} est parfaitement conforme aux règles fiscales de ${country}.`;
            } else {
                badge.className = 'badge badge-sortie';
                badge.innerText = 'Format Invalide (' + country + ')';
                msg.innerText = `Le format pour le pays ${country} ne correspond pas à la syntaxe légale attendue.`;
            }
        } else {
            if (/^[A-Z]{2}[A-Z0-9]{6,12}$/.test(input)) {
                badge.className = 'badge badge-ord';
                badge.innerText = 'Format Possible (' + country + ')';
                msg.innerText = `Syntaxe générique européenne valide pour le pays ${country}.`;
            } else {
                badge.className = 'badge badge-sortie';
                badge.innerText = 'Format Invalide';
                msg.innerText = 'Le format ne commence pas par un code pays à 2 lettres suivi de chiffres valides.';
            }
        }
    }

    // Helper formatting
    getCategoryIcon(cat) {
        switch (cat) {
            case 'banking':
                return { icon: 'fa-solid fa-building-columns', label: 'Banque', bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', border: 'rgba(59, 130, 246, 0.3)' };
            case 'gov':
                return { icon: 'fa-solid fa-landmark', label: 'Fiscalité / Gov', bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: 'rgba(16, 185, 129, 0.3)' };
            case 'corp':
                return { icon: 'fa-solid fa-building', label: 'Société', bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: 'rgba(245, 158, 11, 0.3)' };
            case 'email':
                return { icon: 'fa-solid fa-envelope', label: 'Messagerie / Cloud', bg: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: 'rgba(6, 182, 212, 0.3)' };
            case 'supplier':
                return { icon: 'fa-solid fa-truck-ramp-box', label: 'Fournisseur', bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
            default:
                return { icon: 'fa-solid fa-key', label: 'Autre', bg: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', border: 'var(--border-subtle)' };
        }
    }

    getStrengthBadge(pwd) {
        if (!pwd || pwd.length < 10) {
            return '<span class="badge badge-sortie" style="font-size: 0.65rem;">Faible</span>';
        } else if (pwd.length < 14) {
            return '<span class="badge badge-ext" style="font-size: 0.65rem;">Moyen</span>';
        } else {
            return '<span class="badge badge-entree" style="font-size: 0.65rem;">Sécurisé</span>';
        }
    }

    getRoleBadge(role) {
        switch (role) {
            case 'admin':
                return '<span class="badge badge-entree"><i class="fa-solid fa-crown"></i> Gérant / Admin</span>';
            case 'accountant':
                return '<span class="badge badge-ord"><i class="fa-solid fa-calculator"></i> Comptable / Fidu</span>';
            case 'viewer':
                return '<span class="badge" style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted);"><i class="fa-solid fa-eye"></i> Consultation</span>';
            default:
                return '<span class="badge badge-ext"><i class="fa-solid fa-user"></i> Collaborateur</span>';
        }
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

// Global initialization
let appStrumenti = null;
document.addEventListener('DOMContentLoaded', () => {
    appStrumenti = new StrumentiManager();
});
