/**
 * Firebase Sync Helper
 * Intercepta cambios en localStorage y sincroniza con Firebase
 */

(function () {
    // Solo ejecutar si Firebase está disponible
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.warn('Firebase no está disponible - sincronización deshabilitada');
        return;
    }

    const db = firebase.firestore();

    // Interceptar setItem de localStorage
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = function (key, value) {
        // Llamar al setItem original
        originalSetItem.apply(this, arguments);

        // Si es la key de OTs, sincronizar con Firebase
        if (key === 'cmms_ots') {
            try {
                const data = JSON.parse(value);
                db.collection('cmms').doc('ots').set({
                    lista: data,
                    lastUpdate: Date.now()
                }).then(() => {
                    console.log('📋 OTs sincronizadas con Firebase (' + data.length + ' órdenes)');
                }).catch(err => {
                    console.error('❌ Error sincronizando OTs:', err);
                });
            } catch (e) {
                console.error('Error parseando OTs:', e);
            }
        }

        // Si es la key de Bitácora, sincronizar con Firebase
        if (key === 'cmms_bitacora') {
            try {
                const data = JSON.parse(value);
                db.collection('cmms').doc('bitacora').set({
                    entradas: data,
                    lastUpdate: Date.now()
                }).then(() => {
                    console.log('📝 Bitácora sincronizada con Firebase (' + data.length + ' entradas)');
                }).catch(err => {
                    console.error('❌ Error sincronizando Bitácora:', err);
                });
            } catch (e) {
                console.error('Error parseando Bitácora:', e);
            }
        }
    };

    console.log('✅ Firebase Sync Helper activado');
})();
