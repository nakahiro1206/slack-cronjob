import React, { useEffect, useState } from 'react';
import { useGetChannelsSuspenseQuery, useGetUsersSuspenseQuery } from '@/documents/generated';
import { toast } from 'sonner';
import { ChannelDialog } from './ChannelDialog';
import { UserDialog } from './UserDialog';
import { ChannelCard } from './ChannelCard';
import { UserCard } from './UserCard';

export const Dashboard = () => {

  // Dialog state
  const [isChannelDialogOpen, setChannelDialogOpen] = useState(false);
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);

  const { data: channelsData, error: channelsError, refetch: refetchChannels } = useGetChannelsSuspenseQuery();
  const { data: usersData, error: usersError, refetch: refetchUsers } = useGetUsersSuspenseQuery();

  useEffect(() => {
    const errorNotification = (error: Error) => {
      toast.error(error.message);
    };
    if (channelsError) errorNotification(channelsError);
    if (usersError) errorNotification(usersError);
  }, [channelsError, usersError]);

  // Create Channel Dialog
  const openChannelDialog = () => {
    setChannelDialogOpen(true);
  };
  const closeChannelDialog = () => setChannelDialogOpen(false);

  // Create User Dialog
  const openUserDialog = () => {
    setUserDialogOpen(true);
  };
  const closeUserDialog = () => setUserDialogOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex gap-8">
        <ChannelCard 
            refetchChannels={refetchChannels}
            channels={channelsData?.channels} 
            users={usersData?.users.map((user) => ({
                userId: user.id,
                userName: user.name,
            }))} 
            openChannelDialog={openChannelDialog} 
            />
        <UserCard 
            users={usersData?.users.map((user) => ({
                userId: user.id,
                userName: user.name,
            }))} 
            openUserDialog={openUserDialog} 
            />
      </div>

      {/* Channel Dialog */}
      <ChannelDialog
        isOpen={isChannelDialogOpen}
        users={usersData?.users.map((user) => ({
            userId: user.id,
            userName: user.name,
        })) || []}
        onClose={closeChannelDialog}
        refetchChannels={refetchChannels}
      />

      {/* User Dialog */}
      <UserDialog
        isOpen={isUserDialogOpen}
        onClose={closeUserDialog}
        refetchUsers={refetchUsers}
      />
    </div>
  );
};
