import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Test } from "@/components/test/Test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";
import { ChannelCardList } from "../dashboard/channel/ChannelCardList";
import { ChannelDialog } from "../dashboard/channel/CreateChannelDialog";
import { UpcomingCardList } from "../dashboard/upcoming/UpcomingCardList";
import { UserCard } from "../dashboard/user/UserCard";
import { UserDialog } from "../dashboard/user/UserDialog";
import { Spinner } from "../ui/spinner";

export const MainInternal = () => {
	const [
		upcomingSlots,
		{ error: upcomingSlotsError, refetch: refetchUpcomingSlots },
	] = trpc.upcoming.getAll.useSuspenseQuery();
	const [channels, { error: channelsError, refetch: refetchChannels }] =
		trpc.channel.getAll.useSuspenseQuery();
	const [users, { error: usersError, refetch: refetchUsers }] =
		trpc.user.getAll.useSuspenseQuery();

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
		if (upcomingSlotsError) toast.error(upcomingSlotsError.message);
	}, [channelsError, usersError, upcomingSlotsError]);

	return (
		<>
			<TabsContent value="upcoming">
				<UpcomingCardList
					upcomingSlots={upcomingSlots}
					users={users.map((user) => ({
						userId: user.id,
						userName: user.name,
						huddleUrl: user.huddleUrl,
					}))}
					refetchUpcomingSlots={refetchUpcomingSlots}
				/>
			</TabsContent>
			<TabsContent value="channels">
				<>
					<ChannelCardList
						refetchChannels={refetchChannels}
						channels={channels}
						users={users.map((user) => ({
							userId: user.id,
							userName: user.name,
							huddleUrl: user.huddleUrl,
						}))}
						openChannelDialog={openChannelDialog}
					/>
					{/* Channel Dialog */}
					<ChannelDialog
						isOpen={isChannelDialogOpen}
						users={
							users.map((user) => ({
								userId: user.id,
								userName: user.name,
								huddleUrl: user.huddleUrl,
							})) || []
						}
						onClose={closeChannelDialog}
						refetchChannels={refetchChannels}
					/>
				</>
			</TabsContent>

			<TabsContent value="users">
				<>
					<UserCard
						users={
							users.map((user) => ({
								userId: user.id,
								userName: user.name,
								huddleUrl: user.huddleUrl,
							})) || []
						}
						openUserDialog={openUserDialog}
						refetchUsers={refetchUsers}
					/>
					{/* User Dialog */}
					<UserDialog
						isOpen={isUserDialogOpen}
						onClose={closeUserDialog}
						refetchUsers={refetchUsers}
					/>
				</>
			</TabsContent>
			<TabsContent value="test">
				<Test refetchUpcomingSlots={refetchUpcomingSlots} />
			</TabsContent>
		</>
	);
};

export const Main = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto p-8">
				<h1 className="text-3xl font-bold mb-6 text-gray-800">
					1on1 Organizer
				</h1>

				<Tabs defaultValue="upcoming" className="w-full">
					<TabsList className="grid w-full grid-cols-4 mb-8">
						<TabsTrigger value="upcoming">🗓️ Upcoming</TabsTrigger>
						<TabsTrigger value="channels">⚙️ Channels</TabsTrigger>
						<TabsTrigger value="users">👥 Users</TabsTrigger>
						<TabsTrigger value="test">🧪 Test</TabsTrigger>
					</TabsList>

					<Suspense
						fallback={
							<>
								<TabsContent value="upcoming">
									<div className="p-8 text-center">
										<Spinner />
									</div>
								</TabsContent>
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
								<TabsContent value="test">
									<div className="p-8 text-center">
										<Spinner />
									</div>
								</TabsContent>
							</>
						}
					>
						<MainInternal />
					</Suspense>
				</Tabs>
			</div>
		</div>
	);
};
