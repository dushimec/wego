'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { BrowseGrid } from '@/app/browse/browse-grid';

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseGrid />
    </Suspense>
  );
}
