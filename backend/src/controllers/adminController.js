const { User, Doctor } = require("../models");
const bcrypt = require("bcrypt");

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
    licenseNumber,
    experienceYears,
    password,
  } = req.body;

  // Start a transaction
  const t = await sequelize.transaction();

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // 2. Create the User (Role is 'doctor' by default for this admin action)
    const hashedPassword = await bcrypt.hash(password || "TempPass123!", 10);
    const newUser = await User.create(
      {
        fullName,
        email,
        password: hashedPassword,
        role: "doctor", // Admin created doctors are automatically doctors
        phoneNumber: req.body.phoneNumber || "",
      },
      { transaction: t },
    );

    // 3. Create the Doctor Profile linked to that User
    await Doctor.create(
      {
        userId: newUser.id,
        specialization,
        licenseNumber,
        experienceYears,
        verificationStatus: "verified", // Admin-added doctors bypass the pending stage
        consultationFee: req.body.consultationFee || 500,
      },
      { transaction: t },
    );

    // If everything is successful, commit the transaction
    await t.commit();

    res.status(201).json({
      message: `Dr. ${fullName} has been successfully registered and verified.`,
    });
  } catch (error) {
    // If any step fails, roll back the entire operation
    await t.rollback();
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Failed to create doctor account" });
  }
};
