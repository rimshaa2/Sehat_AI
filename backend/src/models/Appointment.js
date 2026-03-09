const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Reference: SDS Table 12 - Appointment Table Dictionaryy
const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    timeSlot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled", "no-show"),
      defaultValue: "scheduled",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // "reason" maps to "medicalContext" in our new logic
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingLink: {
      type: DataTypes.STRING, // For telemedicine links
      allowNull: true,
    },
    // We explicitly define foreign keys here for clarity, though associations handle them too
    patientId: {
      type: DataTypes.INTEGER, // Match your User ID type (usually INTEGER)
      allowNull: false,
    },
    doctorId: {
      type: DataTypes.INTEGER, // Match your Doctor ID type
      allowNull: false,
    }
  },
  {
    indexes: [
      {
        unique: true, // Prevents double booking for the same doc at same time
        fields: ["doctorId", "appointmentDate", "timeSlot"],
      },
    ],
  }
);

// 🟢 ENABLE ASSOCIATIONS
// We use a static method pattern to keep it clean in models/index.js
Appointment.associate = (models) => {
  // 1. Link to Patient (User Table)
  Appointment.belongsTo(models.User, { 
    as: 'patient', 
    foreignKey: 'patientId' 
  });

  // 2. Link to Doctor (Doctor Table - NOT User Table directly)
  // This allows us to access Doctor->Specialty AND Doctor->User->Name
  Appointment.belongsTo(models.Doctor, { 
    as: 'doctor', 
    foreignKey: 'doctorId' 
  });
};

module.exports = Appointment;