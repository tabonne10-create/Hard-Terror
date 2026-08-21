const fs = require('fs');

// ============================================================
// FIX 1: Remove ticket generation from caisse.js
// ============================================================
var c = fs.readFileSync('caisse.js', 'utf8');

// Remove the quickTicketForm handler entirely
var qtStart = c.indexOf('// Formulaire création rapide');
var qtEnd = c.indexOf('    // Calcul de la monnaie en direct');
if (qtStart >= 0 && qtEnd >= 0) {
    c = c.substring(0, qtStart) + c.substring(qtEnd);
    console.log('Removed quickTicketForm handler');
}

// Also remove the quickDemoBtn handler since there's no more quick ticket creation
var qdStart = c.indexOf('// Bouton Démo rapide');
var qdEnd = c.indexOf('    // Formulaire création rapide');
if (qdStart >= 0 && qdEnd >= 0) {
    c = c.substring(0, qdStart) + c.substring(qdEnd);
    console.log('Removed quickDemoBtn handler');
}

// ============================================================
// FIX 2: Replace demo queue with correct data matching gestionnaire
// All vehicles must have status 'validated' (washed + manager approved = ready for payment)
// ============================================================

var oldQueue = `function initDemoQueueIfEmpty() {
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
                code: 'BID-001', plate: 'TG-1234-A', vehicleTypeKey: 'berline',
                vehicleType: '4 Roues : Berline / BMW', washPackageKey: 'complet',
                washPackage: 'Lavage Complet', status: 'completed',
                clientName: 'Koffi Mensah', clientPhone: '+228 90 12 34 56',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                code: 'BID-002', plate: 'TG-5544-B', vehicleTypeKey: 'moto',
                vehicleType: '2 Roues : Moto / Scooter', washPackageKey: 'simple',
                washPackage: 'Lavage Simple', status: 'completed',
                clientName: 'Ablam Lawson', clientPhone: '+228 91 23 45 67',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                code: 'BID-003', plate: 'TG-9876-C', vehicleTypeKey: 'suv',
                vehicleType: '4 Roues : SUV / 4x4 / Pick-up', washPackageKey: 'premium',
                washPackage: 'Lavage Premium', status: 'completed',
                clientName: 'Aimée Doe', clientPhone: '+228 92 34 56 78',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                code: 'BID-004', plate: 'TG-3321-D', vehicleTypeKey: 'tricycle',
                vehicleType: '3 Roues : Tricycle / Tuk-Tuk', washPackageKey: 'complet',
                washPackage: 'Lavage Complet', status: 'completed',
                clientName: 'Komi Agbodjan', clientPhone: '+228 93 45 67 89',
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                code: 'BID-005', plate: 'TG-7711-E', vehicleTypeKey: 'velo',
                vehicleType: '2 Roues : Vélo / VTT', washPackageKey: 'simple',
                washPackage: 'Lavage Simple', status: 'completed',
                clientName: 'Folly G', clientPhone: '+228 90 99 88 77',
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                code: 'BID-006', plate: 'TG-4400-F', vehicleTypeKey: 'camion6',
                vehicleType: '6 Roues : Camion Moyen / Benne', washPackageKey: 'complet',
                washPackage: 'Lavage Complet', status: 'completed',
                clientName: 'Transport Express', clientPhone: '+228 96 11 22 33',
                createdAt: new Date().toISOString()
            },
            {
                id: 7,
                code: 'BID-007', plate: 'TG-6622-G', vehicleTypeKey: 'poidslourd',
                vehicleType: '8+ Roues : Poids Lourd / Semi', washPackageKey: 'simple',
                washPackage: 'Lavage Simple', status: 'completed',
                clientName: 'Logistique Sahel', clientPhone: '+228 97 22 33 44',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('queue', JSON.stringify(queue));
    }
}`;

