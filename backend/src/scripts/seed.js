const { sequelize, User, Doctor, Availability } = require("../models");

const seedDatabase = async () => {
  try {
    // ⚠️ WARNING: force: true wipes your database clean!
    await sequelize.sync({ force: true });
    console.log("🔥 Database Wiped & Re-created!");

    const doctorsData = [
      {
        name: "Dr. Ayesha Khan",
        email: "ayesha@sehat.com",
        spec: "Ear, Nose & Throat",
        price: 2500,
        img: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        name: "Dr. Ali Raza",
        email: "ali@sehat.com",
        spec: "Dental",
        price: 1500,
        img: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        name: "Dr. Sarah Ahmed",
        email: "sarah@sehat.com",
        spec: "Mental wellness",
        price: 3000,
        img: "https://randomuser.me/api/portraits/women/68.jpg",
      },
      {
        name: "Dr. Bilal Sheikh",
        email: "bilal@sehat.com",
        spec: "Bones",
        price: 2000,
        img: "https://randomuser.me/api/portraits/men/85.jpg",
      },
      {
        name: "Dr. Hina Altaf",
        email: "hina@sehat.com",
        spec: "Ear, Nose & Throat",
        price: 2800,
        img: "https://randomuser.me/api/portraits/women/22.jpg",
      },
    ];

    for (let i = 0; i < doctorsData.length; i++) {
      const doc = doctorsData[i];
      // 1. Create User Account
      const user = await User.create({
        firebase_uid: `seed_doctor_uid_${i + 1}`,
        fullName: doc.name,
        email: doc.email,
        password: "password123", // Dummy password
        role: "doctor",
        profilePicture: doc.img,
        phoneNumber: "+923001234567",
      });

      // 2. Create Doctor Profile
      const doctor = await Doctor.create({
        userId: user.id,
        specialization: doc.spec,
        consultationFee: doc.price,
        experienceYears: Math.floor(Math.random() * 15) + 5, // Random 5-20 years
        bio: `${doc.spec} with over 10 years of experience in treating complex cases. Verified by Sehat AI.`,
        isVerified: true,
      });

      // 3. Create Availability (Mon-Fri, 9-5)
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      for (const day of days) {
        await Availability.create({
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: "09:00:00",
          endTime: "17:00:00",
          isAvailable: true,
        });
      }
    }

    console.log("✅ Seeding Complete! Added 5 Doctors.");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
};

seedDatabase();
