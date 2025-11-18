import { NextResponse } from 'next/server';
import { admin, firestore } from '@/firebase/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const notifRef = firestore.collection('notifications').doc(id);
    await notifRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error marking notification read', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
  }
}
