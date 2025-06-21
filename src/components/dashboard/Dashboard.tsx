import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChannelDialog } from './ChannelDialog';
import { UserDialog } from './UserDialog';
import { ChannelCard } from './ChannelCard';
import { UserCard } from './UserCard';
import { trpc } from '@/lib/trpc/client';

export const Dashboard = () => {

  // Dialog state
  const [isChannelDialogOpen, setChannelDialogOpen] = useState(false);
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);

  const [channels, {error: channelsError, refetch: refetchChannels}] = trpc.channel.getAll.useSuspenseQuery();
  const [users, {error: usersError, refetch: refetchUsers}] = trpc.user.getAll.useSuspenseQuery();

  useEffect(() => {
    if (channelsError) toast.error(channelsError.message);
    if (usersError) toast.error(usersError.message);
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
            channels={channels} 
            users={users.map((user) => ({
                userId: user.id,
                userName: user.name,
            }))} 
            openChannelDialog={openChannelDialog} 
            />
        <UserCard 
            users={users.map((user) => ({
                userId: user.id,
                userName: user.name,
            }))} 
            openUserDialog={openUserDialog} 
            />
      </div>

      {/* Channel Dialog */}
      <ChannelDialog
        isOpen={isChannelDialogOpen}
        users={users.map((user) => ({
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
