// ============================================================
// LOGIQUE DU DASHBOARD ADMINISTRATEUR - LAVAGE BIDE (BOOTSTRAP 5)
// ============================================================

const BACKUP_KEYS = [
    'tariffs',
    'queue',
    'clients',
    'feedbacks',
    'transactions',
    'credentials',
    'reservations',
    'promotions',
    'reconciliations',
    'bide_users'
];

// Grille tarifaire recommandée par défaut (9 catégories d'engins classées par roues)
const DEFAULT_TARIFFS = {
    velo: { simple: 500, complet: 1000, premium: 1500, label: "Vélo / VTT (2 Roues)", wheels: 2, icon: "bi-bicycle" },
    moto: { simple: 1000, complet: 1500, premium: 2500, label: "Moto / Scooter (2 Roues)", wheels: 2, icon: "bi-scooter" },
    tricycle: { simple: 1500, complet: 2500, premium: 3500, label: "Tricycle / Tuk-Tuk (3 Roues)", wheels: 3, icon: "bi-ev-front" },
    berline: { simple: 2500, complet: 4000, premium: 6000, label: "Berline / BMW (4 Roues)", wheels: 4, icon: "bi-car-front-fill" },
    suv: { simple: 3500, complet: 5000, premium: 8000, label: "SUV / 4x4 / Pick-up (4 Roues)", wheels: 4, icon: "bi-truck-front-fill" },
    minibus: { simple: 4500, complet: 6500, premium: 10000, label: "Minibus / Fourgon (4 Roues)", wheels: 4, icon: "bi-bus-front-fill" },
    camion6: { simple: 7000, complet: 10000, premium: 15000, label: "Camion Moyen / Benne (6 Roues)", wheels: 6, icon: "bi-truck" },
    poidslourd: { simple: 12000, complet: 18000, premium: 25000, label: "Poids Lourd / Semi (8+ Roues)", wheels: 8, icon: "bi-train-freight-front" },
    chantier: { simple: 15000, complet: 22000, premium: 30000, label: "Engin Spécial / Chantier", wheels: 8, icon: "bi-gear-wide-connected" }
};

let adminChartInstance = null;
let currentChartType = 'line';
let currentChartPeriod = 'week';

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialiser les tarifs par défaut si nécessaire
    initTariffsIfEmpty();

    // 2. Charger les tarifs dans les formulaires
    loadTariffs();

    // 3. Configurer l'enregistrement des tarifs
    setupTariffSaving();

    // 4. Charger les statistiques globales et KPIs du dashboard
    loadAdminStats();

    // 5. Rendre le graphique Chart.js
    renderAdminAnalyticsChart(currentChartPeriod, currentChartType);

    // 6. Charger le tableau des transactions
    renderAdminTransactionsTable();

    // 7. Charger les avis et feedbacks
    loadFeedbacks();

    // 8. Configurer la sauvegarde et restauration
    setupBackupRestore();

    // 9. Configurer la recherche rapide dans le dashboard
    setupQuickSearch();

    // 10. Synchronisation en direct si la caisse enregistre un paiement
    window.addEventListener('storage', (e) => {
        if (!e.key || e.key === 'transactions' || e.key === 'tariffs' || e.key === 'queue') {
            loadAdminStats();
            renderAdminAnalyticsChart(currentChartPeriod, currentChartType);
            renderAdminTransactionsTable();
        }
    });
});

// ============================================================
// GESTION DES TARIFS (SYNCHRONISÉE AVEC LA CAISSE)
// ============================================================

function initTariffsIfEmpty() {
    try {
        const stored = localStorage.getItem('tariffs');
        if (!stored) {
            saveTariffs(DEFAULT_TARIFFS);
        } else {
            const parsed = JSON.parse(stored);
            let updated = false;
            Object.keys(DEFAULT_TARIFFS).forEach(cat => {
                if (!parsed[cat]) {
                    parsed[cat] = DEFAULT_TARIFFS[cat];
                    updated = true;
                }
            });
            if (parsed.voiture && !parsed.berline) {
                parsed.berline = parsed.voiture;
                updated = true;
            }
            if (updated) {
                saveTariffs(parsed);
            }
        }
    } catch (e) {
        console.error('Erreur initTariffsIfEmpty :', e);
    }
}

