import { registerUser as registerUserFirebase } from '@/lib/firebase/channel';
import type { MutationResolvers } from './../../../types.generated';
export const registerUser: NonNullable<MutationResolvers['registerUser']> = async (_parent, _arg, _ctx) => {
    const registerUserResult = await registerUserFirebase(_arg.channelId, _arg.userId);
    return registerUserResult.match<{
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
            console.error('Failed to register user:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    );
};