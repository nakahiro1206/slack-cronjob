import { Suspense } from "react";
import { Test } from "@/components/test/Test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelCardList } from "../dashboard/channel/ChannelCardList";
import { ChannelDialog } from "../dashboard/channel/CreateChannelDialog";
import { UpcomingCardList } from "../dashboard/upcoming/UpcomingCardList";
import { UserCard } from "../dashboard/user/UserCard";
import { UserDialog } from "../dashboard/user/UserDialog";
import { Spinner } from "../ui/spinner";
import { useMain } from "./hooks";
const MainInternal = () => {
	const {
		upcomingSlots,
		users,
		channels,
		refetchUpcomingSlots,
		refetchChannels,
		refetchUsers,
		isChannelDialogOpen,
		openChannelDialog,
		closeChannelDialog,
		isUserDialogOpen,
		openUserDialog,
		closeUserDialog,
	} = useMain();

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
			</TabsContent>

			<TabsContent value="users">
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
