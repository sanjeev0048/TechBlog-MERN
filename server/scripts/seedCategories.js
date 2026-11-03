import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import { slugify } from '../utils/slugify.js';

dotenv.config();

export const REQUIRED_CATEGORIES = [
  {
    name: 'Software Development',
    description: 'System design, backend architectures, patterns, and clean code principles.'
  },
  {
    name: 'AI & ML',
    description: 'LLM orchestration, agentic frameworks, machine learning models, and automation.'
  },
  {
    name: 'Web and Mobile App Development',
    description: 'Modern frontend frameworks, cross-platform mobile runtimes, and web performance.'
  },
  {
    name: 'Technology & Innovation',
    description: 'Emerging tech breakthroughs, hardware acceleration, and next-generation paradigms.'
  },
  {
    name: 'Cybersecurity',
    description: 'Zero Trust architecture, identity verification, cloud perimeter security, and threat mitigation.'
  },
  {
    name: 'Cloud Computing',
    description: 'Multi-cloud strategy, container orchestration, serverless platforms, and FinOps.'
  },
  {
    name: 'Industry Insights',
    description: 'Engineering leadership, tech ethics, market transformations, and tech governance.'
  }
];

export async function seedCategories() {
  console.log('Seeding required blog categories...');
  const seeded = [];

  for (const item of REQUIRED_CATEGORIES) {
    const slug = slugify(item.name);
    let category = await Category.findOne({ $or: [{ name: item.name }, { slug }] });

    if (!category) {
      category = await Category.create({
        name: item.name,
        slug,
        description: item.description
      });
      console.log(` Created category: "${item.name}"`);
    } else {
      category.description = item.description;
      await category.save();
      console.log(` Existing category verified: "${item.name}"`);
    }
    seeded.push(category);
  }

  return seeded;
}

if (process.argv[1]?.endsWith('seedCategories.js')) {
  (async () => {
    try {
      await connectDB();
      await seedCategories();
      console.log('Category seed completed successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Category seed failed:', err);
      process.exit(1);
    }
  })();
}
