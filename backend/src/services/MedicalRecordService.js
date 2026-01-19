const { firestore } = require('../../../src/config/database');

// Reference: SDS Section 3.5.3 (Entity 5) - Medical Record [cite: 916]
const addMedicalRecord = async (firebaseUid, recordData) => {
  try {
    const recordRef = firestore.collection('medical_records').doc();
    
    // We store the specific fields defined in the JSON schema [cite: 917]
    const newRecord = {
      _id: recordRef.id,
      patientId: firebaseUid,
      recordType: recordData.type, // e.g., 'diagnosis', 'lab_result'
      title: recordData.title,
      description: recordData.description,
      files: recordData.files || [], // Array of file URLs [cite: 925]
      vitalSigns: recordData.vitalSigns || {}, // Nested object [cite: 940]
      createdAt: new Date().toISOString()
    };

    await recordRef.set(newRecord);
    return newRecord;
  } catch (error) {
    throw new Error('Firestore Write Failed: ' + error.message);
  }
};

module.exports = { addMedicalRecord };