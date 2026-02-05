const { User, Doctor } = require('../models');
const { Op } = require('sequelize'); // Required for search filters

// 1. Submit Application (The ONLY way to create a profile)
exports.applyForDoctor = async (req, res) => {
  try {
    const { specialization, licenseNumber, bio, experienceYears } = req.body;
    
    // 1. Security: Get ID from the verified Token, NOT the body
    const firebaseUid = req.user.uid; 
    
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Check for existing application
    const existingApplication = await Doctor.findOne({ where: { userId: user.id } });
    if (existingApplication) {
      return res.status(400).json({ error: "You have already submitted an application." });
    }

    // 3. Create Profile with 'pending' status
    const newDoctor = await Doctor.create({
      userId: user.id,
      specialization,
      licenseNumber,
      bio,
      experienceYears,
      verificationStatus: 'pending' // Matches your new Model
    });

    res.status(201).json({ 
      message: "Application submitted successfully", 
      status: 'pending',
      doctor: newDoctor
    });

  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ error: "Failed to submit application" });
  }
};

// 2. Update Profile (For verified doctors to edit details)
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { specialization, experienceYears, consultationFee, bio } = req.body;
    const firebaseUid = req.user.uid;

    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find the doctor profile belonging to this user
    const doctor = await Doctor.findOne({ where: { userId: user.id } });
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

    // Update allowed fields (Admin fields like status/license are NOT editable here)
    await doctor.update({ 
      specialization, 
      experienceYears, 
      consultationFee, 
      bio 
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
      return res.json({ status: 'not_applied', role: user.role });
    }

    res.json({ 
      status: doctorProfile.verificationStatus, 
      role: user.role,
      doctorDetails: doctorProfile 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Search Doctors (Admin/Patient View)
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, minPrice, maxPrice } = req.query;

    const whereClause = {};
    if (specialization) whereClause.specialization = specialization;
    
    // Only verify price if provided
    if (minPrice || maxPrice) {
      whereClause.consultationFee = {
        [Op.between]: [minPrice || 0, maxPrice || 100000]
      };
    }

    // IMPORTANT: Only show VERIFIED doctors to the public
    // (Unless you are an Admin, but let's keep it safe for now)
    // whereClause.verificationStatus = 'verified'; 

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [{ 
        model: User, 
        as: 'user', // Ensure your Association in models/index.js matches this alias
        attributes: ['fullName', 'email', 'phoneNumber'] 
      }]
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};