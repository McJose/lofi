'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getItem, getUserItems } from '@/services/items';
import { ItemDetail } from '@/components/items';
import { ItemCard, ItemCardSkeleton } from '@/components/items/item-card';
import type { ItemWithRelations } from '@/types/items';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast-store';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<ItemWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedItems, setRelatedItems] = useState<ItemWithRelations[]>([]);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    setIsLoading(true);
    const result = await getItem(itemId);
    if (result.error) {
      toast.error('Error', result.error);
      router.push('/');
      return;
    }
    setItem(result.item);

    // Load related items from same user
    if (result.item?.user_id) {
      const { items } = await getUserItems(result.item.user_id, undefined, undefined, 1, 4);
      setRelatedItems(items.filter((i) => i.id !== itemId));
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Item not found</h1>
          <p className="text-muted-foreground mt-2">
            This item may have been removed or doesn't exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <ItemDetail item={item} />

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Other items by this user</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {relatedItems.map((relatedItem) => (
              <ItemCard key={relatedItem.id} item={relatedItem} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
