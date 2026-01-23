import { PlusIcon } from "@heroicons/react/24/solid";
import type { FC } from "react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { dayToNumber } from "@/lib/date";
import { useMobile } from "@/lib/useMobile";
import type { Channel } from "@/types/channel";
import type { User } from "@/types/user";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { ChannelCard } from "./ChannelCard";

type Props = {
	channels: Channel[] | undefined;
	users: User[] | undefined;
	openChannelDialog: () => void;
	refetchChannels: () => void;
};
export const ChannelCardList: FC<Props> = ({
	channels,
	users,
	openChannelDialog,
	refetchChannels,
}) => {
	const { isMobile } = useMobile();
	return (
		<Card className="p-4">
			<div className="flex items-center justify-between mb-2">
				<div className="text-xl font-semibold">Channels</div>
				<Button variant="outline" onClick={openChannelDialog}>
					<PlusIcon className="h-4 w-4" /> Create Channel
				</Button>
			</div>
			{isMobile === false && (
				<div className="grid grid-cols-2 gap-4">
					{channels
						?.sort((a, b) => {
							const aDayNumber = dayToNumber(a.day);
							const bDayNumber = dayToNumber(b.day);
							return aDayNumber - bDayNumber;
						})
						.map((channel) => (
							<ChannelCard
								key={channel.channelId}
								channel={channel}
								users={users}
								refetchChannels={refetchChannels}
							/>
						))}
				</div>
			)}
			{isMobile && (
				<Carousel>
					<CarouselContent>
						{channels
							?.sort((a, b) => {
								const aDayNumber = dayToNumber(a.day);
								const bDayNumber = dayToNumber(b.day);
								return aDayNumber - bDayNumber;
							})
							.map((channel) => (
								<CarouselItem key={channel.channelId}>
									<ChannelCard
										key={channel.channelId}
										channel={channel}
										users={users}
										refetchChannels={refetchChannels}
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
