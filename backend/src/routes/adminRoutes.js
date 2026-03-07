// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Add the new registration rout
router.post(
  "/register-doctor",
  protect,
  adminOnly,
  adminController.registerDoctor,
);

module.exports = router;
