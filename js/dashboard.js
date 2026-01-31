/* ============================================
   Dr. Aarti Physio Clinic - Doctor Dashboard
   ============================================ */

let dashMonth = new Date().getMonth();
let dashYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
  loadOverview();
  loadPatients();
  loadAppointments();
  loadPrescriptions();
  loadFollowups();
  renderDashCalendar();
});

// ===== TAB NAVIGATION =====
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

  const tab = document.getElementById(`tab-${tabName}`);
  if (tab) tab.style.display = 'block';

  const links = document.querySelectorAll('.sidebar-nav a');
  links.forEach(a => {
    if (a.getAttribute('onclick')?.includes(tabName)) {
      a.classList.add('active');
    }
  });

  // Refresh data
  if (tabName === 'overview') loadOverview();
  if (tabName === 'patients') loadPatients();
  if (tabName === 'appointments') loadAppointments();
  if (tabName === 'calendar') renderDashCalendar();
  if (tabName === 'prescriptions') loadPrescriptions();
  if (tabName === 'followups') loadFollowups();
}

// ===== OVERVIEW =====
function loadOverview() {
  const patients = getData('patients');
  const appointments = getData('appointments');
  const prescriptions = getData('prescriptions');
  const followups = getData('followups');

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const pendingFU = followups.filter(f => f.status === 'pending');

  document.getElementById('totalPatients').textContent = patients.length;
  document.getElementById('todayAppointments').textContent = todayAppts.length;
  document.getElementById('totalPrescriptions').textContent = prescriptions.length;
  document.getElementById('pendingFollowups').textContent = pendingFU.length;

  // Recent appointments
  const recent = [...appointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const tbody = document.getElementById('recentAppointmentsBody');
  if (!tbody) return;

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-light);padding:40px;">No appointments yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(a => `
    <tr>
      <td><strong>${a.patientName}</strong></td>
      <td>${formatDate(a.date)}</td>
      <td>${a.time}</td>
      <td>${a.service}</td>
      <td><span class="status-badge ${a.status}">${capitalize(a.status)}</span></td>
      <td>
        <button class="action-btn view" title="View" onclick="viewPatientById('${a.patientId}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit" title="Write Prescription" onclick="openPrescription('${a.patientId}')"><i class="fas fa-file-prescription"></i></button>
        <button class="action-btn whatsapp" title="WhatsApp" onclick="sendWhatsAppToPatient('${a.patientId}')"><i class="fab fa-whatsapp"></i></button>
      </td>
    </tr>
  `).join('');
}

// ===== PATIENTS =====
function loadPatients(filter = '') {
  const patients = getData('patients');
  const tbody = document.getElementById('patientsTableBody');
  if (!tbody) return;

  let filtered = patients;
  if (filter) {
    const q = filter.toLowerCase();
    filtered = patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:40px;">No patients found</td></tr>';
    return;
  }

  const appointments = getData('appointments');

  tbody.innerHTML = filtered.map(p => {
    const lastAppt = appointments
      .filter(a => a.patientId === p.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return `
      <tr>
        <td><code style="background:rgba(42,125,111,0.08);padding:2px 8px;border-radius:4px;font-size:0.8rem;">${p.id}</code></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.age} / ${p.gender}</td>
        <td>${p.phone}</td>
        <td>${lastAppt ? formatDate(lastAppt.date) : 'N/A'}</td>
        <td><span class="status-badge ${p.status || 'active'}">${capitalize(p.status || 'active')}</span></td>
        <td>
          <button class="action-btn view" title="View Details" onclick="viewPatientById('${p.id}')"><i class="fas fa-eye"></i></button>
          <button class="action-btn edit" title="Write Prescription" onclick="openPrescription('${p.id}')"><i class="fas fa-file-prescription"></i></button>
          <button class="action-btn whatsapp" title="WhatsApp" onclick="sendWhatsAppToPatient('${p.id}')"><i class="fab fa-whatsapp"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterPatients() {
  const q = document.getElementById('patientSearch')?.value || '';
  loadPatients(q);
}

