/* ============================================
   Shree Physiotherapy Clinic - Doctor Dashboard
   Phone: 822004084, 9092294466
   WhatsApp: 919092294466
   ============================================ */

/* ---- Dashboard Calendar State ---- */
let currentDashMonth = new Date().getMonth();
let currentDashYear = new Date().getFullYear();

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
  const tabMap = ['overview', 'patients', 'appointments', 'calendar', 'prescriptions', 'followups'];
  const index = tabMap.indexOf(tabName);
  if (index >= 0 && links[index]) {
    links[index].classList.add('active');
  }

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
      renderDashCalendar();
      break;
    case 'prescriptions':
      loadPrescriptions();
      break;
    case 'followups':
      loadFollowups();
      break;
  }
}

/* ============================================
   2. DASHBOARD STATS
   ============================================ */
function refreshDashboard() {
  const patients = getData('patients');
  const appointments = getData('appointments');
  const prescriptions = getData('prescriptions');
  const followups = getData('followups');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled');
  const pendingFollowups = followups.filter(f => f.status !== 'Completed');

  const elPatients = document.getElementById('statPatients');
  const elToday = document.getElementById('statToday');
  const elPrescriptions = document.getElementById('statPrescriptions');
  const elFollowups = document.getElementById('statFollowups');

  if (elPatients) elPatients.textContent = patients.length;
  if (elToday) elToday.textContent = todayAppointments.length;
  if (elPrescriptions) elPrescriptions.textContent = prescriptions.length;
  if (elFollowups) elFollowups.textContent = pendingFollowups.length;
}

/* ============================================
   3. PATIENTS
   ============================================ */
