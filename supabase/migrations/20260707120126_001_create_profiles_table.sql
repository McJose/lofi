/*
# Create profiles table for FindBack

## Purpose
Establishes user profiles that extend Supabase's built-in auth.users with additional
information like display name, reputation, and verification status.

## New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `user_id` (uuid, not null, unique, references auth.users, defaults to authenticated user)
  - `username` (text, not null, unique) - User's unique handle
  - `full_name` (text, not null) - User's display name
  - `bio` (text, nullable) - User biography/description
  - `avatar_url` (text, nullable) - URL to profile picture
  - `phone` (text, nullable) - Phone number
  - `country` (text, nullable) - Country of residence
  - `city` (text, nullable) - City of residence
  - `reputation_score` (integer, not null, default 0) - Community reputation points
  - `verification_badge` (boolean, not null, default false) - Verified status
  - `items_reported` (integer, not null, default 0) - Count of reported items
  - `items_found` (integer, not null, default 0) - Count of found items
  - `items_returned` (integer, not null, default 0) - Count of returned items
  - `created_at` (timestamptz, not null, default now())
  - `updated_at` (timestamptz, not null, default now())

## Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD: each authenticated user can only access and modify their own profile.
- Public read access so users can view each other's profiles.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  full_name text NOT NULL,
  bio text,
  avatar_url text,
  phone text,
  country text,
  city text,
  reputation_score integer NOT NULL DEFAULT 0,
  verification_badge boolean NOT NULL DEFAULT false,
  items_reported integer NOT NULL DEFAULT 0,
  items_found integer NOT NULL DEFAULT 0,
  items_returned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can view profiles)
DROP POLICY IF EXISTS "profiles_public_select" ON profiles;
CREATE POLICY "profiles_public_select" ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Owner-only insert policy
DROP POLICY IF EXISTS "profiles_owner_insert" ON profiles;
CREATE POLICY "profiles_owner_insert" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner-only update policy
DROP POLICY IF EXISTS "profiles_owner_update" ON profiles;
CREATE POLICY "profiles_owner_update" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owner-only delete policy
DROP POLICY IF EXISTS "profiles_owner_delete" ON profiles;
CREATE POLICY "profiles_owner_delete" ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_reputation_idx ON profiles(reputation_score DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();