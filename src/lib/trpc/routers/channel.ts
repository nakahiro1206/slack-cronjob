import { z } from 'zod';
import { router, publicProcedure } from '../server';
import {
    getChannels,
    addChannel as addChannelFirebase,
    registerUsers as registerUsersFirebase,
    removeUsers as removeUsersFirebase,
    updateChannel as updateChannelFirebase,
    deleteChannel as deleteChannelFirebase
} from '@/lib/firebase/channel';
import { dayEnum } from '@/models/channel';

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
      channelId: z.string().min(1),
      channelName: z.string().min(1),
      day: dayEnum,
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

  // update Channe;
  update: publicProcedure
    .input(z.object({
      channelId: z.string().min(1),
      channelName: z.string().min(1),
      day: dayEnum,
    }))
    .mutation(async ({ input }) => {
      const updateChannelResult = await updateChannelFirebase(input.channelId, {
        channelName: input.channelName,
        day: input.day,
      });
      return updateChannelResult.match<{
        success: boolean;
        error?: string;
      }>(
        () => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to update channel:', error);
          return {
            success: false,
            error: error.message,
          };
        }
      );
    }),

  // delete Channel
  delete: publicProcedure
    .input(z.object({
      channelId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const deleteChannelResult = await deleteChannelFirebase(input.channelId);
      return deleteChannelResult.match<{
        success: boolean;
        error?: string;
      }>(
        () => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to delete channel:', error);
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
      channelId: z.string().min(1),
      userIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const registerUsersResult = await registerUsersFirebase(input.channelId, input.userIds);
      return registerUsersResult.match<{
        success: boolean;
        error?: string;
      }>(
        (channel) => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to register users:', error);
          return {
            success: false,
            error: error.message,
          };
        }
      );
    }),

  removeUsers: publicProcedure
    .input(z.object({
      channelId: z.string().min(1),
      userIds: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const removeUsersResult = await removeUsersFirebase(input.channelId, input.userIds);
      return removeUsersResult.match<{
        success: boolean;
        error?: string;
      }>(
        (channel) => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to remove users:', error);
          return {
            success: false,
            error: error.message,
          };
        }
      );
    }),
}); 