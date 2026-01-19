require('dotenv').config();
const { Sequelize } = require('sequelize');
const { createClient } = require('redis');
const admin = require('firebase-admin');

// 1. MySQL Connection (Structured Data)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: 3308,
  dialect: 'mysql',
  logging: false,
});

// 2. Redis Connection (Caching)
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// 3. Firestore (deferred)
let _firestore = null;
const getFirestore = () => {
  if (_firestore) return _firestore;
  if (!admin.apps || admin.apps.length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      } catch (err) {
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ' + err.message);
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        admin.initializeApp();
      } catch (err) {
        // continue to error below if still not initialized
      }
    } else {
      throw new Error('Firebase admin not initialized. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.');
    }
  }
  _firestore = admin.firestore();
  return _firestore;
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected (Structured Backbone)');

    await redisClient.connect();
    console.log('✅ Redis Connected (Caching Layer)');

    await sequelize.sync({ alter: true });
    console.log('✅ SQL Models Synced');
  } catch (error) {
    console.error('❌ Database Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, redisClient,getFirestore, connectDB };