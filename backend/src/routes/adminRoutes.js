// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Add the new registration route
router.post(
  "/register-doctor",
  protect,
  adminOnly,
  adminController.registerDoctor,
);
console.log("adminController:", Object.keys(adminController));

module.exports = router;
