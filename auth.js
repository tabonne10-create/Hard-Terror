// ============================================================
// MODULE D'AUTHENTIFICATION & SÉCURITÉ BIDÈ (auth.js)
// ============================================================

const DEFAULT_USERS = [
    {
        id: 'usr-admin-1',
        username: 'admin',
        password: 'admin123',
        fullName: 'Directeur Général',
        role: 'admin',
        badge: 'Administrateur',
        icon: 'bi-shield-lock-fill',
        avatarColor: '#0284c7'
    },
    {
        id: 'usr-caisse-1',
        username: 'caisse',
        password: 'caisse123',
        fullName: 'Opérateur Caisse Principal',
        role: 'caisse',
        badge: 'Caissier',
        icon: 'bi-person-check-fill',
        avatarColor: '#10b981'
    }
];

// Initialisation de la base utilisateurs si vide
(function initUsers() {
    try {
        if (!localStorage.getItem('bide_users')) {
            localStorage.setItem('bide_users', JSON.stringify(DEFAULT_USERS));
        }
    } catch (e) {
        console.error('Erreur initUsers :', e);
    }
})();

// Récupérer la liste des utilisateurs
function getUsers() {
    try {
        const stored = localStorage.getItem('bide_users');
        return stored ? JSON.parse(stored) : DEFAULT_USERS;
    } catch (e) {
        return DEFAULT_USERS;
    }
}

// Récupérer l'utilisateur actuellement connecté
function getCurrentUser() {
    try {
        const sessionUser = sessionStorage.getItem('bide_current_user') || localStorage.getItem('bide_current_user');
        return sessionUser ? JSON.parse(sessionUser) : null;
    } catch (e) {
        return null;
    }
}

// Vérifier si un utilisateur est connecté
function isAuthenticated() {
    return getCurrentUser() !== null;
}

// Connexion
function login(username, password) {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
        return { success: false, message: 'Veuillez renseigner votre identifiant et votre mot de passe.' };
    }

    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);

    if (!user) {
        return { success: false, message: 'Identifiant ou mot de passe incorrect.' };
    }

    const sessionData = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        badge: user.badge,
        icon: user.icon,
        loginTime: new Date().toISOString()
    };

    // Stocker dans sessionStorage et localStorage
    sessionStorage.setItem('bide_current_user', JSON.stringify(sessionData));
    localStorage.setItem('bide_current_user', JSON.stringify(sessionData));

    // Déterminer la page de redirection
    const redirectUrl = user.role === 'admin' ? 'admin.html' : 'caisse.html';

    return {
        success: true,
        message: `Bienvenue ${user.fullName} !`,
        user: sessionData,
        redirectUrl: redirectUrl
    };
}

// Déconnexion
function logout() {
    sessionStorage.removeItem('bide_current_user');
    localStorage.removeItem('bide_current_user');
    window.location.href = 'login.html?logout=true';
}

// Garde d'authentification pour protéger les pages
function checkPageAccess(requiredRole) {
    const user = getCurrentUser();

    // 1. Non connecté
    if (!user) {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}&error=unauthorized`;
        return false;
    }

    // 2. Vérification des permissions de rôle
    if (requiredRole === 'admin' && user.role !== 'admin') {
        alert('Accès refusé : Cette page est strictement réservée aux administrateurs.');
        window.location.href = 'caisse.html';
        return false;
    }

    // Mise à jour visuelle des éléments utilisateur dans la navbar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupUserNavbarUI(user);
        });
    } else {
        setupUserNavbarUI(user);
    }

    return true;
}

// Remplissage automatique de l'interface utilisateur dans la barre de navigation
function setupUserNavbarUI(user) {
    if (!user) return;

    // Nom d'utilisateur dans la navbar
    const userNameElements = document.querySelectorAll('.auth-user-name, #currentUserName, #currentCashierName');
    userNameElements.forEach(el => {
        el.textContent = user.fullName || user.username;
    });

    // Badge de rôle dans la navbar
    const userBadgeElements = document.querySelectorAll('.auth-user-badge');
    userBadgeElements.forEach(el => {
        el.textContent = user.badge || (user.role === 'admin' ? 'Administrateur' : 'Caissier');
    });

    // Bouton de déconnexion
    const logoutBtns = document.querySelectorAll('.btn-logout, #logoutBtn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                logout();
            }
        });
    });
}
