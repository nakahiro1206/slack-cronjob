import { NextRequest, NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';
import { getChannelIds } from '@/storage/mock';

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all available channels
    const channels = getChannelIds();
    if (channels.length === 0) {
      throw new Error('No channels available');
    }

    // Randomly select a channel
    const selectedChannel = channels[Math.floor(Math.random() * channels.length)];
    
    // Create user mentions for the channel members
    const userMentions = selectedChannel.users.map(user => `<@${user.userId}>`).join(' ');

    // Create the message
    const message = {
      channel: selectedChannel.channelId,
      text: `Hello from Vercel Cron! 🚀 - ${selectedChannel.channelName}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Scheduled Message for ${selectedChannel.channelName}* ⏰\n\nThis message was automatically posted by your Vercel cronjob.`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Channel Members:*\n${userMentions}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Time:*\n' + new Date().toLocaleString()
            },
            {
              type: 'mrkdwn',
              text: '*Status:*\n✅ Success'
            }
          ]
        }
      ]
    };

    // Post message to Slack
    const result = await slack.chat.postMessage(message);

    if (!result.ok) {
      throw new Error(`Failed to post message: ${result.error}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Message posted successfully',
      selectedChannel: {
        channelId: selectedChannel.channelId,
        channelName: selectedChannel.channelName,
        userCount: selectedChannel.users.length
      },
      timestamp: result.ts
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 