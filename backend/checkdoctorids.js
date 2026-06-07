require('dotenv').config();
const { sequelize } = require('./src/config/database');
const Doctor = require('./src/models/Doctor');
const User = require('./src/models/User');
const Availability = require('./src/models/Availability');

// Define association for this script
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

sequelize.authenticate().then(async () => {
  const doctors = await Doctor.findAll({
    include: [{ model: User, as: 'user', attributes: ['fullName'] }],
  });

  console.log('Doctors returned by /api/doctors:\n');
  doctors.forEach(d => {
    console.log(`  Doctor table id=${d.id} | userId=${d.userId} | name=${d.user?.fullName}`);
  });

  console.log('\nNow testing slot query for each doctor (using Sunday as test day):\n');
  for (const d of doctors) {
    const row = await Availability.findOne({
      where: { doctorId: d.id, dayOfWeek: 'Sunday', isAvailable: true },
    });
    console.log(`  doctorId=${d.id} → Sunday availability: ${row ? `FOUND (${row.startTime}–${row.endTime})` : 'NOT FOUND'}`);
  }

  process.exit(0);
});