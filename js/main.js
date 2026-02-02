/* ============================================================
   Shree Physiotherapy Clinic - Main JavaScript
   Phone: 8220040844 | 9092294466
   WhatsApp: 919092294466
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. NAVBAR SCROLL EFFECT
     ---------------------------------------------------------- */
  function handleNavbarScroll() {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  /* ----------------------------------------------------------
     2. MOBILE MENU TOGGLE
     ---------------------------------------------------------- */
  function setupHamburger() {
    var hamburger = document.getElementById("hamburger");
    var navMenu = document.getElementById("navMenu");
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      hamburger.classList.toggle("active");
    });

    // Close menu on link click
    var links = navMenu.querySelectorAll("a");
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
      });
    });
  }

  // Legacy support for inline onclick
  window.toggleMobileMenu = function () {
    var navMenu = document.getElementById("navMenu");
    var hamburger = document.getElementById("hamburger");
    if (navMenu) navMenu.classList.toggle("active");
    if (hamburger) hamburger.classList.toggle("active");
  };

  /* ----------------------------------------------------------
     3. SMOOTH SCROLL
     ---------------------------------------------------------- */
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#" || href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var navbarOffset = 80;
        var targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - navbarOffset;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      });
    });
  }

  /* ----------------------------------------------------------
     4. INTERSECTION OBSERVER ANIMATIONS
     ---------------------------------------------------------- */
  function setupScrollAnimations() {
    var fadeElements = document.querySelectorAll(".fade-in");
    if (fadeElements.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------
     5. STAT COUNTER ANIMATION
     ---------------------------------------------------------- */
  function setupStatCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length === 0) return;

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var duration = 2000;
    var start = 0;
    var startTime = null;
    var suffix = "";

    if (target >= 1000) {
      suffix = "+";
    } else if (target === 98) {
      suffix = "%";
    } else if (target <= 15) {
      suffix = "+";
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.floor(progress * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     6. TOAST NOTIFICATIONS
     ---------------------------------------------------------- */
  var toastTimeout = null;

  window.showToast = function (message, type) {
    var toast = document.getElementById("toast");
    var toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage) return;

    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }

    toast.classList.remove("show", "success", "error");
    toastMessage.textContent = message;

    if (type === "success" || type === "error") {
      toast.classList.add(type);
    }

    void toast.offsetWidth;
    toast.classList.add("show");

    toastTimeout = setTimeout(function () {
      toast.classList.remove("show");
      toastTimeout = null;
    }, 3000);
  };

  /* ----------------------------------------------------------
     7. MODAL HELPERS
     ---------------------------------------------------------- */
  window.openModal = function (id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.add("active");
  };

  window.closeModal = function (id) {
    var modal = document.getElementById(id);
    if (modal) modal.classList.remove("active");
  };

  function setupModalOverlayClose() {
    document.addEventListener("click", function (e) {
      if (
        e.target.classList.contains("modal-overlay") &&
        e.target.classList.contains("active")
      ) {
        e.target.classList.remove("active");
      }
    });
  }

  /* ----------------------------------------------------------
     8. LOCALSTORAGE HELPERS
     ---------------------------------------------------------- */
  window.getData = function (key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("getData error:", err);
      return [];
    }
  };

  window.setData = function (key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error("setData error:", err);
    }
  };

  window.generateId = function () {
    return "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  };

  /* ----------------------------------------------------------
     9. DATE FORMATTING
     ---------------------------------------------------------- */
  window.formatDate = function (date) {
    var d = new Date(date);
    var day = String(d.getDate()).padStart(2, "0");
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var year = d.getFullYear();
    return day + "/" + month + "/" + year;
  };

  window.formatDateFull = function (date) {
    var d = new Date(date);
    var months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  };

  /* ----------------------------------------------------------
     10. WHATSAPP HELPER
     ---------------------------------------------------------- */
  window.openWhatsApp = function (phone, message) {
    var p = phone || "919092294466";
    var msg = message || "";
    var url = "https://wa.me/" + p;
    if (msg) {
      url += "?text=" + encodeURIComponent(msg);
    }
    window.open(url, "_blank");
  };

  /* ----------------------------------------------------------
     11. GOOGLE REVIEWS SYSTEM
     ---------------------------------------------------------- */
  var DEFAULT_REVIEWS = [
    {
      id: "default_1",
      name: "Priya S",
      rating: 5,
      service: "Fascial Manipulation",
      text: "Dr. Aarthi's fascial manipulation therapy is incredible! I had been suffering from chronic shoulder pain for over two years and nothing seemed to help. After just a few sessions, I felt a remarkable improvement. Her deep understanding of the fascial system and gentle yet effective approach made all the difference. Highly recommend Shree Physiotherapy to anyone dealing with persistent pain.",
      date: "2025-01-15",
    },
    {
      id: "default_2",
      name: "Karthik M",
      rating: 5,
      service: "Orthopedic Rehabilitation",
      text: "After my knee surgery, the rehabilitation program at Shree Physiotherapy was exactly what I needed. The personalised exercise plan and consistent monitoring helped me regain full mobility in just three months. The clinic is well-equipped and the staff is incredibly supportive. I went from barely walking to playing weekend cricket again!",
      date: "2025-02-20",
    },
    {
      id: "default_3",
      name: "Lakshmi R",
      rating: 5,
      service: "Women's Health Physio",
      text: "As a woman, I was looking for a female physiotherapist who truly understands women's health issues. Dr. Aarthi provided exceptional care for my postpartum recovery. She was patient, knowledgeable, and created a safe, comfortable environment. Her pelvic floor rehabilitation programme gave me my confidence back. I cannot thank her enough.",
      date: "2025-03-10",
    },
    {
      id: "default_4",
      name: "Senthil Kumar",
      rating: 4,
      service: "Elderly Home Care",
      text: "My mother needed physiotherapy at home after her hip fracture. The home visit service from Shree Physiotherapy was a blessing. The therapist was punctual, respectful, and very gentle with my 78-year-old mother. The exercises were tailored to her capacity and she showed steady improvement over the weeks. Very grateful for this service.",
      date: "2025-04-05",
    },
  ];

  var selectedRating = 0;

  function initStarRating() {
    var starRating = document.getElementById("starRating");
    if (!starRating) return;

    var stars = starRating.querySelectorAll("i, .star");

    if (stars.length === 0) {
      starRating.innerHTML = "";
      for (var i = 1; i <= 5; i++) {
        var star = document.createElement("span");
        star.textContent = "\u2605";
        star.setAttribute("data-value", i);
        star.className = "star";
        star.style.cursor = "pointer";
        star.style.fontSize = "1.8rem";
        star.style.color = "#ccc";
        star.style.transition = "color 0.2s ease";
        starRating.appendChild(star);
      }
      stars = starRating.querySelectorAll("span");
    }

    stars.forEach(function (star) {
      star.addEventListener("click", function () {
        selectedRating = parseInt(this.getAttribute("data-rating") || this.getAttribute("data-value"), 10);
        highlightStars(stars, selectedRating);
      });
      star.addEventListener("mouseenter", function () {
        var hoverVal = parseInt(this.getAttribute("data-rating") || this.getAttribute("data-value"), 10);
        highlightStars(stars, hoverVal);
      });
      star.addEventListener("mouseleave", function () {
        highlightStars(stars, selectedRating);
      });
    });
  }

  function highlightStars(stars, count) {
    stars.forEach(function (star) {
      var val = parseInt(star.getAttribute("data-rating") || star.getAttribute("data-value"), 10);
      if (val <= count) {
        star.style.color = "#f5a623";
        star.classList.add("active");
      } else {
        star.style.color = "#ccc";
        star.classList.remove("active");
      }
    });
  }

  function buildStarsHTML(rating) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
      if (i <= rating) {
        html += '<span class="star filled">\u2605</span>';
      } else {
        html += '<span class="star">\u2605</span>';
      }
    }
    return html;
  }

  function getInitial(name) {
    return name ? name.charAt(0).toUpperCase() : "?";
  }

  function loadReviews() {
    var grid = document.getElementById("reviewsGrid");
    if (!grid) return;

    var userReviews = getData("reviews");
    var allReviews = DEFAULT_REVIEWS.concat(userReviews);

    allReviews.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    grid.innerHTML = "";

    allReviews.forEach(function (review) {
      var card = document.createElement("div");
      card.className = "review-card fade-in";

      card.innerHTML =
        '<div class="review-header">' +
        '  <div class="review-avatar">' + getInitial(review.name) + "</div>" +
        '  <div class="review-info">' +
        '    <h4 class="review-name">' + escapeHTML(review.name) + "</h4>" +
        '    <div class="review-stars">' + buildStarsHTML(review.rating) + "</div>" +
        "  </div>" +
        '  <div class="google-badge">' +
        '    <svg viewBox="0 0 24 24" width="20" height="20">' +
        '      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>' +
        '      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
        '      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
        '      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
        "    </svg>" +
        "  </div>" +
        "</div>" +
        '<span class="review-service">' + escapeHTML(review.service) + "</span>" +
        '<p class="review-text">' + escapeHTML(review.text) + "</p>" +
        '<span class="review-date">' + formatDateFull(review.date) + "</span>";

      grid.appendChild(card);
    });

    // Observe new cards for animation
    var newCards = grid.querySelectorAll(".fade-in:not(.visible)");
    if (newCards.length > 0) {
      var cardObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      newCards.forEach(function (el) {
        cardObserver.observe(el);
      });
    }
  }

  window.submitReview = function (event) {
    if (event) event.preventDefault();

    var nameInput = document.getElementById("reviewName");
    var serviceInput = document.getElementById("reviewService");
    var textInput = document.getElementById("reviewText");

    if (!nameInput || !serviceInput || !textInput) return;

    var name = nameInput.value.trim();
    var service = serviceInput.value.trim();
    var text = textInput.value.trim();

    if (selectedRating === 0) {
      showToast("Please select a star rating.", "error");
      return;
    }
    if (!name || !service || !text) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    var review = {
      id: generateId(),
      name: name,
      rating: selectedRating,
      service: service,
      text: text,
      date: new Date().toISOString().split("T")[0],
    };

    var reviews = getData("reviews");
    reviews.push(review);
    setData("reviews", reviews);

    loadReviews();

    nameInput.value = "";
    if (serviceInput.tagName === "SELECT") {
      serviceInput.selectedIndex = 0;
    } else {
      serviceInput.value = "";
    }
    textInput.value = "";
    selectedRating = 0;

    var starRating = document.getElementById("starRating");
    if (starRating) {
      var stars = starRating.querySelectorAll("i, .star");
      highlightStars(stars, 0);
    }

    showToast("Thank you for your review!", "success");
  };

  /* ----------------------------------------------------------
     12. BLOG PREVIEW
     ---------------------------------------------------------- */
  var BLOG_PREVIEWS = [
    {
      title: "5 Proven Ways to Relieve Lower Back Pain",
      icon: "fas fa-spine",
      summary: "Lower back pain affects millions of people worldwide. Discover five evidence-based physiotherapy techniques that can help you find lasting relief without medication or surgery.",
      category: "Pain Management",
      categoryIcon: "fas fa-hand-holding-medical",
      readTime: "5 min read",
      date: "2025-04-20",
    },
    {
      title: "What is Fascial Manipulation?",
      icon: "fas fa-hand-sparkles",
      summary: "Fascial manipulation is a revolutionary manual therapy technique that targets the body's connective tissue. Learn how this specialised treatment can address chronic pain at its source.",
      category: "Fascial Therapy",
      categoryIcon: "fas fa-hand-sparkles",
      readTime: "7 min read",
      date: "2025-03-28",
    },
    {
      title: "Women's Health Physiotherapy Guide",
      icon: "fas fa-person-dress",
      summary: "From prenatal care to postpartum recovery and pelvic floor rehabilitation, women's health physiotherapy offers specialised solutions for every stage of life.",
      category: "Women's Health",
      categoryIcon: "fas fa-person-dress",
      readTime: "6 min read",
      date: "2025-03-15",
    },
  ];

  function renderBlogPreview() {
    var grid = document.getElementById("blogPreviewGrid");
    if (!grid) return;

    grid.innerHTML = "";

    BLOG_PREVIEWS.forEach(function (blog) {
      var card = document.createElement("div");
      card.className = "blog-card fade-in";

      card.innerHTML =
        '<div class="blog-card-image">' +
        '  <div class="blog-card-icon"><i class="' + (blog.categoryIcon || 'fas fa-newspaper') + '"></i></div>' +
        '  <span class="blog-category-badge">' + escapeHTML(blog.category) + "</span>" +
        "</div>" +
        '<div class="blog-card-content">' +
        '  <div class="blog-card-meta">' +
        '    <span class="blog-date">' + formatDateFull(blog.date) + "</span>" +
        '    <span class="blog-read-time">' + escapeHTML(blog.readTime) + "</span>" +
        "  </div>" +
        "  <h3>" + escapeHTML(blog.title) + "</h3>" +
        "  <p>" + escapeHTML(blog.summary) + "</p>" +
        '  <a href="#blog" class="read-more-link">Read More &rarr;</a>' +
        "</div>";

      grid.appendChild(card);
    });
  }

  /* ----------------------------------------------------------
     UTILITY: Escape HTML
     ---------------------------------------------------------- */
  function escapeHTML(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ----------------------------------------------------------
     13. DOM CONTENT LOADED
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initStarRating();
    loadReviews();
    renderBlogPreview();
    setupScrollAnimations();
    setupStatCounters();
    window.addEventListener("scroll", handleNavbarScroll);
    handleNavbarScroll();
    setupSmoothScroll();
    setupHamburger();
    setupModalOverlayClose();

    var reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
      reviewForm.addEventListener("submit", submitReview);
    }
  });
})();
