// ============================================================
// MODULE D'AUTHENTIFICATION & SÉCURITÉ BIDÈ (auth.js)
// ============================================================
// Ce module gère l'authentification, la session utilisateur,
// le contrôle d'accès par rôle et le changement de mot de passe.
// Rôles supportés: admin, caisse, gestionnaire, laveur
// ============================================================

// ============================================================
// UTILISATEURS PAR DÉFAUT (Synchronisés avec le système)
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
    },
    {
        id: 'usr-gest-1',
        username: 'gestionnaire',
        password: 'gestion123',
        fullName: 'WIN_NER STACK',
        role: 'gestionnaire',
        badge: 'Gestionnaire',
        icon: 'bi-clipboard2-data-fill',
        avatarColor: '#8b5cf6'
    },
    {
        id: 'usr-lav-1',
        username: 'laveur',
        password: 'laveur123',
        fullName: 'Marc KOFFI',
        role: 'laveur',
        badge: 'Agent Laveur',
        icon: 'bi-droplet-fill',
        avatarColor: '#f59e0b'
    }
];

// ============================================================
// INITIALISATION DE LA BASE UTILISATEURS
// ============================================================

(function initUsers() {
    try {
        // Initialiser les utilisateurs par défaut si le stockage est vide
        if (!localStorage.getItem('bide_users')) {
            localStorage.setItem('bide_users', JSON.stringify(DEFAULT_USERS));
        } else {
            // Synchroniser : ajouter les nouveaux rôles s'ils manquent
            const stored = JSON.parse(localStorage.getItem('bide_users'));
            const storedUsernames = stored.map(u => u.username);
            let updated = false;

            DEFAULT_USERS.forEach(defaultUser => {
                if (!storedUsernames.includes(defaultUser.username)) {
                    stored.push(defaultUser);
                    updated = true;
                }
            });

            if (updated) {
                localStorage.setItem('bide_users', JSON.stringify(stored));
            }
        }
    } catch (e) {
        console.error('Erreur initUsers :', e);
    }
})();

// ============================================================
// RÉCUPÉRATION DES UTILISATEURS
// ============================================================

/**
 * Récupère la liste complète des utilisateurs depuis le stockage local.
 * @returns {Array} Liste des utilisateurs
 */
function getUsers() {
    try {
        const stored = localStorage.getItem('bide_users');
        return stored ? JSON.parse(stored) : DEFAULT_USERS;
    } catch (e) {
        return DEFAULT_USERS;
    }
}

/**
 * Récupère l'utilisateur actuellement connecté depuis la session.
 * @returns {Object|null} Données de l'utilisateur connecté ou null
 */
function getCurrentUser() {
    try {
        const sessionUser = sessionStorage.getItem('bide_current_user') || localStorage.getItem('bide_current_user');
        return sessionUser ? JSON.parse(sessionUser) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Vérifie si un utilisateur est actuellement authentifié.
 * @returns {boolean} True si connecté
 */
function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Construit un chemin vers une page de l'application depuis la racine.
 * Les portails gestionnaire et laveur vivent dans des sous-dossiers.
 * @param {string} path - Chemin de destination depuis la racine
 * @returns {string} Chemin utilisable depuis la page courante
 */
function getAppPath(path) {
    const currentPath = window.location.pathname.replace(/\\/g, '/');
    const isNestedPortal = /\/(gestionnaire|laveur)\//.test(currentPath);
    return isNestedPortal ? `../${path}` : path;
}

function applyBrandName() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) textNodes.push(node);
    textNodes.forEach(textNode => {
        textNode.nodeValue = textNode.nodeValue.replace(/LAVAGE BIDE/g, 'LAVAGE BIDÈ');
    });

    document.querySelectorAll('[alt], [title]').forEach(element => {
        if (element.hasAttribute('alt')) element.alt = element.alt.replace(/LAVAGE BIDE/g, 'LAVAGE BIDÈ');
        if (element.hasAttribute('title')) element.title = element.title.replace(/LAVAGE BIDE/g, 'LAVAGE BIDÈ');
    });

    document.title = document.title.replace(/LAVAGE BIDE/g, 'LAVAGE BIDÈ');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBrandName);
} else {
    applyBrandName();
}

