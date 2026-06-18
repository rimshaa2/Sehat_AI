const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Availability = sequelize.define("Availability", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dayOfWeek: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME, 
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME, 
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = Availability;