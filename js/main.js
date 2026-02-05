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

    // Clean phone number - remove spaces, dashes, parentheses
    p = p.replace(/[\s\-\(\)]/g, "");

    // Add India country code if not present
    if (p.length === 10 && !p.startsWith("91")) {
      p = "91" + p;
    }
    // Remove + if present
    if (p.startsWith("+")) {
      p = p.substring(1);
    }

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
     12. BLOG PREVIEW — RSS-fed with static fallback
     ---------------------------------------------------------- */
  var RSS_FEEDS = [
    "https://www.physio-pedia.com/Special:RecentChanges?feed=rss",
    "https://medlineplus.gov/feeds/topic/exerciseandphysicalfitness.xml",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/1sOgWz3rOJMVMSbiAAiD0QOVG1iqHZfsO3GBnociXMrX2xLSmR/?limit=20&utm_campaign=pubmed-2&fc=20220101000000"
  ];

  var RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json?rss_url=";

  var BLOG_CACHE_KEY = "blogArticlesCache";
  var BLOG_CACHE_TIME_KEY = "blogArticlesCacheTime";
  var CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  var STATIC_ARTICLES = [
    { title: "5 Proven Ways to Relieve Lower Back Pain", summary: "Lower back pain affects millions worldwide. Discover five evidence-based physiotherapy techniques for lasting relief without medication or surgery.", category: "Pain Management", categoryIcon: "fas fa-hand-holding-medical", source: "Shree Physio", link: "#blog", date: "2025-04-20" },
    { title: "What is Fascial Manipulation?", summary: "Fascial manipulation is a revolutionary manual therapy targeting connective tissue. Learn how this specialised treatment addresses chronic pain at its source.", category: "Fascial Therapy", categoryIcon: "fas fa-hand-sparkles", source: "Shree Physio", link: "#blog", date: "2025-03-28" },
    { title: "Women's Health Physiotherapy Guide", summary: "From prenatal care to postpartum recovery and pelvic floor rehabilitation, women's health physiotherapy offers solutions for every stage of life.", category: "Women's Health", categoryIcon: "fas fa-person-dress", source: "Shree Physio", link: "#blog", date: "2025-03-15" },
    { title: "Understanding Frozen Shoulder: Causes and Treatment", summary: "Frozen shoulder can severely limit your range of motion. Learn about the stages, causes, and how physiotherapy can restore full shoulder mobility.", category: "Shoulder Care", categoryIcon: "fas fa-hand-fist", source: "Shree Physio", link: "#blog", date: "2025-03-01" },
    { title: "Neck Pain from Desk Work: A Physiotherapist's Guide", summary: "Prolonged desk work causes cervical strain. Here are ergonomic tips and exercises recommended by physiotherapists to prevent and treat neck pain.", category: "Ergonomics", categoryIcon: "fas fa-desktop", source: "Shree Physio", link: "#blog", date: "2025-02-20" },
    { title: "Post-Surgical Rehabilitation: What to Expect", summary: "Recovery after surgery requires structured rehabilitation. Learn the phases of post-surgical physiotherapy and how to optimise your healing process.", category: "Rehabilitation", categoryIcon: "fas fa-hospital", source: "Shree Physio", link: "#blog", date: "2025-02-10" },
    { title: "Benefits of Physiotherapy for Senior Citizens", summary: "Physiotherapy helps elderly patients maintain mobility, prevent falls, and manage age-related conditions. Discover how home-based physio supports ageing gracefully.", category: "Elderly Care", categoryIcon: "fas fa-house-chimney-medical", source: "Shree Physio", link: "#blog", date: "2025-01-30" },
    { title: "Sciatica: Causes, Symptoms and Physiotherapy Treatment", summary: "Sciatica causes radiating leg pain from a compressed nerve. Learn about evidence-based physiotherapy approaches that provide effective relief.", category: "Pain Management", categoryIcon: "fas fa-hand-holding-medical", source: "Shree Physio", link: "#blog", date: "2025-01-20" },
    { title: "How Physiotherapy Helps Stroke Recovery", summary: "Neurological rehabilitation after stroke is critical for regaining function. Understand how targeted physiotherapy exercises rebuild motor skills and independence.", category: "Neuro Rehab", categoryIcon: "fas fa-brain", source: "Shree Physio", link: "#blog", date: "2025-01-10" },
    { title: "Knee Replacement Recovery: Your Complete Guide", summary: "Knee replacement surgery requires dedicated rehabilitation. Learn the exercises, milestones, and physiotherapy protocols for a successful recovery.", category: "Rehabilitation", categoryIcon: "fas fa-bone", source: "Shree Physio", link: "#blog", date: "2024-12-28" },
    { title: "Pelvic Floor Exercises: Why They Matter", summary: "Pelvic floor strengthening is essential for women's health. A physiotherapist explains the best exercises for prevention and treatment of pelvic dysfunction.", category: "Women's Health", categoryIcon: "fas fa-person-dress", source: "Shree Physio", link: "#blog", date: "2024-12-18" },
    { title: "Managing Arthritis with Physiotherapy", summary: "Physiotherapy is one of the most effective non-surgical treatments for arthritis. Learn exercises and techniques that reduce joint pain and improve mobility.", category: "Joint Health", categoryIcon: "fas fa-bone", source: "Shree Physio", link: "#blog", date: "2024-12-08" },
    { title: "Sports Injury Prevention: Tips from a Physiotherapist", summary: "Prevent common sports injuries with proper warm-up routines, strengthening exercises, and biomechanical awareness guided by physiotherapy principles.", category: "Sports Physio", categoryIcon: "fas fa-running", source: "Shree Physio", link: "#blog", date: "2024-11-28" },
    { title: "The Science Behind Deep Tissue Massage", summary: "Deep tissue massage targets the inner layers of muscles and connective tissue. Understand how it works and when physiotherapists recommend it.", category: "Manual Therapy", categoryIcon: "fas fa-hands", source: "Shree Physio", link: "#blog", date: "2024-11-18" },
    { title: "Posture Correction: A Step-by-Step Guide", summary: "Poor posture leads to chronic pain and reduced mobility. Follow this physiotherapist-designed guide to correct your posture and prevent future problems.", category: "Ergonomics", categoryIcon: "fas fa-person", source: "Shree Physio", link: "#blog", date: "2024-11-08" },
    { title: "What is Dry Needling and How Does It Work?", summary: "Dry needling targets myofascial trigger points to relieve pain. Learn the differences from acupuncture and when physiotherapists use this technique.", category: "Pain Management", categoryIcon: "fas fa-syringe", source: "Shree Physio", link: "#blog", date: "2024-10-28" },
    { title: "Breathing Exercises for Pain Management", summary: "Controlled breathing techniques can significantly reduce pain perception. Discover physiotherapy-guided breathing methods for chronic pain relief.", category: "Pain Management", categoryIcon: "fas fa-lungs", source: "Shree Physio", link: "#blog", date: "2024-10-18" },
    { title: "Ankle Sprain Recovery: Do's and Don'ts", summary: "Ankle sprains are common but improper recovery leads to chronic instability. Follow this physiotherapy guide for safe and complete ankle rehabilitation.", category: "Rehabilitation", categoryIcon: "fas fa-shoe-prints", source: "Shree Physio", link: "#blog", date: "2024-10-08" },
    { title: "Physiotherapy for Cerebral Palsy in Children", summary: "Paediatric physiotherapy helps children with cerebral palsy improve motor function, coordination, and independence through age-appropriate therapeutic exercises.", category: "Pediatrics", categoryIcon: "fas fa-child", source: "Shree Physio", link: "#blog", date: "2024-09-28" },
    { title: "How to Prevent Falls in the Elderly", summary: "Fall prevention in seniors requires balance training, strength exercises, and home modifications. A physiotherapist's comprehensive prevention guide.", category: "Elderly Care", categoryIcon: "fas fa-house-chimney-medical", source: "Shree Physio", link: "#blog", date: "2024-09-18" },
    { title: "Carpal Tunnel Syndrome: Physiotherapy Solutions", summary: "Carpal tunnel causes numbness and tingling in the hand. Learn nerve gliding exercises and ergonomic strategies recommended by physiotherapists.", category: "Ergonomics", categoryIcon: "fas fa-hand", source: "Shree Physio", link: "#blog", date: "2024-09-08" },
    { title: "Prenatal Physiotherapy: Preparing Your Body for Birth", summary: "Prenatal physiotherapy strengthens key muscle groups, reduces pregnancy discomfort, and prepares the body for labour and delivery.", category: "Women's Health", categoryIcon: "fas fa-person-dress", source: "Shree Physio", link: "#blog", date: "2024-08-28" },
    { title: "Understanding Muscle Spasms and How to Treat Them", summary: "Muscle spasms can be painful and debilitating. Learn the common causes and physiotherapy techniques to manage and prevent recurring spasms.", category: "Pain Management", categoryIcon: "fas fa-bolt", source: "Shree Physio", link: "#blog", date: "2024-08-18" },
    { title: "Tennis Elbow: Exercises That Actually Work", summary: "Tennis elbow causes persistent pain in the outer elbow. Discover the strengthening and stretching exercises physiotherapists recommend for recovery.", category: "Sports Physio", categoryIcon: "fas fa-dumbbell", source: "Shree Physio", link: "#blog", date: "2024-08-08" },
    { title: "Physiotherapy After a Road Traffic Accident", summary: "Accident injuries require specialised rehabilitation. Learn how physiotherapy addresses whiplash, fractures, and soft tissue injuries post-accident.", category: "Rehabilitation", categoryIcon: "fas fa-car-burst", source: "Shree Physio", link: "#blog", date: "2024-07-28" },
    { title: "The Role of Physiotherapy in Managing Diabetes", summary: "Regular physiotherapy and exercise programs help diabetic patients manage blood sugar levels, improve circulation, and prevent complications.", category: "Chronic Care", categoryIcon: "fas fa-heartbeat", source: "Shree Physio", link: "#blog", date: "2024-07-18" },
    { title: "Herniated Disc: When to See a Physiotherapist", summary: "A herniated disc can cause severe back and leg pain. Learn which symptoms warrant physiotherapy intervention and what treatment approaches are most effective.", category: "Spine Care", categoryIcon: "fas fa-spine", source: "Shree Physio", link: "#blog", date: "2024-07-08" },
    { title: "Aquatic Physiotherapy: Healing Through Water", summary: "Water-based exercises reduce joint stress while providing resistance for strengthening. Explore how aquatic physiotherapy benefits various conditions.", category: "Rehabilitation", categoryIcon: "fas fa-water", source: "Shree Physio", link: "#blog", date: "2024-06-28" },
    { title: "TMJ Disorders: How Physiotherapy Can Help", summary: "Temporomandibular joint disorders cause jaw pain and limited mouth opening. Learn physiotherapy techniques for TMJ relief and long-term management.", category: "Pain Management", categoryIcon: "fas fa-tooth", source: "Shree Physio", link: "#blog", date: "2024-06-18" },
    { title: "Balance Training: Exercises for All Ages", summary: "Good balance prevents falls and improves athletic performance. A physiotherapist shares progressive balance exercises suitable for every age group.", category: "Fitness", categoryIcon: "fas fa-person-walking", source: "Shree Physio", link: "#blog", date: "2024-06-08" },
    { title: "Plantar Fasciitis: Effective Home Remedies and Physio", summary: "Heel pain from plantar fasciitis responds well to physiotherapy. Discover stretching, strengthening, and self-care strategies for lasting relief.", category: "Foot Care", categoryIcon: "fas fa-shoe-prints", source: "Shree Physio", link: "#blog", date: "2024-05-28" },
    { title: "Physiotherapy for Parkinson's Disease", summary: "Parkinson's affects movement and balance. Learn how specialised physiotherapy programs help maintain mobility and quality of life for patients.", category: "Neuro Rehab", categoryIcon: "fas fa-brain", source: "Shree Physio", link: "#blog", date: "2024-05-18" }
  ];

  var CATEGORY_ICONS = {
    "Pain Management": "fas fa-hand-holding-medical",
    "Fascial Therapy": "fas fa-hand-sparkles",
    "Women's Health": "fas fa-person-dress",
    "Rehabilitation": "fas fa-hospital",
    "Elderly Care": "fas fa-house-chimney-medical",
    "Neuro Rehab": "fas fa-brain",
    "Sports Physio": "fas fa-running",
    "Ergonomics": "fas fa-desktop",
    "Joint Health": "fas fa-bone",
    "Pediatrics": "fas fa-child",
    "Fitness": "fas fa-person-walking",
    "Health News": "fas fa-newspaper",
    "Research": "fas fa-flask"
  };

  function getDailyRotationSeed() {
    var now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  }

  function seededShuffle(arr, seed) {
    var shuffled = arr.slice();
    var m = shuffled.length;
    while (m) {
      seed = (seed * 9301 + 49297) % 233280;
      var i = Math.floor((seed / 233280) * m);
      m--;
      var tmp = shuffled[m];
      shuffled[m] = shuffled[i];
      shuffled[i] = tmp;
    }
    return shuffled;
  }

  function pickDailyArticles(articles, count) {
    var seed = getDailyRotationSeed();
    var shuffled = seededShuffle(articles, seed);
    return shuffled.slice(0, count);
  }

  function isRecentArticle(dateStr) {
    if (!dateStr) return false;
    var articleDate = new Date(dateStr);
    var now = new Date();
    var diffDays = (now - articleDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  function fetchBlogFromRSS() {
    // Check cache first
    var cachedTime = localStorage.getItem(BLOG_CACHE_TIME_KEY);
    var cachedData = localStorage.getItem(BLOG_CACHE_KEY);

    if (cachedTime && cachedData) {
      var elapsed = Date.now() - parseInt(cachedTime, 10);
      if (elapsed < CACHE_DURATION) {
        try {
          var parsed = JSON.parse(cachedData);
          if (parsed && parsed.length > 0) {
            renderBlogPreview(parsed);
            return;
          }
        } catch (e) { /* fall through */ }
      }
    }

    var allArticles = [];
    var feedsCompleted = 0;
    var totalFeeds = RSS_FEEDS.length;

    RSS_FEEDS.forEach(function (feedUrl) {
      var apiUrl = RSS2JSON_BASE + encodeURIComponent(feedUrl);

      fetch(apiUrl)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.status === "ok" && data.items && data.items.length > 0) {
            data.items.forEach(function (item) {
              var summary = item.description || item.content || "";
              // Strip HTML tags
              summary = summary.replace(/<[^>]*>/g, "").trim();
              if (summary.length > 160) {
                summary = summary.substring(0, 157) + "...";
              }

              allArticles.push({
                title: item.title || "Health Article",
                summary: summary || "Read this latest health and physiotherapy article.",
                category: "Health News",
                categoryIcon: "fas fa-newspaper",
                source: data.feed ? data.feed.title || "Health Source" : "Health Source",
                link: item.link || "#blog",
                date: item.pubDate ? item.pubDate.split(" ")[0] : new Date().toISOString().split("T")[0]
              });
            });
          }
        })
        .catch(function () { /* silently fail for this feed */ })
        .finally(function () {
          feedsCompleted++;
          if (feedsCompleted === totalFeeds) {
            if (allArticles.length > 0) {
              // Combine RSS articles with static fallback for variety
              var combined = allArticles.concat(STATIC_ARTICLES);
              try {
                localStorage.setItem(BLOG_CACHE_KEY, JSON.stringify(combined));
                localStorage.setItem(BLOG_CACHE_TIME_KEY, String(Date.now()));
              } catch (e) { /* storage full, ignore */ }
              renderBlogPreview(combined);
            } else {
              // All feeds failed — use static fallback
              renderBlogPreview(STATIC_ARTICLES);
            }
          }
        });
    });
  }

  function renderBlogPreview(articles) {
    var grid = document.getElementById("blogPreviewGrid");
    if (!grid) return;

    var selected = pickDailyArticles(articles, 6);

    grid.innerHTML = "";

    selected.forEach(function (blog) {
      var card = document.createElement("div");
      card.className = "blog-card fade-in";

      var iconClass = blog.categoryIcon || CATEGORY_ICONS[blog.category] || "fas fa-newspaper";
      var isNew = isRecentArticle(blog.date);
      var newBadge = isNew ? '<span class="blog-new-badge">New</span>' : "";
      var sourceBadge = blog.source ? '<span class="blog-source-badge">' + escapeHTML(blog.source) + "</span>" : "";
      var readTime = Math.max(3, Math.ceil((blog.summary || "").split(" ").length / 40)) + " min read";
      var linkUrl = blog.link || "blog.html";
      var isExternal = linkUrl.indexOf("http") === 0;
      var targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      // Default to blog page for articles without external links
      if (!blog.link) linkUrl = "blog.html#" + (blog.category || "").toLowerCase().replace(/\s+/g, '-');

      card.innerHTML =
        '<div class="blog-card-image">' +
        '  <div class="blog-card-icon"><i class="' + iconClass + '"></i></div>' +
        '  <span class="blog-category-badge">' + escapeHTML(blog.category) + "</span>" +
        newBadge +
        "</div>" +
        '<div class="blog-card-content">' +
        '  <div class="blog-card-meta">' +
        '    <span class="blog-date">' + formatDateFull(blog.date) + "</span>" +
        '    <span class="blog-read-time">' + escapeHTML(readTime) + "</span>" +
        "  </div>" +
        "  <h3>" + escapeHTML(blog.title) + "</h3>" +
        "  <p>" + escapeHTML(blog.summary) + "</p>" +
        '  <div class="blog-card-footer">' +
        sourceBadge +
        '    <a href="' + escapeHTML(linkUrl) + '"' + targetAttr + ' class="read-more-link">Read More &rarr;</a>' +
        "  </div>" +
        "</div>";

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
    fetchBlogFromRSS();
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