// ============================================================
// CONNEXION
// ============================================================

/**
 * Authentifie un utilisateur avec identifiant et mot de passe.
 * @param {string} username - Identifiant de l'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Object} Résultat avec success, message, user, redirectUrl
 */
function login(username, password) {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Validation des champs requis
    if (!cleanUsername || !cleanPassword) {
        return { success: false, message: 'Veuillez renseigner votre identifiant et votre mot de passe.' };
    }

    // Recherche de l'utilisateur dans la base
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);

    if (!user) {
        return { success: false, message: 'Identifiant ou mot de passe incorrect.' };
    }

    // Création de la session
    const sessionData = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        badge: user.badge,
        icon: user.icon,
        loginTime: new Date().toISOString()
    };

    // Stocker dans sessionStorage et localStorage (double stockage pour compatibilité)
    sessionStorage.setItem('bide_current_user', JSON.stringify(sessionData));
    localStorage.setItem('bide_current_user', JSON.stringify(sessionData));

    // Déterminer la page de redirection selon le rôle
    const redirectUrl = getRedirectUrl(user.role);

    return {
        success: true,
        message: `Bienvenue ${user.fullName} !`,
        user: sessionData,
        redirectUrl: redirectUrl
    };
}

// ============================================================
// DÉCONNEXION
// ============================================================

/**
 * Déconnecte l'utilisateur et redirige vers la page de connexion.
 */
function logout() {
    sessionStorage.removeItem('bide_current_user');
    localStorage.removeItem('bide_current_user');
    window.location.href = getAppPath('login.html?logout=true');
}

// ============================================================
// REDIRECTION PAR RÔLE
// ============================================================

/**
 * Retourne l'URL de redirection appropriée selon le rôle de l'utilisateur.
 * @param {string} role - Rôle de l'utilisateur (admin, caisse, gestionnaire, laveur)
 * @returns {string} URL de destination
 */
function getRedirectUrl(role) {
    let path;

    switch (role) {
        case 'admin':
            path = 'admin.html';
            break;
        case 'caisse':
            path = 'caisse.html';
            break;
        case 'gestionnaire':
            path = 'gestionnaire/dashboard.html';
            break;
        case 'laveur':
            path = 'laveur/dashboard.html';
            break;
        default:
            path = 'login.html';
    }

    return getAppPath(path);
}

// ============================================================
// GARDE D'ACCÈS (PROTECTION DES PAGES)
// ============================================================

/**
 * Protège une page en vérifiant que l'utilisateur est connecté
 * et possède le bon rôle. Redirige vers login.html si accès non autorisé.
 * @param {string} requiredRole - Rôle requis pour accéder à la page
 * @returns {boolean} True si l'accès est autorisé
 */
function checkPageAccess(requiredRole) {
    const user = getCurrentUser();

    // 1. Utilisateur non connecté → redirection vers login
    if (!user) {
        const currentPath = window.location.pathname.split('/').filter(Boolean).slice(-2).join('/') || 'index.html';
        window.location.href = getAppPath(`login.html?redirect=${encodeURIComponent(currentPath)}&error=unauthorized`);
        return false;
    }

    // 2. Vérification des permissions de rôle
    // L'admin a accès à toutes les pages sauf celles spécifiques aux autres rôles
    if (user.role === 'admin') {
        // L'admin peut accéder à tout, sauf les pages strictement laveur
        if (requiredRole === 'laveur') {
            alert('Accès refusé : Cette page est réservée aux agents laveurs.');
            window.location.href = getAppPath('admin.html');
            return false;
        }
    } else if (user.role !== requiredRole) {
        // Cas spécial : le caissier peut accéder aux pages admin en lecture
        if (user.role === 'caisse' && requiredRole === 'admin') {
            alert('Accès refusé : Cette page est réservée aux administrateurs.');
            window.location.href = getAppPath('caisse.html');
            return false;
        }
        // Si le rôle ne correspond pas, rediriger vers sa page par défaut
        alert(`Accès refusé : Vous n'avez pas les droits pour cette page.`);
        window.location.href = getRedirectUrl(user.role);
        return false;
    }

    // 3. Mise à jour visuelle des éléments utilisateur dans la navbar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupUserNavbarUI(user);
        });
    } else {
        setupUserNavbarUI(user);
    }

    return true;
}

