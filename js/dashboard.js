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
   0. LOGIN
   ============================================ */
const DASHBOARD_PASSWORD = 'doctor123';

function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('loginError');
    const password = passwordInput ? passwordInput.value : '';

    if (password === DASHBOARD_PASSWORD) {
        sessionStorage.setItem('dashLoggedIn', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardApp').style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
        switchTab('overview');
    } else {
        if (errorEl) errorEl.style.display = 'block';
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

function checkSession() {
    if (sessionStorage.getItem('dashLoggedIn') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardApp').style.display = 'block';
        return true;
    }
    return false;
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
    const tabMap = ['overview', 'patients', 'appointments', 'calendar', 'prescriptions', 'followups', 'accounts', 'trash'];
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
            loadAppointments();
            break;
        case 'calendar':
            renderMiniCalendar();
            renderCalendlyView();
            break;
        case 'prescriptions':
            loadPrescriptions();
            break;
        case 'followups':
            loadFollowups();
            break;
        case 'accounts':
            loadAccountsBook();
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

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Today's appointments
    const todayAppointments = appointments.filter(a => {
        const aptDate = new Date(a.date).toISOString().split('T')[0];
        return aptDate === todayStr && a.status !== 'Cancelled';
    });

    // This week's appointments
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekAppointments = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= weekStart && aptDate <= weekEnd && a.status !== 'Cancelled';
    });

    // Pending follow-ups (including overdue)
    const pendingFollowups = followups.filter(f => f.status !== 'Completed');
    const overdueFollowups = pendingFollowups.filter(f => new Date(f.date) < today);

    // New patients this week
    const newPatientsThisWeek = patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd;
    });

    // Update stat cards
    const elPatients = document.getElementById('statPatients');
    const elToday = document.getElementById('statToday');
    const elWeek = document.getElementById('statWeek');
    const elPrescriptions = document.getElementById('statPrescriptions');
    const elFollowups = document.getElementById('statFollowups');
    const elNewPatients = document.getElementById('statNewPatients');

    if (elPatients) elPatients.textContent = patients.length;
    if (elToday) elToday.textContent = todayAppointments.length;
    if (elWeek) elWeek.textContent = weekAppointments.length;
    if (elPrescriptions) elPrescriptions.textContent = prescriptions.length;
    if (elFollowups) elFollowups.textContent = pendingFollowups.length;
    if (elNewPatients) elNewPatients.textContent = newPatientsThisWeek.length;

    // Update welcome message
    const welcomeDate = document.getElementById('welcomeDate');
    if (welcomeDate) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        welcomeDate.textContent = today.toLocaleDateString('en-IN', options);
    }

    // Update card badges
    const todayCount = document.getElementById('todayCount');
    const upcomingCount = document.getElementById('upcomingCount');
    if (todayCount) todayCount.textContent = todayAppointments.length;

    // Count upcoming (future appointments)
    const upcomingAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate > today && a.status !== 'Cancelled';
    });
    if (upcomingCount) upcomingCount.textContent = upcomingAppts.length;

    // Render today's timeline
    renderTodayTimeline(todayAppointments);

    // Render upcoming appointments
    renderUpcomingAppointments(appointments);

    // Render overdue follow-ups alert
    renderOverdueAlert(overdueFollowups);
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

    if (overdueFollowups.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <span><strong>${overdueFollowups.length}</strong> overdue follow-up${overdueFollowups.length > 1 ? 's' : ''} need attention</span>
            <button class="btn btn-sm" onclick="switchTab('followups')">View</button>
        </div>
    `;
}

/* ============================================
   3. PATIENTS - ENHANCED
   ============================================ */
function loadPatients() {
    const patients = getData('patients');
    const appointments = getData('appointments');
    const tbody = document.querySelector('#patientsTable tbody');
    if (!tbody) return;

    // Get filter values
    const dateFilter = document.getElementById('patientDateFilter')?.value || '';
    const genderFilter = document.getElementById('patientGenderFilter')?.value || '';

    // Filter patients
    let filteredPatients = patients;

    // Filter by gender
    if (genderFilter) {
        filteredPatients = filteredPatients.filter(p => p.gender === genderFilter);
    }

    // Filter by date (patients who had appointments on that date)
    if (dateFilter) {
        const patientIdsOnDate = new Set();
        appointments.forEach(a => {
            if (a.date && a.date.startsWith(dateFilter)) {
                patientIdsOnDate.add(a.patientId);
            }
        });
        filteredPatients = filteredPatients.filter(p => patientIdsOnDate.has(p.id));
    }

    if (filteredPatients.length === 0) {
        const filterActive = dateFilter || genderFilter;
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-light);">${filterActive ? 'No patients match the selected filters.' : 'No patients found. Click "Add Patient" to get started.'}</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredPatients.map(p => {
        const patientAppointments = appointments.filter(a => a.patientId === p.id);
        const completedVisits = patientAppointments.filter(a => a.status === 'Completed').length;
        const lastVisit = getLastVisit(patientAppointments);

        return `<tr>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td>${p.age || '-'}</td>
            <td>${p.gender || '-'}</td>
            <td>${escapeHtml(p.phone)}</td>
            <td>${completedVisits}</td>
            <td class="last-visit">${lastVisit}</td>
            <td>
                <button class="action-btn view" title="View" onclick="viewPatient('${p.id}')"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" title="Book Appointment" onclick="openQuickBooking('${p.id}')"><i class="fas fa-calendar-plus"></i></button>
                <button class="action-btn delete" title="Delete" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function filterPatients() {
    loadPatients();
}

function clearPatientFilters() {
    const dateFilter = document.getElementById('patientDateFilter');
    const genderFilter = document.getElementById('patientGenderFilter');
    if (dateFilter) dateFilter.value = '';
    if (genderFilter) genderFilter.value = '';
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
                        <button class="action-btn view" onclick="viewPrescription('${rx.id}')" title="View"><i class="fas fa-eye"></i></button>
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

    if (btnRx) {
        btnRx.onclick = function () {
            closeModal('viewPatientModal');
            writePrescription(id);
        };
        btnRx.style.display = '';
    }
    if (btnFu) {
        btnFu.onclick = function () {
            closeModal('viewPatientModal');
            scheduleFollowup(id);
        };
        btnFu.style.display = '';
    }
    if (btnWa) {
        btnWa.onclick = function () {
            openWhatsApp(patient.phone, `Hello ${patient.name}, this is Shree Physiotherapy Clinic. We hope you are doing well. Please reach us at 822004084 or 9092294466 for any queries.`);
        };
        btnWa.style.display = '';
    }
    if (btnBook) {
        btnBook.onclick = function () {
            closeModal('viewPatientModal');
            openQuickBooking(id);
        };
    }

    // Reset modal title
    const modalTitle = document.querySelector('#viewPatientModal .modal h2');
    if (modalTitle) modalTitle.textContent = 'Patient Details';

    openModal('viewPatientModal');
}

function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;

    let patients = getData('patients');
    patients = patients.filter(p => p.id !== id);
    setData('patients', patients);

    loadPatients();
    refreshDashboard();
    showToast('Patient deleted.', 'info');
}

