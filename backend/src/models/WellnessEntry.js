const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WellnessEntry = sequelize.define(
  "WellnessEntry",
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "{}",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = WellnessEntry;
