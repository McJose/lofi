/*
# Create privacy_settings table for FindBack

## Purpose
Allow users to control their profile visibility and what information is shared publicly.

## New Tables
- `privacy_settings`
  - `user_id` (uuid, primary key, references profiles)
  - `profile_visible` (boolean, not null, default true) - Public profile visibility
  - `show_email` (boolean, not null, default false) - Show email publicly
  - `show_phone` (boolean, not null, default false) - Show phone publicly
  - `show_location` (boolean, not null, default true) - Show country/city
  - `show_activity` (boolean, not null, default true) - Show activity stats
  - `created_at` (timestamptz, not null, default now())
  - `updated_at` (timestamptz, not null, default now())

## Security
- Enable RLS on `privacy_settings`.
- Owner-scoped: each user can only access their own settings.
*/

CREATE TABLE IF NOT EXISTS privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  profile_visible boolean NOT NULL DEFAULT true,
  show_email boolean NOT NULL DEFAULT false,
  show_phone boolean NOT NULL DEFAULT false,
  show_location boolean NOT NULL DEFAULT true,
  show_activity boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

-- Owner-only select policy
DROP POLICY IF EXISTS "privacy_settings_owner_select" ON privacy_settings;
CREATE POLICY "privacy_settings_owner_select" ON privacy_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owner-only insert policy
DROP POLICY IF EXISTS "privacy_settings_owner_insert" ON privacy_settings;
CREATE POLICY "privacy_settings_owner_insert" ON privacy_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner-only update policy
DROP POLICY IF EXISTS "privacy_settings_owner_update" ON privacy_settings;
CREATE POLICY "privacy_settings_owner_update" ON privacy_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_privacy_settings_updated_at ON privacy_settings;
CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();