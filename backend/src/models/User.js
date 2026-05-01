// ─── src/models/User.js ───────────────────────────────────────────────────────
// MODIFIED: Added `fcmToken` column for FCM push notification support.
// Run `sequelize.sync({ alter: true })` or apply a migration to update the DB.
// ─────────────────────────────────────────────────────────────────────────────

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");


const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firebase_uid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,

    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    role: {
      type: DataTypes.ENUM("patient", "doctor", "admin"),
      defaultValue: "patient",
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ── Health Profile Fields (for AI personalization) ──────────────────────
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },
    bloodType: {
      type: DataTypes.STRING,
      allowNull: true, // e.g. A+, O-, B+
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true, // e.g. "Diabetes, Hypertension"
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true, // e.g. "Penicillin, Peanuts"
    },
    // ── Extended Health Fields ──────────────────────────────────────────────
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,  // in kg
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,  // in cm
      allowNull: true,
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: true,  // e.g. "Ali Khan — 0300-1234567"
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notificationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    preferredLanguage: {
      type: DataTypes.ENUM("en", "ur", "pa"),
      allowNull: false,
      defaultValue: "en",
    },

    // ── FCM Push Notification Token ─────────────────────────────────────────
    // Stored when the device calls POST /api/notifications/register-token.
    // Cleared on logout. Used by cron jobs for medicine/appointment reminders.
    // SRS 1.7.4 FE-1, 1.7.3 FE-2, NFR-4
    fcmToken: {
      type: DataTypes.TEXT,      // FCM tokens can be long
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = User;