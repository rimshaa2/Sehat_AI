const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const CommunityPost = sequelize.define(
  "CommunityPost",
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
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
    },
    likesCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    likedBy: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = CommunityPost;
