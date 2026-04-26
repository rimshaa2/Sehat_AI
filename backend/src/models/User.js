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
  },
  {
    timestamps: true,
  }
);

module.exports = User;