// Patient search filter
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('patientSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll('#patientsTable tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }
});

/* ============================================
   4. APPOINTMENTS - ENHANCED
   ============================================ */
function loadAppointments() {
    const appointments = getData('appointments');
    const patients = getData('patients');
    const filterDate = document.getElementById('appointmentFilter') ? document.getElementById('appointmentFilter').value : '';
    const filterStatus = document.getElementById('appointmentStatusFilter') ? document.getElementById('appointmentStatusFilter').value : 'all';
    const tbody = document.querySelector('#appointmentsTable tbody');
    if (!tbody) return;

    let filtered = appointments;

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
            <td><strong>${escapeHtml(patientName)}</strong></td>
            <td>${formatDate(a.date)}</td>
            <td>
                <span class="time-range">${timeRange}</span>
                <span class="duration-badge">${duration} min</span>
            </td>
            <td>${escapeHtml(a.service || 'General')}</td>
            <td><span class="payment-badge ${paymentClass}">${paymentStatus}${a.amountPaid ? ` (${amountDisplay})` : ''}</span></td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            <td>
                ${isActionable ? `
                    <button class="action-btn" onclick="updateAppointmentStatus('${a.id}','Confirmed')" title="Confirm" style="background:rgba(27,77,62,0.1); color:var(--primary);"><i class="fas fa-thumbs-up"></i></button>
                    ${canComplete ? `
                        <button class="action-btn view" title="Complete Treatment" onclick="openTreatmentModal('${a.id}')" style="background:rgba(34,197,94,0.1); color:#22C55E;"><i class="fas fa-check"></i></button>
                    ` : `
                        <button class="action-btn" title="Cannot complete - appointment time not reached" style="background:rgba(156,163,175,0.1); color:#9CA3AF; cursor:not-allowed;" disabled><i class="fas fa-clock"></i></button>
                    `}
                    <button class="action-btn delete" title="Cancel" onclick="updateAppointmentStatus('${a.id}','Cancelled')"><i class="fas fa-times"></i></button>
                ` : `<span style="color:var(--text-light); font-size:0.82rem;">-</span>`}
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
    showToast(`Appointment ${status.toLowerCase()}.`, status === 'Completed' ? 'success' : 'info');
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

    const appointments = getData('appointments').filter(a => a.status !== 'Cancelled');
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

    // Get appointments for this month
    const appointments = getData('appointments');
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

    alert(`Appointment Details:\n\nPatient: ${patient ? patient.name : apt.patientName}\nDate: ${formatDate(apt.date)}\nTime: ${apt.time} - ${apt.endTime || ''}\nService: ${apt.service}\nStatus: ${apt.status}`);
}

