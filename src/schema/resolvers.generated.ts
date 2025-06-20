/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
    import type   { Resolvers } from './types.generated';
    import    { channels as Query_channels } from './channel/resolvers/Query/channels';
import    { cronjobSecret as Query_cronjobSecret } from './cronjob/resolvers/Query/cronjobSecret';
import    { users as Query_users } from './user/resolvers/Query/users';
import    { addChannel as Mutation_addChannel } from './channel/resolvers/Mutation/addChannel';
import    { addUser as Mutation_addUser } from './user/resolvers/Mutation/addUser';
import    { notify as Mutation_notify } from './cronjob/resolvers/Mutation/notify';
import    { registerUser as Mutation_registerUser } from './channel/resolvers/Mutation/registerUser';
import    { AddChannelResponse } from './channel/resolvers/AddChannelResponse';
import    { AddUserResponse } from './user/resolvers/AddUserResponse';
import    { Channel } from './channel/resolvers/Channel';
import    { NotifyResponse } from './cronjob/resolvers/NotifyResponse';
import    { RegisterUserResponse } from './channel/resolvers/RegisterUserResponse';
import    { User } from './user/resolvers/User';
    export const resolvers: Resolvers = {
      Query: { channels: Query_channels,cronjobSecret: Query_cronjobSecret,users: Query_users },
      Mutation: { addChannel: Mutation_addChannel,addUser: Mutation_addUser,notify: Mutation_notify,registerUser: Mutation_registerUser },
      
      AddChannelResponse: AddChannelResponse,
AddUserResponse: AddUserResponse,
Channel: Channel,
NotifyResponse: NotifyResponse,
RegisterUserResponse: RegisterUserResponse,
User: User
    }