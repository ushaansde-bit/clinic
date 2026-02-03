/* ============================================
   Shree Physiotherapy Clinic - Booking System
   Simple slot-based booking with separate duration
   ============================================ */

// --- Global State ---
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;
let selectedDuration = 15; // Fixed 15-minute appointments for patients

// --- Clinic Configuration ---
const CLINIC_CONFIG = {
    morningStart: { hour: 10, minute: 0 },
    morningEnd: { hour: 13, minute: 30 },
    eveningStart: { hour: 18, minute: 0 },
    eveningEnd: { hour: 20, minute: 30 }
};

// --- Get current time in India (IST) ---
function getIndiaTime() {
    const now = new Date();
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60; // 5 hours 30 minutes in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (istOffset * 60000));
    return istTime;
}

// --- Get current time in minutes (IST) ---
function getCurrentTimeInMinutes() {
    const ist = getIndiaTime();
    return ist.getHours() * 60 + ist.getMinutes();
}

// --- Check if selected date is today ---
function isToday(date) {
    const ist = getIndiaTime();
    const today = new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return today.getTime() === checkDate.getTime();
}

// Service-based default durations
const SERVICE_DURATIONS = {
    'General Consultation': 15,
    'Fascial Manipulation': 45,
    'Orthopedic Rehabilitation': 60,
    'Neuro Rehabilitation': 60,
    'Women\'s Health Physio': 45,
    'Elderly Home Care': 60,
    'Pediatric Physiotherapy': 45,
    'Follow-up': 30
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    setupDurationSelector();
    setupServiceChangeHandler();

    // Fixed 15-minute duration for patient bookings
    selectedDuration = 15;

    // Auto-select today's date (unless it's Sunday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today.getDay() !== 0) { // 0 = Sunday, clinic is closed
        selectDate(today.getFullYear(), today.getMonth(), today.getDate());
    }
});

// --- Duration Selector Setup (Fixed at 15 minutes for patients) ---
function setupDurationSelector() {
    // Duration is fixed at 15 minutes for patient bookings
    selectedDuration = 15;
    const durationInput = document.getElementById('appointmentDuration');
    if (durationInput) {
        durationInput.value = '15';
    }
}

// --- Service Change Handler (Duration remains fixed for patient booking) ---
function setupServiceChangeHandler() {
    // Service selection no longer affects duration for patient bookings
    // Duration is fixed at 15 minutes
    const serviceSelect = document.getElementById('serviceType');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            // Duration stays fixed at 15 minutes regardless of service
            if (selectedDate) {
                renderTimeSlots();
                updateBookingSummary();
            }
        });
    }
}

// --- Calendar Rendering ---
function renderCalendar() {
    const monthYearEl = document.getElementById('calendarMonthYear');
    const gridEl = document.getElementById('calendarGrid');
    if (!monthYearEl || !gridEl) return;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthYearEl.textContent = monthNames[currentMonth] + ' ' + currentYear;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '';

    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);

        let classes = 'calendar-day';
        let isDisabled = false;

        if (date < today) {
            classes += ' disabled';
            isDisabled = true;
        }

        if (date.getDay() === 0) {
            classes += ' disabled sunday';
            isDisabled = true;
        }

        if (date.getTime() === today.getTime()) {
            classes += ' today';
        }

        if (selectedDate && date.getTime() === selectedDate.getTime()) {
            classes += ' selected';
        }

        const appointments = getData('appointments');
        const dateStr = date.toDateString();
        const dayAppointments = appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.toDateString() === dateStr && apt.status !== 'Cancelled';
        });

        if (dayAppointments.length > 0 && !isDisabled) {
            classes += ' has-appointments';
        }

        if (isDisabled) {
            html += `<div class="${classes}">${day}</div>`;
        } else {
            html += `<div class="${classes}" onclick="selectDate(${currentYear}, ${currentMonth}, ${day})">${day}</div>`;
        }
    }

    gridEl.innerHTML = html;
}

// --- Month Navigation ---
function changeMonth(delta) {
    const now = new Date();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();

    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }

    if (newYear < nowYear || (newYear === nowYear && newMonth < nowMonth)) {
        return;
    }

    currentMonth = newMonth;
    currentYear = newYear;
    renderCalendar();
}

// --- Date Selection ---
function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    selectedDate.setHours(0, 0, 0, 0);
    selectedTime = null;

    renderCalendar();

    const timeSlotsSection = document.getElementById('timeSlotsSection');
    if (timeSlotsSection) {
        timeSlotsSection.style.display = 'block';
    }

    const selectedDateText = document.getElementById('selectedDateText');
    if (selectedDateText) {
        selectedDateText.textContent = formatDateFull(selectedDate.toISOString());
    }

    renderTimeSlots();
    updateBookingSummary();

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

// --- Convert minutes to time string ---
function minutesToTimeString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// --- Convert time string to minutes ---
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

