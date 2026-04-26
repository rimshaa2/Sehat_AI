const { User, Doctor } = require("./models"); // Adjust path as needed
const { sequelize } = require("./config/database");

const specializations = [
  "Ear, Nose & Throat",
  "Mental Wellness",
  "Bones",
  "Dental",
];
const genders = ["Male", "Female", "Other"];

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true }); // WARNING: This drops tables!
    console.log("Database synced.");

    const users = [];
    const doctors = [];

    for (let i = 1; i <= 50; i++) {
      // 1. Create User
      const user = {
        fullName: `Doctor Name ${i}`,
        email: `doctor${i}@sehat.ai`,
        role: "doctor",
        gender: genders[Math.floor(Math.random() * genders.length)],
        age: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
        phoneNumber: `0300-12345${i.toString().padStart(2, "0")}`,
      };

      const createdUser = await User.create(user);

      // 2. Create Doctor profile linked to the User
      doctors.push({
        userId: createdUser.id,
        specialization:
          specializations[Math.floor(Math.random() * specializations.length)],
        licenseNumber: `PMC-${10000 + i}`,
        experienceYears: Math.floor(Math.random() * 20) + 1,
        consultationFee: Math.floor(Math.random() * 500) + 1000,
        bio: `Experienced specialist dedicated to providing top-tier care.`,
        isVerified: true,
        verificationStatus: "verified",
      });
    }

    await Doctor.bulkCreate(doctors);
    console.log("Successfully seeded 50 Users and their Doctor profiles!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    process.exit();
  }
}

seedDatabase();
