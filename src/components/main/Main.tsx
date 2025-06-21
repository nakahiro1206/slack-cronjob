import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense, useEffect, useState } from 'react';
import { Test } from "@/components/test/Test";
import { UserCard } from '../dashboard/UserCard';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner';
import { UserDialog } from '../dashboard/UserDialog';
import { ChannelDialog } from '../dashboard/ChannelDialog';
import { ChannelCard } from '../dashboard/ChannelCard';
import { trpc } from '@/lib/trpc/client';
import { Card } from '../ui/card';

export const MainInternal = () => {
  const [channels, {error: channelsError, refetch: refetchChannels}] = trpc.channel.getAll.useSuspenseQuery();
  const [users, {error: usersError, refetch: refetchUsers}] = trpc.user.getAll.useSuspenseQuery();

  // Dialog state
  const [isChannelDialogOpen, setChannelDialogOpen] = useState(false);
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
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

  useEffect(() => {
    if (channelsError) toast.error(channelsError.message);
    if (usersError) toast.error(usersError.message);
  }, [channelsError, usersError]);

  return (
  <>
    <TabsContent value="channels">
      <>
        <ChannelCard 
              refetchChannels={refetchChannels}
              channels={channels} 
              users={users.map((user) => ({
                  userId: user.id,
                  userName: user.name,
              }))} 
              openChannelDialog={openChannelDialog} 
              />
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
      </>
    </TabsContent>

    <TabsContent value="users">
      <>
          <UserCard users={users.map((user) => ({
            userId: user.id,
            userName: user.name,
              })) || []} openUserDialog={openUserDialog} />
          {/* User Dialog */}
          <UserDialog
              isOpen={isUserDialogOpen}
              onClose={closeUserDialog}
              refetchUsers={refetchUsers}
          />
      </>
    </TabsContent>
  </>
  )
}

export const Main = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">1on1 Organizer</h1>

        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="channels">⚙️ Channels</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="test">🧪 Test</TabsTrigger>
          </TabsList>

          <Suspense fallback={
            <>
            <TabsContent value="channels">
                <div className="p-8 text-center">
                  <Spinner />
                </div>
          </TabsContent>
          <TabsContent value="users">
                <div className="p-8 text-center">
                  <Spinner />
                </div>
          </TabsContent>
          </>
          }>
            <MainInternal />
          </Suspense>

          <TabsContent value="test">
            <Card className="p-4">
              <Suspense fallback={<div className="text-center">Loading test data...</div>}>
                <Test />
              </Suspense>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
