// ==========================================
// CONSTANTES & STOCKAGE LOCALSTORAGE
// ==========================================
const STORAGE_COMMANDES = 'bide_commandes';
const STORAGE_LAVEURS = 'bide_laveurs';
const STORAGE_USERS = 'bide_users';
const STORAGE_PROFIL = 'bide_profil';
const STORAGE_PROFIL_LAVEUR = 'bide_profil_laveur';

// Initialisation des données par défaut dans le LocalStorage
(function initStorage() {
    if (!localStorage.getItem(STORAGE_COMMANDES)) {
        const exemplesCommandes = [
            { ticket: 'TICK-101', plaque: 'TG-1234-AB', engin: 'Berline', formule: 'Complet', heure: '08:30', statut: 'En cours' },
            { ticket: 'TICK-102', plaque: 'TG-5678-CD', engin: 'SUV/4x4', formule: 'Premium', heure: '09:15', statut: 'En attente' },
            { ticket: 'TICK-103', plaque: 'TG-9012-EF', engin: 'Citadine', formule: 'Express', heure: '09:40', statut: 'Lavé' }
        ];
        localStorage.setItem(STORAGE_COMMANDES, JSON.stringify(exemplesCommandes));
    }

    if (!localStorage.getItem(STORAGE_LAVEURS)) {
        const exemplesLaveurs = [
            { id: 1, nom: 'Marc Koffi', piste: 'Piste A (Auto)', statut: 'Actif' },
            { id: 2, nom: 'Jean Amégavi', piste: 'Piste B (Auto)', statut: 'Actif' }
        ];
        localStorage.setItem(STORAGE_LAVEURS, JSON.stringify(exemplesLaveurs));
    }

    if (!localStorage.getItem(STORAGE_USERS)) {
        const exemplesUsers = [
            { id: 1, nom: 'WIN_NER STACK', username: 'winner_admin', role: 'Gestionnaire', statut: 'Actif' },
            { id: 2, nom: 'Marc Koffi', username: 'marc_laveur', role: 'Laveur', statut: 'Actif' }
        ];
        localStorage.setItem(STORAGE_USERS, JSON.stringify(exemplesUsers));
    }

    if (!localStorage.getItem(STORAGE_PROFIL)) {
        const profilDefaut = {
            nom: 'WIN_NER STACK',
            role: 'Gestionnaire & Responsable UX/UI',
            username: 'winner_admin'
        };
        localStorage.setItem(STORAGE_PROFIL, JSON.stringify(profilDefaut));
    }

    if (!localStorage.getItem(STORAGE_PROFIL_LAVEUR)) {
        const defaultLaveur = {
            nom: 'Marc KOFFI',
            piste: 'Piste A (Auto)'
        };
        localStorage.setItem(STORAGE_PROFIL_LAVEUR, JSON.stringify(defaultLaveur));
    }
})();

// ==========================================
// SECTION GESTIONNAIRE
// ==========================================

// 1. DASHBOARD & SAISIE EXPRESS
const formExpress = document.getElementById('form-express');
if (formExpress) {
    formExpress.addEventListener('submit', function (e) {
        e.preventDefault();

        const plaque = document.getElementById('plaque').value.trim().toUpperCase();
        const typeEngin = document.getElementById('typeEngin').value;
        const formule = document.getElementById('formule').value;
        const ticketNum = 'TICK-' + Math.floor(1000 + Math.random() * 9000);
        const heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const nouvelleCommande = {
            ticket: ticketNum,
            plaque: plaque,
            engin: typeEngin,
            formule: formule,
            heure: heure,
            statut: 'En attente'
        };

        let commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];
        commandes.unshift(nouvelleCommande);
        localStorage.setItem(STORAGE_COMMANDES, JSON.stringify(commandes));

        // Génération du QR Code
        const qrContainer = document.getElementById('qrcode-container');
        if (qrContainer) {
            qrContainer.innerHTML = '';
            if (window.QRCode) {
                new QRCode(qrContainer, {
                    text: ticketNum,
                    width: 128,
                    height: 128
                });
            }
        }

        // Aperçu du ticket
        const ticketInfo = document.getElementById('ticket-info');
        if (ticketInfo) {
            ticketInfo.innerHTML = `
                <h4 class="text-info mt-2">${ticketNum}</h4>
                <p class="mb-1"><strong>Plaque :</strong> ${plaque}</p>
                <p class="mb-1"><strong>Engin :</strong> ${typeEngin}</p>
                <p class="mb-1"><strong>Formule :</strong> ${formule}</p>
                <p class="text-muted small">Heure : ${heure}</p>
            `;
        }

        formExpress.reset();
    });
}

