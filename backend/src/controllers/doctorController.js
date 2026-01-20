const { User, Doctor } = require('../models');
const { redisClient } = require('../config/database');
const { Op } = require('sequelize'); // For filtering (like Price < 5000)

// 1. Create/Update Doctor Profile
// Reference: SDS 3.4.1.31 - Add New Doctor to System [cite: 622]
exports.createDoctorProfile = async (req, res) => {
  try {
    const { userId, specialization, experienceYears, consultationFee, bio } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create or Update Doctor entry
    const [doctor, created] = await Doctor.findOrCreate({
      where: { userId },
      defaults: { specialization, experienceYears, consultationFee, isVerified: false }
    });

    if (!created) {
      // Update existing
      await doctor.update({ specialization, experienceYears, consultationFee });
    }

    // ⚡ IMPORTANT: Invalidate Cache so new data shows up in search
    // await redisClient.del('all_doctors'); 

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Search Doctors (With Redis Caching)
// Reference: SDS 4.1.2 - Dynamic Doctor Filtering Algorithm [cite: 1136]
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, minPrice, maxPrice } = req.query;

    // A. Build Filter Object for MySQL
    const whereClause = {};
    if (specialization) whereClause.specialization = specialization;
    if (minPrice || maxPrice) {
      whereClause.consultationFee = {
        [Op.between]: [minPrice || 0, maxPrice || 100000]
      };
    }

    // B. Redis Cache Logic (Hybrid Architecture)
    // Only use cache if there are NO filters (for the "All Doctors" view)
    // const cacheKey = 'all_doctors';
    // if (Object.keys(whereClause).length === 0) {
    //   const cachedData = await redisClient.get(cacheKey);
    //   if (cachedData) {
    //     console.log('⚡ Serving Doctors from Redis Cache');
    //     return res.json(JSON.parse(cachedData));
    //   }
    // }

    // C. Query MySQL (The Source of Truth)
    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['fullName'] // Fetch name from User table
      }]
    });

    // D. Save to Redis (for 1 hour) if no filters
    // if (Object.keys(whereClause).length === 0) {
    //   await redisClient.setEx(cacheKey, 3600, JSON.stringify(doctors));
    // }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};