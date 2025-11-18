import { NextResponse } from 'next/server';
import { firestore } from '@/firebase/firebase-admin';
import { sendNotificationById } from '@/lib/notification-sender';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = typeof body?.limit === 'number' ? body.limit : 50;

    // Find notifications that are not processed (failed or pending)
    const q = firestore.collection('notifications').where('processed', '==', false).limit(limit);
    const snap = await q.get();

    const results: any[] = [];
    for (const doc of snap.docs) {
      try {
        const r = await sendNotificationById(doc.id, { force: true });
        results.push({ id: doc.id, result: r });
      } catch (err) {
        results.push({ id: doc.id, error: err instanceof Error ? err.message : String(err) });
      }
    }

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (err) {
    console.error('Error retrying failed notifications', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
