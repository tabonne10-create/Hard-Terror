/* ==========================================
   BIDE — Light Theme JS (index, contact, tarifs)
   ========================================== */

/* ===== LOGIN MODAL ===== */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    if (!email || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("bideUsers") || "[]");
    const user = users.find(function (item) {
      return item.email === email && item.password === password;
    });
    if (!user) {
      alert("Email ou mot de passe incorrect.");
      return;
    }
    localStorage.setItem("bideCurrentUser", JSON.stringify(user));
    const loginModal = document.getElementById("loginModal");
    const modal = loginModal && window.bootstrap
      ? bootstrap.Modal.getInstance(loginModal)
      : null;
    if (modal) modal.hide();
    loginForm.reset();
    window.location.href = "../../lavage1/lavage/client.html";
  });
}

/* ===== RESERVATION ACCUEIL ===== */
const homeReservationForm = document.getElementById("reservationForm");
if (homeReservationForm && !document.getElementById("date")) {
  homeReservationForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!homeReservationForm.checkValidity()) {
      homeReservationForm.classList.add("was-validated");
      return;
    }
    const fields = homeReservationForm.querySelectorAll("input, select");
    const reservation = {
      id: Date.now(),
      name: fields[0].value.trim(),
      phone: fields[1].value.trim(),
      service: fields[2].value,
      date: fields[3].value,
      time: fields[4].value,
      createdAt: new Date().toISOString()
    };
    const reservations = JSON.parse(localStorage.getItem("bideReservations") || "[]");
    reservations.push(reservation);
    localStorage.setItem("bideReservations", JSON.stringify(reservations));
    homeReservationForm.reset();
    const message = document.createElement("div");
    message.className = "alert alert-success mt-3";
    message.textContent = "Votre réservation a bien été enregistrée.";
    homeReservationForm.after(message);
    setTimeout(function () { message.remove(); }, 5000);
  });
}

/* ===== INSCRIPTION ===== */
const registerForm = document.getElementById("registerForm");

const openRegisterLink = document.getElementById("openRegisterLink");
if (openRegisterLink) {
  openRegisterLink.addEventListener("click", function (e) {
    e.preventDefault();
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    if (!registerModal || !window.bootstrap) return;
    const showRegister = function () {
      bootstrap.Modal.getOrCreateInstance(registerModal).show();
    };
    if (loginModal) {
      const loginInstance = bootstrap.Modal.getOrCreateInstance(loginModal);
      loginModal.addEventListener("hidden.bs.modal", showRegister, { once: true });
      loginInstance.hide();
    } else {
      showRegister();
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const phone = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value;
    const passwordConfirm = document.getElementById("registerPasswordConfirm").value;
    if (!registerForm.checkValidity()) {
      registerForm.classList.add("was-validated");
      return;
    }
    if (password !== passwordConfirm) {
      alert("Les deux mots de passe ne correspondent pas.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("bideUsers") || "[]");
    if (users.some(function (item) { return item.email === email; })) {
      alert("Cette adresse email possède déjà un compte.");
      return;
    }
    const user = { name: name, email: email, phone: phone, password: password };
    users.push(user);
    localStorage.setItem("bideUsers", JSON.stringify(users));
    localStorage.setItem("bideCurrentUser", JSON.stringify(user));
    alert("Compte créé avec succès !");
    window.location.href = "../../lavage1/lavage/client.html";
  });
}

if (window.location.hash === "#registerModal") {
  const registerModal = document.getElementById("registerModal");
  if (registerModal && window.bootstrap) {
    bootstrap.Modal.getOrCreateInstance(registerModal).show();
  }
}

if (window.location.hash === "#loginModal") {
  const loginModal = document.getElementById("loginModal");
  if (loginModal && window.bootstrap) {
    bootstrap.Modal.getOrCreateInstance(loginModal).show();
  }
}

/* ===== CONTACT FORM ===== */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const contactSuccess = document.getElementById("contactSuccess");
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    if (!name || !phone || !email || !message) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    contactForm.reset();
    if (contactSuccess) contactSuccess.style.display = "block";
    setTimeout(function () {
      if (contactSuccess) contactSuccess.style.display = "none";
    }, 5000);
  });
}

/* ===== TARIF FILTER ===== */
const filterBtns = document.querySelectorAll(".filter-btn");
const tarifItems = document.querySelectorAll(".tarif-item");
if (filterBtns.length > 0) {
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      tarifItems.forEach(function (item) {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  });
}

/* ===== SCROLL REVEAL ===== */
const reveals = document.querySelectorAll(".reveal");
if (reveals.length > 0) {
  function checkReveal() {
    reveals.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add("visible");
      }
    });
  }
  window.addEventListener("scroll", checkReveal);
  checkReveal();
}
