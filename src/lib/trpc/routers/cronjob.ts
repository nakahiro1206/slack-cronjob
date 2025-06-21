import { z } from 'zod';
import { router, publicProcedure } from '../server';
import { notify as notifyService } from '@/lib/slack/notify';

export const cronjobRouter = router({
  // Get cronjob secret
  getSecret: publicProcedure
    .query(async () => {
      return process.env.CRON_SECRET || '';
    }),

  // Send notifications
  notify: publicProcedure
    .input(z.object({
      channelIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const notifyResult = await notifyService({
        mode: 'specifiedChannels',
        channelIds: input.channelIds || []
      });
      return {
        success: notifyResult.success,
        message: notifyResult.message,
      };
    }),
}); 