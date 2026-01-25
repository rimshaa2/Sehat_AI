module.exports = (sequelize, DataTypes) => {
  const MedicalRecord = sequelize.define('MedicalRecord', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    doctor_name: {
      type: DataTypes.STRING,
      defaultValue: 'Sehat AI'
    },
    record_date: {
      type: DataTypes.DATEONLY, // Stores YYYY-MM-DD
      allowNull: false
    },
    record_type: {
      type: DataTypes.STRING, // e.g., 'Lab Report', 'Prescription'
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT, // For long AI summaries
      allowNull: true
    },
    color_code: {
      type: DataTypes.STRING,
      defaultValue: '#E0F2FE'
    }
  }, {
    timestamps: true // Adds createdAt and updatedAt automatically
  });

  MedicalRecord.associate = function(models) {
    // Defines that a Record belongs to a User
    MedicalRecord.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return MedicalRecord;
};