/*
# Create notification_settings table for FindBack

## Purpose
Allow users to customize their notification preferences for different channels and event types.

## New Tables
- `notification_settings`
  - `user_id` (uuid, primary key, references profiles)
  - `email_notifications` (boolean, not null, default true)
  - `push_notifications` (boolean, not null, default true)
  - `marketing_emails` (boolean, not null, default false)
  - `item_matches` (boolean, not null, default true) - Notify on potential item matches
  - `item_updates` (boolean, not null, default true) - Notify on item status changes
  - `messages` (boolean, not null, default true) - Notify on new messages
  - `created_at` (timestamptz, not null, default now())
  - `updated_at` (timestamptz, not null, default now())

## Security
- Enable RLS on `notification_settings`.
- Owner-scoped: each user can only access their own settings.
*/

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT false,
  item_matches boolean NOT NULL DEFAULT true,
  item_updates boolean NOT NULL DEFAULT true,
  messages boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Owner-only select policy
DROP POLICY IF EXISTS "notification_settings_owner_select" ON notification_settings;
CREATE POLICY "notification_settings_owner_select" ON notification_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owner-only insert policy
DROP POLICY IF EXISTS "notification_settings_owner_insert" ON notification_settings;
CREATE POLICY "notification_settings_owner_insert" ON notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner-only update policy
DROP POLICY IF EXISTS "notification_settings_owner_update" ON notification_settings;
CREATE POLICY "notification_settings_owner_update" ON notification_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();