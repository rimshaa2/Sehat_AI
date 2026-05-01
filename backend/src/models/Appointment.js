const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Reference: SDS Table 12 - Appointment Table Dictionary
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["doctorId", "appointmentDate", "timeSlot"],
      },
    ],
  }
);

Appointment.associate = (models) => {
  Appointment.belongsTo(models.User, {
    as: "patient",
    foreignKey: "patientId",
  });
  Appointment.belongsTo(models.Doctor, {
    as: "doctor",
    foreignKey: "doctorId",
  });
};

module.exports = Appointment;