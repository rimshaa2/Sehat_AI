const { sequelize } = require('../config/database');

// 1. Import all models
const User = require('./User');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const Availability = require('./Availability'); 
const MedicalRecord = require('./MedicalRecord');
const CommunityPost = require("./CommunityPost");
const MedicineLog = require("./MedicineLog");
const WellnessEntry = require("./WellnessEntry");
const Notification = require("./Notification");

// 2. Define Relationships

// --- User & Doctor ---
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Appointment Relationships ---
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

// --- Availability Relationships (🟢 NEW) ---
// A Doctor has many working slots (e.g., Mon 9-5, Wed 9-1)
Doctor.hasMany(Availability, { foreignKey: 'doctorId', as: 'schedules' });
Availability.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

// --- Medical Record Relationships ---
User.hasMany(MedicalRecord, { foreignKey: 'userId', as: 'medicalRecords' });
MedicalRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Community Relationships ---
User.hasMany(CommunityPost, { foreignKey: "userId", as: "communityPosts" });
CommunityPost.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(MedicineLog, { foreignKey: "userId", as: "medicines" });
MedicineLog.belongsTo(User, { foreignKey: "userId", as: "user" });
WellnessEntry.belongsTo(User, { foreignKey: "userId", as: "user" });

// --- Notification Relationships ---
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "user" });

// 3. Export
const db = {
  sequelize,
  User,
  Doctor,
  Appointment,
  Availability ,
  MedicalRecord,
  CommunityPost,
  MedicineLog,
  WellnessEntry,
  Notification,
};

module.exports = db;