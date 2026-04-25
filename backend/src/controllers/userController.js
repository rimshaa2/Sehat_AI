const { User, Doctor } = require('../models');
const admin = require('../config/firebase');
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

const isUserLocked = (user) =>
  Boolean(user?.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now());

// 1. Sync User (The "Hybrid" Auth Logic)
// Reference: SDS Table 18 - Hybrid Authentication & Profile Sync
exports.syncUser = async (req, res) => {
  const { idToken } = req.body;

  try {
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

    if (isUserLocked(user)) {
      return res.status(423).json({
        error: "Account temporarily locked due to failed login attempts.",
        lockedUntil: user.lockedUntil,
      });
    }

    // 5. Return the User (Success)
    res.status(200).json({ success: true, user });

  } catch (error) {
    console.error('Auth Sync Error:', error);
    res.status(401).json({ error: 'Invalid Token or Database Error', details: error.message });
  }
};

// Track login attempts server-side to enforce lockout across devices.
exports.recordLoginAttempt = async (req, res) => {
  const { email, success } = req.body;
  if (!email || typeof success !== "boolean") {
    return res.status(400).json({ error: "email and success are required." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: "No account found." });
    }

    if (success) {
      await user.update({ failedLoginAttempts: 0, lockedUntil: null });
      return res.status(200).json({ success: true, message: "Login counters reset." });
    }

    if (isUserLocked(user)) {
      return res.status(423).json({
        error: "Account is currently locked.",
        lockedUntil: user.lockedUntil,
      });
    }

    const nextFailed = (user.failedLoginAttempts || 0) + 1;
    const updatePayload = { failedLoginAttempts: nextFailed };

    if (nextFailed >= MAX_FAILED_ATTEMPTS) {
      updatePayload.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      updatePayload.failedLoginAttempts = 0;
    }

    await user.update(updatePayload);

    if (updatePayload.lockedUntil) {
      return res.status(423).json({
        error: "Too many failed attempts. Account temporarily locked.",
        lockedUntil: updatePayload.lockedUntil,
      });
    }

    return res.status(200).json({
      success: true,
      failedLoginAttempts: nextFailed,
      attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - nextFailed),
    });
  } catch (error) {
    console.error("Record login attempt error:", error);
    return res.status(500).json({ error: error.message });
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

// 4. Update User Profile
exports.updateUserProfile = async (req, res) => {
  const { uid } = req.params;
  const { fullName, phoneNumber, notificationsEnabled, preferredLanguage } = req.body;

  try {
    const user = await User.findOne({ where: { firebase_uid: uid } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({
      fullName: fullName || user.fullName,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
      notificationsEnabled:
        notificationsEnabled !== undefined
          ? Boolean(notificationsEnabled)
          : user.notificationsEnabled,
      preferredLanguage:
        preferredLanguage !== undefined ? preferredLanguage : user.preferredLanguage,
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ error: error.message });
  }
};