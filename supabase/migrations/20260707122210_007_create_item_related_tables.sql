/*
# Create item timeline and related tables for FindBack

## Purpose
Track all events related to items, manage claims, favorites, and reports.

## New Tables

### item_timeline
- `id` (uuid, primary key)
- `item_id` (uuid, references items)
- `user_id` (uuid, references profiles)
- `event_type` (text, not null) - created, updated, viewed, matched, claimed, recovered, archived
- `details` (jsonb, default '{}')
- `created_at` (timestamptz)

### claims
- `id` (uuid, primary key)
- `item_id` (uuid, references items)
- `claimer_id` (uuid, references profiles) - User claiming ownership
- `status` (text, default 'pending') - pending, under_review, approved, rejected
- `proof_photos` (jsonb, default '[]')
- `proof_receipt_url` (text, nullable)
- `serial_number_proof` (text, nullable)
- `questionnaire_answers` (jsonb, default '{}')
- `message` (text, nullable) - Claim message
- `admin_notes` (text, nullable)
- `reviewed_by` (uuid, references profiles, nullable)
- `reviewed_at` (timestamptz, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### favorites
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `item_id` (uuid, references items)
- `created_at` (timestamptz)

### saved_searches
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `name` (text, not null)
- `filters` (jsonb, not null)
- `alert_enabled` (boolean, default true)
- `last_matched_at` (timestamptz, nullable)
- `created_at` (timestamptz)

### item_matches
- `id` (uuid, primary key)
- `lost_item_id` (uuid, references items)
- `found_item_id` (uuid, references items)
- `match_score` (decimal, not null)
- `image_similarity` (decimal, nullable)
- `text_similarity` (decimal, nullable)
- `location_similarity` (decimal, nullable)
- `date_similarity` (decimal, nullable)
- `status` (text, default 'pending') - pending, confirmed, rejected, expired
- `notified` (boolean, default false)
- `created_at` (timestamptz)

### reports
- `id` (uuid, primary key)
- `item_id` (uuid, references items)
- `reporter_id` (uuid, references profiles, nullable)
- `reason` (text, not null) - fake, spam, duplicate, fraud, inappropriate, other
- `description` (text, nullable)
- `status` (text, default 'pending') - pending, reviewed, resolved, dismissed
- `reviewed_by` (uuid, references profiles, nullable)
- `reviewed_at` (timestamptz, nullable)
- `resolution_notes` (text, nullable)
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables with appropriate policies
*/

-- Item Timeline
CREATE TABLE IF NOT EXISTS item_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('created', 'updated', 'viewed', 'matched', 'claimed', 'recovered', 'archived', 'draft_saved')),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE item_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timeline_select" ON item_timeline;
CREATE POLICY "timeline_select" ON item_timeline FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_timeline.item_id AND (items.user_id = auth.uid() OR items.privacy_level = 'public'))
  );

DROP POLICY IF EXISTS "timeline_insert" ON item_timeline;
CREATE POLICY "timeline_insert" ON item_timeline FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS item_timeline_item_id_idx ON item_timeline(item_id);
CREATE INDEX IF NOT EXISTS item_timeline_created_at_idx ON item_timeline(created_at DESC);

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimer_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  proof_photos jsonb DEFAULT '[]'::jsonb,
  proof_receipt_url text,
  serial_number_proof text,
  questionnaire_answers jsonb DEFAULT '{}'::jsonb,
  message text,
  admin_notes text,
  reviewed_by uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(item_id, claimer_id)
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "claims_select" ON claims;
CREATE POLICY "claims_select" ON claims FOR SELECT
  TO authenticated
  USING (
    auth.uid() = claimer_id OR 
    EXISTS (SELECT 1 FROM items WHERE items.id = claims.item_id AND items.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "claims_insert" ON claims;
CREATE POLICY "claims_insert" ON claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = claimer_id);

DROP POLICY IF EXISTS "claims_update" ON claims;
CREATE POLICY "claims_update" ON claims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = claims.item_id AND items.user_id = auth.uid())
    OR auth.uid() = claimer_id
  );

CREATE INDEX IF NOT EXISTS claims_item_id_idx ON claims(item_id);
CREATE INDEX IF NOT EXISTS claims_claimer_id_idx ON claims(claimer_id);
CREATE INDEX IF NOT EXISTS claims_status_idx ON claims(status);

DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, item_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select" ON favorites;
CREATE POLICY "favorites_select" ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert" ON favorites;
CREATE POLICY "favorites_insert" ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete" ON favorites;
CREATE POLICY "favorites_delete" ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_item_id_idx ON favorites(item_id);

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL,
  alert_enabled boolean NOT NULL DEFAULT true,
  last_matched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_searches_select" ON saved_searches;
CREATE POLICY "saved_searches_select" ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_searches_insert" ON saved_searches;
CREATE POLICY "saved_searches_insert" ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_searches_update" ON saved_searches;
CREATE POLICY "saved_searches_update" ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_searches_delete" ON saved_searches;
CREATE POLICY "saved_searches_delete" ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON saved_searches(user_id);

-- Item Matches
CREATE TABLE IF NOT EXISTS item_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  found_item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  match_score decimal NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  image_similarity decimal CHECK (image_similarity IS NULL OR (image_similarity >= 0 AND image_similarity <= 100)),
  text_similarity decimal CHECK (text_similarity IS NULL OR (text_similarity >= 0 AND text_similarity <= 100)),
  location_similarity decimal CHECK (location_similarity IS NULL OR (location_similarity >= 0 AND location_similarity <= 100)),
  date_similarity decimal CHECK (date_similarity IS NULL OR (date_similarity >= 0 AND date_similarity <= 100)),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
  notified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(lost_item_id, found_item_id)
);

ALTER TABLE item_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "item_matches_select" ON item_matches;
CREATE POLICY "item_matches_select" ON item_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_matches.lost_item_id AND items.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM items WHERE items.id = item_matches.found_item_id AND items.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "item_matches_insert" ON item_matches;
CREATE POLICY "item_matches_insert" ON item_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "item_matches_update" ON item_matches;
CREATE POLICY "item_matches_update" ON item_matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_matches.lost_item_id AND items.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM items WHERE items.id = item_matches.found_item_id AND items.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS item_matches_lost_item_id_idx ON item_matches(lost_item_id);
CREATE INDEX IF NOT EXISTS item_matches_found_item_id_idx ON item_matches(found_item_id);
CREATE INDEX IF NOT EXISTS item_matches_score_idx ON item_matches(match_score DESC);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (reason IN ('fake', 'spam', 'duplicate', 'fraud', 'inappropriate', 'other')),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select" ON reports;
CREATE POLICY "reports_select" ON reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.reputation_score >= 100)
  );

DROP POLICY IF EXISTS "reports_insert" ON reports;
CREATE POLICY "reports_insert" ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_update" ON reports;
CREATE POLICY "reports_update" ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.reputation_score >= 100)
  );

CREATE INDEX IF NOT EXISTS reports_item_id_idx ON reports(item_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);