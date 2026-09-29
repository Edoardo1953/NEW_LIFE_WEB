/**
 * NEW LIFE Sàrl - Sistema di Autenticazione e Gestione Visibilità Pagine (Permessi Occhio Verde/Rosso)
 */

const DEFAULT_AUTH_USERS = [
    {
        id: 'usr_1',
        name: 'TUBIA EDOARDO',
        username: 'tubia.edoardo@gmail.com',
        password: 'NL*Edoardo2026!Vault',
        role: 'Gérant / Administrateur',
        pin: 'LuxTrust Mobile'
    },
    {
        id: 'usr_2',
        name: 'CABINET FIDUCIAIRE (Comptable)',
        username: 'fidu.compta@luxfiduciaire.lu',
        password: 'Fidu*Lux2026#Compta',
        role: 'Comptable / Fiduciaire',
        pin: '2FA Email'
    }
];

const DEFAULT_PAGE_PERMISSIONS = {
    'index.html': true,
    'banca.html': true,
    'contabilita.html': true,
    'ammortamenti.html': true,
    'partecipazioni.html': true,
    'documenti.html': true,
    'strumenti.html': true
};

function getRegisteredUsers() {
    try {
        const saved = localStorage.getItem('new_life_simple_users_pwd');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.error('Error loading users:', e);
    }
    return [...DEFAULT_AUTH_USERS];
}

function getLoggedUser() {
    try {
        const session = sessionStorage.getItem('new_life_session') || localStorage.getItem('new_life_remembered_session');
        if (session) return JSON.parse(session);
    } catch (e) {
        console.error('Error checking session:', e);
    }
    return null;
}

function getPagePermissions() {
    try {
        const saved = localStorage.getItem('new_life_page_permissions');
        if (saved) {
            return { ...DEFAULT_PAGE_PERMISSIONS, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Error loading permissions:', e);
    }
    return { ...DEFAULT_PAGE_PERMISSIONS };
}

function savePagePermissions(perms) {
    try {
        localStorage.setItem('new_life_page_permissions', JSON.stringify(perms));
    } catch (e) {
        console.error('Error saving permissions:', e);
    }
}

function isUserAdmin(user) {
    if (!user) return false;
    const role = (user.role || '').toLowerCase();
    const name = (user.name || '').toLowerCase();
    return role.includes('gérant') || role.includes('admin') || name.includes('tubia');
}

function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
}

function checkAuthGate() {
    const currentPage = getCurrentPageName();
    const isLoginPage = currentPage === 'login.html';
    const loggedUser = getLoggedUser();

    if (!loggedUser) {
        if (!isLoginPage) {
            window.location.replace('login.html');
        }
        return;
    }

    if (isLoginPage) {
        window.location.replace('index.html');
        return;
    }

    // Check page permission for non-admin users
    const perms = getPagePermissions();
    const isAdmin = isUserAdmin(loggedUser);

    if (!isAdmin && perms[currentPage] === false) {
        alert('Accesso a questa pagina non autorizzato dall\'amministratore.');
        window.location.replace('index.html');
        return;
    }

    renderSidebar(loggedUser);
}

function loginUser(usernameInput, passwordInput, rememberMe = false) {
    const users = getRegisteredUsers();
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPwd = passwordInput.trim();

    const matched = users.find(u => {
        const uLogin = (u.username || '').trim().toLowerCase();
        const uName = (u.name || '').trim().toLowerCase();
        const uPwd = (u.password || '').trim();
        return (uLogin === cleanUser || uName === cleanUser) && uPwd === cleanPwd;
    });

    if (matched) {
        const sessionData = {
            id: matched.id,
            name: matched.name,
            username: matched.username,
            role: matched.role,
            loginTime: new Date().toISOString()
        };

        sessionStorage.setItem('new_life_session', JSON.stringify(sessionData));
        if (rememberMe) {
            localStorage.setItem('new_life_remembered_session', JSON.stringify(sessionData));
        } else {
            localStorage.removeItem('new_life_remembered_session');
        }
        return { success: true, user: matched };
    }

    return { success: false, message: 'Identifiant ou mot de passe incorrect.' };
}

function logoutApp() {
    sessionStorage.removeItem('new_life_session');
    localStorage.removeItem('new_life_remembered_session');
    window.location.replace('login.html');
}

function renderSidebar(user) {
    document.addEventListener('DOMContentLoaded', () => {
        setupMenuEyeToggles(user);
        setupSidebarUserProfile(user);
    });
}

function setupMenuEyeToggles(user) {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    const isAdmin = isUserAdmin(user);
    const permissions = getPagePermissions();

    const navLinks = navMenu.querySelectorAll('a.nav-item');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const page = href.split('/').pop().split('?')[0];

        const isAllowed = permissions[page] !== false;

        // If regular user and page is disabled (Red eye), HIDE completely from menu
        if (!isAdmin) {
            if (!isAllowed) {
                link.style.display = 'none';
            }
            return;
        }

        // If ADMIN: Add Eye toggle button (Green = Visible / Red = Hidden)
        const container = document.createElement('div');
        container.className = 'nav-item-container';

        link.parentNode.insertBefore(container, link);
        container.appendChild(link);

        if (!isAllowed) {
            link.classList.add('nav-item-disabled');
        }

        const eyeBtn = document.createElement('button');
        eyeBtn.className = 'nav-eye-toggle-btn';
        eyeBtn.title = isAllowed ? '🟢 Pagina Visibile (Clicca per nascondere agli utenti)' : '🔴 Pagina Nascosta (Clicca per renderla visibile)';
        eyeBtn.innerHTML = isAllowed 
            ? '<i class="fa-solid fa-eye nav-eye-active"></i>' 
            : '<i class="fa-solid fa-eye-slash nav-eye-hidden"></i>';

        eyeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentPerms = getPagePermissions();
            const newStatus = !(currentPerms[page] !== false);
            currentPerms[page] = newStatus;
            savePagePermissions(currentPerms);

            if (newStatus) {
                eyeBtn.innerHTML = '<i class="fa-solid fa-eye nav-eye-active"></i>';
                eyeBtn.title = '🟢 Pagina Visibile (Clicca per nascondere agli utenti)';
                link.classList.remove('nav-item-disabled');
                showAuthToast(`🟢 ${link.innerText.trim()}: Visibile agli utenti`);
            } else {
                eyeBtn.innerHTML = '<i class="fa-solid fa-eye-slash nav-eye-hidden"></i>';
                eyeBtn.title = '🔴 Pagina Nascosta (Clicca per renderla visibile)';
                link.classList.add('nav-item-disabled');
                showAuthToast(`🔴 ${link.innerText.trim()}: Nascosta dal menu per gli utenti`);
            }
        });

        container.appendChild(eyeBtn);
    });
}

