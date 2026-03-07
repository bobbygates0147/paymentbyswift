import User from '@/lib/models/User';

export function getAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();

  const password = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

  if (!email || !password) {
    throw new Error('Admin credentials are missing. Set ADMIN_EMAIL and ADMIN_PASSWORD.');
  }

  return { email, password };
}

// Ensures there is always one usable admin account in MongoDB.
export async function ensureAdminUser() {
  const { email, password } = getAdminCredentials();

  let adminUser = await User.findOne({ email }).select('+password');

  if (!adminUser) {
    adminUser = new User({
      email,
      password,
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();
    return adminUser;
  }

  let shouldSave = false;

  if (adminUser.role !== 'admin') {
    adminUser.role = 'admin';
    shouldSave = true;
  }

  if (!adminUser.isActive) {
    adminUser.isActive = true;
    shouldSave = true;
  }

  const passwordMatches = await adminUser.comparePassword(password);
  if (!passwordMatches) {
    adminUser.password = password;
    shouldSave = true;
  }

  if (shouldSave) {
    await adminUser.save();
  }

  return adminUser;
}
