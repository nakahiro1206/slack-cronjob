'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create an http link for remote GraphQL server (if you have one)
const httpLink = createHttpLink({
  uri: 'https://slack-cronjob.vercel.app/api/graphql',
  fetchOptions: {
    cache: 'no-store',
  }
});

// Add auth headers if needed
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create Apollo Client instance
export const client = new ApolloClient({
  link: httpLink, //authLink.concat(httpLink),
  cache: new InMemoryCache(),
}); 

export const ApolloProvider = ({ children }: { children: ReactNode }) => {
  return (
    <BaseApolloProvider client={client}>
      {children}
    </BaseApolloProvider>
  );
}; 