function setupSidebarUserProfile(user) {
    const footer = document.querySelector('.sidebar-footer');
    if (!footer) return;

    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const userBox = document.createElement('div');
    userBox.className = 'sidebar-auth-profile glass-panel';
    userBox.style.cssText = `
        margin-top: 0.85rem;
        padding: 0.65rem 0.85rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid var(--border-subtle);
    `;

    userBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.65rem; overflow: hidden;">
            <div class="user-card-avatar" style="width: 32px; height: 32px; font-size: 0.85rem; flex-shrink: 0;">${initials}</div>
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <div style="font-weight: 700; font-size: 0.82rem; color: var(--text-main); overflow: hidden; text-overflow: ellipsis;">${user.name}</div>
                <div style="font-size: 0.68rem; color: var(--accent-emerald); font-weight: 600;">${user.role || 'Connecté'}</div>
            </div>
        </div>
        <button onclick="logoutApp()" title="Se déconnecter / Esci" style="background: none; border: none; color: var(--accent-rose); cursor: pointer; padding: 0.3rem 0.5rem; font-size: 0.95rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
            <i class="fa-solid fa-right-from-bracket"></i>
        </button>
    `;

    footer.appendChild(userBox);
}

function showAuthToast(msg) {
    let toast = document.getElementById('toast-notify');
    let text = document.getElementById('toast-text');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notify';
        toast.className = 'toast-toast';
        toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span id="toast-text">${msg}</span>`;
        document.body.appendChild(toast);
    } else {
        if (text) text.innerText = msg;
    }

    toast.classList.add('show');
    clearTimeout(window.authToastTimeout);
    window.authToastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Immediate execution gate before DOM rendering
checkAuthGate();
