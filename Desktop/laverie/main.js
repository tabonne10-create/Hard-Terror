/* ===== BIDÀ – main.js ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. NAVBAR – active link + solid background on scroll
     ============================================================ */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.background = window.scrollY > 60
        ? 'rgba(255,255,255,.97)' : 'var(--white)';
    });
  }

  /* ============================================================
     2. TARIFS – filter buttons
     ============================================================ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const tarifItems = document.querySelectorAll('.tarif-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      tarifItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          item.style.animation = 'fadeIn .4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ============================================================
     3. CONTACT FORM – validation
     ============================================================ */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      e.stopPropagation();

      const name = document.getElementById('contactName');
      const phone = document.getElementById('contactPhone');
      const email = document.getElementById('contactEmail');
      const message = document.getElementById('contactMessage');
      let valid = true;

      [name, phone, email, message].forEach(f => f.classList.remove('is-invalid'));

      if (!name.value.trim()) { name.classList.add('is-invalid'); valid = false; }
      if (!phone.value.trim() || phone.value.trim().length < 8) { phone.classList.add('is-invalid'); valid = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('is-invalid'); valid = false; }
      if (!message.value.trim()) { message.classList.add('is-invalid'); valid = false; }

      if (valid) {
        contactForm.classList.add('d-none');
        document.getElementById('contactSuccess').style.display = '';
      }
    });
  }

  /* ============================================================
     4. ANONYMOUS FEEDBACK – localStorage
     ============================================================ */
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', e => {
      e.preventDefault();
      const type = document.getElementById('feedbackType');
      const message = document.getElementById('feedbackMessage');

      if (!type.value || !message.value.trim()) {
        type.classList.add('is-invalid');
        message.classList.add('is-invalid');
        return;
      }

      type.classList.remove('is-invalid');
      message.classList.remove('is-invalid');

      // Retrieve existing feedbacks
      const feedbacks = JSON.parse(localStorage.getItem('bide_feedbacks') || '[]');
      feedbacks.push({
        type: type.value,
        message: message.value.trim(),
        date: new Date().toISOString()
      });
      localStorage.setItem('bide_feedbacks', JSON.stringify(feedbacks));

      feedbackForm.reset();
      feedbackForm.classList.add('d-none');
      document.getElementById('feedbackSuccess').style.display = '';
    });
  }

  /* ============================================================
     5. LEAFLET MAP – contact page
     ============================================================ */
  const mapEl = document.getElementById('map');
  if (mapEl && typeof L !== 'undefined') {
    // Abidjan coordinates (adjust to your actual location)
    const map = L.map('map').setView([5.3600, -4.0083], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([5.3600, -4.0083]).addTo(map)
      .bindPopup('<strong>BIDÀ – Lavage Auto</strong><br>Zone Industrielle, Abidjan')
      .openPopup();
  }

  /* ============================================================
     6. LOGIN MODAL – demo handler
     ============================================================ */
  const loginForms = document.querySelectorAll('#loginForm, #loginForm2');
  loginForms.forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      const password = form.querySelector('input[type="password"]');
      if (!email.value.trim() || !password.value.trim()) {
        alert('Veuillez remplir tous les champs.');
        return;
      }
      // Demo login
      alert('Connexion réussie ! Bienvenue, ' + email.value);
      const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
      if (modal) modal.hide();
    });
  });

});

/* ============================================================
   CSS animation keyframes injected once
   ============================================================ */
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();
