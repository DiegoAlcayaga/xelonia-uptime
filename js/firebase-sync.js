// ============================================
// FIREBASE CLOUD SYNC MODULE
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNxljt7NVcl0JREp30f4FLHPD8m4L35s4",
    authDomain: "xelonia-uptime-app.firebaseapp.com",
    projectId: "xelonia-uptime-app",
    storageBucket: "xelonia-uptime-app.firebasestorage.app",
    messagingSenderId: "113362614608",
    appId: "1:113362614608:web:3145603b7d56f8d59c9455",
    measurementId: "G-YSBPE26SHT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("🔥 Firebase Initialized - Cloud Sync Active");

// ============================================
// CLOUD SYNC FUNCTIONS
// ============================================

/**
 * Sube todos los datos locales a Firestore
 */
async function syncToCloud() {
    try {
        const batch = db.batch();

        // Referencia al documento principal del sistema
        const sysRef = db.collection('cmms').doc('system_data');

        batch.set(sysRef, {
            equipos: equipos || [],
            ots: ots || [],
            tecnicos: tecnicos || [],
            repuestos: repuestos || [],
            laborLogs: laborLogs || [],
            toolLogs: toolLogs || [],
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        await batch.commit();
        console.log("☁️ Data synced to cloud successfully");
    } catch (error) {
        console.error("❌ Error syncing to cloud:", error);
    }
}

/**
 * Descarga los datos más recientes desde Firestore
 */
async function loadFromCloud() {
    try {
        const sysRef = db.collection('cmms').doc('system_data');
        const doc = await sysRef.get();

        if (doc.exists) {
            const data = doc.data();

            // Actualizar variables globales
            if (data.equipos) equipos = data.equipos;
            if (data.ots) ots = data.ots;
            if (data.tecnicos) tecnicos = data.tecnicos;
            if (data.repuestos) repuestos = data.repuestos;
            if (data.laborLogs) laborLogs = data.laborLogs;
            if (data.toolLogs) toolLogs = data.toolLogs;

            console.log("☁️ Data loaded from cloud successfully");
            return true;
        } else {
            console.log("📦 No cloud data found, using local data");
            return false;
        }
    } catch (error) {
        console.error("❌ Error loading from cloud:", error);
        return false;
    }
}

/**
 * Escucha cambios en tiempo real de alertas
 */
function listenForAlerts() {
    db.collection('cmms').doc('alerts').onSnapshot((doc) => {
        if (doc.exists) {
            const alertData = doc.data();

            // Si hay una alerta activa
            if (alertData.active && alertData.mensaje) {
                const yaConfirmada = alertData.confirmados && alertData.confirmados.includes(currentUser.id);
                const isForMe = !alertData.targetId || alertData.targetId === currentUser.id;
                const esVigente = (Date.now() - alertData.timestamp) < 3600000;

                if (esVigente && !yaConfirmada && isForMe) {
                    // Activar alerta sensorial
                    if (typeof activarAlertaSensorial === 'function') {
                        activarAlertaSensorial(alertData);
                    }
                }
            }
        }
    });
    console.log("👂 Real-time alert listener active");
}

/**
 * Publica una alerta en la nube para todos los dispositivos
 */
async function publishAlert(alertData) {
    try {
        const alertRef = db.collection('cmms').doc('alerts');
        await alertRef.set({
            ...alertData,
            active: true,
            timestamp: Date.now(),
            confirmados: []
        });
        console.log("📢 Alert published to cloud");
    } catch (error) {
        console.error("❌ Error publishing alert:", error);
    }
}

/**
 * Confirma que el usuario recibió la alerta
 */
async function confirmAlert(userId) {
    try {
        const alertRef = db.collection('cmms').doc('alerts');
        await alertRef.update({
            confirmados: firebase.firestore.FieldValue.arrayUnion(userId)
        });
        console.log("✅ Alert confirmed by user:", userId);
    } catch (error) {
        console.error("❌ Error confirming alert:", error);
    }
}

// ============================================
// OVERRIDE PERSIST FUNCTION
// ============================================

// Guardar la función persist original
const originalPersist = window.persist;

// Nueva función persist que sincroniza con la nube
window.persist = async function () {
    // Primero guardar en localStorage (fallback offline)
    if (originalPersist) {
        originalPersist();
    }

    // Luego sincronizar con la nube
    await syncToCloud();
};

// ============================================
// INITIALIZATION
// ============================================

// Cargar datos de la nube al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Initializing cloud sync...");

    // Intentar cargar desde la nube
    const cloudLoaded = await loadFromCloud();

    // Si se cargó desde la nube, actualizar la vista
    if (cloudLoaded && typeof renderCurrentView === 'function') {
        renderCurrentView();
    }

    // Activar listener de alertas si hay un usuario logueado
    if (currentUser) {
        listenForAlerts();
    }
});

console.log("✅ Firebase Sync Module Loaded");
