
// ============================================================
// SCRIPT PARTAGE -- GESTIONNAIRE & LAVEUR
// Systeme LAVAGE BIDE -- Unifie avec Admin & Caisse
// ============================================================

const STORAGE_QUEUE = 'queue';
const STORAGE_LAVEURS = 'bide_laveurs';
const STORAGE_USERS = 'bide_users';
const STORAGE_PROFIL = 'bide_profil';
const STORAGE_PROFIL_LAVEUR = 'bide_profil_laveur';
const STORAGE_NOTIFICATIONS = 'bide_notifications';
const STORAGE_TARIFFS = 'tariffs';

const PISTES = [
    { id: 'Piste A', nom: 'Piste A', type: 'Auto', icone: 'bi-car-front-fill' },
    { id: 'Piste B', nom: 'Piste B', type: 'Auto', icone: 'bi-car-front-fill' },
    { id: 'Piste C', nom: 'Piste C', type: 'Moto', icone: 'bi-scooter' }
];

const VEHICLE_CATEGORIES = {
    berline:    { simple: 2500, complet: 4000, premium: 6000, label: 'Berline / BMW (4 Roues)', wheels: 4, icon: 'bi-car-front-fill' },
    suv:        { simple: 3500, complet: 5000, premium: 8000, label: 'SUV / 4x4 / Pick-up (4 Roues)', wheels: 4, icon: 'bi-truck-front-fill' },
    citadine:   { simple: 2000, complet: 3000, premium: 4500, label: 'Citadine (4 Roues)', wheels: 4, icon: 'bi-car-front' },
    moto:       { simple: 1000, complet: 1500, premium: 2500, label: 'Moto / Scooter (2 Roues)', wheels: 2, icon: 'bi-scooter' },
    minibus:    { simple: 4500, complet: 6500, premium: 10000, label: 'Minibus / Fourgon (4 Roues)', wheels: 4, icon: 'bi-bus-front-fill' },
    camion6:    { simple: 7000, complet: 10000, premium: 15000, label: 'Camion Moyen (6 Roues)', wheels: 6, icon: 'bi-truck' },
    velo:       { simple: 500, complet: 1000, premium: 1500, label: 'Velo / VTT (2 Roues)', wheels: 2, icon: 'bi-bicycle' },
    tricycle:   { simple: 1500, complet: 2500, premium: 3500, label: 'Tricycle / Tuk-Tuk (3 Roues)', wheels: 3, icon: 'bi-ev-front' },
    poidslourd: { simple: 12000, complet: 18000, premium: 25000, label: 'Poids Lourd / Semi (8+ Roues)', wheels: 8, icon: 'bi-train-freight-front' },
    chantier:   { simple: 15000, complet: 22000, premium: 30000, label: 'Engin Special / Chantier', wheels: 8, icon: 'bi-gear-wide-connected' }
};

// INIT
(function initStorage() {
    if (!localStorage.getItem(STORAGE_QUEUE)) {
        localStorage.setItem(STORAGE_QUEUE, JSON.stringify([
            { id: 1, code: 'BID-001', plate: 'TG-1234-A', vehicleTypeKey: 'berline', vehicleType: 'Berline / BMW (4 Roues)', washPackageKey: 'complet', washPackage: 'Lavage Complet', status: 'completed', assignedTo: null, piste: null, clientName: 'Koffi Mensah', clientPhone: '+228 90 12 34 56', createdAt: new Date().toISOString(), assignedAt: null, startedAt: null, completedAt: null, validatedByManager: false, notifiedClient: false },
            { id: 2, code: 'BID-002', plate: 'TG-5544-B', vehicleTypeKey: 'suv', vehicleType: 'SUV / 4x4 / Pick-up (4 Roues)', washPackageKey: 'premium', washPackage: 'Lavage Premium', status: 'pending', assignedTo: null, piste: null, clientName: 'Ablam Lawson', clientPhone: '+228 91 23 45 67', createdAt: new Date().toISOString(), assignedAt: null, startedAt: null, completedAt: null, validatedByManager: false, notifiedClient: false },
            { id: 3, code: 'BID-003', plate: 'TG-9012-C', vehicleTypeKey: 'moto', vehicleType: 'Moto / Scooter (2 Roues)', washPackageKey: 'simple', washPackage: 'Lavage Simple', status: 'pending', assignedTo: null, piste: null, clientName: 'Aimee Doe', clientPhone: '+228 92 34 56 78', createdAt: new Date().toISOString(), assignedAt: null, startedAt: null, completedAt: null, validatedByManager: false, notifiedClient: false }
        ]));
    } else {
        var q = JSON.parse(localStorage.getItem(STORAGE_QUEUE)) || [];
        var u = false;
        q.forEach(function(v) {
            ['assignedTo','piste','assignedAt','startedAt','completedAt'].forEach(function(k) { if (v[k] === undefined) { v[k] = null; u = true; } });
            if (v.validatedByManager === undefined) { v.validatedByManager = false; u = true; }
            if (v.notifiedClient === undefined) { v.notifiedClient = false; u = true; }
            if (v.washPackageKey === undefined) { v.washPackageKey = 'complet'; u = true; }
        });
        if (u) localStorage.setItem(STORAGE_QUEUE, JSON.stringify(q));
    }
    if (!localStorage.getItem(STORAGE_LAVEURS)) {
        localStorage.setItem(STORAGE_LAVEURS, JSON.stringify([
            { id: 1, nom: 'Marc Koffi', piste: 'Piste A', statut: 'Actif', currentTask: null },
            { id: 2, nom: 'Jean Amegavi', piste: 'Piste B', statut: 'Actif', currentTask: null },
            { id: 3, nom: 'Kofi Agbodjan', piste: 'Piste C', statut: 'Actif', currentTask: null }
        ]));
    } else {
        var l = JSON.parse(localStorage.getItem(STORAGE_LAVEURS)) || [];
        l.forEach(function(x) { if (x.currentTask === undefined) x.currentTask = null; });
        if (typeof getUsers === 'function') {
            getUsers().filter(function(user) { return user.role === 'laveur'; }).forEach(function(user) {
                var matchingWorker = l.find(function(worker) {
                    return worker.userId === user.id || worker.username === user.username || (worker.nom && user.fullName && worker.nom.toLowerCase() === user.fullName.toLowerCase());
                });
                if (matchingWorker) {
                    matchingWorker.userId = user.id;
                    matchingWorker.username = user.username;
                }
            });
        }
        localStorage.setItem(STORAGE_LAVEURS, JSON.stringify(l));
    }
    if (!localStorage.getItem(STORAGE_USERS)) localStorage.setItem(STORAGE_USERS, JSON.stringify([{ id: 1, nom: 'WIN_NER STACK', username: 'winner_admin', role: 'Gestionnaire', statut: 'Actif' }]));
    if (!localStorage.getItem(STORAGE_PROFIL)) localStorage.setItem(STORAGE_PROFIL, JSON.stringify({ nom: 'WIN_NER STACK', role: 'Gestionnaire', username: 'winner_admin' }));
    if (!localStorage.getItem(STORAGE_PROFIL_LAVEUR)) localStorage.setItem(STORAGE_PROFIL_LAVEUR, JSON.stringify({ nom: 'Marc KOFFI', piste: 'P1' }));
    if (!localStorage.getItem(STORAGE_NOTIFICATIONS)) localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify([]));
})();

