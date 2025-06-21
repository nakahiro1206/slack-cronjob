import { WebClient } from '@slack/web-api';
import { getChannels } from '@/lib/firebase/channel';
import type { Channel } from '@/models/channel';
import {Random} from 'random';

const compareDay = (domainDay: string, japanDay: string) => {
  const lowerCaseDomainDay = domainDay.toLowerCase();
  const lowerCaseJapanDay = japanDay.toLowerCase();
  return lowerCaseDomainDay === lowerCaseJapanDay;
}

type NotifyResult = {
    success: boolean;
    message: string | undefined;
}

async function postMessage({
  slack,
  channel,
  hour,
  minute,
  day,
  month,
  date,
  year,
  rng,
}: {
  slack: WebClient;
  channel: Channel;
  hour: number;
  minute: number;
  day: string;
  month: string;
  date: number;
  year: number;
  rng: Random;
}): Promise<{
  channelName: string;
  ok: boolean;
  error?: string;
}> {
  // Create user mentions for the channel members
  const shuffledUserIds = channel.userIds.sort(() => rng.float(0, 1) - 0.5);
  const userMentions = shuffledUserIds.map(userId => `- <@${userId}>`).join('\n');

  // Create the message
  const message = {
    channel: channel.channelId,
    text: `*📣1on1 order for ${channel.channelName}*`,
    blocks: [
      {
        type: 'section',
        fields: [
        {
          type: 'mrkdwn',
          text: `*📣 1on1 order for ${channel.channelName}* \n This message was automatically posted by your Vercel cronjob.`
        },
        {
          type: 'mrkdwn',
          text: `*⏰ Date (UTC+9):*\n ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day}, ${month} ${date}, ${year}`
        },
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*📋 Order:*\n${userMentions}`
        }
      },
    ]
  };

  // Post message to Slack
  const result = await slack.chat.postMessage(message);
  return {
    channelName: channel.channelName,
    ok: result.ok,
    error: result.error,
  };
}

type NotifyArgs = {
  mode: 'sameDayOnly';
} | {
  mode: 'specifiedChannels';
  channelIds: string[];
}
export const notify = async (args: NotifyArgs): Promise<NotifyResult> => {
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

    const rng = new Random(now.toISOString());

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

    let targetChannels: Channel[] = [];
    if (args.mode === 'sameDayOnly') {
      targetChannels = channels.filter((channel) => compareDay(channel.day, day));
    } else if (args.mode === 'specifiedChannels') {
      targetChannels = channels.filter((channel) => args.channelIds.includes(channel.channelId));
    } else {
      return {
        success: false,
        message: 'Invalid mode',
      };
    }
    
    const results = await Promise.all(targetChannels.map(async (channel) => {
      return postMessage({
        slack,
        channel,
        hour,
        minute,
        day,
        month,
        date,
        year,
        rng,
      });
    }));
    
    const failedChannels = results.map((result) => {
      if (result.ok) {
        return undefined
      } else {
        return result.channelName;
      }
    }).filter((channelName) => channelName !== undefined);

    if (failedChannels.length > 0) {
      return {
        success: false,
        message: `Failed to post message: ${failedChannels.join(', ')}`,
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