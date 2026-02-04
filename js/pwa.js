/* ============================================
   Shree Physiotherapy Clinic - PWA Helper
   Handles Service Worker, Install Prompt, and Notifications
   ============================================ */

// PWA State
let deferredPrompt = null;
let swRegistration = null;

// Initialize PWA
document.addEventListener('DOMContentLoaded', initPWA);

function initPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  }

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', handleInstallPrompt);

  // Check if already installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    hideInstallPrompt();
  });

  // Show install prompt if applicable
  setTimeout(showInstallPromptIfNeeded, 5000);
}

// Register Service Worker
async function registerServiceWorker() {
  try {
    swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered:', swRegistration.scope);

    // Check for updates
    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateAvailable();
        }
      });
    });

    // Request notification permission on doctor dashboard
    if (window.location.pathname.includes('dashboard')) {
      requestNotificationPermission();
    }

  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}

// Handle install prompt
function handleInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt = e;
  showInstallPrompt();
}

// Show install prompt UI
function showInstallPrompt() {
  const existingPrompt = document.getElementById('pwaInstallPrompt');
  if (existingPrompt) return;

  const prompt = document.createElement('div');
  prompt.id = 'pwaInstallPrompt';
  prompt.className = 'pwa-install-prompt';
  prompt.innerHTML = `
    <div class="pwa-prompt-content">
      <div class="pwa-prompt-icon">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <div class="pwa-prompt-text">
        <strong>Install Shree Physio App</strong>
        <span>Add to home screen for quick access</span>
      </div>
      <div class="pwa-prompt-actions">
        <button onclick="installPWA()" class="pwa-btn-install">Install</button>
        <button onclick="hideInstallPrompt()" class="pwa-btn-dismiss"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `;

  document.body.appendChild(prompt);

  // Animate in
  setTimeout(() => prompt.classList.add('show'), 100);
}

function showInstallPromptIfNeeded() {
  // Only show if not installed and prompt is available
  if (deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
    showInstallPrompt();
  }
}

// Install PWA
async function installPWA() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  console.log('[PWA] Install prompt outcome:', outcome);

  deferredPrompt = null;
  hideInstallPrompt();
}

// Hide install prompt
function hideInstallPrompt() {
  const prompt = document.getElementById('pwaInstallPrompt');
  if (prompt) {
    prompt.classList.remove('show');
    setTimeout(() => prompt.remove(), 300);
  }
}

// Show update available notification
function showUpdateAvailable() {
  const banner = document.createElement('div');
  banner.id = 'pwaUpdateBanner';
  banner.className = 'pwa-update-banner';
  banner.innerHTML = `
    <span><i class="fas fa-sync-alt"></i> A new version is available</span>
    <button onclick="updatePWA()">Update Now</button>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('show'), 100);
}

// Update PWA
function updatePWA() {
  if (swRegistration && swRegistration.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  window.location.reload();
}

// Request notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Schedule appointment reminder notification
function scheduleAppointmentReminder(appointment, minutesBefore = 60) {
  if (!swRegistration || Notification.permission !== 'granted') {
    console.log('[PWA] Cannot schedule notification');
    return;
  }

  const appointmentTime = new Date(`${appointment.date}T${convertTo24Hour(appointment.time || appointment.startTime)}`);
  const reminderTime = new Date(appointmentTime.getTime() - (minutesBefore * 60 * 1000));

  // Only schedule if reminder time is in the future
  if (reminderTime > new Date()) {
    navigator.serviceWorker.controller?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      payload: {
        title: 'Appointment Reminder',
        body: `${appointment.patientName || 'Patient'} - ${appointment.service || 'Appointment'} in ${minutesBefore} minutes`,
        scheduledTime: reminderTime.toISOString(),
        tag: `appointment-${appointment.id}`
      }
    });

    console.log('[PWA] Reminder scheduled for:', reminderTime);
  }
}

// Convert 12-hour time to 24-hour format
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

// Send immediate notification (for testing)
function sendTestNotification() {
  if (Notification.permission === 'granted' && swRegistration) {
    swRegistration.showNotification('Test Notification', {
      body: 'This is a test notification from Shree Physiotherapy Clinic',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200]
    });
  }
}

// Check online/offline status
function updateOnlineStatus() {
  const statusIndicator = document.getElementById('onlineStatus');
  if (statusIndicator) {
    if (navigator.onLine) {
      statusIndicator.className = 'online-status online';
      statusIndicator.innerHTML = '<i class="fas fa-wifi"></i> Online';
    } else {
      statusIndicator.className = 'online-status offline';
      statusIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
    }
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Expose functions globally
window.installPWA = installPWA;
window.hideInstallPrompt = hideInstallPrompt;
window.updatePWA = updatePWA;
window.scheduleAppointmentReminder = scheduleAppointmentReminder;
window.sendTestNotification = sendTestNotification;
window.requestNotificationPermission = requestNotificationPermission;
