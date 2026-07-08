'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, Heart, Search, Plus, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ItemCard, ItemCardSkeleton } from '@/components/items';
import { getUserItems } from '@/services/items';
import { getFavorites } from '@/services/favorites';
import { useAuth } from '@/hooks/use-auth';
import type { ItemWithRelations, Item } from '@/types/items';

export default function MyItemsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [lostItems, setLostItems] = useState<ItemWithRelations[]>([]);
  const [foundItems, setFoundItems] = useState<ItemWithRelations[]>([]);
  const [favorites, setFavorites] = useState<Array<{ id: string; item_id: string; created_at: string; item: Item }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/my-items');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    if (!user) return;

    setIsLoading(true);

    const [lostResult, foundResult, favoritesResult] = await Promise.all([
      getUserItems(user.id!, 'lost', undefined, 1, 50),
      getUserItems(user.id!, 'found', undefined, 1, 50),
      getFavorites(user.id!, 1, 50),
    ]);

    setLostItems(lostResult.items);
    setFoundItems(foundResult.items);
    setFavorites(favoritesResult.favorites);

    setIsLoading(false);
  };

  if (authLoading || isLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Items</h1>
          <p className="text-muted-foreground">
            Manage your reported items and favorites.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/report/lost">
              <Plus className="h-4 w-4 mr-2" />
              Report Lost
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/report/found">
              <Plus className="h-4 w-4 mr-2" />
              Report Found
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{lostItems.length}</div>
                <div className="text-sm text-muted-foreground">Lost Items</div>
              </div>
              <Package className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{foundItems.length}</div>
                <div className="text-sm text-muted-foreground">Found Items</div>
              </div>
              <Package className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {[...lostItems, ...foundItems].filter((i) => i.status === 'recovered').length}
                </div>
                <div className="text-sm text-muted-foreground">Recovered</div>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{favorites.length}</div>
                <div className="text-sm text-muted-foreground">Favorites</div>
              </div>
              <Heart className="h-8 w-8 text-pink-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Tabs */}
      <Tabs defaultValue="lost" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lost">
            Lost Items ({lostItems.length})
          </TabsTrigger>
          <TabsTrigger value="found">
            Found Items ({foundItems.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({favorites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lost">
          {lostItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No lost items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Report a lost item to start tracking and matching.
                </p>
                <Button asChild>
                  <Link href="/report/lost">Report Lost Item</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lostItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="found">
          {foundItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No found items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Report a found item to help return it to its owner.
                </p>
                <Button asChild>
                  <Link href="/report/found">Report Found Item</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foundItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-4">
                  Save items you're interested in for quick access.
                </p>
                <Button asChild>
                  <Link href="/lost-items">Browse Items</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav, index) => (
                <ItemCard
                  key={fav.item_id || index}
                  item={fav.item as unknown as ItemWithRelations}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
