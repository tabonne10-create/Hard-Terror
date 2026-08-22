/* =====================================
   FEEDBACK 100% ANONYME - BIDÈ
===================================== */

const feedbackForm = document.getElementById("feedbackForm");

if (feedbackForm) {

const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackType = document.getElementById("feedbackType");
const charCount = document.getElementById("charCount");
const successMessage = document.getElementById("successMessage");

const localFeedbackList =
    document.getElementById("localFeedbackList");


/* =====================================
   COMPTEUR DE CARACTÈRES
===================================== */

feedbackMessage.addEventListener("input", function () {

    charCount.textContent = this.value.length;

});


/* =====================================
   RÉCUPÉRER LES FEEDBACKS
===================================== */

function getFeedbacks() {

    const feedbacks =
        localStorage.getItem("bideFeedbacks");

    if (feedbacks) {
        return JSON.parse(feedbacks);
    }

    return [];
}


/* =====================================
   ENREGISTRER UN FEEDBACK
===================================== */

feedbackForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const message =
        feedbackMessage.value.trim();

    const type =
        feedbackType.value;


    /* Vérification */

    if (message.length < 5) {

        alert(
            "Veuillez écrire un message d'au moins 5 caractères."
        );

        return;
    }


    /* Création du feedback */

    const feedback = {

        id: Date.now(),

        type: type,

        message: message,

        date: new Date().toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        )

    };


    /* Récupération des anciens feedbacks */

    const feedbacks = getFeedbacks();


    /* Ajouter le nouveau */

    feedbacks.push(feedback);


    /* Sauvegarder dans LocalStorage */

    localStorage.setItem(
        "bideFeedbacks",
        JSON.stringify(feedbacks)
    );


    /* Réinitialiser le formulaire */

    feedbackForm.reset();

    charCount.textContent = "0";


    /* Message de confirmation */

    successMessage.classList.remove("d-none");


    /* Cacher le message après 4 secondes */

    setTimeout(function() {

        successMessage.classList.add("d-none");

    }, 4000);


    /* Afficher les feedbacks */

    displayFeedbacks();

});


/* =====================================
   AFFICHAGE DES FEEDBACKS
===================================== */