// ============================================================
// MISE À JOUR VISUELLE DE L'INTERFACE UTILISATEUR
// ============================================================

/**
 * Met à jour les éléments de l'interface (nom, badge, bouton déconnexion)
 * dans la barre de navigation avec les données de l'utilisateur connecté.
 * @param {Object} user - Données de l'utilisateur connecté
 */
function setupUserNavbarUI(user) {
    if (!user) return;

    // Nom d'utilisateur dans la navbar
    const userNameElements = document.querySelectorAll('.auth-user-name, #currentUserName, #currentCashierName, #currentWorkerName, #currentManagerName');
    userNameElements.forEach(el => {
        el.textContent = user.fullName || user.username;
    });

    // Badge de rôle dans la navbar
    const userBadgeElements = document.querySelectorAll('.auth-user-badge');
    userBadgeElements.forEach(el => {
        el.textContent = user.badge || getRoleLabel(user.role);
    });

    // Boutons de déconnexion
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

// ============================================================
// CHANGEMENT DE MOT DE PASSE
// ============================================================

/**
 * Change le mot de passe de l'utilisateur connecté.
 * @param {string} currentPassword - Mot de passe actuel
 * @param {string} newPassword - Nouveau mot de passe
 * @param {string} confirmPassword - Confirmation du nouveau mot de passe
 * @returns {Object} Résultat avec success et message
 */
function changePassword(currentPassword, newPassword, confirmPassword) {
    const user = getCurrentUser();

    if (!user) {
        return { success: false, message: 'Utilisateur non connecté.' };
    }

    // Validation des champs
    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, message: 'Veuillez remplir tous les champs.' };
    }

    if (newPassword.length < 6) {
        return { success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, message: 'Les mots de passe ne correspondent pas.' };
    }

    if (currentPassword === newPassword) {
        return { success: false, message: 'Le nouveau mot de passe doit être différent de l\'actuel.' };
    }

    // Vérifier le mot de passe actuel et mettre à jour
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());

    if (userIndex === -1) {
        return { success: false, message: 'Utilisateur introuvable dans le système.' };
    }

    if (users[userIndex].password !== currentPassword) {
        return { success: false, message: 'Le mot de passe actuel est incorrect.' };
    }

    // Mise à jour du mot de passe
    users[userIndex].password = newPassword;
    localStorage.setItem('bide_users', JSON.stringify(users));

    return { success: true, message: 'Mot de passe modifié avec succès !' };
}

// ============================================================
// UTILITAIRES DE RÔLES
// ============================================================

/**
 * Retourne le libellé du rôle pour l'affichage.
 * @param {string} role - Code du rôle
 * @returns {string} Libellé du rôle
 */
function getRoleLabel(role) {
    switch (role) {
        case 'admin': return 'Administrateur';
        case 'caisse': return 'Caissier';
        case 'gestionnaire': return 'Gestionnaire';
        case 'laveur': return 'Agent Laveur';
        default: return 'Utilisateur';
    }
}

/**
 * Retourne l'icône Bootstrap Icons associée au rôle.
 * @param {string} role - Code du rôle
 * @returns {string} Classe CSS de l'icône
 */
function getRoleIcon(role) {
    switch (role) {
        case 'admin': return 'bi-shield-lock-fill';
        case 'caisse': return 'bi-person-check-fill';
        case 'gestionnaire': return 'bi-clipboard2-data-fill';
        case 'laveur': return 'bi-droplet-fill';
        default: return 'bi-person-fill';
    }
}

/**
 * Retourne la couleur associée au rôle.
 * @param {string} role - Code du rôle
 * @returns {string} Code couleur hexadécimal
 */
function getRoleColor(role) {
    switch (role) {
        case 'admin': return '#0284c7';
        case 'caisse': return '#10b981';
        case 'gestionnaire': return '#8b5cf6';
        case 'laveur': return '#f59e0b';
        default: return '#64748b';
    }
}
