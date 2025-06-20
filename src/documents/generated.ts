import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
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
  userIds: Array<Scalars['ID']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addChannel: AddChannelResponse;
  addUser: AddUserResponse;
  notify: NotifyResponse;
  registerUser: RegisterUserResponse;
};


export type MutationAddChannelArgs = {
  channelId: Scalars['ID']['input'];
  channelName: Scalars['String']['input'];
  userIds: Array<Scalars['ID']['input']>;
};


export type MutationAddUserArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationRegisterUserArgs = {
  channelId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
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

export type GetChannelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetChannelsQuery = { __typename?: 'Query', channels: Array<{ __typename?: 'Channel', channelId: string, channelName: string, userIds: Array<string> }> };

export type AddChannelMutationVariables = Exact<{
  channelId: Scalars['ID']['input'];
  channelName: Scalars['String']['input'];
  userIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type AddChannelMutation = { __typename?: 'Mutation', addChannel: { __typename?: 'AddChannelResponse', success: boolean, error?: string | null } };

export type RegisterUserMutationVariables = Exact<{
  channelId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type RegisterUserMutation = { __typename?: 'Mutation', registerUser: { __typename?: 'RegisterUserResponse', success: boolean, error?: string | null } };

export type GetCronjobSecretQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCronjobSecretQuery = { __typename?: 'Query', cronjobSecret: string };

export type NotifyMutationVariables = Exact<{ [key: string]: never; }>;


export type NotifyMutation = { __typename?: 'Mutation', notify: { __typename?: 'NotifyResponse', success: boolean, message?: string | null } };

export type GetUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, name: string }> };

export type AddUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
}>;


export type AddUserMutation = { __typename?: 'Mutation', addUser: { __typename?: 'AddUserResponse', success: boolean } };


export const GetChannelsDocument = gql`
    query GetChannels {
  channels {
    channelId
    channelName
    userIds
  }
}
    `;

/**
 * __useGetChannelsQuery__
 *
 * To run a query within a React component, call `useGetChannelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChannelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChannelsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetChannelsQuery(baseOptions?: Apollo.QueryHookOptions<GetChannelsQuery, GetChannelsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChannelsQuery, GetChannelsQueryVariables>(GetChannelsDocument, options);
      }
export function useGetChannelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChannelsQuery, GetChannelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChannelsQuery, GetChannelsQueryVariables>(GetChannelsDocument, options);
        }
export function useGetChannelsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetChannelsQuery, GetChannelsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetChannelsQuery, GetChannelsQueryVariables>(GetChannelsDocument, options);
        }
export type GetChannelsQueryHookResult = ReturnType<typeof useGetChannelsQuery>;
export type GetChannelsLazyQueryHookResult = ReturnType<typeof useGetChannelsLazyQuery>;
export type GetChannelsSuspenseQueryHookResult = ReturnType<typeof useGetChannelsSuspenseQuery>;
export type GetChannelsQueryResult = Apollo.QueryResult<GetChannelsQuery, GetChannelsQueryVariables>;
export const AddChannelDocument = gql`
    mutation AddChannel($channelId: ID!, $channelName: String!, $userIds: [ID!]!) {
  addChannel(channelId: $channelId, channelName: $channelName, userIds: $userIds) {
    success
    error
  }
}
    `;
export type AddChannelMutationFn = Apollo.MutationFunction<AddChannelMutation, AddChannelMutationVariables>;

/**
 * __useAddChannelMutation__
 *
 * To run a mutation, you first call `useAddChannelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddChannelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addChannelMutation, { data, loading, error }] = useAddChannelMutation({
 *   variables: {
 *      channelId: // value for 'channelId'
 *      channelName: // value for 'channelName'
 *      userIds: // value for 'userIds'
 *   },
 * });
 */
export function useAddChannelMutation(baseOptions?: Apollo.MutationHookOptions<AddChannelMutation, AddChannelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddChannelMutation, AddChannelMutationVariables>(AddChannelDocument, options);
      }
export type AddChannelMutationHookResult = ReturnType<typeof useAddChannelMutation>;
export type AddChannelMutationResult = Apollo.MutationResult<AddChannelMutation>;
export type AddChannelMutationOptions = Apollo.BaseMutationOptions<AddChannelMutation, AddChannelMutationVariables>;
export const RegisterUserDocument = gql`
    mutation RegisterUser($channelId: ID!, $userId: ID!) {
  registerUser(channelId: $channelId, userId: $userId) {
    success
    error
  }
}
    `;
