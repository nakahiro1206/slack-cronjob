import { notify as notifyService } from '@/service/notify';
import type   { MutationResolvers } from './../../../types.generated';
export const notify: NonNullable<MutationResolvers['notify']> = async (_parent, _arg, _ctx) => {
        const notifyResult = await notifyService({mode: 'specifiedChannels', channelIds: _arg.channelIds || []});
        return {
        success: notifyResult.success,
        message: notifyResult.message,
        };
};