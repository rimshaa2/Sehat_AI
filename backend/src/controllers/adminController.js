const { User, Doctor } = require("../models");
const bcrypt = require("bcrypt");
const { sequelize } = require("../models");

exports.verifyDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    // 1. Find the Doctor Application
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor)
      return res.status(404).json({ error: "Application not found" });

    // 2. Update Doctor Status
    doctor.verificationStatus = "verified";
    await doctor.save();

    // 3. CRITICAL: Promote the User Role
    // If you skip this, they will still be a 'patient' and get 403 Forbidden!
    const user = await User.findByPk(doctor.userId);
    if (user) {
      user.role = "doctor";
      await user.save();
    }

    res.json({ message: `Success! Dr. ${user.fullName} is now verified.` });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

exports.registerDoctor = async (req, res) => {
  const {
    fullName,
    email,
    specialization,
    experienceYears,
    consultationFee,
    licenseNumber,
    bio,
  } = req.body;

  const t = await sequelize.transaction();

  try {
    // 1. Create User
    const newUser = await User.create(
      {
        fullName,
        email,
        password: await bcrypt.hash("DefaultPass123!", 10),
        role: "doctor",
      },
      { transaction: t },
    );

    // 2. Create Doctor Profile (Matching your model fields)
    await Doctor.create(
      {
        userId: newUser.id,
        specialization,
        experienceYears,
        consultationFee,
        licenseNumber, // Ensure this field is in your actual DB table
        bio,
        isVerified: true, // Matches your Boolean field
        verificationStatus: "verified", // Matches your ENUM field
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({ message: "Doctor added successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

console.log(
  "Controller loaded. Available functions:",
  Object.keys(module.exports),
);
