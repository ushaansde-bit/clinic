/* ============================================
   Dr. Aarti Physio Clinic - Booking Calendar
   ============================================ */

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM'
];

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
});

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const monthYear = document.getElementById('calendarMonthYear');
  if (!grid || !monthYear) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  monthYear.textContent = `${months[currentMonth]} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<button class="calendar-day empty" disabled></button>';
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = formatDateISO(date);
    const isPast = date < today;
    const isSunday = date.getDay() === 0;
    const isCurrentDay = date.toDateString() === today.toDateString();
    const isSelected = selectedDate === dateStr;

    let classes = 'calendar-day';
    if (isPast) classes += ' disabled';
    if (isSunday && !isCurrentDay) classes += ' disabled';
    if (isCurrentDay) classes += ' today';
    if (isSelected) classes += ' selected';

    const disabled = isPast || (isSunday && !isCurrentDay);

    html += `<button class="${classes}" ${disabled ? 'disabled' : ''} onclick="selectDate('${dateStr}', this)">${day}</button>`;
  }

  grid.innerHTML = html;
}

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
}

function selectDate(dateStr, el) {
  selectedDate = dateStr;
  selectedTime = null;

  // Update calendar UI
  document.querySelectorAll('#calendarGrid .calendar-day').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');

  // Show time slots
  const slotsSection = document.getElementById('timeSlotsSection');
  const dateText = document.getElementById('selectedDateText');
  if (slotsSection) slotsSection.style.display = 'block';
  if (dateText) dateText.textContent = formatDate(dateStr);

  renderTimeSlots(dateStr);
  updateBookingSummary();
}

function renderTimeSlots(dateStr) {
  const grid = document.getElementById('timeSlotsGrid');
  if (!grid) return;

  // Get booked slots for this date
  const appointments = getData('appointments');
  const bookedSlots = appointments
    .filter(a => a.date === dateStr && a.status !== 'cancelled')
    .map(a => a.time);

  let html = '';
  TIME_SLOTS.forEach(slot => {
    const isBooked = bookedSlots.includes(slot);
    html += `<button class="time-slot ${isBooked ? 'booked' : ''}"
      ${isBooked ? 'disabled' : ''}
      onclick="selectTime('${slot}', this)">
      ${slot}${isBooked ? ' (Booked)' : ''}
    </button>`;
  });

  grid.innerHTML = html;
}

function selectTime(time, el) {
  selectedTime = time;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  updateBookingSummary();
}

function updateBookingSummary() {
  const summary = document.getElementById('bookingSummary');
  const dateEl = document.getElementById('summaryDate');
  const timeEl = document.getElementById('summaryTime');
  const submitBtn = document.getElementById('submitBtn');

  if (selectedDate && selectedTime) {
    if (summary) summary.style.display = 'block';
    if (dateEl) dateEl.textContent = formatDateFull(selectedDate);
    if (timeEl) timeEl.textContent = selectedTime;
    if (submitBtn) submitBtn.disabled = false;
  } else {
    if (summary) summary.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;
  }
}

function submitBooking(e) {
  e.preventDefault();

  if (!selectedDate || !selectedTime) {
    showToast('Please select a date and time slot.', 'error');
    return;
  }

  const name = document.getElementById('patientName').value.trim();
  const age = document.getElementById('patientAge').value;
  const gender = document.getElementById('patientGender').value;
  const phone = document.getElementById('patientPhone').value.trim();
  const email = document.getElementById('patientEmail').value.trim();
  const address = document.getElementById('patientAddress').value.trim();
  const service = document.getElementById('serviceType').value;
  const complaint = document.getElementById('patientComplaint').value.trim();
  const history = document.getElementById('medicalHistory').value.trim();

  // Create or find patient record
  let patients = getData('patients');
  let patient = patients.find(p => p.phone === phone);

  if (!patient) {
    patient = {
      id: generateId(),
      name,
      age,
      gender,
      phone,
      email,
      address,
      medicalHistory: history,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    patients.push(patient);
    setData('patients', patients);
  }

  // Create appointment
  const appointments = getData('appointments');
  const appointment = {
    id: 'A' + Date.now().toString(36).toUpperCase(),
    patientId: patient.id,
    patientName: name,
    patientPhone: phone,
    date: selectedDate,
    time: selectedTime,
    service,
    complaint,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  appointments.push(appointment);
  setData('appointments', appointments);

  // Show confirmation
  document.getElementById('confName').textContent = name;
  document.getElementById('confDate').textContent = formatDateFull(selectedDate);
  document.getElementById('confTime').textContent = selectedTime;
  document.getElementById('confService').textContent = service;

  const whatsappMsg = `Hello Dr. Aarti,\n\nI have booked an appointment:\n\nName: ${name}\nDate: ${formatDateFull(selectedDate)}\nTime: ${selectedTime}\nService: ${service}\nComplaint: ${complaint}\n\nPlease confirm my appointment. Thank you!`;

  const cleanPhone = '919843222137';
  document.getElementById('whatsappConfirmLink').href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  openModal('confirmationModal');
  showToast('Appointment booked successfully!', 'success');

  // Reset form
  document.getElementById('bookingForm').reset();
  selectedDate = null;
  selectedTime = null;
  document.getElementById('timeSlotsSection').style.display = 'none';
  document.getElementById('bookingSummary').style.display = 'none';
  document.getElementById('submitBtn').disabled = true;
  renderCalendar();
}
