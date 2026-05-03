// backend/src/server.js
// ─── Sehat AI — Main Server ───────────────────────────────────────────────────
// Changes vs original:
//   1. Imported ChatMessage model and chatRoutes
//   2. Added DOCTOR-PATIENT CHAT socket section below the emergency section
//   3. Mounted /api/chat route
//   4. Imported notificationRoutes and mounted /api/notifications  ← FCM
//   5. Imported and started background reminder cron jobs          ← FCM
//   6. Added fcmToken column migration via sync({ alter: true })   ← FCM

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/database");
const { sequelize, Appointment, Doctor } = require("./models/index");
require("dotenv").config();

const userRoutes          = require("./routes/userRoutes");
const doctorRoutes        = require("./routes/doctorRoutes");
const appointmentRoutes   = require("./routes/appointmentRoutes");
const aiRoutes            = require("./routes/aiRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const adminRoutes         = require("./routes/adminRoutes");
const communityRoutes     = require("./routes/communityRoutes");
const medicineRoutes      = require("./routes/medicineRoutes");
const wellnessRoutes      = require("./routes/wellnessRoutes");
const chatRoutes          = require("./routes/chatRoutes");           // ← CHAT
const notificationRoutes  = require("./routes/notificationRoutes");   // ← FCM
const seedAdmin           = require("./scripts/seedAdmin");
const { startAllJobs }    = require("./jobs");                        // ← FCM

// Import ChatMessage so sequelize.sync() creates the table           ← CHAT
const ChatMessage = require("./models/ChatMessage");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.18.38:5173",
  "https://your-admin-panel.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS Policy: This origin is not allowed"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Sehat AI Backend API is running!",
    version: "1.0.0",
    endpoints: {
      users:         "/api/users",
      doctors:       "/api/doctors",
      appointments:  "/api/appointments",
      ai:            "/api/ai",
      chat:          "/api/chat",                // ← CHAT
      notifications: "/api/notifications",       // ← FCM
      health:        "/health",
      socket:        "ws://" + (req.headers.host || `localhost:${PORT}`),
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Sehat AI Backend",
    database: "Connected",
    sockets: "Active",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/users",         userRoutes);
app.use("/api/doctors",       doctorRoutes);
app.use("/api/appointments",  appointmentRoutes);
app.use("/api/ai",            aiRoutes);
app.use("/api/records",       medicalRecordRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/community",     communityRoutes);
app.use("/api/medicines",     medicineRoutes);
app.use("/api/wellness",      wellnessRoutes);
app.use("/api/chat",          chatRoutes);          // ← CHAT
app.use("/api/notifications", notificationRoutes);  // ← FCM

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User Connected to Real-Time Layer:", socket.id);

  // ── Emergency Alert Logic ────────────────────────────────────────────────────
  socket.on("EMERGENCY_TRIGGER", (data) => {
    const { patientId, location, type } = data;
    console.log(`🚨 SOS RECEIVED from Patient ${patientId} at ${location}`);

    io.to("emergency_responders").emit("NEW_EMERGENCY", {
      alertId: Date.now(),
      patientId,
      location,
      type: type || "General Emergency",
      timestamp: new Date(),
    });

    socket.emit("EMERGENCY_ACKNOWLEDGED", { status: "Help is on the way!" });
  });

  socket.on("JOIN_RESPONDERS", () => {
    socket.join("emergency_responders");
    console.log(`👨‍⚕️ Doctor/Admin ${socket.id} joined Emergency Channel`);
  });

  // ── Global User Notifications ──────────────────────────────────────────────
  socket.on("JOIN_USER_ROOM", ({ userId }) => {
    if (!userId) return;
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`👤 User ${userId} joined global notification room`);
  });

  // ── Doctor–Patient Live Chat Logic ───────────────────────────────────────────
  socket.on("JOIN_CHAT_ROOM", async ({ appointmentId, userId, role, name }) => {
    if (!appointmentId || !userId || !role) {
      return socket.emit("CHAT_ERROR", { error: "Missing JOIN_CHAT_ROOM fields" });
    }

    connectedUsers.set(socket.id, { userId, role, name, appointmentId });

    const roomName = `chat_${appointmentId}`;
    socket.join(roomName);
    console.log(`💬 ${name} (${role}) joined chat room: ${roomName}`);

    try {
      const messages = await ChatMessage.findAll({
        where: { appointmentId },
        order: [["createdAt", "ASC"]],
      });
      socket.emit("CHAT_HISTORY", { messages });
    } catch (err) {
      console.error("Failed to load chat history:", err);
      socket.emit("CHAT_ERROR", { error: "Could not load chat history" });
    }

    socket.to(roomName).emit("USER_JOINED", { name, role });
  });

  // ── SEND_MESSAGE — supports text + file attachments ──────────────────────────
  socket.on("SEND_MESSAGE", async ({
    appointmentId, senderId, senderRole, senderName, message,
    attachmentUrl, attachmentName, attachmentType, attachmentSize,
  }) => {
    // Must have either a text message or an attachment
    const hasText       = message && message.trim().length > 0;
    const hasAttachment = attachmentUrl && attachmentName;

    if (!appointmentId || !senderId || !senderRole || !senderName || (!hasText && !hasAttachment)) {
      return socket.emit("CHAT_ERROR", { error: "Missing SEND_MESSAGE fields" });
    }

    try {
      const saved = await ChatMessage.create({
        appointmentId,
        senderId,
        senderRole,
        senderName,
        message:        hasText ? message.trim() : "",
        attachmentUrl:  attachmentUrl  || null,
        attachmentName: attachmentName || null,
        attachmentType: attachmentType || null,
        attachmentSize: attachmentSize || null,
        isRead: false,
      });

      const payload = {
        id:             saved.id,
        appointmentId:  saved.appointmentId,
        senderId:       saved.senderId,
        senderRole:     saved.senderRole,
        senderName:     saved.senderName,
        message:        saved.message,
        attachmentUrl:  saved.attachmentUrl,
        attachmentName: saved.attachmentName,
        attachmentType: saved.attachmentType,
        attachmentSize: saved.attachmentSize,
        isRead:         saved.isRead,
        createdAt:      saved.createdAt,
      };

      const roomName = `chat_${appointmentId}`;
      io.to(roomName).emit("NEW_MESSAGE", payload);
      console.log(`💬 Message in ${roomName} from ${senderName}: ${(message || "[attachment]").substring(0, 50)}`);

      // ── Notification: If a patient sends a message, ping the doctor ──────────
      if (senderRole === "patient") {
        const appointment = await Appointment.findByPk(appointmentId, {
          include: [{ model: Doctor, as: "doctor" }]
        });
        if (appointment && appointment.doctor && appointment.doctor.userId) {
          io.to(`user_${appointment.doctor.userId}`).emit("NEW_NOTIFICATION", {
            type: "NEW_MESSAGE",
            message: `New message from ${senderName}`,
            appointmentId,
            senderName,
          });
        }
      }
    } catch (err) {
      console.error("Failed to save chat message:", err);
      socket.emit("CHAT_ERROR", { error: "Message could not be delivered" });
    }
  });

  socket.on("TYPING", ({ appointmentId, senderName }) => {
    socket.to(`chat_${appointmentId}`).emit("TYPING_INDICATOR", { senderName });
  });

  socket.on("STOP_TYPING", ({ appointmentId }) => {
    socket.to(`chat_${appointmentId}`).emit("STOP_TYPING_INDICATOR");
  });

  socket.on("LEAVE_CHAT_ROOM", ({ appointmentId }) => {
    const roomName = `chat_${appointmentId}`;
    const user = connectedUsers.get(socket.id);
    socket.leave(roomName);
    if (user) {
      socket.to(roomName).emit("USER_LEFT", { name: user.name, role: user.role });
    }
    console.log(`💬 Socket ${socket.id} left room: ${roomName}`);
  });

  // ── Disconnect cleanup ───────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user?.appointmentId) {
      const roomName = `chat_${user.appointmentId}`;
      socket.to(roomName).emit("USER_LEFT", { name: user.name, role: user.role });
    }
    connectedUsers.delete(socket.id);
    console.log("User Disconnected:", socket.id);
  });
});

// Pass 'io' to routes if ever needed
app.set("io", io);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
    availableEndpoints: [
      "GET /", "GET /health",
      "GET /api/users", "GET /api/doctors",
      "GET /api/appointments", "GET /api/ai",
      "GET /api/chat",
      "POST /api/notifications/register-token",  // ← FCM
    ],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");

    // alter: true adds new columns (fcmToken, attachmentUrl, etc.) to existing
    // tables while creating new tables (ChatMessage) if they don't exist.
    await sequelize.sync({ alter: true });
    await seedAdmin();
    console.log("✅ Database Tables Synced (ChatMessage created, attachment columns added)");
  } catch (dbError) {
    console.error("⚠️ Database Error:", dbError);
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server + Sockets running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log("-------------------------------------------\n");

    // Start cron jobs after server is bound so DB is confirmed ready
    startAllJobs();  // ← FCM
  });
};

startServer();