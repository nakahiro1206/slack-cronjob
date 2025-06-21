import React, { FC } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import type { User } from '@/models/user';
import { Card } from '../ui/card';

type Props = {
    users: User[] | undefined;
    openUserDialog: () => void;
}

export const UserCard: FC<Props> = ({ users, openUserDialog }) => {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-semibold mb-2">All Users</div>
                <Button variant="outline" onClick={openUserDialog}>
                    <PlusIcon className="h-4 w-4" /> Create User
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.map((user) => (
                        <TableRow key={user.userId}>
                            <TableCell>{user.userId}</TableCell>
                            <TableCell>{user.userName}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};