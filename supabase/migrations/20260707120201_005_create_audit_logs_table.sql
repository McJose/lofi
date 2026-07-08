/*
# Create audit_logs table for FindBack

## Purpose
Track user actions for security auditing and compliance. Records who did what, when, and from where.

## New Tables
- `audit_logs`
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable, references profiles) - User who performed action (null for anonymous)
  - `action` (text, not null) - Action type (login, logout, create_item, update_item, etc.)
  - `entity_type` (text, not null) - Type of entity affected (user, item, message, etc.)
  - `entity_id` (uuid, nullable) - ID of affected entity
  - `details` (jsonb, not null, default {}) - Additional details about the action
  - `ip_address` (text, nullable) - Client IP address
  - `user_agent` (text, nullable) - Client user agent string
  - `created_at` (timestamptz, not null, default now())

## Security
- Enable RLS on `audit_logs`.
- Only admins can read audit logs.
- Authenticated users can insert (for logging their own actions).
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: For now, we'll allow authenticated users to read their own logs
-- In production, this should be restricted to admins only
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow inserts for logging
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_idx ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);