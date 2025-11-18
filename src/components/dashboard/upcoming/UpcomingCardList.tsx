import React, { type FC, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import type { UpcomingSlot } from "@/models/channel";
import type { User } from "@/models/user";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Spinner } from "../../ui/spinner";
import { UpcomingCard } from "./UpcomingCard";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useMobile } from "@/lib/useMobile";

type Props = {
	upcomingSlots: UpcomingSlot[] | undefined;
	users: User[] | undefined;
	refetchUpcomingSlots: () => void;
};
export const UpcomingCardList: FC<Props> = ({
	upcomingSlots: channels,
	users,
	refetchUpcomingSlots: refetchChannels,
}) => {
	const { isMobile } = useMobile();
	const {
		mutate: initializeUpcomingSlotsMutation,
		isPending: loadingInitializeUpcomingSlotsMutation,
	} = trpc.upcoming.initialize.useMutation();

	const overrideUpcomingSlots = () => {
		initializeUpcomingSlotsMutation(undefined, {
			onSuccess: () => {
				refetchChannels();
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	};
	return (
		<Card className="p-4">
			<div className="flex items-center justify-between mb-2">
				<div className="text-xl font-semibold">
					Upcoming 1on1s within a week
				</div>
				<Button
					variant="destructive"
					onClick={overrideUpcomingSlots}
					disabled={loadingInitializeUpcomingSlotsMutation}
				>
					{loadingInitializeUpcomingSlotsMutation ? <Spinner /> : "Force Reset"}
				</Button>
			</div>
			{isMobile === false && (
				<div className="grid grid-cols-2 gap-4">
					{channels
						?.sort((a, b) => {
							return a.date.localeCompare(b.date);
						})
						.map((channel) => (
							<UpcomingCard
								key={channel.channelId}
								channel={channel}
								refetchChannels={refetchChannels}
								users={users}
							/>
						))}
				</div>
			)}
			{isMobile && (
				<Carousel>
					<CarouselContent>
						{channels
							?.sort((a, b) => {
								return a.date.localeCompare(b.date);
							})
							.map((channel) => (
								<CarouselItem key={channel.channelId} className="w-full px-2">
									<UpcomingCard
										channel={channel}
										refetchChannels={refetchChannels}
										users={users}
									/>
								</CarouselItem>
							))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			)}
		</Card>
	);
};
