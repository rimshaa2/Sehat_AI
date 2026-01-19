const { User, Doctor } = require('../models');
const admin = require('firebase-admin');

// 1. Sync User (The "Hybrid" Auth Logic)
// Reference: SDS Table 18 - Hybrid Authentication & Profile Sync
exports.syncUser = async (req, res) => {
  const { idToken } = req.body;

  try {
    // A. Verify Token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // B. Check if User exists in MySQL
    let user = await User.findOne({ where: { firebase_uid: uid } });

    if (!user) {
      // C. If not, CREATE them (First time login)
      user = await User.create({
        firebase_uid: uid,
        email: email,
        fullName: name || 'New User',
        role: 'patient', // Default role
        profilePicture: picture
      });
      console.log(`🆕 New User Created: ${email}`);
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Invalid Token' });
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