const admin = require('../config/firebase');
const { User } = require('../models');


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }


  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ error: 'Unauthorized' });
  }
};


const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    try {

      const user = await User.findOne({ where: { firebase_uid: req.user.uid } });
      if (!user) return res.status(404).json({ error: 'User not found in database' });
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Access Denied: Insufficient Permissions' });
      }

      
      req.dbUser = user;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Server Error during Authorization' });
    }
  };
};

module.exports = { verifyToken, authorize };