/* ============================================
   6. PRESCRIPTIONS - ENHANCED
   ============================================ */
function loadPrescriptions() {
    const prescriptions = getData('prescriptions');
    const patients = getData('patients');
    const appointments = getData('appointments');
    const tbody = document.querySelector('#prescriptionsTable tbody');
    if (!tbody) return;

    // Sort by date descending
    const sorted = [...prescriptions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-light);">No prescriptions yet.</td></tr>';
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
                <button class="action-btn" title="Duplicate" onclick="duplicatePrescription('${rx.id}')" style="background:rgba(27,77,62,0.1);color:var(--primary);"><i class="fas fa-copy"></i></button>
            </td>
        </tr>`;
    }).join('');
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
        paymentStatus: paymentAmount && paymentMode ? 'Paid' : 'Pending',
        createdAt: new Date().toISOString()
    };

    const prescriptions = getData('prescriptions');
    prescriptions.unshift(prescription);
    setData('prescriptions', prescriptions);

    // Create follow-up if date is provided
    if (followupDate) {
        createFollowupWithAppointment(patientId, patient, followupDate, followupReason || 'Post-treatment follow-up');
    }

    closeModal('prescriptionModal');
    loadPrescriptions();
    refreshDashboard();
    showToast('Prescription saved' + (paymentAmount ? ` with ₹${paymentAmount} payment` : '') + '!', 'success');
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

    // Hide patient-specific buttons
    const btnRx = document.getElementById('btnWriteRx');
    const btnFu = document.getElementById('btnScheduleFu');
    const btnWa = document.getElementById('btnPatientWa');

    if (btnRx) btnRx.style.display = 'none';
    if (btnFu) btnFu.style.display = 'none';
    if (btnWa) btnWa.style.display = 'none';

    const modalTitle = document.querySelector('#viewPatientModal .modal h2');
    if (modalTitle) modalTitle.textContent = 'Prescription Details';

    openModal('viewPatientModal');

    // Restore on close
    const observer = new MutationObserver(() => {
        const modal = document.getElementById('viewPatientModal');
        if (modal && !modal.classList.contains('active')) {
            if (btnRx) btnRx.style.display = '';
            if (btnFu) btnFu.style.display = '';
            if (btnWa) btnWa.style.display = '';
            if (modalTitle) modalTitle.textContent = 'Patient Details';
            observer.disconnect();
        }
    });
    observer.observe(document.getElementById('viewPatientModal'), { attributes: true, attributeFilter: ['class'] });
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
    const filterStatus = document.getElementById('followupFilter') ? document.getElementById('followupFilter').value : 'all';
    const filterDate = document.getElementById('followupDateFilter') ? document.getElementById('followupDateFilter').value : '';
    const tbody = document.querySelector('#followupsTable tbody');
    if (!tbody) return;

    let filtered = followups;

    // Filter by status
    if (filterStatus !== 'all') {
        filtered = filtered.filter(f => f.status === filterStatus);
    }

    // Filter by date
    if (filterDate) {
        filtered = filtered.filter(f => f.date && f.date.startsWith(filterDate));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        const filterActive = filterStatus !== 'all' || filterDate;
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
                ${isPending ? `
                    <button class="action-btn view" title="Mark Done" onclick="markFollowupDone('${f.id}')" style="background:rgba(34,197,94,0.1); color:#22C55E;"><i class="fas fa-check"></i></button>
                    <button class="action-btn whatsapp" title="WhatsApp Reminder" onclick="sendFollowupReminder('${f.id}')"><i class="fab fa-whatsapp"></i></button>
                    <button class="action-btn edit" title="Book Appointment" onclick="bookFollowupAppointment('${f.id}')" style="background:rgba(200,149,108,0.15);color:var(--accent);"><i class="fas fa-calendar-plus"></i></button>
                ` : `<span style="color:var(--text-light); font-size:0.82rem;">Done</span>`}
            </td>
        </tr>`;
    }).join('');
}

