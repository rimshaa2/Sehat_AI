require("dotenv").config();
const { Sequelize } = require("sequelize");
const { createClient } = require("redis");
const admin = require("./firebase");

// 1. MySQL Connection - Support both Railway and Local
let sequelize;

if (process.env.DATABASE_URL) {
  // Railway provides DATABASE_URL for MySQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Local development
  sequelize = new Sequelize(
    process.env.DB_NAME || "sehat_ai_db",
    process.env.DB_USER || "root",
    process.env.DB_PASS || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3308,
      dialect: "mysql",
      logging: false,
    },
  );
}

// 2. Redis Connection - FIXED VERSION
// let redisClient;

// if (process.env.REDIS_URL) {
//   // Railway Redis uses rediss:// (with SSL)
//   const redisUrl = process.env.REDIS_URL;

//   redisClient = createClient({
//     url: redisUrl,
//     socket: {
//       // Only enable TLS if using rediss:// protocol
//       tls: redisUrl.startsWith('rediss://'),
//       rejectUnauthorized: false,
//       connectTimeout: 10000,
//       keepAlive: 5000
//     }
//   });
// } else {
//   // Local Redis without TLS
//   redisClient = createClient({
//     url: 'redis://localhost:6379',
//     socket: {
//       tls: false
//     }
//   });
// }

// redisClient.on('error', (err) => console.log('Redis Client Error:', err.message));

// 3. Firestore - Make optional
const getFirestore = () => {
  if (!admin) return null;
  return admin.firestore();
};

const connectDB = async () => {
  const errors = [];

  try {
    // MySQL Connection
    try {
      await sequelize.authenticate();
      console.log("✅ MySQL Connected");

      // Sync is handled centrally in server startup to avoid duplicate ALTER runs.
    } catch (mysqlError) {
      errors.push(`MySQL: ${mysqlError.message}`);
      console.warn("⚠️ MySQL connection failed:", mysqlError.message);
    }

    // Redis Connection
    // try {
    //   if (!redisClient.isOpen) {
    //     await redisClient.connect();
    //     console.log('✅ Redis Connected');
    //   }
    // } catch (redisError) {
    //   errors.push(`Redis: ${redisError.message}`);
    //   console.warn('⚠️ Redis connection failed:', redisError.message);
    // }

    // Firestore Connection (optional)
    try {
      const firestore = getFirestore();
      if (firestore) {
        console.log("✅ Firestore available");
      }
    } catch (firestoreError) {
      console.warn("⚠️ Firestore not available:", firestoreError.message);
    }

    if (errors.length > 0) {
      console.warn(
        `⚠️ Some connections failed, but server will start. Errors: ${errors.join(", ")}`,
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error in connectDB:", error.message);
    // Don't exit - let server start anyway
  }
};

module.exports = { sequelize, getFirestore, connectDB };
