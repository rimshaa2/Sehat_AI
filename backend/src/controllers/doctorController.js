const { User, Doctor, Appointment, Availability } = require("../models");
const { sequelize } = require("../config/database");
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

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Get the local User ID from the Firebase UID (provided by your auth middleware)
    const user = await User.findOne({ where: { firebase_uid: req.user.uid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const doctorProfile = await Doctor.findOne({ where: { userId: user.id } });

    if (!doctorProfile) return res.status(404).json({ error: "Doctor profile not found" });

    const doctorId = doctorProfile.id;
    const today = new Date().toISOString().split('T')[0];

    // 2. Run parallel queries for speed
    const [todayCount, patientCount, recentApts] = await Promise.all([
      // Count today's appointments
      Appointment.count({ where: { doctorId, appointmentDate: today } }),
      
      // Count unique patients seen by this doctor
      Appointment.count({ where: { doctorId }, distinct: true, col: 'patientId' }),
      
      // Get the next 5 upcoming appointments for the table
      Appointment.findAll({
        where: { doctorId, appointmentDate: today },
        limit: 5,
        include: [{ 
          model: User, 
          as: 'patient', 
          attributes: ['fullName', 'phoneNumber'] 
        }],
        order: [['timeSlot', 'ASC']]
      })
    ]);

    res.json({
      stats: {
        todayAppts: todayCount,
        totalPatients: patientCount,
        upcoming: 28, // Replace with count of future dates if needed
        emergencies: 2 // You can add a 'priority' column to Appointments later
      },
      appointments: recentApts
    });
  } catch (error) {
    console.error(error);
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

// ───── AVAILABILITY ENDPOINTS ─────

exports.saveAvailability = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findOne({ where: { firebase_uid: req.user.uid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const doctorProfile = await Doctor.findOne({ where: { userId: user.id } });
    if (!doctorProfile) return res.status(404).json({ error: "Doctor profile not found" });

    const doctorId = doctorProfile.id;
    const { schedule } = req.body; // Array of { dayOfWeek, startTime, endTime, isAvailable }

    if (!Array.isArray(schedule)) {
      return res.status(400).json({ error: "schedule must be an array" });
    }

    // Delete old availability for this doctor, then bulk-insert new ones
    await Availability.destroy({ where: { doctorId }, transaction: t });

    const rows = schedule.map((slot) => ({
      doctorId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
    }));

    await Availability.bulkCreate(rows, { transaction: t });
    await t.commit();

    res.json({ success: true, message: "Availability saved", count: rows.length });
  } catch (error) {
    await t.rollback();
    console.error("Save availability error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const user = await User.findOne({ where: { firebase_uid: req.user.uid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const doctorProfile = await Doctor.findOne({ where: { userId: user.id } });
    if (!doctorProfile) return res.status(404).json({ error: "Doctor profile not found" });

    const availability = await Availability.findAll({
      where: { doctorId: doctorProfile.id },
      order: [['dayOfWeek', 'ASC']],
    });

    res.json(availability);
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ error: error.message });
  }
};
