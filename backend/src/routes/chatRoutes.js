// backend/src/routes/chatRoutes.js
// ─── REST routes for live chat history ───────────────────────────────────────
// Mount in server.js: app.use("/api/chat", chatRoutes);

const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET  /api/chat/:appointmentId/history
router.get("/:appointmentId/history", verifyToken, chatController.getChatHistory);

// POST /api/chat/:appointmentId/read
router.post("/:appointmentId/read", verifyToken, chatController.markMessagesRead);

module.exports = router;