// ============================================================
// CONFIGURATION & CONSTANTES CAISSE BIDÈ
// ============================================================

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

let selectedPaymentMethod = 'especes';
let currentSearchedVehicle = null;
let caisseRevenueChartInstance = null;

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les données de démo et tarifs si vides
    initDemoQueueIfEmpty();

    // Charger le tableau de bord de la caisse
    loadCaisseDashboard();

    // Événements de recherche et formulaires
    setupCaisseForms();

    // Événements de méthodes de paiement
    setupPaymentMethodListeners();

    // Synchronisation en temps réel si les tarifs changent dans l'admin
    window.addEventListener('storage', (e) => {
        if (!e.key || e.key === 'tariffs' || e.key === 'transactions' || e.key === 'queue') {
            loadCaisseDashboard();
        }
    });
});

// ============================================================
// GESTION SYNCHRONISÉE DES TARIFS
// ============================================================

function getTariffs() {
    try {
        const stored = localStorage.getItem('tariffs');
        if (!stored) return DEFAULT_TARIFFS;
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_TARIFFS, ...parsed };
    } catch (e) {
        console.error('Erreur lecture tarifs :', e);
        return DEFAULT_TARIFFS;
    }
}

function getCategoryInfo(categoryKey) {
    const key = (categoryKey || '').toLowerCase();
    if (key === 'voiture') return DEFAULT_TARIFFS.berline;
    return DEFAULT_TARIFFS[key] || {
        label: categoryKey || 'Véhicule',
        wheels: 4,
        icon: 'bi-car-front'
    };
}

function calculateVehiclePrice(categoryKey, packageKey) {
    const tariffs = getTariffs();
    let cat = (categoryKey || 'berline').toLowerCase();
    if (cat === 'voiture') cat = 'berline';
    const pkg = (packageKey || 'simple').toLowerCase();

    if (tariffs[cat] && tariffs[cat][pkg] !== undefined) {
        return Number(tariffs[cat][pkg]);
    }
    if (DEFAULT_TARIFFS[cat] && DEFAULT_TARIFFS[cat][pkg] !== undefined) {
        return Number(DEFAULT_TARIFFS[cat][pkg]);
    }
    return 2500;
}

// ============================================================
// FILE D'ATTENTE & INITIALISATION DÉMO
// ============================================================

