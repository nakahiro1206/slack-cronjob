import { Card } from '../../ui/card';
import React, { FC, useState } from 'react';
import type { UpcomingSlot } from '@/models/channel';
import type { User } from '@/models/user';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { Spinner } from '../../ui/spinner';
import { trpc } from '@/lib/trpc/client';
import { dayToNumber, getJapanTimeFromISOString } from '@/lib/date';
import { UpcomingCard } from './UpcomingCard';


type Props = {
    upcomingSlots: UpcomingSlot[] | undefined;
    users: User[] | undefined;
    refetchUpcomingSlots: () => void;
}
export const UpcomingCardList: FC<Props> = ({ upcomingSlots: channels, users, refetchUpcomingSlots: refetchChannels }) => {
    const {mutate: initializeUpcomingSlotsMutation, isPending: loadingInitializeUpcomingSlotsMutation} = trpc.upcoming.initialize.useMutation();

    const overrideUpcomingSlots = () => {
        initializeUpcomingSlotsMutation(undefined, {
            onSuccess: () => {
                refetchChannels();
            },
            onError: (error) => {
                toast.error(error.message);
            }
        });
    }
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold">Channels</div>
                <Button variant="destructive" onClick={overrideUpcomingSlots} disabled={loadingInitializeUpcomingSlotsMutation}>
                    {loadingInitializeUpcomingSlotsMutation ? <Spinner /> : 'Force Reset'}
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
            {channels?.sort((a, b) => {
                return a.date.localeCompare(b.date);
            }).map((channel) => (
                <UpcomingCard 
                    channel={channel}
                    refetchChannels={refetchChannels}
                    users={users}
                />
            ))}
            </div>
        </Card>
    );
};