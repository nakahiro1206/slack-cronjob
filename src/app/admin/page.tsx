'use client';
import { safeFetch } from '@/lib/result';
import React, { useEffect, useState } from 'react';
import { getChannelsResponseSchema } from '../api/channel/route';
import { getUsersResponseSchema } from '../api/user/route';
import { registerUserRequestSchema } from '../api/channel/[channelId]/route';
import { channelSchema } from '@/models/channel';
import { userSchema } from '@/models/user';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface Channel {
  channelId: string;
  channelName: string;
  userIds: string[];
}

interface User {
  userId: string;
  userName: string;
}

const AdminPage = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog state
  const [isChannelDialogOpen, setChannelDialogOpen] = useState(false);
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  // Channel form state
  const [newChannelId, setNewChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUserIds, setNewChannelUserIds] = useState('');
  const [channelDialogError, setChannelDialogError] = useState<string | null>(null);
  // User form state
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [userDialogError, setUserDialogError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
    fetchUsers();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const getChannelsResult = await safeFetch('channels', getChannelsResponseSchema, '/api/channel');
      getChannelsResult.match(
        (data) => setChannels(data.channels),
        (error) => {
          setError('Failed to fetch channels');
        }
      );
    } catch (e) {
      setError('Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const getUsersResult = await safeFetch('users', getUsersResponseSchema, '/api/user');
      getUsersResult.match(
        (data) => setUsers(data.users),
        (error) => {
          setError('Failed to fetch users');
        }
      );
    } catch (e) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setSuccess(null);
    setError(null);
  };

  const handleRegisterUser = async () => {
    if (!selectedChannel || !selectedUserId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const registerUserResult = await safeFetch(
        'channel',
        registerUserRequestSchema,
        `/api/channel/${selectedChannel.channelId}`,
        {
          method: 'POST',
          body: JSON.stringify({ userId: selectedUserId }),
        }
      );
      registerUserResult.match(
        () => {
          setSuccess('User registered to channel successfully');
          fetchChannels();
        },
        (error) => {
          setError(error.message);
        }
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Channel Dialog
  const openChannelDialog = () => {
    setChannelDialogOpen(true);
    setNewChannelId('');
    setNewChannelName('');
    setNewChannelUserIds('');
    setChannelDialogError(null);
  };
  const closeChannelDialog = () => setChannelDialogOpen(false);
  const handleCreateChannel = async () => {
    setChannelDialogError(null);
    const userIds = newChannelUserIds.split(',').map((id) => id.trim()).filter(Boolean);
    const channel = { channelId: newChannelId, channelName: newChannelName, userIds };
    const parsed = channelSchema.safeParse(channel);
    if (!parsed.success) {
      setChannelDialogError(parsed.error.errors.map(e => e.message).join(', '));
      return;
    }
    setLoading(true);
    try {
      const result = await safeFetch('channel', channelSchema, '/api/channel', {
        method: 'POST',
        body: JSON.stringify(channel),
      });
      result.match(
        () => {
          closeChannelDialog();
          fetchChannels();
        },
        (error) => {
          setChannelDialogError(error.message);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Create User Dialog
  const openUserDialog = () => {
    setUserDialogOpen(true);
    setNewUserId('');
    setNewUserName('');
    setUserDialogError(null);
  };
  const closeUserDialog = () => setUserDialogOpen(false);
  const handleCreateUser = async () => {
    setUserDialogError(null);
    const user = { userId: newUserId, userName: newUserName };
    const parsed = userSchema.safeParse(user);
    if (!parsed.success) {
      setUserDialogError(parsed.error.errors.map(e => e.message).join(', '));
      return;
    }
    setLoading(true);
    try {
      const result = await safeFetch('user', userSchema, '/api/user', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      result.match(
        () => {
          closeUserDialog();
          fetchUsers();
        },
        (error) => {
          setUserDialogError(error.message);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <div className="flex gap-8">
        <div className="w-1/4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Channels</h2>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
              onClick={openChannelDialog}
              title="Create Channel"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-1">
            {channels.map((channel) => (
              <li key={channel.channelId}>
                <button
                  onClick={() => handleSelectChannel(channel)}
                  className={`w-full text-left px-2 py-1 rounded hover:bg-blue-100 ${selectedChannel?.channelId === channel.channelId ? 'bg-blue-200 font-bold' : ''}`}
                >
                  {channel.channelName}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Users</h2>
            <button
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2"
              onClick={openUserDialog}
              title="Create User"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-1">
            {users.map((user) => (
              <li key={user.userId}>{user.userName} <span className="text-xs text-gray-400">({user.userId})</span></li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Channel Details</h2>
          {selectedChannel ? (
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold">{selectedChannel.channelName}</h3>
              <p className="text-sm text-gray-500 mb-2"><strong>Channel ID:</strong> {selectedChannel.channelId}</p>
              <h4 className="font-semibold">Users in Channel:</h4>
              <ul className="mb-2">
                {selectedChannel.userIds.length === 0 && <li className="text-gray-400">No users in this channel.</li>}
                {selectedChannel.userIds.map((userId) => {
                  const user = users.find((u) => u.userId === userId);
                  return <li key={userId}>{user ? user.userName : userId}</li>;
                })}
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <label className="font-medium">Register user to channel:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select user</option>
                  {users.filter(u => !selectedChannel.userIds.includes(u.userId)).map((user) => (
                    <option key={user.userId} value={user.userId}>{user.userName}</option>
                  ))}
                </select>
                <button
                  onClick={handleRegisterUser}
                  disabled={!selectedUserId || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Register
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a channel to view details and manage users.</p>
          )}
        </div>
      </div>
      {loading && <p className="text-blue-600 mt-4">Loading...</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {success && <p className="text-green-600 mt-4">{success}</p>}

      {/* Create Channel Dialog */}
      <Transition show={isChannelDialogOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeChannelDialog}>
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={React.Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-bold">Create Channel</Dialog.Title>
                    <button onClick={closeChannelDialog} className="text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-medium">Channel ID</label>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={newChannelId}
                        onChange={e => setNewChannelId(e.target.value)}
                        placeholder="channel-id"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">Channel Name</label>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={newChannelName}
                        onChange={e => setNewChannelName(e.target.value)}
                        placeholder="Channel Name"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">User IDs (comma separated)</label>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={newChannelUserIds}
                        onChange={e => setNewChannelUserIds(e.target.value)}
                        placeholder="user1,user2"
                      />
                    </div>
                    {channelDialogError && <p className="text-red-600">{channelDialogError}</p>}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                      onClick={closeChannelDialog}
                    >Cancel</button>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      onClick={handleCreateChannel}
                      disabled={loading}
                    >Create</button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Create User Dialog */}
      <Transition show={isUserDialogOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeUserDialog}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-bold">Create User</Dialog.Title>
                    <button onClick={closeUserDialog} className="text-gray-400 hover:text-gray-600">
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-medium">User ID</label>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={newUserId}
                        onChange={e => setNewUserId(e.target.value)}
                        placeholder="user-id"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">User Name</label>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={newUserName}
                        onChange={e => setNewUserName(e.target.value)}
                        placeholder="User Name"
                      />
                    </div>
                    {userDialogError && <p className="text-red-600">{userDialogError}</p>}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                      onClick={closeUserDialog}
                    >Cancel</button>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      onClick={handleCreateUser}
                      disabled={loading}
                    >Create</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminPage; 