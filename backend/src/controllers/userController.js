const { User, Doctor } = require('../models');
const admin = require('../config/firebase');

// 1. Sync User (The "Hybrid" Auth Logic)
// Reference: SDS Table 18 - Hybrid Authentication & Profile Sync
exports.syncUser = async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Verify Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // 2. Extract Data (Including phone number!)
    const { uid, email, name, picture, phone_number } = decodedToken;

    // 3. Check if User exists (Using the correct column name)
    // IMPORTANT: Check your User.js model. Is it 'firebase_uid' or 'firebaseUid'?
    // Sequelize usually defaults to camelCase 'firebaseUid'. 
    let user = await User.findOne({ where: { firebaseUid: uid } }); 

    if (!user) {
      console.log(`🆕 Creating New User: ${uid}`);
      
      // 4. Create User (Handle missing email for Phone Auth)
      user = await User.create({
        firebaseUid: uid, // Check your User.js model name!
        
        // If email is missing (Phone Auth), generate a placeholder or save null
        email: email || `${phone_number}@sehatai.placeholder.com`, 
        
        fullName: name || 'New User',
        role: 'patient',
        profilePicture: picture || null,
        phoneNumber: phone_number || null // Save the phone number
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Auth Sync Error:', error);
    res.status(401).json({ error: 'Invalid Token or Database Error' });
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