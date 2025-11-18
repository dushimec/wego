import { NextResponse } from 'next/server';
import { sendNotificationById, SendOptions } from '@/lib/notification-sender';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, force, channels } = body as { id?: string; force?: boolean; channels?: string[] };
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const opts: SendOptions = {};
    if (force) opts.force = true;
    if (Array.isArray(channels)) {
      opts.channels = channels.filter((c) => ['email', 'sms', 'in_app'].includes(c)) as any;
    }

    const result = await sendNotificationById(id, opts);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('Error sending notification', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
  }
}
