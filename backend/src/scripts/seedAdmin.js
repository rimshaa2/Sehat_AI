const { User } = require('../models');
const admin = require('../config/firebase');

const seedAdmin = async () => {
  const ADMIN_EMAIL = 'admin@sehatai.com';
  const ADMIN_NAME = 'Super Admin';

  try {
    const existingDbUser = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existingDbUser) {
      console.log('✅ Admin Account already exists in DB.');
      return;
    }

    console.log('⚡ Admin not found in DB. Creating one...');

    let firebaseUid = 'local-admin-uid-001'; // fallback uid

    if (admin) {
      try {
        const userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        firebaseUid = userRecord.uid;
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          const newRecord = await admin.auth().createUser({
            email: ADMIN_EMAIL,
            password: 'adminPassword123',
            displayName: ADMIN_NAME,
            emailVerified: true,
          });
          firebaseUid = newRecord.uid;
        }
      }
    } else {
      console.log('⚠️ Firebase not available — creating local admin only');
    }

    await User.create({
      firebase_uid: firebaseUid,
      email: ADMIN_EMAIL,
      fullName: ADMIN_NAME,
      role: 'admin',
      is_active: true,
    });

    console.log('🎉 Admin created! Email: admin@sehatai.com');

  } catch (error) {
    console.error('❌ Failed to seed admin:', error.message);
  }
};

module.exports = seedAdmin;