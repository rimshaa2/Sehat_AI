const { User, Doctor } = require("../models");
const { Op } = require("sequelize"); // Required for search filters

// 1. Submit Application (The ONLY way to create a profile)
exports.applyForDoctor = async (req, res) => {
  try {
    const { specialization, licenseNumber, bio, experienceYears } = req.body;

    // DEBUG: See what is coming in
    console.log("📝 Received Application:", req.body);

    const firebaseUid = req.user.uid;

    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🛡️ CHECK: Did we find the user?
    console.log("👤 Found User:", user.id);

    // 1. Check for duplicates
    const existingApplication = await Doctor.findOne({
      where: { userId: user.id },
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ error: "You have already submitted an application." });
    }

    // 2. Sanitize Data (The Crash Fix)
    // Convert '5' to 5. If it's empty, make it 0.
    const cleanExperience = experienceYears ? parseInt(experienceYears) : 0;

    // 3. Create
    const newDoctor = await Doctor.create({
      userId: user.id,
      specialization,
      licenseNumber,
      bio,
      experienceYears: cleanExperience, // <--- Use the clean number
      consultationFee:0,
      verificationStatus: "pending",
    });

    console.log("✅ Doctor Profile Created!");
    res.status(201).json({
      message: "Application submitted successfully",
      status: "pending",
    });
  } catch (error) {
    // THIS IS WHAT WE NEED TO SEE IN TERMINAL
    console.error("❌ CRASH IN APPLY:", error);
    res
      .status(500)
      .json({ error: "Failed to submit application", details: error.message });
  }
};

// 2. Update Profile (For verified doctors to edit details)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, experienceYears, consultationFee, bio } = req.body;
    const firebaseUid = req.user.uid;

    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find the doctor profile belonging to this user
    const doctor = await Doctor.findOne({ where: { userId: user.id } });
    if (!doctor)
      return res.status(404).json({ error: "Doctor profile not found" });

    // Update allowed fields (Admin fields like status/license are NOT editable here)
    await doctor.update({
      specialization,
      experienceYears,
      consultationFee,
      bio,
    });

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Check Status (Used by Frontend to direct traffic)
exports.getDoctorStatus = async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const doctorProfile = await Doctor.findOne({ where: { userId: user.id } });

    if (!doctorProfile) {
      return res.json({ status: "not_applied", role: user.role });
    }

    res.json({
      status: doctorProfile.verificationStatus,
      role: user.role,
      doctorDetails: doctorProfile,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Search Doctors (Patient View)
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, minPrice, maxPrice } = req.query;

    const whereClause = {};
    if (specialization) whereClause.specialization = specialization;

    // Only verify price if provided
    if (minPrice || maxPrice) {
      whereClause.consultationFee = {
        [Op.between]: [minPrice || 0, maxPrice || 100000],
      };
    }

    // IMPORTANT: Only show VERIFIED doctors to the public
    // (Unless you are an Admin, but let's keep it safe for now)
    // whereClause.verificationStatus = 'verified';

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user", // Ensure your Association in models/index.js matches this alias
          attributes: ["fullName", "email", "phoneNumber"],
        },
      ],
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 ADMIN ONLY: Get ALL doctors (Pending + Verified)
exports.getAllDoctorsForAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'phoneNumber'] // Get user details
      }],
      order: [['createdAt', 'DESC']] // Newest applications first
    });
    res.json(doctors);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch doctor list" });
  }
};
