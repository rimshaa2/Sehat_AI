const express = require("express");
const router = express.Router();
const wellnessController = require("../controllers/wellnessController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/entries", verifyToken, wellnessController.listEntries);
router.post("/entries", verifyToken, wellnessController.createEntry);

module.exports = router;
