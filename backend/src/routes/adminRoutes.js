// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, authorize } = require("../middleware/authMiddleware");

// Add the new registration route
router.post(
  "/register-doctor",
  verifyToken, // This replaces 'protect'
  authorize(["admin"]),
  adminController.registerDoctor,
);
console.log("adminController:", Object.keys(adminController));

module.exports = router;
