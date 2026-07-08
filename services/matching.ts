import { supabase } from '@/lib/supabase';
import type { ItemMatch, ItemMatchWithItems } from '@/types/items';

export async function getMatchesForItem(itemId: string): Promise<{ matches: ItemMatchWithItems[]; error?: string }> {
  const { data: item } = await supabase
    .from('items')
    .select('type')
    .eq('id', itemId)
    .single();

  if (!item) {
    return { matches: [], error: 'Item not found' };
  }

  const queryField = item.type === 'lost' ? 'lost_item_id' : 'found_item_id';
  const matchField = item.type === 'lost' ? 'found_item_id' : 'lost_item_id';

  const { data, error } = await supabase
    .from('item_matches')
    .select(
      `
      *,
      lost_item:items!item_matches_lost_item_id_fkey (
        id, title, type, category, primary_color, photos, status, city, country, created_at,
        profiles!items_user_id_fkey (user_id, username, full_name, avatar_url)
      ),
      found_item:items!item_matches_found_item_id_fkey (
        id, title, type, category, primary_color, photos, status, city, country, created_at,
        profiles!items_user_id_fkey (user_id, username, full_name, avatar_url)
      )
    `
    )
    .eq(queryField, itemId)
    .order('match_score', { ascending: false });

  if (error) {
    return { matches: [], error: error.message };
  }

  return {
    matches: (data || []) as ItemMatchWithItems[],
  };
}

export async function confirmMatch(matchId: string, userId: string): Promise<{ error?: string }> {
  // Verify user owns one of the items
  const { data: match } = await supabase
    .from('item_matches')
    .select(
      `
      id,
      lost_item:items!item_matches_lost_item_id_fkey (user_id),
      found_item:items!item_matches_found_item_id_fkey (user_id)
    `
    )
    .eq('id', matchId)
    .single();

  if (!match) {
    return { error: 'Match not found' };
  }

  // Update match status
  const { error } = await supabase
    .from('item_matches')
    .update({ status: 'confirmed' })
    .eq('id', matchId);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function rejectMatch(matchId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('item_matches')
    .update({ status: 'rejected' })
    .eq('id', matchId);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function getMatchStatistics(itemId: string): Promise<{
  totalMatches: number;
  pendingMatches: number;
  confirmedMatches: number;
  highConfidenceMatches: number;
  error?: string;
}> {
  const { data: item } = await supabase
    .from('items')
    .select('type')
    .eq('id', itemId)
    .single();

  if (!item) {
    return { totalMatches: 0, pendingMatches: 0, confirmedMatches: 0, highConfidenceMatches: 0, error: 'Item not found' };
  }

  const queryField = item.type === 'lost' ? 'lost_item_id' : 'found_item_id';

  const { count: total } = await supabase
    .from('item_matches')
    .select('*', { count: 'exact', head: true })
    .eq(queryField, itemId);

  const { count: pending } = await supabase
    .from('item_matches')
    .select('*', { count: 'exact', head: true })
    .eq(queryField, itemId)
    .eq('status', 'pending');

  const { count: confirmed } = await supabase
    .from('item_matches')
    .select('*', { count: 'exact', head: true })
    .eq(queryField, itemId)
    .eq('status', 'confirmed');

  const { count: highConfidence } = await supabase
    .from('item_matches')
    .select('*', { count: 'exact', head: true })
    .eq(queryField, itemId)
    .gte('match_score', 70);

  return {
    totalMatches: total || 0,
    pendingMatches: pending || 0,
    confirmedMatches: confirmed || 0,
    highConfidenceMatches: highConfidence || 0,
  };
}
