require('dotenv').config();
const { sequelize } = require('./src/config/database');
const Availability = require('./src/models/Availability');

sequelize.authenticate().then(async () => {
  const all = await Availability.findAll({ order: [['doctorId','ASC'],['dayOfWeek','ASC']] });
  
  if (all.length === 0) {
    console.log('❌ Availability table is EMPTY — no rows at all');
  } else {
    console.log(`Found ${all.length} total availability rows:\n`);
    all.forEach(r => {
      console.log(`  Doctor ${r.doctorId} | ${r.dayOfWeek.padEnd(10)} | ${r.startTime}–${r.endTime} | available=${r.isAvailable}`);
    });
  }

  // Also check what doctorId the app is actually querying
  console.log('\n--- All Doctor IDs in Availability table ---');
  const ids = [...new Set(all.map(r => r.doctorId))];
  console.log('Doctor IDs with availability:', ids);

  process.exit(0);
});