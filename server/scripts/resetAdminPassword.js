// resetAdminPassword.js
// Utility script to re‑hash the admin password defined in .env
// without creating a new user or altering other fields.
//
// Usage (from project root):
//   node server/scripts/resetAdminPassword.js
//
// The script reads ADMIN_EMAIL and ADMIN_PASSWORD from the .env file,
// connects to MongoDB, finds the admin user, generates a new bcrypt hash
// and saves it. No passwords or hashes are printed to the console.

import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

async function resetPassword() {
  const email = (process.env.ADMIN_EMAIL || 'admin@techpulse.com')
    .toLowerCase()
    .trim();
  const rawPassword = process.env.ADMIN_PASSWORD || 'admin123';

  await connectDB();

  const admin = await User.findOne({ email });
  if (!admin) {
    console.error(`❌ Admin user with email ${email} not found.`);
    process.exit(1);
  }

  const newHash = await User.hashPassword(rawPassword);
  admin.passwordHash = newHash;
  await admin.save();

  console.log('✅ Admin password has been reset successfully.');
  process.exit(0);
}

if (process.argv[1]?.endsWith('resetAdminPassword.js')) {
  (async () => {
    try {
      await resetPassword();
    } catch (err) {
      console.error('❌ Reset failed:', err);
      process.exit(1);
    }
  })();
}
