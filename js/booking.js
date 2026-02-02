/* ============================================
   Shree Physiotherapy Clinic - Booking System
   ============================================ */

// --- Global State ---
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});

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

    // Empty cells for offset days (before the 1st)
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day disabled"></div>';
    }

    // Day buttons
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);

        let classes = 'calendar-day';
        let isDisabled = false;

        // Past dates
        if (date < today) {
            classes += ' disabled';
            isDisabled = true;
        }

        // Sundays (clinic closed)
        if (date.getDay() === 0) {
            classes += ' disabled';
            isDisabled = true;
        }

        // Today
        if (date.getTime() === today.getTime()) {
            classes += ' today';
        }

        // Selected date
        if (selectedDate && date.getTime() === selectedDate.getTime()) {
            classes += ' selected';
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

    // Handle year rollover
    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }

    // Cannot go before current month
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

    // Re-render calendar to update selected state
    renderCalendar();

    // Show time slots section
    const timeSlotsSection = document.getElementById('timeSlotsSection');
    if (timeSlotsSection) {
        timeSlotsSection.style.display = 'block';
    }

    // Update selected date text
    const selectedDateText = document.getElementById('selectedDateText');
    if (selectedDateText) {
        selectedDateText.textContent = formatDateFull(selectedDate.toISOString());
    }

    // Render time slots
    renderTimeSlots();

    // Update booking summary
    updateBookingSummary();
}

// --- Time Slots ---
function renderTimeSlots() {
    const gridEl = document.getElementById('timeSlotsGrid');
    if (!gridEl) return;

    // Generate 20 slots from 9:00 AM to 6:30 PM in 30-min intervals
    const slots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
        '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
        '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
    ];

    // Check localStorage for booked appointments on this date
    const appointments = getData('appointments');
    const dateStr = selectedDate.toDateString();
    const bookedSlots = appointments
        .filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.toDateString() === dateStr && apt.status !== 'Cancelled';
        })
        .map(apt => apt.time);

    let html = '';

    slots.forEach(slot => {
        let classes = 'time-slot';
        const isBooked = bookedSlots.includes(slot);

        if (isBooked) {
            classes += ' booked';
            html += `<div class="${classes}"><i class="fas fa-clock"></i> ${slot}<span class="booked-label">Booked</span></div>`;
        } else {
            if (selectedTime === slot) {
                classes += ' selected';
            }
            html += `<div class="${classes}" onclick="selectTime('${slot}')">${slot}</div>`;
        }
    });

    gridEl.innerHTML = html;
}

// --- Time Selection ---
function selectTime(time) {
    selectedTime = time;

    // Re-render time slots to update selected state
    renderTimeSlots();

    // Update booking summary
    updateBookingSummary();

    // Enable submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
}

// --- Update Booking Summary ---
function updateBookingSummary() {
    const summaryEl = document.getElementById('bookingSummary');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');

    if (summaryEl) {
        if (selectedDate && selectedTime) {
            summaryEl.style.display = 'block';
        } else {
            summaryEl.style.display = 'none';
        }
    }

    if (summaryDate && selectedDate) {
        summaryDate.textContent = formatDateFull(selectedDate.toISOString());
    }

    if (summaryTime && selectedTime) {
        summaryTime.textContent = selectedTime;
    }
}

// --- Booking Submission ---
function submitBooking(event) {
    event.preventDefault();

    // Validate date and time selection
    if (!selectedDate) {
        showToast('Please select an appointment date.', 'error');
        return;
    }

    if (!selectedTime) {
        showToast('Please select an appointment time.', 'error');
        return;
    }

    // Gather form data
    const patientName = document.getElementById('patientName').value.trim();
    const patientAge = document.getElementById('patientAge').value.trim();
    const patientGender = document.getElementById('patientGender').value;
    const patientPhone = document.getElementById('patientPhone').value.trim();
    const patientEmail = document.getElementById('patientEmail').value.trim();
    const patientAddress = document.getElementById('patientAddress').value.trim();
    const serviceType = document.getElementById('serviceType').value;
    const patientComplaint = document.getElementById('patientComplaint').value.trim();
    const medicalHistory = document.getElementById('medicalHistory').value.trim();

    // Validate required fields
    if (!patientName || !patientPhone) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // Create appointment object
    const appointment = {
        id: generateId(),
        patientName: patientName,
        patientAge: patientAge,
        patientGender: patientGender,
        patientPhone: patientPhone,
        patientEmail: patientEmail,
        patientAddress: patientAddress,
        service: serviceType,
        patientComplaint: patientComplaint,
        medicalHistory: medicalHistory,
        date: selectedDate.toISOString(),
        time: selectedTime,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
    };

    // Create or update patient record
    const patients = getData('patients');
    let existingPatient = patients.find(p => p.phone === patientPhone);

    if (existingPatient) {
        existingPatient.name = patientName;
        existingPatient.age = patientAge;
        existingPatient.gender = patientGender;
        existingPatient.email = patientEmail;
        existingPatient.address = patientAddress;
    } else {
        existingPatient = {
            id: generateId(),
            name: patientName,
            age: parseInt(patientAge),
            gender: patientGender,
            phone: patientPhone,
            email: patientEmail,
            address: patientAddress,
            createdAt: new Date().toISOString()
        };
        patients.push(existingPatient);
    }

    setData('patients', patients);

    // Link appointment to patient
    appointment.patientId = existingPatient.id;
    appointment.name = patientName;
    appointment.phone = patientPhone;

    // Save appointment to localStorage
    const appointments = getData('appointments');
    appointments.push(appointment);
    setData('appointments', appointments);

    // Format the display date
    const displayDate = formatDateFull(selectedDate.toISOString());

    // Populate confirmation modal
    const confName = document.getElementById('confName');
    const confDate = document.getElementById('confDate');
    const confTime = document.getElementById('confTime');
    const confService = document.getElementById('confService');

    if (confName) confName.textContent = patientName;
    if (confDate) confDate.textContent = displayDate;
    if (confTime) confTime.textContent = selectedTime;
    if (confService) confService.textContent = serviceType;

    // Build WhatsApp confirmation link
    const whatsappMessage = `Hello Shree Physiotherapy Clinic,\n\nI have booked an appointment with the following details:\n\nPatient Name: ${patientName}\nDate: ${displayDate}\nTime: ${selectedTime}\nService: ${serviceType}\nComplaint: ${patientComplaint}\n\nPlease confirm my appointment.\n\nThank you.`;

    const whatsappLink = document.getElementById('whatsappConfirmLink');
    if (whatsappLink) {
        whatsappLink.href = `https://wa.me/919092294466?text=${encodeURIComponent(whatsappMessage)}`;
    }

    // Show confirmation modal
    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.classList.add('active');
    }

    // Reset form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.reset();
    }

    // Reset state
    selectedDate = null;
    selectedTime = null;

    // Hide time slots section and booking summary
    const timeSlotsSection = document.getElementById('timeSlotsSection');
    if (timeSlotsSection) {
        timeSlotsSection.style.display = 'none';
    }

    const bookingSummary = document.getElementById('bookingSummary');
    if (bookingSummary) {
        bookingSummary.style.display = 'none';
    }

    // Disable submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
    }

    // Re-render calendar
    renderCalendar();

    // Show success toast
    showToast('Appointment booked successfully!', 'success');
}
