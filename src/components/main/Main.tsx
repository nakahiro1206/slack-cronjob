import { Dashboard } from '@/components/dashboard/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense, useEffect, useState } from 'react';
import { Test } from "@/components/test/Test";
import { UserCard } from '../dashboard/UserCard';
import { useGetChannelsSuspenseQuery, useGetUsersSuspenseQuery } from '@/documents/generated';
import { toast } from 'sonner';
import { Spinner } from '../ui/spinner';
import { UserDialog } from '../dashboard/UserDialog';
import { ChannelDialog } from '../dashboard/ChannelDialog';
import { ChannelCard } from '../dashboard/ChannelCard';

export const MainInternal = () => {
  const { data: channelsData, error: channelsError, refetch: refetchChannels } = useGetChannelsSuspenseQuery();
  const { data: usersData, error: usersError, refetch: refetchUsers } = useGetUsersSuspenseQuery();

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
    const errorNotification = (error: Error) => {
      toast.error(error.message);
    };
    if (channelsError) errorNotification(channelsError);
    if (usersError) errorNotification(usersError);
  }, [channelsError, usersError]);

  return (
    <>
    <TabsContent value="channels">
    <div className="bg-white rounded-lg shadow-sm">
      <ChannelCard 
            refetchChannels={refetchChannels}
            channels={channelsData?.channels} 
            users={usersData?.users.map((user) => ({
                userId: user.id,
                userName: user.name,
            }))} 
            openChannelDialog={openChannelDialog} 
            />
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
    </div>
  </TabsContent>

  <TabsContent value="users" className="flex justify-center gap-4">
    <div className="w-1/2 bg-white rounded-lg shadow-sm">
        <UserCard users={usersData?.users.map((user) => ({
          userId: user.id,
          userName: user.name,
            })) || []} openUserDialog={openUserDialog} />
        {/* User Dialog */}
        <UserDialog
            isOpen={isUserDialogOpen}
            onClose={closeUserDialog}
            refetchUsers={refetchUsers}
        />
    </div>
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
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Suspense fallback={<div className="text-center">Loading test data...</div>}>
                <Test />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
