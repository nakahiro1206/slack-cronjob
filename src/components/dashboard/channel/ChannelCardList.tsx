import { Card } from '../../ui/card';
import React, { FC } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { Channel } from '@/models/channel';
import type { User } from '@/models/user';
import { Button } from '../../ui/button';
import { dayToNumber } from '@/lib/date';
import { ChannelCard } from './ChannelCard';

type Props = {
    channels: Channel[] | undefined;
    users: User[] | undefined;
    openChannelDialog: () => void;
    refetchChannels: () => void;
}
export const ChannelCardList: FC<Props> = ({ channels, users, openChannelDialog, refetchChannels }) => {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold">Channels</div>
                <Button variant="outline" onClick={openChannelDialog}>
                    <PlusIcon className="h-4 w-4" /> Create Channel
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
            {channels?.sort((a, b) => {
                const aDayNumber = dayToNumber(a.day);
                const bDayNumber = dayToNumber(b.day);
                return aDayNumber - bDayNumber;
            }).map((channel) => (
                <ChannelCard 
                    channel={channel}
                    users={users}
                    refetchChannels={refetchChannels}
                />
            ))}
            </div>
        </Card>
    );
};