// --- Get existing appointments for a date ---
function getAppointmentsForDate(date) {
    const appointments = getData('appointments');
    const dateStr = date.toDateString();
    return appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === dateStr && apt.status !== 'Cancelled';
    });
}

// --- Check if slot is available for given duration ---
function isSlotAvailable(slotStartMinutes, duration, existingAppointments) {
    const slotEndMinutes = slotStartMinutes + duration;

    for (const apt of existingAppointments) {
        const aptStart = timeStringToMinutes(apt.time || apt.startTime);
        const aptDuration = apt.duration || 30;
        const aptEnd = aptStart + aptDuration;

        // Check for overlap
        if (slotStartMinutes < aptEnd && slotEndMinutes > aptStart) {
            return false;
        }
    }
    return true;
}

// --- Generate fixed 15-minute interval slots ---
function generateSlots(sessionStart, sessionEnd) {
    const slots = [];
    let currentTime = sessionStart;

    while (currentTime < sessionEnd) {
        slots.push({
            minutes: currentTime,
            time: minutesToTimeString(currentTime)
        });
        currentTime += 15; // Fixed 15-minute intervals
    }

    return slots;
}

// --- Time Slots Rendering ---
function renderTimeSlots() {
    const gridEl = document.getElementById('timeSlotsGrid');
    if (!gridEl || !selectedDate) return;

    const existingAppointments = getAppointmentsForDate(selectedDate);
    const isTodaySelected = isToday(selectedDate);
    const currentMinutes = getCurrentTimeInMinutes();

    const morningStart = CLINIC_CONFIG.morningStart.hour * 60 + CLINIC_CONFIG.morningStart.minute;
    const morningEnd = CLINIC_CONFIG.morningEnd.hour * 60 + CLINIC_CONFIG.morningEnd.minute;
    const eveningStart = CLINIC_CONFIG.eveningStart.hour * 60 + CLINIC_CONFIG.eveningStart.minute;
    const eveningEnd = CLINIC_CONFIG.eveningEnd.hour * 60 + CLINIC_CONFIG.eveningEnd.minute;

    const morningSlots = generateSlots(morningStart, morningEnd);
    const eveningSlots = generateSlots(eveningStart, eveningEnd);

    let html = '';

    // Morning Session
    html += `<div class="session-group">
        <div class="session-header">
            <i class="fas fa-sun"></i>
            <span>Morning</span>
            <span class="session-time">10:00 AM - 1:30 PM</span>
        </div>
        <div class="session-slots">`;

    morningSlots.forEach(slot => {
        const canFit = slot.minutes + selectedDuration <= morningEnd;
        const isPast = isTodaySelected && slot.minutes <= currentMinutes;
        const isAvailable = canFit && !isPast && isSlotAvailable(slot.minutes, selectedDuration, existingAppointments);
        const isSelected = selectedTime === slot.time;

        if (isPast) {
            // Time has passed - show as closed
            html += `<div class="time-slot passed" title="Time has passed">
                ${slot.time}
            </div>`;
        } else if (!canFit) {
            // Slot can't fit the duration - show as unavailable
            html += `<div class="time-slot disabled" title="Duration exceeds session time">
                ${slot.time}
            </div>`;
        } else if (isAvailable) {
            html += `<div class="time-slot${isSelected ? ' selected' : ''}" onclick="selectTime('${slot.time}')">
                ${slot.time}
            </div>`;
        } else {
            html += `<div class="time-slot booked">
                ${slot.time}
            </div>`;
        }
    });

    html += `</div></div>`;

    // Evening Session
    html += `<div class="session-group">
        <div class="session-header">
            <i class="fas fa-moon"></i>
            <span>Evening</span>
            <span class="session-time">6:00 PM - 8:30 PM</span>
        </div>
        <div class="session-slots">`;

    eveningSlots.forEach(slot => {
        const canFit = slot.minutes + selectedDuration <= eveningEnd;
        const isPast = isTodaySelected && slot.minutes <= currentMinutes;
        const isAvailable = canFit && !isPast && isSlotAvailable(slot.minutes, selectedDuration, existingAppointments);
        const isSelected = selectedTime === slot.time;

        if (isPast) {
            html += `<div class="time-slot passed" title="Time has passed">
                ${slot.time}
            </div>`;
        } else if (!canFit) {
            html += `<div class="time-slot disabled" title="Duration exceeds session time">
                ${slot.time}
            </div>`;
        } else if (isAvailable) {
            html += `<div class="time-slot${isSelected ? ' selected' : ''}" onclick="selectTime('${slot.time}')">
                ${slot.time}
            </div>`;
        } else {
            html += `<div class="time-slot booked">
                ${slot.time}
            </div>`;
        }
    });

    html += `</div></div>`;

    gridEl.innerHTML = html;
}

