import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { trpc } from "@/lib/trpc/client";

type TestProps = {
  refetchUpcomingSlots: () => void;
}

export const Test = ({refetchUpcomingSlots}: TestProps) => {
  const [channels, {error: channelsError}] = trpc.channel.getAll.useSuspenseQuery();
  const {mutate: notifyMutation, isPending: loadingNotifyMutation} = trpc.cronjob.notify.useMutation();
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (channelsError) toast.error(channelsError.message);
  }, [channelsError]);

  const handleChannelToggle = (channelId: string) => {
    const newSelected = new Set(selectedChannels);
    if (newSelected.has(channelId)) {
      newSelected.delete(channelId);
    } else {
      newSelected.add(channelId);
    }
    setSelectedChannels(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedChannels.size === channels.length) {
      setSelectedChannels(new Set());
    } else {
      setSelectedChannels(new Set(channels.map(channel => channel.channelId) || []));
    }
  };

  const testNotify = async () => {
    if (selectedChannels.size === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    notifyMutation({
        channelIds: Array.from(selectedChannels),
    }, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success('Notified successfully');
          refetchUpcomingSlots();
        } else {
          toast.error('Notified failed');
        }
      },
    });
  };

  return (
    <>
      {/* Available Channels Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Available Channels</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedChannels.size === channels.length && channels.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
              Select All
            </label>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.channelId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${channel.channelId}`}
                    checked={selectedChannels.has(channel.channelId)}
                    onCheckedChange={() => handleChannelToggle(channel.channelId)}
                  />
                  <h3 className="font-semibold text-gray-800">{channel.channelName}</h3>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {channel.userIds.length} member{channel.userIds.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">ID: {channel.channelId}</p>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Members:</h4>
                <div className="space-y-1">
                  {channel.userIds.map((userId) => (
                    <div key={userId} className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {userId.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-500 ml-2">({userId})</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/*Notify Test Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Notify</h2>
        <p className="mb-4 text-gray-600">
          Select the channels you want to notify, then click the button below to manually trigger the notify. 
          It will send messages to all selected channels.
        </p>
        
        <div className="flex items-center space-x-4 mb-4">
          <Button
            onClick={testNotify}
            disabled={loadingNotifyMutation || selectedChannels.size === 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loadingNotifyMutation ? <Spinner /> : 'Test Notify'}
          </Button>
          <span className="text-sm text-gray-600">
            {selectedChannels.size > 0 
              ? `${selectedChannels.size} channel${selectedChannels.size !== 1 ? 's' : ''} selected`
              : 'No channels selected'
            }
          </span>
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">ℹ️ Information</h3>
        <div className="text-yellow-700 space-y-2">
          <p>
            • Select one or more channels using the checkboxes above, then click the test button to send messages to those channels.
          </p>
          <p>
            • Channel members are mentioned in the Slack message using their user IDs.
          </p>
        </div>
      </Card>
    </>
  )
}