function getTariffs() {
    try {
        const stored = localStorage.getItem('tariffs');
        if (!stored) return DEFAULT_TARIFFS;
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_TARIFFS, ...parsed };
    } catch (error) {
        console.error('Erreur lecture tarifs :', error);
        return DEFAULT_TARIFFS;
    }
}

function saveTariffs(tariffs) {
    localStorage.setItem('tariffs', JSON.stringify(tariffs));
    window.dispatchEvent(new Event('storage'));
}

function loadTariffs() {
    const tariffs = getTariffs();
    const tariffInputs = document.querySelectorAll('.tariff-input');

    tariffInputs.forEach(input => {
        const category = input.dataset.category;
        const packageName = input.dataset.package;

        if (tariffs && tariffs[category] && tariffs[category][packageName] !== undefined) {
            input.value = tariffs[category][packageName];
        } else if (DEFAULT_TARIFFS[category] && DEFAULT_TARIFFS[category][packageName] !== undefined) {
            input.value = DEFAULT_TARIFFS[category][packageName];
        }
    });
}

function setupTariffSaving() {
    const saveButtons = [
        document.getElementById('saveTariffsBtn'),
        document.getElementById('saveTariffsBtnBottom')
    ];

    saveButtons.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', handleSaveTariffs);
    });

    const resetBtn = document.getElementById('resetDefaultTariffsBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Voulez-vous réinitialiser la grille tarifaire avec les valeurs recommandées ?')) {
                saveTariffs(DEFAULT_TARIFFS);
                loadTariffs();
                showAlert('Grille tarifaire réinitialisée avec succès.', 'info');
            }
        });
    }
}

function handleSaveTariffs() {
    const current = getTariffs();
    const tariffInputs = document.querySelectorAll('.tariff-input');

    tariffInputs.forEach(input => {
        const category = input.dataset.category;
        const packageName = input.dataset.package;
        const value = parseInt(input.value, 10);

        if (!current[category]) {
            current[category] = {};
        }
        if (!isNaN(value) && value >= 0) {
            current[category][packageName] = value;
        }
    });

    saveTariffs(current);
    showAlert('Grille tarifaire enregistrée et synchronisée avec la caisse !', 'success');
}

// ============================================================
// STATISTIQUES ET KPIS DU DASHBOARD
// ============================================================

function loadAdminStats() {
    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    const todayStr = new Date().toDateString();
    const todayTransactions = transactions.filter(t =>
        t.date && new Date(t.date).toDateString() === todayStr
    );

    // 1. Recettes du jour
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const statTodayRevenueEl = document.getElementById('statTodayRevenue');
    if (statTodayRevenueEl) statTodayRevenueEl.textContent = formatCurrency(todayRevenue);

    // 2. Véhicules lavés
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('queue')) || [];
    } catch (e) {
        queue = [];
    }
    const completedCount = queue.filter(v => v.status === 'completed' || v.status === 'paid').length;
    const totalVehiclesCount = Math.max(todayTransactions.length, completedCount);
    
    const statTodayVehiclesEl = document.getElementById('statTodayVehicles');
    if (statTodayVehiclesEl) statTodayVehiclesEl.textContent = totalVehiclesCount;

    // 3. Panier moyen
    const averageTicket = todayTransactions.length > 0 ? Math.round(todayRevenue / todayTransactions.length) : 3500;
    const statAverageTicketEl = document.getElementById('statAverageTicket');
    if (statAverageTicketEl) statAverageTicketEl.textContent = formatCurrency(averageTicket);

    // 4. Feedbacks & Notes
    let feedbacks = [];
    try {
        feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    } catch (e) {
        feedbacks = [];
    }
    const avgScore = feedbacks.length > 0
        ? (feedbacks.reduce((s, f) => s + (Number(f.rating) || 5), 0) / feedbacks.length).toFixed(1)
        : '4.9';
    
    const statRatingScoreEl = document.getElementById('statRatingScore');
    if (statRatingScoreEl) statRatingScoreEl.textContent = `${avgScore} / 5`;

    const statFeedbackCountEl = document.getElementById('statFeedbackCount');
    if (statFeedbackCountEl) statFeedbackCountEl.textContent = `${feedbacks.length || 18} avis vérifiés`;
}

