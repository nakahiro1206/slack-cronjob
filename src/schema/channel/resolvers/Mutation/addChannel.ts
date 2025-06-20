
import { addChannel as addChannelFirebase } from '@/lib/firebase/channel';
import type   { MutationResolvers } from './../../../types.generated';
export const addChannel: NonNullable<MutationResolvers['addChannel']> = async (_parent, _arg, _ctx) => {
    const addChannelResult = await addChannelFirebase(_arg);
    return addChannelResult.match<{
        success: boolean;
        error: string | undefined;
    }>(
        (channel) => {
            return {
                success: true,
                error: undefined,
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
};