/* ============================================
   Shree Physiotherapy Clinic - Doctor Dashboard
   Enhanced with full synchronization and week view
   Phone: 822004084, 9092294466
   WhatsApp: 919092294466
   ============================================ */

/* ---- Dashboard Calendar State ---- */
let currentDashMonth = new Date().getMonth();
let currentDashYear = new Date().getFullYear();
let currentWeekStart = getWeekStart(new Date());
let calendarView = 'week'; // 'day', 'week', or 'month'
let currentViewingPatientId = null;
let selectedCalendarDate = new Date();
let miniCalendarMonth = new Date().getMonth();
let miniCalendarYear = new Date().getFullYear();

/* ---- Patients Pagination State ---- */
let patientCurrentPage = 1;
const PATIENTS_PER_PAGE = 10;

/* ---- Clinic Configuration (shared with booking) ---- */
const CLINIC_HOURS = {
    morningStart: 10 * 60, // 10:00 AM in minutes
    morningEnd: 13 * 60 + 30, // 1:30 PM
    eveningStart: 18 * 60, // 6:00 PM
    eveningEnd: 20 * 60 + 30 // 8:30 PM
};

/* ---- India Time Functions ---- */
function getIndiaTime() {
    const now = new Date();
    const istOffset = 5.5 * 60; // IST is UTC + 5:30
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (istOffset * 60000));
}

function getIndiaTodayDate() {
    const ist = getIndiaTime();
    return ist.toISOString().split('T')[0];
}

function getIndiaCurrentMinutes() {
    const ist = getIndiaTime();
    return ist.getHours() * 60 + ist.getMinutes();
}

// Check if appointment time has passed (based on IST)
function hasAppointmentTimePassed(appointmentDate, appointmentTime) {
    const ist = getIndiaTime();
    const todayIST = getIndiaTodayDate();
    const currentMinutes = getIndiaCurrentMinutes();

    const aptDate = new Date(appointmentDate).toISOString().split('T')[0];
    const aptMinutes = timeStringToMinutes(appointmentTime);

    // If appointment date is in the past, time has passed
    if (aptDate < todayIST) {
        return true;
    }

    // If appointment date is today, check if time has passed
    if (aptDate === todayIST) {
        return currentMinutes >= aptMinutes;
    }

    // Appointment is in the future
    return false;
}

/* ============================================
   0. ADMIN LOGIN (Single User)
   ============================================ */
function getSavedCredentials() {
    try {
        var saved = localStorage.getItem('_dashCredentials');
        return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
}

function handleAdminLogin(event) {
    event.preventDefault();

    try {
        var usernameInput = document.getElementById('loginUsername');
        var passwordInput = document.getElementById('loginPassword');
        var errorEl = document.getElementById('loginError');
        var infoEl = document.getElementById('loginInfo');
        var username = usernameInput ? usernameInput.value.trim() : '';
        var password = passwordInput ? passwordInput.value : '';
        var creds = getSavedCredentials();

        // Hide previous messages
        if (errorEl) errorEl.style.display = 'none';
        if (infoEl) infoEl.style.display = 'none';

        // Validate input
        if (username.length < 3) {
            if (errorEl) { errorEl.textContent = 'Username must be at least 3 characters.'; errorEl.style.display = 'block'; }
            return;
        }
        if (password.length < 4) {
            if (errorEl) { errorEl.textContent = 'Password must be at least 4 characters.'; errorEl.style.display = 'block'; }
            return;
        }

        if (!creds) {
            // First login - save credentials
            localStorage.setItem('_dashCredentials', JSON.stringify({ u: username, p: password }));
            if (window.CloudSync && CloudSync.isReady()) {
                CloudSync.save('_credentials', { u: username, p: password });
            }
            loginSuccess();
        } else if (username === creds.u && password === creds.p) {
            // Correct credentials
            loginSuccess();
        } else {
            // Wrong credentials
            if (errorEl) { errorEl.textContent = 'Invalid username or password.'; errorEl.style.display = 'block'; }
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Login error: ' + err.message);
    }
}

function loginSuccess() {
    sessionStorage.setItem('dashLoggedIn', 'true');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardApp').style.display = 'block';
    switchTab('overview');
    initDashboardData();
}

function showLoginScreen() {
    var loginScreen = document.getElementById('loginScreen');
    var loginCard = document.getElementById('loginCard');
    var infoEl = document.getElementById('loginInfo');
    var creds = getSavedCredentials();

    if (!creds && infoEl) {
        infoEl.textContent = 'First login will set your admin credentials.';
        infoEl.style.display = 'block';
    }
    if (loginCard) loginCard.style.display = '';
    if (loginScreen) loginScreen.style.display = '';
}

function checkSession() {
    if (sessionStorage.getItem('dashLoggedIn') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardApp').style.display = 'block';
        return true;
    }
    return false;
}

function logoutDashboard() {
    sessionStorage.removeItem('dashLoggedIn');
    window.location.reload();
}

function initDashboardData() {
    // Auto-seed test data on first login if no patients exist
    if (getData('patients').length === 0 && !localStorage.getItem('dataSeeded')) {
        seedTestData();
    }
    currentWeekStart = getWeekStart(new Date());
    selectedCalendarDate = new Date();
    cleanupOldTrash();
    refreshDashboard();
    loadPatients();
    loadAppointments();
    loadPrescriptions();
    loadFollowups();
    renderCalendarView();
}

/* ============================================
   1. TAB NAVIGATION
   ============================================ */
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Show target tab
    const target = document.getElementById('tab-' + tabName);
    if (target) {
        target.style.display = 'block';
    }

    // Update sidebar active state
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    const links = document.querySelectorAll('.sidebar-nav a');
    const tabMap = ['overview', 'patients', 'appointments', 'calendar', 'accounts', 'settings', 'trash'];
    const index = tabMap.indexOf(tabName);
    if (index >= 0 && links[index]) {
        links[index].classList.add('active');
    }

    // Update mobile tab nav active state
    const mobileButtons = document.querySelectorAll('.mobile-tab-nav button');
    mobileButtons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    // Refresh relevant data on switch
    switch (tabName) {
        case 'overview':
            refreshDashboard();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'appointments':
            var aptDateFilter = document.getElementById('appointmentFilter');
            if (aptDateFilter && !aptDateFilter.value) aptDateFilter.value = new Date().toISOString().split('T')[0];
            loadAppointments();
            break;
        case 'calendar':
            renderMiniCalendar();
            renderCalendlyView();
            break;
        case 'accounts':
            loadAccountsBook();
            break;
        case 'settings':
            loadSettingsTab();
            break;
        case 'trash':
            loadTrash();
            break;
    }
}

/* ============================================
   2. DASHBOARD OVERVIEW - ENHANCED
   ============================================ */
function refreshDashboard() {
    const patients = getData('patients');
    const appointments = getData('appointments');
    const prescriptions = getData('prescriptions');
    const followups = getData('followups');
    const trash = getData('trash') || [];

    // Get IDs of patients in trash (excluded from dashboard stats)
    const trashedPatientIds = new Set(trash.map(p => p.id));

    // Filter out trashed patient data
    const activeAppointments = appointments.filter(a => !trashedPatientIds.has(a.patientId));
    const activePrescriptions = prescriptions.filter(rx => !trashedPatientIds.has(rx.patientId));
    const activeFollowups = followups.filter(f => !trashedPatientIds.has(f.patientId));

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Today's appointments
    const todayAppointments = activeAppointments.filter(a => {
        const aptDate = new Date(a.date).toISOString().split('T')[0];
        return aptDate === todayStr && a.status !== 'Cancelled';
    });

    // Today's completed appointments for revenue
    const todayCompleted = todayAppointments.filter(a => a.status === 'Completed');
    const todayRevenue = todayCompleted.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);

    // This week's appointments
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekAppointments = activeAppointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= weekStart && aptDate <= weekEnd && a.status !== 'Cancelled';
    });

    // Pending follow-ups (including overdue)
    const pendingFollowups = activeFollowups.filter(f => f.status !== 'Completed');
    const overdueFollowups = pendingFollowups.filter(f => new Date(f.date) < today);

    // Update stat cards
    const elPatients = document.getElementById('statPatients');
    const elToday = document.getElementById('statToday');
    const elWeek = document.getElementById('statWeek');
    const elPrescriptions = document.getElementById('statPrescriptions');
    const elFollowups = document.getElementById('statFollowups');
    const elRevenue = document.getElementById('statRevenue');

    if (elPatients) elPatients.textContent = patients.length;
    if (elToday) elToday.textContent = todayAppointments.length;
    if (elWeek) elWeek.textContent = weekAppointments.length;
    if (elPrescriptions) elPrescriptions.textContent = activePrescriptions.length;
    if (elFollowups) elFollowups.textContent = pendingFollowups.length;
    if (elRevenue) elRevenue.textContent = todayRevenue.toLocaleString('en-IN');

    // Update welcome message
    const welcomeDate = document.getElementById('welcomeDate');
    if (welcomeDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        welcomeDate.textContent = today.toLocaleDateString('en-IN', options);
    }

    // Render charts and growth metrics
    renderWeeklyActivityChart(appointments);
    renderRevenueChart(appointments);
    renderGrowthMetrics(patients, appointments, followups);

    // Render today's appointments quick list
    renderTodaysAppointmentsList(todayAppointments);
}

