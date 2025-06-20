import type   { NotifyResponseResolvers } from './../../types.generated';
    export const NotifyResponse: NotifyResponseResolvers = {
    success: (parent) => parent.success,
    message: (parent) => parent.message,
  };