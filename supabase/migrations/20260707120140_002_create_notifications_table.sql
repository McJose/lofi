/*
# Create notifications table for FindBack

## Purpose
Stores in-app notifications for users including item matches, messages, and system updates.

## New Tables
- `notifications`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, references profiles) - Notification recipient
  - `type` (text, not null) - Notification type (info, success, warning, error)
  - `title` (text, not null) - Notification title
  - `message` (text, not null) - Notification message content
  - `read` (boolean, not null, default false) - Whether notification was read
  - `action_url` (text, nullable) - URL to navigate when clicked
  - `created_at` (timestamptz, not null, default now())

## Security
- Enable RLS on `notifications`.
- Owner-scoped: each user can only access their own notifications.
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Owner-only select policy
DROP POLICY IF EXISTS "notifications_owner_select" ON notifications;
CREATE POLICY "notifications_owner_select" ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owner-only insert policy (system can insert)
DROP POLICY IF EXISTS "notifications_owner_insert" ON notifications;
CREATE POLICY "notifications_owner_insert" ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owner-only update policy (mark as read)
DROP POLICY IF EXISTS "notifications_owner_update" ON notifications;
CREATE POLICY "notifications_owner_update" ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owner-only delete policy
DROP POLICY IF EXISTS "notifications_owner_delete" ON notifications;
CREATE POLICY "notifications_owner_delete" ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);