// src/models/Availability.js
module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define("Availability", {
    dayOfWeek: DataTypes.STRING, // e.g., "Monday"
    startTime: DataTypes.TIME,   // "09:00:00"
    endTime: DataTypes.TIME,     // "17:00:00"
    isBooked: { type: DataTypes.BOOLEAN, defaultValue: false } 
    // In a real app, you'd calculate specific slots dynamically, 
    // but for this MVP, we can treat rows as slots.
  });
  return Availability;
};