'use client';

import { ItemSearch } from '@/components/items';
import { Suspense } from 'react';

export default function LostItemsPage() {
  return (
    <div className="container py-12">
      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Lost Items</h1>
          <p className="text-muted-foreground">
            Browse items reported as lost and help reunite them with their owners.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ItemSearch initialType="lost" />
      </Suspense>
    </div>
  );
}