// 2. REGISTRE DES COMMANDES
function afficherRegistreCommandes() {
    const tbody = document.getElementById('table-commandes-body');
    if (!tbody) return;

    const commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];
    tbody.innerHTML = '';

    if (commandes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Aucune commande enregistrée.</td></tr>';
        return;
    }

    commandes.forEach((cmd, index) => {
        let badgeColor = 'bg-secondary';
        if (cmd.statut === 'En attente') badgeColor = 'bg-warning text-dark';
        if (cmd.statut === 'En cours') badgeColor = 'bg-info text-dark';
        if (cmd.statut === 'Lavé') badgeColor = 'bg-success';
        if (cmd.statut === 'Payé') badgeColor = 'bg-primary';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold text-info">${cmd.ticket}</td>
                <td>${cmd.plaque}</td>
                <td>${cmd.engin}</td>
                <td>${cmd.formule}</td>
                <td>${cmd.heure}</td>
                <td><span class="badge ${badgeColor}">${cmd.statut}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerCommande(${index})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

function filtrerCommandes() {
    const searchInput = document.getElementById('search-plaque');
    const filterInput = document.getElementById('filter-statut');
    const tbody = document.getElementById('table-commandes-body');
    if (!tbody || !searchInput || !filterInput) return;

    const searchVal = searchInput.value.toLowerCase();
    const filterStatut = filterInput.value;
    const commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];

    tbody.innerHTML = '';

    commandes.filter(cmd => {
        const matchSearch = cmd.plaque.toLowerCase().includes(searchVal) || cmd.ticket.toLowerCase().includes(searchVal);
        const matchStatut = (filterStatut === 'TOUS') || (cmd.statut === filterStatut);
        return matchSearch && matchStatut;
    }).forEach((cmd, index) => {
        let badgeColor = 'bg-secondary';
        if (cmd.statut === 'En attente') badgeColor = 'bg-warning text-dark';
        if (cmd.statut === 'En cours') badgeColor = 'bg-info text-dark';
        if (cmd.statut === 'Lavé') badgeColor = 'bg-success';
        if (cmd.statut === 'Payé') badgeColor = 'bg-primary';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold text-info">${cmd.ticket}</td>
                <td>${cmd.plaque}</td>
                <td>${cmd.engin}</td>
                <td>${cmd.formule}</td>
                <td>${cmd.heure}</td>
                <td><span class="badge ${badgeColor}">${cmd.statut}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerCommande(${index})">Supprimer</button>
                </td>
            </tr>
        `;
    });
}

function supprimerCommande(index) {
    let commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];
    commandes.splice(index, 1);
    localStorage.setItem(STORAGE_COMMANDES, JSON.stringify(commandes));
    afficherRegistreCommandes();
}

// 3. GESTION DES LAVEURS
function afficherLaveurs() {
    const container = document.getElementById('container-laveurs');
    if (!container) return;

    const laveurs = JSON.parse(localStorage.getItem(STORAGE_LAVEURS)) || [];
    container.innerHTML = '';

    laveurs.forEach((lav, index) => {
        container.innerHTML += `
            <div class="col-md-4">
                <div class="card card-bide-neon p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="text-info mb-0">${lav.nom}</h5>
                        <span class="badge bg-success">${lav.statut}</span>
                    </div>
                    <p class="text-muted small mb-3">Zone : ${lav.piste}</p>
                    <button class="btn btn-sm btn-outline-danger w-100" onclick="supprimerLaveur(${index})">Retirer</button>
                </div>
            </div>
        `;
    });
}

const formLaveur = document.getElementById('form-laveur');
if (formLaveur) {
    formLaveur.addEventListener('submit', function (e) {
        e.preventDefault();
        const nom = document.getElementById('laveur-nom').value.trim();
        const piste = document.getElementById('laveur-piste').value;

        let laveurs = JSON.parse(localStorage.getItem(STORAGE_LAVEURS)) || [];
        laveurs.push({ id: Date.now(), nom: nom, piste: piste, statut: 'Actif' });
        localStorage.setItem(STORAGE_LAVEURS, JSON.stringify(laveurs));

        formLaveur.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalLaveur'));
        if (modal) modal.hide();
        afficherLaveurs();
    });
}

function supprimerLaveur(index) {
    let laveurs = JSON.parse(localStorage.getItem(STORAGE_LAVEURS)) || [];
    laveurs.splice(index, 1);
    localStorage.setItem(STORAGE_LAVEURS, JSON.stringify(laveurs));
    afficherLaveurs();
}

// 4. RAPPORTS
function genererRapports() {
    const kpiTotal = document.getElementById('kpi-total-commandes');
    if (!kpiTotal) return;

    const commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];

    kpiTotal.innerText = commandes.length;
    document.getElementById('kpi-total-laves').innerText = commandes.filter(c => c.statut === 'Lavé' || c.statut === 'Payé').length;
    document.getElementById('kpi-en-cours').innerText = commandes.filter(c => c.statut === 'En attente' || c.statut === 'En cours').length;

    const repartition = {};
    commandes.forEach(c => {
        repartition[c.engin] = (repartition[c.engin] || 0) + 1;
    });

    const tbody = document.getElementById('table-rapports-body');
    if (tbody) {
        tbody.innerHTML = '';
        for (const [engin, count] of Object.entries(repartition)) {
            tbody.innerHTML += `<tr><td>${engin}</td><td class="text-end fw-bold text-info">${count}</td></tr>`;
        }
    }
}

// 5. GESTION DES UTILISATEURS
function afficherUtilisateurs() {
    const tbody = document.getElementById('table-users-body');
    if (!tbody) return;

    const users = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
    tbody.innerHTML = '';

    users.forEach((u, index) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${u.nom}</strong></td>
                <td><span class="badge bg-primary">${u.role}</span></td>
                <td class="text-muted">${u.username}</td>
                <td><span class="badge bg-success">${u.statut}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="supprimerUser(${index})">Désactiver</button>
                </td>
            </tr>
        `;
    });
}

const formUser = document.getElementById('form-user');
if (formUser) {
    formUser.addEventListener('submit', function (e) {
        e.preventDefault();
        const nom = document.getElementById('user-nom').value.trim();
        const username = document.getElementById('user-username').value.trim();
        const role = document.getElementById('user-role').value;

        let users = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
        users.push({ id: Date.now(), nom: nom, username: username, role: role, statut: 'Actif' });
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

        formUser.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalUser'));
        if (modal) modal.hide();
        afficherUtilisateurs();
    });
}

function supprimerUser(index) {
    let users = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
    users.splice(index, 1);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    afficherUtilisateurs();
}

// 6. PROFIL GESTIONNAIRE
function chargerProfil() {
    const form = document.getElementById('form-profil');
    if (!form) return;

    const profil = JSON.parse(localStorage.getItem(STORAGE_PROFIL));
    if (profil) {
        document.getElementById('profil-nom').value = profil.nom;
        document.getElementById('profil-role').value = profil.role;
        document.getElementById('profil-username').value = profil.username;
        
        const cardName = document.getElementById('profile-card-name');
        if (cardName) cardName.innerText = profil.nom;
    }
}

const formProfil = document.getElementById('form-profil');
if (formProfil) {
    formProfil.addEventListener('submit', function (e) {
        e.preventDefault();
        const nom = document.getElementById('profil-nom').value.trim();
        const username = document.getElementById('profil-username').value.trim();

        let profil = JSON.parse(localStorage.getItem(STORAGE_PROFIL)) || {};
        profil.nom = nom;
        profil.username = username;

        localStorage.setItem(STORAGE_PROFIL, JSON.stringify(profil));
        
        const cardName = document.getElementById('profile-card-name');
        if (cardName) cardName.innerText = nom;

        alert('Profil mis à jour avec succès !');
    });
}

// ==========================================
// SECTION LAVEUR
// ==========================================

// 1. FILE D'ATTENTE EN PISTE
function chargerPisteLaveur() {
    const container = document.getElementById('piste-container');
    if (!container) return;

    const commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];
    const commandesEnPiste = commandes.filter(cmd => cmd.statut !== 'Payé');

    container.innerHTML = '';

    if (commandesEnPiste.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5">Aucun véhicule en attente sur la piste.</p>
            </div>`;
        return;
    }

    commandesEnPiste.forEach((cmd) => {
        let borderClass = 'border-secondary';
        let badgeClass = 'bg-secondary';

        if (cmd.statut === 'En attente') {
            borderClass = 'border-warning';
            badgeClass = 'bg-warning text-dark';
        } else if (cmd.statut === 'En cours') {
            borderClass = 'border-info';
            badgeClass = 'bg-info text-dark';
        } else if (cmd.statut === 'Lavé') {
            borderClass = 'border-success';
            badgeClass = 'bg-success';
        }

        container.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card card-bide-neon border-start border-4 ${borderClass} p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold text-info">${cmd.ticket}</span>
                        <span class="badge ${badgeClass}">${cmd.statut}</span>
                    </div>
                    <h4 class="text-white mb-1">${cmd.plaque}</h4>
                    <p class="text-muted small mb-2">${cmd.engin} — <strong>${cmd.formule}</strong></p>
                    <p class="text-muted small mb-3">Heure : ${cmd.heure}</p>

                    <div class="d-flex gap-2 mb-2">
                        <button class="btn btn-sm btn-outline-warning w-50" onclick="changerStatutLavage('${cmd.ticket}', 'En cours')">En cours</button>
                        <button class="btn btn-sm btn-outline-success w-50" onclick="changerStatutLavage('${cmd.ticket}', 'Lavé')">Terminé</button>
                    </div>
                    <a href="details-commande.html?ticket=${cmd.ticket}" class="btn btn-sm btn-info w-100">Voir Détails</a>
                </div>
            </div>
        `;
    });
}

