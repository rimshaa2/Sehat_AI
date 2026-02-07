const { User } = require('../models'); // Adjust path to your models
const admin = require('../config/firebase'); // Your firebase-admin instance

const seedAdmin = async () => {
  const ADMIN_EMAIL = 'admin@sehatai.com';
  const ADMIN_PASSWORD = 'adminPassword123'; // Change this if you want
  const ADMIN_NAME = 'Super Admin';

  try {
    // 1. Check if Admin exists in Database
    const existingDbUser = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existingDbUser) {
      console.log('✅ Admin Account already exists in DB.');
      return;
    }

    console.log('⚡ Admin not found in DB. Creating one...');

    // 2. Check if Admin exists in Firebase (Prevent duplicate error)
    let firebaseUid;
    try {
      const userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log('   -> Found existing Firebase user, linking to DB...');
      firebaseUid = userRecord.uid;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('   -> Creating new Firebase user...');
        const newRecord = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_NAME,
          emailVerified: true,
        });
        firebaseUid = newRecord.uid;
      } else {
        throw error;
      }
    }

    // 3. Create Admin in Database
    await User.create({
      firebase_uid: firebaseUid,
      email: ADMIN_EMAIL,
      fullName: ADMIN_NAME,
      role: 'admin', // 👑 THE MAGIC KEY
      is_active: true,
    });

    console.log(`🎉 SUCCESS: Admin created! Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  } catch (error) {
    console.error('❌ Failed to seed admin:', error.message);
  }
};

module.exports = seedAdmin;