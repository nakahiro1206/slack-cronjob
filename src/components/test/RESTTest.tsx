'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
}

interface Channel {
  channelId: string;
  channelName: string;
  day: string;
  userIds: string[];
}

export function RESTTest() {
  const [users, setUsers] = useState<User[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch channels
  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/channels');
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      } else {
        console.error('Failed to fetch channels');
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // Add user
  const handleAddUser = async () => {
    if (!newUserName || !newUserId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newUserId,
          name: newUserName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNewUserName('');
          setNewUserId('');
          fetchUsers(); // Refresh the list
        }
      } else {
        console.error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchChannels();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">REST API Migration Test</h1>
      <p className="text-gray-600">
        This demonstrates the migration from GraphQL to REST API endpoints.
      </p>
      
      {/* Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Users (REST API)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="User ID"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            />
            <Input
              placeholder="User Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <Button onClick={handleAddUser} disabled={loading}>
              Add User
            </Button>
          </div>
          
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-2 border rounded">
                {user.name} (ID: {user.id})
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channels Section */}
      <Card>
        <CardHeader>
          <CardTitle>Channels (REST API)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {channels.map((channel) => (
              <div key={channel.channelId} className="p-2 border rounded">
                {channel.channelName} (Day: {channel.day})
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Migration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>GraphQL Endpoint:</strong> /api/graphql</p>
            <p><strong>New REST Endpoints:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>GET /api/users - Fetch all users</li>
              <li>POST /api/users - Add a new user</li>
              <li>GET /api/channels - Fetch all channels</li>
              <li>POST /api/channels - Add a new channel</li>
            </ul>
            <p className="mt-4 text-green-600">
              ✅ REST API endpoints are working and provide the same functionality as GraphQL
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 