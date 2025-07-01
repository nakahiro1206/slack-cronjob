import { Card } from '../../ui/card';
import React, { useState } from 'react';
import type { UpcomingSlot } from '@/models/channel';
import type { User } from '@/models/user';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { UserCircleIcon, QuestionMarkCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { Spinner } from '../../ui/spinner';
import { trpc } from '@/lib/trpc/client';
import { getJapanTimeAsJSDate, getJapanTimeAsObject } from '@/lib/date';
import { Checkbox } from '../../ui/checkbox';
import { UserSelectDialogButton } from './DialogButton';
import { DatePicker } from '../../ui/date-picker';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Badge } from '@/components/ui/badge';

type UpcomingCardProps = {
    channel: UpcomingSlot
    users: User[] | undefined
    refetchChannels: () => void;
}
export const UpcomingCard = ({
    channel, 
    users, 
    refetchChannels,
}: UpcomingCardProps) => {
    const [isHandlingRemoveUsers, setIsHandlingRemoveUsers] = useState(false);
    const [selectedRemoveUserIds, setSelectedRemoveUserIds] = useState<string[]>([]);
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    // 
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(getJapanTimeAsJSDate(channel.date));
    const {mutate: removeUsersMutation, isPending: loadingRemoveUsersMutation } = trpc.upcoming.removeUsers.useMutation();
    const {mutate: changeDateMutation, isPending: loadingChangeDateMutation } = trpc.upcoming.changeDate.useMutation();

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

    const executeDateChange = () => {
        if (!selectedDate) {
            toast.error('Please select a date');
            return;
        }
        changeDateMutation({ 
            channelId: channel.channelId, 
            date: selectedDate.toISOString() 
        }, {
            onSuccess: (result) => {
                if (result.success) {
                    toast.success('Date changed successfully');
                    refetchChannels();
                    setIsDateDialogOpen(false);
                } else {
                    toast.error('Failed to change date');
                }
            },
            onError: (error) => {
                toast.error(error.message);
                setIsDateDialogOpen(false);
            }
        });
    }

    const openDateDialog = () => {
        setSelectedDate(getJapanTimeAsJSDate(channel.date));
        setIsDateDialogOpen(true);
    }

    const closeDateDialog = () => {
        setIsDateDialogOpen(false);
        setSelectedDate(getJapanTimeAsJSDate(channel.date));
    }

    const {day, date, month, year} = getJapanTimeAsObject(channel.date);
    return (<>
        <Card key={channel.channelId} className="p-4">
        <div className="w-full flex justify-between">
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <div className="text-xl font-semibold">{channel.channelName}</div>
                    <Badge variant="outline">{channel.day}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                        {day} {date} {month} {year}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={openDateDialog}
                        className="p-1 h-auto"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <UserSelectDialogButton 
                    channelId={channel.channelId} 
                    unregisteredUsers={users?.filter(user => !channel.userIds.includes(user.userId)) || []} 
                    refetchChannels={refetchChannels} 
                />

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

        {/* Date Edit Dialog */}
        <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Meeting Date</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Current Date</label>
                        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                            {day} {date} {month} {year}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">New Date</label>
                        <DatePicker 
                            date={selectedDate}
                            setDate={setSelectedDate}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        variant="outline" 
                        onClick={closeDateDialog}
                        disabled={loadingChangeDateMutation}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="default" 
                        onClick={executeDateChange}
                        disabled={loadingChangeDateMutation || !selectedDate}
                    >
                        {loadingChangeDateMutation ? <Spinner /> : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>)
}