function filterFollowups() {
    loadFollowups();
}

function clearFollowupFilters() {
    const dateFilter = document.getElementById('followupDateFilter');
    const statusFilter = document.getElementById('followupFilter');
    if (dateFilter) dateFilter.value = '';
    if (statusFilter) statusFilter.value = 'all';
    loadFollowups();
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
    const filterSelect = document.getElementById('followupFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', loadFollowups);
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

    const patientId = document.getElementById('qbPatientId').value;
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

    const appointments = getData('appointments');
    appointments.unshift(appointment);
    setData('appointments', appointments);

    closeModal('quickBookingModal');
    loadAppointments();
    refreshDashboard();
    renderCalendlyView();
    showToast('Appointment booked successfully!', 'success');
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
                <button class="action-btn delete" title="Delete Permanently" onclick="permanentDeletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function deletePatient(id) {
    if (!confirm('Move this patient to trash? You can restore them within 30 days.')) return;

    let patients = getData('patients');
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    // Move to trash
    let trash = getData('trash') || [];
    patient.deletedAt = new Date().toISOString();
    trash.unshift(patient);
    setData('trash', trash);

    // Remove from patients
    patients = patients.filter(p => p.id !== id);
    setData('patients', patients);

    loadPatients();
    refreshDashboard();
    showToast('Patient moved to trash. Will be permanently deleted after 30 days.', 'info');
}

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
    refreshDashboard();
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
                    <div class="schedule-appointment ${statusClass}" onclick="openTreatmentModal('${apt.id}')">
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
                    <div class="week-appointment" onclick="openTreatmentModal('${apt.id}')">
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

    if (elTotal) elTotal.textContent = todayAppts.length;
    if (elCompleted) elCompleted.textContent = completed;
    if (elRemaining) elRemaining.textContent = remaining;
    if (elRevenue) elRevenue.textContent = '₹' + todayRevenue.toLocaleString('en-IN');
}

/* ============================================
   11. TREATMENT COMPLETION & PAYMENT
   ============================================ */
let currentTreatmentAptId = null;

function openTreatmentModal(appointmentId) {
    const appointments = getData('appointments');
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

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
    renderCalendlyView();
    loadAppointments();
    refreshDashboard();
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

    // Calculate this month's totals for the header cards
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filter completed appointments for this month
    const monthAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= monthStart && aptDate <= monthEnd && a.status === 'Completed';
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

    // Include prescription payments
    prescriptions.filter(rx => {
        const rxDate = new Date(rx.date || rx.createdAt);
        return rxDate >= monthStart && rxDate <= monthEnd && rx.paymentAmount;
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

    // Filter for selected date
    const dayAppts = appointments.filter(a => a.date && a.date.startsWith(selectedDate));
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

    // Include prescriptions
    prescriptions.filter(rx => (rx.date || rx.createdAt || '').startsWith(selectedDate) && rx.paymentAmount).forEach(rx => {
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

        const dayAppts = appointments.filter(a => a.date && a.date.startsWith(dayStr));
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
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Update label
    const label = document.getElementById('monthlyReportLabel');
    if (label) {
        label.textContent = monthNames[monthStart.getMonth()] + ' ' + monthStart.getFullYear();
    }

    // Filter appointments
    const monthAppts = appointments.filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= monthStart && aptDate <= monthEnd;
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

document.addEventListener('DOMContentLoaded', () => {
    // Direct access - no login required
    switchTab('overview');

    // Initialize week start to current week
    currentWeekStart = getWeekStart(new Date());
    selectedCalendarDate = new Date();

    // Cleanup old trash items
    cleanupOldTrash();

    refreshDashboard();
    loadPatients();
    loadAppointments();
    loadPrescriptions();
    loadFollowups();
    renderCalendarView();
});
