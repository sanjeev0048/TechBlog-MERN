import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

export async function seedAdmin() {
  const name = process.env.ADMIN_NAME || 'Admin Manager';
  const email = (process.env.ADMIN_EMAIL || 'admin@techpulse.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(`Checking admin user for email: ${email}`);

  let admin = await User.findOne({ email });

  const passwordHash = await User.hashPassword(password);

  if (admin) {
    admin.name = name;
    admin.passwordHash = passwordHash;
    admin.role = 'admin';
    admin.isActive = true;
    await admin.save();
    console.log(`Updated existing administrator credentials (${email})`);
  } else {
    admin = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      isActive: true
    });
    console.log(`Created initial administrator (${email})`);
  }

  return admin;
}

// Allow standalone CLI execution
if (process.argv[1]?.endsWith('seedAdmin.js')) {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      console.log('Admin seed completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Admin seed failed:', err);
      process.exit(1);
    }
  })();
}
