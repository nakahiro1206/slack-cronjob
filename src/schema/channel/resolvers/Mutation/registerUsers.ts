import { registerUsers as registerUsersFirebase } from '@/lib/firebase/channel';
import type   { MutationResolvers } from './../../../types.generated';
export const registerUsers: NonNullable<MutationResolvers['registerUsers']> = async (_parent, _arg, _ctx) => { 
        const registerUsersResult = await registerUsersFirebase(_arg.channelId, _arg.userIds);
        return registerUsersResult.match<{
        success: boolean;
        error: string | undefined;
        }>(
        () => {
                return {
                success: true,
                error: undefined,
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
};