const { User, Doctor } = require('../models');
const admin = require('../config/firebase');

// 1. Sync User (The "Hybrid" Auth Logic)
// Reference: SDS Table 18 - Hybrid Authentication & Profile Sync
exports.syncUser = async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Verify Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture, phone_number } = decodedToken;

    // 2. Check if User exists by firebase_uid
    let user = await User.findOne({ where: { firebase_uid: uid } });

    // 2.5 FALLBACK: Check if an Admin created this User by email but didn't link the UID
    if (!user && email) {
      const emailMatch = await User.findOne({ where: { email } });
      if (emailMatch) {
         console.log(`🔗 Linking existing User ${email} to Firebase UID: ${uid}`);
         emailMatch.firebase_uid = uid;
         await emailMatch.save();
         user = emailMatch;
      }
    }

    if (!user) {
      console.log(`🆕 Attempting to Create User: ${uid}`);
      
      try {
        // 3. Try to Create User
        user = await User.create({
          firebase_uid: uid,
          email: email || `${phone_number}@sehatai.placeholder.com`,
          fullName: name || 'New User',
          role: 'patient',
          profilePicture: picture || null,
          phoneNumber: phone_number || null
        });
      } catch (createError) {
        // 4. HANDLE THE RACE CONDITION HERE
        if (createError.name === 'SequelizeUniqueConstraintError') {
          console.log("⚠️ Race condition detected: User was created by a parallel request. Fetching existing user...");
          user = await User.findOne({ where: { firebase_uid: uid } });
        } else {
          // If it's a real error (not a duplicate), throw it
          throw createError;
        }
      }
    }

    // 5. Return the User (Success)
    res.status(200).json({ success: true, user });

  } catch (error) {
    console.error('Auth Sync Error:', error);
    res.status(401).json({ error: 'Invalid Token or Database Error', details: error.message });
  }
};

// 2. Get User Profile (with Doctor details if applicable)
exports.getUserProfile = async (req, res) => {
  const { uid } = req.params; // We pass Firebase UID in URL

  try {
    const user = await User.findOne({ 
      where: { firebase_uid: uid },
      include: [{ model: Doctor, as: 'doctorProfile' }] // Fetch doctor details if they exist
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this to your existing exports
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};