import { getChannels } from '@/lib/firebase/channel';
import type   { QueryResolvers } from './../../../types.generated';
export const channels: NonNullable<QueryResolvers['channels']> = async (_parent, _arg, _ctx) => {
    const getChannelsResult = await getChannels();
    return getChannelsResult.match(
        (channels) => channels,
        (error) => {
            console.error('Failed to get channels:', error);
            return [];
        }
    );
};