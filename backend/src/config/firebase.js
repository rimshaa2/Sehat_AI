const admin = require('firebase-admin');
require('dotenv').config();

const initializeFirebase = () => {
  // 1. Prevent double initialization if already running
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    let serviceAccount;
    
    // 2. CHECK RAILWAY VARIABLE FIRST (Priority)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      console.log('🔹 Using Firebase Config from Railway Variable');
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      } catch (parseError) {
        console.error('❌ Error parsing Firebase JSON:', parseError.message);
        return null;
      }
    } 
    // 3. FALLBACK TO LOCAL FILE (Only for localhost)
    else {
      console.log('🔹 Variable not found, looking for local file...');
      try {
        // We use dynamic require inside try/catch so it doesn't crash the build
        serviceAccount = require('../../serviceAccountKey.json');
      } catch (fileError) {
        console.warn('⚠️ Service Account File not found. Firebase features will be disabled.');
        return null; // Return null instead of crashing
      }
    }

    // 4. Initialize Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log("✅ Firebase Admin Initialized");
    return admin;

  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error.message);
    return null;
  }
};

// Export the initialized instance
module.exports = initializeFirebase();