function displayFeedbacks() {

    const feedbacks = getFeedbacks();


    /* Aucun feedback */

    if (feedbacks.length === 0) {

        localFeedbackList.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">
                    Aucun feedback n'a encore été enregistré.
                </p>
            </div>
        `;

        return;
    }


    /* Affichage */

    localFeedbackList.innerHTML = "";


    /*
       On affiche les 6 derniers avis
    */

    const recentFeedbacks =
        feedbacks.slice(-6).reverse();


    recentFeedbacks.forEach(function(feedback) {

        const col =
            document.createElement("div");

        col.className =
            "col-md-6 col-lg-4";


        /*
           Protection contre l'injection HTML
        */

        const safeMessage =
            escapeHTML(feedback.message);


        col.innerHTML = `

            <div class="feedback-item">

                <span class="type">
                    ${escapeHTML(feedback.type)}
                </span>

                <p>
                    "${safeMessage}"
                </p>

                <div class="feedback-date">

                    <i class="bi bi-calendar3"></i>

                    ${feedback.date}

                    <span class="ms-2">
                        • Anonyme
                    </span>

                </div>

            </div>

        `;


        localFeedbackList.appendChild(col);

    });

}


/* =====================================
   PROTECTION HTML
===================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =====================================
   CHARGEMENT INITIAL
===================================== */

displayFeedbacks();

} /* fin du guard feedbackForm */


/* ==========================================
   ESPACE CLIENT BIDÈ
========================================== */


/* ==========================================
   DONNÉES
========================================== */

const defaultHistory = [

    {
        date: "15/08/2026",
        service: "Lavage complet",
        vehicle: "Toyota Corolla",
        status: "Terminé",
        price: "5 000 FCFA"
    },

    {
        date: "02/08/2026",
        service: "Nettoyage premium",
        vehicle: "Toyota Corolla",
        status: "Terminé",
        price: "8 000 FCFA"
    },

    {
        date: "19/07/2026",
        service: "Lavage extérieur",
        vehicle: "Toyota Corolla",
        status: "Terminé",
        price: "3 000 FCFA"
    },

    {
        date: "05/07/2026",
        service: "Lavage intérieur",
        vehicle: "Toyota Corolla",
        status: "Terminé",
        price: "4 000 FCFA"
    }

];


/* ==========================================
   ELEMENTS HTML
========================================== */

const reservationForm =
    document.getElementById("reservationForm");

const vehicleCount =
    document.getElementById("vehicleCount");

if (reservationForm) {

const reservationMessage =
    document.getElementById("reservationMessage");

const historyTable =
    document.getElementById("historyTable");

const historyList =
    document.getElementById("historyList");

const reservationCount =
    document.getElementById("reservationCount");

const washCount =
    document.getElementById("washCount");

const currentUser = JSON.parse(
    localStorage.getItem("bideCurrentUser") || "null"
);

/* === PROTECTION D'ACCÈS === */
if (!currentUser || !currentUser.email) {
    window.location.href = "../../Desktop/laverie/index.html#loginModal";
    throw new Error("Non connecté — redirection vers la connexion.");
}

const accountId = currentUser && currentUser.email
    ? currentUser.email.toLowerCase()
    : "guest";

function storageKey(name) {
    return name + "_" + accountId;
}

const vehiclesList = document.getElementById("vehiclesList");
const addVehicleBtn = document.getElementById("addVehicleBtn");
const vehicleForm = document.getElementById("vehicleForm");
const cancelVehicleBtn = document.getElementById("cancelVehicleBtn");

function getVehicles() {
    return JSON.parse(localStorage.getItem(storageKey("bideVehicles")) || "[]");
}

function displayVehicles() {
    if (!vehiclesList) return;
    const vehicles = getVehicles();
    if (vehicleCount) vehicleCount.textContent = vehicles.length;
    const trackingName = document.getElementById("trackingVehicleName");
    const trackingPlate = document.getElementById("trackingVehiclePlate");
    const trackingColor = document.getElementById("trackingVehicleColor");
    if (vehicles.length === 0) {
        vehiclesList.innerHTML = '<p class="text-muted">Aucun véhicule enregistré.</p>';
        if (trackingName) trackingName.textContent = "Aucun véhicule sélectionné";
        if (trackingPlate) trackingPlate.textContent = "-";
        if (trackingColor) trackingColor.textContent = "-";
        return;
    }
    if (trackingName) trackingName.textContent = vehicles[0].model;
    if (trackingPlate) trackingPlate.textContent = vehicles[0].plate;
    if (trackingColor) trackingColor.textContent = vehicles[0].color;
    vehiclesList.innerHTML = vehicles.map(function(vehicle) {
        return '<article class="saved-vehicle"><div class="saved-vehicle-icon"><i class="bi bi-car-front-fill"></i></div><div><h3>' + escapeHTML(vehicle.model) + '</h3><p>' + escapeHTML(vehicle.plate) + ' · ' + escapeHTML(vehicle.color) + ' · ' + escapeHTML(vehicle.year) + '</p></div><span class="vehicle-tag">Actif</span></article>';
    }).join("");
}

if (addVehicleBtn) {
    addVehicleBtn.addEventListener("click", function() {
        if (vehicleForm) vehicleForm.classList.add("is-visible");
        document.getElementById("vehicleModel")?.focus();
    });
}

if (cancelVehicleBtn) {
    cancelVehicleBtn.addEventListener("click", function() {
        vehicleForm.reset();
        vehicleForm.classList.remove("is-visible");
    });
}

if (vehicleForm) {
    vehicleForm.addEventListener("submit", function(event) {
        event.preventDefault();
        if (!vehicleForm.checkValidity()) {
            vehicleForm.classList.add("was-validated");
            return;
        }
        const vehicles = getVehicles();
        vehicles.push({
            model: document.getElementById("vehicleModel").value.trim(),
            plate: document.getElementById("vehiclePlate").value.trim(),
            color: document.getElementById("vehicleColor").value.trim(),
            year: document.getElementById("vehicleYear").value.trim()
        });
        localStorage.setItem(storageKey("bideVehicles"), JSON.stringify(vehicles));
        vehicleForm.reset();
        vehicleForm.classList.remove("is-visible");
        displayVehicles();
    });
}

displayVehicles();

let completedWashes = Number(
    localStorage.getItem(storageKey("bideWashCount")) || 0
);

if (washCount) {
    washCount.textContent = completedWashes;
}

const nextAppointment =
    document.getElementById("nextAppointment");

const clearHistory =
    document.getElementById("clearHistory");

const dateInput =
    document.getElementById("date");

const logoutBtn =
    document.getElementById("logoutBtn");

if (currentUser) {
    const displayName = currentUser.name || "Client";
    const clientName = document.getElementById("clientName");
    const profileName = document.getElementById("profileName");
    if (clientName) clientName.textContent = displayName;
    if (profileName) profileName.textContent = displayName;
} else {
    window.location.href = "../../Desktop/laverie/index.html#loginModal";
}


/* ==========================================
   DATE MINIMUM
========================================== */

const today =
    new Date().toISOString().split("T")[0];

if (dateInput) {
    dateInput.min = today;
}


/* ==========================================
   HISTORIQUE
========================================== */

function getHistory() {

    const saved =
        localStorage.getItem(storageKey("bideHistory"));

    if (saved) {

        return JSON.parse(saved);

    }

    return [];

}


/* ==========================================
   AFFICHER HISTORIQUE
========================================== */

function displayHistory() {

    if (!historyTable && !historyList) {
        return;
    }

    const history = getHistory();

    if (historyTable) historyTable.innerHTML = "";
    if (historyList) historyList.innerHTML = "";


    if (history.length === 0) {

        const emptyMessage = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted py-4"
                >

                    Aucun passage enregistré.

                </td>

            </tr>

        `;
        if (historyTable) historyTable.innerHTML = emptyMessage;
        if (historyList) historyList.innerHTML = '<p class="text-muted text-center py-4">Aucun passage enregistré.</p>';

        return;

    }


    history.forEach(function(item) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${escapeHTML(item.date)}
            </td>

            <td>
                ${escapeHTML(item.service)}
            </td>

            <td>
                ${escapeHTML(item.vehicle)}
            </td>

            <td>

                <span class="status">

                    <i class="bi bi-check-circle"></i>

                    ${escapeHTML(item.status)}

                </span>

            </td>

            <td>
                <strong>
                    ${escapeHTML(item.price)}
                </strong>
            </td>

        `;

        if (historyTable) {
            historyTable.appendChild(row);
        }
        if (historyList) {
            const card = document.createElement("div");
            card.className = "history-card";
            card.innerHTML = `
                <div class="history-icon"><i class="bi bi-car-front-fill"></i></div>
                <div class="history-info"><h3>${escapeHTML(item.service)}</h3><p><i class="bi bi-calendar3 me-1"></i>${escapeHTML(item.date)}</p></div>
                <div class="history-price"><strong>${escapeHTML(item.price)}</strong><span>${escapeHTML(item.status)}</span></div>
            `;
            historyList.appendChild(card);
        }

    });

}


/* ==========================================
   RESERVATIONS
========================================== */

function getReservations() {

    const saved =
        localStorage.getItem(storageKey("bideReservations"));

    if (saved) {

        return JSON.parse(saved);

    }

    return [];

}


/* ==========================================
   AFFICHER NOMBRE RESERVATIONS
========================================== */

function updateReservationCount() {

    const reservations =
        getReservations();

    if (reservationCount) {
        reservationCount.textContent =
            reservations.length;
    }

}


/* ==========================================
   RESERVATION
========================================== */

reservationForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const date =
            document.getElementById("date").value;

        const time =
            document.getElementById("time").value;

        const service =
            document.getElementById("service").value;

        const comment =
            document.getElementById("comment").value;


        if (!date || !time || !service) {

            alert(
                "Veuillez remplir tous les champs obligatoires."
            );

            return;

        }


        const reservation = {

            id: Date.now(),

            date: date,

            time: time,

            service: service,

            comment: comment

        };


        const reservations =
            getReservations();


        reservations.push(reservation);


        localStorage.setItem(
            storageKey("bideReservations"),
            JSON.stringify(reservations)
        );


        /* Confirmation */

        reservationMessage.innerHTML = `

            <i class="bi bi-check-circle-fill"></i>

            Votre réservation pour le
            <strong>${formatDate(date)}</strong>
            à
            <strong>${time}</strong>
            a bien été enregistrée.

        `;

        reservationMessage.classList.remove(
            "d-none"
        );


        reservationForm.reset();


        updateReservationCount();

        displayNextAppointment();


        setTimeout(function() {

            reservationMessage.classList.add(
                "d-none"
            );

        }, 5000);

    }
);


/* ==========================================
   PROCHAIN RENDEZ-VOUS
========================================== */

function displayNextAppointment() {

    const reservations =
        getReservations();


    if (reservations.length === 0) {

        nextAppointment.innerHTML = `

            <i class="bi bi-calendar-x"></i>

            <h4>
                Aucun rendez-vous
            </h4>

            <p>
                Vous n'avez pas encore de réservation.
            </p>

        `;

        return;

    }


    /* Trier les rendez-vous */

    reservations.sort(
        function(a, b) {

            return (
                new Date(a.date + " " + a.time)
                -
                new Date(b.date + " " + b.time)
            );

        }
    );


    const upcoming =
        reservations.find(function(item) {

            return new Date(
                item.date + " " + item.time
            ) >= new Date();

        });


    if (!upcoming) {

        nextAppointment.innerHTML = `

            <i class="bi bi-calendar-x"></i>

            <h4>
                Aucun rendez-vous à venir
            </h4>

            <p>
                Réservez votre prochain lavage.
            </p>

        `;

        return;

    }


    nextAppointment.innerHTML = `

        <i class="bi bi-calendar-check"></i>

        <h4>
            ${formatDate(upcoming.date)}
        </h4>

        <p>
            <strong>
                ${upcoming.time}
            </strong>
        </p>

        <p>
            ${escapeHTML(upcoming.service)}
        </p>

    `;

}


/* ==========================================
   SIMULATION SUIVI TEMPS RÉEL
========================================== */

let progress = 0;

let washInterval = null;

let washCompleted = false;


function startVehicleTracking() {

    const progressBar =
        document.getElementById("progressBar");

    const progressPercent =
        document.getElementById("progressPercent");

    const washStatus =
        document.getElementById("washStatus");

    if (!progressBar || !progressPercent || !washStatus) {
        return;
    }

    if (getVehicles().length === 0) {
        washStatus.textContent = "Ajoutez un véhicule pour suivre le lavage";
        progressPercent.textContent = "-";
        progressBar.style.width = "0%";
        return;
    }


    const steps = [

        document.getElementById("step1"),

        document.getElementById("step2"),

        document.getElementById("step3"),

        document.getElementById("step4")

    ];


    washInterval =
        setInterval(function() {

            progress += 5;


            if (progress >= 100 && !washCompleted) {

                completedWashes += 1;
                washCompleted = true;

                localStorage.setItem(
                    storageKey("bideWashCount"),
                    completedWashes
                );

                if (washCount) {
                    washCount.textContent = completedWashes;
                }

            }


            if (progress > 100) {

                progress = 0;
                washCompleted = false;

                steps.forEach(
                    step => step.classList.remove("active")
                );

                steps[0].classList.add("active");

            }


            progressBar.style.width =
                progress + "%";

            progressPercent.textContent =
                progress + "%";


            /* Déterminer l'étape */

            steps.forEach(function(step) {

                step.classList.remove("active");

            });


            if (progress < 25) {

                washStatus.textContent =
                    "Véhicule accueilli";

                steps[0].classList.add("active");

            }

            else if (progress < 55) {

                washStatus.textContent =
                    "Lavage en cours";

                steps[0].classList.add("active");
                steps[1].classList.add("active");

            }

            else if (progress < 85) {

                washStatus.textContent =
                    "Finition en cours";

                steps[0].classList.add("active");
                steps[1].classList.add("active");
                steps[2].classList.add("active");

            }

            else {

                washStatus.textContent =
                    "Véhicule prêt";

                steps.forEach(
                    step => step.classList.add("active")
                );

            }


        }, 2000);

}


/* ==========================================
   EFFACER HISTORIQUE
========================================== */

if (clearHistory) clearHistory.addEventListener(
    "click",
    function() {

        const confirmation =
            confirm(
                "Voulez-vous vraiment effacer l'historique ?"
            );


        if (!confirmation) {
            return;
        }


        localStorage.setItem(
            storageKey("bideHistory"),
            JSON.stringify([])
        );


        displayHistory();

    }
);

const markNotificationsRead =
    document.getElementById("markNotificationsRead");

if (markNotificationsRead) {
    markNotificationsRead.addEventListener("click", function() {
        document.querySelectorAll(".notification-item.unread").forEach(function(item) {
            item.classList.remove("unread");
            const dot = item.querySelector(".notification-dot");
            if (dot) dot.remove();
        });
        markNotificationsRead.textContent = "Notifications lues";
    });
}


/* ==========================================
   DECONNEXION SIMULÉE
========================================== */

if (logoutBtn) {
logoutBtn.addEventListener(
    "click",
    function() {
        const confirmation = confirm("Voulez-vous vous déconnecter ?");
        if (confirmation) {
            localStorage.removeItem("bideCurrentUser");
            window.location.href = "../../Desktop/laverie/index.html";
        }
    }
);
}


/* ==========================================
   FORMATER UNE DATE
========================================== */

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "fr-FR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* ==========================================
   PROTECTION HTML
========================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* ==========================================
   INITIALISATION
========================================== */

displayHistory();

updateReservationCount();

displayNextAppointment();

startVehicleTracking();

/* ==========================================
   MODIFICATION MOT DE PASSE
========================================== */

const changePasswordForm = document.getElementById("changePasswordForm");
if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const currentPwd = document.getElementById("currentPassword").value;
        const newPwd = document.getElementById("newPassword").value;
        const confirmPwd = document.getElementById("confirmPassword").value;
        const successEl = document.getElementById("passwordSuccess");
        const errorEl = document.getElementById("passwordError");
        const errorMsg = document.getElementById("passwordErrorMsg");

        successEl.style.display = "none";
        errorEl.style.display = "none";

        if (newPwd.length < 6) {
            errorEl.style.display = "block";
            errorMsg.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
            return;
        }
        if (newPwd !== confirmPwd) {
            errorEl.style.display = "block";
            errorMsg.textContent = "Les mots de passe ne correspondent pas.";
            return;
        }

        /* Hash SHA-256 */
        async function hashPwd(pwd) {
            const data = new TextEncoder().encode(pwd);
            const buf = await crypto.subtle.digest("SHA-256", data);
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
        }

        const hashedCurrent = await hashPwd(currentPwd);
        const users = JSON.parse(localStorage.getItem("bideUsers") || "[]");
        const userIndex = users.findIndex(u => u.email === currentUser.email);

        if (userIndex === -1 || users[userIndex].password !== hashedCurrent) {
            errorEl.style.display = "block";
            errorMsg.textContent = "Le mot de passe actuel est incorrect.";
            return;
        }

        const hashedNew = await hashPwd(newPwd);
        users[userIndex].password = hashedNew;
        localStorage.setItem("bideUsers", JSON.stringify(users));

        currentUser.password = hashedNew;
        localStorage.setItem("bideCurrentUser", JSON.stringify(currentUser));

        changePasswordForm.reset();
        successEl.style.display = "block";
        setTimeout(() => { successEl.style.display = "none"; }, 5000);
    });
}

} /* fin du guard reservationForm */