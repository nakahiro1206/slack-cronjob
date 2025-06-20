'use client';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function TRPCTest() {
  const [newUserName, setNewUserName] = useState('');
  const [newUserId, setNewUserId] = useState('');

  // tRPC queries and mutations
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.user.getAll.useQuery();
  const { data: channels, isLoading: channelsLoading } = trpc.channel.getAll.useQuery();
  const { data: cronSecret } = trpc.cronjob.getSecret.useQuery();

  const addUserMutation = trpc.user.add.useMutation({
    onSuccess: () => {
      refetchUsers();
      setNewUserName('');
      setNewUserId('');
    },
  });

  const addChannelMutation = trpc.channel.add.useMutation({
    onSuccess: () => {
      // Refetch channels
    },
  });

  const notifyMutation = trpc.cronjob.notify.useMutation();

  const handleAddUser = () => {
    if (newUserName && newUserId) {
      addUserMutation.mutate({
        id: newUserId,
        name: newUserName,
      });
    }
  };

  const handleNotify = () => {
    notifyMutation.mutate({
      channelIds: channels?.map(c => c.channelId) || [],
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">tRPC Migration Test</h1>
      
      {/* Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
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
            <Button onClick={handleAddUser} disabled={addUserMutation.isPending}>
              Add User
            </Button>
          </div>
          
          {usersLoading ? (
            <p>Loading users...</p>
          ) : (
            <div className="space-y-2">
              {users?.map((user) => (
                <div key={user.id} className="p-2 border rounded">
                  {user.name} (ID: {user.id})
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channels Section */}
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {channelsLoading ? (
            <p>Loading channels...</p>
          ) : (
            <div className="space-y-2">
              {channels?.map((channel) => (
                <div key={channel.channelId} className="p-2 border rounded">
                  {channel.channelName} (Day: {channel.day})
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cronjob Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cronjob</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Secret: {cronSecret}</p>
          <Button 
            onClick={handleNotify} 
            disabled={notifyMutation.isPending}
          >
            Send Notifications
          </Button>
          {notifyMutation.data && (
            <p>Notification result: {notifyMutation.data.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 