// backend/src/models/ChatMessage.js
// ─── Live Doctor–Patient Chat Message Model ───────────────────────────────────

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // "patient" | "doctor"
    senderRole: {
      type: DataTypes.ENUM("patient", "doctor"),
      allowNull: false,
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Text body — empty string when message is attachment-only
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    // ── Attachment fields (null when no file) ──────────────────────────────
    // Firebase Storage public download URL
    attachmentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Original filename shown in the bubble, e.g. "blood_report.pdf"
    attachmentName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // MIME type, e.g. "image/jpeg", "application/pdf"
    attachmentType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // File size in bytes
    attachmentSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    indexes: [
      { fields: ["appointmentId", "createdAt"] },
    ],
  }
);

module.exports = ChatMessage;