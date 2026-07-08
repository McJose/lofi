// Item Types
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'draft' | 'active' | 'pending_claim' | 'claimed' | 'recovered' | 'archived';
export type PrivacyLevel = 'public' | 'limited' | 'private';
export type ContactPreference = 'in_app' | 'email' | 'phone';
export type ReportReason = 'fake' | 'spam' | 'duplicate' | 'fraud' | 'inappropriate' | 'other';
export type ClaimStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type MatchStatus = 'pending' | 'confirmed' | 'rejected' | 'expired';
export type TimelineEventType = 'created' | 'updated' | 'viewed' | 'matched' | 'claimed' | 'recovered' | 'archived' | 'draft_saved';

// Categories
export const ITEM_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'smartphone' },
  { id: 'phones', name: 'Phones', icon: 'phone', parent: 'electronics' },
  { id: 'laptops', name: 'Laptops', icon: 'laptop', parent: 'electronics' },
  { id: 'tablets', name: 'Tablets', icon: 'tablet', parent: 'electronics' },
  { id: 'cameras', name: 'Cameras', icon: 'camera', parent: 'electronics' },
  { id: 'headphones', name: 'Headphones', icon: 'headphones', parent: 'electronics' },
  { id: 'jewelry', name: 'Jewelry', icon: 'gem' },
  { id: 'watches', name: 'Watches', icon: 'watch', parent: 'jewelry' },
  { id: 'wallets', name: 'Wallets', icon: 'wallet' },
  { id: 'keys', name: 'Keys', icon: 'key' },
  { id: 'pets', name: 'Pets', icon: 'paw-print' },
  { id: 'dogs', name: 'Dogs', icon: 'dog', parent: 'pets' },
  { id: 'cats', name: 'Cats', icon: 'cat', parent: 'pets' },
  { id: 'birds', name: 'Birds', icon: 'bird', parent: 'pets' },
  { id: 'documents', name: 'Documents', icon: 'file-text' },
  { id: 'id_cards', name: 'ID Cards', icon: 'credit-card', parent: 'documents' },
  { id: 'passports', name: 'Passports', icon: 'book-open', parent: 'documents' },
  { id: 'bags', name: 'Bags', icon: 'briefcase' },
  { id: 'backpacks', name: 'Backpacks', icon: 'backpack', parent: 'bags' },
  { id: 'purses', name: 'Purses', icon: 'shopping-bag', parent: 'bags' },
  { id: 'clothing', name: 'Clothing', icon: 'shirt' },
  { id: 'sports_equipment', name: 'Sports Equipment', icon: 'trophy' },
  { id: 'medical_devices', name: 'Medical Devices', icon: 'heart-pulse' },
  { id: 'glasses', name: 'Glasses', icon: 'glasses' },
  { id: 'umbrellas', name: 'Umbrellas', icon: 'umbrella' },
  { id: 'books', name: 'Books', icon: 'book' },
  { id: 'toys', name: 'Toys', icon: 'gamepad-2' },
  { id: 'musical_instruments', name: 'Musical Instruments', icon: 'music' },
  { id: 'vehicles', name: 'Vehicles', icon: 'car' },
  { id: 'bicycles', name: 'Bicycles', icon: 'bike', parent: 'vehicles' },
  { id: 'other', name: 'Other', icon: 'package' },
] as const;

// Colors
export const ITEM_COLORS = [
  'black', 'white', 'gray', 'silver', 'gold', 'brown', 'tan', 'beige',
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'navy',
  'teal', 'cyan', 'magenta', 'maroon', 'olive', 'coral', 'multicolor', 'transparent',
] as const;

// Conditions (for found items)
export const ITEM_CONDITIONS = [
  { id: 'new', name: 'New/Like New', description: 'Item appears brand new' },
  { id: 'excellent', name: 'Excellent', description: 'Minimal signs of use' },
  { id: 'good', name: 'Good', description: 'Some wear but fully functional' },
  { id: 'fair', name: 'Fair', description: 'Visible wear, may need minor repairs' },
  { id: 'damaged', name: 'Damaged', description: 'Significant damage, needs repair' },
] as const;

// Item Interface
export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  status: ItemStatus;
  title: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  description: string;
  primary_color?: string | null;
  secondary_color?: string | null;
  size?: string | null;
  unique_identifiers: string[];
  date_lost_found: string;
  time_lost_found?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  reward_amount?: number | null;
  photos: string[];
  video_url?: string | null;
  privacy_level: PrivacyLevel;
  contact_preference: ContactPreference;
  holder_name?: string | null;
  police_station?: string | null;
  safe_storage_location?: string | null;
  condition?: string | null;
  view_count: number;
  match_score?: number | null;
  matched_item_id?: string | null;
  created_at: string;
  updated_at: string;
  recovered_at?: string | null;
  archived_at?: string | null;
}

// Item with relations
export interface ItemWithRelations extends Item {
  profile?: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url?: string | null;
    reputation_score: number;
    verification_badge: boolean;
  } | null;
  is_favorited?: boolean;
  matches?: ItemMatch[];
  claims?: Claim[];
}

// Item Timeline
export interface ItemTimeline {
  id: string;
  item_id: string;
  user_id?: string | null;
  event_type: TimelineEventType;
  details: Record<string, unknown>;
  created_at: string;
}

// Claim
export interface Claim {
  id: string;
  item_id: string;
  claimer_id: string;
  status: ClaimStatus;
  proof_photos: string[];
  proof_receipt_url?: string | null;
  serial_number_proof?: string | null;
  questionnaire_answers: Record<string, unknown>;
  message?: string | null;
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Claim with relations
export interface ClaimWithRelations extends Claim {
  claimer?: {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
  item?: Item | null;
}

// Favorite
export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

// Saved Search
export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: SearchFilters;
  alert_enabled: boolean;
  last_matched_at?: string | null;
  created_at: string;
}

// Item Match
export interface ItemMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  match_score: number;
  image_similarity?: number | null;
  text_similarity?: number | null;
  location_similarity?: number | null;
  date_similarity?: number | null;
  status: MatchStatus;
  notified: boolean;
  created_at: string;
}

// Item Match with item data
export interface ItemMatchWithItems extends ItemMatch {
  lost_item?: ItemWithRelations | null;
  found_item?: ItemWithRelations | null;
}

// Report
export interface Report {
  id: string;
  item_id: string;
  reporter_id?: string | null;
  reason: ReportReason;
  description?: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
}

// Search Filters
export interface SearchFilters {
  query?: string;
  type?: ItemType;
  categories?: string[];
  colors?: string[];
  brands?: string[];
  status?: ItemStatus[];
  reward_min?: number;
  reward_max?: number;
  date_from?: string;
  date_to?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // km
  city?: string;
  country?: string;
}

// Sort Options
export type SortOption = 'newest' | 'oldest' | 'closest' | 'reward_high' | 'reward_low' | 'relevance' | 'views';

// Pagination
export interface PaginatedItems {
  items: ItemWithRelations[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
