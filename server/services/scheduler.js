import cron from 'node-cron';
import Blog from '../models/Blog.js';

/**
 * Checks for and publishes articles whose scheduled publication time has passed.
 * Safe against concurrent executions via atomic updateMany.
 */
export async function checkScheduledPublications() {
  try {
    const now = new Date();
    const result = await Blog.updateMany(
      {
        status: 'scheduled',
        scheduledAt: { $ne: null, $lte: now }
      },
      {
        $set: {
          status: 'published',
          publishedAt: now
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Scheduler] Published ${result.modifiedCount} scheduled article(s) at ${now.toISOString()}`);
    }

    return result.modifiedCount;
  } catch (err) {
    console.error('[Scheduler Error] Failed to process scheduled articles:', err.message);
    return 0;
  }
}

/**
 * Initializes background cron job running every minute.
 */
export function initScheduler() {
  // Run every minute
  const task = cron.schedule('* * * * *', async () => {
    await checkScheduledPublications();
  });

  console.log('[Scheduler] Background publisher initialized (interval: 1 minute).');
  return task;
}
