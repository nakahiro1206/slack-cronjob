import { z } from 'zod';
import { router, publicProcedure } from '../server';
import { getChannels, addChannel as addChannelFirebase } from '@/lib/firebase/channel';

const DayEnum = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);

export const channelRouter = router({
  // Get all channels
  getAll: publicProcedure
    .query(async () => {
      const getChannelsResult = await getChannels();
      return getChannelsResult.match(
        (channels) => channels,
        (error) => {
          console.error('Failed to get channels:', error);
          return [];
        }
      );
    }),

  // Add a new channel
  add: publicProcedure
    .input(z.object({
      channelId: z.string(),
      channelName: z.string(),
      day: DayEnum,
      userIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const addChannelResult = await addChannelFirebase(input);
      return addChannelResult.match<{
        success: boolean;
        error?: string;
      }>(
        (channel) => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to add channel:', error);
          return {
            success: false,
            error: error.message,
          };
        }
      );
    }),

  // Register users to a channel
  registerUsers: publicProcedure
    .input(z.object({
      channelId: z.string(),
      userIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      // This would need to be implemented in the Firebase layer
      // For now, returning a placeholder response
      return {
        success: true,
      };
    }),
}); 