function initDemoQueueIfEmpty() {
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('queue')) || [];
    } catch (e) {
        queue = [];
    }

    if (queue.length === 0) {
        queue = [
            {
                id: 1,
                code: 'BID-001',
                plate: 'TG-1234-A',
                vehicleTypeKey: 'berline',
                vehicleType: '4 Roues : Berline / BMW',
                washPackageKey: 'complet',
                washPackage: 'Lavage Complet',
                status: 'completed',
                clientName: 'Koffi Mensah',
                clientPhone: '+228 90 12 34 56',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                code: 'BID-002',
                plate: 'TG-5544-B',
                vehicleTypeKey: 'moto',
                vehicleType: '2 Roues : Moto / Scooter',
                washPackageKey: 'simple',
                washPackage: 'Lavage Simple',
                status: 'completed',
                clientName: 'Ablam Lawson',
                clientPhone: '+228 91 23 45 67',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                code: 'BID-003',
                plate: 'TG-9876-C',
                vehicleTypeKey: 'suv',
                vehicleType: '4 Roues : SUV / 4x4 / Pick-up',
                washPackageKey: 'premium',
                washPackage: 'Lavage Premium',
                status: 'completed',
                clientName: 'Aimée Doe',
                clientPhone: '+228 92 34 56 78',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                code: 'BID-004',
                plate: 'TG-3321-D',
                vehicleTypeKey: 'tricycle',
                vehicleType: '3 Roues : Tricycle / Tuk-Tuk',
                washPackageKey: 'complet',
                washPackage: 'Lavage Complet',
                status: 'completed',
                clientName: 'Komi Agbodjan',
                clientPhone: '+228 93 45 67 89',
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                code: 'BID-005',
                plate: 'TG-7711-E',
                vehicleTypeKey: 'velo',
                vehicleType: '2 Roues : Vélo / VTT',
                washPackageKey: 'simple',
                washPackage: 'Lavage Simple',
                status: 'completed',
                clientName: 'Folly G',
                clientPhone: '+228 90 99 88 77',
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                code: 'BID-006',
                plate: 'TG-4400-F',
                vehicleTypeKey: 'camion6',
                vehicleType: '6 Roues : Camion Moyen / Benne',
                washPackageKey: 'complet',
                washPackage: 'Lavage Complet',
                status: 'completed',
                clientName: 'Transport Express',
                clientPhone: '+228 96 11 22 33',
                createdAt: new Date().toISOString()
            },
            {
                id: 7,
                code: 'BID-007',
                plate: 'TG-6622-G',
                vehicleTypeKey: 'poidslourd',
                vehicleType: '8+ Roues : Poids Lourd / Semi',
                washPackageKey: 'simple',
                washPackage: 'Lavage Simple',
                status: 'completed',
                clientName: 'Logistique Sahel',
                clientPhone: '+228 97 22 33 44',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('queue', JSON.stringify(queue));
    }
}

function searchVehicle(query) {
    if (!query) return null;
    const cleanQuery = query.trim().toUpperCase();
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('queue')) || [];
    } catch (e) {
        queue = [];
    }

    const vehicle = queue.find(v =>
        (v.code && v.code.toUpperCase() === cleanQuery) ||
        (v.plate && v.plate.toUpperCase().replace(/\s+/g, '') === cleanQuery.replace(/\s+/g, ''))
    );

    if (vehicle) {
        const catKey = vehicle.vehicleTypeKey || 'berline';
        const pkgKey = vehicle.washPackageKey || 'simple';
        const price = calculateVehiclePrice(catKey, pkgKey);
        const catInfo = getCategoryInfo(catKey);

        return {
            ...vehicle,
            price: price,
            vehicleType: catInfo.label,
            vehicleIcon: catInfo.icon,
            wheels: catInfo.wheels
        };
    }

    return null;
}

// ============================================================
// DASHBOARD & STATISTIQUES CAISSE
// ============================================================

function getGlobalStats() {
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

    const todayRevenue = todayTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('queue')) || [];
    } catch (e) {
        queue = [];
    }
    const completedCount = queue.filter(v => v.status === 'completed' || v.status === 'paid').length;

    return {
        todayRevenue,
        todayTransactions,
        allTransactions: transactions,
        queueStats: {
            completed: completedCount
        }
    };
}

function loadCaisseDashboard() {
    const stats = getGlobalStats();
    const todayTransactions = stats.todayTransactions;

    // 1. Statistiques principales
    const todayRevenueEl = document.getElementById('todayRevenue');
    if (todayRevenueEl) todayRevenueEl.textContent = formatCurrency(stats.todayRevenue);

    const todayTxEl = document.getElementById('todayTransactions');
    if (todayTxEl) todayTxEl.textContent = todayTransactions.length;

    const pendingPaymentsEl = document.getElementById('pendingPayments');
    if (pendingPaymentsEl) pendingPaymentsEl.textContent = stats.queueStats.completed;

    const todayClientsEl = document.getElementById('todayClients');
    if (todayClientsEl) todayClientsEl.textContent = todayTransactions.length;

    // 2. Modes de paiement
    const cashTx = todayTransactions.filter(t => (t.paymentMethod || 'especes') === 'especes');
    const momoTx = todayTransactions.filter(t => t.paymentMethod === 'momo');
    const cardTx = todayTransactions.filter(t => t.paymentMethod === 'carte');

    const cashSum = cashTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const momoSum = momoTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const cardSum = cardTx.reduce((s, t) => s + (Number(t.amount) || 0), 0);

    const cashTotalEl = document.getElementById('cashTotal');
    if (cashTotalEl) cashTotalEl.textContent = formatCurrency(cashSum);
    const cashCountEl = document.getElementById('cashCount');
    if (cashCountEl) cashCountEl.textContent = cashTx.length;

    const momoTotalEl = document.getElementById('momoTotal');
    if (momoTotalEl) momoTotalEl.textContent = formatCurrency(momoSum);
    const momoCountEl = document.getElementById('momoCount');
    if (momoCountEl) momoCountEl.textContent = momoTx.length;

    const cardTotalEl = document.getElementById('cardTotal');
    if (cardTotalEl) cardTotalEl.textContent = formatCurrency(cardSum);
    const cardCountEl = document.getElementById('cardCount');
    if (cardCountEl) cardCountEl.textContent = cardTx.length;

    // 3. Tableau des transactions
    renderTransactionsTable(todayTransactions);

    // 4. Historique des reçus
    loadReceiptHistory();

    // 5. Graphique des recettes
    renderCaisseRevenueChart();

    // 6. Rapprochement de caisse
    updateCaisseReconciliationUI(cashSum, momoSum, cardSum);
}

