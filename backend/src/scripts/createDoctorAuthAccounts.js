// backend/src/scripts/createDoctorAuthAccounts.js
// Run with: node src/scripts/createDoctorAuthAccounts.js
//
// What it does:
//   1. Finds all seeded doctors in your DB (firebase_uid starts with "seeded_doctor_")
//   2. Creates a real Firebase Auth account for each one
//   3. Updates the firebase_uid in the DB to match the real Firebase UID
//   4. Prints a table of email + password for every doctor
//
// Default password for all seeded doctors: SehatDoctor@123
// Admin can share individual credentials or reset passwords later.

require("dotenv").config();
const admin = require("firebase-admin");
const { User } = require("../models");

// ── Init Firebase Admin ───────────────────────────────────────────────────────
// Uses the same service account your backend already uses
const serviceAccount = require("../../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const DEFAULT_PASSWORD = "SehatDoctor@123";

async function createDoctorAuthAccounts() {
  try {
    console.log("Looking for seeded doctors in DB...\n");

    // Find all users whose firebase_uid starts with "seeded_doctor_"
    const seededUsers = await User.findAll({
      where: { role: "doctor" },
    });

    // Filter to only seeded ones (real doctors have proper firebase UIDs)
    const toProcess = seededUsers.filter(
      (u) => u.firebase_uid && u.firebase_uid.startsWith("seeded_doctor_")
    );

    console.log(`Found ${toProcess.length} seeded doctors to process.\n`);

    const results = [];

    for (const user of toProcess) {
      try {
        // Check if Firebase Auth account already exists for this email
        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUserByEmail(user.email);
          console.log(`  EXISTS  ${user.fullName} (${user.email}) — already in Firebase Auth`);
        } catch (notFound) {
          // Create new Firebase Auth account
          firebaseUser = await admin.auth().createUser({
            email:         user.email,
            password:      DEFAULT_PASSWORD,
            displayName:   user.fullName,
            emailVerified: true,
          });
          console.log(`  CREATED ${user.fullName} (${user.email})`);
        }

        // Update firebase_uid in DB to the real Firebase UID
        await user.update({ firebase_uid: firebaseUser.uid });

        results.push({
          name:     user.fullName,
          email:    user.email,
          password: DEFAULT_PASSWORD,
          uid:      firebaseUser.uid,
        });
      } catch (err) {
        console.error(`  ERROR   ${user.fullName}: ${err.message}`);
      }
    }

    // Print credentials table
    console.log("\n" + "=".repeat(70));
    console.log("DOCTOR LOGIN CREDENTIALS");
    console.log("=".repeat(70));
    console.log(`${"Name".padEnd(30)} ${"Email".padEnd(30)} Password`);
    console.log("-".repeat(70));
    results.forEach((r) => {
      console.log(`${r.name.padEnd(30)} ${r.email.padEnd(30)} ${r.password}`);
    });
    console.log("=".repeat(70));
    console.log(`\nAll doctors use the same password: ${DEFAULT_PASSWORD}`);
    console.log("You can reset individual passwords from the Firebase Console.");
    console.log("\nDone!");
    process.exit(0);
  } catch (err) {
    console.error("Script failed:", err);
    process.exit(1);
  }
}

createDoctorAuthAccounts();