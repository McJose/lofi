import { supabase } from '@/lib/supabase';
import type { Favorite, SavedSearch, SearchFilters, Item } from '@/types/items';

export async function toggleFavorite(userId: string, itemId: string): Promise<{ favorited: boolean; error?: string }> {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) {
      return { favorited: true, error: error.message };
    }
    return { favorited: false };
  } else {
    // Add favorite
    const { error } = await supabase.from('favorites').insert({
      user_id: userId,
      item_id: itemId,
    });

    if (error) {
      return { favorited: false, error: error.message };
    }
    return { favorited: true };
  }
}

export async function getFavorites(
  userId: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ favorites: Array<{ id: string; item_id: string; created_at: string; item: Item }>; total: number }> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('favorites')
    .select(
      `
      id,
      item_id,
      created_at,
      items!favorites_item_id_fkey (*)
    `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return { favorites: [], total: 0 };
  }

  return {
    favorites: (data || []).map((fav: any) => ({
      id: fav.id,
      item_id: fav.item_id,
      created_at: fav.created_at,
      item: fav.items as Item,
    })),
    total: count || 0,
  };
}

export async function createSavedSearch(
  userId: string,
  name: string,
  filters: SearchFilters,
  alertEnabled: boolean = true
): Promise<{ savedSearch: SavedSearch | null; error?: string }> {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: userId,
      name,
      filters: JSON.stringify(filters),
      alert_enabled: alertEnabled,
    })
    .select()
    .single();

  if (error) {
    return { savedSearch: null, error: error.message };
  }

  return { savedSearch: data as SavedSearch };
}

export async function getSavedSearches(userId: string): Promise<{ searches: SavedSearch[]; error?: string }> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { searches: [], error: error.message };
  }

  return { searches: (data || []) as SavedSearch[] };
}

export async function updateSavedSearch(
  searchId: string,
  userId: string,
  updates: { name?: string; filters?: SearchFilters; alert_enabled?: boolean }
): Promise<{ savedSearch: SavedSearch | null; error?: string }> {
  const { data, error } = await supabase
    .from('saved_searches')
    .update({
      ...updates,
      filters: updates.filters ? JSON.stringify(updates.filters) : undefined,
    })
    .eq('id', searchId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { savedSearch: null, error: error.message };
  }

  return { savedSearch: data as SavedSearch };
}

export async function deleteSavedSearch(searchId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  return {};
}