export type RegisterUserMutationFn = Apollo.MutationFunction<RegisterUserMutation, RegisterUserMutationVariables>;

/**
 * __useRegisterUserMutation__
 *
 * To run a mutation, you first call `useRegisterUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerUserMutation, { data, loading, error }] = useRegisterUserMutation({
 *   variables: {
 *      channelId: // value for 'channelId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRegisterUserMutation(baseOptions?: Apollo.MutationHookOptions<RegisterUserMutation, RegisterUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterUserMutation, RegisterUserMutationVariables>(RegisterUserDocument, options);
      }
export type RegisterUserMutationHookResult = ReturnType<typeof useRegisterUserMutation>;
export type RegisterUserMutationResult = Apollo.MutationResult<RegisterUserMutation>;
export type RegisterUserMutationOptions = Apollo.BaseMutationOptions<RegisterUserMutation, RegisterUserMutationVariables>;
export const GetCronjobSecretDocument = gql`
    query GetCronjobSecret {
  cronjobSecret
}
    `;

/**
 * __useGetCronjobSecretQuery__
 *
 * To run a query within a React component, call `useGetCronjobSecretQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCronjobSecretQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCronjobSecretQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCronjobSecretQuery(baseOptions?: Apollo.QueryHookOptions<GetCronjobSecretQuery, GetCronjobSecretQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCronjobSecretQuery, GetCronjobSecretQueryVariables>(GetCronjobSecretDocument, options);
      }
export function useGetCronjobSecretLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCronjobSecretQuery, GetCronjobSecretQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCronjobSecretQuery, GetCronjobSecretQueryVariables>(GetCronjobSecretDocument, options);
        }
export function useGetCronjobSecretSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCronjobSecretQuery, GetCronjobSecretQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCronjobSecretQuery, GetCronjobSecretQueryVariables>(GetCronjobSecretDocument, options);
        }
export type GetCronjobSecretQueryHookResult = ReturnType<typeof useGetCronjobSecretQuery>;
export type GetCronjobSecretLazyQueryHookResult = ReturnType<typeof useGetCronjobSecretLazyQuery>;
export type GetCronjobSecretSuspenseQueryHookResult = ReturnType<typeof useGetCronjobSecretSuspenseQuery>;
export type GetCronjobSecretQueryResult = Apollo.QueryResult<GetCronjobSecretQuery, GetCronjobSecretQueryVariables>;
export const NotifyDocument = gql`
    mutation Notify {
  notify {
    success
    message
  }
}
    `;
export type NotifyMutationFn = Apollo.MutationFunction<NotifyMutation, NotifyMutationVariables>;

/**
 * __useNotifyMutation__
 *
 * To run a mutation, you first call `useNotifyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useNotifyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [notifyMutation, { data, loading, error }] = useNotifyMutation({
 *   variables: {
 *   },
 * });
 */
export function useNotifyMutation(baseOptions?: Apollo.MutationHookOptions<NotifyMutation, NotifyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<NotifyMutation, NotifyMutationVariables>(NotifyDocument, options);
      }
export type NotifyMutationHookResult = ReturnType<typeof useNotifyMutation>;
export type NotifyMutationResult = Apollo.MutationResult<NotifyMutation>;
export type NotifyMutationOptions = Apollo.BaseMutationOptions<NotifyMutation, NotifyMutationVariables>;
export const GetUsersDocument = gql`
    query GetUsers {
  users {
    id
    name
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions?: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export function useGetUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersSuspenseQueryHookResult = ReturnType<typeof useGetUsersSuspenseQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const AddUserDocument = gql`
    mutation AddUser($id: ID!, $name: String!) {
  addUser(id: $id, name: $name) {
    success
  }
}
    `;
export type AddUserMutationFn = Apollo.MutationFunction<AddUserMutation, AddUserMutationVariables>;

/**
 * __useAddUserMutation__
 *
 * To run a mutation, you first call `useAddUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserMutation, { data, loading, error }] = useAddUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useAddUserMutation(baseOptions?: Apollo.MutationHookOptions<AddUserMutation, AddUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddUserMutation, AddUserMutationVariables>(AddUserDocument, options);
      }
export type AddUserMutationHookResult = ReturnType<typeof useAddUserMutation>;
export type AddUserMutationResult = Apollo.MutationResult<AddUserMutation>;
export type AddUserMutationOptions = Apollo.BaseMutationOptions<AddUserMutation, AddUserMutationVariables>;