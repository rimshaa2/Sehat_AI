require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    const qi = sequelize.getQueryInterface();

    // Check which columns already exist
    const tableDesc = await qi.describeTable('Appointments');
    const existing = Object.keys(tableDesc);
    console.log('Existing columns:', existing.join(', '));

    // Add paymentReviewStatus
    if (!existing.includes('paymentReviewStatus')) {
      await qi.addColumn('Appointments', 'paymentReviewStatus', {
        type: require('sequelize').DataTypes.ENUM('not_required', 'pending_review', 'approved', 'rejected'),
        defaultValue: 'not_required',
        allowNull: false,
      });
      console.log('✅ Added paymentReviewStatus');
    } else {
      console.log('⏭  paymentReviewStatus already exists');
    }

    // Add paymentReviewNote
    if (!existing.includes('paymentReviewNote')) {
      await qi.addColumn('Appointments', 'paymentReviewNote', {
        type: require('sequelize').DataTypes.STRING,
        allowNull: true,
      });
      console.log('✅ Added paymentReviewNote');
    } else {
      console.log('⏭  paymentReviewNote already exists');
    }

    // Add cancellationDeadline
    if (!existing.includes('cancellationDeadline')) {
      await qi.addColumn('Appointments', 'cancellationDeadline', {
        type: require('sequelize').DataTypes.DATE,
        allowNull: true,
      });
      console.log('✅ Added cancellationDeadline');
    } else {
      console.log('⏭  cancellationDeadline already exists');
    }

    // Add qualifications to Doctors table
    const doctorTableDesc = await qi.describeTable('Doctors');
    const doctorExisting = Object.keys(doctorTableDesc);
    if (!doctorExisting.includes('qualifications')) {
      await qi.addColumn('Doctors', 'qualifications', {
        type: require('sequelize').DataTypes.TEXT('long'),
        allowNull: true,
      });
      console.log('✅ Added qualifications to Doctors');
    } else {
      console.log('⏭  qualifications already exists in Doctors');
    }

    console.log('\n✅ Migration complete. Restart your backend now.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();