// --- Time Selection ---
function selectTime(time) {
    selectedTime = time;
    renderTimeSlots();
    updateBookingSummary();

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

// --- Calculate end time ---
function getEndTime(startTime, duration) {
    const startMinutes = timeStringToMinutes(startTime);
    return minutesToTimeString(startMinutes + duration);
}

// --- Update Booking Summary ---
function updateBookingSummary() {
    const summaryEl = document.getElementById('bookingSummary');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summaryDuration = document.getElementById('summaryDuration');

    if (summaryEl) {
        summaryEl.style.display = (selectedDate && selectedTime) ? 'block' : 'none';
    }

    if (summaryDate && selectedDate) {
        summaryDate.textContent = formatDateFull(selectedDate.toISOString());
    }

    if (summaryTime && selectedTime) {
        const endTime = getEndTime(selectedTime, selectedDuration);
        summaryTime.textContent = `${selectedTime} - ${endTime}`;
    }

    if (summaryDuration) {
        summaryDuration.textContent = `${selectedDuration} minutes`;
    }
}

// --- Booking Submission ---
function submitBooking(event) {
    event.preventDefault();

    if (!selectedDate) {
        showToast('Please select an appointment date.', 'error');
        return;
    }

    if (!selectedTime) {
        showToast('Please select an appointment time.', 'error');
        return;
    }

    const patientName = document.getElementById('patientName').value.trim();
    const patientAge = document.getElementById('patientAge').value.trim();
    const patientGender = document.getElementById('patientGender').value;
    const patientPhone = document.getElementById('patientPhone').value.trim();
    const patientEmail = document.getElementById('patientEmail').value.trim();
    const patientAddress = document.getElementById('patientAddress').value.trim();
    const serviceType = document.getElementById('serviceType').value;
    const patientComplaint = document.getElementById('patientComplaint').value.trim();
    const medicalHistory = document.getElementById('medicalHistory').value.trim();

    if (!patientName || !patientPhone) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // Check for conflicts
    const existingAppointments = getAppointmentsForDate(selectedDate);
    const slotStartMinutes = timeStringToMinutes(selectedTime);

    if (!isSlotAvailable(slotStartMinutes, selectedDuration, existingAppointments)) {
        showToast('This time slot is no longer available. Please select another.', 'error');
        renderTimeSlots();
        return;
    }

    const endTime = getEndTime(selectedTime, selectedDuration);

    const appointment = {
        id: generateId(),
        patientName,
        patientAge,
        patientGender,
        patientPhone,
        patientEmail,
        patientAddress,
        service: serviceType,
        patientComplaint,
        medicalHistory,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        startTime: selectedTime,
        endTime: endTime,
        duration: selectedDuration,
        status: 'Scheduled',
        treatmentType: serviceType,
        createdAt: new Date().toISOString()
    };

    // Create or update patient
    const patients = getData('patients');
    let existingPatient = patients.find(p => p.phone === patientPhone);

    if (existingPatient) {
        existingPatient.name = patientName;
        existingPatient.age = patientAge;
        existingPatient.gender = patientGender;
        existingPatient.email = patientEmail;
        existingPatient.address = patientAddress;
        existingPatient.lastVisit = new Date().toISOString();
    } else {
        existingPatient = {
            id: generateId(),
            name: patientName,
            age: parseInt(patientAge),
            gender: patientGender,
            phone: patientPhone,
            email: patientEmail,
            address: patientAddress,
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        };
        patients.push(existingPatient);
    }

    setData('patients', patients);

    appointment.patientId = existingPatient.id;
    appointment.name = patientName;
    appointment.phone = patientPhone;

    const appointments = getData('appointments');
    appointments.push(appointment);
    setData('appointments', appointments);

    // Populate confirmation
    const displayDate = formatDateFull(selectedDate.toISOString());
    const displayTime = `${selectedTime} - ${endTime}`;

    document.getElementById('confName').textContent = patientName;
    document.getElementById('confDate').textContent = displayDate;
    document.getElementById('confTime').textContent = displayTime;
    document.getElementById('confService').textContent = serviceType;
    document.getElementById('confDuration').textContent = `${selectedDuration} minutes`;

    const whatsappMessage = `Hello Shree Physiotherapy Clinic,\n\nI have booked an appointment:\n\nName: ${patientName}\nDate: ${displayDate}\nTime: ${displayTime} (${selectedDuration} min)\nService: ${serviceType}\nComplaint: ${patientComplaint}\n\nPlease confirm.\n\nThank you.`;

    document.getElementById('whatsappConfirmLink').href = `https://wa.me/919092294466?text=${encodeURIComponent(whatsappMessage)}`;

    document.getElementById('confirmationModal').classList.add('active');

    // Reset
    document.getElementById('bookingForm').reset();
    document.getElementById('appointmentDuration').value = '15';
    selectedDuration = 15;
    selectedDate = null;
    selectedTime = null;

    document.getElementById('timeSlotsSection').style.display = 'none';
    document.getElementById('bookingSummary').style.display = 'none';
    document.getElementById('submitBtn').disabled = true;

    renderCalendar();
    showToast('Appointment booked successfully!', 'success');
}
