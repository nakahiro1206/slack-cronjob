# GraphQL to REST API Migration Guide

This document outlines the migration from GraphQL to REST API endpoints for the Slack Bolt Cronjob project.

## Overview

The project has been migrated from Apollo GraphQL to REST API endpoints, providing:

- Simpler API structure
- Better performance
- Easier debugging
- Standard HTTP methods
- No complex setup required

## File Structure

### New REST API Structure

```
src/
├── app/
│   └── api/
│       ├── users/
│       │   └── route.ts           # User operations (GET, POST)
│       ├── channels/
│       │   └── route.ts           # Channel operations (GET, POST)
│       └── cronjob/
│           └── route.ts           # Cronjob operations (GET, POST)
└── components/
    └── test/
        └── RESTTest.tsx           # REST API test component
```

## Migration Mapping

### GraphQL Queries → REST API GET Endpoints

| GraphQL         | REST API            |
| --------------- | ------------------- |
| `channels`      | `GET /api/channels` |
| `users`         | `GET /api/users`    |
| `cronjobSecret` | `GET /api/cronjob`  |

### GraphQL Mutations → REST API POST Endpoints

| GraphQL         | REST API                                      |
| --------------- | --------------------------------------------- |
| `addChannel`    | `POST /api/channels`                          |
| `addUser`       | `POST /api/users`                             |
| `registerUsers` | `POST /api/channels` (with different payload) |
| `notify`        | `POST /api/cronjob`                           |

## Usage Examples

### Basic Query

```typescript
// GraphQL
const { data: users } = useQuery(GET_USERS);

// REST API
const response = await fetch("/api/users");
const users = await response.json();
```

### Basic Mutation

```typescript
// GraphQL
const [addUser] = useMutation(ADD_USER);
addUser({ variables: { id: "123", name: "John" } });

// REST API
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: "123", name: "John" }),
});
const result = await response.json();
```

### With Error Handling

```typescript
// REST API with error handling
try {
  const response = await fetch("/api/users");
  if (response.ok) {
    const users = await response.json();
    // Handle success
  } else {
    // Handle error
    console.error("Failed to fetch users");
  }
} catch (error) {
  console.error("Network error:", error);
}
```

## API Endpoints

### Users API

- **GET /api/users** - Fetch all users
- **POST /api/users** - Add a new user
  - Body: `{ id: string, name: string }`
  - Response: `{ success: boolean }`

### Channels API

- **GET /api/channels** - Fetch all channels
- **POST /api/channels** - Add a new channel
  - Body: `{ channelId: string, channelName: string, day: string, userIds: string[] }`
  - Response: `{ success: boolean }`

### Cronjob API

- **GET /api/cronjob** - Get cronjob secret
  - Response: `{ secret: string }`
- **POST /api/cronjob** - Send notifications
  - Body: `{ channelIds?: string[] }`
  - Response: `{ success: boolean, message: string }`

## Benefits of REST API

1. **Simplicity**: Standard HTTP methods and status codes
2. **Performance**: No GraphQL overhead, direct data fetching
3. **Debugging**: Easy to test with tools like Postman or curl
4. **Caching**: Standard HTTP caching mechanisms
5. **Compatibility**: Works with any HTTP client

## Migration Checklist

- [x] Create REST API endpoints
- [x] Migrate user operations
- [x] Migrate channel operations
- [x] Migrate cronjob operations
- [x] Create test component
- [x] Update documentation
- [ ] Remove GraphQL dependencies
- [ ] Update all components to use REST API
- [ ] Test all endpoints thoroughly

## Testing

The migration includes a test page with tabs showing both the original GraphQL implementation and the new REST API implementation. You can switch between them to compare functionality.

### Testing with curl

```bash
# Get all users
curl http://localhost:3000/api/users

# Add a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"id":"123","name":"John Doe"}'

# Get all channels
curl http://localhost:3000/api/channels

# Send notifications
curl -X POST http://localhost:3000/api/cronjob \
  -H "Content-Type: application/json" \
  -d '{"channelIds":["channel1","channel2"]}'
```

## Next Steps

1. Replace GraphQL queries in components with fetch calls
2. Update error handling to use HTTP status codes
3. Remove Apollo GraphQL dependencies
4. Update any remaining GraphQL operations
5. Test thoroughly to ensure all functionality works as expected
6. Consider adding request/response validation with Zod
7. Add proper error handling and loading states

## Example Component Migration

### Before (GraphQL)

```typescript
const { data: users, loading } = useQuery(GET_USERS);
const [addUser] = useMutation(ADD_USER);

const handleAddUser = () => {
  addUser({ variables: { id: "123", name: "John" } });
};
```

### After (REST API)

```typescript
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

const fetchUsers = async () => {
  const response = await fetch("/api/users");
  const data = await response.json();
  setUsers(data);
};

const handleAddUser = async () => {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "123", name: "John" }),
  });
  if (response.ok) {
    fetchUsers(); // Refresh the list
  }
};
```