// UTILS
function formatCurrencyFCFA(a) { return (Number(a)||0).toLocaleString('fr-FR') + ' FCFA'; }
function escapeHTML(v) { return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
function getTariffs() { try { var s=localStorage.getItem(STORAGE_TARIFFS); if(!s) return VEHICLE_CATEGORIES; return Object.assign({},VEHICLE_CATEGORIES,JSON.parse(s)); } catch(e){return VEHICLE_CATEGORIES;} }
function calculatePrice(ck,pk) { var t=getTariffs(),c=(ck||'berline').toLowerCase(),p=(pk||'complet').toLowerCase(); if(t[c]&&t[c][p]!==undefined) return Number(t[c][p]); if(VEHICLE_CATEGORIES[c]&&VEHICLE_CATEGORIES[c][p]!==undefined) return Number(VEHICLE_CATEGORIES[c][p]); return 2500; }
function showAlert(msg,type) { var c=document.getElementById('alertContainer'); if(!c){alert(msg);return;} var el=document.createElement('div'); el.className='alert alert-'+(type||'info')+' alert-dismissible fade show shadow-lg border-0 d-flex align-items-center justify-content-between'; el.setAttribute('role','alert'); var ic=type==='success'?'bi-check-circle-fill text-success':type==='danger'?'bi-exclamation-triangle-fill text-danger':type==='warning'?'bi-exclamation-triangle-fill text-warning':'bi-info-circle-fill text-primary'; el.innerHTML='<div class="d-flex align-items-center"><i class="bi '+ic+' fs-5 me-3"></i><div>'+escapeHTML(msg)+'</div></div><button type="button" class="btn-close ms-3" data-bs-dismiss="alert"></button>'; c.appendChild(el); setTimeout(function(){if(el.parentNode){el.classList.remove('show');setTimeout(function(){el.remove();},200);}},4000); }
function getQueue() { try{return JSON.parse(localStorage.getItem(STORAGE_QUEUE))||[];}catch(e){return [];} }
function saveQueue(q) { localStorage.setItem(STORAGE_QUEUE,JSON.stringify(q)); }
function getLaveurs() { try{return JSON.parse(localStorage.getItem(STORAGE_LAVEURS))||[];}catch(e){return [];} }
function saveLaveurs(l) { localStorage.setItem(STORAGE_LAVEURS,JSON.stringify(l)); }
function getNotifications() { try{return JSON.parse(localStorage.getItem(STORAGE_NOTIFICATIONS))||[];}catch(e){return [];} }
function saveNotifications(n) { localStorage.setItem(STORAGE_NOTIFICATIONS,JSON.stringify(n)); }
function addNotification(type,msg,from) { var n=getNotifications(); n.unshift({id:Date.now(),type:type,message:msg,from:from||'Systeme',date:new Date().toISOString(),read:false}); saveNotifications(n); }
function getStatusBadgeColor(s) { switch(s){case'pending':return'bg-warning-subtle text-warning';case'assigned':return'bg-info-subtle text-info';case'in_progress':return'bg-primary-subtle text-primary';case'completed':return'bg-success-subtle text-success';case'validated':return'bg-success text-white';case'paid':return'bg-secondary text-white';default:return'bg-secondary text-white';} }
function getStatusLabel(s) { switch(s){case'pending':return'En attente';case'assigned':return'Assigne';case'in_progress':return'En cours';case'completed':return'Termine';case'validated':return'Valide';case'paid':return'Paye';default:return s||'Inconnu';} }

// ============================================================
// SECTION GESTIONNAIRE
// ============================================================

// 1. Saisie Express
var formExpress = document.getElementById('form-express');
if (formExpress) {
    formExpress.addEventListener('submit', function (e) {
        e.preventDefault();
        var plaque = document.getElementById('plaque').value.trim().toUpperCase();
        var typeEnginKey = document.getElementById('typeEngin').value;
        var formuleKey = document.getElementById('formule').value;
        var clientNom = document.getElementById('client-nom') ? document.getElementById('client-nom').value.trim() : '';
        var clientTel = document.getElementById('client-tel') ? document.getElementById('client-tel').value.trim() : '';
        var codeNum = Math.floor(100 + Math.random() * 900);
        var ticketCode = 'BID-' + String(codeNum).padStart(3, '0');
        var heure = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        var catInfo = VEHICLE_CATEGORIES[typeEnginKey] || VEHICLE_CATEGORIES.berline;
        var pkgLabels = { express: 'Lavage Express', complet: 'Lavage Complet', premium: 'Lavage Premium' };

        var nouvelleEntree = {
            id: Date.now(), code: ticketCode, plate: plaque, vehicleTypeKey: typeEnginKey,
            vehicleType: catInfo.label, washPackageKey: formuleKey,
            washPackage: pkgLabels[formuleKey] || 'Lavage Complet', status: 'pending',
            assignedTo: null, piste: null, clientName: clientNom || 'Client Passage',
            clientPhone: clientTel || '', createdAt: new Date().toISOString(),
            assignedAt: null, startedAt: null, completedAt: null,
            validatedByManager: false, notifiedClient: false, heure: heure
        };

        var queue = getQueue();
        queue.unshift(nouvelleEntree);
        saveQueue(queue);

        var qrContainer = document.getElementById('qrcode-container');
        if (qrContainer) {
            qrContainer.innerHTML = '';
            if (window.QRCode) { new QRCode(qrContainer, { text: ticketCode, width: 128, height: 128 }); }
        }

        var ticketInfo = document.getElementById('ticket-info');
        if (ticketInfo) {
            var price = calculatePrice(typeEnginKey, formuleKey);
            ticketInfo.innerHTML = '<h4 class="text-info mt-2">' + ticketCode + '</h4><p class="mb-1"><strong>Plaque :</strong> ' + escapeHTML(plaque) + '</p><p class="mb-1"><strong>Engin :</strong> ' + escapeHTML(catInfo.label) + '</p><p class="mb-1"><strong>Formule :</strong> ' + escapeHTML(pkgLabels[formuleKey] || 'Lavage Complet') + '</p><p class="mb-1"><strong>Prix :</strong> ' + formatCurrencyFCFA(price) + '</p><p class="text-muted small">Heure : ' + heure + '</p>';
        }
        formExpress.reset();
        showAlert('Ticket ' + ticketCode + ' genere avec succes ! Ce code est aussi reconnu par la Caisse.', 'success');
    });
}

// 2. Grille Tarifaire
function afficherGrilleTarifaire() {
    var container = document.getElementById('tariff-grid-container');
    if (!container) return;
    var tariffs = getTariffs();
    container.innerHTML = '';
    Object.keys(tariffs).forEach(function(key) {
        var t = tariffs[key];
        if (!t || !t.label) return;
        container.innerHTML += '<div class="col-md-6 col-lg-4"><div class="tariff-card"><div class="tariff-card-header"><div class="tariff-title"><div class="tariff-icon-wrap"><i class="bi ' + (t.icon || 'bi-car-front') + '"></i></div><div><span class="d-block fw-bold text-navy small">' + escapeHTML(t.label) + '</span><span class="text-muted" style="font-size:0.7rem;">' + (t.wheels || 4) + ' Roues</span></div></div></div><div class="d-flex justify-content-between mt-2"><div class="text-center"><div class="fw-bold text-primary">' + formatCurrencyFCFA(t.simple || 0) + '</div><small class="text-muted">Simple</small></div><div class="text-center"><div class="fw-bold text-primary">' + formatCurrencyFCFA(t.complet || 0) + '</div><small class="text-muted">Complet</small></div><div class="text-center"><div class="fw-bold text-primary">' + formatCurrencyFCFA(t.premium || 0) + '</div><small class="text-muted">Premium</small></div></div></div></div>';
    });
}

// 3. Notifications
function chargerNotifications() {
    var container = document.getElementById('notifications-container');
    if (!container) return;
    var notifs = getNotifications();
    var badge = document.getElementById('notif-badge');
    var unread = notifs.filter(function(n) { return !n.read; }).length;
    if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'inline-block' : 'none'; }
    if (notifs.length === 0) { container.innerHTML = '<div class="text-center text-muted py-4"><i class="bi bi-bell-slash display-6 d-block mb-2 opacity-50"></i><p>Aucune notification</p></div>'; return; }
    container.innerHTML = notifs.slice(0, 20).map(function(n) {
        var iconMap = { laveur_done: 'bi-check-circle-fill text-success', assignment: 'bi-person-check-fill text-info', validation: 'bi-shield-check text-primary', client_notified: 'bi-envelope-check text-warning' };
        var icon = iconMap[n.type] || 'bi-bell-fill text-primary';
        var time = new Date(n.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        var dateStr = new Date(n.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        return '<div class="list-group-item d-flex justify-content-between align-items-start ' + (n.read ? '' : 'bg-light') + '"><div class="d-flex align-items-start gap-2"><i class="bi ' + icon + ' fs-5 mt-1"></i><div><div class="fw-semibold text-dark small">' + escapeHTML(n.message) + '</div><small class="text-muted">De : ' + escapeHTML(n.from) + ' - ' + dateStr + ' ' + time + '</small></div></div><button class="btn btn-sm btn-outline-secondary" data-action="mark-read" data-notif-id="' + n.id + '"><i class="bi bi-check-lg"></i></button></div>';
    }).join('');
}

function marquerLue(notifId) { saveNotifications(getNotifications().map(function(n) { return n.id === notifId ? Object.assign({}, n, { read: true }) : n; })); chargerNotifications(); }
function marquerToutesLues() { saveNotifications(getNotifications().map(function(n) { n.read = true; return n; })); chargerNotifications(); showAlert('Toutes les notifications marquees comme lues.', 'info'); }

// 4. Validation Manager & Notification Client
function validerLavage(code) {
    var queue = getQueue(); var i = queue.findIndex(function(v) { return v.code === code; });
    if (i === -1) return;
    queue[i].status = 'validated'; queue[i].validatedByManager = true; queue[i].validatedAt = new Date().toISOString();
    saveQueue(queue);
    addNotification('validation', 'Lavage du vehicule ' + code + ' (' + queue[i].plate + ') valide par le gestionnaire. Le client peut recuperer son vehicule.', 'Gestionnaire');
    showAlert('Lavage ' + code + ' valide ! Le client a ete informe et peut recuperer son vehicule a la Caisse.', 'success');
    if (document.getElementById('pending-validation-container')) afficherValidationsEnAttente();
    if (document.getElementById('table-commandes-body')) afficherRegistreCommandes();
    if (document.getElementById('notifications-container')) chargerNotifications();
}

function informerClient(code) {
    var queue = getQueue(); var i = queue.findIndex(function(v) { return v.code === code; });
    if (i === -1) return;
    queue[i].notifiedClient = true; saveQueue(queue);
    addNotification('client_notified', 'Client ' + (queue[i].clientName || 'Anonyme') + ' informe que son vehicule ' + code + ' est pret. Recuperation a la Caisse.', 'Systeme');
    showAlert('Client informe avec succes ! Il pourra recuperer son vehicule et payer a la Caisse.', 'success');
    if (document.getElementById('pending-validation-container')) afficherValidationsEnAttente();
}

function afficherValidationsEnAttente() {
    var container = document.getElementById('pending-validation-container');
    if (!container) return;
    var queue = getQueue();
    var aValider = queue.filter(function(v) { return v.status === 'completed' && !v.validatedByManager; });
    var valides = queue.filter(function(v) { return v.status === 'validated' && !v.notifiedClient; });
    var html = '<h5 class="fw-bold text-navy mb-3"><i class="bi bi-clipboard-check text-warning me-2"></i> Lavages termines - En attente de validation (' + aValider.length + ')</h5>';
    if (aValider.length === 0) { html += '<div class="text-center text-muted py-3 mb-4"><i class="bi bi-check-circle display-6 d-block mb-2 opacity-50 text-success"></i><p>Aucun lavage en attente de validation.</p></div>'; }
    else { html += '<div class="row g-3 mb-4">'; aValider.forEach(function(v) { var t = v.completedAt ? new Date(v.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'; var nm = (v.assignedTo && v.assignedTo.nom) ? v.assignedTo.nom : '-'; html += '<div class="col-md-6 col-lg-4"><div class="order-card border-start border-4 border-success"><div class="d-flex justify-content-between align-items-center mb-2"><span class="fw-bold text-primary">' + escapeHTML(v.code) + '</span><span class="badge bg-success-subtle text-success">Termine</span></div><h5 class="text-navy mb-1">' + escapeHTML(v.plate) + '</h5><p class="text-muted small mb-1">' + escapeHTML(v.vehicleType) + ' - ' + escapeHTML(v.washPackage) + '</p><p class="text-muted small mb-1">Laveur : <strong>' + escapeHTML(nm) + '</strong> | Piste : ' + escapeHTML(v.piste || '-') + '</p><p class="text-muted small mb-2">Termine a : ' + t + '</p><button class="btn btn-sm btn-success w-100" data-action="validate" data-code="' + escapeHTML(v.code) + '"><i class="bi bi-check-circle me-1"></i> Valider</button></div></div>'; }); html += '</div>'; }
    html += '<h5 class="fw-bold text-navy mb-3"><i class="bi bi-envelope-check text-info me-2"></i> Valides - En attente notification client (' + valides.length + ')</h5>';
    if (valides.length === 0) { html += '<div class="text-center text-muted py-3"><i class="bi bi-bell-slash display-6 d-block mb-2 opacity-50"></i><p>Aucune notification client en attente.</p></div>'; }
    else { html += '<div class="row g-3">'; valides.forEach(function(v) { html += '<div class="col-md-6 col-lg-4"><div class="order-card border-start border-4 border-info"><div class="d-flex justify-content-between align-items-center mb-2"><span class="fw-bold text-primary">' + escapeHTML(v.code) + '</span><span class="badge bg-info-subtle text-info">Valide</span></div><h5 class="text-navy mb-1">' + escapeHTML(v.plate) + '</h5><p class="text-muted small mb-1">Client : <strong>' + escapeHTML(v.clientName || 'Anonyme') + '</strong></p><p class="text-muted small mb-2">Tel : ' + escapeHTML(v.clientPhone || '-') + '</p><button class="btn btn-sm btn-primary w-100" data-action="notify-client" data-code="' + escapeHTML(v.code) + '"><i class="bi bi-envelope-check me-1"></i> Informer le client</button></div></div>'; }); html += '</div>'; }
    container.innerHTML = html;
}

// 5. Registre des Commandes
function afficherRegistreCommandes() {
    var tbody = document.getElementById('table-commandes-body');
    if (!tbody) return;
    var queue = getQueue(); tbody.innerHTML = '';
    if (queue.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Aucune commande enregistree.</td></tr>'; return; }
    queue.forEach(function(v) { var h = v.heure || (v.createdAt ? new Date(v.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'); tbody.innerHTML += '<tr><td class="fw-bold text-primary">' + escapeHTML(v.code) + '</td><td>' + escapeHTML(v.plate) + '</td><td>' + escapeHTML(v.vehicleType || '-') + '</td><td>' + escapeHTML(v.washPackage || '-') + '</td><td>' + escapeHTML(v.clientName || '-') + '</td><td>' + escapeHTML(h) + '</td><td><span class="badge ' + getStatusBadgeColor(v.status) + '">' + getStatusLabel(v.status) + '</span></td><td class="text-end"><span class="text-muted small">' + escapeHTML(v.piste || '-') + '</span></td></tr>'; });
}

function filtrerCommandes() {
    var si = document.getElementById('search-plaque'), fi = document.getElementById('filter-statut'), tbody = document.getElementById('table-commandes-body');
    if (!tbody || !si || !fi) return;
    var sv = si.value.toLowerCase(), fs = fi.value;
    var filtered = getQueue().filter(function(v) { var ms = (v.plate && v.plate.toLowerCase().indexOf(sv) !== -1) || (v.code && v.code.toLowerCase().indexOf(sv) !== -1) || (v.clientName && v.clientName.toLowerCase().indexOf(sv) !== -1); return ms && (fs === 'TOUS' || v.status === fs); });
    tbody.innerHTML = '';
    if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Aucun resultat.</td></tr>'; return; }
    filtered.forEach(function(v) { var h = v.heure || (v.createdAt ? new Date(v.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'); tbody.innerHTML += '<tr><td class="fw-bold text-primary">' + escapeHTML(v.code) + '</td><td>' + escapeHTML(v.plate) + '</td><td>' + escapeHTML(v.vehicleType || '-') + '</td><td>' + escapeHTML(v.washPackage || '-') + '</td><td>' + escapeHTML(v.clientName || '-') + '</td><td>' + escapeHTML(h) + '</td><td><span class="badge ' + getStatusBadgeColor(v.status) + '">' + getStatusLabel(v.status) + '</span></td><td class="text-end"><span class="text-muted small">' + escapeHTML(v.piste || '-') + '</span></td></tr>'; });
}

// 6. Gestion des Laveurs & Assignation
function afficherLaveurs() {
    var container = document.getElementById('container-laveurs');
    if (!container) return;
    var laveurs = getLaveurs(); container.innerHTML = '';
    var ps = document.getElementById('piste-stats');
    if (ps) { var q = getQueue(); var ec = q.filter(function(v) { return v.status === 'in_progress' || v.status === 'assigned'; }); ps.innerHTML = '<span class="badge bg-success-subtle text-success me-2"><i class="bi bi-check-circle me-1"></i> ' + (PISTES.length - ec.length) + ' piste(s) libre(s)</span><span class="badge bg-warning-subtle text-warning me-2"><i class="bi bi-hourglass-split me-1"></i> ' + ec.length + ' piste(s) occupee(s)</span><span class="badge bg-primary-subtle text-primary"><i class="bi bi-people me-1"></i> ' + laveurs.filter(function(l) { return l.statut === 'Actif'; }).length + ' laveur(s) actif(s)</span>'; }
    if (laveurs.length === 0) { container.innerHTML = '<div class="col-12 text-center text-muted py-5"><p>Aucun laveur enregistre.</p></div>'; return; }
    var qa = getQueue();
    laveurs.forEach(function(lav) {
        var ta = qa.find(function(v) { return v.assignedTo && v.assignedTo.id === lav.id && (v.status === 'assigned' || v.status === 'in_progress'); });
        var bc = ta ? 'border-warning' : (lav.statut === 'Actif' ? 'border-success' : 'border-secondary');
        var sb = lav.statut === 'Actif' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary';
        var ti = '';
        if (ta) { ti = '<div class="mt-2 p-2 bg-light rounded border"><small class="fw-bold text-navy"><i class="bi bi-car-front me-1"></i> ' + escapeHTML(ta.code) + '</small><br><small class="text-muted">' + escapeHTML(ta.plate) + ' - ' + escapeHTML(ta.washPackage) + '</small><br><small class="text-muted">Statut : <span class="badge ' + getStatusBadgeColor(ta.status) + '">' + getStatusLabel(ta.status) + '</span></small></div>'; }
        container.innerHTML += '<div class="col-md-6 col-lg-4"><div class="worker-card border-start border-4 ' + bc + '"><div class="d-flex justify-content-between align-items-center mb-2"><h5 class="fw-bold text-navy mb-0">' + escapeHTML(lav.nom) + '</h5><span class="badge ' + sb + '">' + lav.statut + '</span></div><p class="text-muted small mb-1"><i class="bi bi-geo-alt me-1"></i> ' + escapeHTML(lav.piste) + '</p>' + ti + '<div class="d-flex gap-2 mt-3"><button class="btn btn-sm btn-outline-primary flex-grow-1" data-bs-toggle="modal" data-bs-target="#modalAssigner" data-action="prepare-assign" data-laveur-id="' + lav.id + '"><i class="bi bi-person-check me-1"></i> Assigner</button><button class="btn btn-sm btn-outline-danger" data-action="delete-laveur" data-laveur-id="' + lav.id + '"><i class="bi bi-trash"></i></button></div></div></div>';
    });
}

var laveurAAssigner = null;
function preparerAssignation(id) {
    laveurAAssigner = id;
    var lav = getLaveurs().find(function(l) { return l.id === id; });
    var ea = getQueue().filter(function(v) { return v.status === 'pending'; });
    var sl = document.getElementById('assign-laveur-info'), st = document.getElementById('assign-task-select');
    if (sl && lav) sl.textContent = lav.nom + ' (' + lav.piste + ')';
    if (st) { st.innerHTML = '<option value="">-- Selectionner un vehicule --</option>'; ea.forEach(function(v) { st.innerHTML += '<option value="' + v.code + '">' + v.code + ' - ' + escapeHTML(v.plate) + ' (' + escapeHTML(v.vehicleType) + ')</option>'; }); if (ea.length === 0) st.innerHTML += '<option value="" disabled>Aucun vehicule en attente</option>'; }
}

function confirmerAssignation() {
    if (!laveurAAssigner) return;
    var st = document.getElementById('assign-task-select'); var code = st ? st.value : '';
    if (!code) { showAlert('Veuillez selectionner un vehicule a assigner.', 'warning'); return; }
    var lav = getLaveurs().find(function(l) { return l.id === laveurAAssigner; }); if (!lav) return;
    var queue = getQueue(); var idx = queue.findIndex(function(v) { return v.code === code; }); if (idx === -1) return;
    queue.forEach(function(v) { if (v.assignedTo && v.assignedTo.id === lav.id && v.status === 'assigned') { v.status = 'pending'; v.assignedTo = null; v.piste = null; v.assignedAt = null; } });
    queue[idx].status = 'assigned'; queue[idx].assignedTo = { id: lav.id, nom: lav.nom, piste: lav.piste }; queue[idx].piste = lav.piste; queue[idx].assignedAt = new Date().toISOString();
    saveQueue(queue);
    var laveurs = getLaveurs(); var li = laveurs.findIndex(function(l) { return l.id === lav.id; });
    if (li !== -1) { laveurs[li].currentTask = code; saveLaveurs(laveurs); }
    addNotification('assignment', 'Tache assignee : ' + code + ' (' + queue[idx].plate + ') -> ' + lav.nom + ' sur ' + lav.piste, 'Gestionnaire');
    showAlert('Vehicule ' + code + ' assigne a ' + lav.nom + ' sur ' + lav.piste + ' !', 'success');
    var m = bootstrap.Modal.getInstance(document.getElementById('modalAssigner')); if (m) m.hide();
    laveurAAssigner = null;
    if (document.getElementById('container-laveurs')) afficherLaveurs();
    if (document.getElementById('notifications-container')) chargerNotifications();
    if (document.getElementById('table-commandes-body')) afficherRegistreCommandes();
}

var formLaveur = document.getElementById('form-laveur');
if (formLaveur) { formLaveur.addEventListener('submit', function(e) { e.preventDefault(); var nom = document.getElementById('laveur-nom').value.trim(), p = document.getElementById('laveur-piste').value; var l = getLaveurs(); if (l.length >= 8) { showAlert('Maximum 8 laveurs atteint.', 'warning'); return; } l.push({ id: Date.now(), nom: nom, piste: p, statut: 'Actif', currentTask: null }); saveLaveurs(l); formLaveur.reset(); var m = bootstrap.Modal.getInstance(document.getElementById('modalLaveur')); if (m) m.hide(); afficherLaveurs(); showAlert('Laveur ' + nom + ' ajoute sur ' + p + '.', 'success'); }); }

function supprimerLaveur(id) { if (!confirm('Retirer ce laveur ?')) return; saveLaveurs(getLaveurs().filter(function(l) { return l.id !== id; })); afficherLaveurs(); }
function toggleLaveurStatut(id) { var l = getLaveurs(); var i = l.findIndex(function(x) { return x.id === id; }); if (i !== -1) { l[i].statut = l[i].statut === 'Actif' ? 'Inactif' : 'Actif'; saveLaveurs(l); afficherLaveurs(); } }

// 7. Rapports
function genererRapports() {
    var kt = document.getElementById('kpi-total-commandes'); if (!kt) return;
    var q = getQueue(); kt.innerText = q.length;
    var kl = document.getElementById('kpi-total-laves'), ke = document.getElementById('kpi-en-cours');
    if (kl) kl.innerText = q.filter(function(v) { return v.status === 'completed' || v.status === 'validated' || v.status === 'paid'; }).length;
    if (ke) ke.innerText = q.filter(function(v) { return v.status === 'pending' || v.status === 'assigned' || v.status === 'in_progress'; }).length;
    var r = {}; q.forEach(function(v) { var k = v.vehicleType || 'Autre'; r[k] = (r[k] || 0) + 1; });
    var tb = document.getElementById('table-rapports-body');
    if (tb) { tb.innerHTML = ''; for (var e in r) { tb.innerHTML += '<tr><td>' + escapeHTML(e) + '</td><td class="text-end fw-bold text-primary">' + r[e] + '</td></tr>'; } }
}

// 8. Utilisateurs
function getManagedUsers() {
    if (typeof getUsers === 'function') return getUsers();
    try { return JSON.parse(localStorage.getItem(STORAGE_USERS)) || []; } catch (e) { return []; }
}

function saveManagedUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getManagedRoleLabel(role) {
    var labels = { admin: 'Administrateur', caisse: 'Caissier', gestionnaire: 'Gestionnaire', laveur: 'Laveur' };
    return labels[role] || role || 'Utilisateur';
}

function afficherUtilisateurs() {
    var tb = document.getElementById('table-users-body'); if (!tb) return;
    var users = getManagedUsers(); tb.innerHTML = '';
    users.forEach(function(user, index) {
        var name = user.fullName || user.nom || user.username;
        var role = (user.role || '').toLowerCase();
        var status = user.statut || 'Actif';
        tb.innerHTML += '<tr><td><strong class="text-navy">' + escapeHTML(name) + '</strong></td><td><span class="badge bg-primary-subtle text-primary">' + escapeHTML(getManagedRoleLabel(role)) + '</span></td><td class="text-muted">' + escapeHTML(user.username) + '</td><td><span class="badge bg-success">' + escapeHTML(status) + '</span></td><td class="text-end"><div class="d-flex justify-content-end gap-2"><button class="btn btn-sm btn-outline-warning" data-action="reset-user-password" data-user-index="' + index + '">Reinitialiser</button><button class="btn btn-sm btn-outline-danger" data-action="delete-user" data-user-index="' + index + '">Desactiver</button></div></td></tr>';
    });
}
var formUser = document.getElementById('form-user');
if (formUser) {
    formUser.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('user-nom').value.trim();
        var username = document.getElementById('user-username').value.trim().toLowerCase();
        var password = document.getElementById('user-password').value;
        var role = document.getElementById('user-role').value;
        var piste = document.getElementById('user-piste').value;
        var users = getManagedUsers();

        if (users.some(function(user) { return (user.username || '').toLowerCase() === username; })) {
            showAlert('Cet identifiant existe deja.', 'warning');
            return;
        }

        var user = {
            id: 'usr-' + Date.now(),
            username: username,
            password: password,
            fullName: name,
            role: role,
            badge: getManagedRoleLabel(role),
            icon: role === 'laveur' ? 'bi-droplet-fill' : 'bi-person-fill',
            avatarColor: role === 'laveur' ? '#f59e0b' : '#0284c7',
            statut: 'Actif'
        };
        users.push(user);
        saveManagedUsers(users);

        if (role === 'laveur') {
            var laveurs = getLaveurs();
            laveurs.push({ id: user.id, userId: user.id, username: user.username, nom: user.fullName, piste: piste, statut: 'Actif', currentTask: null });
            saveLaveurs(laveurs);
        }

        formUser.reset();
        var m = bootstrap.Modal.getInstance(document.getElementById('modalUser')); if (m) m.hide();
        afficherUtilisateurs();
        showAlert('Compte cree. L utilisateur peut maintenant se connecter avec cet identifiant.', 'success');
    });
}
function supprimerUser(index) {
    var users = getManagedUsers();
    var user = users[index];
    if (!user) return;
    if (typeof getCurrentUser === 'function' && getCurrentUser() && getCurrentUser().id === user.id) { showAlert('Vous ne pouvez pas desactiver votre propre compte.', 'warning'); return; }
    if (!confirm('Desactiver ce compte ?')) return;
    users.splice(index, 1); saveManagedUsers(users);
    if ((user.role || '').toLowerCase() === 'laveur') saveLaveurs(getLaveurs().filter(function(lav) { return lav.userId !== user.id && lav.username !== user.username; }));
    afficherUtilisateurs();
}

function reinitialiserMotDePasse(index) {
    var users = getManagedUsers();
    var user = users[index];
    if (!user) return;

    var newPassword = window.prompt('Nouveau mot de passe pour ' + (user.fullName || user.username) + ' (6 caracteres minimum) :');
    if (newPassword === null) return;
    if (newPassword.length < 6) {
        showAlert('Le mot de passe doit contenir au moins 6 caracteres.', 'warning');
        return;
    }

    user.password = newPassword;
    users[index] = user;
    saveManagedUsers(users);
    showAlert('Mot de passe reinitialise. Le compte peut maintenant se reconnecter.', 'success');
}

// 9. Profil Gestionnaire
function chargerProfil() { var f = document.getElementById('form-profil'); if (!f) return; var p = JSON.parse(localStorage.getItem(STORAGE_PROFIL)); if (p) { document.getElementById('profil-nom').value = p.nom || ''; document.getElementById('profil-role').value = p.role || ''; document.getElementById('profil-username').value = p.username || ''; var cn = document.getElementById('profile-card-name'); if (cn) cn.innerText = p.nom || ''; } }
var formProfil = document.getElementById('form-profil');
if (formProfil) { formProfil.addEventListener('submit', function(e) { e.preventDefault(); var n = document.getElementById('profil-nom').value.trim(), u = document.getElementById('profil-username').value.trim(); var p = JSON.parse(localStorage.getItem(STORAGE_PROFIL)) || {}; p.nom = n; p.username = u; localStorage.setItem(STORAGE_PROFIL, JSON.stringify(p)); var cn = document.getElementById('profile-card-name'); if (cn) cn.innerText = n; showAlert('Profil mis a jour !', 'success'); }); }

// ============================================================
// SECTION LAVEUR
// ============================================================

function chargerPisteLaveur() {
    var container = document.getElementById('piste-container');
    if (!container) return;
    var pl = JSON.parse(localStorage.getItem(STORAGE_PROFIL_LAVEUR)) || {};
    var ln = pl.nom || '';
    var currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    var lv = getLaveurs().find(function(l) {
        return (currentUser && (l.userId === currentUser.id || l.username === currentUser.username)) || (!currentUser && l.nom && l.nom.toLowerCase() === ln.toLowerCase());
    });
    var queue = getQueue();
    var mt = lv ? queue.filter(function(v) { return v.assignedTo && v.assignedTo.id === lv.id && (v.status === 'assigned' || v.status === 'in_progress' || v.status === 'completed'); }) : queue.filter(function(v) { return v.status !== 'paid' && v.status !== 'validated'; });
    container.innerHTML = '';
    if (mt.length === 0) { container.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-check-circle display-4 text-success opacity-50 d-block mb-2"></i><p class="text-muted fs-5">Aucune tache assignee.</p><p class="text-muted small">Attendez que le gestionnaire vous assigne un vehicule.</p></div>'; return; }
    mt.forEach(function(v) {
        var bc = 'border-secondary', btn = '';
        if (v.status === 'assigned') { bc = 'border-info'; btn = '<button class="btn btn-sm btn-primary w-100" data-action="commencer" data-code="' + v.code + '"><i class="bi bi-play-circle me-1"></i> Commencer</button>'; }
        else if (v.status === 'in_progress') { bc = 'border-primary'; btn = '<button class="btn btn-sm btn-outline-primary w-100 mb-2" disabled><i class="bi bi-hourglass-split me-1"></i> En cours</button><button class="btn btn-sm btn-success w-100" data-action="terminer" data-code="' + v.code + '"><i class="bi bi-check-circle me-1"></i> Termine</button>'; }
        else if (v.status === 'completed') { bc = 'border-success'; btn = '<div class="alert alert-success py-2 px-3 mb-0 text-center small"><i class="bi bi-check-circle-fill me-1"></i> Termine - En attente de validation</div>'; }
        var t = v.createdAt ? new Date(v.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
        container.innerHTML += '<div class="col-md-6 col-lg-4"><div class="order-card border-start border-4 ' + bc + '"><div class="d-flex justify-content-between align-items-center mb-2"><span class="fw-bold text-primary">' + escapeHTML(v.code) + '</span><span class="badge ' + getStatusBadgeColor(v.status) + '">' + getStatusLabel(v.status) + '</span></div><h4 class="text-navy mb-1">' + escapeHTML(v.plate) + '</h4><p class="text-muted small mb-1">' + escapeHTML(v.vehicleType) + ' - <strong>' + escapeHTML(v.washPackage) + '</strong></p><p class="text-muted small mb-1">Piste : <strong>' + escapeHTML(v.piste || '-') + '</strong></p><p class="text-muted small mb-2">Arrivee : ' + t + '</p><div class="d-grid gap-2">' + btn + '</div></div></div>';
    });
}


// --- VUE DES 3 PISTES (Style visuel dans la page laveurs) ---
function afficher3Pistes() {
    var container = document.getElementById('pistes-vue-container');
    if (!container) return;
    var queue = getQueue();
    container.innerHTML = '';
    PISTES.forEach(function(piste) {
        var taskOnPiste = queue.find(function(v) { return v.piste === piste.nom && (v.status === 'assigned' || v.status === 'in_progress' || v.status === 'completed'); });
        var isOccupied = !!taskOnPiste;
        var statusClass = 'piste-libre';
        var statusIcon = 'bi-check-circle-fill';
        var statusLabel = 'Libre';
        var statusColor = 'text-success';
        var vehicleInfo = '';
        if (isOccupied) {
            statusClass = 'piste-occupee';
            statusColor = 'text-warning';
            if (taskOnPiste.status === 'in_progress') { statusClass = 'piste-en-cours'; statusColor = 'text-primary'; statusIcon = 'bi-arrow-repeat'; statusLabel = 'En lavage'; }
            else if (taskOnPiste.status === 'completed') { statusClass = 'piste-terminee'; statusColor = 'text-success'; statusIcon = 'bi-check-circle-fill'; statusLabel = 'Termine'; }
            else { statusIcon = 'bi-hourglass-split'; statusLabel = 'Assignee'; }
            var lavName = taskOnPiste.assignedTo ? taskOnPiste.assignedTo.nom : '';
            vehicleInfo = '<div class="piste-vehicle-info"><div class="fw-bold text-navy small">' + escapeHTML(taskOnPiste.code) + '</div><div class="text-muted" style="font-size:0.7rem;">' + escapeHTML(taskOnPiste.plate) + ' - ' + escapeHTML(taskOnPiste.washPackage) + '</div>' + (lavName ? '<div class="mt-1"><span class="badge bg-light text-dark border" style="font-size:0.6rem;"><i class="bi bi-person-fill me-1"></i>' + escapeHTML(lavName) + '</span></div>' : '') + '</div>';
        }
        container.innerHTML += '<div class="col-md-4"><div class="piste-card ' + statusClass + '"><div class="piste-header"><span class="piste-number" style="font-size:1rem;width:40px;height:40px;">' + escapeHTML(piste.nom.replace('Piste ','')) + '</span><div class="piste-status-dot ' + statusClass + '-dot"></div></div><div class="piste-body"><i class="bi ' + piste.icone + ' piste-icon ' + statusColor + '"></i><div class="piste-label">' + escapeHTML(piste.nom) + ' (' + escapeHTML(piste.type) + ')</div><div class="text-muted small mb-1">' + statusLabel + '</div>' + vehicleInfo + '</div></div></div>';
    });
    // Stats
    var statsContainer = document.getElementById('pistes-stats-bar');
    if (statsContainer) {
        var occupees = queue.filter(function(v) { return (v.status === 'assigned' || v.status === 'in_progress' || v.status === 'completed') && v.piste; }).length;
        var libres = PISTES.length - occupees;
        statsContainer.innerHTML = '<span class="badge bg-success-subtle text-success px-3 py-2"><i class="bi bi-check-circle me-1"></i> ' + libres + ' Libre(s)</span><span class="badge bg-primary-subtle text-primary px-3 py-2"><i class="bi bi-car-front-fill me-1"></i> ' + occupees + ' Occupee(s)</span>';
    }
}


function commencerLavage(code) {
    var q = getQueue(); var i = q.findIndex(function(v) { return v.code === code; }); if (i === -1) return;
    q[i].status = 'in_progress'; q[i].startedAt = new Date().toISOString(); saveQueue(q);
    var nm = q[i].assignedTo ? q[i].assignedTo.nom : 'Laveur';
    addNotification('assignment', 'Lavage demarre : ' + code + ' (' + q[i].plate + ') par ' + nm, nm);
    showAlert('Lavage de ' + code + ' demarre !', 'info'); chargerPisteLaveur();
    if (document.getElementById('notifications-container')) chargerNotifications();
}

function terminerLavage(code) {
    var q = getQueue(); var i = q.findIndex(function(v) { return v.code === code; }); if (i === -1) return;
    q[i].status = 'completed'; q[i].completedAt = new Date().toISOString(); saveQueue(q);
    if (q[i].assignedTo) { var l = getLaveurs(); var li = l.findIndex(function(x) { return x.id === q[i].assignedTo.id; }); if (li !== -1) { l[li].currentTask = null; saveLaveurs(l); } }
    var nm = q[i].assignedTo ? q[i].assignedTo.nom : 'Laveur';
    addNotification('laveur_done', 'Lavage termine : ' + code + ' (' + q[i].plate + ') - Veuillez valider.', nm);
    showAlert('Lavage de ' + code + ' termine ! Le gestionnaire a ete notifie.', 'success'); chargerPisteLaveur();
    if (document.getElementById('notifications-container')) chargerNotifications();
}

function afficherCommandesLaveur() {
    var tb = document.getElementById('table-laveur-commandes-body'); if (!tb) return;
    var pl = JSON.parse(localStorage.getItem(STORAGE_PROFIL_LAVEUR)) || {};
    var currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    var lv = getLaveurs().find(function(l) {
        return (currentUser && (l.userId === currentUser.id || l.username === currentUser.username)) || (!currentUser && l.nom && l.nom.toLowerCase() === (pl.nom || '').toLowerCase());
    });
    var mc = lv ? getQueue().filter(function(v) { return v.assignedTo && v.assignedTo.id === lv.id; }) : getQueue();
    tb.innerHTML = '';
    if (mc.length === 0) { tb.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Aucun historique.</td></tr>'; return; }
    mc.forEach(function(v) { tb.innerHTML += '<tr><td class="fw-bold text-primary">' + escapeHTML(v.code) + '</td><td>' + escapeHTML(v.plate) + '</td><td>' + escapeHTML(v.vehicleType || '-') + '</td><td>' + escapeHTML(v.washPackage || '-') + '</td><td><span class="badge ' + getStatusBadgeColor(v.status) + '">' + getStatusLabel(v.status) + '</span></td><td class="text-end"><span class="text-muted small">' + escapeHTML(v.piste || '-') + '</span></td></tr>'; });
}

function chargerDetailsCommande() {
    var c = document.getElementById('details-container'); if (!c) return;
    var tc = new URLSearchParams(window.location.search).get('ticket');
    var cmd = getQueue().find(function(v) { return v.code === tc; });
    if (!cmd) { c.innerHTML = '<div class="alert alert-warning text-center py-4"><h5 class="alert-heading">Aucun detail trouve !</h5><p class="mb-0">Le ticket <strong>' + escapeHTML(tc || 'Inconnu') + '</strong> n\'existe pas.</p></div>'; return; }
    var pr = calculatePrice(cmd.vehicleTypeKey, cmd.washPackageKey);
    c.innerHTML = '<div class="row g-3"><div class="col-md-6"><p class="text-muted mb-1">Code</p><h4 class="text-primary">' + escapeHTML(cmd.code) + '</h4></div><div class="col-md-6"><p class="text-muted mb-1">Plaque</p><h4 class="text-navy">' + escapeHTML(cmd.plate) + '</h4></div><div class="col-md-6"><p class="text-muted mb-1">Engin</p><h5>' + escapeHTML(cmd.vehicleType) + '</h5></div><div class="col-md-6"><p class="text-muted mb-1">Formule</p><h5><span class="badge bg-primary-subtle text-primary">' + escapeHTML(cmd.washPackage) + '</span></h5></div><div class="col-md-6"><p class="text-muted mb-1">Prix</p><h5 class="text-primary">' + formatCurrencyFCFA(pr) + '</h5></div><div class="col-md-6"><p class="text-muted mb-1">Client</p><p class="fw-bold">' + escapeHTML(cmd.clientName || 'Anonyme') + '</p></div><div class="col-md-6"><p class="text-muted mb-1">Piste</p><p class="fw-bold">' + escapeHTML(cmd.piste || '-') + '</p></div><div class="col-md-6"><p class="text-muted mb-1">Statut</p><h5><span class="badge ' + getStatusBadgeColor(cmd.status) + '">' + getStatusLabel(cmd.status) + '</span></h5></div></div>';
}

function chargerProfilLaveur() {
    var f = document.getElementById('form-profil-laveur'); if (!f) return;
    var currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    var legacyProfile = JSON.parse(localStorage.getItem(STORAGE_PROFIL_LAVEUR)) || {};
    var profile = getLaveurs().find(function(lav) {
        return currentUser && (lav.userId === currentUser.id || lav.username === currentUser.username);
    }) || legacyProfile;
    if (profile) {
        document.getElementById('laveur-profil-nom').value = profile.nom || (currentUser && currentUser.fullName) || '';
        document.getElementById('laveur-profil-piste').value = profile.piste || 'Piste A';
        var cn = document.getElementById('laveur-card-nom'), cp = document.getElementById('laveur-card-piste');
        if (cn) cn.innerText = profile.nom || (currentUser && currentUser.fullName) || '';
        if (cp) cp.innerText = profile.piste || 'Piste A';
    }
}
var formProfilLaveur = document.getElementById('form-profil-laveur');
if (formProfilLaveur) {
    formProfilLaveur.addEventListener('submit', function(e) {
        e.preventDefault();
        var n = document.getElementById('laveur-profil-nom').value.trim();
        var p = document.getElementById('laveur-profil-piste').value;
        var currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        var laveurs = getLaveurs();
        var index = laveurs.findIndex(function(lav) { return currentUser && (lav.userId === currentUser.id || lav.username === currentUser.username); });
        if (index !== -1) {
            laveurs[index].nom = n;
            laveurs[index].piste = p;
            saveLaveurs(laveurs);
        } else {
            localStorage.setItem(STORAGE_PROFIL_LAVEUR, JSON.stringify({ nom: n, piste: p }));
        }
        var cn = document.getElementById('laveur-card-nom'), cp = document.getElementById('laveur-card-piste');
        if (cn) cn.innerText = n;
        if (cp) cp.innerText = p;
        showAlert('Profil laveur mis a jour !', 'success');
    });
}


// ============================================================
// EVENT DELEGATION - Gere tous les clics data-action
// ============================================================
document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var code = btn.getAttribute('data-code');
    var notifId = btn.getAttribute('data-notif-id');
    if (action === 'validate' && code) validerLavage(code);
    else if (action === 'notify-client' && code) informerClient(code);
    else if (action === 'commencer' && code) commencerLavage(code);
    else if (action === 'terminer' && code) terminerLavage(code);
    else if (action === 'mark-read' && notifId) marquerLue(parseInt(notifId));
    else if (action === 'prepare-assign') preparerAssignation(parseInt(btn.getAttribute('data-laveur-id')));
    else if (action === 'delete-laveur') supprimerLaveur(parseInt(btn.getAttribute('data-laveur-id')));
    else if (action === 'delete-user') supprimerUser(parseInt(btn.getAttribute('data-user-index')));
    else if (action === 'reset-user-password') reinitialiserMotDePasse(parseInt(btn.getAttribute('data-user-index')));
});

// SYNCHRO MULTI-ONGLETS
window.addEventListener('storage', function(e) {
    if (!e.key) return;
    if (e.key === STORAGE_QUEUE || e.key === STORAGE_LAVEURS || e.key === STORAGE_NOTIFICATIONS || e.key === STORAGE_TARIFFS) {
        if (document.getElementById('table-commandes-body')) afficherRegistreCommandes();
        if (document.getElementById('container-laveurs')) afficherLaveurs();
        if (document.getElementById('piste-container')) chargerPisteLaveur();
        if (document.getElementById('notifications-container')) chargerNotifications();
        if (document.getElementById('pending-validation-container')) afficherValidationsEnAttente();
        if (document.getElementById('tariff-grid-container')) afficherGrilleTarifaire();
    }
});
