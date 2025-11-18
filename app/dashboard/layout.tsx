'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { BookingNotificationListener } from '@/components/booking-notification-listener';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <BookingNotificationListener />
      {children}
    </DashboardLayout>
  );
}
