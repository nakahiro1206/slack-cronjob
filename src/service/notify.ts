import { WebClient } from '@slack/web-api';
import { getChannels } from '@/lib/firebase/channel';

type NotifyResult = {
    success: boolean;
    message: string | undefined;
}
export const notify = async (): Promise<NotifyResult> => {
    // Initialize Slack client
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

    // Get current time in UTC+9 (Japan timezone)
    const now = new Date();
    const japanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));

    // Extract date and day information
    const hour = japanTime.getHours();
    const minute = japanTime.getMinutes();
    const date = japanTime.getDate();
    const day = japanTime.toLocaleDateString('en-US', { weekday: 'long' });
    const month = japanTime.toLocaleDateString('en-US', { month: 'long' });
    const year = japanTime.getFullYear();

    console.log(`Cron job started at ${japanTime.toISOString()} (UTC+9)`);
    console.log(`Date: ${day}, ${month} ${date}, ${year}`);

  try {

    // Get all available channels
    const getChannelsResult = await getChannels();
    const channels = getChannelsResult.match(
      (channels) => channels,
      (error) => []
    );

    if (channels.length === 0) {
      return {
        success: false,
        message: 'No channels found',
      };
    }

    // Randomly select a channel
    const selectedChannel = channels[Math.floor(Math.random() * channels.length)];
    
    // Create user mentions for the channel members
    const userMentions = selectedChannel.userIds.map(userId => `<@${userId}>`).join(' ');

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
              text: `*Date (UTC+9):*\n ${hour}:${minute} ${day}, ${month} ${date}, ${year}`
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
      return {
        success: false,
        message: `Failed to post message: ${result.error}`,
      };
    }

    return {
        success: true,
        message: 'Message posted successfully',
    };

  } catch (error) {
    return {
        success: false,
        message: `Failed to post message: ${error}`,
    };
  }
};