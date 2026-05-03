require('dotenv').config({ path: './.env' });
const { sequelize } = require('./src/models');

async function cleanup() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    const [indices] = await sequelize.query('SHOW INDEX FROM Users');
    
    // Find redundant email and firebase_uid indices (keep the base ones)
    const toDrop = indices.filter(idx => {
      // Drop indices with numeric suffixes (e.g., email_2, firebase_uid_3)
      return /_([\d]+)$/.test(idx.Key_name);
    });

    console.log(`Found ${toDrop.length} redundant indices to drop.`);

    for (const idx of toDrop) {
      try {
        console.log(`Dropping index: ${idx.Key_name}...`);
        await sequelize.query(`ALTER TABLE Users DROP INDEX \`${idx.Key_name}\``);
      } catch (e) {
        console.warn(`  Could not drop ${idx.Key_name}: ${e.message}`);
      }
    }

    // Verify what's left
    const [remaining] = await sequelize.query('SHOW INDEX FROM Users');
    console.log(`Remaining indices: ${remaining.length}`);
    remaining.forEach(idx => console.log(`  - ${idx.Key_name} on ${idx.Column_name}`));

    console.log('\nCleanup complete! You can now restart the backend server.');
    
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  } finally {
    await sequelize.close();
  }
}

cleanup();
