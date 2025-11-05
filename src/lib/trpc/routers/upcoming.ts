import { z } from 'zod';
import { router, publicProcedure } from '../server';
import { 
  getUpcomingSlots,
   initializeUpcomingSlots,
  removeUsers,
  registerUsers,
  changeData,
  deleteUpcomingSlot
} from '@/lib/firebase/upcoming';

export const upcomingRouter = router({
  // Get all upcoming events
  getAll: publicProcedure
    .query(async () => {
      const getUpcomingSlotsResult = await getUpcomingSlots();
      return getUpcomingSlotsResult.match(
        (upcomingSlots) => upcomingSlots,
        (error) => {
          console.error('Failed to get channels:', error);
          return [];
        }
      );
    }),

  initialize: publicProcedure
    .mutation(async () => {
      const initializeUpcomingSlotsResult = await initializeUpcomingSlots();
      return initializeUpcomingSlotsResult.match(
        (upcomingSlots) => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to initialize upcoming slots:', error);
          return {
            success: false,
            error: error.message,
          };
        }
      );
    }),
  
    delete: publicProcedure
    .input(z.object({
      channelId: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const deleteUpcomingSlotResult = await deleteUpcomingSlot(input.channelId);
      return deleteUpcomingSlotResult.match<{
        success: boolean;
        error?: string;
      }>(
        () => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to delete upcoming slot:', error);
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
      const registerUsersResult = await registerUsers(input.channelId, input.userIds);
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
      const removeUsersResult = await removeUsers(input.channelId, input.userIds);
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

  changeDate: publicProcedure
  .input(z.object({
    channelId: z.string().min(1),
    date: z.string().min(1),
  }))
  .mutation(async ({ input }) => {
    const changeDataResult = await changeData(input.channelId, input.date);
    return changeDataResult.match<{
      success: boolean;
      error?: string;
    }>(
      () => {
        return {
          success: true,
        };
      },
      (error: Error) => {
        console.error('Failed to change date:', error);
        return {
          success: false,
          error: error.message,
        };
      }
    );
  }),
}); 