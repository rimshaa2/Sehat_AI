const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// 1. Define the Table Structure
const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Link to the User table (Foreign Key)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true // One user = One doctor profile
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false // e.g., "Cardiologist"
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
  }
});

module.exports = Doctor;