const { User, Doctor, sequelize } = require("../models");
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
        licenseNumber,
        bio,
        isVerified: true,
        verificationStatus: "verified",
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
exports.updateDoctor = async (req, res) => {
  const { doctorId } = req.params;
  const { fullName, specialization, experienceYears, consultationFee, bio } =
    req.body;

  try {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // 1. Update Doctor Table fields
    await doctor.update({
      specialization: specialization || doctor.specialization,
      experienceYears: experienceYears || doctor.experienceYears,
      consultationFee: consultationFee || doctor.consultationFee,
      bio: bio || doctor.bio,
    });

    // 2. Update User Table fields (like Name)
    if (fullName) {
      const user = await User.findByPk(doctor.userId);
      if (user) await user.update({ fullName });
    }

    res.json({ message: "Doctor profile updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ error: "Update failed: " + error.message });
  }
};

// --- DELETE DOCTOR ---
exports.deleteDoctor = async (req, res) => {
  const { doctorId } = req.params;
  const t = await sequelize.transaction();

  try {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // 1. Delete the Doctor record first
    await doctor.destroy({ transaction: t });

    // 2. Delete the associated User record
    await User.destroy({
      where: { id: doctor.userId },
      transaction: t,
    });

    await t.commit();
    res.json({
      message: "Doctor and associated user account deleted successfully",
    });
  } catch (error) {
    await t.rollback();
    console.error("Delete Error:", error);
    res.status(500).json({
      error: "Could not delete doctor. They may have existing appointments.",
    });
  }
};
