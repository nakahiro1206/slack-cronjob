import { Card } from '../ui/card';
import React, { FC, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { Channel } from '@/models/channel';
import type { User } from '@/models/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { TrashIcon, UserCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useRegisterUsersMutation } from '@/documents/generated';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { Spinner } from '../ui/spinner';

const UserSelectDialogButton = ({ channelId, unregisteredUsers, refetchChannels }: { channelId: string, unregisteredUsers: User[], refetchChannels: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleClose = () => setIsOpen(false);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [registerUsersMutation, { loading: loadingRegisterUsersMutation }] = useRegisterUsersMutation();

    const handleUserSelect = (userId: string) => {
        if (!selectedUserIds.includes(userId)) {
          const newSelectedUserIds = [...selectedUserIds, userId];
          setSelectedUserIds(newSelectedUserIds);
          setValue('userIds', newSelectedUserIds);
        }
      };
    
    const handleRemoveUser = (userId: string) => {
    const newSelectedUserIds = selectedUserIds.filter(id => id !== userId);
    setSelectedUserIds(newSelectedUserIds);
    setValue('userIds', newSelectedUserIds);
    };

    const getUserName = (userId: string) => {
    return unregisteredUsers.find(user => user.userId === userId)?.userName || userId;
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
      } = useForm<{ userIds: string[] }>({
        resolver: zodResolver(z.object({
            userIds: z.array(z.string()),
        })),
        defaultValues: {userIds: [],},
      });

    const onSubmit = (data: { userIds: string[] }) => {
        registerUsersMutation({ 
            variables: { channelId, userIds: data.userIds },
            onCompleted: (result) => {
                if (result.registerUsers.success) {
                    toast.success('User registered successfully');
                    refetchChannels();
                } else {
                    toast.error('User registration failed');
                }
                handleClose();
            },
            onError: (error) => {
                toast.error(error.message);
            }
        });
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusIcon className="h-4 w-4" /> Add User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-2">
                        <Select value={""} onValueChange={handleUserSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                                {unregisteredUsers
                                .filter(user => !selectedUserIds.includes(user.userId))
                                .map((user) => (
                                    <SelectItem key={user.userId} value={user.userId}>{user.userName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedUserIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedUserIds.map(userId => (
                                    <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                        {getUserName(userId)}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveUser(userId)}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {errors.userIds && (
                            <p className="text-red-600 text-sm mt-1">{errors.userIds.message}</p>
                        )}
                    </div>
                    <DialogFooter className="mt-4">
                        <button
                            type="button"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            disabled={loadingRegisterUsersMutation}
                        >
                            {loadingRegisterUsersMutation ? <Spinner /> : 'Register'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
type Props = {
    channels: Channel[] | undefined;
    users: User[] | undefined;
    openChannelDialog: () => void;
    refetchChannels: () => void;
}
export const ChannelCard: FC<Props> = ({ channels, users, openChannelDialog, refetchChannels }) => {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold">Channels</div>
                <Button variant="outline" onClick={openChannelDialog}>
                    <PlusIcon className="h-4 w-4" /> Create Channel
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
            {channels?.map((channel) => (
                <Card key={channel.channelId} className="p-4">
                <div className="w-full flex justify-between">
                    <h2 className="text-xl font-semibold">{channel.channelName}</h2>
                    <UserSelectDialogButton channelId={channel.channelId} 
                    unregisteredUsers={users?.filter(user => !channel.userIds.includes(user.userId)) || []} 
                    refetchChannels={refetchChannels} />
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
                                    <Button variant="outline">
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>;
                        })}
                    </TableBody>
                </Table>
                </Card>
            ))}
            </div>
        </Card>
    );
};