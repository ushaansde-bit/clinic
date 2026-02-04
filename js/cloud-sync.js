/* ============================================
   Shree Physiotherapy Clinic - Cloud Sync Module
   Uses Firebase Realtime Database for cross-browser data persistence
   ============================================ */

(function() {
    'use strict';

    // Hardcoded Firebase config - works across all browsers automatically
    var FIREBASE_CONFIG = {
        apiKey: "AIzaSyDJZdEx1CU6W8jE9uctbcJJji7IiUwG7b0",
        authDomain: "physiotheraphy-d4fd1.firebaseapp.com",
        databaseURL: "https://physiotheraphy-d4fd1-default-rtdb.firebaseio.com",
        projectId: "physiotheraphy-d4fd1",
        storageBucket: "physiotheraphy-d4fd1.firebasestorage.app",
        messagingSenderId: "264416238852",
        appId: "1:264416238852:web:8e594394d9c16c6b468451"
    };

    // Data keys to sync across browsers
    var DATA_KEYS = ['patients', 'appointments', 'prescriptions', 'followups'];

    // ---- State ----
    var database = null;
    var isReady = false;

    // ---- Initialize Firebase ----
    function init(config) {
        if (!config || !config.apiKey || !config.databaseURL) {
            console.log('[CloudSync] No valid config provided');
            return false;
        }

        try {
            if (typeof firebase === 'undefined') {
                console.error('[CloudSync] Firebase SDK not loaded');
                return false;
            }

            // Initialize Firebase (only if not already initialized)
            if (!firebase.apps.length) {
                firebase.initializeApp(config);
            }
            database = firebase.database();
            isReady = true;

            // Save config for future use
            try {
                localStorage.setItem('_firebaseConfig', JSON.stringify(config));
            } catch (e) { /* ignore */ }

            console.log('[CloudSync] Firebase initialized successfully');
            updateSyncStatus('connected');

            // Patch setData to auto-sync
            patchSetData();

            return true;
        } catch (err) {
            console.error('[CloudSync] Firebase init error:', err);
            updateSyncStatus('error');
            return false;
        }
    }

    // Disconnect Firebase
    function disconnect() {
        try {
            localStorage.removeItem('_firebaseConfig');
            if (firebase.apps.length) {
                firebase.app().delete();
            }
        } catch (e) { /* ignore */ }
        database = null;
        isReady = false;
        updateSyncStatus('disconnected');
    }

    // Patch setData to auto-push to cloud
    function patchSetData() {
        if (window._setDataPatched) return;
        var originalSetData = window.setData;
        if (!originalSetData) return;

        window.setData = function(key, data) {
            originalSetData(key, data);
            if (isReady && database && DATA_KEYS.indexOf(key) !== -1) {
                try {
                    database.ref('clinic/' + key).set(data);
                } catch (e) {
                    console.error('[CloudSync] Auto-sync error:', e);
                }
            }
        };
        window._setDataPatched = true;
    }

    // Save a single key to Firebase
    function save(key, data) {
        if (!isReady || !database) return;
        try {
            database.ref('clinic/' + key).set(data);
        } catch (err) {
            console.error('[CloudSync] Save error:', err);
        }
    }

    // Load a single key from Firebase (async)
    function load(key, callback) {
        if (!isReady || !database) {
            callback(null);
            return;
        }
        database.ref('clinic/' + key).once('value')
            .then(function(snapshot) {
                callback(snapshot.val());
            })
            .catch(function(err) {
                console.error('[CloudSync] Load error:', err);
                callback(null);
            });
    }

    // Pull all data from Firebase to localStorage
    function pullFromCloud(callback) {
        if (!isReady || !database) {
            if (callback) callback(false);
            return;
        }

        updateSyncStatus('syncing');
        database.ref('clinic').once('value')
            .then(function(snapshot) {
                var cloudData = snapshot.val();
                if (cloudData) {
                    var pulled = 0;
                    DATA_KEYS.forEach(function(key) {
                        if (cloudData[key] && Array.isArray(cloudData[key])) {
                            localStorage.setItem(key, JSON.stringify(cloudData[key]));
                            pulled++;
                        }
                    });
                    console.log('[CloudSync] Pulled ' + pulled + ' data categories from cloud');
                    updateSyncStatus('synced');
                    if (callback) callback(true);
                } else {
                    // Cloud is empty - push local data to cloud
                    console.log('[CloudSync] Cloud is empty, pushing local data...');
                    pushToCloud(function() {
                        if (callback) callback(true);
                    });
                }
            })
            .catch(function(err) {
                console.error('[CloudSync] Pull error:', err);
                updateSyncStatus('error');
                if (callback) callback(false);
            });
    }

    // Push all localStorage data to Firebase
    function pushToCloud(callback) {
        if (!isReady || !database) {
            if (callback) callback(false);
            return;
        }

        updateSyncStatus('syncing');
        var data = {};
        DATA_KEYS.forEach(function(key) {
            try {
                var raw = localStorage.getItem(key);
                data[key] = raw ? JSON.parse(raw) : [];
            } catch (e) {
                data[key] = [];
            }
        });

        database.ref('clinic').set(data)
            .then(function() {
                updateSyncStatus('synced');
                console.log('[CloudSync] Pushed all data to cloud');
                if (callback) callback(true);
            })
            .catch(function(err) {
                console.error('[CloudSync] Push error:', err);
                updateSyncStatus('error');
                if (callback) callback(false);
            });
    }

    // Update sync status indicator in UI
    function updateSyncStatus(status) {
        var el = document.getElementById('syncStatusIndicator');
        if (!el) return;

        var statusMap = {
            'connected': { text: 'Connected', icon: 'fa-cloud', color: '#22C55E' },
            'syncing': { text: 'Syncing...', icon: 'fa-sync fa-spin', color: '#F59E0B' },
            'synced': { text: 'Synced', icon: 'fa-check-circle', color: '#22C55E' },
            'error': { text: 'Sync Error', icon: 'fa-exclamation-triangle', color: '#EF4444' },
            'disconnected': { text: 'Not Connected', icon: 'fa-cloud', color: '#6B7280' }
        };

        var s = statusMap[status] || statusMap['disconnected'];
        el.innerHTML = '<i class="fas ' + s.icon + '" style="color:' + s.color + ';margin-right:6px;"></i>' + s.text;
        el.setAttribute('data-status', status);
    }

    // Export all data as JSON file
    function exportData() {
        var data = {};
        DATA_KEYS.forEach(function(key) {
            try {
                var raw = localStorage.getItem(key);
                data[key] = raw ? JSON.parse(raw) : [];
            } catch (e) {
                data[key] = [];
            }
        });

        data._exportDate = new Date().toISOString();
        data._clinicName = 'Shree Physiotherapy Clinic';

        var jsonStr = JSON.stringify(data, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.href = url;
        a.download = 'clinic-data-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof showToast === 'function') {
            showToast('Data exported successfully!', 'success');
        }
    }

    // Import data from JSON file
    function importData(file, callback) {
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var data = JSON.parse(e.target.result);
                var imported = 0;

                DATA_KEYS.forEach(function(key) {
                    if (data[key] && Array.isArray(data[key])) {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                        imported++;
                    }
                });

                // Also push to cloud if connected
                if (isReady) {
                    pushToCloud();
                }

                if (typeof showToast === 'function') {
                    showToast('Data imported successfully! (' + imported + ' categories)', 'success');
                }
                if (callback) callback(true);
            } catch (err) {
                console.error('[CloudSync] Import error:', err);
                if (typeof showToast === 'function') {
                    showToast('Import failed: Invalid file format', 'error');
                }
                if (callback) callback(false);
            }
        };
        reader.readAsText(file);
    }

    // Get data statistics
    function getDataStats() {
        var stats = {};
        DATA_KEYS.forEach(function(key) {
            try {
                var raw = localStorage.getItem(key);
                var arr = raw ? JSON.parse(raw) : [];
                stats[key] = Array.isArray(arr) ? arr.length : 0;
            } catch (e) {
                stats[key] = 0;
            }
        });
        return stats;
    }

    // Auto-initialize from hardcoded config or saved config
    function autoInit() {
        // Use hardcoded config first, then fall back to localStorage
        var config = FIREBASE_CONFIG;

        if (!config) {
            try {
                var saved = localStorage.getItem('_firebaseConfig');
                if (saved) {
                    config = JSON.parse(saved);
                }
            } catch (e) { /* ignore */ }
        }

        if (config) {
            var success = init(config);
            if (success) {
                // Auto-pull from cloud on page load
                pullFromCloud(function(pulled) {
                    if (pulled) {
                        // Refresh dashboard if on dashboard page
                        if (typeof refreshDashboard === 'function') {
                            try { refreshDashboard(); } catch (e) { /* ignore */ }
                        }
                        // Refresh current tab
                        if (typeof switchTab === 'function') {
                            var activeLink = document.querySelector('.sidebar-nav a.active');
                            if (activeLink) {
                                var tabMap = ['overview', 'patients', 'appointments', 'calendar', 'prescriptions', 'followups', 'accounts', 'trash', 'settings'];
                                var idx = Array.prototype.indexOf.call(document.querySelectorAll('.sidebar-nav a'), activeLink);
                                if (idx >= 0 && tabMap[idx]) {
                                    try { switchTab(tabMap[idx]); } catch (e) { /* ignore */ }
                                }
                            }
                        }
                    }
                });
            }
        } else {
            updateSyncStatus('disconnected');
        }
    }

    // Expose to window
    window.CloudSync = {
        init: init,
        disconnect: disconnect,
        save: save,
        load: load,
        pullFromCloud: pullFromCloud,
        pushToCloud: pushToCloud,
        exportData: exportData,
        importData: importData,
        getDataStats: getDataStats,
        isReady: function() { return isReady; },
        autoInit: autoInit
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        // Small delay to ensure main.js has loaded
        setTimeout(autoInit, 100);
    }
})();
