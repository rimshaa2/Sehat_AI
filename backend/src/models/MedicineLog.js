const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MedicineLog = sequelize.define(
  "MedicineLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dose: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "mg",
    },
    freq: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    times: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#199A8E",
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    durationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taken: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[false,false,false,false,false,false,false]",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = MedicineLog;
