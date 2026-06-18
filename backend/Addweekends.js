require('dotenv').config();
const { sequelize } = require('./src/config/database');
const Availability = require('./src/models/Availability');

sequelize.authenticate().then(async () => {
  for (const doctorId of [1, 2, 3, 4, 5]) {
    for (const s of [
      { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: true },
      { dayOfWeek: 'Sunday',   startTime: '09:00', endTime: '13:00', isAvailable: true },
    ]) {
      const exists = await Availability.findOne({ where: { doctorId, dayOfWeek: s.dayOfWeek } });
      if (!exists) {
        await Availability.create({ ...s, doctorId });
        console.log('Added', s.dayOfWeek, 'for doctor', doctorId);
      } else {
        console.log('Already has', s.dayOfWeek, 'for doctor', doctorId);
      }
    }
  }
  process.exit(0);
});