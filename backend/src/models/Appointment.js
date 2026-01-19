const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

// Reference: SDS Table 12 - Appointment Table Dictionary [cite: 1075]
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
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetingLink: {
      type: DataTypes.STRING, // For telemedicine links [cite: 905]
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: true, // <--- This forces the database to reject duplicates
        fields: ["doctorId", "appointmentDate", "timeSlot"],
      },
    ],
  }
);

// Relationships
// User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
// User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
// Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
// Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

module.exports = Appointment;
