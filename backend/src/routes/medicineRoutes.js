const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, medicineController.getMyMedicines);
router.get("/patient/:patientId", verifyToken, medicineController.getPatientMedicines);
router.post("/", verifyToken, medicineController.createMedicine);
router.put("/:id", verifyToken, medicineController.updateMedicine);
router.delete("/:id", verifyToken, medicineController.deleteMedicine);

module.exports = router;
