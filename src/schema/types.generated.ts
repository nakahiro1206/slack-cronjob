import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string | number; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddChannelResponse = {
  __typename?: 'AddChannelResponse';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type AddUserResponse = {
  __typename?: 'AddUserResponse';
  success: Scalars['Boolean']['output'];
};

export type Channel = {
  __typename?: 'Channel';
  channelId: Scalars['ID']['output'];
  channelName: Scalars['String']['output'];
  day: Day;
  userIds: Array<Scalars['ID']['output']>;
};

export type Day =
  | 'FRIDAY'
  | 'MONDAY'
  | 'SATURDAY'
  | 'SUNDAY'
  | 'THURSDAY'
  | 'TUESDAY'
  | 'WEDNESDAY';

export type Mutation = {
  __typename?: 'Mutation';
  addChannel: AddChannelResponse;
  addUser: AddUserResponse;
  notify: NotifyResponse;
  registerUsers: RegisterUserResponse;
};


export type MutationaddChannelArgs = {
  channelId: Scalars['ID']['input'];
  channelName: Scalars['String']['input'];
  day: Day;
  userIds: Array<Scalars['ID']['input']>;
};


export type MutationaddUserArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationnotifyArgs = {
  channelIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationregisterUsersArgs = {
  channelId: Scalars['ID']['input'];
  userIds: Array<Scalars['ID']['input']>;
};

export type NotifyResponse = {
  __typename?: 'NotifyResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  channels: Array<Channel>;
  cronjobSecret: Scalars['String']['output'];
  users: Array<User>;
};

export type RegisterUserResponse = {
  __typename?: 'RegisterUserResponse';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddChannelResponse: ResolverTypeWrapper<AddChannelResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  AddUserResponse: ResolverTypeWrapper<AddUserResponse>;
  Channel: ResolverTypeWrapper<Omit<Channel, 'day'> & { day: ResolversTypes['Day'] }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Day: ResolverTypeWrapper<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'>;
  Mutation: ResolverTypeWrapper<{}>;
  NotifyResponse: ResolverTypeWrapper<NotifyResponse>;
  Query: ResolverTypeWrapper<{}>;
  RegisterUserResponse: ResolverTypeWrapper<RegisterUserResponse>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddChannelResponse: AddChannelResponse;
  String: Scalars['String']['output'];
  Boolean: Scalars['Boolean']['output'];
  AddUserResponse: AddUserResponse;
  Channel: Channel;
  ID: Scalars['ID']['output'];
  Mutation: {};
  NotifyResponse: NotifyResponse;
  Query: {};
  RegisterUserResponse: RegisterUserResponse;
  User: User;
};

export type AddChannelResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddChannelResponse'] = ResolversParentTypes['AddChannelResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddUserResponse'] = ResolversParentTypes['AddUserResponse']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChannelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Channel'] = ResolversParentTypes['Channel']> = {
  channelId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  channelName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  day?: Resolver<ResolversTypes['Day'], ParentType, ContextType>;
  userIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DayResolvers = EnumResolverSignature<{ FRIDAY?: any, MONDAY?: any, SATURDAY?: any, SUNDAY?: any, THURSDAY?: any, TUESDAY?: any, WEDNESDAY?: any }, ResolversTypes['Day']>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addChannel?: Resolver<ResolversTypes['AddChannelResponse'], ParentType, ContextType, RequireFields<MutationaddChannelArgs, 'channelId' | 'channelName' | 'day' | 'userIds'>>;
  addUser?: Resolver<ResolversTypes['AddUserResponse'], ParentType, ContextType, RequireFields<MutationaddUserArgs, 'id' | 'name'>>;
  notify?: Resolver<ResolversTypes['NotifyResponse'], ParentType, ContextType, Partial<MutationnotifyArgs>>;
  registerUsers?: Resolver<ResolversTypes['RegisterUserResponse'], ParentType, ContextType, RequireFields<MutationregisterUsersArgs, 'channelId' | 'userIds'>>;
};

export type NotifyResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['NotifyResponse'] = ResolversParentTypes['NotifyResponse']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  channels?: Resolver<Array<ResolversTypes['Channel']>, ParentType, ContextType>;
  cronjobSecret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
};

export type RegisterUserResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['RegisterUserResponse'] = ResolversParentTypes['RegisterUserResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AddChannelResponse?: AddChannelResponseResolvers<ContextType>;
  AddUserResponse?: AddUserResponseResolvers<ContextType>;
  Channel?: ChannelResolvers<ContextType>;
  Day?: DayResolvers;
  Mutation?: MutationResolvers<ContextType>;
  NotifyResponse?: NotifyResponseResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RegisterUserResponse?: RegisterUserResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

