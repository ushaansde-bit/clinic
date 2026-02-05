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
     7B. SERVICE MODAL SYSTEM
     ---------------------------------------------------------- */
  var SERVICE_DATA = {
    'fascial-manipulation': {
      title: 'Fascial Manipulation',
      icon: 'fas fa-hand-sparkles',
      content: `
        <div class="service-detail-intro">
          <p>Fascial Manipulation is a revolutionary manual therapy technique developed in Italy by physiotherapist Luigi Stecco. At Shree Physiotherapy Clinic, Dr. Aarthi is one of the few certified practitioners of this advanced technique in the region.</p>
        </div>

        <h3><i class="fas fa-question-circle"></i> What is Fascia?</h3>
        <p>Fascia is the connective tissue that surrounds and interconnects every muscle, bone, nerve, and organ in your body. Think of it as a three-dimensional web that holds your entire body together. When fascia becomes restricted or damaged, it can cause pain that seems unrelated to the original injury site.</p>

        <h3><i class="fas fa-stethoscope"></i> How Does Fascial Manipulation Work?</h3>
        <p>Unlike traditional massage or physiotherapy, Fascial Manipulation targets specific points called "Centers of Coordination" (CC) and "Centers of Fusion" (CF). By applying precise friction to these points, we can:</p>
        <ul>
          <li>Release deep tissue restrictions that other therapies cannot reach</li>
          <li>Restore normal gliding between fascial layers</li>
          <li>Eliminate referred pain patterns</li>
          <li>Improve range of motion immediately</li>
        </ul>

        <h3><i class="fas fa-check-circle"></i> Conditions We Treat</h3>
        <ul>
          <li>Chronic neck and back pain</li>
          <li>Frozen shoulder (Adhesive Capsulitis)</li>
          <li>Tennis elbow and Golfer's elbow</li>
          <li>Carpal tunnel syndrome</li>
          <li>Sciatica and leg pain</li>
          <li>Headaches and migraines</li>
          <li>Post-surgical stiffness</li>
          <li>Sports injuries</li>
        </ul>

        <h3><i class="fas fa-bolt"></i> Why Choose Fascial Manipulation?</h3>
        <div class="service-benefits">
          <div class="benefit-item">
            <i class="fas fa-clock"></i>
            <span><strong>Immediate Results:</strong> Most patients experience significant relief within 1-3 sessions</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-pills"></i>
            <span><strong>Drug-Free:</strong> No medications or injections required</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-bullseye"></i>
            <span><strong>Root Cause Treatment:</strong> Addresses the source of pain, not just symptoms</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-infinity"></i>
            <span><strong>Long-Lasting Relief:</strong> Results are sustained with proper follow-up care</span>
          </div>
        </div>
      `
    },
    'orthopedic-rehabilitation': {
      title: 'Orthopedic Rehabilitation',
      icon: 'fas fa-bone',
      content: `
        <div class="service-detail-intro">
          <p>Orthopedic rehabilitation at Shree Physiotherapy Clinic combines evidence-based protocols with personalized care to help you recover from injuries, surgeries, and musculoskeletal conditions. Our comprehensive approach ensures optimal healing and return to normal function.</p>
        </div>

        <h3><i class="fas fa-procedures"></i> Post-Surgical Rehabilitation</h3>
        <p>We specialize in rehabilitation following:</p>
        <ul>
          <li><strong>Joint Replacements:</strong> Total knee replacement (TKR), total hip replacement (THR), shoulder replacement</li>
          <li><strong>Fracture Surgeries:</strong> ORIF (Open Reduction Internal Fixation), external fixation recovery</li>
          <li><strong>Ligament Reconstructions:</strong> ACL, PCL, rotator cuff repairs</li>
          <li><strong>Spinal Surgeries:</strong> Discectomy, laminectomy, spinal fusion</li>
          <li><strong>Arthroscopic Procedures:</strong> Knee, shoulder, and ankle arthroscopy</li>
        </ul>

        <h3><i class="fas fa-running"></i> Sports Injury Management</h3>
        <p>Whether you're a professional athlete or weekend warrior, we treat:</p>
        <ul>
          <li>Muscle strains and ligament sprains</li>
          <li>Tendinitis and tendinopathy</li>
          <li>Meniscus and cartilage injuries</li>
          <li>Stress fractures</li>
          <li>Overuse injuries</li>
        </ul>

        <h3><i class="fas fa-cogs"></i> Our Rehabilitation Process</h3>
        <div class="service-process">
          <div class="process-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Comprehensive Assessment</h4>
              <p>Detailed evaluation of your condition, surgical reports, and functional limitations</p>
            </div>
          </div>
          <div class="process-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Customized Treatment Plan</h4>
              <p>Individualized rehabilitation protocol based on your specific needs and goals</p>
            </div>
          </div>
          <div class="process-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Progressive Therapy</h4>
              <p>Phase-wise progression from pain management to strengthening to functional training</p>
            </div>
          </div>
          <div class="process-step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Return to Activity</h4>
              <p>Safe and gradual return to work, sports, or daily activities</p>
            </div>
          </div>
        </div>

        <h3><i class="fas fa-tools"></i> Treatment Modalities</h3>
        <ul>
          <li>Manual therapy and joint mobilization</li>
          <li>Therapeutic exercises and stretching</li>
          <li>Electrotherapy (TENS, IFT, Ultrasound)</li>
          <li>Kinesiology taping</li>
          <li>Gait training and balance exercises</li>
          <li>Home exercise programs</li>
        </ul>
      `
    },
    'neuro-rehabilitation': {
      title: 'Neuro Rehabilitation',
      icon: 'fas fa-brain',
      content: `
        <div class="service-detail-intro">
          <p>Neurological rehabilitation requires specialized expertise and compassionate care. At Shree Physiotherapy Clinic, we help patients with neurological conditions regain independence, improve mobility, and enhance quality of life through targeted therapeutic interventions.</p>
        </div>

        <h3><i class="fas fa-heartbeat"></i> Conditions We Treat</h3>
        <ul>
          <li><strong>Stroke (CVA):</strong> Hemiplegia, hemiparesis, and post-stroke rehabilitation</li>
          <li><strong>Parkinson's Disease:</strong> Movement disorders, rigidity, and balance problems</li>
          <li><strong>Multiple Sclerosis:</strong> Fatigue management, mobility, and coordination</li>
          <li><strong>Spinal Cord Injuries:</strong> Paraplegia and quadriplegia rehabilitation</li>
          <li><strong>Traumatic Brain Injury:</strong> Cognitive and motor function recovery</li>
          <li><strong>Peripheral Neuropathy:</strong> Numbness, weakness, and balance issues</li>
          <li><strong>Bell's Palsy:</strong> Facial muscle weakness and recovery</li>
          <li><strong>Guillain-Barré Syndrome:</strong> Post-acute rehabilitation</li>
        </ul>

        <h3><i class="fas fa-brain"></i> Our Neurological Rehabilitation Approach</h3>
        <p>We utilize evidence-based neurological rehabilitation techniques including:</p>
        <ul>
          <li><strong>Bobath/NDT Concept:</strong> Facilitating normal movement patterns</li>
          <li><strong>PNF (Proprioceptive Neuromuscular Facilitation):</strong> Improving strength and coordination</li>
          <li><strong>Motor Relearning Programme:</strong> Task-specific training for functional recovery</li>
          <li><strong>Constraint-Induced Movement Therapy:</strong> Encouraging use of affected limbs</li>
          <li><strong>Balance and Gait Training:</strong> Safe mobility and fall prevention</li>
        </ul>

        <h3><i class="fas fa-chart-line"></i> Goals of Neuro Rehabilitation</h3>
        <div class="service-benefits">
          <div class="benefit-item">
            <i class="fas fa-walking"></i>
            <span><strong>Restore Mobility:</strong> Improve walking, transfers, and movement patterns</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-hand-paper"></i>
            <span><strong>Regain Function:</strong> Enhance hand function and daily activity performance</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-balance-scale"></i>
            <span><strong>Improve Balance:</strong> Reduce fall risk and increase confidence</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-home"></i>
            <span><strong>Maximize Independence:</strong> Return to home and community activities</span>
          </div>
        </div>

        <h3><i class="fas fa-users"></i> Family Involvement</h3>
        <p>We believe in involving family members in the rehabilitation process. We provide:</p>
        <ul>
          <li>Caregiver training and education</li>
          <li>Home exercise programs</li>
          <li>Home modification recommendations</li>
          <li>Assistive device guidance</li>
        </ul>
      `
    },
    'womens-health': {
      title: "Women's Health Physiotherapy",
      icon: 'fas fa-person-dress',
      content: `
        <div class="service-detail-intro">
          <p>Women's health physiotherapy addresses the unique physiological needs of women throughout all life stages. Dr. Aarthi provides compassionate, confidential care in a comfortable and private setting at Shree Physiotherapy Clinic.</p>
        </div>

        <h3><i class="fas fa-baby"></i> Prenatal (Pregnancy) Care</h3>
        <p>Physiotherapy during pregnancy helps manage common discomforts and prepares your body for childbirth:</p>
        <ul>
          <li>Lower back and pelvic girdle pain relief</li>
          <li>Sciatica management during pregnancy</li>
          <li>Safe exercise guidance for each trimester</li>
          <li>Breathing techniques for labor preparation</li>
          <li>Posture correction and body mechanics education</li>
          <li>Prevention of diastasis recti (abdominal separation)</li>
        </ul>

        <h3><i class="fas fa-heart"></i> Postnatal Recovery</h3>
        <p>After childbirth, your body needs specialized care to recover properly:</p>
        <ul>
          <li>Diastasis recti assessment and rehabilitation</li>
          <li>C-section scar tissue management</li>
          <li>Core strengthening and abdominal rehabilitation</li>
          <li>Posture correction for breastfeeding</li>
          <li>Gradual return to exercise programs</li>
          <li>Back pain from carrying and nursing</li>
        </ul>

        <h3><i class="fas fa-shield-alt"></i> Pelvic Floor Rehabilitation</h3>
        <p>Pelvic floor dysfunction affects many women but is often not discussed. We provide confidential treatment for:</p>
        <ul>
          <li><strong>Urinary Incontinence:</strong> Stress incontinence, urge incontinence, mixed incontinence</li>
          <li><strong>Pelvic Organ Prolapse:</strong> Bladder, uterine, or rectal prolapse management</li>
          <li><strong>Pelvic Pain:</strong> Chronic pelvic pain, painful intercourse (dyspareunia)</li>
          <li><strong>Post-Surgical Recovery:</strong> After hysterectomy or pelvic surgeries</li>
        </ul>

        <h3><i class="fas fa-female"></i> Other Women's Health Conditions</h3>
        <ul>
          <li>Osteoporosis management and bone health</li>
          <li>Breast cancer rehabilitation (post-mastectomy)</li>
          <li>Lymphedema management</li>
          <li>Menopausal joint and muscle pain</li>
          <li>PCOS-related musculoskeletal issues</li>
        </ul>

        <h3><i class="fas fa-lock"></i> Your Privacy Matters</h3>
        <p>All women's health consultations are conducted in a private, comfortable environment. Dr. Aarthi ensures complete confidentiality and takes time to understand your concerns without judgment.</p>
      `
    },
    'elderly-home-care': {
      title: 'Elderly Home Care Physiotherapy',
      icon: 'fas fa-house-chimney-medical',
      content: `
        <div class="service-detail-intro">
          <p>We understand that many elderly patients find it difficult to travel to clinics. Shree Physiotherapy Clinic offers dedicated home visit services, bringing professional physiotherapy care to the comfort and safety of your loved one's home.</p>
        </div>

        <h3><i class="fas fa-home"></i> Benefits of Home-Based Physiotherapy</h3>
        <ul>
          <li>Treatment in a familiar, comfortable environment</li>
          <li>No travel stress or transportation challenges</li>
          <li>Exercises tailored to home environment and available space</li>
          <li>Family can observe and learn caregiving techniques</li>
          <li>Reduced risk of infection exposure</li>
          <li>More personalized, one-on-one attention</li>
        </ul>

        <h3><i class="fas fa-user-injured"></i> Conditions We Treat at Home</h3>
        <ul>
          <li><strong>Post-Surgical Recovery:</strong> Hip/knee replacement, fracture rehabilitation</li>
          <li><strong>Stroke Rehabilitation:</strong> Home-based neuro physiotherapy</li>
          <li><strong>Arthritis Management:</strong> Joint pain, stiffness, and mobility issues</li>
          <li><strong>Parkinson's Disease:</strong> Movement and balance training</li>
          <li><strong>General Weakness:</strong> Post-hospitalization deconditioning</li>
          <li><strong>Bed-Bound Patients:</strong> Preventing complications and maintaining mobility</li>
          <li><strong>Palliative Care:</strong> Comfort and quality of life management</li>
        </ul>

        <h3><i class="fas fa-exclamation-triangle"></i> Fall Prevention Program</h3>
        <p>Falls are a leading cause of injury in the elderly. Our fall prevention program includes:</p>
        <div class="service-benefits">
          <div class="benefit-item">
            <i class="fas fa-search"></i>
            <span><strong>Risk Assessment:</strong> Identifying fall risk factors in the home</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-dumbbell"></i>
            <span><strong>Strength Training:</strong> Exercises to improve leg strength</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-balance-scale"></i>
            <span><strong>Balance Exercises:</strong> Activities to improve stability</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-lightbulb"></i>
            <span><strong>Home Modifications:</strong> Recommendations to make home safer</span>
          </div>
        </div>

        <h3><i class="fas fa-clock"></i> Our Home Visit Process</h3>
        <ol>
          <li><strong>Initial Phone Consultation:</strong> Understanding the patient's condition and needs</li>
          <li><strong>Home Assessment:</strong> Comprehensive evaluation at home</li>
          <li><strong>Treatment Plan:</strong> Customized therapy plan with family involvement</li>
          <li><strong>Regular Sessions:</strong> Scheduled visits based on treatment needs</li>
          <li><strong>Progress Updates:</strong> Regular communication with family members</li>
        </ol>

        <h3><i class="fas fa-map-marker-alt"></i> Service Area</h3>
        <p>We provide home visits throughout Coimbatore and surrounding areas. Contact us to check if your location is covered.</p>
      `
    },
    'pediatric-physiotherapy': {
      title: 'Pediatric Physiotherapy',
      icon: 'fas fa-child',
      content: `
        <div class="service-detail-intro">
          <p>Children are not small adults – they require specialized care that considers their unique developmental needs. At Shree Physiotherapy Clinic, we use child-friendly approaches to help children achieve their developmental milestones and overcome physical challenges.</p>
        </div>

        <h3><i class="fas fa-baby"></i> Developmental Conditions</h3>
        <p>We help children with various developmental challenges:</p>
        <ul>
          <li><strong>Cerebral Palsy:</strong> Improving motor function, reducing spasticity, and enhancing independence</li>
          <li><strong>Developmental Delays:</strong> Helping children who are not meeting age-appropriate milestones</li>
          <li><strong>Down Syndrome:</strong> Strengthening muscles and improving coordination</li>
          <li><strong>Autism Spectrum Disorder:</strong> Motor skill development and sensory integration</li>
          <li><strong>Muscular Dystrophy:</strong> Maintaining strength and function</li>
          <li><strong>Spina Bifida:</strong> Mobility training and adaptive techniques</li>
        </ul>

        <h3><i class="fas fa-child"></i> Common Pediatric Concerns</h3>
        <ul>
          <li>Delayed walking or crawling</li>
          <li>Toe walking</li>
          <li>Poor posture and coordination</li>
          <li>Flat feet (pes planus)</li>
          <li>Torticollis (neck tilting)</li>
          <li>Sports injuries in young athletes</li>
          <li>Post-fracture rehabilitation</li>
          <li>Juvenile arthritis</li>
        </ul>

        <h3><i class="fas fa-gamepad"></i> Our Child-Friendly Approach</h3>
        <p>We make physiotherapy fun for children through:</p>
        <div class="service-benefits">
          <div class="benefit-item">
            <i class="fas fa-puzzle-piece"></i>
            <span><strong>Play-Based Therapy:</strong> Exercises disguised as games and play activities</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-music"></i>
            <span><strong>Interactive Sessions:</strong> Using songs, stories, and toys to engage children</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-star"></i>
            <span><strong>Positive Reinforcement:</strong> Celebrating achievements to build confidence</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-users"></i>
            <span><strong>Parent Involvement:</strong> Teaching parents exercises to continue at home</span>
          </div>
        </div>

        <h3><i class="fas fa-chart-line"></i> Developmental Milestone Support</h3>
        <p>We help children achieve important milestones including:</p>
        <ul>
          <li>Head control and sitting</li>
          <li>Crawling and standing</li>
          <li>Walking and running</li>
          <li>Climbing and jumping</li>
          <li>Fine motor skills (grasping, writing)</li>
          <li>Balance and coordination</li>
        </ul>

        <h3><i class="fas fa-hands-helping"></i> Parent and Caregiver Training</h3>
        <p>Parents are an essential part of the therapy team. We provide:</p>
        <ul>
          <li>Home exercise programs</li>
          <li>Handling and positioning techniques</li>
          <li>Activity and play suggestions</li>
          <li>Progress tracking guidance</li>
          <li>Emotional support and counseling</li>
        </ul>
      `
    }
  };

  window.openServiceModal = function(serviceId) {
    var service = SERVICE_DATA[serviceId];
    if (!service) return;

    var modal = document.getElementById('serviceModal');
    if (!modal) return;

    modal.querySelector('.service-modal-icon').innerHTML = '<i class="' + service.icon + '"></i>';
    modal.querySelector('.service-modal-title').textContent = service.title;
    modal.querySelector('.service-modal-body').innerHTML = service.content;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeServiceModal = function() {
    var modal = document.getElementById('serviceModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  function setupServiceModal() {
    var modal = document.getElementById('serviceModal');
    if (!modal) return;

    modal.querySelector('.service-modal-overlay').addEventListener('click', closeServiceModal);
    modal.querySelector('.service-modal-close').addEventListener('click', closeServiceModal);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeServiceModal();
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

  // Store articles globally for popup access
  var currentArticles = [];

  function renderBlogPreview(articles) {
    var grid = document.getElementById("blogPreviewGrid");
    if (!grid) return;

    var selected = pickDailyArticles(articles, 6);
    currentArticles = selected; // Store for popup access

    grid.innerHTML = "";

    selected.forEach(function (blog, index) {
      var card = document.createElement("div");
      card.className = "blog-card fade-in";

      var iconClass = blog.categoryIcon || CATEGORY_ICONS[blog.category] || "fas fa-newspaper";
      var isNew = isRecentArticle(blog.date);
      var newBadge = isNew ? '<span class="blog-new-badge">New</span>' : "";
      var sourceBadge = blog.source ? '<span class="blog-source-badge">' + escapeHTML(blog.source) + "</span>" : "";
      var readTime = Math.max(3, Math.ceil((blog.summary || "").split(" ").length / 40)) + " min read";

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
        '    <button class="read-more-link" onclick="openArticlePopup(' + index + ')">Read More &rarr;</button>' +
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
     ARTICLE POPUP MODAL
     ---------------------------------------------------------- */
  var ARTICLE_CONTENT = {
    "5 Proven Ways to Relieve Lower Back Pain": "<p>Lower back pain affects approximately 80% of adults at some point in their lives. At Shree Physiotherapy Clinic, we use evidence-based approaches to provide lasting relief.</p><h3>1. Fascial Manipulation</h3><p>This Italian-certified technique targets the root cause of pain by releasing fascial restrictions. Unlike traditional massage, it addresses the interconnected web of connective tissue throughout your body.</p><h3>2. Core Strengthening</h3><p>A strong core provides essential support for your spine. We design personalized exercise programs that gradually build strength without aggravating your condition.</p><h3>3. Posture Correction</h3><p>Poor posture is a leading cause of back pain. We assess your daily habits and provide ergonomic recommendations for work and home.</p><h3>4. Manual Therapy</h3><p>Hands-on techniques including joint mobilization and soft tissue work help restore normal movement patterns.</p><h3>5. Heat and Cold Therapy</h3><p>Strategic use of temperature therapy reduces inflammation and promotes healing when combined with other treatments.</p><p><strong>Don't let back pain control your life.</strong> Book an appointment with Dr. Aarthi Ganesh for a comprehensive assessment and personalized treatment plan.</p>",

    "What is Fascial Manipulation?": "<p>Fascial Manipulation is a revolutionary manual therapy technique developed by Italian physiotherapist Luigi Stecco. Dr. Aarthi Ganesh is one of the few certified practitioners in this region.</p><h3>Understanding Fascia</h3><p>Fascia is the connective tissue that surrounds every muscle, bone, nerve, and organ in your body. Think of it as a three-dimensional web holding everything together.</p><h3>How It Works</h3><p>Unlike traditional treatments that focus on muscles, Fascial Manipulation targets specific points called 'Centers of Coordination' and 'Centers of Fusion'. By applying precise friction to these points, we can:</p><ul><li>Release deep tissue restrictions</li><li>Restore normal gliding between fascial layers</li><li>Eliminate referred pain patterns</li><li>Improve range of motion immediately</li></ul><h3>Conditions Treated</h3><p>Fascial Manipulation is highly effective for chronic neck pain, frozen shoulder, tennis elbow, carpal tunnel syndrome, sciatica, headaches, and post-surgical stiffness.</p><p><strong>Experience the difference</strong> of this advanced technique at Shree Physiotherapy Clinic.</p>",

    "Women's Health Physiotherapy Guide": "<p>Women's bodies undergo unique physiological changes throughout life. Dr. Aarthi Ganesh provides specialized care addressing these specific needs.</p><h3>Prenatal Care</h3><p>During pregnancy, physiotherapy helps manage lower back pain, pelvic girdle pain, and prepares your body for childbirth through safe exercises and breathing techniques.</p><h3>Postnatal Recovery</h3><p>After delivery, your body needs specialized care including diastasis recti rehabilitation, C-section scar management, and core strengthening programs.</p><h3>Pelvic Floor Rehabilitation</h3><p>Many women suffer silently from urinary incontinence, pelvic organ prolapse, or pelvic pain. Our confidential treatments help restore function and confidence.</p><h3>Menopause Management</h3><p>Hormonal changes affect joints and muscles. We provide targeted exercises and treatments for menopausal joint pain and bone health.</p><p>All consultations are conducted in a <strong>private, comfortable environment</strong> with complete confidentiality.</p>",

    "Understanding Frozen Shoulder: Causes and Treatment": "<p>Frozen shoulder (adhesive capsulitis) is a condition causing pain and stiffness that can last for months without proper treatment.</p><h3>Three Stages</h3><p><strong>Freezing Stage:</strong> Gradual onset of pain with increasing stiffness (2-9 months)</p><p><strong>Frozen Stage:</strong> Pain may decrease but stiffness remains severe (4-12 months)</p><p><strong>Thawing Stage:</strong> Gradual return of movement (6-24 months)</p><h3>Why Physiotherapy Works</h3><p>Early intervention with Fascial Manipulation and targeted exercises can significantly shorten recovery time. Our approach includes:</p><ul><li>Fascial release techniques</li><li>Gentle stretching protocols</li><li>Strengthening exercises</li><li>Home exercise programs</li></ul><p>Many patients see <strong>significant improvement within 3-5 sessions</strong> with our advanced techniques.</p>",

    "Neck Pain from Desk Work: A Physiotherapist's Guide": "<p>In today's digital age, neck pain from prolonged desk work has become increasingly common. Here's how to prevent and treat it.</p><h3>Common Causes</h3><ul><li>Forward head posture</li><li>Improper monitor height</li><li>Prolonged static positions</li><li>Stress and tension</li></ul><h3>Ergonomic Tips</h3><p><strong>Monitor Position:</strong> Top of screen at eye level, arm's length away</p><p><strong>Chair Height:</strong> Feet flat on floor, knees at 90 degrees</p><p><strong>Keyboard Position:</strong> Elbows at 90 degrees, wrists neutral</p><h3>Exercises You Can Do</h3><p>Chin tucks, neck stretches, and shoulder blade squeezes performed every hour can prevent pain buildup.</p><p>If pain persists, <strong>professional assessment is essential</strong> to identify and treat the underlying cause.</p>",

    "Post-Surgical Rehabilitation: What to Expect": "<p>Recovery after surgery requires structured rehabilitation for optimal outcomes. At Shree Physiotherapy Clinic, we guide you through every phase.</p><h3>Phase 1: Protection (Week 1-2)</h3><p>Focus on wound healing, pain management, and preventing complications like blood clots through gentle movements.</p><h3>Phase 2: Early Motion (Week 2-6)</h3><p>Gradual increase in range of motion with guided exercises while respecting tissue healing timelines.</p><h3>Phase 3: Strengthening (Week 6-12)</h3><p>Progressive resistance training to rebuild muscle strength and endurance.</p><h3>Phase 4: Functional Training (Week 12+)</h3><p>Return to daily activities, work, and sports with confidence.</p><p>Our rehabilitation programs are <strong>tailored to your specific surgery</strong> and recovery goals.</p>",

    "Benefits of Physiotherapy for Senior Citizens": "<p>Aging doesn't have to mean losing independence. Physiotherapy helps seniors maintain mobility, prevent falls, and enjoy a better quality of life.</p><h3>Fall Prevention</h3><p>Balance training and strength exercises reduce fall risk by up to 40%. We assess your home environment and recommend modifications.</p><h3>Arthritis Management</h3><p>Gentle exercises and manual therapy reduce joint pain and stiffness without medication side effects.</p><h3>Post-Surgery Recovery</h3><p>Whether it's hip replacement, knee surgery, or cardiac procedures, we help you recover safely.</p><h3>Home Care Services</h3><p>Can't travel to the clinic? Dr. Aarthi provides <strong>home visit physiotherapy</strong> services for elderly patients throughout Coimbatore.</p>",

    "Sciatica: Causes, Symptoms and Physiotherapy Treatment": "<p>Sciatica causes pain radiating from the lower back through the buttock and down the leg. Understanding the cause is key to effective treatment.</p><h3>Common Causes</h3><ul><li>Herniated disc pressing on nerve</li><li>Spinal stenosis</li><li>Piriformis syndrome</li><li>Degenerative disc disease</li></ul><h3>Symptoms</h3><p>Sharp, burning pain down one leg, numbness, tingling, or weakness in the affected leg.</p><h3>How We Treat It</h3><p>Fascial Manipulation is highly effective for sciatica, releasing restrictions that contribute to nerve compression. Combined with specific exercises and postural training, most patients experience significant relief.</p><p><strong>Early treatment prevents chronic pain</strong> - don't wait for symptoms to worsen.</p>"
  };

  window.openArticlePopup = function(index) {
    var article = currentArticles[index];
    if (!article) return;

    var modal = document.getElementById("articlePopupModal");
    if (!modal) return;

    var readTime = Math.max(3, Math.ceil((article.summary || "").split(" ").length / 40)) + " min read";
    var content = ARTICLE_CONTENT[article.title] || "<p>" + escapeHTML(article.summary) + "</p><p>For more detailed information about this topic, please book a consultation with Dr. Aarthi Ganesh. She will provide personalized advice based on your specific condition and needs.</p><h3>Why Choose Shree Physiotherapy?</h3><ul><li>Gold medalist physiotherapist</li><li>Italy-certified Fascial Manipulation specialist</li><li>Personalized treatment plans</li><li>Home visit services available</li></ul><p><strong>Take the first step towards recovery today.</strong></p>";

    modal.querySelector(".article-popup-category").textContent = article.category;
    modal.querySelector(".article-popup-title").textContent = article.title;
    modal.querySelector(".article-popup-date").innerHTML = '<i class="fas fa-calendar"></i> ' + formatDateFull(article.date);
    modal.querySelector(".article-popup-readtime").innerHTML = '<i class="fas fa-clock"></i> ' + readTime;
    modal.querySelector(".article-popup-body").innerHTML = content;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeArticlePopup = function() {
    var modal = document.getElementById("articlePopupModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  // Close on Escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      var modal = document.getElementById("articlePopupModal");
      if (modal && modal.classList.contains("active")) {
        closeArticlePopup();
      }
    }
  });

  /* ----------------------------------------------------------
     13. DOM CONTENT LOADED
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initStarRating();
    loadReviews();
    fetchBlogFromRSS();
    setupScrollAnimations();
    setupStatCounters();
    setupServiceModal();
    window.addEventListener("scroll", handleNavbarScroll);
    handleNavbarScroll();
    setupSmoothScroll();
    setupHamburger();
    setupModalOverlayClose();
    loadTestimonials();
    setupTestimonialModal();

    var reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
      reviewForm.addEventListener("submit", submitReview);
    }
  });

  /* ----------------------------------------------------------
     TESTIMONIALS AUTO-UPDATE SYSTEM
     ---------------------------------------------------------- */
  var DEFAULT_TESTIMONIALS = [
    {
      id: "default_1",
      name: "Priya Ramesh",
      service: "Back Pain Recovery",
      rating: 5,
      text: "Dr. Aarthi's fascial manipulation technique completely transformed my life. After months of chronic back pain, I found lasting relief in just a few sessions. Her expertise and gentle approach made all the difference.",
      date: "2025-01-15",
      month: 1
    },
    {
      id: "default_2",
      name: "Suganya Krishnan",
      service: "Post-Natal Care",
      rating: 5,
      text: "As a new mother, I was struggling with post-natal pain and pelvic issues. Dr. Aarthi's women's health expertise and compassionate care helped me recover beautifully. I highly recommend her to all new mothers.",
      date: "2025-02-10",
      month: 2
    },
    {
      id: "default_3",
      name: "Karthik Sundaram",
      service: "Elderly Home Care",
      rating: 5,
      text: "My father couldn't visit the clinic due to his age, and Dr. Aarthi's home care service was a blessing. She treated him at home with the same professionalism and care. His mobility improved remarkably.",
      date: "2025-03-05",
      month: 3
    },
    {
      id: "default_4",
      name: "Meena Lakshmi",
      service: "Shoulder Injury Recovery",
      rating: 5,
      text: "I had a frozen shoulder for over six months. Other treatments gave temporary relief, but Dr. Aarthi's fascial manipulation provided a permanent solution. I can now move my arm freely without any pain.",
      date: "2025-04-12",
      month: 4
    },
    {
      id: "default_5",
      name: "Rajeshwari Devi",
      service: "Knee Replacement Rehab",
      rating: 5,
      text: "After my knee replacement surgery, Dr. Aarthi's rehabilitation program was instrumental in my recovery. Her systematic approach and constant encouragement helped me walk independently again.",
      date: "2025-05-20",
      month: 5
    },
    {
      id: "default_6",
      name: "Vijayalakshmi S",
      service: "Chronic Pain Management",
      rating: 5,
      text: "I suffered from chronic neck and back pain for years. Dr. Aarthi identified the root cause through her fascial assessment and treated it effectively. Her clinic is the best in the area.",
      date: "2025-06-08",
      month: 6
    },
    {
      id: "default_7",
      name: "Anand Kumar",
      service: "Sports Injury",
      rating: 5,
      text: "As a cricket player, my career was at risk due to a persistent shoulder injury. Dr. Aarthi's treatment plan and rehabilitation exercises got me back on the field stronger than before. Truly grateful!",
      date: "2025-07-15",
      month: 7
    },
    {
      id: "default_8",
      name: "Deepa Venkatesh",
      service: "Neuro Rehabilitation",
      rating: 5,
      text: "My mother had a stroke and lost mobility on one side. Dr. Aarthi's neuro rehabilitation program showed remarkable results. Within months, she regained significant movement. The patience and expertise were outstanding.",
      date: "2025-08-22",
      month: 8
    },
    {
      id: "default_9",
      name: "Ramesh Babu",
      service: "Sciatica Treatment",
      rating: 5,
      text: "Sciatica pain made my daily life miserable. Dr. Aarthi's fascial manipulation and targeted exercises provided relief that I couldn't find elsewhere. Her knowledge of the fascial system is exceptional.",
      date: "2025-09-10",
      month: 9
    },
    {
      id: "default_10",
      name: "Saranya M",
      service: "Pediatric Physiotherapy",
      rating: 5,
      text: "My son has cerebral palsy and Dr. Aarthi has been amazing with him. Her gentle approach and child-friendly techniques have helped him achieve milestones we never thought possible. She treats him like family.",
      date: "2025-10-05",
      month: 10
    },
    {
      id: "default_11",
      name: "Gopalakrishnan R",
      service: "Post-Surgery Rehab",
      rating: 5,
      text: "After my spinal surgery, I was scared about recovery. Dr. Aarthi's careful and systematic rehabilitation approach helped me regain my confidence and mobility. Her clinic is well-equipped and hygienic.",
      date: "2025-11-18",
      month: 11
    },
    {
      id: "default_12",
      name: "Kavitha Shankar",
      service: "Pelvic Floor Therapy",
      rating: 5,
      text: "Finding a physiotherapist for pelvic floor issues was difficult until I found Dr. Aarthi. Her professional yet compassionate approach made me comfortable discussing sensitive issues. The treatment worked wonders.",
      date: "2025-12-12",
      month: 12
    }
  ];

  function getMonthlyRotationSeed() {
    var now = new Date();
    return now.getFullYear() * 100 + (now.getMonth() + 1);
  }

  function getTestimonialsForMonth() {
    var currentMonth = new Date().getMonth() + 1; // 1-12
    var userTestimonials = getData("testimonials") || [];

    // Filter testimonials for current month rotation
    var monthlyDefaults = DEFAULT_TESTIMONIALS.filter(function(t) {
      // Show testimonials that match current month or are within rotation
      var rotationIndex = (currentMonth + t.month) % 12;
      return rotationIndex < 6; // Show 6 testimonials
    });

    // If not enough, fill with seeded shuffle
    if (monthlyDefaults.length < 6) {
      var seed = getMonthlyRotationSeed();
      var shuffled = seededShuffle(DEFAULT_TESTIMONIALS.slice(), seed);
      monthlyDefaults = shuffled.slice(0, 6);
    }

    // Add recent user testimonials (last 30 days)
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    var recentUserTestimonials = userTestimonials.filter(function(t) {
      return new Date(t.date) >= thirtyDaysAgo;
    });

    // Combine: recent user testimonials first, then monthly defaults
    var combined = recentUserTestimonials.concat(monthlyDefaults);

    // Return max 6 testimonials
    return combined.slice(0, 6);
  }

  function loadTestimonials() {
    var grid = document.getElementById("testimonialsGrid");
    if (!grid) return;

    var testimonials = getTestimonialsForMonth();
    grid.innerHTML = "";

    // Google logo SVG
    var googleSVG = '<svg viewBox="0 0 24 24" width="16" height="16">' +
      '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>' +
      '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
      '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
      '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>' +
      '</svg>';

    testimonials.forEach(function(testimonial) {
      var card = document.createElement("div");
      card.className = "testimonial-card fade-in";

      var initials = getInitials(testimonial.name);
      var starsHTML = buildStarsHTML(testimonial.rating);
      var timeAgo = getTimeAgo(testimonial.date);

      card.innerHTML =
        '<div class="testimonial-google-badge">' + googleSVG + ' Google Review</div>' +
        '<div class="testimonial-stars">' + starsHTML + '</div>' +
        '<p class="testimonial-text">' + escapeHTML(testimonial.text) + '</p>' +
        '<div class="testimonial-author">' +
        '  <div class="author-avatar">' + initials + '</div>' +
        '  <div class="author-info">' +
        '    <h4>' + escapeHTML(testimonial.name) + '</h4>' +
        '    <span>' + escapeHTML(timeAgo) + '</span>' +
        '  </div>' +
        '</div>';

      grid.appendChild(card);
    });

    // Trigger fade-in animations
    setTimeout(function() {
      var cards = grid.querySelectorAll(".fade-in");
      cards.forEach(function(card) {
        card.classList.add("visible");
      });
    }, 100);
  }

  function getTimeAgo(dateStr) {
    if (!dateStr) return "";
    var date = new Date(dateStr);
    var now = new Date();
    var diffMs = now - date;
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return diffDays + " days ago";
    if (diffDays < 30) return Math.floor(diffDays / 7) + " weeks ago";
    if (diffDays < 365) return Math.floor(diffDays / 30) + " months ago";
    return Math.floor(diffDays / 365) + " years ago";
  }

  function getInitials(name) {
    if (!name) return "??";
    var parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function isRecentTestimonial(dateStr) {
    if (!dateStr) return false;
    var testimonialDate = new Date(dateStr);
    var now = new Date();
    var diffDays = (now - testimonialDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }

  function buildStarsHTML(rating) {
    var stars = "";
    for (var i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<i class="fas fa-star"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  // Testimonial Modal Functions
  window.openTestimonialModal = function() {
    var modal = document.getElementById("testimonialModal");
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeTestimonialModal = function() {
    var modal = document.getElementById("testimonialModal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  function setupTestimonialModal() {
    var modal = document.getElementById("testimonialModal");
    if (!modal) return;

    // Close on overlay click
    var overlay = modal.querySelector(".testimonial-modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", closeTestimonialModal);
    }

    // Star rating interaction
    var starContainer = document.getElementById("starRatingInput");
    var ratingInput = document.getElementById("testimonialRating");
    if (starContainer && ratingInput) {
      var stars = starContainer.querySelectorAll("i");
      stars.forEach(function(star) {
        star.addEventListener("click", function() {
          var rating = parseInt(this.getAttribute("data-rating"), 10);
          ratingInput.value = rating;
          updateStarDisplay(stars, rating);
        });
        star.addEventListener("mouseenter", function() {
          var rating = parseInt(this.getAttribute("data-rating"), 10);
          updateStarDisplay(stars, rating);
        });
      });
      starContainer.addEventListener("mouseleave", function() {
        var currentRating = parseInt(ratingInput.value, 10);
        updateStarDisplay(stars, currentRating);
      });
      // Initialize with 5 stars
      updateStarDisplay(stars, 5);
    }
  }

  function updateStarDisplay(stars, rating) {
    stars.forEach(function(star, index) {
      if (index < rating) {
        star.classList.remove("far");
        star.classList.add("fas");
        star.style.color = "#F59E0B";
      } else {
        star.classList.remove("fas");
        star.classList.add("far");
        star.style.color = "#D1D5DB";
      }
    });
  }

  window.submitTestimonial = function(event) {
    event.preventDefault();

    var name = document.getElementById("testimonialName").value.trim();
    var service = document.getElementById("testimonialService").value;
    var rating = parseInt(document.getElementById("testimonialRating").value, 10);
    var text = document.getElementById("testimonialText").value.trim();

    if (!name || !service || !text) {
      showToast("Please fill in all fields", "error");
      return;
    }

    var testimonial = {
      id: generateId(),
      name: name,
      service: service,
      rating: rating,
      text: text,
      date: new Date().toISOString().split("T")[0]
    };

    var testimonials = getData("testimonials") || [];
    testimonials.push(testimonial);
    setData("testimonials", testimonials);

    // Reload testimonials display
    loadTestimonials();

    // Reset form and close modal
    document.getElementById("testimonialForm").reset();
    document.getElementById("testimonialRating").value = "5";
    var stars = document.querySelectorAll("#starRatingInput i");
    updateStarDisplay(stars, 5);

    closeTestimonialModal();
    showToast("Thank you for sharing your experience!", "success");
  };
})();
