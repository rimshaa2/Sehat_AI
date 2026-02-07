const { User, Doctor } = require('../models');

exports.verifyDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    // 1. Find the Doctor Application
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: "Application not found" });

    // 2. Update Doctor Status
    doctor.verificationStatus = 'verified';
    await doctor.save();

    // 3. CRITICAL: Promote the User Role
    // If you skip this, they will still be a 'patient' and get 403 Forbidden!
    const user = await User.findByPk(doctor.userId);
    if (user) {
      user.role = 'doctor';
      await user.save();
    }

    res.json({ message: `Success! Dr. ${user.fullName} is now verified.` });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};