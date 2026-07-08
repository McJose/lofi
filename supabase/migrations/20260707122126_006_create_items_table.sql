/*
# Create items table for FindBack Lost & Found

## Purpose
Core table for storing both lost and found items with comprehensive details for matching.

## New Tables
- `items`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, references profiles) - Item reporter
  - `type` (text, not null) - 'lost' or 'found'
  - `status` (text, not null, default 'active') - active, recovered, archived, draft
  - `title` (text, not null) - Item title
  - `category` (text, not null) - Item category
  - `brand` (text, nullable) - Brand name
  - `model` (text, nullable) - Model number/name
  - `serial_number` (text, nullable) - Serial number for identification
  - `description` (text, not null) - Detailed description
  - `primary_color` (text, nullable) - Primary color
  - `secondary_color` (text, nullable) - Secondary color
  - `size` (text, nullable) - Size information
  - `unique_identifiers` (jsonb, default '{}') - Array of unique features
  - `date_lost_found` (date, not null) - Date item was lost/found
  - `time_lost_found` (time, nullable) - Time item was lost/found
  - `latitude` (decimal, nullable) - GPS latitude
  - `longitude` (decimal, nullable) - GPS longitude
  - `address` (text, nullable) - Street address
  - `city` (text, nullable) - City
  - `state` (text, nullable) - State/province
  - `country` (text, nullable) - Country
  - `postal_code` (text, nullable) - Postal/ZIP code
  - `reward_amount` (decimal, nullable) - Reward offered (for lost items)
  - `photos` (jsonb, default '[]') - Array of photo URLs
  - `video_url` (text, nullable) - Video URL
  - `privacy_level` (text, not null, default 'public') - public, limited, private
  - `contact_preference` (text, not null, default 'in_app') - in_app, email, phone
  - `holder_name` (text, nullable) - Current holder (for found items)
  - `police_station` (text, nullable) - Police station info (for found items)
  - `safe_storage_location` (text, nullable) - Where item is stored safely
  - `condition` (text, nullable) - Item condition
  - `view_count` (integer, default 0) - Number of views
  - `match_score` (decimal, nullable) - Best match score
  - `matched_item_id` (uuid, nullable) - Best matched item
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  - `recovered_at` (timestamptz, nullable)
  - `archived_at` (timestamptz, nullable)

## Security
- Enable RLS on `items`.
- Public items are viewable by all.
- Users can only modify their own items.
*/

CREATE TYPE item_status AS ENUM ('draft', 'active', 'pending_claim', 'claimed', 'recovered', 'archived');
CREATE TYPE item_type AS ENUM ('lost', 'found');
CREATE TYPE privacy_level AS ENUM ('public', 'limited', 'private');

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type item_type NOT NULL,
  status item_status NOT NULL DEFAULT 'active',
  title text NOT NULL,
  category text NOT NULL,
  brand text,
  model text,
  serial_number text,
  description text NOT NULL,
  primary_color text,
  secondary_color text,
  size text,
  unique_identifiers jsonb DEFAULT '[]'::jsonb,
  date_lost_found date NOT NULL,
  time_lost_found time,
  latitude decimal,
  longitude decimal,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  reward_amount decimal DEFAULT 0,
  photos jsonb DEFAULT '[]'::jsonb,
  video_url text,
  privacy_level privacy_level NOT NULL DEFAULT 'public',
  contact_preference text NOT NULL DEFAULT 'in_app',
  holder_name text,
  police_station text,
  safe_storage_location text,
  condition text,
  view_count integer DEFAULT 0,
  match_score decimal,
  matched_item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  recovered_at timestamptz,
  archived_at timestamptz,

  CONSTRAINT valid_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL AND
     latitude >= -90 AND latitude <= 90 AND
     longitude >= -180 AND longitude <= 180)
  ),
  CONSTRAINT valid_reward CHECK (reward_amount >= 0)
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Public items are viewable by everyone
DROP POLICY IF EXISTS "items_public_select" ON items;
CREATE POLICY "items_public_select" ON items FOR SELECT
  TO anon, authenticated
  USING (privacy_level = 'public' OR auth.uid() = user_id);

-- Users can insert their own items
DROP POLICY IF EXISTS "items_owner_insert" ON items;
CREATE POLICY "items_owner_insert" ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
DROP POLICY IF EXISTS "items_owner_update" ON items;
CREATE POLICY "items_owner_update" ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own items
DROP POLICY IF EXISTS "items_owner_delete" ON items;
CREATE POLICY "items_owner_delete" ON items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_type_idx ON items(type);
CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category);
CREATE INDEX IF NOT EXISTS items_date_lost_found_idx ON items(date_lost_found);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS items_location_idx ON items(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS items_primary_color_idx ON items(primary_color);
CREATE INDEX IF NOT EXISTS items_brand_idx ON items(lower(brand) text_pattern_ops);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();