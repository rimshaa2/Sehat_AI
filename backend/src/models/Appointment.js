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
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "cash",
    },
    receiptImage: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    // ── NEW: tracks admin review of the uploaded payment screenshot ──────────
    // pending_review  → receipt uploaded, waiting for admin
    // approved        → admin confirmed the payment
    // rejected        → admin rejected (patient needs to re-upload)
    // not_required    → cash payment, no screenshot needed
    paymentReviewStatus: {
      type: DataTypes.ENUM(
        "not_required",
        "pending_review",
        "approved",
        "rejected"
      ),
      defaultValue: "not_required",
    },
    // Optional note admin can leave when rejecting a receipt
    paymentReviewNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // ── NEW: deadline until which a patient can cancel (set at booking time) ─
    // Patients can cancel up to CANCELLATION_HOURS_BEFORE_APPOINTMENT hours
    // before the appointment start time (default: 2 hours).
    cancellationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
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