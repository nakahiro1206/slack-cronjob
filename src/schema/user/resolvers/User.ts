import type   { UserResolvers } from './../../types.generated';
export const User: UserResolvers = {
  id: (parent) => parent.id,
  name: (parent) => parent.name,
};