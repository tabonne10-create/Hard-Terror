/* ============================================
   BIDÈ — main.js unifié v2
   Login / Inscription / Mot de passe sécurisés
   Compatible toutes les pages
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ============================================
     UTILITAIRES — SHA-256 HASH
     ============================================ */
  async function hashPassword(password) {
    var encoder = new TextEncoder();
    var data = encoder.encode(password);
    var hashBuffer = await crypto.subtle.digest('SHA-256', data);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  /* ============================================
     1. INSCRIPTION (modal register)
     ============================================ */
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var name = document.getElementById('registerName').value.trim();
      var email = document.getElementById('registerEmail').value.trim().toLowerCase();
      var phone = document.getElementById('registerPhone').value.trim();
      var password = document.getElementById('registerPassword').value;
      var passwordConfirm = document.getElementById('registerPasswordConfirm').value;

      if (!name || !email || !phone || !password || !passwordConfirm) {
        alert('Veuillez remplir tous les champs.');
        return;
      }
      if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      if (password !== passwordConfirm) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }

      var users = JSON.parse(localStorage.getItem('bideUsers') || '[]');
      if (users.some(function(u) { return u.email === email; })) {
        alert('Un compte existe déjà avec cet email.');
        return;
      }

      var hashedPassword = await hashPassword(password);
      var user = {
        name: name,
        email: email,
        phone: phone,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem('bideUsers', JSON.stringify(users));
      localStorage.setItem('bideCurrentUser', JSON.stringify(user));

      alert('Compte créé avec succès ! Bienvenue ' + name);
      window.location.href = getWindowBase() + 'lavage1/lavage/client.html';
    });
  }

  /* ============================================
     2. LOGIN MODAL
     ============================================ */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = document.getElementById('loginEmail').value.trim().toLowerCase();
      var password = document.getElementById('loginPassword').value.trim();
      if (!email || !password) {
        alert('Veuillez remplir tous les champs.');
        return;
      }

      var users = JSON.parse(localStorage.getItem('bideUsers') || '[]');
      var hashedPassword = await hashPassword(password);
      var user = users.find(function(u) {
        return u.email === email && u.password === hashedPassword;
      });

      if (!user) {
        alert('Email ou mot de passe incorrect.');
        return;
      }

      localStorage.setItem('bideCurrentUser', JSON.stringify(user));
      var loginModal = document.getElementById('loginModal');
      var modal = loginModal && window.bootstrap
        ? bootstrap.Modal.getInstance(loginModal)
        : null;
      if (modal) modal.hide();
      loginForm.reset();
      window.location.href = getWindowBase() + 'lavage1/lavage/client.html';
    });
  }

  /* ============================================
     3. OUVRIR MODAL INSCRIPTION DEPUIS LOGIN
     ============================================ */
  var openRegisterLink = document.getElementById('openRegisterLink');
  if (openRegisterLink) {
    openRegisterLink.addEventListener('click', function (e) {
      e.preventDefault();
      var loginModal = document.getElementById('loginModal');
      var registerModal = document.getElementById('registerModal');
      if (!registerModal || !window.bootstrap) return;
      var showRegister = function () {
        bootstrap.Modal.getOrCreateInstance(registerModal).show();
      };
      if (loginModal) {
        loginModal.addEventListener('hidden.bs.modal', showRegister, { once: true });
        bootstrap.Modal.getOrCreateInstance(loginModal).hide();
      } else {
        showRegister();
      }
    });
  }

  /* ============================================
     4. DÉTECTION CHEMIN BASE
     ============================================ */
  function getWindowBase() {
    var path = window.location.pathname;
    if (path.includes('/lavage1/lavage/')) return '../../';
    if (path.includes('/Desktop/laverie/')) return '../';
    return './';
  }

  /* ============================================
     5. TARIF FILTER
     ============================================ */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var tarifItems = document.querySelectorAll('.tarif-item');
  if (filterBtns.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-filter');
        tarifItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ============================================
     6. CONTACT FORM
     ============================================ */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var contactSuccess = document.getElementById('contactSuccess');
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('contactName').value.trim();
      var phone = document.getElementById('contactPhone').value.trim();
      var email = document.getElementById('contactEmail').value.trim();
      var message = document.getElementById('contactMessage').value.trim();
      if (!name || !phone || !email || !message) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      contactForm.reset();
      if (contactSuccess) contactSuccess.style.display = 'block';
      setTimeout(function () {
        if (contactSuccess) contactSuccess.style.display = 'none';
      }, 5000);
    });
  }

  /* ============================================
     7. FEEDBACK ANONYME
     ============================================ */
  var feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var type = document.getElementById('feedbackType');
      var message = document.getElementById('feedbackMessage');
      if (!type || !message || !type.value || !message.value.trim()) {
        if (type) type.classList.add('is-invalid');
        if (message) message.classList.add('is-invalid');
        return;
      }
      if (type) type.classList.remove('is-invalid');
      if (message) message.classList.remove('is-invalid');
      var feedbacks = JSON.parse(localStorage.getItem('bide_feedbacks') || '[]');
      feedbacks.push({
        type: type.value,
        message: message.value.trim(),
        date: new Date().toISOString()
      });
      localStorage.setItem('bide_feedbacks', JSON.stringify(feedbacks));
      feedbackForm.reset();
      var successMsg = document.getElementById('feedbackSuccess');
      if (successMsg) successMsg.style.display = '';
      setTimeout(function () {
        if (successMsg) successMsg.style.display = 'none';
      }, 4000);
    });
  }

  /* ============================================
     8. SCROLL REVEAL
     ============================================ */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    function checkReveal() {
      reveals.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
          el.classList.add('visible');
        }
      });
    }
    window.addEventListener('scroll', checkReveal);
    checkReveal();
  }

  /* ============================================
     9. LEAFLET MAP (contact page)
     ============================================ */
  var mapEl = document.getElementById('map');
  if (mapEl && typeof L !== 'undefined') {
    var map = L.map('map').setView([6.1256, 1.2254], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker([6.1256, 1.2254]).addTo(map)
      .bindPopup('<strong>BIDÈ – Lavage Auto</strong><br>Lomé, Togo')
      .openPopup();
  }

  /* ============================================
     10. CHECK HASH FOR MODALS
     ============================================ */
  if (window.location.hash === '#loginModal') {
    var loginModal = document.getElementById('loginModal');
    if (loginModal && window.bootstrap) {
      bootstrap.Modal.getOrCreateInstance(loginModal).show();
    }
  }
  if (window.location.hash === '#registerModal') {
    var registerModal = document.getElementById('registerModal');
    if (registerModal && window.bootstrap) {
      bootstrap.Modal.getOrCreateInstance(registerModal).show();
    }
  }

}); /* fin DOMContentLoaded */
