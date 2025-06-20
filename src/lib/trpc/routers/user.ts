import { z } from 'zod';
import { router, publicProcedure } from '../server';
import { getUsers as getUsersFirebase, addUser as addUserFirebase } from '@/lib/firebase/user';

export const userRouter = router({
  // Get all users
  getAll: publicProcedure
    .query(async () => {
      const getUsersResult = await getUsersFirebase();
      return getUsersResult.match(
        (users) => users.map((user) => ({
          id: user.userId,
          name: user.userName,
        })),
        (error) => {
          console.error('Failed to get users:', error);
          return [];
        }
      );
    }),

  // Add a new user
  add: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      const addUserResult = await addUserFirebase({
        userId: input.id,
        userName: input.name,
      });
      return addUserResult.match<{
        success: boolean;
      }>(
        () => {
          return {
            success: true,
          };
        },
        (error) => {
          console.error('Failed to add user:', error);
          return {
            success: false,
          };
        }
      );
    }),
}); 