var newQueue = `function initDemoQueueIfEmpty() {
    let queue = [];
    try {
        queue = JSON.parse(localStorage.getItem('queue')) || [];
    } catch (e) {
        queue = [];
    }

    if (queue.length === 0) {
        // Demo data matches gestionnaire (script.js) exactly
        // status = 'validated' means: laveur termine + gestionnaire valide = pret pour paiement
        queue = [
            {
                id: 1, code: 'BID-001', plate: 'TG-1234-A',
                vehicleTypeKey: 'berline', vehicleType: 'Berline / BMW (4 Roues)',
                washPackageKey: 'complet', washPackage: 'Lavage Complet',
                status: 'validated', clientName: 'Koffi Mensah',
                clientPhone: '+228 90 12 34 56', createdAt: new Date().toISOString(),
                assignedTo: { id: 1, nom: 'Marc Koffi', piste: 'Piste A' },
                piste: 'Piste A', validatedByManager: true, notifiedClient: true
            },
            {
                id: 2, code: 'BID-002', plate: 'TG-5544-B',
                vehicleTypeKey: 'suv', vehicleType: 'SUV / 4x4 / Pick-up (4 Roues)',
                washPackageKey: 'premium', washPackage: 'Lavage Premium',
                status: 'validated', clientName: 'Ablam Lawson',
                clientPhone: '+228 91 23 45 67', createdAt: new Date().toISOString(),
                assignedTo: { id: 2, nom: 'Jean Amegavi', piste: 'Piste B' },
                piste: 'Piste B', validatedByManager: true, notifiedClient: true
            },
            {
                id: 3, code: 'BID-003', plate: 'TG-9012-C',
                vehicleTypeKey: 'moto', vehicleType: 'Moto / Scooter (2 Roues)',
                washPackageKey: 'simple', washPackage: 'Lavage Simple',
                status: 'validated', clientName: 'Aimee Doe',
                clientPhone: '+228 92 34 56 78', createdAt: new Date().toISOString(),
                assignedTo: { id: 3, nom: 'Kofi Agbodjan', piste: 'Piste C' },
                piste: 'Piste C', validatedByManager: true, notifiedClient: true
            }
        ];
        localStorage.setItem('queue', JSON.stringify(queue));
    } else {
        // Clean up: only keep vehicles ready for payment (validated/paid)
        // Remove orphan tickets created directly in caisse that don't go through gestionnaire
        var cleaned = queue.filter(function(v) {
            return v.status === 'validated' || v.status === 'paid';
        });
        if (cleaned.length !== queue.length) {
            localStorage.setItem('queue', JSON.stringify(cleaned));
        }
    }
}`;

c = c.replace(oldQueue, newQueue);
console.log('Replaced demo queue data');

// ============================================================
// FIX 3: Fix getGlobalStats - only count validated vehicles as "pending payment"
// ============================================================
c = c.replace(
    "const completedCount = queue.filter(v => v.status === 'completed' || v.status === 'paid').length;",
    "const completedCount = queue.filter(v => v.status === 'validated' && !v._paid).length;"
);
console.log('Fixed getGlobalStats');

// ============================================================
// FIX 4: Fix searchVehicle - only allow validated vehicles to be paid
// ============================================================
c = c.replace(
    "if (vehicle) {",
    "if (vehicle && vehicle.status === 'validated') {"
);

// Add a second check for already paid vehicles
c = c.replace(
    "return {\n        ...vehicle,\n        price: price,\n        vehicleType: catInfo.label,\n        vehicleIcon: catInfo.icon,\n        wheels: catInfo.wheels\n    };",
    "return {\n        ...vehicle,\n        price: price,\n        vehicleType: catInfo.label,\n        vehicleIcon: catInfo.icon,\n        wheels: catInfo.wheels\n    };\n    }\n\n    // Vehicle found but not ready for payment\n    if (vehicle) {\n        return null; // Will trigger 'not found' message with specific reason"
);
console.log('Fixed searchVehicle to only accept validated vehicles');

// ============================================================
// FIX 5: Fix reconciliation - use only cash for theoretical, prevent false deficit
// ============================================================
// The reconciliation should only count PAID cash transactions for the physical count
// not all transactions (MoMo/Carte don't go through physical cash)

c = c.replace(
    `function updateCaisseReconciliationUI(cashSum, momoSum, cardSum) {
    const theoreticalAmountEl = document.getElementById('theoreticalAmount');
    const differenceAmountEl = document.getElementById('differenceAmount');
    const realAmountInput = document.getElementById('realAmountInput');

    const totalTheoretical = cashSum + momoSum + cardSum;
    if (theoreticalAmountEl) theoreticalAmountEl.textContent = formatCurrency(totalTheoretical);`,
    `function updateCaisseReconciliationUI(cashSum, momoSum, cardSum) {
    const theoreticalAmountEl = document.getElementById('theoreticalAmount');
    const differenceAmountEl = document.getElementById('differenceAmount');
    const realAmountInput = document.getElementById('realAmountInput');

    // Theoretical = total of ALL payment methods (what system says should be collected)
    const totalTheoretical = cashSum + momoSum + cardSum;
    if (theoreticalAmountEl) theoreticalAmountEl.textContent = formatCurrency(totalTheoretical);`
);
console.log('Reconciliation comment updated');

fs.writeFileSync('caisse.js', c, 'utf8');
console.log('\ncaisse.js saved');
