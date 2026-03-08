const { User, Doctor, sequelize } = require("../models");
const bcrypt = require("bcrypt");
const admin = require("../config/firebase");

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

// src/controllers/adminController.js

exports.registerDoctor = async (req, res) => {
  // Extract user fields from the nested 'user' object sent by the frontend
  const {
    user,
    specialization,
    licenseNumber,
    experienceYears,
    consultationFee,
  } = req.body;

  const { fullName, email } = user; // Extract from the nested object

  const t = await sequelize.transaction();

  try {
    // 1. Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    // 2. Create Firebase Auth User
    let firebaseUser;
    if (admin) {
      try {
        firebaseUser = await admin.auth().createUser({
          email,
          password: "TemporaryPassword123!",
          displayName: fullName,
        });
      } catch (fbError) {
        // If Firebase creation fails, abort transaction
        await t.rollback();
        return res.status(400).json({ error: "Firebase Error: " + fbError.message });
      }
    }

    // 3. Create User in MySQL
    const newUser = await User.create(
      {
        fullName,
        email,
        password: await bcrypt.hash("TemporaryPassword123!", 10),
        role: "doctor",
      },
      { transaction: t },
    );

    // 3. Create Doctor Profile
    await Doctor.create(
      {
        userId: newUser.id,
        specialization,
        licenseNumber,
        experienceYears: Number(experienceYears),
        consultationFee: Number(consultationFee),
        verificationStatus: "verified",
      },
      { transaction: t },
    );

    await t.commit();
    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Internal Error:", error);
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
