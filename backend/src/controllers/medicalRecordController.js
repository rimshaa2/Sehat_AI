const { MedicalRecord } = require('../models'); // Import from central models index

module.exports = {
  // 1. Create a new Record
  async create(req, res) {
    try {
      const { userId, title, doctor_name, record_date, record_type, details, color_code } = req.body;

      const record = await MedicalRecord.create({
        userId, // The Foreign Key
        title,
        doctor_name,
        record_date,
        record_type,
        details,
        color_code
      });

      return res.status(201).json({ message: 'Record saved', record });
    } catch (error) {
      console.error("Save Error:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // 2. Get All Records for a User
  async getAllByUser(req, res) {
    try {
      const { userId } = req.params;

      const records = await MedicalRecord.findAll({
        where: { userId: userId },
        order: [['record_date', 'DESC']] // Newest first
      });

      return res.status(200).json(records);
    } catch (error) {
      console.error("Fetch Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }
};