function renderTransactionsTable(transactions) {
    const tableBody = document.getElementById('transactionsTable');
    if (!tableBody) return;

    if (!transactions || transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-receipt display-6 d-block mb-2 text-muted opacity-50"></i>
                    Aucune transaction enregistrée aujourd'hui.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = transactions.slice().reverse().map(t => {
        const time = t.date ? new Date(t.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
        const methodIcon = getPaymentMethodIcon(t.paymentMethod || 'especes');
        const methodLabel = getPaymentMethodLabel(t.paymentMethod || 'especes');

        return `
            <tr>
                <td class="fw-semibold"><i class="bi bi-clock me-1 text-muted"></i>${time}</td>
                <td><span class="badge bg-light text-dark border">${escapeHTML(t.vehicleCode || 'TICK-XX')}</span></td>
                <td class="fw-bold">${escapeHTML(t.vehiclePlate || '-')}</td>
                <td>
                    <span class="wheel-tag">
                        <i class="bi ${escapeHTML(t.vehicleIcon || 'bi-car-front')}"></i>
                        ${escapeHTML(t.vehicleType || 'Engin')}
                    </span>
                </td>
                <td><span class="badge bg-primary-subtle text-primary">${escapeHTML(t.washPackage || 'Standard')}</span></td>
                <td class="fw-bold text-primary">${formatCurrency(t.amount)}</td>
                <td>
                    <span class="d-inline-flex align-items-center gap-1">
                        <i class="bi ${methodIcon}"></i> ${escapeHTML(methodLabel)}
                    </span>
                </td>
                <td><span class="badge bg-success-subtle text-success border border-success">Payé</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewReceiptByCode('${escapeHTML(t.vehicleCode)}')">
                        <i class="bi bi-receipt"></i> Reçu
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================================
// FORMULAIRES & LOGIQUE D'ENCAISSEMENT
// ============================================================

function setupCaisseForms() {
    // Formulaire de recherche
    const ticketSearchForm = document.getElementById('ticketSearchForm');
    if (ticketSearchForm) {
        ticketSearchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const searchTerm = document.getElementById('searchInput').value;
            handleVehicleSelection(searchTerm);
        });
    }

    // Bouton Démo rapide
    const quickDemoBtn = document.getElementById('quickDemoBtn');
    if (quickDemoBtn) {
        quickDemoBtn.addEventListener('click', () => {
            const demoCodes = ['BID-001', 'BID-002', 'BID-003', 'BID-004', 'BID-005', 'BID-006', 'BID-007'];
            const randomCode = demoCodes[Math.floor(Math.random() * demoCodes.length)];
            document.getElementById('searchInput').value = randomCode;
            handleVehicleSelection(randomCode);
        });
    }

    // Formulaire création rapide
    const quickTicketForm = document.getElementById('quickTicketForm');
    if (quickTicketForm) {
        quickTicketForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const catKey = document.getElementById('quickVehicleCategory').value;
            const pkgKey = document.getElementById('quickWashPackage').value;
            const plate = document.getElementById('quickPlate').value.trim() || `TG-${Math.floor(1000 + Math.random() * 9000)}-Z`;
            const clientName = document.getElementById('quickClientName').value.trim() || 'Client Passage';

            const newCode = `BID-${Math.floor(100 + Math.random() * 900)}`;
            const catInfo = getCategoryInfo(catKey);
            const price = calculateVehiclePrice(catKey, pkgKey);

            const pkgLabels = {
                simple: 'Lavage Simple',
                complet: 'Lavage Complet',
                premium: 'Lavage Premium'
            };

            const newVehicle = {
                id: Date.now(),
                code: newCode,
                plate: plate,
                vehicleTypeKey: catKey,
                vehicleType: catInfo.label,
                vehicleIcon: catInfo.icon,
                wheels: catInfo.wheels,
                washPackageKey: pkgKey,
                washPackage: pkgLabels[pkgKey] || 'Lavage Complet',
                price: price,
                status: 'completed',
                clientName: clientName,
                clientPhone: '',
                createdAt: new Date().toISOString()
            };

            // Ajouter à la file
            let queue = [];
            try {
                queue = JSON.parse(localStorage.getItem('queue')) || [];
            } catch (err) {
                queue = [];
            }
            queue.push(newVehicle);
            localStorage.setItem('queue', JSON.stringify(queue));

            // Sélectionner pour encaissement
            displayVehicleDetails(newVehicle);
            showAlert(`Ticket ${newCode} (${catInfo.label}) créé et prêt à être encaissé.`, 'success');
        });
    }

    // Calcul de la monnaie en direct lors de la frappe
    const amountGivenInput = document.getElementById('amountGiven');
    if (amountGivenInput) {
        amountGivenInput.addEventListener('input', updateChangeDisplay);
    }

    // Bouton de validation d'encaissement
    const calculateChangeBtn = document.getElementById('calculateChangeBtn');
    if (calculateChangeBtn) {
        calculateChangeBtn.addEventListener('click', handlePaymentExecution);
    }

    // Bouton de rafraîchissement graphique
    const refreshChartBtn = document.getElementById('refreshChartBtn');
    if (refreshChartBtn) {
        refreshChartBtn.addEventListener('click', () => {
            renderCaisseRevenueChart();
            showAlert('Graphique mis à jour.', 'info');
        });
    }

    // Bouton de rapprochement
    const reconciliationBtn = document.getElementById('reconciliationBtn');
    if (reconciliationBtn) {
        reconciliationBtn.addEventListener('click', handleReconciliation);
    }
}

function handleVehicleSelection(searchTerm) {
    const vehicle = searchVehicle(searchTerm);

    if (vehicle) {
        displayVehicleDetails(vehicle);
    } else {
        showAlert('Aucun ticket ou véhicule trouvé pour cette recherche.', 'warning');
        document.getElementById('searchResultCard').classList.add('d-none');
        document.getElementById('searchPlaceholderCard').classList.remove('d-none');
        document.getElementById('calculatorCard').classList.add('d-none');
        currentSearchedVehicle = null;
    }
}

function displayVehicleDetails(vehicle) {
    currentSearchedVehicle = vehicle;

    // Afficher carte info
    document.getElementById('searchResultCard').classList.remove('d-none');
    document.getElementById('searchPlaceholderCard').classList.add('d-none');
    document.getElementById('resultCode').textContent = vehicle.code;
    document.getElementById('resultPlate').textContent = vehicle.plate;
    document.getElementById('resultType').innerHTML = `
        <span class="wheel-tag"><i class="bi ${vehicle.vehicleIcon || 'bi-car-front'}"></i> ${vehicle.vehicleType}</span>
    `;
    document.getElementById('resultPackage').textContent = vehicle.washPackage;
    document.getElementById('resultAmount').textContent = formatCurrency(vehicle.price);
    document.getElementById('resultStatus').textContent = getStatusLabel(vehicle.status);

    // Afficher calculatrice
    const calcCard = document.getElementById('calculatorCard');
    calcCard.classList.remove('d-none');
    document.getElementById('amountToPay').value = vehicle.price;

    // Pré-remplir client si existant
    if (vehicle.clientName) document.getElementById('clientFullName').value = vehicle.clientName;
    if (vehicle.clientPhone) document.getElementById('clientTel').value = vehicle.clientPhone;

    // Valeur donnée par défaut suggérée
    document.getElementById('amountGiven').value = vehicle.price;
    updateChangeDisplay();

    // Scroll vers la calculatrice
    calcCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateChangeDisplay() {
    const amountToPay = parseFloat(document.getElementById('amountToPay').value) || 0;
    const amountGiven = parseFloat(document.getElementById('amountGiven').value) || 0;
    const change = Math.max(0, amountGiven - amountToPay);
    const changeDisplay = document.getElementById('changeDisplay');

    if (changeDisplay) {
        changeDisplay.textContent = formatCurrency(change);
        if (amountGiven < amountToPay && amountGiven > 0) {
            changeDisplay.className = 'fs-3 fw-bold text-danger';
            changeDisplay.textContent = `Montant insuffisant (-${formatCurrency(amountToPay - amountGiven)})`;
        } else {
            changeDisplay.className = 'fs-3 fw-bold text-success';
        }
    }
}

function resetCalculator() {
    document.getElementById('calculatorCard').classList.add('d-none');
    document.getElementById('searchResultCard').classList.add('d-none');
    document.getElementById('searchPlaceholderCard').classList.remove('d-none');
    currentSearchedVehicle = null;
}

function handlePaymentExecution() {
    if (!currentSearchedVehicle) {
        showAlert('Veuillez sélectionner un véhicule avant d’encaisser.', 'warning');
        return;
    }

    const amountToPay = parseFloat(document.getElementById('amountToPay').value) || 0;
    const amountGiven = parseFloat(document.getElementById('amountGiven').value) || 0;
    const clientName = document.getElementById('clientFullName').value.trim() || currentSearchedVehicle.clientName || 'Client anonyme';
    const clientPhone = document.getElementById('clientTel').value.trim() || currentSearchedVehicle.clientPhone || '';

    if (isNaN(amountGiven) || amountGiven < amountToPay) {
        showAlert('Le montant versé est inférieur au montant à payer.', 'danger');
        return;
    }

    const change = amountGiven - amountToPay;

    let extraInfo = '';
    if (selectedPaymentMethod === 'momo') {
        extraInfo = document.getElementById('momoNumber').value.trim();
    } else if (selectedPaymentMethod === 'carte') {
        extraInfo = document.getElementById('cardReference').value.trim();
    }

    // Enregistrer la transaction
    const transaction = recordTransaction(
        currentSearchedVehicle,
        amountToPay,
        amountGiven,
        change,
        selectedPaymentMethod,
        clientName,
        clientPhone,
        extraInfo
    );

    // Mettre à jour l'état dans la queue
    markVehiclePaidInQueue(currentSearchedVehicle.code);

    // Générer et afficher le reçu dans le modal
    generateReceipt(transaction, currentSearchedVehicle);

    // Masquer la calculatrice et rafraîchir
    resetCalculator();
    loadCaisseDashboard();

    showAlert(`Encaissement de ${formatCurrency(amountToPay)} validé avec succès ! Reçu généré.`, 'success');
}

function markVehiclePaidInQueue(code) {
    try {
        let queue = JSON.parse(localStorage.getItem('queue')) || [];
        queue = queue.map(v => {
            if (v.code === code) {
                return { ...v, status: 'paid' };
            }
            return v;
        });
        localStorage.setItem('queue', JSON.stringify(queue));
    } catch (e) {
        console.error('Erreur markVehiclePaidInQueue :', e);
    }
}

function recordTransaction(vehicle, amount, given, change, method, clientName, clientPhone, extraInfo) {
    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    const transaction = {
        id: 'TX-' + Date.now(),
        date: new Date().toISOString(),
        vehicleCode: vehicle.code,
        vehiclePlate: vehicle.plate,
        vehicleType: vehicle.vehicleType,
        vehicleIcon: vehicle.vehicleIcon || 'bi-car-front',
        washPackage: vehicle.washPackage,
        amount: Number(amount),
        amountGiven: Number(given),
        change: Number(change),
        paymentMethod: method,
        clientName: clientName,
        clientPhone: clientPhone,
        extraInfo: extraInfo
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    return transaction;
}

// ============================================================
// MODAL & GESTION DES REÇUS
// ============================================================

function generateReceipt(transaction, vehicle) {
    const receiptModalEl = document.getElementById('receiptModal');
    const receiptContentEl = document.getElementById('receiptContent');

    if (!receiptContentEl) return;

    const receiptDate = new Date(transaction.date || Date.now()).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const methodLabel = getPaymentMethodLabel(transaction.paymentMethod);

    const receiptHtml = `
        <div class="receipt-header text-center">
            <img src="logo.jpg" alt="Logo Lavage BIDE" class="receipt-logo mb-2">
            <h4 class="fw-bold mb-0">LAVAGE BIDE</h4>
            <div class="small text-muted">Lavage Automobile & Moto Haute Pression</div>
            <div class="small">Lomé - Togo | Tel: +228 90 00 00 00</div>
            <div class="receipt-divider"></div>
            <div class="fw-bold">REÇU DE PAIEMENT : ${escapeHTML(transaction.id)}</div>
            <div class="small text-muted">${receiptDate}</div>
        </div>

        <div class="receipt-row">
            <span>Ticket :</span>
            <span class="fw-bold">${escapeHTML(transaction.vehicleCode)}</span>
        </div>
        <div class="receipt-row">
            <span>Immatriculation :</span>
            <span class="fw-bold">${escapeHTML(transaction.vehiclePlate)}</span>
        </div>
        <div class="receipt-row">
            <span>Catégorie :</span>
            <span>${escapeHTML(transaction.vehicleType)}</span>
        </div>
        <div class="receipt-row">
            <span>Formule de lavage :</span>
            <span class="fw-bold">${escapeHTML(transaction.washPackage)}</span>
        </div>
        <div class="receipt-row">
            <span>Client :</span>
            <span>${escapeHTML(transaction.clientName || 'Client anonyme')}</span>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-row fs-5 fw-bold text-dark">
            <span>TOTAL PAYÉ :</span>
            <span>${formatCurrency(transaction.amount)}</span>
        </div>
        <div class="receipt-row text-muted small">
            <span>Montant versé :</span>
            <span>${formatCurrency(transaction.amountGiven || transaction.amount)}</span>
        </div>
        <div class="receipt-row text-muted small">
            <span>Monnaie rendue :</span>
            <span>${formatCurrency(transaction.change || 0)}</span>
        </div>
        <div class="receipt-row text-muted small">
            <span>Mode de règlement :</span>
            <span>${escapeHTML(methodLabel)} ${transaction.extraInfo ? `(${escapeHTML(transaction.extraInfo)})` : ''}</span>
        </div>

        <div class="receipt-divider"></div>

        <div class="text-center small text-muted mt-3">
            <div>Merci de votre confiance et bonne route !</div>
            <div>*** Service Client BIDÈ ***</div>
        </div>
    `;

    receiptContentEl.innerHTML = receiptHtml;

    // Enregistrer dans l'historique des reçus
    saveReceiptToHistory(transaction);

    // Ouvrir le modal Bootstrap
    if (receiptModalEl && window.bootstrap) {
        const modal = new bootstrap.Modal(receiptModalEl);
        modal.show();
    }
}

function saveReceiptToHistory(transaction) {
    let receipts = [];
    try {
        receipts = JSON.parse(localStorage.getItem('receipts')) || [];
    } catch (e) {
        receipts = [];
    }
    receipts.push(transaction);
    localStorage.setItem('receipts', JSON.stringify(receipts));
}

function loadReceiptHistory() {
    const historyContainer = document.getElementById('receiptHistory');
    if (!historyContainer) return;

    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    if (transactions.length === 0) {
        historyContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-journal-x display-6 d-block mb-2 opacity-50"></i>
                Aucun reçu enregistré.
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = transactions.slice(-6).reverse().map(tx => {
        const time = tx.date ? new Date(tx.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
        return `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold text-navy">${escapeHTML(tx.vehicleCode)} — ${escapeHTML(tx.vehiclePlate)}</div>
                    <small class="text-muted">${escapeHTML(tx.vehicleType)} | ${time}</small>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-primary">${formatCurrency(tx.amount)}</div>
                    <button class="btn btn-sm btn-link text-decoration-none p-0" onclick="viewReceiptByCode('${escapeHTML(tx.vehicleCode)}')">
                        Voir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function viewReceiptByCode(code) {
    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    const tx = transactions.find(t => t.vehicleCode === code);
    if (tx) {
        generateReceipt(tx, {
            code: tx.vehicleCode,
            plate: tx.vehiclePlate,
            vehicleType: tx.vehicleType,
            washPackage: tx.washPackage,
            clientName: tx.clientName
        });
    } else {
        showAlert('Reçu non trouvé.', 'warning');
    }
}

// ============================================================
// MÉTHODES DE PAIEMENT & INTERFACES
// ============================================================

function setupPaymentMethodListeners() {
    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.addEventListener('change', function () {
            selectedPaymentMethod = this.value;

            const momoFields = document.getElementById('momoFields');
            const cardFields = document.getElementById('cardFields');

            if (momoFields) momoFields.classList.add('d-none');
            if (cardFields) cardFields.classList.add('d-none');

            if (selectedPaymentMethod === 'momo' && momoFields) {
                momoFields.classList.remove('d-none');
            } else if (selectedPaymentMethod === 'carte' && cardFields) {
                cardFields.classList.remove('d-none');
            }
        });
    });
}

function getPaymentMethodIcon(method) {
    switch (method) {
        case 'momo': return 'bi-phone text-primary';
        case 'carte': return 'bi-credit-card text-warning';
        default: return 'bi-cash-coin text-success';
    }
}

function getPaymentMethodLabel(method) {
    switch (method) {
        case 'momo': return 'Mobile Money';
        case 'carte': return 'Carte Bancaire';
        default: return 'Espèces';
    }
}

function getStatusLabel(status) {
    switch (status) {
        case 'completed': return 'Lavage terminé';
        case 'paid': return 'Payé & Clôturé';
        case 'in_progress': return 'En cours de lavage';
        default: return 'En attente';
    }
}

// ============================================================
// GRAPHIQUE DES RECETTES (CHART.JS)
// ============================================================

function renderCaisseRevenueChart() {
    const canvas = document.getElementById('caisseRevenueChart');
    if (!canvas || typeof Chart === 'undefined') return;

    let transactions = [];
    try {
        transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
        transactions = [];
    }

    // Répartir par tranches horaires ou jours de la semaine
    const hours = ['08h', '10h', '12h', '14h', '16h', '18h', '20h'];
    const revenueData = [0, 0, 0, 0, 0, 0, 0];

    transactions.forEach(t => {
        if (!t.date) return;
        const d = new Date(t.date);
        const h = d.getHours();
        const amt = Number(t.amount) || 0;

        if (h < 9) revenueData[0] += amt;
        else if (h < 11) revenueData[1] += amt;
        else if (h < 13) revenueData[2] += amt;
        else if (h < 15) revenueData[3] += amt;
        else if (h < 17) revenueData[4] += amt;
        else if (h < 19) revenueData[5] += amt;
        else revenueData[6] += amt;
    });

    // Si aucune transaction enregistrée, donner une courbe de démonstration esthétique
    const hasData = revenueData.some(v => v > 0);
    const chartValues = hasData ? revenueData : [5000, 12000, 18500, 24000, 31000, 22000, 15000];

    if (caisseRevenueChartInstance) {
        caisseRevenueChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    caisseRevenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Recettes (FCFA)',
                data: chartValues,
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                borderWidth: 3,
                tension: 0.35,
                fill: true,
                pointBackgroundColor: '#0f2744',
                pointBorderColor: '#38bdf8',
                pointHoverRadius: 6,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
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
                    grid: {
                        color: 'rgba(226, 232, 240, 0.6)'
                    },
                    ticks: {
                        callback: function (val) {
                            return val.toLocaleString('fr-FR') + ' F';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ============================================================
// RAPPROCHEMENT DE CAISSE
// ============================================================

function updateCaisseReconciliationUI(cashSum, momoSum, cardSum) {
    const theoreticalAmountEl = document.getElementById('theoreticalAmount');
    const differenceAmountEl = document.getElementById('differenceAmount');
    const realAmountInput = document.getElementById('realAmountInput');

    const totalTheoretical = cashSum + momoSum + cardSum;
    if (theoreticalAmountEl) theoreticalAmountEl.textContent = formatCurrency(totalTheoretical);

    if (realAmountInput && !realAmountInput.value) {
        realAmountInput.value = totalTheoretical;
    }

    const realAmount = realAmountInput ? (parseFloat(realAmountInput.value) || 0) : totalTheoretical;
    const diff = realAmount - totalTheoretical;

    if (differenceAmountEl) {
        differenceAmountEl.textContent = formatCurrency(diff);
        if (diff === 0) {
            differenceAmountEl.className = 'fw-bold text-success';
        } else if (diff > 0) {
            differenceAmountEl.className = 'fw-bold text-primary';
            differenceAmountEl.textContent = `+${formatCurrency(diff)} (Excédent)`;
        } else {
            differenceAmountEl.className = 'fw-bold text-danger';
            differenceAmountEl.textContent = `${formatCurrency(diff)} (Déficit)`;
        }
    }
}

function handleReconciliation() {
    const stats = getGlobalStats();
    const totalTheoretical = stats.todayRevenue;
    const realAmountInput = document.getElementById('realAmountInput');
    const realAmount = realAmountInput ? (parseFloat(realAmountInput.value) || 0) : totalTheoretical;
    const diff = realAmount - totalTheoretical;

    const record = {
        id: 'REC-' + Date.now(),
        date: new Date().toISOString(),
        theoretical: totalTheoretical,
        real: realAmount,
        difference: diff,
        status: diff === 0 ? 'Equilibré' : (diff > 0 ? 'Excédent' : 'Déficit')
    };

    let recs = [];
    try {
        recs = JSON.parse(localStorage.getItem('reconciliations')) || [];
    } catch (e) {
        recs = [];
    }
    recs.push(record);
    localStorage.setItem('reconciliations', JSON.stringify(recs));

    const statusBanner = document.getElementById('caisseStatus');
    if (statusBanner) {
        if (diff === 0) {
            statusBanner.className = 'alert alert-success d-flex align-items-center mb-4';
            statusBanner.innerHTML = `<i class="bi bi-check-circle-fill fs-5 me-2"></i> Rapprochement validé : Caisse parfaitement équilibrée (${formatCurrency(realAmount)}).`;
        } else {
            statusBanner.className = 'alert alert-warning d-flex align-items-center mb-4';
            statusBanner.innerHTML = `<i class="bi bi-exclamation-triangle-fill fs-5 me-2"></i> Rapprochement enregistré avec un écart de ${formatCurrency(diff)}.`;
        }
    }

    showAlert('Rapprochement de caisse clôturé et enregistré.', 'success');
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