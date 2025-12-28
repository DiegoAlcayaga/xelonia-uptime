
// --- SYSTEM NOTIFICATIONS LOGIC ---
function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Tu navegador no soporta notificaciones de sistema.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            sendSystemNotification("¡Notificaciones Activas!", "Ahora recibirás alertas importantes de XELONIA uptime.");
            // Try to subscribe to push (if we had a backend)
            // navigator.serviceWorker.ready.then(reg => reg.pushManager.subscribe(...));
        } else {
            alert("Permiso denegado. No podrás recibir alertas cuando la app esté minimizada.");
        }
    });
}

function sendSystemNotification(title, body, tag = 'general') {
    if (Notification.permission === "granted") {
        // Option A: Service Worker Notification (Better for Android PWA)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    vibrate: [200, 100, 200],
                    tag: tag,
                    renotify: true,
                    requireInteraction: true
                });
            });
        } else {
            // Option B: Standard Notification API fallback
            new Notification(title, {
                body: body,
                icon: '/icon-192.png',
                vibrate: [200, 100, 200]
            });
        }
    }
}
