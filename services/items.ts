import { supabase } from '@/lib/supabase';
import type { Item, ItemWithRelations, SearchFilters, PaginatedItems, SortOption } from '@/types/items';
import type { ItemFormData } from '@/validation/items';

export async function createItem(
  userId: string,
  data: ItemFormData,
  status: 'draft' | 'active' = 'active'
): Promise<{ item: Item | null; error?: string }> {
  const { data: item, error } = await supabase
    .from('items')
    .insert({
      user_id: userId,
      type: data.type,
      status,
      title: data.title,
      category: data.category,
      brand: data.brand || null,
      model: data.model || null,
      serial_number: data.serial_number || null,
      description: data.description,
      primary_color: data.primary_color || null,
      secondary_color: data.secondary_color || null,
      size: data.size || null,
      unique_identifiers: JSON.stringify(data.unique_identifiers || []),
      date_lost_found: data.date_lost_found,
      time_lost_found: data.time_lost_found || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      postal_code: data.postal_code || null,
      reward_amount: data.reward_amount || 0,
      photos: JSON.stringify(data.photos || []),
      video_url: data.video_url || null,
      privacy_level: data.privacy_level,
      contact_preference: data.contact_preference,
      holder_name: data.holder_name || null,
      police_station: data.police_station || null,
      safe_storage_location: data.safe_storage_location || null,
      condition: data.condition || null,
    })
    .select()
    .single();

  if (error) {
    return { item: null, error: error.message };
  }

  // Log timeline event
  await logItemEvent(item.id, userId, status === 'draft' ? 'draft_saved' : 'created', { data });

  // Trigger matching if active
  if (status === 'active') {
    await findMatchesForItem(item.id);
  }

  return { item: item as Item };
}

