const admin = require('../config/firebase');
const { User } = require('../models');

// 1. Verify Firebase Token (Authentication)
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach Firebase info to request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: 'Unauthorized' });
  }
};

// 2. Check Role (Authorization)
// Usage: authorize(['admin']) OR authorize(['doctor', 'admin'])
const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Find the user in YOUR database using the Firebase UID
      const user = await User.findOne({ where: { firebase_uid: req.user.uid } });

      if (!user) {
        return res.status(404).json({ error: 'User not found in database' });
      }

      // Check if their role is in the allowed list
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Access Denied: Insufficient Permissions' });
      }

      // Attach the DB user object to request (useful for controllers)
      req.dbUser = user;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ error: 'Server Error during Authorization' });
    }
  };
};

module.exports = { verifyToken, authorize };