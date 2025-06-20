import type   { ChannelResolvers } from './../../types.generated';
export const Channel: ChannelResolvers = {
  channelId: (parent) => parent.channelId,
  channelName: (parent) => parent.channelName,
  userIds: (parent) => parent.userIds,
  day: (parent) => parent.day,
};