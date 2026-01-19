const { sequelize } = require('../config/database');

// 1. Import all models
const User = require('./User');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');

// 2. Define Relationships (Associations)
// Reference: SDS Class Diagram & Entity Relationships

// --- User & Doctor Relationship ---
// A User can be a Doctor (One-to-One link)
User.hasOne(Doctor, { 
  foreignKey: 'userId', 
  as: 'doctorProfile', 
  onDelete: 'CASCADE' // If User is deleted, delete Doctor profile too
});
Doctor.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// --- Appointment Relationships ---
// An Appointment needs a Patient (User)
User.hasMany(Appointment, { 
  foreignKey: 'patientId', 
  as: 'patientAppointments' 
});
Appointment.belongsTo(User, { 
  foreignKey: 'patientId', 
  as: 'patient' 
});

// An Appointment needs a Doctor (User or Doctor Model)
// We link to Doctor model to ensure they are actually a doctor
Doctor.hasMany(Appointment, { 
  foreignKey: 'doctorId', 
  as: 'doctorAppointments' 
});
Appointment.belongsTo(Doctor, { 
  foreignKey: 'doctorId', 
  as: 'doctor' 
});

// 3. Export everything together
const db = {
  sequelize, // The connection instance
  User,
  Doctor,
  Appointment
};

module.exports = db;