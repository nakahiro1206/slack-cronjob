'use client';

import { useState, useEffect } from 'react';
import { type Channel } from '@/models/channel';
import { safeFetch } from '@/lib/result';
import { getChannelsResponseSchema } from '../api/channel/schema';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    // Load channels data
    const loadChannels = async () => {
      const getChannelsResult = await safeFetch('channels', getChannelsResponseSchema, '/api/channel');
      getChannelsResult.match(
        (data) => setChannels(data.channels),
        (error) => {
          console.error('Failed to load channels:', error);
          setChannels([]);
        }
      );
    };

    loadChannels();
  }, []);

  const testCron = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/cron', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`
        }
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Slack Cronjob Test Dashboard</h1>
        
        {/* Available Channels Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Channels</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <div key={channel.channelId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{channel.channelName}</h3>
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
              </div>
            ))}
          </div>
        </div>

        {/* Cron Test Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Cron Endpoint</h2>
          <p className="mb-4 text-gray-600">
            Click the button below to manually trigger the cron endpoint. It will randomly select one of the channels above and post a message to it.
          </p>
          
          <button
            onClick={testCron}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Testing...' : 'Test Cron Endpoint'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Test Result:</h3>
            <pre className="bg-gray-50 p-4 rounded-lg border overflow-x-auto text-sm font-mono">
              {result}
            </pre>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">ℹ️ Information</h3>
          <div className="text-yellow-700 space-y-2">
            <p>
              • This test page is for development purposes only. In production, the cron endpoint 
              should only be called by Vercel's cron service with proper authentication.
            </p>
            <p>
              • The cron job randomly selects one channel from the available channels and sends a message to it.
            </p>
            <p>
              • Channel members are mentioned in the Slack message using their user IDs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 