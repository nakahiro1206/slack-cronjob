'use client';
import { useGetUsersSuspenseQuery } from '@/documents/generated';

export const GraphQLDemo = () => {
  const { data, error } = useGetUsersSuspenseQuery();

  if (error) return <div>Error: {error?.message}</div>;

  return <div>
    {JSON.stringify(data?.users)}</div>;
};
