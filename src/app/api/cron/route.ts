import { NextRequest, NextResponse } from 'next/server';
import { notify } from '@/lib/slack/notify';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const notifyResult = await notify({mode: 'sameDayOnly', updateSlot: true});
  if (!notifyResult.success) {
    return NextResponse.json({ error: notifyResult.message }, { status: 500 });
  } else {
    return NextResponse.json({ message: notifyResult.message }, { status: 200 });
  }
} 