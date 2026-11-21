import { Queue, Worker, Job } from 'bullmq';
import { redisClient, isRedisAvailable } from '../config/redis.js';
import { fetchRssSource, fetchAllActiveSources } from '../services/rssService.js';
import { syncAllSocialAccounts } from '../services/socialSyncService.js';
import { prisma } from '../config/prisma.js';

export const RSS_QUEUE_NAME = 'rss-news-collection';

let rssQueue: Queue | null = null;
let rssWorker: Worker | null = null;

// Initialize BullMQ Queue if Redis is active
if (redisClient) {
  try {
    rssQueue = new Queue(RSS_QUEUE_NAME, {
      connection: redisClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    rssQueue.on('error', () => {
      // Handled silently: fallback in-process cron is active
    });

    rssWorker = new Worker(
      RSS_QUEUE_NAME,
      async (job: Job) => {
        const { sourceId, isAll } = job.data;
        if (isAll) {
          console.log(`[BullMQ Worker] Fetching all active RSS sources...`);
          return await fetchAllActiveSources();
        } else if (sourceId) {
          console.log(`[BullMQ Worker] Fetching RSS source ID: ${sourceId}`);
          return await fetchRssSource(sourceId);
        }
      },
      {
        connection: redisClient,
        concurrency: 2,
      }
    );

    rssWorker.on('error', () => {
      // Handled silently: fallback in-process cron is active
    });

    rssWorker.on('completed', (job) => {
      console.log(`✅ [BullMQ Worker] Job ${job.id} completed successfully`);
    });

    rssWorker.on('failed', (job, err) => {
      console.error(`❌ [BullMQ Worker] Job ${job?.id} failed:`, err.message);
    });

    console.log('✅ BullMQ RSS Queue & Worker initialized.');
  } catch (err) {
    console.warn('⚠️ BullMQ Queue could not connect to Redis, using fallback runner:', err);
  }
}

/**
 * Trigger immediate RSS collection job for a specific source
 */
export async function queueRssFetch(sourceId: string): Promise<boolean> {
  if (rssQueue && isRedisAvailable) {
    await rssQueue.add(`fetch-source-${sourceId}`, { sourceId }, { jobId: `rss-${sourceId}-${Date.now()}` });
    return true;
  } else {
    // Graceful fallback: run async in-process if Redis is offline
    setImmediate(async () => {
      try {
        await fetchRssSource(sourceId);
      } catch (err) {
        console.error('In-process fallback fetch failed:', err);
      }
    });
    return true;
  }
}

/**
 * Trigger RSS collection for all sources
 */
export async function queueAllRssFetch(): Promise<boolean> {
  if (rssQueue && isRedisAvailable) {
    await rssQueue.add('fetch-all-active', { isAll: true });
    return true;
  } else {
    setImmediate(async () => {
      try {
        await fetchAllActiveSources();
      } catch (err) {
        console.error('In-process fallback all-fetch failed:', err);
      }
    });
    return true;
  }
}

/**
 * Interval-based Scheduler for regular automated RSS polling
 * (Ensures sources are polled every configured interval e.g. 30 mins)
 */
export function startRssCronScheduler() {
  console.log('🕒 Automated RSS Scheduler started (Checks every 5 minutes)');
  
  // Run on startup after 10 seconds
  setTimeout(async () => {
    try {
      console.log('🚀 Running initial automated RSS feed check...');
      await queueAllRssFetch();
    } catch (err) {
      console.error('Initial RSS check error:', err);
    }
  }, 10000);

  // Periodic check
  setInterval(async () => {
    try {
      const now = new Date();
      const sources = await prisma.rssSource.findMany({
        where: { status: 'ACTIVE' },
      });

      for (const src of sources) {
        const intervalMs = (src.collectionInterval || 30) * 60 * 1000;
        const lastFetch = src.lastFetchTime ? new Date(src.lastFetchTime).getTime() : 0;
        
        if (now.getTime() - lastFetch >= intervalMs) {
          console.log(`⏰ Scheduled time reached for source: ${src.name}`);
          await queueRssFetch(src.id);
        }
      }
    } catch (err) {
      console.error('Scheduled RSS cron check failed:', err);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes

  // Automated Social Media Feed & Live Detection Sync (Every 60 minutes)
  setInterval(async () => {
    try {
      console.log('🔄 Running automated social media synchronization (YouTube, Meta, Instagram)...');
      await syncAllSocialAccounts();
    } catch (err: any) {
      console.warn('Scheduled social sync warning:', err.message);
    }
  }, 60 * 60 * 1000);
}