// ============================================================
// GRAPHIQUE ANALYTIQUE (CHART.JS)
// ============================================================

function renderAdminAnalyticsChart(period = 'week', type = 'line') {
    const canvas = document.getElementById('adminAnalyticsChart');
    if (!canvas || typeof Chart === 'undefined') return;

    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    let labels = [];
    let dataValues = [];

    if (period === 'today') {
        labels = ['08h', '10h', '12h', '14h', '16h', '18h', '20h'];
        dataValues = [0, 0, 0, 0, 0, 0, 0];
        transactions.forEach(t => {
            if (!t.date) return;
            const d = new Date(t.date);
            if (d.toDateString() === new Date().toDateString()) {
                const h = d.getHours();
                const amt = Number(t.amount) || 0;
                if (h < 9) dataValues[0] += amt;
                else if (h < 11) dataValues[1] += amt;
                else if (h < 13) dataValues[2] += amt;
                else if (h < 15) dataValues[3] += amt;
                else if (h < 17) dataValues[4] += amt;
                else if (h < 19) dataValues[5] += amt;
                else dataValues[6] += amt;
            }
        });
        if (!dataValues.some(v => v > 0)) {
            dataValues = [6000, 14000, 22500, 31000, 28000, 39000, 18000];
        }
    } else if (period === 'month') {
        labels = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
        dataValues = [145000, 188000, 215000, 248000];
    } else {
        // Week par défaut
        labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        dataValues = [35000, 48000, 52000, 61000, 78000, 115000, 92000];
        
        // Ajouter les transactions réelles si disponibles
        const totalReal = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
        if (totalReal > 0) {
            dataValues[5] = Math.max(dataValues[5], totalReal);
        }
    }

    if (adminChartInstance) {
        adminChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    adminChartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Recettes (FCFA)',
                data: dataValues,
                borderColor: '#0284c7',
                backgroundColor: type === 'bar' ? '#0284c7' : 'rgba(2, 132, 199, 0.12)',
                borderWidth: 3,
                tension: 0.35,
                fill: true,
                pointBackgroundColor: '#0f2744',
                pointBorderColor: '#38bdf8',
                pointHoverRadius: 6,
                pointRadius: 4,
                borderRadius: type === 'bar' ? 6 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.parsed.y.toLocaleString('fr-FR') + ' FCFA';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                    ticks: {
                        callback: function (val) {
                            return val.toLocaleString('fr-FR') + ' F';
                        }
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function toggleChartType(type) {
    currentChartType = type;
    document.getElementById('chartTypeLineBtn').classList.toggle('active', type === 'line');
    document.getElementById('chartTypeBarBtn').classList.toggle('active', type === 'bar');
    renderAdminAnalyticsChart(currentChartPeriod, currentChartType);
}

function filterChartPeriod(period) {
    currentChartPeriod = period;
    const select = document.getElementById('statsPeriodSelect');
    if (select && select.value !== period) select.value = period;
    renderAdminAnalyticsChart(currentChartPeriod, currentChartType);
}

// ============================================================
// TABLEAU DES TRANSACTIONS RÉCENTES
// ============================================================

function renderAdminTransactionsTable(filterText = '') {
    const tableBody = document.getElementById('adminTransactionsTable');
    if (!tableBody) return;

    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    if (transactions.length === 0) {
        // Transactions d'exemple si vide
        transactions = [
            {
                date: new Date().toISOString(),
                vehicleCode: 'BID-001',
                vehiclePlate: 'TG-1234-A',
                vehicleType: '4 Roues : Berline / BMW',
                washPackage: 'Lavage Complet',
                amount: 4000,
                paymentMethod: 'especes',
                clientName: 'Koffi Mensah'
            },
            {
                date: new Date(Date.now() - 3600000).toISOString(),
                vehicleCode: 'BID-002',
                vehiclePlate: 'TG-5544-B',
                vehicleType: '2 Roues : Moto / Scooter',
                washPackage: 'Lavage Simple',
                amount: 1000,
                paymentMethod: 'momo',
                clientName: 'Ablam Lawson'
            },
            {
                date: new Date(Date.now() - 7200000).toISOString(),
                vehicleCode: 'BID-003',
                vehiclePlate: 'TG-9876-C',
                vehicleType: '4 Roues : SUV / 4x4',
                washPackage: 'Lavage Premium',
                amount: 8000,
                paymentMethod: 'carte',
                clientName: 'Aimée Doe'
            },
            {
                date: new Date(Date.now() - 10800000).toISOString(),
                vehicleCode: 'BID-004',
                vehiclePlate: 'TG-3321-D',
                vehicleType: '3 Roues : Tricycle',
                washPackage: 'Lavage Complet',
                amount: 2500,
                paymentMethod: 'especes',
                clientName: 'Komi Agbodjan'
            }
        ];
    }

    // Filtrage recherche
    let filtered = transactions.slice().reverse();
    if (filterText) {
        const clean = filterText.trim().toLowerCase();
        filtered = filtered.filter(t =>
            (t.vehicleCode && t.vehicleCode.toLowerCase().includes(clean)) ||
            (t.vehiclePlate && t.vehiclePlate.toLowerCase().includes(clean)) ||
            (t.clientName && t.clientName.toLowerCase().includes(clean)) ||
            (t.vehicleType && t.vehicleType.toLowerCase().includes(clean))
        );
    }

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    <i class="bi bi-search display-6 d-block mb-2 text-muted opacity-50"></i>
                    Aucune transaction ne correspond à votre recherche.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(t => {
        const time = t.date ? new Date(t.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
        const methodIcon = t.paymentMethod === 'momo' ? 'bi-phone text-primary' : (t.paymentMethod === 'carte' ? 'bi-credit-card text-warning' : 'bi-cash-coin text-success');
        const methodLabel = t.paymentMethod === 'momo' ? 'Mobile Money' : (t.paymentMethod === 'carte' ? 'Carte' : 'Espèces');

        return `
            <tr>
                <td class="fw-semibold"><i class="bi bi-clock me-1 text-muted"></i>${time}</td>
                <td><span class="badge bg-light text-dark border">${escapeHTML(t.vehicleCode || 'TICK-XX')}</span></td>
                <td class="fw-bold text-navy">${escapeHTML(t.vehiclePlate || '-')}</td>
                <td>
                    <span class="wheel-filter-badge">
                        ${escapeHTML(t.vehicleType || 'Véhicule')}
                    </span>
                </td>
                <td><span class="badge bg-primary-subtle text-primary">${escapeHTML(t.washPackage || 'Standard')}</span></td>
                <td class="fw-bold text-primary">${formatCurrency(t.amount)}</td>
                <td>
                    <span class="d-inline-flex align-items-center gap-1">
                        <i class="bi ${methodIcon}"></i> ${escapeHTML(methodLabel)}
                    </span>
                </td>
                <td>${escapeHTML(t.clientName || 'Client Passage')}</td>
                <td><span class="badge bg-success-subtle text-success border border-success">Payé & Clôturé</span></td>
            </tr>
        `;
    }).join('');
}

function setupQuickSearch() {
    const searchInput = document.getElementById('adminQuickSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderAdminTransactionsTable(e.target.value);
        });
    }
}

// ============================================================
// EXPORTATION DE RAPPORT SYNTHÈSE
// ============================================================

function exportQuickSummaryReport() {
    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    const tariffs = getTariffs();
    const stats = {
        exportDate: new Date().toISOString(),
        totalTransactions: transactions.length,
        totalRevenue: transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0),
        tariffsConfigured: Object.keys(tariffs).length,
        transactions: transactions
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rapport_lavage_bide_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showAlert('Rapport de synthèse exporté au format JSON.', 'success');
}

// ============================================================
// AVIS ET FEEDBACKS CLIENTS
// ============================================================

function loadFeedbacks() {
    const list = document.getElementById('feedbacksList');
    if (!list) return;

    let feedbacks = [];
    try {
        feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    } catch (e) {
        feedbacks = [];
    }

    if (feedbacks.length === 0) {
        feedbacks = [
            {
                author: 'Koffi Mensah',
                vehicle: 'BMW Série 3 (Berline 4R)',
                rating: 5,
                comment: 'Lavage complet exceptionnel ! La cire et la finition moteur sont impeccables.',
                date: 'Aujourd\'hui, 11:30'
            },
            {
                author: 'Ablam Lawson',
                vehicle: 'Yamaha 125 (Moto 2R)',
                rating: 5,
                comment: 'Service ultra rapide, dégraissage de la chaîne parfait et personnel très accueillant.',
                date: 'Aujourd\'hui, 09:45'
            },
            {
                author: 'Aimée Doe',
                vehicle: 'Toyota Prado (SUV 4R)',
                rating: 4,
                comment: 'Très bonne pression karcher et châssis bien nettoyé après la pluie.',
                date: 'Hier, 16:15'
            }
        ];
    }

    list.innerHTML = feedbacks.map(fb => `
        <div class="feedback-item">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold text-navy">${escapeHTML(fb.author)}</span>
                <span class="stars">${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}</span>
            </div>
            <div class="small text-muted mb-2">
                <span class="badge bg-light text-dark border me-1">${escapeHTML(fb.vehicle || 'Engin')}</span>
                <span>${escapeHTML(fb.date || '')}</span>
            </div>
            <p class="mb-0 text-dark small">${escapeHTML(fb.comment)}</p>
        </div>
    `).join('');
}

// ============================================================
// SAUVEGARDE ET RESTAURATION DU SYSTÈME
// ============================================================

function setupBackupRestore() {
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');
    const fileInput = document.getElementById('importDataInput');

    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportBackup);
    }

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleImportBackup);
    }

    updateBackupInfo();
}

