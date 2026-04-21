import { Cron } from 'croner';
import { expireOldSubscriptions } from '../controllers/subscriptionController.js';

let cronJob = null;

export const startPlanScheduler = () => {
    try {
        if (process.env.NODE_ENV === 'test') return;

        console.log('[PlanScheduler] Initializing cron scheduler...');

        // Create a mock req/res to reuse the existing controller logic
        const mockReq = {};
        const mockRes = {
            json: (data) => console.log(`[PlanScheduler] Job completed: ${data.message}`),
            status: (code) => ({
                json: (data) => console.error(`[PlanScheduler] Job failed with status ${code}:`, data)
            })
        };

        // Schedule expiration check every 6 hours: "0 */6 * * *"
        cronJob = new Cron('0 */6 * * *', async () => {
            console.log(`[PlanScheduler] Running scheduled expiration at ${new Date().toISOString()}`);
            try {
                await expireOldSubscriptions(mockReq, mockRes);
            } catch (error) {
                console.error('[PlanScheduler] Job error:', error);
            }
        });

        const nextRun = cronJob.nextRun();
        console.log(`[PlanScheduler] ✅ Started successfully. Next run: ${nextRun?.toISOString()}`);

    } catch (error) {
        console.error('[PlanScheduler] Failed to start:', error);
    }
};

export const stopPlanScheduler = () => {
    if (cronJob) {
        console.log('[PlanScheduler] Stopping scheduler...');
        cronJob.stop();
        console.log('[PlanScheduler] Scheduler stopped');
    }
};
