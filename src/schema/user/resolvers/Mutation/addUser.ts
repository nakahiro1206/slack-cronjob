import { addUser as addUserFirebase } from '@/lib/firebase/user';
import type { MutationResolvers } from './../../../types.generated';
export const addUser: NonNullable<MutationResolvers['addUser']> = async (_parent, _arg, _ctx) => {
    const addUserResult = await addUserFirebase({
        userId: _arg.id,
        userName: _arg.name,
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
};