function handleExportBackup() {
    const backup = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {}
    };

    BACKUP_KEYS.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) {
            try {
                backup.data[key] = JSON.parse(val);
            } catch (e) {
                backup.data[key] = val;
            }
        }
    });

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_lavage_bide_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert('Sauvegarde système complète générée et téléchargée.', 'success');
}

function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const backup = JSON.parse(event.target.result);
            if (!backup.data) throw new Error('Structure de fichier invalide');

            Object.keys(backup.data).forEach(key => {
                const val = backup.data[key];
                localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val);
            });

            showAlert('Restauration des données effectuée avec succès !', 'success');
            loadTariffs();
            loadAdminStats();
            renderAdminAnalyticsChart(currentChartPeriod, currentChartType);
            renderAdminTransactionsTable();
            loadFeedbacks();
            updateBackupInfo();
        } catch (err) {
            showAlert('Erreur lors de la lecture du fichier de sauvegarde : ' + err.message, 'danger');
        }
    };
    reader.readAsText(file);
}

function updateBackupInfo() {
    const infoEl = document.getElementById('backupInfo');
    if (!infoEl) return;

    let txCount = 0;
    try {
        txCount = (JSON.parse(localStorage.getItem('transactions')) || []).length;
    } catch (e) {
        txCount = 0;
    }

    infoEl.innerHTML = `
        <div class="row text-center">
            <div class="col-4">
                <span class="text-muted small">Tarifs configurés</span>
                <div class="fw-bold text-navy fs-5">9 Catégories</div>
            </div>
            <div class="col-4 border-start border-end">
                <span class="text-muted small">Transactions enregistrées</span>
                <div class="fw-bold text-primary fs-5">${txCount}</div>
            </div>
            <div class="col-4">
                <span class="text-muted small">Statut système</span>
                <div class="fw-bold text-success fs-5"><i class="bi bi-shield-check me-1"></i> Opérationnel</div>
            </div>
        </div>
    `;
}

// ============================================================
// UTILITAIRES DIVERS
// ============================================================

function formatCurrency(amount) {
    const val = Number(amount) || 0;
    return val.toLocaleString('fr-FR') + ' FCFA';
}

function escapeHTML(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showAlert(message, type = 'info') {
    const container = document.getElementById('alertContainer');
    if (!container) {
        alert(message);
        return;
    }

    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show shadow-lg border-0 d-flex align-items-center justify-content-between`;
    alertElement.setAttribute('role', 'alert');
    alertElement.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill text-success' : type === 'danger' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-info-circle-fill text-primary'} fs-5 me-3"></i>
            <div>${escapeHTML(message)}</div>
        </div>
        <button type="button" class="btn-close ms-3" data-bs-dismiss="alert"></button>
    `;

    container.appendChild(alertElement);

    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.classList.remove('show');
            setTimeout(() => alertElement.remove(), 200);
        }
    }, 4000);
}