export async function updateItem(
  itemId: string,
  userId: string,
  data: Partial<ItemFormData>
): Promise<{ item: Item | null; error?: string }> {
  const { data: item, error } = await supabase
    .from('items')
    .update({
      ...data,
      unique_identifiers: data.unique_identifiers ? JSON.stringify(data.unique_identifiers) : undefined,
      photos: data.photos ? JSON.stringify(data.photos) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { item: null, error: error.message };
  }

  await logItemEvent(itemId, userId, 'updated', { changes: data });

  return { item: item as Item };
}

export async function getItem(itemId: string, userId?: string): Promise<{ item: ItemWithRelations | null; error?: string }> {
  // Get item with profile
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles!items_user_id_fkey (
        user_id,
        username,
        full_name,
        avatar_url,
        reputation_score,
        verification_badge
      )
    `)
    .eq('id', itemId)
    .maybeSingle();

  if (error) {
    return { item: null, error: error.message };
  }

  if (!item) {
    return { item: null, error: 'Item not found' };
  }

  // Check if favorited
  let is_favorited = false;
  if (userId) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();
    is_favorited = !!fav;
  }

  // Increment view count if not owner
  if (userId !== item.user_id && item.privacy_level === 'public') {
    await supabase.rpc('increment_view_count', { item_id: itemId });
    await logItemEvent(itemId, userId || 'anonymous', 'viewed', { viewer_id: userId });
  }

  return {
    item: {
      ...item,
      profile: item.profiles,
      is_favorited,
    } as ItemWithRelations,
  };
}

export async function deleteItem(itemId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function archiveItem(itemId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('items')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  await logItemEvent(itemId, userId, 'archived', {});
  return {};
}

export async function markAsRecovered(itemId: string, userId: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('items')
    .update({
      status: 'recovered',
      recovered_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    return { error: error.message };
  }

  await logItemEvent(itemId, userId, 'recovered', {});
  return {};
}

export async function logItemEvent(
  itemId: string,
  userId: string | null,
  eventType: string,
  details: Record<string, unknown>
): Promise<void> {
  await supabase.from('item_timeline').insert({
    item_id: itemId,
    user_id: userId,
    event_type: eventType,
    details,
  });
}

export async function searchItems(
  filters: SearchFilters,
  sort: SortOption = 'newest',
  page: number = 1,
  perPage: number = 20,
  userId?: string
): Promise<PaginatedItems> {
  let query = supabase
    .from('items')
    .select(`
      *,
      profiles!items_user_id_fkey (
        user_id,
        username,
        full_name,
        avatar_url,
        reputation_score,
        verification_badge
      )
    `, { count: 'exact' })
    .eq('privacy_level', 'public');

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,brand.ilike.%${filters.query}%`);
  }

  if (filters.categories?.length) {
    query = query.in('category', filters.categories);
  }

  if (filters.colors?.length) {
    query = query.in('primary_color', filters.colors);
  }

  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }

  if (filters.reward_min !== undefined) {
    query = query.gte('reward_amount', filters.reward_min);
  }

  if (filters.reward_max !== undefined) {
    query = query.lte('reward_amount', filters.reward_max);
  }

  if (filters.date_from) {
    query = query.gte('date_lost_found', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('date_lost_found', filters.date_to);
  }

  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }

  if (filters.country) {
    query = query.ilike('country', `%${filters.country}%`);
  }

  // Apply sorting
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'reward_high':
      query = query.order('reward_amount', { ascending: false });
      break;
    case 'reward_low':
      query = query.order('reward_amount', { ascending: true });
      break;
    case 'views':
      query = query.order('view_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return {
      items: [],
      total: 0,
      page,
      per_page: perPage,
      total_pages: 0,
    };
  }

  // Transform results
  const items = (data || []).map((item) => ({
    ...item,
    profile: item.profiles,
  })) as ItemWithRelations[];

  // If location filter, compute distances and sort
  let processedItems: (ItemWithRelations & { distance?: number })[] = items;
  if (filters.latitude && filters.longitude && sort === 'closest') {
    processedItems = items
      .map((item) => ({
        ...item,
        distance: item.latitude && item.longitude
          ? calculateDistance(
              filters.latitude!,
              filters.longitude!,
              item.latitude,
              item.longitude
            )
          : Infinity,
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // Filter by radius if specified
    if (filters.radius) {
      processedItems = processedItems.filter(
        (item) => !item.distance || item.distance <= filters.radius!
      );
    }
  }

  return {
    items: processedItems,
    total: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
  };
}

export async function getUserItems(
  userId: string,
  type?: 'lost' | 'found',
  status?: string,
  page: number = 1,
  perPage: number = 20
): Promise<PaginatedItems> {
  let query = supabase
    .from('items')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (type) {
    query = query.eq('type', type);
  }

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('created_at', { ascending: false });

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { items: [], total: 0, page, per_page: perPage, total_pages: 0 };
  }

  return {
    items: (data || []) as ItemWithRelations[],
    total: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
  };
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Find matches for an item
export async function findMatchesForItem(itemId: string): Promise<void> {
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (!item) return;

  // Find potential matches
  const oppositeType = item.type === 'lost' ? 'found' : 'lost';
  const { data: potentialMatches } = await supabase
    .from('items')
    .select('*')
    .eq('type', oppositeType)
    .eq('status', 'active')
    .eq('privacy_level', 'public');

  if (!potentialMatches) return;

  // Calculate match scores
  const matches: Array<{ itemId: string; score: number; details: Record<string, number> }> = [];

  for (const potential of potentialMatches) {
    const score = calculateMatchScore(item, potential);
    if (score.overall >= 30) {
      matches.push({
        itemId: potential.id,
        score: score.overall,
        details: {
          text_similarity: score.text,
          category_match: score.category,
          color_match: score.color,
          location_similarity: score.location,
          date_similarity: score.date,
        },
      });
    }
  }

  // Sort by score and create matches
  matches.sort((a, b) => b.score - a.score);

  for (const match of matches) {
    const lostItemId = item.type === 'lost' ? itemId : match.itemId;
    const foundItemId = item.type === 'found' ? itemId : match.itemId;

    await supabase.from('item_matches').upsert(
      {
        lost_item_id: lostItemId,
        found_item_id: foundItemId,
        match_score: match.score,
        text_similarity: match.details.text_similarity,
        location_similarity: match.details.location_similarity,
        date_similarity: match.details.date_similarity,
      },
      { onConflict: 'lost_item_id,found_item_id' }
    );
  }

  // Update item with best match
  if (matches.length > 0) {
    const bestMatch = matches[0];
    await supabase
      .from('items')
      .update({
        match_score: bestMatch.score,
        matched_item_id: bestMatch.itemId,
      })
      .eq('id', itemId);

    // Send notification for high confidence matches
    if (bestMatch.score >= 70) {
      await sendMatchNotification(itemId, bestMatch.itemId, bestMatch.score);
    }
  }
}

function calculateMatchScore(item1: Record<string, unknown>, item2: Record<string, unknown>): {
  overall: number;
  text: number;
  category: number;
  color: number;
  location: number;
  date: number;
} {
  let text = 0;
  let category = 0;
  let color = 0;
  let location = 0;
  let date = 0;

  // Category match (25% weight)
  if (item1.category === item2.category) {
    category = 100;
  } else {
    category = 0;
  }

  // Title similarity (20% weight)
  const title1 = ((item1.title as string) || '').toLowerCase();
  const title2 = ((item2.title as string) || '').toLowerCase();
  const titleWords1 = new Set(title1.split(/\s+/));
  const titleWords2 = new Set(title2.split(/\s+/));
  const titleOverlap = Array.from(titleWords1).filter((w) => titleWords2.has(w)).length;
  text = Math.min(100, (titleOverlap / Math.min(titleWords1.size, titleWords2.size || 1)) * 100 * 2);

  // Color match (15% weight)
  if (item1.primary_color && item2.primary_color) {
    if (item1.primary_color === item2.primary_color) {
      color = 100;
    } else if (
      item1.primary_color === item2.secondary_color ||
      item2.primary_color === item1.secondary_color
    ) {
      color = 50;
    }
  }

  // Location similarity (20% weight)
  if (item1.latitude && item2.latitude && item1.longitude && item2.longitude) {
    const distance = calculateDistance(
      item1.latitude as number,
      item1.longitude as number,
      item2.latitude as number,
      item2.longitude as number
    );
    // 100% at 0km, 0% at 100km
    location = Math.max(0, 100 - distance);
  } else if (item1.city && item2.city && item1.city === item2.city) {
    location = 80;
  } else if (item1.country && item2.country && item1.country === item2.country) {
    location = 30;
  }

  // Date proximity (20% weight)
  const date1 = new Date(item1.date_lost_found as string);
  const date2 = new Date(item2.date_lost_found as string);
  const daysDiff = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
  // 100% at 0 days, 0% at 30 days
  date = Math.max(0, 100 - (daysDiff / 30) * 100);

  // Calculate weighted overall score
  const overall =
    category * 0.25 +
    text * 0.2 +
    color * 0.15 +
    location * 0.2 +
    date * 0.2;

  return { overall: Math.round(overall), text: Math.round(text), category, color: Math.round(color), location: Math.round(location), date: Math.round(date) };
}

async function sendMatchNotification(itemId: string, matchedItemId: string, score: number): Promise<void> {
  // Get both items
  const { data: item1 } = await supabase.from('items').select('user_id').eq('id', itemId).single();
  const { data: item2 } = await supabase.from('items').select('user_id').eq('id', matchedItemId).single();

  if (!item1 || !item2) return;

  // Create notifications for both users
  await supabase.from('notifications').insert([
    {
      user_id: item1.user_id,
      type: 'success',
      title: 'Potential Match Found!',
      message: `A ${score}% match has been found for your item. Check it out!`,
      action_url: `/items/${itemId}/matches`,
    },
    {
      user_id: item2.user_id,
      type: 'success',
      title: 'Potential Match Found!',
      message: `A ${score}% match has been found for your item. Check it out!`,
      action_url: `/items/${matchedItemId}/matches`,
    },
  ]);

  // Mark as notified
  await supabase
    .from('item_matches')
    .update({ notified: true })
    .or(`lost_item_id.eq.${itemId},found_item_id.eq.${itemId}`);
}
