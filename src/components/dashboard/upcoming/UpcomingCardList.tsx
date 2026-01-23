import type { FC } from "react";
import { toast } from "sonner";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { trpc } from "@/lib/trpc/client";
import { useMobile } from "@/lib/useMobile";
import type { UpcomingSlot } from "@/types/upcoming-slot";
import type { User } from "@/types/user";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Spinner } from "../../ui/spinner";
import { UpcomingCard } from "./UpcomingCard";

type Props = {
	upcomingSlots: UpcomingSlot[] | undefined;
	users: User[] | undefined;
	refetchUpcomingSlots: () => void;
};
export const UpcomingCardList: FC<Props> = ({
	upcomingSlots,
	users,
	refetchUpcomingSlots,
}) => {
	const { isMobile } = useMobile();
	const {
		mutate: initializeUpcomingSlotsMutation,
		isPending: loadingInitializeUpcomingSlotsMutation,
	} = trpc.upcoming.initialize.useMutation();

	const overrideUpcomingSlots = () => {
		initializeUpcomingSlotsMutation(undefined, {
			onSuccess: () => {
				refetchUpcomingSlots();
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
					{upcomingSlots
						?.sort((a, b) => {
							return a.date.localeCompare(b.date);
						})
						.map((upcomingSlot) => (
							<UpcomingCard
								key={upcomingSlot.channelId}
								channel={upcomingSlot}
								refetchUpcomingSlots={refetchUpcomingSlots}
								users={users}
							/>
						))}
				</div>
			)}
			{isMobile && (
				<Carousel>
					<CarouselContent>
						{upcomingSlots
							?.sort((a, b) => {
								return a.date.localeCompare(b.date);
							})
							.map((upcomingSlot) => (
								<CarouselItem
									key={upcomingSlot.channelId}
									className="w-full px-2"
								>
									<UpcomingCard
										channel={upcomingSlot}
										refetchUpcomingSlots={refetchUpcomingSlots}
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
