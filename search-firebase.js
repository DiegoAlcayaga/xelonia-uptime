const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function searchAssets() {
  try {
    console.log('🔍 Buscando colecciones en Firestore...');
    
    // List all collections
    const collections = await db.listCollections();
    console.log('\n📂 Colecciones encontradas:');
    collections.forEach(col => {
      console.log(`  - ${col.id}`);
    });
    
    // Try to find assets collections
    const possibleNames = ['activos', 'cmms_activos', 'assets', 'inventory'];
    
    for (const name of possibleNames) {
      try {
        const snapshot = await db.collection(name).limit(5).get();
        if (!snapshot.empty) {
          console.log(`\n✅ Encontrada colección: ${name}`);
          console.log(`   Total documentos: ${snapshot.size}`);
          snapshot.forEach(doc => {
            console.log(`   - ID: ${doc.id}`);
            const data = doc.data();
            if (data.timestamp || data.fecha || data.createdAt) {
              console.log(`     Fecha: ${data.timestamp || data.fecha || data.createdAt}`);
            }
          });
        }
      } catch (e) {
        // Collection doesn't exist
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

searchAssets();
