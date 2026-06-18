// backend/src/scripts/seedAvailability.js
//
// Run once with:  node src/scripts/seedAvailability.js
//
// What it does:
//   1. Finds every doctor in the DB
//   2. For each doctor that has NO availability rows, inserts Mon–Fri 09:00–17:00
//   This will instantly fix "no available slots" for all existing doctors.

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { sequelize } = require("../config/database");
const Doctor       = require("../models/Doctor");
const Availability = require("../models/Availability");

const DEFAULT_SCHEDULE = [
  { dayOfWeek: "Monday",    startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: "Tuesday",   startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: "Thursday",  startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: "Friday",    startTime: "09:00", endTime: "17:00", isAvailable: true },
  { dayOfWeek: "Saturday",  startTime: "09:00", endTime: "13:00", isAvailable: true },
  { dayOfWeek: "Sunday",    startTime: "09:00", endTime: "13:00", isAvailable: false },
];

async function seedAvailability() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    const doctors = await Doctor.findAll();
    console.log(`Found ${doctors.length} doctor(s)`);

    let seeded = 0;
    let skipped = 0;

    for (const doctor of doctors) {
      const existing = await Availability.count({ where: { doctorId: doctor.id } });
      if (existing > 0) {
        console.log(`  ⏭  Doctor ${doctor.id} already has ${existing} availability rows — skipping`);
        skipped++;
        continue;
      }

      const rows = DEFAULT_SCHEDULE.map((slot) => ({ ...slot, doctorId: doctor.id }));
      await Availability.bulkCreate(rows);
      console.log(`  ✅ Seeded 7 days for doctor ${doctor.id}`);
      seeded++;
    }

    console.log(`\nDone. Seeded: ${seeded} | Skipped (already had data): ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seedAvailability();