function loadPatients() {
  const patients = getData('patients');
  const appointments = getData('appointments');
  const tbody = document.querySelector('#patientsTable tbody');
  if (!tbody) return;

  if (patients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-light);">No patients found. Click "Add Patient" to get started.</td></tr>';
    return;
  }

  tbody.innerHTML = patients.map(p => {
    const visits = appointments.filter(a => a.patientId === p.id && a.status === 'Completed').length;
    return `<tr>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${visits}</td>
      <td>
        <button class="action-btn view" title="View" onclick="viewPatient('${p.id}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn delete" title="Delete" onclick="deletePatient('${p.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
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

  // Render patient details
  const detailsEl = document.getElementById('patientDetails');
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:var(--light); padding:20px; border-radius:var(--radius);">
        <div><strong>Name:</strong> ${escapeHtml(patient.name)}</div>
        <div><strong>Age:</strong> ${patient.age}</div>
        <div><strong>Gender:</strong> ${patient.gender}</div>
        <div><strong>Phone:</strong> ${escapeHtml(patient.phone)}</div>
        ${patient.email ? `<div><strong>Email:</strong> ${escapeHtml(patient.email)}</div>` : ''}
        ${patient.address ? `<div style="grid-column:1/-1;"><strong>Address:</strong> ${escapeHtml(patient.address)}</div>` : ''}
        <div><strong>Registered:</strong> ${formatDate(patient.createdAt)}</div>
      </div>
    `;
  }

  // Render visit history (appointments + prescriptions)
  const visitEl = document.getElementById('visitHistory');
  if (visitEl) {
    const appointments = getData('appointments').filter(a => a.patientId === id);
    const prescriptions = getData('prescriptions').filter(rx => rx.patientId === id);

    if (appointments.length === 0 && prescriptions.length === 0) {
      visitEl.innerHTML = '<p style="color:var(--text-light); font-size:0.9rem;">No visit history yet.</p>';
    } else {
      let html = '';
      if (appointments.length > 0) {
        html += '<p style="font-weight:600; font-size:0.88rem; margin-bottom:8px;">Appointments:</p>';
        html += '<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">';
        appointments.forEach(a => {
          const statusClass = a.status === 'Completed' ? 'completed' : a.status === 'Cancelled' ? '' : 'pending';
          html += `<div style="background:var(--light); padding:10px 14px; border-radius:8px; font-size:0.88rem; display:flex; justify-content:space-between; align-items:center;">
            <span>${formatDate(a.date)} at ${a.time} - ${escapeHtml(a.service || 'General')}</span>
            <span class="status-badge ${statusClass}">${a.status || 'Scheduled'}</span>
          </div>`;
        });
        html += '</div>';
      }
      if (prescriptions.length > 0) {
        html += '<p style="font-weight:600; font-size:0.88rem; margin-bottom:8px;">Prescriptions:</p>';
        html += '<div style="display:flex; flex-direction:column; gap:8px;">';
        prescriptions.forEach(rx => {
          html += `<div style="background:var(--light); padding:10px 14px; border-radius:8px; font-size:0.88rem;">
            ${formatDate(rx.date)} - ${escapeHtml(rx.diagnosis ? rx.diagnosis.substring(0, 80) : 'N/A')}${rx.diagnosis && rx.diagnosis.length > 80 ? '...' : ''}
          </div>`;
        });
        html += '</div>';
      }
      visitEl.innerHTML = html;
    }
  }

  // Wire up action buttons
  const btnRx = document.getElementById('btnWriteRx');
  const btnFu = document.getElementById('btnScheduleFu');
  const btnWa = document.getElementById('btnPatientWa');

  if (btnRx) {
    btnRx.onclick = function () {
      closeModal('viewPatientModal');
      writePrescription(id);
    };
  }
  if (btnFu) {
    btnFu.onclick = function () {
      closeModal('viewPatientModal');
      scheduleFollowup(id);
    };
  }
  if (btnWa) {
    btnWa.onclick = function () {
      openWhatsApp(patient.phone, `Hello ${patient.name}, this is Shree Physiotherapy Clinic. We hope you are doing well. Please reach us at 822004084 or 9092294466 for any queries.`);
    };
  }

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
   4. APPOINTMENTS
   ============================================ */
function loadAppointments() {
  const appointments = getData('appointments');
  const patients = getData('patients');
  const filterDate = document.getElementById('appointmentFilter') ? document.getElementById('appointmentFilter').value : '';
  const tbody = document.querySelector('#appointmentsTable tbody');
  if (!tbody) return;

  let filtered = appointments;
  if (filterDate) {
    filtered = appointments.filter(a => a.date === filterDate);
  }

  // Sort by date descending, then time
  filtered.sort((a, b) => {
    const dateCompare = (b.date || '').localeCompare(a.date || '');
    if (dateCompare !== 0) return dateCompare;
    return (a.time || '').localeCompare(b.time || '');
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-light);">No appointments found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    // Resolve patient name
    let patientName = a.patientName || a.name || 'Unknown';
    if (a.patientId) {
      const pt = patients.find(p => p.id === a.patientId);
      if (pt) patientName = pt.name;
    }

    const statusClass = a.status === 'Completed' ? 'completed' : a.status === 'Cancelled' ? '' : a.status === 'Confirmed' ? 'active' : 'pending';
    const statusLabel = a.status || 'Scheduled';
    const isActionable = statusLabel !== 'Completed' && statusLabel !== 'Cancelled';

    return `<tr>
      <td><strong>${escapeHtml(patientName)}</strong></td>
      <td>${formatDate(a.date)}</td>
      <td>${a.time || '-'}</td>
      <td>${escapeHtml(a.service || 'General')}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td>
        ${isActionable ? `
          <button class="action-btn view" title="Complete" onclick="updateAppointmentStatus('${a.id}','Completed')" style="background:rgba(34,197,94,0.1); color:#22C55E;"><i class="fas fa-check"></i></button>
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

  appointments[index].status = status;
  setData('appointments', appointments);

  // If completed, increment visit count concept (handled dynamically)
  loadAppointments();
  refreshDashboard();
  showToast(`Appointment ${status.toLowerCase()}.`, status === 'Completed' ? 'success' : 'info');
}

// Appointment date filter
document.addEventListener('DOMContentLoaded', () => {
  const filterInput = document.getElementById('appointmentFilter');
  if (filterInput) {
    filterInput.addEventListener('change', loadAppointments);
  }
});

/* ============================================
   5. DASHBOARD CALENDAR
   ============================================ */
function renderDashCalendar() {
  const grid = document.getElementById('dashCalendarGrid');
  const monthLabel = document.getElementById('dashCalendarMonth');
  if (!grid || !monthLabel) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  monthLabel.textContent = months[currentDashMonth] + ' ' + currentDashYear;

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
    if (!a.date) return;
    const d = new Date(a.date);
    if (d.getMonth() === currentDashMonth && d.getFullYear() === currentDashYear && a.status !== 'Cancelled') {
      const day = d.getDate();
      if (!appointmentDates[day]) appointmentDates[day] = 0;
      appointmentDates[day]++;
    }
  });

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = (day === todayDate && currentDashMonth === todayMonth && currentDashYear === todayYear);
    const todayCls = isToday ? ' today' : '';
    const hasAppts = appointmentDates[day] || 0;
    const dotHtml = hasAppts > 0 ? `<span style="display:block; width:6px; height:6px; border-radius:50%; background:var(--primary); margin:2px auto 0;"></span>` : '';
    const countBadge = hasAppts > 1 ? `<span style="font-size:0.65rem; color:var(--primary); display:block;">${hasAppts}</span>` : '';

    const dateStr = `${currentDashYear}-${String(currentDashMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    html += `<div class="calendar-day${todayCls}" onclick="filterAppointmentsByDate('${dateStr}')" style="flex-direction:column; cursor:pointer;">
      ${day}
      ${dotHtml}
      ${countBadge}
    </div>`;
  }

  grid.innerHTML = html;
}

function changeDashMonth(delta) {
  currentDashMonth += delta;
  if (currentDashMonth < 0) {
    currentDashMonth = 11;
    currentDashYear--;
  } else if (currentDashMonth > 11) {
    currentDashMonth = 0;
    currentDashYear++;
  }
  renderDashCalendar();
}

function filterAppointmentsByDate(dateStr) {
  // Switch to appointments tab and set filter
  const filterInput = document.getElementById('appointmentFilter');
  if (filterInput) {
    filterInput.value = dateStr;
  }
  switchTab('appointments');
}

/* ============================================
   6. PRESCRIPTIONS
   ============================================ */
function loadPrescriptions() {
  const prescriptions = getData('prescriptions');
  const patients = getData('patients');
  const tbody = document.querySelector('#prescriptionsTable tbody');
  if (!tbody) return;

  // Sort by date descending
  const sorted = [...prescriptions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:32px; color:var(--text-light);">No prescriptions yet.</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(rx => {
    let patientName = rx.patientName || 'Unknown';
    if (rx.patientId) {
      const pt = patients.find(p => p.id === rx.patientId);
      if (pt) patientName = pt.name;
    }

    const diagnosisPreview = rx.diagnosis ? (rx.diagnosis.length > 60 ? rx.diagnosis.substring(0, 60) + '...' : rx.diagnosis) : 'N/A';

    return `<tr>
      <td><strong>${escapeHtml(patientName)}</strong></td>
      <td>${formatDate(rx.date)}</td>
      <td>${escapeHtml(diagnosisPreview)}</td>
      <td>
        <button class="action-btn view" title="View" onclick="viewPrescription('${rx.id}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit" title="Print" onclick="printPrescription('${rx.id}')"><i class="fas fa-print"></i></button>
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
    createdAt: new Date().toISOString()
  };

  const prescriptions = getData('prescriptions');
  prescriptions.unshift(prescription);
  setData('prescriptions', prescriptions);

  // Optionally create follow-up if date is provided
  if (followupDate) {
    const followup = {
      id: generateId(),
      patientId,
      patientName: patient ? patient.name : 'Unknown',
      date: followupDate,
      reason: followupReason || 'Post-treatment follow-up',
      notes: 'Auto-created from prescription',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const followups = getData('followups');
    followups.unshift(followup);
    setData('followups', followups);
  }

  closeModal('prescriptionModal');
  loadPrescriptions();
  refreshDashboard();
  showToast('Prescription saved successfully!', 'success');
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
    <div style="background:var(--light); padding:24px; border-radius:var(--radius); margin-bottom:20px;">
      <div style="text-align:center; margin-bottom:16px; padding-bottom:16px; border-bottom:2px solid var(--border);">
        <h3 style="font-size:1.2rem; color:var(--primary);">Shree Physiotherapy Clinic</h3>
        <p style="font-size:0.82rem; color:var(--text-light);">Phone: 822004084 | 9092294466</p>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; font-size:0.9rem;">
        <div><strong>Patient:</strong> ${escapeHtml(patientName)}</div>
        <div><strong>Date:</strong> ${formatDate(rx.date)}</div>
        ${patientPhone ? `<div><strong>Phone:</strong> ${escapeHtml(patientPhone)}</div>` : ''}
      </div>
      <div style="margin-bottom:12px;">
        <strong style="color:var(--primary); font-size:0.85rem;">DIAGNOSIS:</strong>
        <p style="font-size:0.9rem; margin-top:4px;">${escapeHtml(rx.diagnosis || 'N/A')}</p>
      </div>
      <div style="margin-bottom:12px;">
        <strong style="color:var(--primary); font-size:0.85rem;">TREATMENT PLAN:</strong>
        <p style="font-size:0.9rem; margin-top:4px;">${escapeHtml(rx.treatment || 'N/A')}</p>
      </div>
      ${rx.medications ? `<div style="margin-bottom:12px;">
        <strong style="color:var(--primary); font-size:0.85rem;">MEDICATIONS:</strong>
        <p style="font-size:0.9rem; margin-top:4px;">${escapeHtml(rx.medications)}</p>
      </div>` : ''}
      ${rx.instructions ? `<div style="margin-bottom:12px;">
        <strong style="color:var(--primary); font-size:0.85rem;">INSTRUCTIONS:</strong>
        <p style="font-size:0.9rem; margin-top:4px;">${escapeHtml(rx.instructions)}</p>
      </div>` : ''}
    </div>
  `;

  // Reuse viewPatient modal structure
  const detailsEl = document.getElementById('patientDetails');
  const visitEl = document.getElementById('visitHistory');
  if (detailsEl) detailsEl.innerHTML = content;
  if (visitEl) visitEl.innerHTML = '';

  // Rebind buttons for this context
  const btnRx = document.getElementById('btnWriteRx');
  const btnFu = document.getElementById('btnScheduleFu');
  const btnWa = document.getElementById('btnPatientWa');

  if (btnRx) btnRx.style.display = 'none';
  if (btnFu) btnFu.style.display = 'none';
  if (btnWa) btnWa.style.display = 'none';

  // Change modal title
  const modalTitle = document.querySelector('#viewPatientModal .modal h2');
  if (modalTitle) modalTitle.textContent = 'Prescription Details';

  openModal('viewPatientModal');

  // Restore defaults when modal closes (using MutationObserver)
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
        .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #2A7D6F; margin-bottom: 24px; }
        .header h1 { font-size: 1.5rem; color: #2A7D6F; margin-bottom: 4px; }
        .header p { font-size: 0.85rem; color: #6B7280; }
        .patient-info { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E5E7EB; margin-bottom: 20px; font-size: 0.9rem; }
        .patient-info div { margin-right: 24px; }
        .section { margin-bottom: 18px; }
        .section-label { font-weight: 700; color: #2A7D6F; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
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
        <p>Dr. Aarti Ganesh, BPT, MPT<br>Shree Physiotherapy Clinic</p>
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
   7. FOLLOW-UPS
   ============================================ */
function loadFollowups() {
  const followups = getData('followups');
  const patients = getData('patients');
  const filterStatus = document.getElementById('followupFilter') ? document.getElementById('followupFilter').value : 'all';
  const tbody = document.querySelector('#followupsTable tbody');
  if (!tbody) return;

  let filtered = followups;
  if (filterStatus !== 'all') {
    filtered = followups.filter(f => f.status === filterStatus);
  }

  // Sort: pending first, then by date
  filtered.sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return (a.date || '').localeCompare(b.date || '');
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-light);">No follow-ups found.</td></tr>';
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

    const statusClass = f.status === 'Completed' ? 'completed' : 'pending';
    const isPending = f.status !== 'Completed';

    return `<tr>
      <td><strong>${escapeHtml(patientName)}</strong></td>
      <td>${formatDate(f.date)}</td>
      <td>${escapeHtml(f.reason || '-')}</td>
      <td><span class="status-badge ${statusClass}">${f.status || 'Pending'}</span></td>
      <td>
        ${isPending ? `
          <button class="action-btn view" title="Mark Done" onclick="markFollowupDone('${f.id}')" style="background:rgba(34,197,94,0.1); color:#22C55E;"><i class="fas fa-check"></i></button>
          <button class="action-btn whatsapp" title="WhatsApp Reminder" onclick="sendFollowupReminder('${f.id}')"><i class="fab fa-whatsapp"></i></button>
        ` : `<span style="color:var(--text-light); font-size:0.82rem;">Done</span>`}
      </td>
    </tr>`;
  }).join('');
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

  openModal('followupModal');
}

function saveFollowup(event) {
  event.preventDefault();

  const patientId = document.getElementById('fuPatientId').value;
  const date = document.getElementById('fuDate').value;
  const reason = document.getElementById('fuReason').value.trim();
  const notes = document.getElementById('fuNotes').value.trim();

  if (!date || !reason) {
    showToast('Please fill in date and reason.', 'error');
    return;
  }

  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);

  const followup = {
    id: generateId(),
    patientId,
    patientName: patient ? patient.name : 'Unknown',
    date,
    reason,
    notes,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  const followups = getData('followups');
  followups.unshift(followup);
  setData('followups', followups);

  // Optionally create an appointment for the follow-up date
  const appointment = {
    id: generateId(),
    patientId,
    patientName: patient ? patient.name : 'Unknown',
    name: patient ? patient.name : 'Unknown',
    phone: patient ? patient.phone : '',
    date,
    time: '10:00 AM',
    service: 'Follow-up: ' + reason,
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  };

  const appointments = getData('appointments');
  appointments.unshift(appointment);
  setData('appointments', appointments);

  closeModal('followupModal');
  loadFollowups();
  refreshDashboard();
  showToast('Follow-up scheduled and appointment created!', 'success');
}

function markFollowupDone(id) {
  const followups = getData('followups');
  const index = followups.findIndex(f => f.id === id);
  if (index === -1) return;

  followups[index].status = 'Completed';
  setData('followups', followups);

  loadFollowups();
  refreshDashboard();
  showToast('Follow-up marked as completed.', 'success');
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

  const message = `Hello ${patientName},\n\nThis is a reminder from Shree Physiotherapy Clinic about your upcoming follow-up appointment on ${formatDateFull(followup.date)}.\n\nReason: ${followup.reason}\n\nPlease confirm your visit. For any queries, call us at 822004084 or 9092294466.\n\nThank you,\nDr. Aarti Ganesh\nShree Physiotherapy Clinic`;

  openWhatsApp(phone, message);
}

// Follow-up filter
document.addEventListener('DOMContentLoaded', () => {
  const filterSelect = document.getElementById('followupFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', loadFollowups);
  }
});

/* ============================================
   UTILITY: HTML ESCAPE
   ============================================ */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ============================================
   8. DOMContentLoaded - INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  switchTab('overview');
  refreshDashboard();
  loadPatients();
  loadAppointments();
  loadPrescriptions();
  loadFollowups();
  renderDashCalendar();
});