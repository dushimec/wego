"use client";

import React, { useMemo } from 'react';
import { useAuthWithProfile } from '@/hooks/use-auth-with-profile';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function NotificationBell() {
  const { userProfile } = useAuthWithProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemoFirebase(() => {
    if (!userProfile) return null;
    return query(
      collection(firestore, 'notifications'),
      where('userId', '==', userProfile.id),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userProfile]);

  const { data: notifications } = useCollection<any>(notificationsQuery);

  const unreadCount = (notifications || []).filter((n: any) => !n.read).length;

  async function markAsRead(id: string) {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      // silent
    }
  }

  async function retryNow(id: string) {
    try {
      const res = await fetch('/api/notifications/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, force: true }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Retry failed');
      toast({ title: 'Retry started', description: `Notification ${id} requeued` });
    } catch (err) {
      toast({ title: 'Retry failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 text-sm font-medium">Notifications</div>
        <div className="max-h-64 overflow-auto">
          {(notifications || []).length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">No notifications</div>
          )}
          {(notifications || []).map((n: any) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start space-y-1">
              <div className="w-full flex justify-between">
                <div className="text-sm font-medium">{n.title || 'Update'}</div>
                {!n.read && (
                  <Badge variant="secondary" className="ml-2">New</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{n.message}</div>
              {n.deliveryResults && (
                <details className="text-xs text-muted-foreground mt-1">
                  <summary className="cursor-pointer">Delivery results</summary>
                  <pre className="whitespace-pre-wrap text-[11px] mt-2 bg-slate-50 p-2 rounded">{JSON.stringify(n.deliveryResults, null, 2)}</pre>
                </details>
              )}
              <div className="w-full flex justify-end space-x-2 mt-2">
                {!n.read ? (
                  <Button size="sm" variant="outline" onClick={() => markAsRead(n.id)}>Mark read</Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)}>Mark unread</Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => retryNow(n.id)}>Retry</Button>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