/* Weekly Activity Chart - Appointments + Unique Patients per day */
function renderWeeklyActivityChart(appointments) {
    const container = document.getElementById('weeklyChartContainer');
    const weeklyTotalEl = document.getElementById('weeklyTotal');
    if (!container) return;

    const today = new Date();
    const weekStart = getWeekStart(today);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let weeklyData = [];
    let maxCount = 1;
    let totalWeekly = 0;

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        const dayStr = day.toISOString().split('T')[0];

        const dayAppts = appointments.filter(a => {
            const aptDate = new Date(a.date).toISOString().split('T')[0];
            return aptDate === dayStr && a.status !== 'Cancelled';
        });

        const apptCount = dayAppts.length;
        const uniquePatients = new Set(dayAppts.map(a => a.patientId)).size;

        weeklyData.push({
            day: dayNames[i],
            appointments: apptCount,
            patients: uniquePatients,
            isToday: dayStr === today.toISOString().split('T')[0]
        });

        totalWeekly += apptCount;
        if (apptCount > maxCount) maxCount = apptCount;
        if (uniquePatients > maxCount) maxCount = uniquePatients;
    }

    if (weeklyTotalEl) weeklyTotalEl.textContent = totalWeekly;

    const maxHeight = 100;
    let html = '';

    weeklyData.forEach(d => {
        const apptHeight = maxCount > 0 ? (d.appointments / maxCount) * maxHeight : 0;
        const patientHeight = maxCount > 0 ? (d.patients / maxCount) * maxHeight : 0;

        html += `
            <div class="chart-bar-group ${d.isToday ? 'today' : ''}">
                <div class="chart-bars">
                    <div class="chart-bar completed" style="height:${Math.max(apptHeight, 4)}px;" title="Appointments: ${d.appointments}"></div>
                    <div class="chart-bar scheduled" style="height:${Math.max(patientHeight, 4)}px;" title="Unique Patients: ${d.patients}"></div>
                </div>
                <span class="chart-day-label" style="${d.isToday ? 'font-weight:700;color:var(--primary);' : ''}">${d.day}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

/* Revenue Chart - Last 4 Weeks */
function renderRevenueChart(appointments) {
    const container = document.getElementById('revenueChartContainer');
    const monthlyRevenueEl = document.getElementById('monthlyRevenue');
    if (!container) return;

    const today = new Date();
    let weeklyRevenue = [];
    let maxRevenue = 1;
    let totalMonthRevenue = 0;

    // Get last 4 weeks data
    for (let w = 3; w >= 0; w--) {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (w * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekAppts = appointments.filter(a => {
            const aptDate = new Date(a.date);
            return aptDate >= weekStart && aptDate <= weekEnd && a.status === 'Completed';
        });

        const revenue = weekAppts.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);
        weeklyRevenue.push({
            label: w === 0 ? 'This Week' : `${w}W Ago`,
            revenue,
            isCurrent: w === 0
        });

        totalMonthRevenue += revenue;
        if (revenue > maxRevenue) maxRevenue = revenue;
    }

    if (monthlyRevenueEl) monthlyRevenueEl.textContent = '₹' + totalMonthRevenue.toLocaleString('en-IN');

    const maxHeight = 80;
    let html = '<div style="display:flex;align-items:flex-end;justify-content:space-around;height:100px;gap:8px;">';

    weeklyRevenue.forEach(w => {
        const height = maxRevenue > 0 ? (w.revenue / maxRevenue) * maxHeight : 8;
        const formattedRevenue = w.revenue > 0 ? '₹' + w.revenue.toLocaleString('en-IN') : '₹0';
        html += `
            <div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;">
                <span style="font-size:0.65rem;font-weight:600;color:var(--text-muted);white-space:nowrap;">${formattedRevenue}</span>
                <div class="revenue-bar ${w.isCurrent ? 'current' : ''}"
                     style="height:${Math.max(height, 8)}px;width:100%;border-radius:4px 4px 0 0;${w.isCurrent ? 'background:linear-gradient(180deg, var(--primary) 0%, #143D30 100%);' : 'background:rgba(27,77,62,0.2);'}"
                     title="${formattedRevenue}">
                </div>
                <span style="font-size:0.68rem;color:var(--text-muted);">${w.label}</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

/* Growth Metrics */
function renderGrowthMetrics(patients, appointments, followups) {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // New patients this month
    const newPatientsThisMonth = patients.filter(p => {
        if (!p.createdAt) return false;
        const created = new Date(p.createdAt);
        return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    }).length;

    const newPatientsLastMonth = patients.filter(p => {
        if (!p.createdAt) return false;
        const created = new Date(p.createdAt);
        return created.getMonth() === lastMonth && created.getFullYear() === lastMonthYear;
    }).length;

    const patientGrowth = newPatientsLastMonth > 0
        ? Math.round(((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100)
        : (newPatientsThisMonth > 0 ? 100 : 0);

    // Update new patients
    const newPatientsEl = document.getElementById('newPatientsThisMonth');
    const patientGrowthEl = document.getElementById('patientGrowthComparison');
    if (newPatientsEl) newPatientsEl.textContent = newPatientsThisMonth;
    if (patientGrowthEl) {
        const isPositive = patientGrowth >= 0;
        patientGrowthEl.className = `growth-comparison ${isPositive ? '' : 'negative'}`;
        patientGrowthEl.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            <span>${isPositive ? '+' : ''}${patientGrowth}% vs last month</span>
        `;
    }

    // Completion rate this week
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= weekStart && aptDate <= weekEnd && a.status !== 'Cancelled';
    });

    const completedThisWeek = weekAppts.filter(a => a.status === 'Completed').length;
    const completionRate = weekAppts.length > 0 ? Math.round((completedThisWeek / weekAppts.length) * 100) : 0;

    const completionRateEl = document.getElementById('completionRate');
    const completionRingFill = document.getElementById('completionRingFill');
    if (completionRateEl) completionRateEl.textContent = completionRate + '%';
    if (completionRingFill) completionRingFill.setAttribute('stroke-dasharray', `${completionRate}, 100`);

    // Top services
    const serviceCounts = {};
    appointments.filter(a => a.status === 'Completed').forEach(a => {
        const service = a.service || 'General';
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });

    const topServices = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const topServicesEl = document.getElementById('topServicesList');
    if (topServicesEl) {
        if (topServices.length === 0) {
            topServicesEl.innerHTML = '<span class="no-data" style="font-size:0.8rem;color:var(--text-muted);">No data yet</span>';
        } else {
            topServicesEl.innerHTML = topServices.map((s, i) => `
                <div class="service-item">
                    <span class="service-rank ${i === 0 ? 'gold' : ''}">${i + 1}</span>
                    <span class="service-name">${escapeHtml(s[0])}</span>
                    <span class="service-count">${s[1]}</span>
                </div>
            `).join('');
        }
    }

    // Monthly revenue
    const thisMonthAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear && a.status === 'Completed';
    });

    const lastMonthAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastMonthYear && a.status === 'Completed';
    });

    const thisMonthRevenue = thisMonthAppts.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);
    const lastMonthRevenue = lastMonthAppts.reduce((sum, a) => sum + (parseFloat(a.amountPaid) || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : (thisMonthRevenue > 0 ? 100 : 0);

    const totalMonthlyRevenueEl = document.getElementById('totalMonthlyRevenue');
    const currentMonthNameEl = document.getElementById('currentMonthName');
    const revenueGrowthEl = document.getElementById('revenueGrowthComparison');

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (totalMonthlyRevenueEl) totalMonthlyRevenueEl.textContent = '₹' + thisMonthRevenue.toLocaleString('en-IN');
    if (currentMonthNameEl) currentMonthNameEl.textContent = monthNames[thisMonth];
    if (revenueGrowthEl) {
        const isPositive = revenueGrowth >= 0;
        revenueGrowthEl.className = `growth-comparison ${isPositive ? '' : 'negative'}`;
        revenueGrowthEl.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            <span>${isPositive ? '+' : ''}${revenueGrowth}% vs last month</span>
        `;
    }
}

function renderTodayTimeline(todayAppointments) {
    const container = document.getElementById('todayTimeline');
    if (!container) return;

    if (todayAppointments.length === 0) {
        container.innerHTML = `
            <div class="timeline-empty">
                <i class="fas fa-calendar-check"></i>
                <p>No appointments scheduled for today</p>
            </div>
        `;
        return;
    }

    // Sort by time
    todayAppointments.sort((a, b) => {
        const timeA = timeStringToMinutes(a.time || a.startTime || '');
        const timeB = timeStringToMinutes(b.time || b.startTime || '');
        return timeA - timeB;
    });

    let html = '<div class="timeline">';

    todayAppointments.forEach((apt, index) => {
        const patients = getData('patients');
        const patient = patients.find(p => p.id === apt.patientId);
        const patientName = patient ? patient.name : apt.patientName || apt.name || 'Unknown';
        const duration = apt.duration || 30;
        const endTime = apt.endTime || calculateEndTime(apt.time, duration);
        const statusClass = getStatusClass(apt.status);

        // Check if time has passed for complete button
        const timePassed = hasAppointmentTimePassed(apt.date, apt.time || apt.startTime);
        const canComplete = apt.status !== 'Completed' && apt.status !== 'Cancelled' && timePassed;
        const isPending = apt.status !== 'Completed' && apt.status !== 'Cancelled';

        html += `
            <div class="timeline-item ${statusClass}">
                <div class="timeline-time">
                    <span class="time-start">${apt.time || apt.startTime}</span>
                    <span class="time-end">${endTime}</span>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <strong>${escapeHtml(patientName)}</strong>
                        <span class="status-badge ${statusClass}">${apt.status || 'Scheduled'}</span>
                    </div>
                    <p class="timeline-service">${escapeHtml(apt.service || 'General')}</p>
                    <span class="timeline-duration">${duration} min</span>
                </div>
                <div class="timeline-actions">
                    ${canComplete ? `
                        <button class="action-btn view" onclick="updateAppointmentStatus('${apt.id}','Completed')" title="Complete">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : (isPending ? `
                        <button class="action-btn" title="Waiting for appointment time" style="background:rgba(156,163,175,0.1); color:#9CA3AF; cursor:not-allowed;" disabled>
                            <i class="fas fa-clock"></i>
                        </button>
                    ` : '')}
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function renderUpcomingAppointments(appointments) {
    const container = document.getElementById('upcomingAppointments');
    if (!container) return;

    const now = new Date();
    const upcoming = appointments
        .filter(a => {
            const aptDate = new Date(a.date);
            return aptDate >= now && a.status !== 'Cancelled' && a.status !== 'Completed';
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = '<p class="no-data">No upcoming appointments</p>';
        return;
    }

    let html = '<ul class="upcoming-list">';

    upcoming.forEach(apt => {
        const patients = getData('patients');
        const patient = patients.find(p => p.id === apt.patientId);
        const patientName = patient ? patient.name : apt.patientName || apt.name || 'Unknown';

        html += `
            <li class="upcoming-item">
                <div class="upcoming-date">
                    <span class="day">${new Date(apt.date).getDate()}</span>
                    <span class="month">${getShortMonth(new Date(apt.date).getMonth())}</span>
                </div>
                <div class="upcoming-info">
                    <strong>${escapeHtml(patientName)}</strong>
                    <span>${apt.time || apt.startTime} - ${escapeHtml(apt.service || 'General')}</span>
                </div>
            </li>
        `;
    });

    html += '</ul>';
    container.innerHTML = html;
}

function renderOverdueAlert(overdueFollowups) {
    const container = document.getElementById('overdueAlert');
    if (!container) return;
    container.style.display = 'none';
}

/* Today's Appointments Quick List on Overview */
function renderTodaysAppointmentsList(todayAppointments) {
    const container = document.getElementById('todaysAppointmentsList');
    if (!container) return;

    if (!todayAppointments || todayAppointments.length === 0) {
        container.innerHTML = '<p class="no-data" style="padding:20px;text-align:center;color:var(--text-muted);">No appointments scheduled for today.</p>';
        return;
    }

    // Sort by time
    todayAppointments.sort((a, b) => {
        const timeA = timeStringToMinutes(a.time || a.startTime || '');
        const timeB = timeStringToMinutes(b.time || b.startTime || '');
        return timeA - timeB;
    });

    const patients = getData('patients');
    const displayAppts = todayAppointments.slice(0, 5);

    let html = '<table class="data-table compact" style="margin:0;"><thead><tr><th>Time</th><th>Patient</th><th>Service</th><th>Status</th></tr></thead><tbody>';

    displayAppts.forEach(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        const patientName = patient ? patient.name : apt.patientName || 'Unknown';
        const statusClass = getStatusClass(apt.status);

        html += `<tr style="cursor:pointer;" onclick="viewAppointmentDetails('${apt.id}')">
            <td>${apt.time || apt.startTime || '-'}</td>
            <td><strong>${escapeHtml(patientName)}</strong></td>
            <td>${escapeHtml(apt.service || 'General')}</td>
            <td><span class="status-badge ${statusClass}">${apt.status || 'Scheduled'}</span></td>
        </tr>`;
    });

    html += '</tbody></table>';

    if (todayAppointments.length > 5) {
        html += `<div style="text-align:center;padding:10px;"><a href="javascript:void(0)" onclick="switchTab('appointments')" style="font-size:0.82rem;color:var(--primary);font-weight:600;">+${todayAppointments.length - 5} more appointments</a></div>`;
    }

    container.innerHTML = html;
}

/* ============================================
   3. PATIENTS - ENHANCED
   ============================================ */
function loadPatients() {
    const patients = getData('patients');
    const appointments = getData('appointments');
    const followups = getData('followups');
    const tbody = document.querySelector('#patientsTable tbody');
    if (!tbody) return;

    // Get filter values
    const statusFilter = document.getElementById('patientStatusFilter')?.value || 'all';
    const searchQuery = document.getElementById('patientSearch')?.value?.toLowerCase() || '';

    const today = getIndiaTodayDate();

    // Filter patients
    let filteredPatients = patients;

    // Filter by search query
    if (searchQuery) {
        filteredPatients = filteredPatients.filter(p =>
            (p.name && p.name.toLowerCase().includes(searchQuery)) ||
            (p.phone && p.phone.includes(searchQuery)) ||
            (p.email && p.email.toLowerCase().includes(searchQuery))
        );
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
        switch (statusFilter) {
            case 'today':
                const visitedTodayIds = new Set();
                appointments.forEach(a => {
                    if (a.date && a.date.startsWith(today) && a.status === 'Completed') {
                        visitedTodayIds.add(a.patientId);
                    }
                });
                filteredPatients = filteredPatients.filter(p => visitedTodayIds.has(p.id));
                break;
            case 'upcoming':
                const upcomingIds = new Set();
                appointments.forEach(a => {
                    if (a.date >= today && a.status !== 'Cancelled' && a.status !== 'Completed') {
                        upcomingIds.add(a.patientId);
                    }
                });
                filteredPatients = filteredPatients.filter(p => upcomingIds.has(p.id));
                break;
            case 'completed':
                const completedIds = new Set();
                appointments.forEach(a => {
                    if (a.status === 'Completed') {
                        completedIds.add(a.patientId);
                    }
                });
                filteredPatients = filteredPatients.filter(p => completedIds.has(p.id));
                break;
            case 'pending':
                const pendingFollowupIds = new Set();
                followups.forEach(f => {
                    if (f.status !== 'Completed') {
                        pendingFollowupIds.add(f.patientId);
                    }
                });
                filteredPatients = filteredPatients.filter(p => pendingFollowupIds.has(p.id));
                break;
        }
    }

    // Pagination
    const totalPatients = filteredPatients.length;
    const totalPages = Math.max(1, Math.ceil(totalPatients / PATIENTS_PER_PAGE));
    if (patientCurrentPage > totalPages) patientCurrentPage = totalPages;
    if (patientCurrentPage < 1) patientCurrentPage = 1;

    const startIdx = (patientCurrentPage - 1) * PATIENTS_PER_PAGE;
    const pagePatients = filteredPatients.slice(startIdx, startIdx + PATIENTS_PER_PAGE);

    if (filteredPatients.length === 0) {
        const filterActive = searchQuery || (statusFilter && statusFilter !== 'all');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-light);">${filterActive ? 'No patients match the selected filters.' : 'No patients found. Click "Add Patient" to get started.'}</td></tr>`;
        renderPatientsPagination(0, 1);
        return;
    }

    tbody.innerHTML = pagePatients.map(p => {
        const patientAppointments = appointments.filter(a => a.patientId === p.id);
        const completedVisits = patientAppointments.filter(a => a.status === 'Completed').length;
        const lastVisit = getLastVisit(patientAppointments);

        return `<tr>
            <td><strong><a href="javascript:void(0)" class="clickable-name" onclick="viewPatient('${p.id}')">${escapeHtml(p.name)}</a></strong></td>
            <td>${p.age || '-'}</td>
            <td>${p.gender || '-'}</td>
            <td>${escapeHtml(p.phone)}</td>
            <td>${completedVisits}</td>
            <td class="last-visit">${lastVisit}</td>
            <td>
                <button class="action-btn delete" title="Delete" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');

    renderPatientsPagination(totalPatients, totalPages);
}

function renderPatientsPagination(totalPatients, totalPages) {
    const container = document.getElementById('patientsPagination');
    if (!container) return;

    if (totalPages <= 1) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    let html = '';

    html += `<button class="pagination-btn" ${patientCurrentPage <= 1 ? 'disabled' : ''} onclick="goToPatientPage(${patientCurrentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - patientCurrentPage) <= 1) {
            html += `<button class="pagination-btn ${i === patientCurrentPage ? 'active' : ''}" onclick="goToPatientPage(${i})">${i}</button>`;
        } else if (i === 2 && patientCurrentPage > 4) {
            html += '<span class="pagination-dots">...</span>';
        } else if (i === totalPages - 1 && patientCurrentPage < totalPages - 3) {
            html += '<span class="pagination-dots">...</span>';
        }
    }

    html += `<button class="pagination-btn" ${patientCurrentPage >= totalPages ? 'disabled' : ''} onclick="goToPatientPage(${patientCurrentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    html += `<span class="pagination-info">${totalPatients} patient${totalPatients !== 1 ? 's' : ''}</span>`;

    container.innerHTML = html;
}

function goToPatientPage(page) {
    patientCurrentPage = page;
    loadPatients();
}

function filterPatients() {
    patientCurrentPage = 1;
    loadPatients();
}

function clearPatientFilters() {
    const statusFilter = document.getElementById('patientStatusFilter');
    const searchInput = document.getElementById('patientSearch');
    if (statusFilter) statusFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    patientCurrentPage = 1;
    loadPatients();
}

function getLastVisit(appointments) {
    const completed = appointments
        .filter(a => a.status === 'Completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (completed.length === 0) return 'Never';
    return formatDate(completed[0].date);
}

function addPatient(event) {
    event.preventDefault();

    const name = document.getElementById('ptName').value.trim();
    const age = document.getElementById('ptAge').value.trim();
    const gender = document.getElementById('ptGender').value;
    const phone = document.getElementById('ptPhone').value.trim();
    const email = document.getElementById('ptEmail').value.trim();
    const address = document.getElementById('ptAddress').value.trim();

    if (!name || !age || !gender || !phone) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // Check for duplicate phone
    const existingPatients = getData('patients');
    if (existingPatients.find(p => p.phone === phone)) {
        showToast('A patient with this phone number already exists.', 'error');
        return;
    }

    const patient = {
        id: generateId(),
        name,
        age: parseInt(age),
        gender,
        phone,
        email,
        address,
        createdAt: new Date().toISOString()
    };

    const patients = getData('patients');
    patients.unshift(patient);
    setData('patients', patients);

    // Reset form
    document.getElementById('ptName').value = '';
    document.getElementById('ptAge').value = '';
    document.getElementById('ptGender').value = '';
    document.getElementById('ptPhone').value = '';
    document.getElementById('ptEmail').value = '';
    document.getElementById('ptAddress').value = '';

    closeModal('addPatientModal');
    loadPatients();
    refreshDashboard();
    renderCalendarView();
    loadAccountsBook();
    showToast('Patient added successfully!', 'success');
}

function viewPatient(id) {
    const patients = getData('patients');
    const patient = patients.find(p => p.id === id);
    if (!patient) {
        showToast('Patient not found.', 'error');
        return;
    }

    currentViewingPatientId = id;

    // Render patient details
    const detailsEl = document.getElementById('patientDetails');
    if (detailsEl) {
        detailsEl.innerHTML = `
            <div class="patient-profile">
                <div class="patient-avatar">${patient.name.charAt(0).toUpperCase()}</div>
                <div class="patient-info-grid">
                    <div><strong>Name:</strong> ${escapeHtml(patient.name)}</div>
                    <div><strong>Age:</strong> ${patient.age || '-'}</div>
                    <div><strong>Gender:</strong> ${patient.gender || '-'}</div>
                    <div><strong>Phone:</strong> ${escapeHtml(patient.phone)}</div>
                    ${patient.email ? `<div><strong>Email:</strong> ${escapeHtml(patient.email)}</div>` : ''}
                    ${patient.address ? `<div class="full-width"><strong>Address:</strong> ${escapeHtml(patient.address)}</div>` : ''}
                    <div><strong>Registered:</strong> ${formatDate(patient.createdAt)}</div>
                </div>
            </div>
        `;
    }

    // Render treatment history (appointments + prescriptions)
    const visitEl = document.getElementById('visitHistory');
    if (visitEl) {
        const appointments = getData('appointments').filter(a => a.patientId === id);
        const prescriptions = getData('prescriptions').filter(rx => rx.patientId === id);
        const followups = getData('followups').filter(f => f.patientId === id);

        let html = '';

        // Appointments section
        if (appointments.length > 0) {
            html += '<div class="history-section">';
            html += '<h4><i class="fas fa-calendar-check"></i> Appointments</h4>';
            html += '<div class="history-list">';
            appointments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(a => {
                const statusClass = getStatusClass(a.status);
                const duration = a.duration || 30;
                html += `
                    <div class="history-item ${statusClass}">
                        <div class="history-date">${formatDate(a.date)}</div>
                        <div class="history-content">
                            <span class="history-time">${a.time || a.startTime} (${duration} min)</span>
                            <span class="history-service">${escapeHtml(a.service || 'General')}</span>
                        </div>
                        <span class="status-badge ${statusClass}">${a.status || 'Scheduled'}</span>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        // Prescriptions section
        if (prescriptions.length > 0) {
            html += '<div class="history-section">';
            html += '<h4><i class="fas fa-file-prescription"></i> Prescriptions</h4>';
            html += '<div class="history-list">';
            prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(rx => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${formatDate(rx.date)}</div>
                        <div class="history-content">
                            <span class="history-diagnosis">${escapeHtml(rx.diagnosis ? rx.diagnosis.substring(0, 60) : 'N/A')}${rx.diagnosis && rx.diagnosis.length > 60 ? '...' : ''}</span>
                        </div>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        // Follow-ups section
        if (followups.length > 0) {
            html += '<div class="history-section">';
            html += '<h4><i class="fas fa-bell"></i> Follow-ups</h4>';
            html += '<div class="history-list">';
            followups.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(f => {
                const statusClass = f.status === 'Completed' ? 'completed' : 'pending';
                html += `
                    <div class="history-item ${statusClass}">
                        <div class="history-date">${formatDate(f.date)}</div>
                        <div class="history-content">
                            <span>${escapeHtml(f.reason || '-')}</span>
                        </div>
                        <span class="status-badge ${statusClass}">${f.status || 'Pending'}</span>
                    </div>
                `;
            });
            html += '</div></div>';
        }

        if (html === '') {
            html = '<p class="no-data">No treatment history yet.</p>';
        }

        visitEl.innerHTML = html;
    }

    // Wire up action buttons
    const btnRx = document.getElementById('btnWriteRx');
    const btnFu = document.getElementById('btnScheduleFu');
    const btnWa = document.getElementById('btnPatientWa');
    const btnBook = document.getElementById('btnBookAppt');
    const btnComplete = document.getElementById('btnCompleteAppt');
    const btnCancel = document.getElementById('btnCancelAppt');
    const btnReschedule = document.getElementById('btnRescheduleAppt');
    const btnEdit = document.getElementById('btnEditPatient');

    // Complete button: find latest completable appointment for this patient
    if (btnComplete) {
        const allAppts = getData('appointments').filter(a => a.patientId === id);
        const completableAppt = allAppts
            .filter(a => a.status !== 'Completed' && a.status !== 'Cancelled' && hasAppointmentTimePassed(a.date, a.time || a.startTime))
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        if (completableAppt) {
            btnComplete.style.display = '';
            btnComplete.onclick = function () {
                closeModal('viewPatientModal');
                setTimeout(function () { openTreatmentModal(completableAppt.id); }, 150);
            };
        } else {
            btnComplete.style.display = 'none';
        }
    }

    if (btnRx) {
        const patientId = id;
        btnRx.onclick = function () {
            closeModal('viewPatientModal');
            setTimeout(function () { writePrescription(patientId); }, 150);
        };
        btnRx.style.display = '';
        btnRx.style.opacity = '';
        btnRx.style.cursor = '';
    }
    if (btnFu) {
        const patientId = id;
        btnFu.onclick = function () {
            closeModal('viewPatientModal');
            setTimeout(function () { scheduleFollowup(patientId); }, 150);
        };
        btnFu.style.display = '';
    }
    if (btnBook) {
        const patientId = id;
        btnBook.onclick = function () {
            closeModal('viewPatientModal');
            setTimeout(function () { openQuickBooking(patientId); }, 150);
        };
        btnBook.style.display = '';
        btnBook.style.opacity = '';
        btnBook.style.cursor = '';
    }
    if (btnEdit) {
        const patientId = id;
        btnEdit.onclick = function () {
            closeModal('viewPatientModal');
            setTimeout(function () { openEditPatient(patientId); }, 150);
        };
        btnEdit.style.display = '';
    }
    if (btnWa) {
        btnWa.onclick = function () {
            openWhatsApp(patient.phone, `Hello ${patient.name}, this is Shree Physiotherapy Clinic. We hope you are doing well. Please reach us at 822004084 or 9092294466 for any queries.`);
        };
        btnWa.style.display = '';
    }
    // Hide cancel/reschedule in patient view (only shown in appointment view)
    if (btnCancel) btnCancel.style.display = 'none';
    if (btnReschedule) btnReschedule.style.display = 'none';

    // Reset modal title and subtitle
    const modalTitle = document.querySelector('#viewPatientModal .modal h2');
    if (modalTitle) modalTitle.textContent = 'Patient Details';
    const modalSubtitle = document.getElementById('viewModalSubtitle');
    if (modalSubtitle) modalSubtitle.textContent = 'Treatment History';

    openModal('viewPatientModal');
}

/* Edit Patient */
function openEditPatient(patientId) {
    const patients = getData('patients');
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showToast('Patient not found.', 'error');
        return;
    }

    document.getElementById('editPtId').value = patientId;
    document.getElementById('editPtName').value = patient.name || '';
    document.getElementById('editPtAge').value = patient.age || '';
    document.getElementById('editPtGender').value = patient.gender || '';
    document.getElementById('editPtPhone').value = patient.phone || '';
    document.getElementById('editPtEmail').value = patient.email || '';
    document.getElementById('editPtAddress').value = patient.address || '';

    openModal('editPatientModal');
}

function saveEditPatient(event) {
    event.preventDefault();

    const patientId = document.getElementById('editPtId').value;
    const name = document.getElementById('editPtName').value.trim();
    const age = document.getElementById('editPtAge').value.trim();
    const gender = document.getElementById('editPtGender').value;
    const phone = document.getElementById('editPtPhone').value.trim();
    const email = document.getElementById('editPtEmail').value.trim();
    const address = document.getElementById('editPtAddress').value.trim();

    if (!name || !age || !gender || !phone) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    const patients = getData('patients');
    const index = patients.findIndex(p => p.id === patientId);
    if (index === -1) {
        showToast('Patient not found.', 'error');
        return;
    }

    // Check for duplicate phone (excluding current patient)
    if (patients.find(p => p.phone === phone && p.id !== patientId)) {
        showToast('Another patient with this phone number already exists.', 'error');
        return;
    }

    patients[index].name = name;
    patients[index].age = parseInt(age);
    patients[index].gender = gender;
    patients[index].phone = phone;
    patients[index].email = email;
    patients[index].address = address;
    patients[index].updatedAt = new Date().toISOString();

    setData('patients', patients);

    // Propagate name/phone changes to linked appointments
    const appointments = getData('appointments');
    appointments.forEach(function(apt) {
        if (apt.patientId === patientId) {
            apt.patientName = name;
            apt.name = name;
            apt.phone = phone;
        }
    });
    setData('appointments', appointments);

    // Propagate name to prescriptions
    const prescriptions = getData('prescriptions');
    prescriptions.forEach(function(rx) {
        if (rx.patientId === patientId) {
            rx.patientName = name;
        }
    });
    setData('prescriptions', prescriptions);

    // Propagate name to follow-ups
    const followups = getData('followups');
    followups.forEach(function(fu) {
        if (fu.patientId === patientId) {
            fu.patientName = name;
        }
    });
    setData('followups', followups);

    closeModal('editPatientModal');
    loadPatients();
    loadAppointments();
    refreshDashboard();
    showToast('Patient updated successfully!', 'success');
}

function deletePatient(id) {
    if (!confirm('Move this patient to trash? Their data will not appear in Accounts until restored.')) return;

    let patients = getData('patients');
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    // Move patient to trash
    let trash = getData('trash') || [];
    patient.deletedAt = new Date().toISOString();
    trash.unshift(patient);
    setData('trash', trash);

    // Remove from active patients
    patients = patients.filter(p => p.id !== id);
    setData('patients', patients);

    loadPatients();
    loadAppointments();
    refreshDashboard();
    renderCalendarView();
    loadAccountsBook();
    showToast('Patient moved to trash.', 'info');
}

// Patient search filter (with pagination reset)
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('patientSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                patientCurrentPage = 1;
                loadPatients();
            }, 300);
        });
    }
});

/* ============================================
   4. APPOINTMENTS - ENHANCED
   ============================================ */
