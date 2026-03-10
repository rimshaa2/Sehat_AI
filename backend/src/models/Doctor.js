const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 1. Define the Table Structure
const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true 
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true // True so that existing rows don't crash
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  consultationFee: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending' 
  },

  bio: {
    type: DataTypes.TEXT, // Longer text for "About Doctor"
    allowNull: true
  },
  availabilityStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // To toggle "Online/Offline" manually
  }
});

// 2. Define Associations (Crucial for "include: [...]" queries)
// We assign this to a helper method so we can call it in models/index.js
Doctor.associate = (models) => {
  // Link to User (to get Name, Profile Pic)
  Doctor.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  
  // Link to Appointments (To check booked slots)
  Doctor.hasMany(models.Appointment, { as: 'appointments', foreignKey: 'doctorId' });
  
  // Link to Availability (To check working hours)
  Doctor.hasMany(models.Availability, { as: 'schedules', foreignKey: 'doctorId' });
};

module.exports = Doctor;