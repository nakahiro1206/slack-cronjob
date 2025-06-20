import type   { AddChannelResponseResolvers } from './../../types.generated';
export const AddChannelResponse: AddChannelResponseResolvers = {
  success: (parent) => parent.success,
  error: (parent) => parent.error,
};