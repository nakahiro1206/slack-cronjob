import { NextRequest, NextResponse } from 'next/server';
import { getChannels } from '@/storage/channel';
import { z } from 'zod';
import { channelSchema } from '@/models/channel';
import { addChannel } from '@/lib/firebase/channel';

export const getChannelsResponseSchema = z.object({
  channels: z.array(channelSchema),
});
export async function GET(request: NextRequest) {
  try {
    // Optionally, add authentication here if needed
    const getChannelsResult = await getChannels();
    return getChannelsResult.match<NextResponse>(
      (channels) => NextResponse.json({ channels }),
      (error) => {
        console.error('Failed to get channels:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    );
  } catch (error) {
    console.error('Channel API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = channelSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  const channel = result.data;
  const addChannelResult = await addChannel(channel);
  return addChannelResult.match(
    () => NextResponse.json({}, { status: 201 }),
    (error) => {
      console.error('Failed to add channel:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  );
}