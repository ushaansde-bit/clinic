/* ============================================
   BLOG AUTO-UPDATE SYSTEM
   Shree Physiotherapy Clinic
   Auto-updates trending articles daily
   ============================================ */

(function() {
    'use strict';

    // Trending physiotherapy articles database - rotates daily
    const TRENDING_ARTICLES = [
        // Back Pain Articles
        {
            title: "5 Stretches to Relieve Lower Back Pain at Your Desk",
            category: "Back Pain",
            icon: "fas fa-user-injured",
            summary: "Simple stretches you can do at work to prevent and relieve lower back pain caused by prolonged sitting.",
            readTime: "4 min",
            trending: true
        },
        {
            title: "Sciatica vs Lower Back Pain: How to Tell the Difference",
            category: "Back Pain",
            icon: "fas fa-spine",
            summary: "Learn the key differences between sciatica and general lower back pain, and when to seek physiotherapy treatment.",
            readTime: "5 min",
            trending: true
        },
        {
            title: "Core Exercises for Preventing Back Pain",
            category: "Back Pain",
            icon: "fas fa-dumbbell",
            summary: "Strengthen your core muscles with these physiotherapist-approved exercises to protect your spine.",
            readTime: "6 min",
            trending: false
        },
        // Neck Pain Articles
        {
            title: "Tech Neck: The Modern Epidemic and How to Fix It",
            category: "Neck Pain",
            icon: "fas fa-mobile-alt",
            summary: "How smartphone and computer use is causing neck problems and what physiotherapy solutions exist.",
            readTime: "5 min",
            trending: true
        },
        {
            title: "Cervical Spondylosis: Causes, Symptoms & Treatment",
            category: "Neck Pain",
            icon: "fas fa-head-side-virus",
            summary: "A comprehensive guide to understanding and treating cervical spondylosis with physiotherapy.",
            readTime: "7 min",
            trending: false
        },
        {
            title: "Pillow Selection for Neck Pain Prevention",
            category: "Neck Pain",
            icon: "fas fa-bed",
            summary: "How the right pillow can prevent morning neck stiffness and chronic neck pain.",
            readTime: "4 min",
            trending: false
        },
        // Knee Pain Articles
        {
            title: "Knee Pain After 40: What You Need to Know",
            category: "Knee Pain",
            icon: "fas fa-bone",
            summary: "Understanding age-related knee changes and how physiotherapy can keep you active.",
            readTime: "6 min",
            trending: true
        },
        {
            title: "Pre-Surgery Exercises for Knee Replacement",
            category: "Knee Pain",
            icon: "fas fa-hospital",
            summary: "Prehabilitation exercises that can improve your recovery after knee replacement surgery.",
            readTime: "5 min",
            trending: false
        },
        // Shoulder Pain Articles
        {
            title: "Frozen Shoulder: The 3 Stages of Recovery",
            category: "Shoulder Pain",
            icon: "fas fa-hand-sparkles",
            summary: "Understanding the freezing, frozen, and thawing stages of adhesive capsulitis and how to treat each.",
            readTime: "6 min",
            trending: true
        },
        {
            title: "Rotator Cuff Strengthening Exercises",
            category: "Shoulder Pain",
            icon: "fas fa-dumbbell",
            summary: "Essential exercises to strengthen and protect your rotator cuff muscles.",
            readTime: "5 min",
            trending: false
        },
        // Women's Health Articles
        {
            title: "Pregnancy Back Pain: Safe Exercises for Each Trimester",
            category: "Women's Health",
            icon: "fas fa-baby",
            summary: "Physiotherapist-approved exercises to relieve back pain during pregnancy safely.",
            readTime: "7 min",
            trending: true
        },
        {
            title: "Diastasis Recti: Healing Abdominal Separation After Pregnancy",
            category: "Women's Health",
            icon: "fas fa-heart",
            summary: "Understanding diastasis recti and the physiotherapy approach to healing.",
            readTime: "6 min",
            trending: false
        },
        {
            title: "Pelvic Floor Exercises Every Woman Should Know",
            category: "Women's Health",
            icon: "fas fa-female",
            summary: "Essential pelvic floor exercises for prevention of incontinence and pelvic organ prolapse.",
            readTime: "5 min",
            trending: false
        },
        // Elderly Care Articles
        {
            title: "Balance Exercises to Prevent Falls in Seniors",
            category: "Elderly Care",
            icon: "fas fa-walking",
            summary: "Simple balance exercises that can significantly reduce fall risk in older adults.",
            readTime: "5 min",
            trending: true
        },
        {
            title: "Home Modifications for Elderly Safety",
            category: "Elderly Care",
            icon: "fas fa-home",
            summary: "How to make your home safer for elderly family members to prevent injuries.",
            readTime: "4 min",
            trending: false
        },
        // Sports & Rehabilitation
        {
            title: "ACL Injury Prevention for Athletes",
            category: "Sports Rehab",
            icon: "fas fa-running",
            summary: "Key exercises and techniques to prevent ACL injuries in sports activities.",
            readTime: "6 min",
            trending: true
        },
        {
            title: "Post-Fracture Rehabilitation Timeline",
            category: "Rehabilitation",
            icon: "fas fa-bone",
            summary: "What to expect during recovery after a bone fracture and when to start physiotherapy.",
            readTime: "5 min",
            trending: false
        },
        // Fascial Manipulation
        {
            title: "What is Fascial Manipulation? A Complete Guide",
            category: "Fascial Therapy",
            icon: "fas fa-hand-sparkles",
            summary: "Understanding the revolutionary Italian technique that's transforming pain treatment.",
            readTime: "8 min",
            trending: true
        },
        // Posture & Ergonomics
        {
            title: "Perfect Workstation Setup for Pain Prevention",
            category: "Ergonomics",
            icon: "fas fa-desktop",
            summary: "How to set up your desk, chair, and computer to prevent work-related pain.",
            readTime: "5 min",
            trending: true
        },
        {
            title: "Posture Correction: A Step-by-Step Guide",
            category: "Posture",
            icon: "fas fa-user",
            summary: "Daily habits and exercises to improve your posture and reduce pain.",
            readTime: "6 min",
            trending: false
        }
    ];

    // Get today's date seed for consistent daily rotation
    function getDaySeed() {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    }

    // Seeded random number generator for consistent daily picks
    function seededRandom(seed) {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Pick articles for today (consistent throughout the day)
    function getTodaysArticles(count) {
        const seed = getDaySeed();
        const shuffled = [...TRENDING_ARTICLES];

        // Shuffle using seeded random
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom(seed + i) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Prioritize trending articles
        shuffled.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

        return shuffled.slice(0, count);
    }

    // Render trending articles
    function renderTrendingArticles() {
        const container = document.getElementById('trendingArticles');
        if (!container) return;

        const articles = getTodaysArticles(6);
        const today = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        container.innerHTML = articles.map((article, index) => {
            const isNew = index < 2;
            const dateStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

            return `
                <article class="trending-card fade-in">
                    <div class="trending-icon">
                        <i class="${article.icon}"></i>
                    </div>
                    <div class="trending-content">
                        <div class="trending-meta">
                            <span class="trending-category">${article.category}</span>
                            ${isNew ? '<span class="trending-new">New Today</span>' : ''}
                            <span class="trending-date">${dateStr}</span>
                        </div>
                        <h3>${article.title}</h3>
                        <p>${article.summary}</p>
                        <div class="trending-footer">
                            <span class="read-time"><i class="fas fa-clock"></i> ${article.readTime}</span>
                            <a href="#${article.category.toLowerCase().replace(/\s+/g, '-')}" class="read-more-btn">Read More <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Trigger animations
        setTimeout(() => {
            container.querySelectorAll('.fade-in').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 100);
            });
        }, 100);
    }

    // Initialize Charts
    function initCharts() {
        // Conditions Chart (Pie/Doughnut)
        const conditionsCtx = document.getElementById('conditionsChart');
        if (conditionsCtx) {
            new Chart(conditionsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Back Pain', 'Neck Pain', 'Knee Pain', 'Shoulder Pain', 'Sports Injuries', 'Others'],
                    datasets: [{
                        data: [30, 20, 18, 15, 10, 7],
                        backgroundColor: [
                            '#1B4D3E',
                            '#2D7A5F',
                            '#C8956C',
                            '#4A9B7F',
                            '#E8D5C0',
                            '#6B7280'
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 12
                                }
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        }

        // Recovery Timeline Chart (Bar)
        const recoveryCtx = document.getElementById('recoveryChart');
        if (recoveryCtx) {
            new Chart(recoveryCtx, {
                type: 'bar',
                data: {
                    labels: ['Back Pain', 'Neck Pain', 'Knee Pain', 'Frozen Shoulder', 'Sports Injury', 'Post-Surgery'],
                    datasets: [{
                        label: 'Average Sessions',
                        data: [5, 7, 10, 15, 8, 12],
                        backgroundColor: [
                            'rgba(27, 77, 62, 0.8)',
                            'rgba(45, 122, 95, 0.8)',
                            'rgba(200, 149, 108, 0.8)',
                            'rgba(74, 155, 127, 0.8)',
                            'rgba(232, 213, 192, 0.8)',
                            'rgba(107, 114, 128, 0.8)'
                        ],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 20,
                            ticks: {
                                stepSize: 5,
                                font: {
                                    family: "'Inter', sans-serif"
                                }
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 11
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    }

    // Animate stat numbers
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (target - start) * easeOut);

                stat.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    stat.textContent = target.toLocaleString() + '+';
                }
            }

            // Start animation when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(update);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(stat);
        });
    }

    // Initialize fade-in animations
    function initAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in:not(.visible)');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        fadeElements.forEach(el => observer.observe(el));
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        renderTrendingArticles();
        initCharts();
        animateStats();
        initAnimations();

        // Update timestamp
        const updateNote = document.querySelector('.auto-update-note');
        if (updateNote) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            updateNote.innerHTML = `<i class="fas fa-check-circle"></i> Last updated: Today at ${timeStr}`;
        }
    });

})();
