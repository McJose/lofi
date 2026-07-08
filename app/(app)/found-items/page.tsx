'use client';

import { ItemSearch } from '@/components/items';
import { Suspense } from 'react';

export default function FoundItemsPage() {
  return (
    <div className="container py-12">
      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Found Items</h1>
          <p className="text-muted-foreground">
            Browse items that have been found and help return them to their owners.
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ItemSearch initialType="found" />
      </Suspense>
    </div>
  );
}
