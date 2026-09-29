/**
 * NEW LIFE Sàrl - Sistema di Autenticazione e Protezione Accessi
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

function checkAuthGate() {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const loggedUser = getLoggedUser();

    if (!loggedUser) {
        if (!isLoginPage) {
            window.location.replace('login.html');
        }
    } else {
        if (isLoginPage) {
            window.location.replace('index.html');
        } else {
            renderSidebarUser(loggedUser);
        }
    }
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

function renderSidebarUser(user) {
    document.addEventListener('DOMContentLoaded', () => {
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
    });
}

// Immediate execution gate before DOM rendering
checkAuthGate();
