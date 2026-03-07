import { connectDB } from '@/lib/mongodb';
import { ensureAdminUser, getAdminCredentials } from '@/lib/adminAuth';

/**
 * Initialize the database with default admin user
 * Run this script once to set up the initial admin user
 */
export async function initializeDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const { email: adminEmail } = getAdminCredentials();
    await ensureAdminUser();
    console.log(`Admin user ensured: ${adminEmail}`);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}
