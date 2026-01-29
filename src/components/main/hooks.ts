import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import type { UpcomingSlot } from "@/types/upcoming-slot";

export const useMain = () => {
	// const [
	// 	upcomingSlots,
	// 	{ error: upcomingSlotsError, refetch: refetchUpcomingSlots },
	// ] = trpc.upcoming.getAll.useSuspenseQuery();
	const upcomingSlots: UpcomingSlot[] = [
		{
			channelId: "C11SM32QG",
			channelName: "1on1-thu",
			offlineUserIds: [
				"U038JUGUFPX",
				"U08EUBHUSMD",
				"U08GQMPSNJJ",
				"U01QXV6T31T",
				"U05083TTS74",
			],
			onlineUserIds: [
				"U08JSJ42YHG",
				"U050PTEDBGR",
				"U06KHTML5E1",
				"U09G5RNM5T6",
				"U093ENTKU94",
				"U010QM4A4PJ",
				"U016CJN53KQ",
				"U06PFA4MZU3",
				"U0A58SPH03X",
			],
			date: "2026-01-29T08:50:24.161+09:00",
		},
		{
			channelId: "C11SZDLJW",
			channelName: "1on1-wed",
			offlineUserIds: [
				"U06L8GYD7JL",
				"U08L1F4HUL9",
				"U050ACU035Y",
				"UFPHNL7GF",
				"U07P35G5UEM",
			],
			onlineUserIds: [
				"U06LAMK5B7S",
				"U09F9QCGCLR",
				"U08GQMREN94",
				"U06JPKKH4KU",
				"U0A6JFTC8QP",
				"U0A8CE726A3",
			],
			date: "2026-01-28T23:17:16.089+09:00",
		},
	];
	const upcomingSlotsError = null;
	const refetchUpcomingSlots = () => Promise.resolve();
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
		// if (upcomingSlotsError) toast.error(upcomingSlotsError.message);
	}, [channelsError, usersError]);

	return {
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
	};
};
