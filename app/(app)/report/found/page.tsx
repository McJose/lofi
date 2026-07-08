'use client';

import { useRouter } from 'next/navigation';
import { ItemForm } from '@/components/items';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReportFoundItemPage() {
  const router = useRouter();

  return (
    <div className="container py-12 max-w-3xl">
      <div className="space-y-6 mb-8">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/found-items">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Found Items
          </Link>
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Report Found Item</h1>
          <p className="text-muted-foreground">
            Thank you for finding and reporting this item. Help reunite it with its owner.
          </p>
        </div>
      </div>

      <ItemForm
        type="found"
        onSuccess={(itemId) => router.push(`/items/${itemId}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
