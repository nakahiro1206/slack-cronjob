import { getUsers as getUsersFirebase } from '@/lib/firebase/user';
import type   { QueryResolvers } from './../../../types.generated';
export const users: NonNullable<QueryResolvers['users']> = async (_parent, _arg, _ctx) => {
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
};