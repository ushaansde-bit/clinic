/* ============================================
   Shree Physiotherapy Clinic - Main JavaScript
   ============================================ */

// --- Navbar scroll effect ---
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// --- Mobile menu toggle ---
function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('mobile-open');
  }
}

// Close mobile menu on link click
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.getElementById('navLinks');
      if (nav) nav.classList.remove('mobile-open');
    });
  });
});

// --- Smooth scroll for anchor links ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
});

// --- Intersection Observer for fade-in animations ---
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

// --- Active nav link highlight on scroll ---
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  if (sections.length === 0 || navAnchors.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.pageYOffset >= top) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  });
});

// --- Toast Notification ---
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMessage');
  if (!toast || !msg) return;

  toast.className = `toast ${type}`;
  msg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// --- Modal helpers ---
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// --- LocalStorage helpers ---
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
  return 'P' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

// --- Date formatting helpers ---
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function isToday(dateStr) {
  const today = new Date();
  const d = new Date(dateStr);
  return d.toDateString() === today.toDateString();
}

function isFutureDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) >= today;
}

// --- WhatsApp message helper ---
function openWhatsApp(phone, message) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ===== GOOGLE REVIEWS SYSTEM =====
document.addEventListener('DOMContentLoaded', () => {
  loadReviews();
  initStarRating();
});

function initStarRating() {
  const stars = document.querySelectorAll('#starRating .star');
  if (stars.length === 0) return;

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      document.getElementById('reviewRating').value = value;
      stars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value) <= value);
      });
    });

    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value);
      stars.forEach(s => {
        s.classList.toggle('hover', parseInt(s.dataset.value) <= value);
      });
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

function loadReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  // Default reviews + stored reviews
  const defaultReviews = [
    {
      name: 'Lakshmi Devi', rating: 5, service: 'Fascial Manipulation',
      text: 'Shree Physiotherapy Clinic is the best in Periyanaickenpalayam. Dr. Aarti\'s Fascial Manipulation gave me instant relief from my chronic shoulder pain. The clinic is spotlessly clean!',
      date: '2025-01-15'
    },
    {
      name: 'Murugan K', rating: 5, service: 'Orthopedic Rehabilitation',
      text: 'After my knee surgery, I was worried about recovery. Dr. Aarti at Shree Physiotherapy Clinic designed an excellent rehab program. I\'m walking normally now. Highly recommended!',
      date: '2025-01-10'
    },
    {
      name: 'Saranya M', rating: 5, service: 'Women\'s Health Physio',
      text: 'As a new mother, I had severe back pain. Dr. Aarti at Shree Physiotherapy Clinic understood my concerns and treated me with such care. Best women\'s physiotherapist in Coimbatore.',
      date: '2025-01-05'
    },
    {
      name: 'Ravi Kumar', rating: 5, service: 'Elderly Home Care',
      text: 'Dr. Aarti visited our home to treat my elderly mother. Her patience and expertise are remarkable. Shree Physiotherapy Clinic\'s home service is a blessing for families with elderly members.',
      date: '2024-12-28'
    }
  ];

  const storedReviews = getData('reviews');
  const allReviews = [...storedReviews, ...defaultReviews];

  grid.innerHTML = allReviews.map(r => `
    <div class="review-card fade-in">
      <div class="review-header">
        <div class="review-avatar">${r.name.charAt(0)}</div>
        <div>
          <h4>${r.name}</h4>
          <div class="review-stars">${'&#9733;'.repeat(r.rating)}${'&#9734;'.repeat(5 - r.rating)}</div>
        </div>
        <div class="review-badge"><i class="fab fa-google"></i></div>
      </div>
      ${r.service ? `<div class="review-service"><i class="fas fa-stethoscope"></i> ${r.service}</div>` : ''}
      <p class="review-text">${r.text}</p>
      <div class="review-date">${formatDate(r.date)}</div>
    </div>
  `).join('');

  // Observe new fade-in elements
  document.querySelectorAll('.review-card.fade-in:not(.visible)').forEach(el => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    observer.observe(el);
  });
}

function submitReview(e) {
  e.preventDefault();

  const name = document.getElementById('reviewName').value.trim();
  const rating = parseInt(document.getElementById('reviewRating').value);
  const service = document.getElementById('reviewService').value;
  const text = document.getElementById('reviewText').value.trim();

  if (rating === 0) {
    showToast('Please select a star rating.', 'error');
    return;
  }

  const review = {
    name, rating, service, text,
    date: new Date().toISOString().split('T')[0]
  };

  const reviews = getData('reviews');
  reviews.unshift(review);
  setData('reviews', reviews);

  loadReviews();
  showToast('Thank you for your review of Shree Physiotherapy Clinic!', 'success');

  // Reset form
  document.getElementById('reviewForm').reset();
  document.getElementById('reviewRating').value = '0';
  document.querySelectorAll('#starRating .star').forEach(s => s.classList.remove('active'));
}
