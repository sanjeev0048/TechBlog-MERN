import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { seedAdmin } from './seedAdmin.js';
import { seedCategories } from './seedCategories.js';
import { seedBlogs } from './seedBlogs.js';

dotenv.config();

async function runSeedAll() {
  console.log('==============================================');
  console.log('Starting TechPulse Database Seeding Process...');
  console.log('==============================================');

  try {
    await connectDB();
    const admin = await seedAdmin();
    console.log(`[1/3] Admin ready: ${admin.email}`);

    const categories = await seedCategories();
    console.log(`[2/3] Seeded ${categories.length} categories.`);

    await seedBlogs();
    console.log('[3/3] Seeded sample articles across key domains.');

    console.log('==============================================');
    console.log('Database seeding successfully finished!');
    console.log('==============================================');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process failed:', err);
    process.exit(1);
  }
}

runSeedAll();
