'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, X, MapPin, SortAsc, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ItemCard, ItemCardSkeleton } from './item-card';
import { searchItems } from '@/services/items';
import { createSavedSearch } from '@/services/favorites';
import { useDebouncedCallback } from '@/lib/utils/response';
import { toast } from '@/hooks/use-toast-store';
import { useAuth } from '@/hooks/use-auth';
import type { ItemWithRelations, SearchFilters, SortOption } from '@/types/items';
import { ITEM_CATEGORIES, ITEM_COLORS } from '@/types/items';
import { cn } from '@/lib/utils';

interface ItemSearchProps {
  initialType?: 'lost' | 'found';
  showFilters?: boolean;
  onResults?: (items: ItemWithRelations[]) => void;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'closest', label: 'Closest to Me' },
  { value: 'reward_high', label: 'Highest Reward' },
  { value: 'reward_low', label: 'Lowest Reward' },
  { value: 'views', label: 'Most Viewed' },
];

export function ItemSearch({ initialType, showFilters = true, onResults }: ItemSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState<'lost' | 'found' | undefined>(
    initialType || (searchParams.get('type') as 'lost' | 'found') || undefined
  );
  const [categories, setCategories] = useState<string[]>(searchParams.get('categories')?.split(',') || []);
  const [colors, setColors] = useState<string[]>([]);
  const [rewardMin, setRewardMin] = useState<number | undefined>();
  const [rewardMax, setRewardMax] = useState<number | undefined>();
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest');
  const [useLocation, setUseLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [radius, setRadius] = useState<number>(50);

  const activeFilters = useMemo(() => {
    let count = 0;
    if (type) count++;
    if (categories.length) count++;
    if (colors.length) count++;
    if (rewardMin !== undefined || rewardMax !== undefined) count++;
    if (useLocation) count++;
    return count;
  }, [type, categories, colors, rewardMin, rewardMax, useLocation]);

  const performSearch = useCallback(async () => {
    setIsLoading(true);

    const filters: SearchFilters = {
      query: query || undefined,
      type,
      categories: categories.length > 0 ? categories : undefined,
      colors: colors.length > 0 ? colors : undefined,
      reward_min: rewardMin,
      reward_max: rewardMax,
      latitude: useLocation ? latitude : undefined,
      longitude: useLocation ? longitude : undefined,
      radius: useLocation ? radius : undefined,
      status: ['active'],
    };

    const result = await searchItems(filters, sort, currentPage, 20, user?.id);

    setItems(result.items);
    setTotalResults(result.total);
    setTotalPages(result.total_pages);

    onResults?.(result.items);
    setIsLoading(false);
  }, [query, type, categories, colors, rewardMin, rewardMax, useLocation, latitude, longitude, radius, sort, currentPage, user?.id, onResults]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Get location
  useEffect(() => {
    if (useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Location error:', error);
          setUseLocation(false);
          toast.error('Location error', 'Could not get your location.');
        }
      );
    }
  }, [useLocation]);

  // Debounced query search
  const debouncedSearch = useDebouncedCallback(performSearch, 300);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setCurrentPage(1);
    debouncedSearch();
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast.error('Sign in required', 'Please sign in to save searches.');
      return;
    }

    const filters: SearchFilters = {
      query: query || undefined,
      type,
      categories: categories.length > 0 ? categories : undefined,
      colors: colors.length > 0 ? colors : undefined,
      reward_min: rewardMin,
      reward_max: rewardMax,
    };

    const result = await createSavedSearch(user.id, query || 'Saved Search', filters);
    if (result.error) {
      toast.error('Failed to save search', result.error);
    } else {
      toast.success('Search saved', 'You will be notified when new items match.');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setType(undefined);
    setCategories([]);
    setColors([]);
    setRewardMin(undefined);
    setRewardMax(undefined);
    setUseLocation(false);
    setSort('newest');
    setCurrentPage(1);
  };

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleColor = (color: string) => {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items by title, description, or brand..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setCurrentPage(1); }}>
          <SelectTrigger className="w-40">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showFilters && (
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilters > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-teal-500 text-white text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>
                  Refine your search to find exactly what you're looking for.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* Item Type */}
                <div className="space-y-3">
                  <Label>Item Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={type === 'lost' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setType(type === 'lost' ? undefined : 'lost'); setCurrentPage(1); }}
                      className={type === 'lost' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                      Lost
                    </Button>
                    <Button
                      variant={type === 'found' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setType(type === 'found' ? undefined : 'found'); setCurrentPage(1); }}
                      className={type === 'found' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      Found
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2">
                        {ITEM_CATEGORIES.filter((c) => !('parent' in c)).map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={categories.includes(category.id)}
                              onCheckedChange={() => toggleCategory(category.id)}
                            />
                            <span className="text-sm">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Colors */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="colors">
                    <AccordionTrigger>Colors</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {ITEM_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                              colors.includes(color) && 'border-primary bg-primary/10'
                            )}
                          >
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs capitalize">{color}</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Reward */}
                <div className="space-y-3">
                  <Label>Reward Amount</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={rewardMin || ''}
                      onChange={(e) => { setRewardMin(Number(e.target.value) || undefined); setCurrentPage(1); }}
                      className="w-24"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={rewardMax || ''}
                      onChange={(e) => { setRewardMax(Number(e.target.value) || undefined); setCurrentPage(1); }}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Label>Near Me</Label>
                    </div>
                    <Switch checked={useLocation} onCheckedChange={setUseLocation} />
                  </div>

                  {useLocation && (
                    <div className="space-y-2">
                      <Label>Radius (km)</Label>
                      <Select value={radius.toString()} onValueChange={(v) => { setRadius(Number(v)); setCurrentPage(1); }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 km</SelectItem>
                          <SelectItem value="10">10 km</SelectItem>
                          <SelectItem value="25">25 km</SelectItem>
                          <SelectItem value="50">50 km</SelectItem>
                          <SelectItem value="100">100 km</SelectItem>
                          <SelectItem value="200">200 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                    Apply
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {type && (
            <Badge variant="secondary" className="gap-1">
              {type}
              <button onClick={() => { setType(undefined); setCurrentPage(1); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <button onClick={() => toggleCategory(cat)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {colors.map((color) => (
            <Badge key={color} variant="secondary" className="gap-1">
              {color}
              <button onClick={() => toggleColor(color)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {useLocation && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              Within {radius}km
              <button onClick={() => setUseLocation(false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count & Save Search */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Searching...' : `${totalResults} items found`}
        </p>
        {user && totalResults > 0 && (
          <Button variant="ghost" size="sm" onClick={handleSaveSearch}>
            <Save className="h-4 w-4 mr-1" />
            Save Search
          </Button>
        )}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