function addPatientManual(e) {
  e.preventDefault();
  const patient = {
    id: generateId(),
    name: document.getElementById('mpName').value.trim(),
    age: document.getElementById('mpAge').value,
    gender: document.getElementById('mpGender').value,
    phone: document.getElementById('mpPhone').value.trim(),
    email: document.getElementById('mpEmail').value.trim(),
    address: document.getElementById('mpAddress').value.trim(),
    medicalHistory: document.getElementById('mpHistory').value.trim(),
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  const patients = getData('patients');
  patients.push(patient);
  setData('patients', patients);

  closeModal('addPatientModal');
  loadPatients();
  loadOverview();
  showToast(`Patient ${patient.name} added successfully!`, 'success');

  // Reset form
  e.target.reset();
}

function viewPatientById(patientId) {
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);
  if (!patient) { showToast('Patient not found', 'error'); return; }

  const appointments = getData('appointments').filter(a => a.patientId === patientId);
  const prescriptions = getData('prescriptions').filter(p => p.patientId === patientId);
  const followups = getData('followups').filter(f => f.patientId === patientId);

  const content = document.getElementById('patientDetailContent');
  if (!content) return;

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
      <div style="background:var(--light);padding:16px;border-radius:8px;">
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:4px;">Patient ID</div>
        <div style="font-weight:600;">${patient.id}</div>
      </div>
      <div style="background:var(--light);padding:16px;border-radius:8px;">
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:4px;">Name</div>
        <div style="font-weight:600;">${patient.name}</div>
      </div>
      <div style="background:var(--light);padding:16px;border-radius:8px;">
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:4px;">Age / Gender</div>
        <div style="font-weight:600;">${patient.age} / ${patient.gender}</div>
      </div>
      <div style="background:var(--light);padding:16px;border-radius:8px;">
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:4px;">Phone</div>
        <div style="font-weight:600;"><a href="tel:${patient.phone}" style="color:var(--primary);">${patient.phone}</a></div>
      </div>
      ${patient.email ? `<div style="background:var(--light);padding:16px;border-radius:8px;grid-column:span 2;">
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:4px;">Email</div>
        <div style="font-weight:600;">${patient.email}</div>
      </div>` : ''}
      ${patient.address ? `<div style="background:var(--light);padding:16px;border-radius:8px;grid-column:span 2;">
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:4px;">Address</div>
        <div style="font-weight:600;">${patient.address}</div>
      </div>` : ''}
      ${patient.medicalHistory ? `<div style="background:var(--light);padding:16px;border-radius:8px;grid-column:span 2;">
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:4px;">Medical History</div>
        <div style="font-weight:600;">${patient.medicalHistory}</div>
      </div>` : ''}
    </div>

    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <button class="btn btn-primary" onclick="closeModal('viewPatientModal');openPrescription('${patient.id}')" style="padding:10px 20px;font-size:0.85rem;">
        <i class="fas fa-file-prescription"></i> Write Prescription
      </button>
      <button class="btn btn-outline" onclick="closeModal('viewPatientModal');openFollowup('${patient.id}')" style="padding:10px 20px;font-size:0.85rem;">
        <i class="fas fa-redo"></i> Schedule Follow-up
      </button>
      <button class="btn btn-whatsapp" onclick="sendWhatsAppToPatient('${patient.id}')" style="padding:10px 20px;font-size:0.85rem;">
        <i class="fab fa-whatsapp"></i> WhatsApp
      </button>
    </div>

    ${appointments.length > 0 ? `
      <h4 style="font-family:'DM Sans',sans-serif;margin-bottom:12px;">Appointment History</h4>
      <div style="margin-bottom:20px;">
        ${appointments.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--light);border-radius:8px;margin-bottom:8px;">
            <div style="width:40px;height:40px;border-radius:8px;background:rgba(42,125,111,0.1);display:flex;align-items:center;justify-content:center;color:var(--primary);"><i class="fas fa-calendar"></i></div>
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.9rem;">${formatDate(a.date)} at ${a.time}</div>
              <div style="font-size:0.82rem;color:var(--text-light);">${a.service} - ${a.complaint || 'N/A'}</div>
            </div>
            <span class="status-badge ${a.status}">${capitalize(a.status)}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${prescriptions.length > 0 ? `
      <h4 style="font-family:'DM Sans',sans-serif;margin-bottom:12px;">Prescriptions</h4>
      <div style="margin-bottom:20px;">
        ${prescriptions.sort((a,b) => new Date(b.date) - new Date(a.date)).map(rx => `
          <div style="padding:12px;background:var(--light);border-radius:8px;margin-bottom:8px;">
            <div style="font-weight:600;font-size:0.9rem;">${formatDate(rx.date)}</div>
            <div style="font-size:0.85rem;color:var(--text-light);margin-top:4px;"><strong>Diagnosis:</strong> ${rx.diagnosis}</div>
            <div style="font-size:0.85rem;color:var(--text-light);"><strong>Treatment:</strong> ${rx.treatment}</div>
            ${rx.medications ? `<div style="font-size:0.85rem;color:var(--text-light);"><strong>Medications:</strong> ${rx.medications}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${followups.length > 0 ? `
      <h4 style="font-family:'DM Sans',sans-serif;margin-bottom:12px;">Follow-ups</h4>
      <div>
        ${followups.sort((a,b) => new Date(b.date) - new Date(a.date)).map(f => `
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--light);border-radius:8px;margin-bottom:8px;">
            <div style="width:40px;height:40px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center;color:#22C55E;"><i class="fas fa-redo"></i></div>
            <div style="flex:1;">
              <div style="font-weight:600;font-size:0.9rem;">${formatDate(f.date)} ${f.time ? 'at ' + f.time : ''}</div>
              <div style="font-size:0.82rem;color:var(--text-light);">${f.notes}</div>
            </div>
            <span class="status-badge ${f.status}">${capitalize(f.status)}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  openModal('viewPatientModal');
}

// ===== APPOINTMENTS =====
function loadAppointments(filter = 'all') {
  const appointments = getData('appointments');
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  const today = new Date().toISOString().split('T')[0];
  let filtered = appointments;

  if (filter === 'today') filtered = appointments.filter(a => a.date === today);
  else if (filter === 'upcoming') filtered = appointments.filter(a => a.date >= today && a.status !== 'completed');
  else if (filter === 'completed') filtered = appointments.filter(a => a.status === 'completed');

  filtered.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:40px;">No appointments found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(a => `
    <tr>
      <td><strong>${a.patientName}</strong></td>
      <td>${a.patientPhone}</td>
      <td>${formatDate(a.date)}</td>
      <td>${a.time}</td>
      <td>${a.service}</td>
      <td>
        <select onchange="updateAppointmentStatus('${a.id}', this.value)" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem;font-family:'DM Sans',sans-serif;">
          <option value="pending" ${a.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="active" ${a.status === 'active' ? 'selected' : ''}>Confirmed</option>
          <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="action-btn view" title="View Patient" onclick="viewPatientById('${a.patientId}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit" title="Prescription" onclick="openPrescription('${a.patientId}')"><i class="fas fa-file-prescription"></i></button>
        <button class="action-btn whatsapp" title="WhatsApp" onclick="sendAppointmentWhatsApp('${a.id}')"><i class="fab fa-whatsapp"></i></button>
      </td>
    </tr>
  `).join('');
}

function filterAppointments() {
  const filter = document.getElementById('appointmentFilter')?.value || 'all';
  loadAppointments(filter);
}

function updateAppointmentStatus(apptId, status) {
  const appointments = getData('appointments');
  const idx = appointments.findIndex(a => a.id === apptId);
  if (idx >= 0) {
    appointments[idx].status = status;
    setData('appointments', appointments);
    showToast(`Appointment status updated to ${status}`, 'success');
    loadOverview();
  }
}

function sendAppointmentWhatsApp(apptId) {
  const appointments = getData('appointments');
  const appt = appointments.find(a => a.id === apptId);
  if (!appt) return;

  const msg = `Dear ${appt.patientName},\n\nThis is a reminder from Dr. Aarti Physio Clinic.\n\nYour appointment details:\nDate: ${formatDateFull(appt.date)}\nTime: ${appt.time}\nService: ${appt.service}\n\nClinic Address: Bus Stop, No.454, LIC Siva Complex, Vannakoil, Periyanaickenpalayam, Tamil Nadu 641047\n\nFor queries: +91 98432 22137\n\nThank you!`;

  openWhatsApp(appt.patientPhone, msg);
}

// ===== DASHBOARD CALENDAR =====
function renderDashCalendar() {
  const grid = document.getElementById('dashCalendarGrid');
  const monthYear = document.getElementById('dashCalendarMonthYear');
  if (!grid || !monthYear) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  monthYear.textContent = `${months[dashMonth]} ${dashYear}`;

  const firstDay = new Date(dashYear, dashMonth, 1).getDay();
  const daysInMonth = new Date(dashYear, dashMonth + 1, 0).getDate();
  const today = new Date();
  const appointments = getData('appointments');

  let html = '';

  for (let i = 0; i < firstDay; i++) {
    html += '<button class="calendar-day empty" disabled></button>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(dashYear, dashMonth, day);
    const dateStr = `${dashYear}-${String(dashMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isCurrentDay = date.toDateString() === today.toDateString();
    const dayAppts = appointments.filter(a => a.date === dateStr);
    const hasAppts = dayAppts.length > 0;

    let classes = 'calendar-day';
    if (isCurrentDay) classes += ' today';

    html += `<button class="${classes}" onclick="showDayAppointments('${dateStr}')" style="position:relative;">
      ${day}
      ${hasAppts ? `<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:6px;height:6px;border-radius:50%;background:var(--primary);"></span>` : ''}
    </button>`;
  }

  grid.innerHTML = html;
}

function changeDashMonth(dir) {
  dashMonth += dir;
  if (dashMonth > 11) { dashMonth = 0; dashYear++; }
  if (dashMonth < 0) { dashMonth = 11; dashYear--; }
  renderDashCalendar();
}

function showDayAppointments(dateStr) {
  const section = document.getElementById('dayAppointments');
  const dateLabel = document.getElementById('dayAppointmentsDate');
  const list = document.getElementById('dayAppointmentsList');
  if (!section || !list) return;

  const appointments = getData('appointments').filter(a => a.date === dateStr);
  dateLabel.textContent = formatDateFull(dateStr);
  section.style.display = 'block';

  if (appointments.length === 0) {
    list.innerHTML = '<p style="color:var(--text-light);padding:20px;text-align:center;">No appointments on this day</p>';
    return;
  }

  list.innerHTML = appointments.sort((a, b) => a.time.localeCompare(b.time)).map(a => `
    <div style="display:flex;align-items:center;gap:16px;padding:16px;background:var(--light);border-radius:12px;margin-bottom:8px;">
      <div style="width:48px;height:48px;border-radius:12px;background:rgba(42,125,111,0.1);display:flex;align-items:center;justify-content:center;color:var(--primary);font-weight:700;">${a.time.split(' ')[0]}</div>
      <div style="flex:1;">
        <div style="font-weight:600;">${a.patientName}</div>
        <div style="font-size:0.85rem;color:var(--text-light);">${a.service}</div>
      </div>
      <span class="status-badge ${a.status}">${capitalize(a.status)}</span>
      <div>
        <button class="action-btn view" onclick="viewPatientById('${a.patientId}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn whatsapp" onclick="sendAppointmentWhatsApp('${a.id}')"><i class="fab fa-whatsapp"></i></button>
      </div>
    </div>
  `).join('');
}

// ===== PRESCRIPTIONS =====
function openPrescription(patientId) {
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);
  if (!patient) { showToast('Patient not found', 'error'); return; }

  document.getElementById('rxPatientId').value = patientId;
  document.getElementById('rxPatientName').value = patient.name;
  document.getElementById('rxDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('rxDiagnosis').value = '';
  document.getElementById('rxTreatment').value = '';
  document.getElementById('rxMedications').value = '';
  document.getElementById('rxInstructions').value = '';
  document.getElementById('rxFollowupDate').value = '';
  document.getElementById('rxFollowupNotes').value = '';

  openModal('prescriptionModal');
}

function savePrescription(e) {
  if (e) e.preventDefault();

  const patientId = document.getElementById('rxPatientId').value;
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);

  const prescription = {
    id: 'RX' + Date.now().toString(36).toUpperCase(),
    patientId,
    patientName: patient?.name || 'Unknown',
    patientPhone: patient?.phone || '',
    date: document.getElementById('rxDate').value,
    diagnosis: document.getElementById('rxDiagnosis').value.trim(),
    treatment: document.getElementById('rxTreatment').value.trim(),
    medications: document.getElementById('rxMedications').value.trim(),
    instructions: document.getElementById('rxInstructions').value.trim(),
    createdAt: new Date().toISOString()
  };

  const prescriptions = getData('prescriptions');
  prescriptions.push(prescription);
  setData('prescriptions', prescriptions);

  // Handle follow-up if date provided
  const fuDate = document.getElementById('rxFollowupDate').value;
  if (fuDate) {
    const followup = {
      id: 'FU' + Date.now().toString(36).toUpperCase(),
      patientId,
      patientName: patient?.name || 'Unknown',
      patientPhone: patient?.phone || '',
      date: fuDate,
      time: '',
      notes: document.getElementById('rxFollowupNotes').value.trim() || 'Follow-up visit',
      prescriptionId: prescription.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const followups = getData('followups');
    followups.push(followup);
    setData('followups', followups);
  }

  closeModal('prescriptionModal');
  loadPrescriptions();
  loadFollowups();
  loadOverview();
  showToast('Prescription saved successfully!', 'success');

  return prescription;
}

function savePrescriptionAndWhatsApp() {
  const patientId = document.getElementById('rxPatientId').value;
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;

  const rx = savePrescription();
  if (!rx) return;

  const fuDate = document.getElementById('rxFollowupDate').value;
  let msg = `Dear ${patient.name},\n\nPrescription from Dr. Aarti Physio Clinic:\n\nDate: ${formatDate(rx.date)}\nDiagnosis: ${rx.diagnosis}\nTreatment Plan: ${rx.treatment}`;

  if (rx.medications) msg += `\nMedications: ${rx.medications}`;
  if (rx.instructions) msg += `\nInstructions: ${rx.instructions}`;
  if (fuDate) msg += `\n\nFollow-up Date: ${formatDate(fuDate)}`;

  msg += `\n\nFor queries: +91 98432 22137\nDr. Aarti Physio Clinic, Periyanaickenpalayam`;

  openWhatsApp(patient.phone, msg);
}

function loadPrescriptions(filter = '') {
  const prescriptions = getData('prescriptions');
  const tbody = document.getElementById('prescriptionsTableBody');
  if (!tbody) return;

  let filtered = prescriptions;
  if (filter) {
    const q = filter.toLowerCase();
    filtered = prescriptions.filter(rx =>
      rx.patientName.toLowerCase().includes(q) ||
      rx.diagnosis.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:40px;">No prescriptions found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(rx => `
    <tr>
      <td>${formatDate(rx.date)}</td>
      <td><strong>${rx.patientName}</strong></td>
      <td>${rx.diagnosis.substring(0, 50)}${rx.diagnosis.length > 50 ? '...' : ''}</td>
      <td>${rx.treatment.substring(0, 50)}${rx.treatment.length > 50 ? '...' : ''}</td>
      <td>
        <button class="action-btn view" title="View Patient" onclick="viewPatientById('${rx.patientId}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn whatsapp" title="Send via WhatsApp" onclick="sendPrescriptionWhatsApp('${rx.id}')"><i class="fab fa-whatsapp"></i></button>
      </td>
    </tr>
  `).join('');
}

function filterPrescriptions() {
  const q = document.getElementById('prescriptionSearch')?.value || '';
  loadPrescriptions(q);
}

function sendPrescriptionWhatsApp(rxId) {
  const prescriptions = getData('prescriptions');
  const rx = prescriptions.find(r => r.id === rxId);
  if (!rx) return;

  const msg = `Dear ${rx.patientName},\n\nPrescription from Dr. Aarti Physio Clinic:\n\nDate: ${formatDate(rx.date)}\nDiagnosis: ${rx.diagnosis}\nTreatment Plan: ${rx.treatment}${rx.medications ? '\nMedications: ' + rx.medications : ''}${rx.instructions ? '\nInstructions: ' + rx.instructions : ''}\n\nFor queries: +91 98432 22137\nDr. Aarti Physio Clinic, Periyanaickenpalayam`;

  openWhatsApp(rx.patientPhone, msg);
}

// ===== FOLLOW-UPS =====
function openFollowup(patientId) {
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);
  if (!patient) { showToast('Patient not found', 'error'); return; }

  document.getElementById('fuPatientId').value = patientId;
  document.getElementById('fuPatientName').value = patient.name;
  document.getElementById('fuDate').value = '';
  document.getElementById('fuNotes').value = '';

  openModal('followupModal');
}

function saveFollowup(e) {
  if (e) e.preventDefault();

  const patientId = document.getElementById('fuPatientId').value;
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);

  const followup = {
    id: 'FU' + Date.now().toString(36).toUpperCase(),
    patientId,
    patientName: patient?.name || 'Unknown',
    patientPhone: patient?.phone || '',
    date: document.getElementById('fuDate').value,
    time: document.getElementById('fuTime').value,
    notes: document.getElementById('fuNotes').value.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const followups = getData('followups');
  followups.push(followup);
  setData('followups', followups);

  // Also create an appointment for the follow-up
  const appointments = getData('appointments');
  appointments.push({
    id: 'A' + Date.now().toString(36).toUpperCase(),
    patientId,
    patientName: patient?.name || 'Unknown',
    patientPhone: patient?.phone || '',
    date: followup.date,
    time: followup.time,
    service: 'Follow-up Visit',
    complaint: followup.notes,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  setData('appointments', appointments);

  closeModal('followupModal');
  loadFollowups();
  loadAppointments();
  loadOverview();
  renderDashCalendar();
  showToast('Follow-up scheduled successfully!', 'success');

  return followup;
}

function saveFollowupAndWhatsApp() {
  const patientId = document.getElementById('fuPatientId').value;
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return;

  const fu = saveFollowup();
  if (!fu) return;

  const msg = `Dear ${patient.name},\n\nThis is a reminder from Dr. Aarti Physio Clinic.\n\nYour follow-up visit is scheduled:\nDate: ${formatDateFull(fu.date)}${fu.time ? '\nTime: ' + fu.time : ''}\nReason: ${fu.notes}\n\nClinic Address: Bus Stop, No.454, LIC Siva Complex, Vannakoil, Periyanaickenpalayam, Tamil Nadu 641047\n\nFor queries: +91 98432 22137\n\nThank you!`;

  openWhatsApp(patient.phone, msg);
}

function loadFollowups(filter = 'pending') {
  const followups = getData('followups');
  const tbody = document.getElementById('followupsTableBody');
  if (!tbody) return;

  let filtered = followups;
  if (filter === 'pending') filtered = followups.filter(f => f.status === 'pending');
  else if (filter === 'completed') filtered = followups.filter(f => f.status === 'completed');

  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:40px;">No follow-ups found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(f => `
    <tr>
      <td><strong>${f.patientName}</strong></td>
      <td>${formatDate(f.date)} ${f.time ? 'at ' + f.time : ''}</td>
      <td>${f.notes}</td>
      <td>
        <select onchange="updateFollowupStatus('${f.id}', this.value)" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem;font-family:'DM Sans',sans-serif;">
          <option value="pending" ${f.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="completed" ${f.status === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
      </td>
      <td>
        <button class="action-btn view" title="View Patient" onclick="viewPatientById('${f.patientId}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn whatsapp" title="Remind via WhatsApp" onclick="sendFollowupReminder('${f.id}')"><i class="fab fa-whatsapp"></i></button>
      </td>
    </tr>
  `).join('');
}

function filterFollowups() {
  const filter = document.getElementById('followupFilter')?.value || 'pending';
  loadFollowups(filter);
}

function updateFollowupStatus(fuId, status) {
  const followups = getData('followups');
  const idx = followups.findIndex(f => f.id === fuId);
  if (idx >= 0) {
    followups[idx].status = status;
    setData('followups', followups);
    showToast(`Follow-up marked as ${status}`, 'success');
    loadFollowups();
    loadOverview();
  }
}

function sendFollowupReminder(fuId) {
  const followups = getData('followups');
  const fu = followups.find(f => f.id === fuId);
  if (!fu) return;

  const msg = `Dear ${fu.patientName},\n\nGentle reminder from Dr. Aarti Physio Clinic.\n\nYour follow-up visit is scheduled:\nDate: ${formatDateFull(fu.date)}${fu.time ? '\nTime: ' + fu.time : ''}\nReason: ${fu.notes}\n\nClinic: Bus Stop, No.454, LIC Siva Complex, Vannakoil, Periyanaickenpalayam, TN 641047\nPhone: +91 98432 22137\n\nSee you soon!`;

  openWhatsApp(fu.patientPhone, msg);
}

// ===== WHATSAPP HELPER =====
function sendWhatsAppToPatient(patientId) {
  const patients = getData('patients');
  const patient = patients.find(p => p.id === patientId);
  if (!patient) { showToast('Patient not found', 'error'); return; }

  const msg = `Hello ${patient.name},\n\nThis is Dr. Aarti from Dr. Aarti Physio Clinic, Periyanaickenpalayam.\n\nHow are you feeling? Please let us know if you need any assistance.\n\nContact: +91 98432 22137`;

  openWhatsApp(patient.phone, msg);
}

// ===== UTILITY =====
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
