import { Card } from '../../ui/card';
import React, { FC, useState } from 'react';
import type { Channel } from '@/models/channel';
import type { User } from '@/models/user';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { UserCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { Spinner } from '../../ui/spinner';
import { trpc } from '@/lib/trpc/client';
import { Checkbox } from '../../ui/checkbox';
import { UserSelectDialogButton } from './DialogButton';
import { Badge } from '@/components/ui/badge';

type Props = {
    channel: Channel;
    users: User[] | undefined;
    refetchChannels: () => void;
}
export const ChannelCard: FC<Props> = ({ channel, users, refetchChannels }) => {
    const [isHandlingRemoveUsers, setIsHandlingRemoveUsers] = useState(false);
    const [selectedRemoveUserIds, setSelectedRemoveUserIds] = useState<string[]>([]);
    const {mutate: removeUsersMutation, isPending: loadingRemoveUsersMutation } = trpc.channel.removeUsers.useMutation();

    const startHandlingRemoveUsers = (channelId: string) => {
        setIsHandlingRemoveUsers(true);
        setSelectedRemoveUserIds([]);
    }

    const endHandlingRemoveUsers = () => {
        setIsHandlingRemoveUsers(false);
        setSelectedRemoveUserIds([]);
    }

    const toggleSelectedRemoveUser = (userId: string) => {
        if (selectedRemoveUserIds.includes(userId)) {
            setSelectedRemoveUserIds(selectedRemoveUserIds.filter(id => id !== userId));
        } else {
            setSelectedRemoveUserIds([...selectedRemoveUserIds, userId]);
        }
    }

    const executeRemoveUsers = () => {
        if (selectedRemoveUserIds.length === 0) {
            toast.error('No users selected');
            return;
        }
        removeUsersMutation({ channelId: channel.channelId, userIds: selectedRemoveUserIds }, {
            onSuccess: (result) => {
                if (result.success) {
                    toast.success('Users removed successfully');
                    refetchChannels();
                    endHandlingRemoveUsers();
                } else {
                    toast.error('Failed to remove users');
                }
            }, 
            onError: (error) => {
                toast.error(error.message);
                endHandlingRemoveUsers();
            }
        });
    }
    return (
        <Card key={channel.channelId} className="p-4">
                <div className="w-full flex justify-between">
                    <div className="flex flex-row items-center gap-2 self-start">
                        <div className="text-xl font-semibold">{channel.channelName}</div>
                        <Badge variant="outline">{channel.day}</Badge>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <UserSelectDialogButton channelId={channel.channelId} 
                        unregisteredUsers={users?.filter(user => !channel.userIds.includes(user.userId)) || []} 
                        refetchChannels={refetchChannels} />
                        {isHandlingRemoveUsers ? (
                            <div className="flex items-center gap-2 justify-end">
                                <Button variant="destructive" onClick={executeRemoveUsers} disabled={loadingRemoveUsersMutation || selectedRemoveUserIds.length === 0}>
                                    {loadingRemoveUsersMutation ? <Spinner /> : 'Execute'}
                                </Button>
                                <Button variant="outline" onClick={endHandlingRemoveUsers}>
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" onClick={() => startHandlingRemoveUsers(channel.channelId)}>
                                Remove Users
                            </Button>
                        )}
                    </div>
                </div>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/3">ID</TableHead>
                        <TableHead className="w-1/3">Name</TableHead>
                        <TableHead className="w-1/3">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {channel.userIds.map((userId) => {
                            const user = users?.find((u) => u.userId === userId);
                            return <TableRow key={userId}>
                                <TableCell>{userId}</TableCell>
                                <TableCell>{user ? 
                                    <div className="flex items-center gap-2">
                                        <UserCircleIcon className="h-4 w-4" />
                                        {user.userName}
                                    </div> : 
                                    <div className="flex items-center gap-2">
                                        <QuestionMarkCircleIcon className="h-4 w-4" />
                                        No user found
                                    </div>}
                                </TableCell>
                                <TableCell>
                                    {isHandlingRemoveUsers ?
                                        <Checkbox checked={selectedRemoveUserIds.includes(userId)} onCheckedChange={() => toggleSelectedRemoveUser(userId)} /> :
                                        " "
                                    }
                                </TableCell>
                            </TableRow>;
                        })}
                    </TableBody>
                </Table>
                </Card>
    )
}