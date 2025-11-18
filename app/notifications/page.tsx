'use client';

import React, { useMemo, useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const { userProfile } = useAuthWithProfile();
  const firestore = useFirestore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'processed'>('all');
  const { toast } = useToast();

  const notificationsQuery = useMemoFirebase(() => {
    if (!userProfile) return null;
    return query(
      collection(firestore, 'notifications'),
      where('userId', '==', userProfile.id),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userProfile]);

  const { data: notifications, isLoading } = useCollection<any>(notificationsQuery);

  async function markRead(id: string) {
    await fetch('/api/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
  }

  async function sendNow(id: string, force = false) {
    try {
      const res = await fetch('/api/notifications/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, force }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Send failed');
      toast({ title: 'Notification sent', description: JSON.stringify(body.result || body, null, 2) });
    } catch (err) {
      toast({ title: 'Send failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    }
  }

  async function remove(id: string) {
    await deleteDoc(doc(firestore, 'notifications', id));
  }

  const filtered = (notifications || []).filter((n: any) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'processed') return !!n.processed;
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="space-x-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} onClick={() => setFilter('unread')}>Unread</Button>
          <Button variant={filter === 'processed' ? 'default' : 'outline'} onClick={() => setFilter('processed')}>Processed</Button>
          {userProfile?.role === 'admin' && (
            <Button variant="destructive" onClick={async () => {
              try {
                const res = await fetch('/api/notifications/retry-failed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 200 }) });
                const body = await res.json();
                if (!res.ok) throw new Error(body?.error || 'Retry request failed');
                toast({ title: 'Retry started', description: `Retried ${body.count} notifications` });
              } catch (err) {
                toast({ title: 'Retry failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
              }
            }}>Retry failed</Button>
          )}
        </div>
      </div>

      {isLoading && <div>Loading...</div>}

      <div className="space-y-4">
          {filtered.map((n: any) => (
          <div key={n.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-center space-x-2">
                  <div className="font-medium">{n.title || 'Update'}</div>
                  {!n.read && <Badge variant="secondary">New</Badge>}
                  {n.processed && <Badge variant="outline">Sent</Badge>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                <div className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(n.createdAt?.toDate ? n.createdAt.toDate() : n.createdAt), { addSuffix: true })}</div>

                {n.deliveryResults && (
                  <details className="mt-3 text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Delivery results</summary>
                    <pre className="whitespace-pre-wrap mt-2 text-[12px] bg-slate-50 p-2 rounded">{JSON.stringify(n.deliveryResults, null, 2)}</pre>
                  </details>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>{n.read ? 'Mark unread' : 'Mark read'}</Button>
                <Button size="sm" variant="default" onClick={() => sendNow(n.id)}>Send now</Button>
                <Button size="sm" variant="secondary" onClick={() => sendNow(n.id, true)}>Retry (force)</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(n.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
