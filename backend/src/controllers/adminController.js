const { User, Doctor } = require('../models');

exports.verifyDoctor = async (req, res) => {
  const { doctorId } = req.params; // We pass the ID in the URL

  try {
    // 1. Find the Doctor Profile
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor application not found" });

    // 2. Update Status to Verified
    doctor.verificationStatus = 'verified';
    await doctor.save();

    // 3. CRITICAL: Update the User Role
    // This gives them access to the "Doctor" protected routes
    const user = await User.findByPk(doctor.userId);
    user.role = 'doctor';
    await user.save();

    res.json({ message: `Doctor ${user.fullName} has been verified and promoted.` });

  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
};