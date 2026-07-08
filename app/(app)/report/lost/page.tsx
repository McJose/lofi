'use client';

import { useRouter } from 'next/navigation';
import { ItemForm } from '@/components/items';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReportLostItemPage() {
  const router = useRouter();

  return (
    <div className="container py-12 max-w-3xl">
      <div className="space-y-6 mb-8">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/lost-items">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lost Items
          </Link>
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Report Lost Item</h1>
          <p className="text-muted-foreground">
            We're sorry you lost something. Let's help you find it by creating a detailed report.
          </p>
        </div>
      </div>

      <ItemForm
        type="lost"
        onSuccess={(itemId) => router.push(`/items/${itemId}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