function changerStatutLavage(ticketNum, nouveauStatut) {
    let commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];
    const index = commandes.findIndex(c => c.ticket === ticketNum);

    if (index !== -1) {
        // 1. Sauvegarde du nouveau statut
        commandes[index].statut = nouveauStatut;
        localStorage.setItem(STORAGE_COMMANDES, JSON.stringify(commandes));

        // 2. Recharge automatique de l'élément à l'écran
        if (document.getElementById('piste-container')) {
            chargerPisteLaveur();
        }
        if (document.getElementById('details-container')) {
            chargerDetailsCommande();
        }
        if (document.getElementById('table-laveur-commandes-body')) {
            afficherCommandesLaveur();
        }
        if (document.getElementById('table-commandes-body')) {
            afficherRegistreCommandes();
        }
    }
}

// 2. HISTORIQUE DE LAVAGE
function afficherCommandesLaveur() {
    const tbody = document.getElementById('table-laveur-commandes-body');
    if (!tbody) return;

    const commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];
    tbody.innerHTML = '';

    if (commandes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Aucun historique disponible.</td></tr>';
        return;
    }

    commandes.forEach((cmd) => {
        let badgeClass = 'bg-secondary';
        if (cmd.statut === 'En attente') badgeClass = 'bg-warning text-dark';
        if (cmd.statut === 'En cours') badgeClass = 'bg-info text-dark';
        if (cmd.statut === 'Lavé') badgeClass = 'bg-success';
        if (cmd.statut === 'Payé') badgeClass = 'bg-primary';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold text-info">${cmd.ticket}</td>
                <td>${cmd.plaque}</td>
                <td>${cmd.engin}</td>
                <td>${cmd.formule}</td>
                <td><span class="badge ${badgeClass}">${cmd.statut}</span></td>
                <td class="text-end">
                    <a href="details-commande.html?ticket=${cmd.ticket}" class="btn btn-sm btn-outline-info">Fiche</a>
                </td>
            </tr>
        `;
    });
}

// 3. FICHE TECHNIQUE DÉTAILS
function chargerDetailsCommande() {
    const container = document.getElementById('details-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const ticketNum = urlParams.get('ticket');

    const commandes = JSON.parse(localStorage.getItem(STORAGE_COMMANDES)) || [];
    const commande = commandes.find(c => c.ticket === ticketNum);

    if (!commande) {
        container.innerHTML = `
            <div class="alert alert-warning text-center py-4">
                <h5 class="alert-heading">Aucun détail trouvé !</h5>
                <p class="mb-0">Le ticket <strong>${ticketNum || 'Inconnu'}</strong> n'existe pas dans le stockage local.</p>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <p class="text-muted mb-1">Numéro de Ticket</p>
                <h4 class="text-info">${commande.ticket}</h4>
            </div>
            <div class="col-md-6">
                <p class="text-muted mb-1">Plaque d'immatriculation</p>
                <h4 class="text-white">${commande.plaque}</h4>
            </div>
            <div class="col-md-6">
                <p class="text-muted mb-1">Type d'Engin</p>
                <h5>${commande.engin}</h5>
            </div>
            <div class="col-md-6">
                <p class="text-muted mb-1">Formule choisie</p>
                <h5><span class="badge bg-primary">${commande.formule}</span></h5>
            </div>
            <div class="col-md-6">
                <p class="text-muted mb-1">Heure d'arrivée</p>
                <p class="fw-bold">${commande.heure}</p>
            </div>
            <div class="col-md-6">
                <p class="text-muted mb-1">Statut actuel</p>
                <h5><span class="badge bg-info text-dark">${commande.statut}</span></h5>
            </div>
        </div>
        <hr class="border-secondary my-4">
        <div class="d-flex gap-2">
            <button class="btn btn-warning" onclick="changerStatutLavage('${commande.ticket}', 'En cours')">
                Passer en cours
            </button>
            <button class="btn btn-success" onclick="changerStatutLavage('${commande.ticket}', 'Lavé')">
                Marquer comme Lavé
            </button>
        </div>
    `;
}

// 4. PROFIL LAVEUR
function chargerProfilLaveur() {
    const form = document.getElementById('form-profil-laveur');
    if (!form) return;

    const profil = JSON.parse(localStorage.getItem(STORAGE_PROFIL_LAVEUR));
    if (profil) {
        document.getElementById('laveur-profil-nom').value = profil.nom;
        document.getElementById('laveur-profil-piste').value = profil.piste;
        
        const cardNom = document.getElementById('laveur-card-nom');
        const cardPiste = document.getElementById('laveur-card-piste');
        if (cardNom) cardNom.innerText = profil.nom;
        if (cardPiste) cardPiste.innerText = profil.piste;
    }
}

const formProfilLaveur = document.getElementById('form-profil-laveur');
if (formProfilLaveur) {
    formProfilLaveur.addEventListener('submit', function (e) {
        e.preventDefault();
        const nom = document.getElementById('laveur-profil-nom').value.trim();
        const piste = document.getElementById('laveur-profil-piste').value;

        const profil = { nom: nom, piste: piste };
        localStorage.setItem(STORAGE_PROFIL_LAVEUR, JSON.stringify(profil));

        const cardNom = document.getElementById('laveur-card-nom');
        const cardPiste = document.getElementById('laveur-card-piste');
        if (cardNom) cardNom.innerText = nom;
        if (cardPiste) cardPiste.innerText = piste;

        alert('Session laveur mise à jour !');
    });
}