function loadAppointments() {
    const appointments = getData('appointments');
    const patients = getData('patients');
    const trash = getData('trash') || [];
    const filterDate = document.getElementById('appointmentFilter') ? document.getElementById('appointmentFilter').value : '';
    const filterStatus = document.getElementById('appointmentStatusFilter') ? document.getElementById('appointmentStatusFilter').value : 'all';
    const tbody = document.querySelector('#appointmentsTable tbody');
    if (!tbody) return;

    // Get IDs of patients in trash (excluded from appointments list)
    const trashedPatientIds = new Set(trash.map(p => p.id));

    // Filter out appointments for trashed patients
    let filtered = appointments.filter(a => !trashedPatientIds.has(a.patientId));

    if (filterDate) {
        filtered = filtered.filter(a => {
            const aptDate = new Date(a.date).toISOString().split('T')[0];
            return aptDate === filterDate;
        });
    }

    if (filterStatus && filterStatus !== 'all') {
        filtered = filtered.filter(a => a.status === filterStatus);
    }

    // Sort by date descending, then time
    filtered.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return timeStringToMinutes(a.time || '') - timeStringToMinutes(b.time || '');
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-light);">No appointments found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(a => {
        // Resolve patient name
        let patientName = a.patientName || a.name || 'Unknown';
        if (a.patientId) {
            const pt = patients.find(p => p.id === a.patientId);
            if (pt) patientName = pt.name;
        }

        const duration = a.duration || 30;
        const endTime = a.endTime || calculateEndTime(a.time, duration);
        const timeRange = `${a.time || a.startTime} - ${endTime}`;

        const statusClass = getStatusClass(a.status);
        const statusLabel = a.status || 'Scheduled';
        const isActionable = statusLabel !== 'Completed' && statusLabel !== 'Cancelled';

        // Check if appointment time has passed (IST) - only then allow "Complete"
        const timePassed = hasAppointmentTimePassed(a.date, a.time || a.startTime);
        const canComplete = isActionable && timePassed;

        // Payment badge
        const paymentStatus = a.paymentStatus || 'Pending';
        const paymentClass = paymentStatus.toLowerCase();
        const amountDisplay = a.amountPaid ? `₹${a.amountPaid}` : '-';

        return `<tr>
            <td><strong><a href="javascript:void(0)" class="clickable-name" onclick="viewAppointmentDetails('${a.id}')">${escapeHtml(patientName)}</a></strong></td>
            <td>${formatDate(a.date)}</td>
            <td>
                <span class="time-range">${timeRange}</span>
                <span class="duration-badge">${duration} min</span>
            </td>
            <td>${escapeHtml(a.service || 'General')}</td>
            <td><span class="payment-badge ${paymentClass}">${paymentStatus}${a.amountPaid ? ` (${amountDisplay})` : ''}</span></td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            <td>
                <button class="action-btn delete" title="Delete" onclick="deleteAppointment('${a.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function updateAppointmentStatus(id, status) {
    const appointments = getData('appointments');
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return;

    const apt = appointments[index];

    // Prevent completing appointment before scheduled time
    if (status === 'Completed') {
        const timePassed = hasAppointmentTimePassed(apt.date, apt.time || apt.startTime);
        if (!timePassed) {
            showToast('Cannot mark as completed - appointment time has not yet passed.', 'error');
            return;
        }
    }

    appointments[index].status = status;
    appointments[index].updatedAt = new Date().toISOString();
    setData('appointments', appointments);

    // If status is Completed and there's a linked follow-up, offer to mark it
    if (status === 'Completed') {
        const followups = getData('followups');
        const relatedFollowup = followups.find(f =>
            f.patientId === appointments[index].patientId &&
            f.date === appointments[index].date &&
            f.status !== 'Completed'
        );
        if (relatedFollowup) {
            relatedFollowup.status = 'Completed';
            setData('followups', followups);
        }
    }

    // Refresh all relevant views
    loadAppointments();
    refreshDashboard();
    renderCalendarView();
    loadAccountsBook();
    showToast(`Appointment ${status.toLowerCase()}.`, status === 'Completed' ? 'success' : 'info');
}

// Clear appointment filters
function clearAppointmentFilters() {
    const dateFilter = document.getElementById('appointmentFilter');
    const statusFilter = document.getElementById('appointmentStatusFilter');
    const searchInput = document.getElementById('appointmentSearch');
    if (dateFilter) dateFilter.value = '';
    if (statusFilter) statusFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    loadAppointments();
}

// Appointment filters
document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('appointmentFilter');
    if (filterInput) {
        filterInput.addEventListener('change', loadAppointments);
    }

    const statusFilter = document.getElementById('appointmentStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', loadAppointments);
    }

    // Appointment search
    const appointmentSearchInput = document.getElementById('appointmentSearch');
    if (appointmentSearchInput) {
        appointmentSearchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#appointmentsTable tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
});

/* ============================================
   5. CALENDAR VIEW - WEEK VIEW (DEFAULT)
   ============================================ */
function renderCalendarView() {
    if (calendarView === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
}

function toggleCalendarView(view) {
    calendarView = view;

    // Update toggle buttons
    document.querySelectorAll('.calendar-view-toggle button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.calendar-view-toggle button[data-view="${view}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    renderCalendarView();
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function renderWeekView() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const trash = getData('trash') || [];
    const trashedPatientIds = new Set(trash.map(p => p.id));
    const appointments = getData('appointments').filter(a => a.status !== 'Cancelled' && !trashedPatientIds.has(a.patientId));
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Header with week navigation
    const monthLabel = document.getElementById('dashCalendarMonth');
    if (monthLabel) {
        const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        monthLabel.textContent = `${startMonth} - ${endMonth}`;
    }

    // Build week grid
    let html = '<div class="week-view">';

    // Time column header
    html += '<div class="week-header">';
    html += '<div class="time-column-header">Time</div>';

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(day.getDate() + i);
        const isToday = isSameDay(day, new Date());
        const isSunday = day.getDay() === 0;
        html += `
            <div class="day-header ${isToday ? 'today' : ''} ${isSunday ? 'sunday' : ''}">
                <span class="day-name">${dayNames[i]}</span>
                <span class="day-number">${day.getDate()}</span>
            </div>
        `;
    }
    html += '</div>';

    // Time grid
    html += '<div class="week-grid">';

    // Generate time slots (morning: 10 AM - 1:30 PM, evening: 6 PM - 8:30 PM)
    const timeSlots = [];

    // Morning slots (10:00 AM - 1:30 PM)
    for (let h = 10; h <= 13; h++) {
        if (h === 13) {
            timeSlots.push({ hour: h, minute: 0, label: '1:00 PM' });
        } else {
            timeSlots.push({ hour: h, minute: 0, label: formatHour(h) });
        }
    }

    // Break indicator
    timeSlots.push({ hour: 0, minute: 0, label: 'BREAK', isBreak: true });

    // Evening slots (6:00 PM - 8:30 PM)
    for (let h = 18; h <= 20; h++) {
        timeSlots.push({ hour: h, minute: 0, label: formatHour(h) });
    }

    timeSlots.forEach(slot => {
        if (slot.isBreak) {
            html += `
                <div class="time-row break-row">
                    <div class="time-label break-label">
                        <i class="fas fa-coffee"></i> Break (1:30 PM - 6:00 PM)
                    </div>
                    <div class="day-cells break-cells" style="grid-column: span 7;"></div>
                </div>
            `;
            return;
        }

        html += '<div class="time-row">';
        html += `<div class="time-label">${slot.label}</div>`;

        // Day cells
        for (let d = 0; d < 7; d++) {
            const cellDate = new Date(currentWeekStart);
            cellDate.setDate(cellDate.getDate() + d);
            const isSunday = cellDate.getDay() === 0;

            // Find appointments in this cell (within this hour)
            const cellAppointments = appointments.filter(a => {
                const aptDate = new Date(a.date);
                if (!isSameDay(aptDate, cellDate)) return false;

                const aptMinutes = timeStringToMinutes(a.time || a.startTime || '');
                const slotMinutes = slot.hour * 60;
                return aptMinutes >= slotMinutes && aptMinutes < slotMinutes + 60;
            });

            html += `<div class="day-cell ${isSunday ? 'closed' : ''}" data-date="${cellDate.toISOString().split('T')[0]}" data-hour="${slot.hour}">`;

            if (isSunday) {
                html += '<span class="closed-label">Closed</span>';
            } else {
                cellAppointments.forEach(apt => {
                    const patients = getData('patients');
                    const patient = patients.find(p => p.id === apt.patientId);
                    const patientName = patient ? patient.name : apt.patientName || 'Patient';
                    const duration = apt.duration || 30;
                    const heightPercent = (duration / 60) * 100;

                    html += `
                        <div class="appointment-block" style="height: ${Math.max(heightPercent, 30)}%;"
                             onclick="viewAppointmentDetails('${apt.id}')" title="${escapeHtml(patientName)} - ${apt.time}">
                            <span class="apt-time">${apt.time || apt.startTime}</span>
                            <span class="apt-name">${escapeHtml(patientName.split(' ')[0])}</span>
                        </div>
                    `;
                });
            }

            html += '</div>';
        }

        html += '</div>';
    });

    html += '</div></div>';

    container.innerHTML = html;
}

function renderMonthView() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const grid = document.createElement('div');
    grid.className = 'calendar-grid month-grid';

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const monthLabel = document.getElementById('dashCalendarMonth');
    if (monthLabel) {
        monthLabel.textContent = months[currentDashMonth] + ' ' + currentDashYear;
    }

    const firstDay = new Date(currentDashYear, currentDashMonth, 1).getDay();
    const daysInMonth = new Date(currentDashYear, currentDashMonth + 1, 0).getDate();
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Get appointments for this month (exclude trashed patients)
    const trash = getData('trash') || [];
    const trashedPatientIds = new Set(trash.map(p => p.id));
    const appointments = getData('appointments').filter(a => !trashedPatientIds.has(a.patientId));
    const appointmentDates = {};
    appointments.forEach(a => {
        if (!a.date || a.status === 'Cancelled') return;
        const d = new Date(a.date);
        if (d.getMonth() === currentDashMonth && d.getFullYear() === currentDashYear) {
            const day = d.getDate();
            if (!appointmentDates[day]) appointmentDates[day] = [];
            appointmentDates[day].push(a);
        }
    });

    let html = '';

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    html += '<div class="calendar-days-header">';
    dayNames.forEach(name => {
        html += `<span>${name}</span>`;
    });
    html += '</div>';

    html += '<div class="calendar-grid">';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (day === todayDate && currentDashMonth === todayMonth && currentDashYear === todayYear);
        const isSunday = new Date(currentDashYear, currentDashMonth, day).getDay() === 0;
        const dayAppts = appointmentDates[day] || [];
        const hasAppts = dayAppts.length > 0;

        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isSunday) classes += ' sunday';
        if (hasAppts) classes += ' has-appointments';

        const dateStr = `${currentDashYear}-${String(currentDashMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        html += `
            <div class="${classes}" onclick="filterAppointmentsByDate('${dateStr}')">
                <span class="day-number">${day}</span>
                ${hasAppts ? `<span class="apt-count">${dayAppts.length}</span>` : ''}
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function changeWeek(delta) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (delta * 7));
    renderWeekView();
}

function changeDashMonth(delta) {
    if (calendarView === 'week') {
        changeWeek(delta);
        return;
    }

    currentDashMonth += delta;
    if (currentDashMonth < 0) {
        currentDashMonth = 11;
        currentDashYear--;
    } else if (currentDashMonth > 11) {
        currentDashMonth = 0;
        currentDashYear++;
    }
    renderMonthView();
}

function goToToday() {
    const today = new Date();
    selectedCalendarDate = new Date(today);
    currentWeekStart = getWeekStart(today);
    currentDashMonth = today.getMonth();
    currentDashYear = today.getFullYear();
    miniCalendarMonth = today.getMonth();
    miniCalendarYear = today.getFullYear();

    renderMiniCalendar();
    renderCalendlyView();
}

function filterAppointmentsByDate(dateStr) {
    const filterInput = document.getElementById('appointmentFilter');
    if (filterInput) {
        filterInput.value = dateStr;
    }
    switchTab('appointments');
}

function viewAppointmentDetails(id) {
    const appointments = getData('appointments');
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    const patients = getData('patients');
    const patient = patients.find(p => p.id === apt.patientId);
    const patientName = patient ? patient.name : apt.patientName || 'Unknown';
    const patientPhone = patient ? patient.phone : apt.phone || '-';
    const duration = apt.duration || 30;
    const endTime = apt.endTime || calculateEndTime(apt.time, duration);

    // Use the same modal style as patient popup
    const detailsEl = document.getElementById('patientDetails');
    if (detailsEl) {
        detailsEl.innerHTML = `
            <div class="patient-profile">
                <div class="patient-avatar">${patientName.charAt(0).toUpperCase()}</div>
                <div class="patient-info-grid">
                    <div><strong>Patient:</strong> ${escapeHtml(patientName)}</div>
                    <div><strong>Phone:</strong> ${escapeHtml(patientPhone)}</div>
                    <div><strong>Date:</strong> ${formatDate(apt.date)}</div>
                    <div><strong>Time:</strong> ${(apt.time || apt.startTime)} - ${endTime}</div>
                    <div><strong>Service:</strong> ${escapeHtml(apt.service || 'General')}</div>
                    <div><strong>Duration:</strong> ${duration} minutes</div>
                    <div><strong>Status:</strong> <span class="status-badge ${getStatusClass(apt.status)}">${apt.status || 'Scheduled'}</span></div>
                    <div><strong>Payment:</strong> ${apt.paymentStatus || 'Pending'}${apt.amountPaid ? ' (₹' + apt.amountPaid + ')' : ''}</div>
                    ${apt.notes ? `<div class="full-width"><strong>Notes:</strong> ${escapeHtml(apt.notes)}</div>` : ''}
                </div>
            </div>
        `;
    }

    // Show appointment history for this patient
    const visitEl = document.getElementById('visitHistory');
    if (visitEl) {
        let html = '';
        if (apt.patientId) {
            const patientAppointments = appointments.filter(a => a.patientId === apt.patientId && a.id !== id);
            if (patientAppointments.length > 0) {
                html += '<div class="history-section">';
                html += '<h4><i class="fas fa-calendar-check"></i> Other Appointments</h4>';
                html += '<div class="history-list">';
                patientAppointments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(a => {
                    const statusClass = getStatusClass(a.status);
                    const dur = a.duration || 30;
                    html += `
                        <div class="history-item ${statusClass}">
                            <div class="history-date">${formatDate(a.date)}</div>
                            <div class="history-content">
                                <span class="history-time">${a.time || a.startTime} (${dur} min)</span>
                                <span class="history-service">${escapeHtml(a.service || 'General')}</span>
                            </div>
                            <span class="status-badge ${statusClass}">${a.status || 'Scheduled'}</span>
                        </div>
                    `;
                });
                html += '</div></div>';
            }

            const prescriptions = getData('prescriptions').filter(rx => rx.patientId === apt.patientId);
            if (prescriptions.length > 0) {
                html += '<div class="history-section">';
                html += '<h4><i class="fas fa-file-prescription"></i> Prescriptions</h4>';
                html += '<div class="history-list">';
                prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(rx => {
                    html += `
                        <div class="history-item">
                            <div class="history-date">${formatDate(rx.date)}</div>
                            <div class="history-content">
                                <span class="history-diagnosis">${escapeHtml(rx.diagnosis ? rx.diagnosis.substring(0, 60) : 'N/A')}${rx.diagnosis && rx.diagnosis.length > 60 ? '...' : ''}</span>
                            </div>
                        </div>
                    `;
                });
                html += '</div></div>';
            }
        }

        if (html === '') {
            html = '<p class="no-data">No other records for this patient.</p>';
        }
        visitEl.innerHTML = html;
    }

    // Wire up action buttons
    const btnRx = document.getElementById('btnWriteRx');
    const btnFu = document.getElementById('btnScheduleFu');
    const btnWa = document.getElementById('btnPatientWa');
    const btnBook = document.getElementById('btnBookAppt');
    const btnComplete = document.getElementById('btnCompleteAppt');
    const btnCancel = document.getElementById('btnCancelAppt');
    const btnReschedule = document.getElementById('btnRescheduleAppt');
    const btnEdit = document.getElementById('btnEditPatient');

    const isActionable = apt.status !== 'Completed' && apt.status !== 'Cancelled';

    // Complete button: show if appointment time has passed and status is not Completed/Cancelled
    if (btnComplete) {
        const timePassed = hasAppointmentTimePassed(apt.date, apt.time || apt.startTime);
        const canComplete = isActionable && timePassed;
        btnComplete.style.display = canComplete ? '' : 'none';
        btnComplete.onclick = function () {
            closeModal('viewPatientModal');
            setTimeout(function () { openTreatmentModal(apt.id); }, 150);
        };
    }

    if (btnRx) {
        btnRx.style.display = apt.patientId ? '' : 'none';
        btnRx.style.opacity = '';
        btnRx.style.cursor = '';
        btnRx.onclick = function () {
            const pid = apt.patientId;
            closeModal('viewPatientModal');
            setTimeout(function () { writePrescription(pid); }, 150);
        };
    }
    if (btnFu) {
        btnFu.style.display = apt.patientId ? '' : 'none';
        btnFu.onclick = function () {
            const pid = apt.patientId;
            closeModal('viewPatientModal');
            setTimeout(function () { scheduleFollowup(pid); }, 150);
        };
    }
    if (btnBook) {
        btnBook.style.display = apt.patientId ? '' : 'none';
        btnBook.style.opacity = '';
        btnBook.style.cursor = '';
        btnBook.onclick = function () {
            const pid = apt.patientId;
            closeModal('viewPatientModal');
            setTimeout(function () { openQuickBooking(pid); }, 150);
        };
    }
    // Cancel button - only for active appointments
    if (btnCancel) {
        btnCancel.style.display = isActionable ? '' : 'none';
        btnCancel.onclick = function () {
            if (confirm('Cancel this appointment?')) {
                closeModal('viewPatientModal');
                updateAppointmentStatus(apt.id, 'Cancelled');
            }
        };
    }
    // Reschedule button - only for active appointments
    if (btnReschedule) {
        btnReschedule.style.display = isActionable ? '' : 'none';
        btnReschedule.onclick = function () {
            closeModal('viewPatientModal');
            setTimeout(function () { rescheduleAppointment(apt.id); }, 150);
        };
    }
    // Edit patient button
    if (btnEdit) {
        btnEdit.style.display = apt.patientId ? '' : 'none';
        btnEdit.onclick = function () {
            const pid = apt.patientId;
            closeModal('viewPatientModal');
            setTimeout(function () { openEditPatient(pid); }, 150);
        };
    }
    if (btnWa) {
        btnWa.onclick = function () {
            openWhatsApp(patientPhone, `Hello ${patientName}, this is a reminder about your appointment at Shree Physiotherapy Clinic.`);
        };
        btnWa.style.display = '';
    }

    // Set modal title and subtitle
    const modalTitle = document.querySelector('#viewPatientModal .modal h2');
    if (modalTitle) modalTitle.textContent = 'Appointment Details';
    const modalSubtitle = document.getElementById('viewModalSubtitle');
    if (modalSubtitle) modalSubtitle.textContent = 'Patient History';

    openModal('viewPatientModal');
}

function rescheduleAppointment(id) {
    const appointments = getData('appointments');
    const apt = appointments.find(a => a.id === id);
    if (!apt) {
        showToast('Appointment not found.', 'error');
        return;
    }

    const patients = getData('patients');
    const patient = patients.find(p => p.id === apt.patientId);

    if (patient) {
        // Open quick booking with prefilled data
        document.getElementById('qbPatientId').value = apt.patientId;
        document.getElementById('qbPatientName').textContent = 'Reschedule for: ' + patient.name;
        document.getElementById('qbDate').value = apt.date || '';
        document.getElementById('qbStartTime').value = apt.time || apt.startTime || '10:00 AM';
        document.getElementById('qbDuration').value = apt.duration || '30';
        document.getElementById('qbService').value = apt.service || '';
        document.getElementById('qbPaymentAmount').value = apt.amountPaid || '';
        document.getElementById('qbPaymentStatus').value = apt.paymentStatus || 'Pending';
        document.getElementById('qbPaymentMode').value = apt.paymentMode || '';

        // Store old appointment ID to delete after new one is created
        document.getElementById('qbPatientId').dataset.rescheduleFrom = id;

        updateEndTimeDisplay();
        openModal('quickBookingModal');
    } else {
        showToast('Patient not found for this appointment.', 'error');
    }
}

function deleteAppointment(id) {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        return;
    }

    const appointments = getData('appointments');
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
        showToast('Appointment not found.', 'error');
        return;
    }

    // Remove the appointment
    appointments.splice(index, 1);
    setData('appointments', appointments);

    // Refresh views
    loadAppointments();
    refreshDashboard();
    renderCalendarView();
    loadAccountsBook();
    showToast('Appointment deleted successfully.', 'success');
}

/* ============================================
   6. PRESCRIPTIONS - ENHANCED
   ============================================ */
function loadPrescriptions() {
    const prescriptions = getData('prescriptions');
    const patients = getData('patients');
    const appointments = getData('appointments');
    const filterDate = document.getElementById('prescriptionDateFilter') ? document.getElementById('prescriptionDateFilter').value : '';
    const statusFilter = document.getElementById('prescriptionStatusFilter') ? document.getElementById('prescriptionStatusFilter').value : 'all';
    const tbody = document.querySelector('#prescriptionsTable tbody');
    if (!tbody) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = getWeekStart(today);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Filter prescriptions
    let filtered = prescriptions;

    // Filter by date if set
    if (filterDate) {
        filtered = filtered.filter(rx => {
            const rxDate = rx.date ? rx.date.split('T')[0] : '';
            return rxDate === filterDate;
        });
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
        switch (statusFilter) {
            case 'today':
                filtered = filtered.filter(rx => {
                    const rxDate = rx.date ? rx.date.split('T')[0] : '';
                    return rxDate === todayStr;
                });
                break;
            case 'week':
                filtered = filtered.filter(rx => {
                    const rxDate = new Date(rx.date);
                    return rxDate >= weekStart && rxDate <= today;
                });
                break;
            case 'month':
                filtered = filtered.filter(rx => {
                    const rxDate = new Date(rx.date);
                    return rxDate >= monthStart && rxDate <= today;
                });
                break;
            case 'with-followup':
                filtered = filtered.filter(rx => rx.followupDate && rx.followupDate.trim() !== '');
                break;
        }
    }

    // Sort by date descending
    const sorted = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (sorted.length === 0) {
        const filterActive = filterDate || (statusFilter && statusFilter !== 'all');
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-light);">${filterActive ? 'No prescriptions match the selected filters.' : 'No prescriptions yet.'}</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map(rx => {
        let patientName = rx.patientName || 'Unknown';
        if (rx.patientId) {
            const pt = patients.find(p => p.id === rx.patientId);
            if (pt) patientName = pt.name;
        }

        // Find linked appointment
        const linkedApt = appointments.find(a =>
            a.patientId === rx.patientId &&
            a.date === rx.date
        );

        const diagnosisPreview = rx.diagnosis ? (rx.diagnosis.length > 50 ? rx.diagnosis.substring(0, 50) + '...' : rx.diagnosis) : 'N/A';

        return `<tr>
            <td><strong>${escapeHtml(patientName)}</strong></td>
            <td>${formatDate(rx.date)}</td>
            <td>${escapeHtml(diagnosisPreview)}</td>
            <td>${linkedApt ? `<span class="linked-badge"><i class="fas fa-link"></i> ${linkedApt.service || 'Visit'}</span>` : '-'}</td>
            <td>
                <button class="action-btn view" title="View" onclick="viewPrescription('${rx.id}')"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" title="Print" onclick="printPrescription('${rx.id}')"><i class="fas fa-print"></i></button>
                <button class="action-btn delete" title="Delete" onclick="deletePrescription('${rx.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// Delete prescription
function deletePrescription(id) {
    if (!confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
        return;
    }

    const prescriptions = getData('prescriptions');
    const index = prescriptions.findIndex(rx => rx.id === id);
    if (index === -1) {
        showToast('Prescription not found.', 'error');
        return;
    }

    prescriptions.splice(index, 1);
    setData('prescriptions', prescriptions);

    loadPrescriptions();
    refreshDashboard();
    showToast('Prescription deleted successfully.', 'success');
}

// Clear prescription filters
function clearPrescriptionFilters() {
    const dateFilter = document.getElementById('prescriptionDateFilter');
    const statusFilter = document.getElementById('prescriptionStatusFilter');
    const searchInput = document.getElementById('prescriptionSearch');
    if (dateFilter) dateFilter.value = '';
    if (statusFilter) statusFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    loadPrescriptions();
}

function writePrescription(patientId) {
    const patients = getData('patients');
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showToast('Patient not found.', 'error');
        return;
    }

    document.getElementById('rxPatientId').value = patientId;
    document.getElementById('rxPatientName').textContent = 'Patient: ' + patient.name;

    // Clear form
    document.getElementById('rxDiagnosis').value = '';
    document.getElementById('rxTreatment').value = '';
    document.getElementById('rxMedications').value = '';
    document.getElementById('rxInstructions').value = '';
    document.getElementById('rxFollowupDate').value = '';
    document.getElementById('rxFollowupReason').value = '';
    document.getElementById('rxPaymentAmount').value = '';
    document.getElementById('rxPaymentMode').value = '';

    openModal('prescriptionModal');
}

function savePrescription(event) {
    event.preventDefault();

    const patientId = document.getElementById('rxPatientId').value;
    const diagnosis = document.getElementById('rxDiagnosis').value.trim();
    const treatment = document.getElementById('rxTreatment').value.trim();
    const medications = document.getElementById('rxMedications').value.trim();
    const instructions = document.getElementById('rxInstructions').value.trim();
    const followupDate = document.getElementById('rxFollowupDate').value;
    const followupReason = document.getElementById('rxFollowupReason').value.trim();
    const paymentAmount = document.getElementById('rxPaymentAmount').value;
    const paymentMode = document.getElementById('rxPaymentMode').value;

    if (!diagnosis || !treatment) {
        showToast('Please fill in diagnosis and treatment plan.', 'error');
        return;
    }

    const patients = getData('patients');
    const patient = patients.find(p => p.id === patientId);

    const prescription = {
        id: generateId(),
        patientId,
        patientName: patient ? patient.name : 'Unknown',
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        treatment,
        medications,
        instructions,
        paymentAmount: paymentAmount || null,
        paymentMode: paymentMode || null,
        paymentStatus: (paymentAmount && parseFloat(paymentAmount) > 0) ? 'Paid' : 'Pending',
        createdAt: new Date().toISOString()
    };

    const prescriptions = getData('prescriptions');
    prescriptions.unshift(prescription);
    setData('prescriptions', prescriptions);

    // Auto-complete matching appointment for this patient
    const todayDate = getIndiaTodayDate();
    const appointments = getData('appointments');
    const matchingApt = appointments.find(a =>
        a.patientId === patientId &&
        a.date === todayDate &&
        a.status !== 'Completed' &&
        a.status !== 'Cancelled'
    );
    if (matchingApt) {
        matchingApt.status = 'Completed';
        matchingApt.updatedAt = new Date().toISOString();
        if (paymentAmount) matchingApt.amountPaid = paymentAmount;
        if (paymentMode) matchingApt.paymentMode = paymentMode;
        matchingApt.paymentStatus = (paymentAmount && parseFloat(paymentAmount) > 0) ? 'Paid' : 'Pending';
        setData('appointments', appointments);

        // Also complete any linked follow-up
        const followups = getData('followups');
        const relatedFollowup = followups.find(f =>
            f.patientId === patientId &&
            f.date === todayDate &&
            f.status !== 'Completed'
        );
        if (relatedFollowup) {
            relatedFollowup.status = 'Completed';
            setData('followups', followups);
        }
    }

    // Create follow-up if date is provided
    if (followupDate) {
        createFollowupWithAppointment(patientId, patient, followupDate, followupReason || 'Post-treatment follow-up');
    }

    closeModal('prescriptionModal');
    loadAppointments();
    refreshDashboard();
    renderCalendarView();
    loadAccountsBook();
    showToast('Prescription saved' + (matchingApt ? ' & appointment completed' : '') + (paymentAmount ? ` with ₹${paymentAmount} payment` : '') + '!', 'success');

    return prescription.id;
}

function saveAndPrintPrescription() {
    const diagnosis = document.getElementById('rxDiagnosis').value.trim();
    const treatment = document.getElementById('rxTreatment').value.trim();
    if (!diagnosis || !treatment) {
        showToast('Please fill in diagnosis and treatment plan.', 'error');
        return;
    }
    const rxId = savePrescription(new Event('submit'));
    if (rxId) {
        printPrescription(rxId);
    }
}

function duplicatePrescription(id) {
    const prescriptions = getData('prescriptions');
    const rx = prescriptions.find(p => p.id === id);
    if (!rx) return;

    document.getElementById('rxPatientId').value = rx.patientId;
    document.getElementById('rxPatientName').textContent = 'Patient: ' + rx.patientName;
    document.getElementById('rxDiagnosis').value = rx.diagnosis || '';
    document.getElementById('rxTreatment').value = rx.treatment || '';
    document.getElementById('rxMedications').value = rx.medications || '';
    document.getElementById('rxInstructions').value = rx.instructions || '';
    document.getElementById('rxFollowupDate').value = '';
    document.getElementById('rxFollowupReason').value = '';

    openModal('prescriptionModal');
    showToast('Prescription template loaded. Modify and save.', 'info');
}

function viewPrescription(id) {
    const prescriptions = getData('prescriptions');
    const rx = prescriptions.find(p => p.id === id);
    if (!rx) {
        showToast('Prescription not found.', 'error');
        return;
    }

    const patients = getData('patients');
    let patientName = rx.patientName || 'Unknown';
    let patientPhone = '';
    if (rx.patientId) {
        const pt = patients.find(p => p.id === rx.patientId);
        if (pt) {
            patientName = pt.name;
            patientPhone = pt.phone;
        }
    }

    const content = `
        <div class="prescription-view">
            <div class="rx-header">
                <h3>Shree Physiotherapy Clinic</h3>
                <p>Phone: 822004084 | 9092294466</p>
            </div>
            <div class="rx-patient-info">
                <div><strong>Patient:</strong> ${escapeHtml(patientName)}</div>
                <div><strong>Date:</strong> ${formatDate(rx.date)}</div>
                ${patientPhone ? `<div><strong>Phone:</strong> ${escapeHtml(patientPhone)}</div>` : ''}
            </div>
            <div class="rx-section">
                <label>DIAGNOSIS:</label>
                <p>${escapeHtml(rx.diagnosis || 'N/A')}</p>
            </div>
            <div class="rx-section">
                <label>TREATMENT PLAN:</label>
                <p>${escapeHtml(rx.treatment || 'N/A')}</p>
            </div>
            ${rx.medications ? `
                <div class="rx-section">
                    <label>MEDICATIONS:</label>
                    <p>${escapeHtml(rx.medications)}</p>
                </div>
            ` : ''}
            ${rx.instructions ? `
                <div class="rx-section">
                    <label>INSTRUCTIONS:</label>
                    <p>${escapeHtml(rx.instructions)}</p>
                </div>
            ` : ''}
        </div>
    `;

    const detailsEl = document.getElementById('patientDetails');
    const visitEl = document.getElementById('visitHistory');
    if (detailsEl) detailsEl.innerHTML = content;
    if (visitEl) visitEl.innerHTML = '';

    // Hide all action buttons for prescription view
    const allBtnIds = ['btnWriteRx', 'btnScheduleFu', 'btnPatientWa', 'btnBookAppt', 'btnCompleteAppt', 'btnCancelAppt', 'btnRescheduleAppt', 'btnEditPatient'];
    allBtnIds.forEach(function(btnId) {
        var btn = document.getElementById(btnId);
        if (btn) btn.style.display = 'none';
    });

    const modalTitle = document.querySelector('#viewPatientModal .modal h2');
    if (modalTitle) modalTitle.textContent = 'Prescription Details';

    openModal('viewPatientModal');
}

function printPrescription(id) {
    const prescriptions = getData('prescriptions');
    const rx = prescriptions.find(p => p.id === id);
    if (!rx) {
        showToast('Prescription not found.', 'error');
        return;
    }

    const patients = getData('patients');
    let patientName = rx.patientName || 'Unknown';
    let patientAge = '';
    let patientGender = '';
    let patientPhone = '';
    if (rx.patientId) {
        const pt = patients.find(p => p.id === rx.patientId);
        if (pt) {
            patientName = pt.name;
            patientAge = pt.age;
            patientGender = pt.gender;
            patientPhone = pt.phone;
        }
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Prescription - ${patientName}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2D2D2D; padding: 40px; line-height: 1.6; }
                .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #1B4D3E; margin-bottom: 24px; }
                .header h1 { font-size: 1.5rem; color: #1B4D3E; margin-bottom: 4px; }
                .header p { font-size: 0.85rem; color: #6B7280; }
                .patient-info { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E5E7EB; margin-bottom: 20px; font-size: 0.9rem; }
                .patient-info div { margin-right: 24px; }
                .section { margin-bottom: 18px; }
                .section-label { font-weight: 700; color: #1B4D3E; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
                .section-content { font-size: 0.92rem; white-space: pre-wrap; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; display: flex; justify-content: space-between; font-size: 0.82rem; color: #6B7280; }
                .signature { text-align: right; margin-top: 48px; }
                .signature p { border-top: 1px solid #2D2D2D; display: inline-block; padding-top: 8px; font-weight: 600; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Shree Physiotherapy Clinic</h1>
                <p>Periyanaickenpalayam, Coimbatore</p>
                <p>Phone: 822004084 | 9092294466 | WhatsApp: 9092294466</p>
            </div>
            <div class="patient-info">
                <div><strong>Patient:</strong> ${escapeHtml(patientName)}</div>
                ${patientAge ? `<div><strong>Age/Gender:</strong> ${patientAge} / ${patientGender}</div>` : ''}
                <div><strong>Date:</strong> ${formatDate(rx.date)}</div>
                ${patientPhone ? `<div><strong>Phone:</strong> ${escapeHtml(patientPhone)}</div>` : ''}
            </div>
            <div class="section">
                <div class="section-label">Diagnosis</div>
                <div class="section-content">${escapeHtml(rx.diagnosis || 'N/A')}</div>
            </div>
            <div class="section">
                <div class="section-label">Treatment Plan</div>
                <div class="section-content">${escapeHtml(rx.treatment || 'N/A')}</div>
            </div>
            ${rx.medications ? `<div class="section">
                <div class="section-label">Medications</div>
                <div class="section-content">${escapeHtml(rx.medications)}</div>
            </div>` : ''}
            ${rx.instructions ? `<div class="section">
                <div class="section-label">Instructions</div>
                <div class="section-content">${escapeHtml(rx.instructions)}</div>
            </div>` : ''}
            <div class="signature">
                <p>Dr. Aarthi Ganesh, BPT, MPT<br>Shree Physiotherapy Clinic</p>
            </div>
            <div class="footer">
                <span>Shree Physiotherapy Clinic</span>
                <span>This is a computer-generated prescription.</span>
            </div>
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Prescription search filter
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('prescriptionSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#prescriptionsTable tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
});

/* ============================================
   7. FOLLOW-UPS - ENHANCED
   ============================================ */
function loadFollowups() {
    const followups = getData('followups');
    const patients = getData('patients');
    const filterDate = document.getElementById('followupDateFilter') ? document.getElementById('followupDateFilter').value : '';
    const statusFilter = document.getElementById('followupStatusFilter') ? document.getElementById('followupStatusFilter').value : 'all';
    const tbody = document.querySelector('#followupsTable tbody');
    if (!tbody) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let filtered = followups;

    // Filter by date picker
    if (filterDate) {
        filtered = filtered.filter(f => f.date && f.date.startsWith(filterDate));
    }

    // Filter by status dropdown
    if (statusFilter && statusFilter !== 'all') {
        switch (statusFilter) {
            case 'today':
                filtered = filtered.filter(f => {
                    const fDate = f.date ? f.date.split('T')[0] : '';
                    return fDate === todayStr;
                });
                break;
            case 'week':
                filtered = filtered.filter(f => {
                    const fDate = new Date(f.date);
                    return fDate >= weekStart && fDate <= weekEnd;
                });
                break;
            case 'month':
                filtered = filtered.filter(f => {
                    const fDate = new Date(f.date);
                    return fDate >= monthStart && fDate <= monthEnd;
                });
                break;
            case 'overdue':
                filtered = filtered.filter(f => {
                    const fDate = new Date(f.date);
                    return f.status !== 'Completed' && fDate < today;
                });
                break;
            case 'pending':
                filtered = filtered.filter(f => f.status !== 'Completed');
                break;
            case 'completed':
                filtered = filtered.filter(f => f.status === 'Completed');
                break;
        }
    }

    // Sort: overdue first, then pending by date, then completed
    filtered.sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        const aOverdue = a.status !== 'Completed' && aDate < today;
        const bOverdue = b.status !== 'Completed' && bDate < today;

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return aDate - bDate;
    });

    if (filtered.length === 0) {
        const filterActive = (statusFilter && statusFilter !== 'all') || filterDate;
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-light);">${filterActive ? 'No follow-ups match the selected filters.' : 'No follow-ups found.'}</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(f => {
        let patientName = f.patientName || 'Unknown';
        let patientPhone = '';
        if (f.patientId) {
            const pt = patients.find(p => p.id === f.patientId);
            if (pt) {
                patientName = pt.name;
                patientPhone = pt.phone;
            }
        }

        const followupDate = new Date(f.date);
        const isOverdue = f.status !== 'Completed' && followupDate < today;
        const statusClass = f.status === 'Completed' ? 'completed' : (isOverdue ? 'overdue' : 'pending');
        const isPending = f.status !== 'Completed';

        return `<tr class="${isOverdue ? 'overdue-row' : ''}">
            <td><strong>${escapeHtml(patientName)}</strong></td>
            <td>
                ${formatDate(f.date)}
                ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}
            </td>
            <td>${escapeHtml(f.reason || '-')}</td>
            <td><span class="status-badge ${statusClass}">${f.status || 'Pending'}</span></td>
            <td>
                <button class="action-btn view" title="View" onclick="viewFollowup('${f.id}')"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" title="Book Appointment" onclick="bookFollowupAppointment('${f.id}')"><i class="fas fa-calendar-plus"></i></button>
                <button class="action-btn delete" title="Delete" onclick="deleteFollowup('${f.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function filterFollowups() {
    loadFollowups();
}

function clearFollowupFilters() {
    const dateFilter = document.getElementById('followupDateFilter');
    const statusFilter = document.getElementById('followupStatusFilter');
    const searchInput = document.getElementById('followupSearch');
    if (dateFilter) dateFilter.value = '';
    if (statusFilter) statusFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    loadFollowups();
}

function viewFollowup(id) {
    const followups = getData('followups');
    const f = followups.find(fu => fu.id === id);
    if (!f) {
        showToast('Follow-up not found.', 'error');
        return;
    }

    const patients = getData('patients');
    const patient = patients.find(p => p.id === f.patientId);
    const patientName = patient ? patient.name : f.patientName || 'Unknown';
    const patientPhone = patient ? patient.phone : '-';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followupDate = new Date(f.date);
    const isOverdue = f.status !== 'Completed' && followupDate < today;

    const details = `
        <div style="display:grid; gap:16px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div style="background:var(--bg); padding:12px; border-radius:8px;">
                    <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Patient</label>
                    <strong>${escapeHtml(patientName)}</strong>
                </div>
                <div style="background:var(--bg); padding:12px; border-radius:8px;">
                    <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Phone</label>
                    <strong>${escapeHtml(patientPhone)}</strong>
                </div>
                <div style="background:var(--bg); padding:12px; border-radius:8px;">
                    <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Follow-up Date</label>
                    <strong>${formatDate(f.date)} ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}</strong>
                </div>
                <div style="background:var(--bg); padding:12px; border-radius:8px;">
                    <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Status</label>
                    <span class="status-badge ${f.status === 'Completed' ? 'completed' : (isOverdue ? 'overdue' : 'pending')}">${f.status || 'Pending'}</span>
                </div>
            </div>
            <div style="background:var(--bg); padding:12px; border-radius:8px;">
                <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Reason</label>
                <p style="margin:0;">${escapeHtml(f.reason || '-')}</p>
            </div>
            ${f.notes ? `<div style="background:var(--bg); padding:12px; border-radius:8px;">
                <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Notes</label>
                <p style="margin:0;">${escapeHtml(f.notes)}</p>
            </div>` : ''}
        </div>
    `;

    showFollowupModal('Follow-up Details', details, f.id, f.patientId, patientPhone, f.status !== 'Completed');
}

function showFollowupModal(title, content, fuId, patientId, phone, isPending) {
    let modal = document.getElementById('followupViewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'followupViewModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width:500px;">
                <button class="modal-close" onclick="closeModal('followupViewModal')"><i class="fas fa-times"></i></button>
                <h2 id="fuModalTitle">Follow-up Details</h2>
                <div id="fuModalContent"></div>
                <div id="fuModalActions" style="display:flex; gap:10px; margin-top:20px; flex-wrap:wrap;"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('fuModalTitle').textContent = title;
    document.getElementById('fuModalContent').innerHTML = content;

    const actionsDiv = document.getElementById('fuModalActions');
    actionsDiv.innerHTML = `
        ${isPending ? `<button class="btn btn-primary" onclick="closeModal('followupViewModal'); markFollowupDone('${fuId}')">
            <i class="fas fa-check"></i> Mark as Done
        </button>` : ''}
        <button class="btn btn-whatsapp" onclick="sendFollowupReminder('${fuId}')">
            <i class="fab fa-whatsapp"></i> Send Reminder
        </button>
        ${patientId ? `<button class="btn btn-outline" onclick="closeModal('followupViewModal'); viewPatient('${patientId}')">
            <i class="fas fa-user"></i> View Patient
        </button>` : ''}
    `;

    openModal('followupViewModal');
}

function deleteFollowup(id) {
    if (!confirm('Are you sure you want to delete this follow-up? This action cannot be undone.')) {
        return;
    }

    const followups = getData('followups');
    const index = followups.findIndex(f => f.id === id);
    if (index === -1) {
        showToast('Follow-up not found.', 'error');
        return;
    }

    followups.splice(index, 1);
    setData('followups', followups);

    loadFollowups();
    refreshDashboard();
    showToast('Follow-up deleted successfully.', 'success');
}

function scheduleFollowup(patientId) {
    const patients = getData('patients');
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showToast('Patient not found.', 'error');
        return;
    }

    document.getElementById('fuPatientId').value = patientId;
    document.getElementById('fuPatientName').textContent = 'Patient: ' + patient.name;

    // Clear form
    document.getElementById('fuDate').value = '';
    document.getElementById('fuReason').value = '';
    document.getElementById('fuNotes').value = '';

    // Set minimum date to today
    const fuDateInput = document.getElementById('fuDate');
    if (fuDateInput) {
        fuDateInput.min = new Date().toISOString().split('T')[0];
    }

    openModal('followupModal');
}

function saveFollowup(event) {
    event.preventDefault();

    const patientId = document.getElementById('fuPatientId').value;
    const date = document.getElementById('fuDate').value;
    const reason = document.getElementById('fuReason').value.trim();
    const notes = document.getElementById('fuNotes').value.trim();
    const createAppointment = document.getElementById('fuCreateAppointment') ? document.getElementById('fuCreateAppointment').checked : true;

    if (!date || !reason) {
        showToast('Please fill in date and reason.', 'error');
        return;
    }

    const patients = getData('patients');
    const patient = patients.find(p => p.id === patientId);

    createFollowupWithAppointment(patientId, patient, date, reason, notes, createAppointment);

    closeModal('followupModal');
    loadFollowups();
    refreshDashboard();
    renderCalendarView();
    showToast('Follow-up scheduled' + (createAppointment ? ' and appointment created!' : '!'), 'success');
}

function createFollowupWithAppointment(patientId, patient, date, reason, notes = '', createAppointment = true) {
    // Create follow-up
    const followup = {
        id: generateId(),
        patientId,
        patientName: patient ? patient.name : 'Unknown',
        date,
        reason,
        notes: notes || 'Scheduled follow-up',
        status: 'Pending',
        createdAt: new Date().toISOString()
    };

    const followups = getData('followups');
    followups.unshift(followup);
    setData('followups', followups);

    // Create appointment if requested
    if (createAppointment) {
        const appointment = {
            id: generateId(),
            patientId,
            patientName: patient ? patient.name : 'Unknown',
            name: patient ? patient.name : 'Unknown',
            phone: patient ? patient.phone : '',
            date,
            time: '10:00 AM',
            startTime: '10:00 AM',
            endTime: '10:30 AM',
            duration: 30,
            service: 'Follow-up: ' + reason,
            status: 'Scheduled',
            followupId: followup.id,
            createdAt: new Date().toISOString()
        };

        const appointments = getData('appointments');
        appointments.unshift(appointment);
        setData('appointments', appointments);

        // Link appointment to follow-up
        followup.appointmentId = appointment.id;
        setData('followups', followups);
    }
}

function markFollowupDone(id) {
    const followups = getData('followups');
    const index = followups.findIndex(f => f.id === id);
    if (index === -1) return;

    followups[index].status = 'Completed';
    followups[index].completedAt = new Date().toISOString();
    setData('followups', followups);

    loadFollowups();
    refreshDashboard();
    showToast('Follow-up marked as completed.', 'success');
}

function bookFollowupAppointment(id) {
    const followups = getData('followups');
    const followup = followups.find(f => f.id === id);
    if (!followup) return;

    const patients = getData('patients');
    const patient = patients.find(p => p.id === followup.patientId);

    if (patient) {
        openQuickBooking(patient.id, followup.date, followup.reason);
    }
}

function sendFollowupReminder(id) {
    const followups = getData('followups');
    const followup = followups.find(f => f.id === id);
    if (!followup) return;

    const patients = getData('patients');
    let phone = '';
    let patientName = followup.patientName || 'there';

    if (followup.patientId) {
        const pt = patients.find(p => p.id === followup.patientId);
        if (pt) {
            phone = pt.phone;
            patientName = pt.name;
        }
    }

    if (!phone) {
        showToast('No phone number found for this patient.', 'error');
        return;
    }

    const message = `Hello ${patientName},\n\nThis is a reminder from Shree Physiotherapy Clinic about your upcoming follow-up appointment on ${formatDateFull(followup.date)}.\n\nReason: ${followup.reason}\n\nPlease confirm your visit. For any queries, call us at 822004084 or 9092294466.\n\nThank you,\nDr. Aarthi Ganesh\nShree Physiotherapy Clinic`;

    openWhatsApp(phone, message);

    // Mark reminder as sent
    const index = followups.findIndex(f => f.id === id);
    if (index !== -1) {
        followups[index].reminderSent = true;
        followups[index].reminderSentAt = new Date().toISOString();
        setData('followups', followups);
    }
}

// Follow-up filter
document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.getElementById('followupStatusFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', loadFollowups);
    }

    // Followup search
    const followupSearchInput = document.getElementById('followupSearch');
    if (followupSearchInput) {
        followupSearchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#followupsTable tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
});

/* ============================================
   8. QUICK BOOKING FROM DASHBOARD
   ============================================ */
function openQuickBooking(patientId, prefillDate = '', prefillService = '') {
    const patients = getData('patients');
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        showToast('Patient not found.', 'error');
        return;
    }

    // Populate quick booking form
    document.getElementById('qbPatientId').value = patientId;
    document.getElementById('qbPatientName').textContent = 'Patient: ' + patient.name;
    document.getElementById('qbDate').value = prefillDate || '';
    document.getElementById('qbStartTime').value = '10:00 AM';
    document.getElementById('qbDuration').value = '30';
    document.getElementById('qbService').value = prefillService ? 'Follow-up Visit' : '';
    document.getElementById('qbPaymentAmount').value = '';
    document.getElementById('qbPaymentStatus').value = 'Pending';
    document.getElementById('qbPaymentMode').value = '';

    // Calculate and display end time
    updateEndTimeDisplay();

    // Set minimum date to today
    const dateInput = document.getElementById('qbDate');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }

    openModal('quickBookingModal');
}

function updateEndTimeDisplay() {
    const startTime = document.getElementById('qbStartTime').value;
    const duration = parseInt(document.getElementById('qbDuration').value) || 30;
    const endTimeEl = document.getElementById('qbEndTime');

    if (startTime && endTimeEl) {
        const endTime = calculateEndTime(startTime, duration);
        endTimeEl.value = endTime;
    }
}

function updateEndTimeOptions() {
    updateEndTimeDisplay();
}

function saveQuickBooking(event) {
    event.preventDefault();

    const patientIdEl = document.getElementById('qbPatientId');
    const patientId = patientIdEl.value;
    const rescheduleFrom = patientIdEl.dataset.rescheduleFrom || null;
    const date = document.getElementById('qbDate').value;
    const time = document.getElementById('qbStartTime').value;
    const duration = parseInt(document.getElementById('qbDuration').value);
    const service = document.getElementById('qbService').value;
    const paymentAmount = document.getElementById('qbPaymentAmount').value;
    const paymentStatus = document.getElementById('qbPaymentStatus').value;
    const paymentMode = document.getElementById('qbPaymentMode').value;

    if (!date || !time || !service) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    const patients = getData('patients');
    const patient = patients.find(p => p.id === patientId);

    const endTime = calculateEndTime(time, duration);

    const appointment = {
        id: generateId(),
        patientId,
        patientName: patient ? patient.name : 'Unknown',
        name: patient ? patient.name : 'Unknown',
        phone: patient ? patient.phone : '',
        date,
        time,
        startTime: time,
        endTime,
        duration,
        service,
        status: 'Scheduled',
        paymentStatus: paymentStatus,
        amountPaid: paymentAmount || '',
        paymentMode: paymentMode || null,
        createdAt: new Date().toISOString()
    };

    let appointments = getData('appointments');

    // If rescheduling, delete the old appointment
    if (rescheduleFrom) {
        appointments = appointments.filter(a => a.id !== rescheduleFrom);
        // Clear the reschedule flag
        delete patientIdEl.dataset.rescheduleFrom;
    }

    appointments.unshift(appointment);
    setData('appointments', appointments);

    closeModal('quickBookingModal');
    loadAppointments();
    refreshDashboard();
    renderCalendarView();
    loadAccountsBook();
    showToast(rescheduleFrom ? 'Appointment rescheduled successfully!' : 'Appointment booked successfully!', 'success');
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    switch (status) {
        case 'Completed': return 'completed';
        case 'Cancelled': return 'cancelled';
        case 'Confirmed': return 'active';
        case 'In Progress': return 'in-progress';
        default: return 'pending';
    }
}

function timeStringToMinutes(timeStr) {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const mins = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + mins;
}

function calculateEndTime(startTime, duration) {
    const startMinutes = timeStringToMinutes(startTime);
    const endMinutes = startMinutes + duration;

    const hours = Math.floor(endMinutes / 60);
    const mins = endMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);

    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function getShortMonth(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
}

/* ============================================
   9. TRASH / RESTORE FUNCTIONS
   ============================================ */
function loadTrash() {
    const trash = getData('trash') || [];
    const tbody = document.querySelector('#trashTable tbody');
    if (!tbody) return;

    // Update trash count badge
    const trashCount = document.getElementById('trashCount');
    if (trashCount) {
        trashCount.textContent = trash.length;
        trashCount.style.display = trash.length > 0 ? 'inline' : 'none';
    }

    if (trash.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-light);">Trash is empty.</td></tr>';
        return;
    }

    // Sort by deletion date (newest first)
    trash.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    const now = new Date();
    tbody.innerHTML = trash.map(p => {
        const deletedDate = new Date(p.deletedAt);
        const daysAgo = Math.floor((now - deletedDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = 30 - daysAgo;
        const isOverdue = daysRemaining <= 7;

        return `<tr class="${isOverdue ? 'overdue-row' : ''}">
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td>${p.age || '-'}</td>
            <td>${escapeHtml(p.phone)}</td>
            <td>${formatDate(p.deletedAt)}</td>
            <td>
                <span class="days-badge ${isOverdue ? 'warning' : ''}">${daysRemaining > 0 ? daysRemaining + ' days' : 'Expiring soon'}</span>
            </td>
            <td>
                <button class="action-btn view" title="Restore" onclick="restorePatient('${p.id}')" style="background:rgba(34,197,94,0.1); color:#22C55E;"><i class="fas fa-undo"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// Note: deletePatient is defined earlier (around line 1015) with complete functionality
// including deletion of related appointments, prescriptions, and followups, plus all sync functions

function restorePatient(id) {
    let trash = getData('trash') || [];
    const patient = trash.find(p => p.id === id);
    if (!patient) return;

    // Remove deletedAt property
    delete patient.deletedAt;

    // Add back to patients
    let patients = getData('patients');
    patients.unshift(patient);
    setData('patients', patients);

    // Remove from trash
    trash = trash.filter(p => p.id !== id);
    setData('trash', trash);

    loadTrash();
    loadPatients();
    loadAppointments();
    refreshDashboard();
    renderCalendarView();
    loadAccountsBook();
    showToast('Patient restored successfully!', 'success');
}

function permanentDeletePatient(id) {
    if (!confirm('Permanently delete this patient? This action cannot be undone.')) return;

    let trash = getData('trash') || [];
    trash = trash.filter(p => p.id !== id);
    setData('trash', trash);

    loadTrash();
    showToast('Patient permanently deleted.', 'info');
}

function emptyTrash() {
    if (!confirm('Permanently delete all patients in trash? This action cannot be undone.')) return;

    setData('trash', []);
    loadTrash();
    showToast('Trash emptied.', 'info');
}

// Auto-cleanup old trash items (older than 30 days)
function cleanupOldTrash() {
    let trash = getData('trash') || [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const beforeCount = trash.length;
    trash = trash.filter(p => new Date(p.deletedAt) > thirtyDaysAgo);

    if (trash.length < beforeCount) {
        setData('trash', trash);
        console.log(`Auto-deleted ${beforeCount - trash.length} old items from trash`);
    }
}

/* ============================================
   10. CALENDLY-STYLE CALENDAR
   ============================================ */

// Mini Calendar in Sidebar
function renderMiniCalendar() {
    const grid = document.getElementById('miniCalendarGrid');
    const monthLabel = document.getElementById('miniCalendarMonth');
    if (!grid || !monthLabel) return;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = months[miniCalendarMonth] + ' ' + miniCalendarYear;

    const firstDay = new Date(miniCalendarYear, miniCalendarMonth, 1).getDay();
    const daysInMonth = new Date(miniCalendarYear, miniCalendarMonth + 1, 0).getDate();
    const today = new Date();

    // Get appointments for highlighting
    const appointments = getData('appointments');
    const appointmentDates = {};
    appointments.forEach(a => {
        if (!a.date || a.status === 'Cancelled') return;
        const d = new Date(a.date);
        if (d.getMonth() === miniCalendarMonth && d.getFullYear() === miniCalendarYear) {
            appointmentDates[d.getDate()] = true;
        }
    });

    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="mini-day disabled"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (day === today.getDate() && miniCalendarMonth === today.getMonth() && miniCalendarYear === today.getFullYear());
        const isSelected = (day === selectedCalendarDate.getDate() && miniCalendarMonth === selectedCalendarDate.getMonth() && miniCalendarYear === selectedCalendarDate.getFullYear());
        const hasAppts = appointmentDates[day];
        const isSunday = new Date(miniCalendarYear, miniCalendarMonth, day).getDay() === 0;

        let classes = 'mini-day';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (hasAppts) classes += ' has-appointments';
        if (isSunday) classes += ' disabled';

        html += `<div class="${classes}" onclick="selectCalendarDate(${miniCalendarYear}, ${miniCalendarMonth}, ${day})">${day}</div>`;
    }

    grid.innerHTML = html;
}

function changeMiniMonth(delta) {
    miniCalendarMonth += delta;
    if (miniCalendarMonth < 0) {
        miniCalendarMonth = 11;
        miniCalendarYear--;
    } else if (miniCalendarMonth > 11) {
        miniCalendarMonth = 0;
        miniCalendarYear++;
    }
    renderMiniCalendar();
}

function selectCalendarDate(year, month, day) {
    selectedCalendarDate = new Date(year, month, day);
    currentWeekStart = getWeekStart(selectedCalendarDate);
    currentDashMonth = month;
    currentDashYear = year;

    renderMiniCalendar();
    renderCalendlyView();
}

// View Selector (Day/Week/Month)
function setCalendarView(view) {
    calendarView = view;

    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.view-btn[onclick="setCalendarView('${view}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    renderCalendlyView();
}

// Navigate Schedule
function navigateSchedule(delta) {
    if (calendarView === 'day') {
        selectedCalendarDate.setDate(selectedCalendarDate.getDate() + delta);
    } else if (calendarView === 'week') {
        currentWeekStart.setDate(currentWeekStart.getDate() + (delta * 7));
        selectedCalendarDate = new Date(currentWeekStart);
    } else {
        currentDashMonth += delta;
        if (currentDashMonth < 0) {
            currentDashMonth = 11;
            currentDashYear--;
        } else if (currentDashMonth > 11) {
            currentDashMonth = 0;
            currentDashYear++;
        }
        selectedCalendarDate = new Date(currentDashYear, currentDashMonth, 1);
    }

    // Sync mini calendar
    miniCalendarMonth = selectedCalendarDate.getMonth();
    miniCalendarYear = selectedCalendarDate.getFullYear();

    renderMiniCalendar();
    renderCalendlyView();
}

// Main Calendly View Renderer
function renderCalendlyView() {
    const scheduleTitle = document.getElementById('scheduleTitle');
    const scheduleContent = document.getElementById('scheduleContent');
    if (!scheduleContent) return;

    // Update today summary
    updateTodaySummary();

    switch (calendarView) {
        case 'day':
            renderDayView(scheduleTitle, scheduleContent);
            break;
        case 'week':
            renderCalendlyWeekView(scheduleTitle, scheduleContent);
            break;
        case 'month':
            renderCalendlyMonthView(scheduleTitle, scheduleContent);
            break;
    }
}

function renderDayView(titleEl, contentEl) {
    const dateStr = selectedCalendarDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    if (titleEl) titleEl.textContent = dateStr;

    const isSunday = selectedCalendarDate.getDay() === 0;
    const selectedDateStr = selectedCalendarDate.toISOString().split('T')[0];

    if (isSunday) {
        contentEl.innerHTML = `
            <div class="schedule-empty">
                <i class="fas fa-bed"></i>
                <h4>Clinic Closed</h4>
                <p>Sunday is a rest day</p>
            </div>
        `;
        return;
    }

    const appointments = getData('appointments').filter(a => {
        const aptDate = new Date(a.date).toISOString().split('T')[0];
        return aptDate === selectedDateStr && a.status !== 'Cancelled';
    });

    if (appointments.length === 0) {
        contentEl.innerHTML = `
            <div class="schedule-empty">
                <i class="fas fa-calendar-check"></i>
                <h4>No Appointments</h4>
                <p>No appointments scheduled for this day</p>
            </div>
        `;
        return;
    }

    // Sort by time
    appointments.sort((a, b) => {
        return timeStringToMinutes(a.time || a.startTime || '') - timeStringToMinutes(b.time || b.startTime || '');
    });

    let html = '<div class="day-schedule">';
    html += `<div class="day-header"><h4>${dateStr}</h4><span>${appointments.length} appointment${appointments.length > 1 ? 's' : ''}</span></div>`;
    html += '<div class="time-grid">';

    appointments.forEach(apt => {
        const patients = getData('patients');
        const patient = patients.find(p => p.id === apt.patientId);
        const patientName = patient ? patient.name : apt.patientName || 'Unknown';
        const duration = apt.duration || 30;
        const endTime = apt.endTime || calculateEndTime(apt.time, duration);
        const statusClass = getStatusClass(apt.status);
        const paymentClass = apt.paymentStatus ? apt.paymentStatus.toLowerCase() : 'pending';

        html += `
            <div class="time-grid-row">
                <div class="time-grid-label">${apt.time || apt.startTime}</div>
                <div class="time-grid-cell">
                    <div class="schedule-appointment ${statusClass} view-only">
                        <div class="apt-time">${apt.time || apt.startTime} - ${endTime}</div>
                        <div class="apt-patient">${escapeHtml(patientName)}</div>
                        <div class="apt-service">${escapeHtml(apt.service || 'General')}</div>
                        <span class="apt-duration">${duration} min</span>
                        ${apt.paymentStatus ? `<span class="payment-badge ${paymentClass}">${apt.paymentStatus}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div></div>';
    contentEl.innerHTML = html;
}

function renderCalendlyWeekView(titleEl, contentEl) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startLabel = currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (titleEl) titleEl.textContent = `${startLabel} - ${endLabel}`;

    const appointments = getData('appointments').filter(a => a.status !== 'Cancelled');
    const patients = getData('patients');

    let html = '<div class="week-schedule">';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart);
        day.setDate(day.getDate() + i);
        const isToday = isSameDay(day, new Date());
        const isSunday = day.getDay() === 0;
        const dayDateStr = day.toISOString().split('T')[0];

        const dayAppts = appointments.filter(a => {
            const aptDate = new Date(a.date).toISOString().split('T')[0];
            return aptDate === dayDateStr;
        }).sort((a, b) => timeStringToMinutes(a.time || '') - timeStringToMinutes(b.time || ''));

        html += `
            <div class="week-day-column ${isToday ? 'today' : ''} ${isSunday ? 'sunday' : ''}">
                <div class="week-day-header">
                    <span class="day-name">${dayNames[i]}</span>
                    <span class="day-date">${day.getDate()}</span>
                </div>
        `;

        if (!isSunday) {
            dayAppts.forEach(apt => {
                const patient = patients.find(p => p.id === apt.patientId);
                const patientName = patient ? patient.name : apt.patientName || 'Patient';
                const firstName = patientName.split(' ')[0];

                html += `
                    <div class="week-appointment view-only">
                        <div class="wa-time">${apt.time || apt.startTime}</div>
                        <div class="wa-name">${escapeHtml(firstName)}</div>
                    </div>
                `;
            });
        }

        html += '</div>';
    }

    html += '</div>';
    contentEl.innerHTML = html;
}

function renderCalendlyMonthView(titleEl, contentEl) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (titleEl) titleEl.textContent = months[currentDashMonth] + ' ' + currentDashYear;

    const firstDay = new Date(currentDashYear, currentDashMonth, 1).getDay();
    const daysInMonth = new Date(currentDashYear, currentDashMonth + 1, 0).getDate();
    const today = new Date();

    const appointments = getData('appointments').filter(a => a.status !== 'Cancelled');
    const appointmentsByDate = {};
    appointments.forEach(a => {
        if (!a.date) return;
        const d = new Date(a.date);
        if (d.getMonth() === currentDashMonth && d.getFullYear() === currentDashYear) {
            const day = d.getDate();
            if (!appointmentsByDate[day]) appointmentsByDate[day] = [];
            appointmentsByDate[day].push(a);
        }
    });

    let html = '<div class="month-schedule">';

    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(name => {
        html += `<div class="month-day-header">${name}</div>`;
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="month-day-cell" style="opacity:0.3;"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (day === today.getDate() && currentDashMonth === today.getMonth() && currentDashYear === today.getFullYear());
        const isSunday = new Date(currentDashYear, currentDashMonth, day).getDay() === 0;
        const dayAppts = appointmentsByDate[day] || [];

        let classes = 'month-day-cell';
        if (isToday) classes += ' today';
        if (isSunday) classes += ' sunday';

        html += `<div class="${classes}" onclick="selectCalendarDate(${currentDashYear}, ${currentDashMonth}, ${day})">`;
        html += `<div class="day-number">${day}</div>`;

        if (dayAppts.length > 0) {
            html += '<div class="month-appointment-dot">';
            dayAppts.slice(0, 3).forEach(apt => {
                html += `<div class="month-apt-item">${apt.time || apt.startTime}</div>`;
            });
            if (dayAppts.length > 3) {
                html += `<div class="month-apt-more">+${dayAppts.length - 3} more</div>`;
            }
            html += '</div>';
        }

        html += '</div>';
    }

    html += '</div>';
    contentEl.innerHTML = html;
}

function updateTodaySummary() {
    const todayStr = new Date().toISOString().split('T')[0];
    const appointments = getData('appointments');

    const todayAppts = appointments.filter(a => {
        const aptDate = new Date(a.date).toISOString().split('T')[0];
        return aptDate === todayStr && a.status !== 'Cancelled';
    });

    const completed = todayAppts.filter(a => a.status === 'Completed').length;
    const remaining = todayAppts.length - completed;

    // Calculate today's revenue
    let todayRevenue = 0;
    todayAppts.filter(a => a.status === 'Completed' && a.amountPaid).forEach(a => {
        todayRevenue += parseFloat(a.amountPaid) || 0;
    });

    const elTotal = document.getElementById('summaryTotal');
    const elCompleted = document.getElementById('summaryCompleted');
    const elRemaining = document.getElementById('summaryRemaining');
    const elRevenue = document.getElementById('statRevenue');
    const elRevenueToday2 = document.getElementById('statRevenueToday2');

    if (elTotal) elTotal.textContent = todayAppts.length;
    if (elCompleted) elCompleted.textContent = completed;
    if (elRemaining) elRemaining.textContent = remaining;
    if (elRevenue) elRevenue.textContent = todayRevenue.toLocaleString('en-IN');
    if (elRevenueToday2) elRevenueToday2.textContent = '₹' + todayRevenue.toLocaleString('en-IN');
}

/* ============================================
   11. TREATMENT COMPLETION & PAYMENT
   ============================================ */
let currentTreatmentAptId = null;

function openTreatmentModal(appointmentId) {
    const appointments = getData('appointments');
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    // For future appointments, open details view instead of treatment modal
    const todayDate = getIndiaTodayDate();
    const aptDateStr = new Date(apt.date).toISOString().split('T')[0];
    if (aptDateStr > todayDate) {
        viewAppointmentDetails(appointmentId);
        return;
    }

    currentTreatmentAptId = appointmentId;

    const patients = getData('patients');
    const patient = patients.find(p => p.id === apt.patientId);
    const patientName = patient ? patient.name : apt.patientName || 'Unknown';

    // Populate modal fields
    document.getElementById('treatmentPatientName').textContent = patientName;
    document.getElementById('treatmentService').textContent = apt.service || 'General';
    document.getElementById('treatmentDate').textContent = formatDate(apt.date);
    document.getElementById('treatmentScheduledTime').textContent = `${apt.time || apt.startTime} - ${apt.endTime || calculateEndTime(apt.time, apt.duration || 30)}`;

    // Set actual times (default to scheduled)
    document.getElementById('treatmentActualStart').value = convertTo24Hour(apt.time || apt.startTime);
    document.getElementById('treatmentActualEnd').value = convertTo24Hour(apt.endTime || calculateEndTime(apt.time, apt.duration || 30));

    // Payment fields
    document.getElementById('treatmentPaymentStatus').value = apt.paymentStatus || 'Pending';
    document.getElementById('treatmentAmountPaid').value = apt.amountPaid || '';
    document.getElementById('treatmentPaymentMode').value = apt.paymentMode || '';
    document.getElementById('treatmentNotes').value = apt.treatmentNotes || '';

    openModal('treatmentModal');
}

function convertTo24Hour(timeStr) {
    if (!timeStr) return '10:00';
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '10:00';

    let hours = parseInt(match[1]);
    const mins = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${mins}`;
}

function convertTo12Hour(timeStr) {
    if (!timeStr) return '';
    const [hours, mins] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function saveCompletedTreatment() {
    if (!currentTreatmentAptId) return;

    const appointments = getData('appointments');
    const index = appointments.findIndex(a => a.id === currentTreatmentAptId);
    if (index === -1) return;

    const apt = appointments[index];

    // Check if time has passed
    const timePassed = hasAppointmentTimePassed(apt.date, apt.time || apt.startTime);
    if (!timePassed) {
        showToast('Cannot complete - appointment time has not yet passed.', 'error');
        return;
    }

    // Get form values
    const actualStart = document.getElementById('treatmentActualStart').value;
    const actualEnd = document.getElementById('treatmentActualEnd').value;
    const paymentStatus = document.getElementById('treatmentPaymentStatus').value;
    const amountPaid = document.getElementById('treatmentAmountPaid').value;
    const paymentMode = document.getElementById('treatmentPaymentMode').value;
    const notes = document.getElementById('treatmentNotes').value;

    // Update appointment
    appointments[index].status = 'Completed';
    appointments[index].actualStartTime = convertTo12Hour(actualStart);
    appointments[index].actualEndTime = convertTo12Hour(actualEnd);
    appointments[index].paymentStatus = paymentStatus;
    appointments[index].amountPaid = amountPaid;
    appointments[index].paymentMode = paymentMode || null;
    appointments[index].treatmentNotes = notes;
    appointments[index].completedAt = new Date().toISOString();

    setData('appointments', appointments);

    // Update linked follow-up if exists
    const followups = getData('followups');
    const relatedFollowup = followups.find(f =>
        f.patientId === apt.patientId &&
        f.date === apt.date &&
        f.status !== 'Completed'
    );
    if (relatedFollowup) {
        relatedFollowup.status = 'Completed';
        setData('followups', followups);
    }

    closeModal('treatmentModal');
    currentTreatmentAptId = null;

    // Refresh views
    renderCalendarView();
    loadAppointments();
    refreshDashboard();
    loadAccountsBook();
    showToast('Treatment completed successfully!', 'success');
}

function completeAndSendWhatsApp() {
    if (!currentTreatmentAptId) return;

    const appointments = getData('appointments');
    const apt = appointments.find(a => a.id === currentTreatmentAptId);
    if (!apt) return;

    // Save treatment first
    saveCompletedTreatment();

    // Send WhatsApp thank you message
    const patients = getData('patients');
    const patient = patients.find(p => p.id === apt.patientId);
    if (!patient || !patient.phone) {
        showToast('No phone number found.', 'error');
        return;
    }

    const paymentStatus = document.getElementById('treatmentPaymentStatus').value;
    const amountPaid = document.getElementById('treatmentAmountPaid').value;

    let message = `Hello ${patient.name},\n\nThank you for visiting Shree Physiotherapy Clinic today!\n\n`;
    message += `Service: ${apt.service || 'Physiotherapy Treatment'}\n`;

    if (paymentStatus === 'Paid' && amountPaid) {
        message += `Payment: ₹${amountPaid} - Received\n`;
    } else if (paymentStatus === 'Partial' && amountPaid) {
        message += `Payment: ₹${amountPaid} paid (Partial)\n`;
    }

    message += `\nFor any queries, contact us at:\n📞 822004084 | 9092294466\n📍 Periyanaickenpalayam, Coimbatore\n\nGet well soon!\n- Dr. Aarthi Ganesh\nShree Physiotherapy Clinic`;

    openWhatsApp(patient.phone, message);
}

function updateEndTimeFromDuration() {
    const startTime = document.getElementById('qbStartTime') ? document.getElementById('qbStartTime').value : '';
    const duration = document.getElementById('qbDuration') ? parseInt(document.getElementById('qbDuration').value) : 30;
    const endTimeEl = document.getElementById('qbEndTime');

    if (startTime && endTimeEl) {
        const start12 = convertTo12Hour(startTime);
        const endTime = calculateEndTime(start12, duration);
        endTimeEl.value = convertTo24Hour(endTime);
    }
}

/* ============================================
   12. DOMContentLoaded - INIT
   ============================================ */
/* ============================================
   13. PATIENTS MONTHLY VIEW
   ============================================ */

let patientCalendarMonth = new Date().getMonth();
let patientCalendarYear = new Date().getFullYear();
let patientsViewMode = 'table'; // 'table' or 'monthly'

function setPatientsView(view) {
    patientsViewMode = view;

    // Update toggle buttons
    document.querySelectorAll('.patients-view-toggle .view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.patients-view-toggle .view-toggle-btn[onclick="setPatientsView('${view}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Show/hide views
    const tableView = document.getElementById('patients-table-view');
    const monthlyView = document.getElementById('patients-monthly-view');

    if (view === 'table') {
        if (tableView) tableView.style.display = 'block';
        if (monthlyView) monthlyView.style.display = 'none';
    } else {
        if (tableView) tableView.style.display = 'none';
        if (monthlyView) monthlyView.style.display = 'block';
        renderPatientCalendar();
        renderPatientSalesGraph();
    }
}

function changePatientMonth(delta) {
    patientCalendarMonth += delta;
    if (patientCalendarMonth < 0) {
        patientCalendarMonth = 11;
        patientCalendarYear--;
    } else if (patientCalendarMonth > 11) {
        patientCalendarMonth = 0;
        patientCalendarYear++;
    }
    renderPatientCalendar();
    renderPatientSalesGraph();
}

function renderPatientCalendar() {
    const grid = document.getElementById('patientCalendarGrid');
    const monthLabel = document.getElementById('patientCalendarMonth');
    if (!grid || !monthLabel) return;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = months[patientCalendarMonth] + ' ' + patientCalendarYear;

    const firstDay = new Date(patientCalendarYear, patientCalendarMonth, 1).getDay();
    const daysInMonth = new Date(patientCalendarYear, patientCalendarMonth + 1, 0).getDate();
    const today = new Date();

    // Get visit counts per day
    const appointments = getData('appointments');
    const patients = getData('patients');
    const visitCounts = {};
    let maxVisits = 1;
    let monthTotalVisits = 0;
    let monthCompleted = 0;
    let monthNewPatients = 0;

    appointments.forEach(a => {
        if (a.status === 'Cancelled') return;
        const aptDate = new Date(a.date);
        if (aptDate.getMonth() === patientCalendarMonth && aptDate.getFullYear() === patientCalendarYear) {
            const day = aptDate.getDate();
            visitCounts[day] = (visitCounts[day] || 0) + 1;
            if (visitCounts[day] > maxVisits) maxVisits = visitCounts[day];
            monthTotalVisits++;
            if (a.status === 'Completed') monthCompleted++;
        }
    });

    // Count new patients this month
    patients.forEach(p => {
        if (!p.createdAt) return;
        const createdDate = new Date(p.createdAt);
        if (createdDate.getMonth() === patientCalendarMonth && createdDate.getFullYear() === patientCalendarYear) {
            monthNewPatients++;
        }
    });

    // Update quick stats
    const elVisits = document.getElementById('patientMonthVisits');
    const elNew = document.getElementById('patientMonthNew');
    const elCompleted = document.getElementById('patientMonthCompleted');
    if (elVisits) elVisits.textContent = monthTotalVisits;
    if (elNew) elNew.textContent = monthNewPatients;
    if (elCompleted) elCompleted.textContent = monthCompleted;

    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="mini-day disabled"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (day === today.getDate() && patientCalendarMonth === today.getMonth() && patientCalendarYear === today.getFullYear());
        const isSunday = new Date(patientCalendarYear, patientCalendarMonth, day).getDay() === 0;
        const visits = visitCounts[day] || 0;

        // Color coding based on visit density
        let densityClass = '';
        if (visits > 0) {
            const ratio = visits / maxVisits;
            if (ratio >= 0.7) densityClass = 'high-density';
            else if (ratio >= 0.4) densityClass = 'moderate-density';
            else densityClass = 'low-density';
        }

        html += `<div class="mini-day ${densityClass} ${isToday ? 'today' : ''} ${isSunday ? 'disabled' : ''} ${visits > 0 ? 'has-appointments' : ''}" onclick="${!isSunday ? `showDayPatients(${patientCalendarYear}, ${patientCalendarMonth}, ${day})` : ''}" title="${visits} visit${visits !== 1 ? 's' : ''}">${day}</div>`;
    }

    grid.innerHTML = html;
}

function showDayPatients(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const filterInput = document.getElementById('appointmentFilter');
    if (filterInput) {
        filterInput.value = dateStr;
    }
    switchTab('appointments');
}

function renderPatientSalesGraph() {
    const container = document.getElementById('patientSalesGraph');
    if (!container) return;

    const daysInMonth = new Date(patientCalendarYear, patientCalendarMonth + 1, 0).getDate();
    const appointments = getData('appointments');
    const patients = getData('patients');

    // Calculate daily data
    const dailyVisits = {};
    const dailyNewPatients = {};
    let maxValue = 1;

    // Count visits per day
    appointments.forEach(a => {
        if (a.status === 'Cancelled') return;
        const aptDate = new Date(a.date);
        if (aptDate.getMonth() === patientCalendarMonth && aptDate.getFullYear() === patientCalendarYear) {
            const day = aptDate.getDate();
            if (a.status === 'Completed') {
                dailyVisits[day] = (dailyVisits[day] || 0) + 1;
                if (dailyVisits[day] > maxValue) maxValue = dailyVisits[day];
            }
        }
    });

    // Count new patients per day
    patients.forEach(p => {
        if (!p.createdAt) return;
        const createdDate = new Date(p.createdAt);
        if (createdDate.getMonth() === patientCalendarMonth && createdDate.getFullYear() === patientCalendarYear) {
            const day = createdDate.getDate();
            dailyNewPatients[day] = (dailyNewPatients[day] || 0) + 1;
            if (dailyNewPatients[day] > maxValue) maxValue = dailyNewPatients[day];
        }
    });

    let html = '<div class="graph-bars">';

    for (let day = 1; day <= daysInMonth; day++) {
        const visits = dailyVisits[day] || 0;
        const newPats = dailyNewPatients[day] || 0;
        const visitsHeight = maxValue > 0 ? (visits / maxValue) * 100 : 0;
        const newHeight = maxValue > 0 ? (newPats / maxValue) * 100 : 0;

        html += `
            <div class="graph-day" title="Day ${day}: ${visits} visits, ${newPats} new">
                <div class="bar-group">
                    <div class="graph-bar visits" style="height:${visitsHeight}%"></div>
                    <div class="graph-bar new" style="height:${newHeight}%"></div>
                </div>
                <span class="day-label">${day}</span>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

/* ============================================
   14. FOLLOW-UP MONTHLY VIEW
   ============================================ */

let followupCalendarMonth = new Date().getMonth();
let followupCalendarYear = new Date().getFullYear();
let followupViewMode = 'list'; // 'list' or 'monthly'

function setFollowupView(view) {
    followupViewMode = view;

    // Update toggle buttons
    document.querySelectorAll('.followup-view-toggle .view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.followup-view-toggle .view-toggle-btn[onclick="setFollowupView('${view}')"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Show/hide views
    const listView = document.getElementById('followup-list-view');
    const monthlyView = document.getElementById('followup-monthly-view');

    if (view === 'list') {
        if (listView) listView.style.display = 'block';
        if (monthlyView) monthlyView.style.display = 'none';
    } else {
        if (listView) listView.style.display = 'none';
        if (monthlyView) monthlyView.style.display = 'block';
        renderFollowupCalendar();
    }
}

function changeFollowupMonth(delta) {
    followupCalendarMonth += delta;
    if (followupCalendarMonth < 0) {
        followupCalendarMonth = 11;
        followupCalendarYear--;
    } else if (followupCalendarMonth > 11) {
        followupCalendarMonth = 0;
        followupCalendarYear++;
    }
    renderFollowupCalendar();
}

function renderFollowupCalendar() {
    const grid = document.getElementById('followupCalendarGrid');
    const monthLabel = document.getElementById('followupCalendarMonth');
    if (!grid || !monthLabel) return;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = months[followupCalendarMonth] + ' ' + followupCalendarYear;

    const firstDay = new Date(followupCalendarYear, followupCalendarMonth, 1).getDay();
    const daysInMonth = new Date(followupCalendarYear, followupCalendarMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get follow-ups per day
    const followups = getData('followups');
    const patients = getData('patients');
    const followupsByDay = {};

    followups.forEach(f => {
        const fDate = new Date(f.date);
        if (fDate.getMonth() === followupCalendarMonth && fDate.getFullYear() === followupCalendarYear) {
            const day = fDate.getDate();
            if (!followupsByDay[day]) followupsByDay[day] = [];
            followupsByDay[day].push(f);
        }
    });

    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="followup-day-cell empty"></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (day === today.getDate() && followupCalendarMonth === today.getMonth() && followupCalendarYear === today.getFullYear());
        const isSunday = new Date(followupCalendarYear, followupCalendarMonth, day).getDay() === 0;
        const dayFollowups = followupsByDay[day] || [];
        const cellDate = new Date(followupCalendarYear, followupCalendarMonth, day);

        // Count pending and overdue
        const pending = dayFollowups.filter(f => f.status !== 'Completed').length;
        const overdue = dayFollowups.filter(f => f.status !== 'Completed' && cellDate < today).length;
        const completed = dayFollowups.filter(f => f.status === 'Completed').length;

        html += `
            <div class="followup-day-cell ${isToday ? 'today' : ''} ${isSunday ? 'sunday' : ''} ${overdue > 0 ? 'has-overdue' : ''}"
                 onclick="expandFollowupDay(${followupCalendarYear}, ${followupCalendarMonth}, ${day})">
                <span class="day-num">${day}</span>
                <div class="followup-badges">
                    ${overdue > 0 ? `<span class="overdue-badge" title="${overdue} overdue">${overdue}</span>` : ''}
                    ${pending > 0 && overdue === 0 ? `<span class="pending-badge" title="${pending} pending">${pending}</span>` : ''}
                    ${completed > 0 ? `<span class="completed-badge" title="${completed} completed">${completed}</span>` : ''}
                </div>
            </div>
        `;
    }

    grid.innerHTML = html;
}

function expandFollowupDay(year, month, day) {
    const followups = getData('followups');
    const patients = getData('patients');
    const cellDate = new Date(year, month, day);
    const cellDateStr = cellDate.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayFollowups = followups.filter(f => {
        const fDate = new Date(f.date).toISOString().split('T')[0];
        return fDate === cellDateStr;
    });

    if (dayFollowups.length === 0) {
        showToast('No follow-ups on this day.', 'info');
        return;
    }

    let message = `Follow-ups for ${formatDate(cellDate.toISOString())}:\n\n`;

    dayFollowups.forEach(f => {
        let patientName = f.patientName || 'Unknown';
        if (f.patientId) {
            const pt = patients.find(p => p.id === f.patientId);
            if (pt) patientName = pt.name;
        }

        const isOverdue = f.status !== 'Completed' && cellDate < today;
        const status = isOverdue ? 'OVERDUE' : f.status;

        message += `• ${patientName} - ${f.reason || 'N/A'} (${status})\n`;
    });

    alert(message);
}

/* ============================================
   15. ACCOUNTS BOOK & REPORTS
   ============================================ */

function loadAccountsBook() {
    const appointments = getData('appointments');
    const prescriptions = getData('prescriptions');
    const patients = getData('patients');
    const trash = getData('trash') || [];

    // Get IDs of patients in trash (excluded from accounts)
    const trashedPatientIds = new Set(trash.map(p => p.id));

    // Set default date range to current month if not set
    const now = new Date();
    const fromInput = document.getElementById('accountsFromDate');
    const toInput = document.getElementById('accountsToDate');

    if (fromInput && !fromInput.value) {
        fromInput.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }
    if (toInput && !toInput.value) {
        toInput.value = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    const monthStart = fromInput && fromInput.value ? new Date(fromInput.value + 'T00:00:00') : new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = toInput && toInput.value ? new Date(toInput.value + 'T23:59:59') : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter completed appointments for date range (exclude trashed patients)
    const monthAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= monthStart && aptDate <= monthEnd &&
               a.status === 'Completed' &&
               !trashedPatientIds.has(a.patientId);
    });

    // Calculate totals
    let totalRevenue = 0, cashTotal = 0, gpayTotal = 0, cardTotal = 0;
    const patientSet = new Set();

    monthAppts.forEach(a => {
        const amt = parseFloat(a.amountPaid) || 0;
        totalRevenue += amt;
        patientSet.add(a.patientId);
        if (a.paymentMode === 'Cash') cashTotal += amt;
        if (a.paymentMode === 'GPay') gpayTotal += amt;
        if (a.paymentMode === 'Card') cardTotal += amt;
    });

    // Include prescription payments ONLY if no matching completed appointment has the payment
    // This avoids double-counting when prescription payment is copied to appointment
    // Also exclude prescriptions for trashed patients
    prescriptions.filter(rx => {
        // Exclude trashed patients
        if (trashedPatientIds.has(rx.patientId)) return false;

        const rxDate = new Date(rx.date || rx.createdAt);
        if (!(rxDate >= monthStart && rxDate <= monthEnd && rx.paymentAmount)) return false;

        // Check if there's a matching completed appointment with this payment already
        const rxDateStr = rxDate.toISOString().split('T')[0];
        const hasMatchingApt = appointments.some(a =>
            a.patientId === rx.patientId &&
            a.date === rxDateStr &&
            a.status === 'Completed' &&
            parseFloat(a.amountPaid) > 0
        );
        return !hasMatchingApt; // Only count if no matching appointment with payment
    }).forEach(rx => {
        const amt = parseFloat(rx.paymentAmount) || 0;
        totalRevenue += amt;
        patientSet.add(rx.patientId);
        if (rx.paymentMode === 'Cash') cashTotal += amt;
        if (rx.paymentMode === 'GPay') gpayTotal += amt;
        if (rx.paymentMode === 'Card') cardTotal += amt;
    });

    // Update revenue cards
    const elRevenue = document.getElementById('accountsRevenue');
    const elPatients = document.getElementById('accountsPatients');
    const elCash = document.getElementById('accountsCash');
    const elGPay = document.getElementById('accountsGPay');
    const elCard = document.getElementById('accountsCard');

    if (elRevenue) elRevenue.textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    if (elPatients) elPatients.textContent = patientSet.size;
    if (elCash) elCash.textContent = '₹' + cashTotal.toLocaleString('en-IN');
    if (elGPay) elGPay.textContent = '₹' + gpayTotal.toLocaleString('en-IN');
    if (elCard) elCard.textContent = '₹' + cardTotal.toLocaleString('en-IN');

    // Load default daily report
    loadDailyReport();
}

function filterAccountsByDateRange() {
    loadAccountsBook();
}

// Keep old function for backward compatibility
function filterTransactionsByDate(dateKey) {
    const dateInput = document.getElementById('dailyReportDate');
    if (dateInput) {
        dateInput.value = dateKey;
        switchReportTab('daily');
        loadDailyReport();
    }
}

// Report tab variables
let reportWeekOffset = 0;
let reportMonthOffset = 0;

function switchReportTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.report-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.report-tab[onclick="switchReportTab('${tab}')"]`)?.classList.add('active');

    // Update views
    document.querySelectorAll('.report-view').forEach(view => view.classList.remove('active'));
    document.getElementById(`report-${tab}`)?.classList.add('active');

    // Load the appropriate report
    switch (tab) {
        case 'daily':
            loadDailyReport();
            break;
        case 'weekly':
            loadWeeklyReport();
            break;
        case 'monthly':
            loadMonthlyReport();
            break;
    }
}

function loadDailyReport() {
    const dateInput = document.getElementById('dailyReportDate');
    const today = new Date();

    if (!dateInput.value) {
        dateInput.value = today.toISOString().split('T')[0];
    }

    const selectedDate = dateInput.value;
    const appointments = getData('appointments');
    const prescriptions = getData('prescriptions');
    const patients = getData('patients');
    const trash = getData('trash') || [];

    // Get IDs of patients in trash (excluded from reports)
    const trashedPatientIds = new Set(trash.map(p => p.id));

    // Filter for selected date (exclude trashed patients)
    const dayAppts = appointments.filter(a => a.date && a.date.startsWith(selectedDate) && !trashedPatientIds.has(a.patientId));
    const completedAppts = dayAppts.filter(a => a.status === 'Completed');

    // Calculate totals
    let revenue = 0, cash = 0, gpay = 0, card = 0;

    completedAppts.forEach(a => {
        const amt = parseFloat(a.amountPaid) || 0;
        revenue += amt;
        if (a.paymentMode === 'Cash') cash += amt;
        if (a.paymentMode === 'GPay') gpay += amt;
        if (a.paymentMode === 'Card') card += amt;
    });

    // Include prescriptions ONLY if no matching completed appointment has the payment
    // Also exclude prescriptions for trashed patients
    prescriptions.filter(rx => {
        // Exclude trashed patients
        if (trashedPatientIds.has(rx.patientId)) return false;
        if (!((rx.date || rx.createdAt || '').startsWith(selectedDate) && rx.paymentAmount)) return false;
        // Check if there's a matching completed appointment with this payment already
        const hasMatchingApt = appointments.some(a =>
            a.patientId === rx.patientId &&
            (a.date || '').startsWith(selectedDate) &&
            a.status === 'Completed' &&
            parseFloat(a.amountPaid) > 0
        );
        return !hasMatchingApt;
    }).forEach(rx => {
        const amt = parseFloat(rx.paymentAmount) || 0;
        revenue += amt;
        if (rx.paymentMode === 'Cash') cash += amt;
        if (rx.paymentMode === 'GPay') gpay += amt;
        if (rx.paymentMode === 'Card') card += amt;
    });

    // Update summary
    const elAppts = document.getElementById('dailyAppointments');
    const elCompleted = document.getElementById('dailyCompleted');
    const elRevenue = document.getElementById('dailyRevenue');
    const elCash = document.getElementById('dailyCash');
    const elGPay = document.getElementById('dailyGPay');
    const elCard = document.getElementById('dailyCard');

    if (elAppts) elAppts.textContent = dayAppts.length;
    if (elCompleted) elCompleted.textContent = completedAppts.length;
    if (elRevenue) elRevenue.textContent = '₹' + revenue.toLocaleString('en-IN');
    if (elCash) elCash.textContent = '₹' + cash.toLocaleString('en-IN');
    if (elGPay) elGPay.textContent = '₹' + gpay.toLocaleString('en-IN');
    if (elCard) elCard.textContent = '₹' + card.toLocaleString('en-IN');

    // Render transactions table
    const tbody = document.querySelector('#dailyTransactionsTable tbody');
    if (tbody) {
        const transactions = [];
        completedAppts.forEach(a => {
            if (a.amountPaid && parseFloat(a.amountPaid) > 0) {
                const pt = patients.find(p => p.id === a.patientId);
                transactions.push({
                    time: a.time || a.startTime || '-',
                    patient: pt ? pt.name : a.patientName || 'Unknown',
                    service: a.service || 'General',
                    amount: parseFloat(a.amountPaid),
                    mode: a.paymentMode || '-'
                });
            }
        });

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">No transactions for this date</td></tr>';
        } else {
            tbody.innerHTML = transactions.map(t => `
                <tr>
                    <td>${t.time}</td>
                    <td><strong>${escapeHtml(t.patient)}</strong></td>
                    <td>${escapeHtml(t.service)}</td>
                    <td><strong>₹${t.amount.toLocaleString('en-IN')}</strong></td>
                    <td><span class="payment-mode-badge ${t.mode.toLowerCase()}">${t.mode}</span></td>
                </tr>
            `).join('');
        }
    }
}

function changeReportWeek(delta) {
    reportWeekOffset += delta;
    loadWeeklyReport();
}

function loadWeeklyReport() {
    const now = new Date();
    const weekStart = getWeekStart(now);
    weekStart.setDate(weekStart.getDate() + (reportWeekOffset * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const appointments = getData('appointments');
    const patients = getData('patients');
    const trash = getData('trash') || [];

    // Get IDs of patients in trash (excluded from reports)
    const trashedPatientIds = new Set(trash.map(p => p.id));

    // Update label
    const label = document.getElementById('weeklyReportLabel');
    if (label) {
        if (reportWeekOffset === 0) {
            label.textContent = 'This Week';
        } else if (reportWeekOffset === -1) {
            label.textContent = 'Last Week';
        } else {
            label.textContent = formatDate(weekStart.toISOString()) + ' - ' + formatDate(weekEnd.toISOString());
        }
    }

    // Get data for each day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = [];
    let totalAppts = 0, totalCompleted = 0, totalRevenue = 0;
    let maxRevenue = 0, bestDay = '';

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        const dayStr = day.toISOString().split('T')[0];

        const dayAppts = appointments.filter(a => a.date && a.date.startsWith(dayStr) && !trashedPatientIds.has(a.patientId));
        const completed = dayAppts.filter(a => a.status === 'Completed');

        let revenue = 0, cash = 0, gpay = 0, card = 0;
        completed.forEach(a => {
            const amt = parseFloat(a.amountPaid) || 0;
            revenue += amt;
            if (a.paymentMode === 'Cash') cash += amt;
            if (a.paymentMode === 'GPay') gpay += amt;
            if (a.paymentMode === 'Card') card += amt;
        });

        totalAppts += dayAppts.length;
        totalCompleted += completed.length;
        totalRevenue += revenue;

        if (revenue > maxRevenue) {
            maxRevenue = revenue;
            bestDay = dayNames[day.getDay()];
        }

        weekData.push({
            day: dayNames[day.getDay()],
            appts: dayAppts.length,
            revenue, cash, gpay, card
        });
    }

    // Update summary
    document.getElementById('weeklyAppointments').textContent = totalAppts;
    document.getElementById('weeklyCompleted').textContent = totalCompleted;
    document.getElementById('weeklyRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('weeklyAvgRevenue').textContent = '₹' + Math.round(totalRevenue / 7).toLocaleString('en-IN');
    document.getElementById('weeklyBestDay').textContent = bestDay || '-';

    // Render chart
    const chartContainer = document.getElementById('weeklyChart');
    if (chartContainer && maxRevenue > 0) {
        chartContainer.innerHTML = weekData.map(d => {
            const height = maxRevenue > 0 ? Math.max(10, (d.revenue / maxRevenue) * 100) : 10;
            return `<div class="chart-bar" style="height:${height}%;" title="${d.day}: ₹${d.revenue.toLocaleString('en-IN')}">
                <span class="chart-bar-label">${d.day}</span>
            </div>`;
        }).join('');
    }

    // Render table
    const tbody = document.querySelector('#weeklyBreakdownTable tbody');
    if (tbody) {
        tbody.innerHTML = weekData.map(d => `
            <tr>
                <td><strong>${d.day}</strong></td>
                <td>${d.appts}</td>
                <td><strong>₹${d.revenue.toLocaleString('en-IN')}</strong></td>
                <td>₹${d.cash.toLocaleString('en-IN')}</td>
                <td>₹${d.gpay.toLocaleString('en-IN')}</td>
                <td>₹${d.card.toLocaleString('en-IN')}</td>
            </tr>
        `).join('');
    }
}

function changeReportMonth(delta) {
    reportMonthOffset += delta;
    loadMonthlyReport();
}

function loadMonthlyReport() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth() + reportMonthOffset, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + reportMonthOffset + 1, 0);

    const appointments = getData('appointments');
    const patients = getData('patients');
    const trash = getData('trash') || [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Get IDs of patients in trash (excluded from reports)
    const trashedPatientIds = new Set(trash.map(p => p.id));

    // Update label
    const label = document.getElementById('monthlyReportLabel');
    if (label) {
        label.textContent = monthNames[monthStart.getMonth()] + ' ' + monthStart.getFullYear();
    }

    // Filter appointments (exclude trashed patients)
    const monthAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= monthStart && aptDate <= monthEnd && !trashedPatientIds.has(a.patientId);
    });

    const completed = monthAppts.filter(a => a.status === 'Completed');
    const patientSet = new Set();

    let totalRevenue = 0, cash = 0, gpay = 0, card = 0;
    completed.forEach(a => {
        patientSet.add(a.patientId);
        const amt = parseFloat(a.amountPaid) || 0;
        totalRevenue += amt;
        if (a.paymentMode === 'Cash') cash += amt;
        if (a.paymentMode === 'GPay') gpay += amt;
        if (a.paymentMode === 'Card') card += amt;
    });

    // Update stats
    document.getElementById('monthlyPatients').textContent = patientSet.size;
    document.getElementById('monthlyAppointments').textContent = monthAppts.length;
    document.getElementById('monthlyCompleted').textContent = completed.length;
    document.getElementById('monthlyTotalRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');

    document.getElementById('monthlyCash').textContent = '₹' + cash.toLocaleString('en-IN');
    document.getElementById('monthlyGPay').textContent = '₹' + gpay.toLocaleString('en-IN');
    document.getElementById('monthlyCard').textContent = '₹' + card.toLocaleString('en-IN');
    document.getElementById('monthlyAvgWeek').textContent = '₹' + Math.round(totalRevenue / 4).toLocaleString('en-IN');

    // Payment breakdown visual
    const breakdownContainer = document.getElementById('monthlyPaymentBreakdown');
    if (breakdownContainer && totalRevenue > 0) {
        const cashPct = (cash / totalRevenue) * 100;
        const gpayPct = (gpay / totalRevenue) * 100;
        const cardPct = (card / totalRevenue) * 100;

        breakdownContainer.innerHTML = `
            <div class="breakdown-bar">
                <div class="breakdown-segment cash" style="width:${cashPct}%"></div>
                <div class="breakdown-segment gpay" style="width:${gpayPct}%"></div>
                <div class="breakdown-segment card" style="width:${cardPct}%"></div>
            </div>
            <div class="breakdown-legend">
                <div class="legend-item"><span class="legend-dot cash"></span> Cash ${cashPct.toFixed(0)}%</div>
                <div class="legend-item"><span class="legend-dot gpay"></span> GPay ${gpayPct.toFixed(0)}%</div>
                <div class="legend-item"><span class="legend-dot card"></span> Card ${cardPct.toFixed(0)}%</div>
            </div>
        `;
    } else if (breakdownContainer) {
        breakdownContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">No payment data available</p>';
    }
}

function generateReport(period) {
    const appointments = getData('appointments');
    const patients = getData('patients');
    const now = new Date();
    let startDate, endDate, periodLabel;

    switch (period) {
        case 'weekly':
            startDate = getWeekStart(now);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
            periodLabel = `Week of ${formatDate(startDate.toISOString())}`;
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            periodLabel = `${months[now.getMonth()]} ${now.getFullYear()}`;
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);
            periodLabel = `Year ${now.getFullYear()}`;
            break;
    }

    // Get completed appointments in period
    const completedAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= startDate && aptDate < endDate && a.status === 'Completed';
    });

    // Get all appointments in period
    const allAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= startDate && aptDate < endDate;
    });

    // Calculate stats
    let totalRevenue = 0;
    let cashTotal = 0;
    let gpayTotal = 0;
    let cardTotal = 0;
    const patientSet = new Set();
    const serviceBreakdown = {};

    completedAppts.forEach(a => {
        const amount = parseFloat(a.amountPaid) || 0;
        totalRevenue += amount;
        patientSet.add(a.patientId);

        switch (a.paymentMode) {
            case 'Cash': cashTotal += amount; break;
            case 'GPay': gpayTotal += amount; break;
            case 'Card': cardTotal += amount; break;
        }

        const service = a.service || 'General';
        if (!serviceBreakdown[service]) {
            serviceBreakdown[service] = { count: 0, revenue: 0 };
        }
        serviceBreakdown[service].count++;
        serviceBreakdown[service].revenue += amount;
    });

    const cancelled = allAppts.filter(a => a.status === 'Cancelled').length;
    const pending = allAppts.filter(a => a.paymentStatus === 'Pending' && a.status === 'Completed').length;
    const partialPayments = allAppts.filter(a => a.paymentStatus === 'Partial' && a.status === 'Completed').length;

    // Get new patients in period
    const newPatients = patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= startDate && createdDate < endDate;
    }).length;

    // Generate report HTML
    let html = `
        <div class="report-card">
            <div class="report-header">
                <h4><i class="fas fa-file-invoice-dollar"></i> ${period.charAt(0).toUpperCase() + period.slice(1)} Report</h4>
                <span class="report-period">${periodLabel}</span>
            </div>

            <div class="report-grid">
                <div class="report-stat">
                    <span class="stat-label">Total Revenue</span>
                    <span class="stat-value revenue">₹${totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div class="report-stat">
                    <span class="stat-label">Patients Treated</span>
                    <span class="stat-value">${patientSet.size}</span>
                </div>
                <div class="report-stat">
                    <span class="stat-label">New Patients</span>
                    <span class="stat-value">${newPatients}</span>
                </div>
                <div class="report-stat">
                    <span class="stat-label">Appointments</span>
                    <span class="stat-value">${completedAppts.length}</span>
                </div>
            </div>

            <div class="report-section">
                <h5>Payment Mode Breakdown</h5>
                <div class="payment-breakdown">
                    <div class="breakdown-item cash">
                        <span class="mode-icon"><i class="fas fa-money-bill-wave"></i></span>
                        <span class="mode-label">Cash</span>
                        <span class="mode-value">₹${cashTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="breakdown-item gpay">
                        <span class="mode-icon"><i class="fas fa-mobile-alt"></i></span>
                        <span class="mode-label">GPay</span>
                        <span class="mode-value">₹${gpayTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="breakdown-item card">
                        <span class="mode-icon"><i class="fas fa-credit-card"></i></span>
                        <span class="mode-label">Card</span>
                        <span class="mode-value">₹${cardTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h5>Service Breakdown</h5>
                <div class="service-breakdown">
                    ${Object.entries(serviceBreakdown).map(([service, data]) => `
                        <div class="service-item">
                            <span class="service-name">${escapeHtml(service)}</span>
                            <span class="service-count">${data.count} visits</span>
                            <span class="service-revenue">₹${data.revenue.toLocaleString('en-IN')}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="report-section">
                <h5>Additional Stats</h5>
                <div class="additional-stats">
                    <div class="stat-row">
                        <span>Cancelled Appointments</span>
                        <span class="stat-badge cancelled">${cancelled}</span>
                    </div>
                    <div class="stat-row">
                        <span>Pending Payments</span>
                        <span class="stat-badge pending">${pending}</span>
                    </div>
                    <div class="stat-row">
                        <span>Partial Payments</span>
                        <span class="stat-badge partial">${partialPayments}</span>
                    </div>
                </div>
            </div>

            <div class="report-actions">
                <button class="btn btn-primary" onclick="printReport()"><i class="fas fa-print"></i> Print Report</button>
            </div>
        </div>
    `;

    document.getElementById('reportDisplay').innerHTML = html;
}

function exportAccountsCSV() {
    const period = document.getElementById('accountsPeriod') ? document.getElementById('accountsPeriod').value : 'month';
    const appointments = getData('appointments');
    const patients = getData('patients');

    // Filter by period
    const now = new Date();
    let startDate, endDate;

    switch (period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'week':
            startDate = getWeekStart(now);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);
            break;
    }

    const filteredAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= startDate && aptDate < endDate && a.status === 'Completed';
    });

    if (filteredAppts.length === 0) {
        showToast('No transactions to export.', 'info');
        return;
    }

    // Build CSV content
    let csv = 'Date,Patient,Phone,Service,Amount,Payment Mode,Payment Status\n';

    filteredAppts.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(a => {
        let patientName = a.patientName || 'Unknown';
        let phone = a.phone || '';
        if (a.patientId) {
            const pt = patients.find(p => p.id === a.patientId);
            if (pt) {
                patientName = pt.name;
                phone = pt.phone;
            }
        }

        csv += `"${formatDate(a.date)}","${patientName}","${phone}","${a.service || 'General'}","${a.amountPaid || 0}","${a.paymentMode || 'N/A'}","${a.paymentStatus || 'Pending'}"\n`;
    });

    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `accounts_${period}_${formatDate(now.toISOString()).replace(/\s/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Accounts exported to CSV.', 'success');
}

function printReport() {
    const reportContent = document.getElementById('reportDisplay').innerHTML;
    if (!reportContent || reportContent.trim() === '') {
        showToast('No report to print. Generate a report first.', 'error');
        return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Accounts Report - Shree Physiotherapy Clinic</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #2D2D2D; }
                .report-card { max-width: 800px; margin: 0 auto; }
                .report-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1B4D3E; }
                .report-header h4 { font-size: 1.5rem; color: #1B4D3E; }
                .report-period { color: #6B7280; font-size: 0.9rem; }
                .report-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .report-stat { background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; }
                .stat-label { display: block; font-size: 0.85rem; color: #6B7280; margin-bottom: 4px; }
                .stat-value { display: block; font-size: 1.3rem; font-weight: 700; color: #1B4D3E; }
                .stat-value.revenue { color: #22C55E; }
                .report-section { margin-bottom: 24px; }
                .report-section h5 { font-size: 1rem; color: #1B4D3E; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB; }
                .payment-breakdown, .service-breakdown, .additional-stats { background: #f9fafb; padding: 16px; border-radius: 8px; }
                .breakdown-item, .service-item, .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
                .breakdown-item:last-child, .service-item:last-child, .stat-row:last-child { border-bottom: none; }
                .report-actions { display: none; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div style="text-align:center; margin-bottom:24px;">
                <h2>Shree Physiotherapy Clinic</h2>
                <p style="color:#6B7280;">Phone: 822004084 | 9092294466</p>
            </div>
            ${reportContent}
            <script>window.onload = function() { window.print(); };<\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/* ============================================
   CLOUD SYNC / SETTINGS TAB FUNCTIONS
   ============================================ */
function loadSettingsTab() {
    // Load data stats
    var statsGrid = document.getElementById('dataStatsGrid');
    if (statsGrid && window.CloudSync) {
        var stats = CloudSync.getDataStats();
        var labels = { patients: 'Patients', appointments: 'Appointments', prescriptions: 'Prescriptions', followups: 'Follow-ups' };
        var icons = { patients: 'fa-users', appointments: 'fa-calendar-check', prescriptions: 'fa-file-prescription', followups: 'fa-bell' };
        var html = '';
        for (var key in labels) {
            html += '<div style="background:var(--bg);padding:16px;border-radius:var(--radius);text-align:center;">' +
                '<i class="fas ' + icons[key] + '" style="font-size:1.5rem;color:var(--primary);margin-bottom:8px;display:block;"></i>' +
                '<div style="font-size:1.8rem;font-weight:700;color:var(--text);">' + (stats[key] || 0) + '</div>' +
                '<div style="font-size:0.8rem;color:var(--text-muted);">' + labels[key] + '</div></div>';
        }
        statsGrid.innerHTML = html;
    }

    // Load saved Firebase config into form
    try {
        var saved = localStorage.getItem('_firebaseConfig');
        if (saved) {
            var config = JSON.parse(saved);
            var fields = { fbApiKey: 'apiKey', fbAuthDomain: 'authDomain', fbDatabaseURL: 'databaseURL', fbProjectId: 'projectId', fbStorageBucket: 'storageBucket', fbMessagingSenderId: 'messagingSenderId', fbAppId: 'appId' };
            for (var id in fields) {
                var el = document.getElementById(id);
                if (el && config[fields[id]]) el.value = config[fields[id]];
            }
        }
    } catch (e) { /* ignore */ }

    // Update secondary sync status
    var indicator2 = document.getElementById('syncStatusIndicator2');
    var indicator1 = document.getElementById('syncStatusIndicator');
    if (indicator2 && indicator1) {
        indicator2.innerHTML = indicator1.innerHTML;
    }
}

function saveFirebaseConfig() {
    var config = {
        apiKey: document.getElementById('fbApiKey').value.trim(),
        authDomain: document.getElementById('fbAuthDomain').value.trim(),
        databaseURL: document.getElementById('fbDatabaseURL').value.trim(),
        projectId: document.getElementById('fbProjectId').value.trim(),
        storageBucket: (document.getElementById('fbStorageBucket').value || '').trim(),
        messagingSenderId: (document.getElementById('fbMessagingSenderId').value || '').trim(),
        appId: (document.getElementById('fbAppId').value || '').trim()
    };

    if (!config.apiKey || !config.databaseURL || !config.projectId) {
        showToast('Please fill in API Key, Database URL, and Project ID', 'error');
        return;
    }

    // Reload page to reinitialize Firebase with new config
    localStorage.setItem('_firebaseConfig', JSON.stringify(config));
    showToast('Firebase config saved! Reconnecting...', 'success');

    setTimeout(function() {
        window.location.reload();
    }, 1000);
}

function disconnectFirebase() {
    if (window.CloudSync) {
        CloudSync.disconnect();
    }
    // Clear form
    ['fbApiKey', 'fbAuthDomain', 'fbDatabaseURL', 'fbProjectId', 'fbStorageBucket', 'fbMessagingSenderId', 'fbAppId'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    showToast('Firebase disconnected. Using local storage only.', 'success');
    loadSettingsTab();
}

function syncNowFromCloud() {
    if (!window.CloudSync || !CloudSync.isReady()) {
        showToast('Firebase not connected. Set up Firebase first.', 'error');
        return;
    }
    CloudSync.pullFromCloud(function(success) {
        if (success) {
            showToast('Data pulled from cloud successfully!', 'success');
            refreshDashboard();
            loadSettingsTab();
        } else {
            showToast('Failed to pull data from cloud', 'error');
        }
    });
}

function syncNowToCloud() {
    if (!window.CloudSync || !CloudSync.isReady()) {
        showToast('Firebase not connected. Set up Firebase first.', 'error');
        return;
    }
    CloudSync.pushToCloud(function(success) {
        if (success) {
            showToast('Data pushed to cloud successfully!', 'success');
            loadSettingsTab();
        } else {
            showToast('Failed to push data to cloud', 'error');
        }
    });
}

function handleImportFile(input) {
    if (!input.files || !input.files[0]) return;
    if (window.CloudSync) {
        CloudSync.importData(input.files[0], function(success) {
            if (success) {
                refreshDashboard();
                loadPatients();
                loadAppointments();
                loadSettingsTab();
            }
            input.value = '';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (!checkSession()) {
        showLoginScreen();
        document.getElementById('dashboardApp').style.display = 'none';
        return;
    }

    // Initialize dashboard
    switchTab('overview');
    initDashboardData();
});

// Secret admin shortcut: Ctrl+Shift+C to access Cloud Sync settings
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (checkSession()) {
            switchTab('settings');
            showToast('Admin: Cloud Sync settings opened', 'info');
        }
    }
});

/* ============================================
   TEST DATA SEEDER - 70+ Patients, Full Workflow
   Jan 6 - Feb 6, 2026 (one month of clinic data)
   Run via browser console: seedTestData()
   ============================================ */
function seedTestData() {
    // Deterministic random using seed for reproducible data
    var seed = 12345;
    function seededRandom() {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
    }
    function randInt(min, max) { return min + Math.floor(seededRandom() * (max - min + 1)); }
    function pick(arr) { return arr[Math.floor(seededRandom() * arr.length)]; }

    // Unique ID generator with offset to avoid collisions
    var idCounter = 0;
    function seedId() {
        idCounter++;
        return 'id_' + (1738800000000 + idCounter) + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ---- Constants ----
    var timeSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'];
    var payModes = ['Cash', 'Cash', 'Cash', 'Cash', 'GPay', 'GPay', 'GPay', 'Card', 'Card', 'Card']; // ~40/35/25 distribution
    var amounts = [300, 400, 400, 500, 500, 500, 500, 600, 600, 700, 800, 1000];

    var coimbatoreAreas = [
        'RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Race Course',
        'Singanallur', 'Ukkadam', 'Vadavalli', 'Thudiyalur', 'Kuniyamuthur',
        'Ganapathy', 'Ramanathapuram', 'Ondipudur', 'Sulur', 'Kalapatti',
        'Town Hall', 'Podanur', 'Kovaipudur', 'Saravanampatti', 'Avinashi Road'
    ];

    // 75 patients with realistic Indian names and physio conditions
    var samplePatients = [
        // Orthopedic (30)
        { name: 'Rajesh Kumar', age: 45, gender: 'Male', condition: 'Chronic lower back pain', service: 'Orthopedic Rehabilitation' },
        { name: 'Venkatesh Iyer', age: 58, gender: 'Male', condition: 'Knee osteoarthritis (bilateral)', service: 'Orthopedic Rehabilitation' },
        { name: 'Arjun Nair', age: 28, gender: 'Male', condition: 'ACL reconstruction recovery', service: 'Orthopedic Rehabilitation' },
        { name: 'Suresh Babu', age: 52, gender: 'Male', condition: 'Sciatica (right leg)', service: 'Orthopedic Rehabilitation' },
        { name: 'Kavitha Krishnan', age: 55, gender: 'Female', condition: 'Lumbar disc herniation', service: 'Orthopedic Rehabilitation' },
        { name: 'Gopalakrishnan S', age: 63, gender: 'Male', condition: 'Total knee replacement rehab', service: 'Orthopedic Rehabilitation' },
        { name: 'Revathi Mohan', age: 38, gender: 'Female', condition: 'Plantar fasciitis (bilateral)', service: 'Orthopedic Rehabilitation' },
        { name: 'Mohan Raj', age: 50, gender: 'Male', condition: 'Cervical spondylosis with radiculopathy', service: 'Orthopedic Rehabilitation' },
        { name: 'Deepa Venkatesh', age: 44, gender: 'Female', condition: 'Rotator cuff tear (right)', service: 'Orthopedic Rehabilitation' },
        { name: 'Senthil Murugan', age: 35, gender: 'Male', condition: 'Ankle sprain grade 2', service: 'Orthopedic Rehabilitation' },
        { name: 'Vasanthi Devi', age: 60, gender: 'Female', condition: 'Hip replacement rehab (left)', service: 'Orthopedic Rehabilitation' },
        { name: 'Ramesh Chandran', age: 47, gender: 'Male', condition: 'Scoliosis - postural correction', service: 'Orthopedic Rehabilitation' },
        { name: 'Nirmala Sundari', age: 53, gender: 'Female', condition: 'Knee osteoarthritis (right)', service: 'Orthopedic Rehabilitation' },
        { name: 'Arun Prasad', age: 30, gender: 'Male', condition: 'Lumbar muscle strain', service: 'Orthopedic Rehabilitation' },
        { name: 'Jeyalakshmi R', age: 62, gender: 'Female', condition: 'Cervical spondylosis', service: 'Orthopedic Rehabilitation' },
        { name: 'Balasubramanian K', age: 57, gender: 'Male', condition: 'Frozen shoulder (right)', service: 'Orthopedic Rehabilitation' },
        { name: 'Padmini Rangan', age: 49, gender: 'Female', condition: 'Carpal tunnel syndrome (bilateral)', service: 'Orthopedic Rehabilitation' },
        { name: 'Vijayakumar S', age: 42, gender: 'Male', condition: 'Disc herniation L4-L5', service: 'Orthopedic Rehabilitation' },
        { name: 'Chitra Devi', age: 56, gender: 'Female', condition: 'Total knee replacement rehab (left)', service: 'Orthopedic Rehabilitation' },
        { name: 'Manikandan P', age: 33, gender: 'Male', condition: 'ACL reconstruction (left knee)', service: 'Orthopedic Rehabilitation' },
        { name: 'Lalitha Bai', age: 65, gender: 'Female', condition: 'Knee osteoarthritis with valgus', service: 'Orthopedic Rehabilitation' },
        { name: 'Prashanth Kumar', age: 27, gender: 'Male', condition: 'Wrist fracture rehab', service: 'Orthopedic Rehabilitation' },
        { name: 'Sumathi N', age: 48, gender: 'Female', condition: 'Plantar fasciitis (right)', service: 'Orthopedic Rehabilitation' },
        { name: 'Ravi Shankar', age: 54, gender: 'Male', condition: 'Cervical disc bulge C5-C6', service: 'Orthopedic Rehabilitation' },
        { name: 'Geetha Rani', age: 46, gender: 'Female', condition: 'Adhesive capsulitis (left shoulder)', service: 'Orthopedic Rehabilitation' },
        { name: 'Anandh Kumar', age: 39, gender: 'Male', condition: 'Meniscus tear (right knee)', service: 'Orthopedic Rehabilitation' },
        { name: 'Kamala Devi', age: 61, gender: 'Female', condition: 'Lumbar canal stenosis', service: 'Orthopedic Rehabilitation' },
        { name: 'Saravanan M', age: 36, gender: 'Male', condition: 'Shoulder impingement syndrome', service: 'Orthopedic Rehabilitation' },
        { name: 'Bharathi S', age: 51, gender: 'Female', condition: 'Lateral epicondylitis (right)', service: 'Orthopedic Rehabilitation' },
        { name: 'Kathiresan V', age: 43, gender: 'Male', condition: 'Post-operative spine rehab', service: 'Orthopedic Rehabilitation' },
        // Fascial / Manual therapy (8)
        { name: 'Priya Sharma', age: 32, gender: 'Female', condition: 'Frozen shoulder (left)', service: 'Fascial Manipulation' },
        { name: 'Meena Sundaram', age: 40, gender: 'Female', condition: 'Cervical spondylosis with trigger points', service: 'Fascial Manipulation' },
        { name: 'Dinesh Pandian', age: 48, gender: 'Male', condition: 'Tennis elbow (right)', service: 'Fascial Manipulation' },
        { name: 'Sangeetha M', age: 34, gender: 'Female', condition: 'Myofascial pain syndrome - neck', service: 'Fascial Manipulation' },
        { name: 'Balaji Krishnamoorthy', age: 41, gender: 'Male', condition: 'Thoracic outlet syndrome', service: 'Fascial Manipulation' },
        { name: 'Mythili Raman', age: 37, gender: 'Female', condition: 'TMJ dysfunction', service: 'Fascial Manipulation' },
        { name: 'Ganesh Babu', age: 29, gender: 'Male', condition: 'Myofascial trigger points - upper back', service: 'Fascial Manipulation' },
        { name: 'Vimala Devi', age: 59, gender: 'Female', condition: 'Fibromyalgia management', service: 'Fascial Manipulation' },
        // Neuro (8)
        { name: 'Lakshmi Devi', age: 67, gender: 'Female', condition: 'Post-stroke rehabilitation (right hemiplegia)', service: 'Neuro Rehabilitation' },
        { name: 'Saroja Ammal', age: 72, gender: 'Female', condition: 'Parkinson disease - mobility and balance', service: 'Neuro Rehabilitation' },
        { name: 'Krishnamoorthy R', age: 64, gender: 'Male', condition: 'Bell\'s palsy (left side)', service: 'Neuro Rehabilitation' },
        { name: 'Tamilselvi P', age: 58, gender: 'Female', condition: 'Peripheral neuropathy (diabetic)', service: 'Neuro Rehabilitation' },
        { name: 'Nagappan S', age: 70, gender: 'Male', condition: 'Post-stroke rehabilitation (left hemiparesis)', service: 'Neuro Rehabilitation' },
        { name: 'Parvathi Ammal', age: 66, gender: 'Female', condition: 'Guillain-Barre syndrome recovery', service: 'Neuro Rehabilitation' },
        { name: 'Sundaram K', age: 61, gender: 'Male', condition: 'Cervical myelopathy - gait training', service: 'Neuro Rehabilitation' },
        { name: 'Dhanam S', age: 55, gender: 'Female', condition: 'Multiple sclerosis - balance rehab', service: 'Neuro Rehabilitation' },
        // Pediatric (5)
        { name: 'Baby Arun', age: 5, gender: 'Male', condition: 'Cerebral palsy - motor development', service: 'Pediatric Physiotherapy' },
        { name: 'Baby Meera', age: 3, gender: 'Female', condition: 'Developmental delay - gross motor', service: 'Pediatric Physiotherapy' },
        { name: 'Baby Karthik', age: 7, gender: 'Male', condition: 'Torticollis correction', service: 'Pediatric Physiotherapy' },
        { name: 'Baby Ananya', age: 4, gender: 'Female', condition: 'Down syndrome - physical therapy', service: 'Pediatric Physiotherapy' },
        { name: 'Baby Rohit', age: 6, gender: 'Male', condition: 'Flat foot correction', service: 'Pediatric Physiotherapy' },
        // Women's Health (5)
        { name: 'Anitha Rajan', age: 35, gender: 'Female', condition: 'Postpartum pelvic floor weakness', service: "Women's Health Physio" },
        { name: 'Divya Prakash', age: 30, gender: 'Female', condition: 'Prenatal back pain - third trimester', service: "Women's Health Physio" },
        { name: 'Rani Bala', age: 33, gender: 'Female', condition: 'Diastasis recti rehabilitation', service: "Women's Health Physio" },
        { name: 'Sowmya Narayanan', age: 29, gender: 'Female', condition: 'Postpartum SI joint dysfunction', service: "Women's Health Physio" },
        { name: 'Indira K', age: 36, gender: 'Female', condition: 'Pelvic girdle pain - pregnancy', service: "Women's Health Physio" },
        // Geriatric / Elderly Home Care (5)
        { name: 'Ramaswamy T', age: 75, gender: 'Male', condition: 'Osteoporosis - fall prevention', service: 'Elderly Home Care' },
        { name: 'Meenakshi Ammal', age: 73, gender: 'Female', condition: 'Balance training - fall risk', service: 'Elderly Home Care' },
        { name: 'Natarajan V', age: 71, gender: 'Male', condition: 'Post-hip fracture mobility', service: 'Elderly Home Care' },
        { name: 'Kanagavalli S', age: 68, gender: 'Female', condition: 'Arthritis - joint mobility program', service: 'Elderly Home Care' },
        { name: 'Palani Murugan', age: 74, gender: 'Male', condition: 'Geriatric deconditioning rehab', service: 'Elderly Home Care' },
        // Sports (9)
        { name: 'Karthik Murugan', age: 22, gender: 'Male', condition: 'Hamstring strain grade 2', service: 'Orthopedic Rehabilitation' },
        { name: 'Vignesh R', age: 24, gender: 'Male', condition: 'ACL tear - pre-surgery conditioning', service: 'Orthopedic Rehabilitation' },
        { name: 'Surya Prakash', age: 20, gender: 'Male', condition: 'Shoulder impingement - cricket', service: 'Orthopedic Rehabilitation' },
        { name: 'Nandhini K', age: 23, gender: 'Female', condition: 'Patellofemoral pain syndrome', service: 'Orthopedic Rehabilitation' },
        { name: 'Aravind S', age: 26, gender: 'Male', condition: 'Achilles tendinopathy', service: 'Orthopedic Rehabilitation' },
        { name: 'Darshan M', age: 21, gender: 'Male', condition: 'Groin strain - football', service: 'Orthopedic Rehabilitation' },
        { name: 'Keerthi V', age: 25, gender: 'Female', condition: 'IT band syndrome - runner', service: 'Orthopedic Rehabilitation' },
        { name: 'Harish Kumar', age: 19, gender: 'Male', condition: 'Shin splints - bilateral', service: 'Orthopedic Rehabilitation' },
        { name: 'Madhan R', age: 31, gender: 'Male', condition: 'Rotator cuff strain - gym injury', service: 'Orthopedic Rehabilitation' }
    ];

    // Treatment notes templates per condition category
    var treatmentTemplates = {
        'back': ['IFT + Ultrasound therapy applied to lumbar region. Manual mobilization performed.', 'Spinal traction 10 min + TENS. Core strengthening exercises introduced.', 'McKenzie protocol extension exercises. Pain reducing, ROM improving.', 'Lumbar stabilization exercises progressed. Hot pack + manual therapy.'],
        'shoulder': ['Codman pendulum exercises. Ultrasound to supraspinatus. Gentle ROM.', 'Progressive shoulder mobilization - Maitland grade 3. Wall climbing exercise.', 'Active assisted ROM exercises. Theraband strengthening initiated.', 'Full ROM restored. Strengthening with resistance bands continued.'],
        'knee': ['Quad sets + SLR initiated. Cryotherapy post-session. CPM if post-surgical.', 'Knee ROM exercises progressed. Stationary cycling 10 min. Quad strengthening.', 'Balance training on wobble board. Step-ups introduced. Good progress.', 'Functional training - stairs, squats. Sport-specific rehab for younger patients.'],
        'neck': ['Cervical traction 10 min. Isometric neck strengthening. Posture correction.', 'Manual therapy to cervical spine. TENS + heat. Chin tucks prescribed.', 'Cervical ROM exercises progressed. Ergonomic advice reinforced.', 'Neck strengthening with resistance. Postural re-education. Near discharge.'],
        'neuro': ['Bobath approach - facilitation of normal movement patterns. Weight bearing exercises.', 'PNF diagonal patterns. Balance training on stable surface. Gait re-education.', 'Task-specific training. Fine motor exercises for hand function.', 'Community mobility training. Stair climbing practice. Home program updated.'],
        'pediatric': ['NDT approach - facilitation of developmental milestones. Parent education given.', 'Play-based therapy - reaching, grasping, weight bearing activities.', 'Gross motor activities - rolling, sitting balance, supported standing.', 'Milestone-oriented therapy. Parent demonstrated home exercises.'],
        'pelvic': ['Pelvic floor assessment. Kegel exercises taught - 10 reps x 3 sets.', 'Core and pelvic floor co-activation exercises. Breathing coordination.', 'Progressive pelvic floor strengthening. Functional movement integration.', 'Advanced core stability. Return-to-activity planning discussed.'],
        'general': ['Assessment completed. Treatment plan discussed with patient.', 'Therapeutic exercises prescribed. Electrotherapy modalities applied.', 'Good progress noted. Treatment plan adjusted per reassessment.', 'Exercises progressed. Patient compliant with home program.']
    };

    function getTreatmentCategory(condition) {
        var c = condition.toLowerCase();
        if (c.includes('back') || c.includes('lumbar') || c.includes('disc') || c.includes('spine') || c.includes('sciatica') || c.includes('stenosis') || c.includes('scoliosis')) return 'back';
        if (c.includes('shoulder') || c.includes('rotator') || c.includes('capsulitis') || c.includes('impingement') || c.includes('frozen')) return 'shoulder';
        if (c.includes('knee') || c.includes('acl') || c.includes('meniscus') || c.includes('patello') || c.includes('hip') || c.includes('ankle') || c.includes('achilles') || c.includes('plantar') || c.includes('shin') || c.includes('groin') || c.includes('hamstring') || c.includes('it band') || c.includes('flat foot') || c.includes('wrist') || c.includes('fracture')) return 'knee';
        if (c.includes('cervical') || c.includes('neck') || c.includes('tmj') || c.includes('thoracic') || c.includes('tennis') || c.includes('carpal') || c.includes('epicondyl') || c.includes('trigger') || c.includes('myofascial') || c.includes('fibromyalgia')) return 'neck';
        if (c.includes('stroke') || c.includes('parkinson') || c.includes('bell') || c.includes('neuropathy') || c.includes('guillain') || c.includes('myelopathy') || c.includes('sclerosis')) return 'neuro';
        if (c.includes('cerebral') || c.includes('developmental') || c.includes('torticollis') || c.includes('down syndrome')) return 'pediatric';
        if (c.includes('pelvic') || c.includes('postpartum') || c.includes('prenatal') || c.includes('diastasis') || c.includes('pregnancy') || c.includes('si joint')) return 'pelvic';
        return 'general';
    }

    function getTreatmentNote(condition, sessionNum) {
        var cat = getTreatmentCategory(condition);
        var templates = treatmentTemplates[cat];
        var idx = (sessionNum - 1) % templates.length;
        return 'Session ' + sessionNum + ': ' + templates[idx] + ' Patient tolerating well.';
    }

    function getPrescription(condition, age) {
        var cat = getTreatmentCategory(condition);
        var treatment, meds, instructions;

        switch (cat) {
            case 'back':
                treatment = 'Physiotherapy protocol: IFT + Ultrasound + Manual mobilization. Lumbar stabilization program. ' + (age > 60 ? '3 sessions/week x 4 weeks.' : '2-3 sessions/week x 3 weeks.');
                meds = age > 45 ? 'Tab. Aceclofenac 100mg BD x 5 days, Tab. Thiocolchicoside 4mg BD x 5 days, Cap. Methylcobalamin 1500mcg OD x 15 days' : '';
                instructions = 'Home exercises: Cat-cow stretches, pelvic tilts, bird-dog exercise 10 reps x 3 sets daily. Avoid prolonged sitting >30 min. Use lumbar support.';
                break;
            case 'shoulder':
                treatment = 'Physiotherapy protocol: Ultrasound to shoulder + Manual mobilization (Maitland) + Progressive ROM exercises. ' + (age > 55 ? '3 sessions/week x 6 weeks.' : '2-3 sessions/week x 4 weeks.');
                meds = age > 40 ? 'Tab. Etoricoxib 60mg OD x 7 days, Gel Diclofenac topical application BD' : 'Gel Diclofenac topical application BD';
                instructions = 'Home exercises: Pendulum exercises, wall climbing, towel stretch 10 reps x 3 sets daily. Avoid overhead activities. Use cold pack after exercises.';
                break;
            case 'knee':
                treatment = 'Physiotherapy protocol: Quadriceps strengthening + ROM exercises + Balance training. Cryotherapy post-session. ' + (age > 55 ? '3 sessions/week x 6 weeks.' : '2 sessions/week x 4 weeks.');
                meds = age > 50 ? 'Tab. Diacerein 50mg BD x 30 days, Tab. Aceclofenac 100mg SOS, Cap. Glucosamine 500mg + Chondroitin 400mg BD' : '';
                instructions = 'Home exercises: Quad sets, straight leg raises, heel slides 15 reps x 3 sets daily. Avoid squatting and cross-legged sitting. Use knee cap during walking.';
                break;
            case 'neck':
                treatment = 'Physiotherapy protocol: Cervical traction + TENS + Manual therapy + Postural correction. ' + (age > 50 ? '3 sessions/week x 4 weeks.' : '2 sessions/week x 3 weeks.');
                meds = age > 40 ? 'Tab. Aceclofenac 100mg + Thiocolchicoside 4mg BD x 5 days, Cap. Pregabalin 75mg HS x 10 days' : '';
                instructions = 'Home exercises: Chin tucks, isometric neck exercises, shoulder rolls 10 reps x 3 sets daily. Proper ergonomic workstation setup. Avoid prolonged phone use.';
                break;
            case 'neuro':
                treatment = 'Neurological rehabilitation: Bobath/NDT approach + PNF patterns + Balance and gait training + Task-specific exercises. 3-5 sessions/week x 8-12 weeks.';
                meds = age > 60 ? 'Tab. Citicoline 500mg BD, Tab. Methylcobalamin 1500mcg OD' : '';
                instructions = 'Home program: Weight bearing exercises, standing balance practice with support, walking with assistive device as needed. Caregiver assistance recommended.';
                break;
            case 'pediatric':
                treatment = 'Pediatric physiotherapy: NDT/Bobath approach + Sensory integration + Developmental stimulation + Parent-guided home exercises. 3 sessions/week ongoing.';
                meds = '';
                instructions = 'Parent instructions: Daily tummy time, supported sitting practice, reaching activities during play. Follow developmental milestone checklist. Regular follow-up every 4 weeks.';
                break;
            case 'pelvic':
                treatment = "Women's health physiotherapy: Pelvic floor assessment + Kegel training + Core stability program + Postural re-education. 2 sessions/week x 6 weeks.";
                meds = '';
                instructions = 'Home exercises: Pelvic floor contractions (Kegels) 10 reps x 5 sec hold x 3 sets daily. Diaphragmatic breathing. Avoid heavy lifting. Gradual return to activity.';
                break;
            default:
                treatment = 'Physiotherapy assessment and treatment plan. Electrotherapy + Manual therapy + Exercise prescription. 2-3 sessions/week x 4 weeks.';
                meds = age > 50 ? 'Tab. Aceclofenac 100mg BD x 5 days' : '';
                instructions = 'Follow prescribed exercise program. Apply ice/heat as directed. Maintain activity log. Return if symptoms worsen.';
        }
        return { treatment: treatment, medications: meds, instructions: instructions };
    }

    // Helper: format Date as YYYY-MM-DD without timezone shift
    function toDateStr(dt) {
        var y = dt.getFullYear();
        var m = String(dt.getMonth() + 1).padStart(2, '0');
        var dd = String(dt.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + dd;
    }

    // ---- Generate working days from Jan 6 to Feb 6, 2026 (skip Sundays) ----
    var workingDays = [];
    var d = new Date(2026, 0, 6); // Jan 6, 2026
    var endDate = new Date(2026, 1, 6); // Feb 6, 2026
    while (d <= endDate) {
        if (d.getDay() !== 0) { // Skip Sundays
            workingDays.push(toDateStr(d));
        }
        d.setDate(d.getDate() + 1);
    }

    var today = toDateStr(new Date());

    // ---- Distribute patients across working days: ~3 new patients per day ----
    var patientAssignments = []; // { patientIndex, registrationDay }
    // Spread 70 patients across working days, leaving last 5 days for future appointments
    var usableDays = workingDays.length - 3; // Reserve last 3 days for scheduled-only patients
    var patientsPerDay = Math.ceil(samplePatients.length / usableDays);
    var dayIdx = 0;
    var countOnDay = 0;
    for (var i = 0; i < samplePatients.length; i++) {
        patientAssignments.push({ idx: i, regDayIdx: dayIdx });
        countOnDay++;
        if (countOnDay >= patientsPerDay && dayIdx < usableDays - 1) {
            countOnDay = 0;
            dayIdx++;
        }
    }

    // ---- Build data arrays ----
    var patients = [];
    var appointments = [];
    var prescriptions = [];
    var followups = [];

    // Phone number generator (unique 10-digit Indian numbers)
    var phoneBase = 9876540000;

    for (var pi = 0; pi < patientAssignments.length; pi++) {
        var pa = patientAssignments[pi];
        var sp = samplePatients[pa.idx];
        var regDate = workingDays[pa.regDayIdx];
        var phone = String(phoneBase + pi + 1);
        var area = coimbatoreAreas[pi % coimbatoreAreas.length];
        var baseAmount = amounts[pi % amounts.length];

        // Create patient
        var pt = {
            id: seedId(),
            name: sp.name,
            age: sp.age,
            gender: sp.gender,
            phone: phone,
            email: '',
            address: area + ', Coimbatore, Tamil Nadu',
            createdAt: regDate + 'T09:' + String(30 + (pi % 30)).padStart(2, '0') + ':00.000Z'
        };
        patients.push(pt);

        // ---- Generate appointments for this patient ----
        // First appointment = registration day, service = General Consultation
        var aptDates = [regDate];
        // Subsequent appointments every 3-4 days
        var regParts = regDate.split('-');
        var nextDate = new Date(parseInt(regParts[0]), parseInt(regParts[1]) - 1, parseInt(regParts[2]));
        var numFollowVisits = 2 + Math.floor(seededRandom() * 3); // 2-4 more visits
        for (var v = 0; v < numFollowVisits; v++) {
            nextDate.setDate(nextDate.getDate() + 3 + Math.floor(seededRandom() * 2)); // 3-4 days gap
            if (nextDate.getDay() === 0) nextDate.setDate(nextDate.getDate() + 1); // skip Sunday
            var nd = toDateStr(nextDate);
            if (nd <= '2026-02-06') aptDates.push(nd);
        }

        // Assign time slots (spread across slots, avoiding too many at same time)
        var patientTimeIdx = pi % timeSlots.length;

        for (var ai = 0; ai < aptDates.length; ai++) {
            var aptDate = aptDates[ai];
            var isPast = aptDate < today;
            var isToday = aptDate === today;
            var timeIdx = (patientTimeIdx + ai) % timeSlots.length;
            var time = timeSlots[timeIdx];
            var duration = sp.age < 10 ? 45 : 30;
            var endTime = calculateEndTime(time, duration);
            var payMode = pick(payModes);
            var amount = baseAmount + (ai > 0 ? randInt(-100, 100) : 0);
            if (amount < 300) amount = 300;
            if (amount > 1000) amount = 1000;
            amount = Math.round(amount / 50) * 50; // Round to nearest 50

            var service;
            if (ai === 0) {
                service = 'General Consultation';
            } else if (ai % 4 === 0) {
                service = 'Follow-up Visit';
            } else {
                service = sp.service;
            }

            var aptStatus, payStatus, amountPaid, payModeVal;
            if (isPast) {
                aptStatus = 'Completed';
                payStatus = 'Paid';
                amountPaid = String(amount);
                payModeVal = payMode;
            } else if (isToday) {
                // Some today appointments completed (morning), some scheduled (evening)
                var timeMins = timeStringToMinutes(time);
                var nowMins = getIndiaCurrentMinutes();
                if (timeMins < nowMins) {
                    aptStatus = 'Completed';
                    payStatus = 'Paid';
                    amountPaid = String(amount);
                    payModeVal = payMode;
                } else {
                    aptStatus = 'Scheduled';
                    payStatus = 'Pending';
                    amountPaid = '';
                    payModeVal = null;
                }
            } else {
                aptStatus = 'Scheduled';
                payStatus = 'Pending';
                amountPaid = '';
                payModeVal = null;
            }

            var apt = {
                id: seedId(),
                patientId: pt.id,
                patientName: pt.name,
                name: pt.name,
                phone: pt.phone,
                date: aptDate,
                time: time,
                startTime: time,
                endTime: endTime,
                duration: duration,
                service: service,
                status: aptStatus,
                paymentStatus: payStatus,
                amountPaid: amountPaid,
                paymentMode: payModeVal,
                createdAt: pt.createdAt
            };

            if (aptStatus === 'Completed') {
                apt.actualStartTime = time;
                apt.actualEndTime = endTime;
                apt.treatmentNotes = getTreatmentNote(sp.condition, ai + 1);
                apt.completedAt = aptDate + 'T' + String(10 + Math.floor(timeIdx / 2)).padStart(2, '0') + ':' + String(30 + (timeIdx % 2) * 30).padStart(2, '0') + ':00.000Z';
            }

            appointments.push(apt);

            // ---- Prescription for first completed visit ----
            if (ai === 0 && aptStatus === 'Completed') {
                var rxData = getPrescription(sp.condition, sp.age);
                var rx = {
                    id: seedId(),
                    patientId: pt.id,
                    patientName: pt.name,
                    date: aptDate,
                    diagnosis: sp.condition,
                    treatment: rxData.treatment,
                    medications: rxData.medications,
                    instructions: rxData.instructions,
                    paymentAmount: String(amount),
                    paymentMode: payMode,
                    paymentStatus: 'Paid',
                    createdAt: aptDate + 'T10:30:00.000Z'
                };
                prescriptions.push(rx);

                // ---- Follow-up scheduled 7-14 days after first visit ----
                var fuOffset = 7 + Math.floor(seededRandom() * 8); // 7-14 days
                var aptParts = aptDate.split('-');
                var fuDate = new Date(parseInt(aptParts[0]), parseInt(aptParts[1]) - 1, parseInt(aptParts[2]));
                fuDate.setDate(fuDate.getDate() + fuOffset);
                if (fuDate.getDay() === 0) fuDate.setDate(fuDate.getDate() + 1);
                var fuDateStr = toDateStr(fuDate);
                var fuIsPast = fuDateStr < today;

                // Find if there's a matching appointment around that date
                var matchingAptId = null;
                for (var mi = 0; mi < appointments.length; mi++) {
                    if (appointments[mi].patientId === pt.id && appointments[mi].date === fuDateStr) {
                        matchingAptId = appointments[mi].id;
                        break;
                    }
                }

                var fu = {
                    id: seedId(),
                    patientId: pt.id,
                    patientName: pt.name,
                    date: fuDateStr,
                    reason: 'Review after initial treatment - ' + sp.condition,
                    notes: 'Check progress, reassess ROM and pain levels, adjust treatment plan if needed',
                    status: fuIsPast ? 'Completed' : 'Pending',
                    createdAt: aptDate + 'T10:30:00.000Z'
                };
                if (matchingAptId) fu.appointmentId = matchingAptId;
                followups.push(fu);
            }
        }
    }

    // ---- Save all data ----
    setData('patients', patients);
    setData('appointments', appointments);
    setData('prescriptions', prescriptions);
    setData('followups', followups);
    localStorage.setItem('dataSeeded', 'true');

    // Refresh everything
    refreshDashboard();
    loadPatients();
    loadAppointments();
    loadPrescriptions();
    loadFollowups();
    renderCalendarView();
    loadAccountsBook();

    console.log('Seed complete: ' + patients.length + ' patients, ' + appointments.length + ' appointments, ' + prescriptions.length + ' prescriptions, ' + followups.length + ' follow-ups');
    showToast('Test data seeded! ' + patients.length + ' patients across Jan 6 - Feb 6, 2026.', 'success');
}
