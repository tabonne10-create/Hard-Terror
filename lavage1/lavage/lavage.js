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

if (reservationForm) {

const reservationMessage =
    document.getElementById("reservationMessage");

const historyTable =
    document.getElementById("historyTable");

const reservationCount =
    document.getElementById("reservationCount");

const washCount =
    document.getElementById("washCount");

const nextAppointment =
    document.getElementById("nextAppointment");

const clearHistory =
    document.getElementById("clearHistory");

const dateInput =
    document.getElementById("date");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ==========================================
   DATE MINIMUM
========================================== */

const today =
    new Date().toISOString().split("T")[0];

dateInput.min = today;


/* ==========================================
   HISTORIQUE
========================================== */

function getHistory() {

    const saved =
        localStorage.getItem("bideHistory");

    if (saved) {

        return JSON.parse(saved);

    }

    localStorage.setItem(
        "bideHistory",
        JSON.stringify(defaultHistory)
    );

    return defaultHistory;

}


/* ==========================================
   AFFICHER HISTORIQUE
========================================== */

function displayHistory() {

    const history = getHistory();

    historyTable.innerHTML = "";


    if (history.length === 0) {

        historyTable.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted py-4"
                >

                    Aucun passage enregistré.

                </td>

            </tr>

        `;

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

        historyTable.appendChild(row);

    });

}


/* ==========================================
   RESERVATIONS
========================================== */

function getReservations() {

    const saved =
        localStorage.getItem("bideReservations");

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

    reservationCount.textContent =
        reservations.length;

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
            "bideReservations",
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


function startVehicleTracking() {

    const progressBar =
        document.getElementById("progressBar");

    const progressPercent =
        document.getElementById("progressPercent");

    const washStatus =
        document.getElementById("washStatus");


    const steps = [

        document.getElementById("step1"),

        document.getElementById("step2"),

        document.getElementById("step3"),

        document.getElementById("step4")

    ];


    washInterval =
        setInterval(function() {

            progress += 5;


            if (progress > 100) {

                progress = 0;

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

clearHistory.addEventListener(
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
            "bideHistory",
            JSON.stringify([])
        );


        displayHistory();

    }
);


/* ==========================================
   DECONNEXION SIMULÉE
========================================== */

if (logoutBtn) {
logoutBtn.addEventListener(
    "click",
    function() {

        const confirmation =
            confirm(
                "Voulez-vous vous déconnecter ?"
            );


        if (confirmation) {

            alert(
                "Déconnexion simulée."
            );

            window.location.href =
                "index.html";

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

} /* fin du guard reservationForm */