// backend/src/controllers/chatController.js
// ─── REST endpoints that complement the socket-based live chat ────────────────
// GET  /api/chat/:appointmentId/history  → load previous messages
// POST /api/chat/:appointmentId/read     → mark all messages as read for caller

const { ChatMessage } = require("../models");
const { User, Doctor, Appointment } = require("../models");
const { Op } = require("sequelize");

// ── Helper: verify the requesting user is a participant in this appointment ──
const verifyParticipant = async (req, appointmentId) => {
  const firebaseUid = req.user.uid;
  const dbUser = await User.findOne({ where: { firebase_uid: firebaseUid } });
  if (!dbUser) return { error: "User not found", status: 404 };

  const appointment = await Appointment.findByPk(appointmentId);
  if (!appointment) return { error: "Appointment not found", status: 404 };

  const isPatient = dbUser.id === appointment.patientId;

  // For doctors: find doctor profile linked to this user
  const doctorProfile = await Doctor.findOne({ where: { userId: dbUser.id } });
  const isDoctor = doctorProfile && doctorProfile.id === appointment.doctorId;

  const isAdmin = dbUser.role === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    return { error: "Access denied: not a participant", status: 403 };
  }

  return { dbUser, appointment, doctorProfile };
};

// ── GET /api/chat/:appointmentId/history ─────────────────────────────────────
// Returns all messages for a chat room, oldest first.
// Optional query param: ?since=<ISO timestamp> to fetch only new messages.
exports.getChatHistory = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { since } = req.query;

    const check = await verifyParticipant(req, appointmentId);
    if (check.error) return res.status(check.status).json({ error: check.error });

    const where = { appointmentId };
    if (since) {
      where.createdAt = { [Op.gt]: new Date(since) };
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [["createdAt", "ASC"]],
    });

    return res.json({ messages });
  } catch (err) {
    console.error("getChatHistory error:", err);
    return res.status(500).json({ error: "Failed to load chat history" });
  }
};

// ── POST /api/chat/:appointmentId/read ───────────────────────────────────────
// Marks all unread messages NOT sent by the caller as read.
// Returns the count of messages marked read.
exports.markMessagesRead = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const check = await verifyParticipant(req, appointmentId);
    if (check.error) return res.status(check.status).json({ error: check.error });

    const { dbUser, doctorProfile } = check;

    // The caller's own role
    const callerRole = doctorProfile ? "doctor" : "patient";
    // Mark messages sent by the OTHER role as read
    const otherRole = callerRole === "patient" ? "doctor" : "patient";

    const [updatedCount] = await ChatMessage.update(
      { isRead: true },
      {
        where: {
          appointmentId,
          senderRole: otherRole,
          isRead: false,
        },
      }
    );

    return res.json({ markedRead: updatedCount });
  } catch (err) {
    console.error("markMessagesRead error:", err);
    return res.status(500).json({ error: "Failed to mark messages read" });
  }
};