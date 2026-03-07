const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Reference: SDS Table 9 - User Table Dictionary [cite: 1066]
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firebase_uid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: "Links to Firestore and Auth",
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    role: {
      type: DataTypes.ENUM("patient", "doctor", "admin"),
      defaultValue: "patient",
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically [cite: 1066]
  },
);

module.exports = User;
