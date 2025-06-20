# GraphQL Implementation

This project now includes GraphQL and Apollo Client integration that replicates the existing model structure.

## Installation

The following packages have been installed:

- `@apollo/client` - Apollo Client for React
- `graphql` - GraphQL JavaScript reference implementation

## Project Structure

```
src/
├── graphql/
│   ├── schema/
│   │   └── schema.ts          # GraphQL schema definitions
│   ├── resolvers/
│   │   ├── userResolvers.ts   # User resolvers
│   │   ├── channelResolvers.ts # Channel resolvers
│   │   └── index.ts           # Combined resolvers
│   └── types/
│       ├── user.ts            # User GraphQL types and operations
│       ├── channel.ts         # Channel GraphQL types and operations
│       └── index.ts           # Type exports
├── storage/
│   └── graphql/
│       ├── user.ts            # User GraphQL hooks and functions
│       ├── channel.ts         # Channel GraphQL hooks and functions
│       └── index.ts           # GraphQL storage exports
├── lib/
│   └── apollo-client.ts       # Apollo Client configuration
└── components/
    ├── ApolloProvider.tsx     # Apollo Provider wrapper
    └── GraphQLDemo.tsx        # Demo component showcasing GraphQL usage
```

## Features

### 1. GraphQL Schema

- **User Type**: `userId` and `userName` fields
- **Channel Type**: `channelId`, `channelName`, and `userIds` fields
- **Queries**: `users` and `channels`
- **Mutations**: `addUser`, `addChannel`, and `registerUserToChannel`

### 2. Apollo Client Setup

- Configured with local resolvers for client-side GraphQL operations
- Includes authentication support via headers
- Error handling and caching configuration

### 3. React Hooks

- `useUsers()` - Fetch all users
- `useAddUser()` - Add a new user
- `useChannels()` - Fetch all channels
- `useAddChannel()` - Add a new channel
- `useRegisterUserToChannel()` - Register a user to a channel

### 4. Type Safety

- Full TypeScript support with generated types
- GraphQL fragments for reusable field selections
- Type-safe mutations and queries

## Usage

### Basic Hook Usage

```typescript
import { useUsers, useAddUser } from "@/storage/graphql/user";
import { useChannels, useAddChannel } from "@/storage/graphql/channel";

function MyComponent() {
  const { users, loading, error } = useUsers();
  const { addUser } = useAddUser();
  const { channels } = useChannels();
  const { addChannel } = useAddChannel();

  const handleAddUser = async () => {
    const result = await addUser({
      userId: "user_123",
      userName: "John Doe",
    });

    result.match(
      () => console.log("User added successfully"),
      (error) => console.error("Failed to add user:", error)
    );
  };

  // ... rest of component
}
```

### Direct Function Usage

```typescript
import { getUsersGraphQL, addUserGraphQL } from "@/storage/graphql/user";

async function fetchUsers() {
  const result = await getUsersGraphQL();
  return result.match(
    (users) => users,
    (error) => {
      console.error("Error:", error);
      return [];
    }
  );
}
```

## Demo

Visit `/graphql-demo` to see a working example of the GraphQL implementation in action. The demo includes:

- Adding users and channels
- Viewing all users and channels
- Registering users to channels
- Error handling and loading states

## Integration with Existing Code

The GraphQL implementation is designed to work alongside the existing Firebase-based storage:

1. **Fallback Pattern**: GraphQL functions fall back to existing storage when no GraphQL server is available
2. **Same Interfaces**: Uses the same `User` and `Channel` models
3. **Result Pattern**: Maintains the same `Result<T, E>` pattern for error handling
4. **Gradual Migration**: You can gradually migrate from Firebase to GraphQL

## Configuration

### Environment Variables

Set the following environment variable to point to your GraphQL server:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

### Authentication

The Apollo Client is configured to include authentication headers. Set your auth token in localStorage:

```javascript
localStorage.setItem("authToken", "your-jwt-token");
```

## Next Steps

1. **Set up a GraphQL server** (e.g., using Apollo Server)
2. **Replace fallback functions** with actual GraphQL server calls
3. **Add more complex queries** (filtering, pagination, etc.)
4. **Implement real-time subscriptions** for live updates
5. **Add GraphQL schema validation** and introspection

## Benefits

- **Type Safety**: Full TypeScript support with generated types
- **Declarative Data Fetching**: Use GraphQL queries to specify exactly what data you need
- **Caching**: Apollo Client provides intelligent caching out of the box
- **Developer Experience**: Better tooling and debugging with GraphQL
- **Performance**: Only fetch the data you need, reducing over-fetching
- **Flexibility**: Easy to evolve the API without breaking existing clients
