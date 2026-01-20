/*
  # Initial Schema Setup for Probation Management System

  ## Overview
  This migration sets up the complete database schema for a comprehensive probation management system with analytics, collaboration, and personalization features.

  ## 1. New Tables

  ### Core Tables
  - `probation_nodes` - Stores all probation node data
    - id, node_id, tenant, is_qualified, source_type, model, generation
    - device_type, sku, region, fallback_count, age_in_probation
    - node_status, rto_created_date, rto_tracking_url
    - crc_status, burnin_status, action_taken, node_state
    - timestamps for all key events (burnin, crc, probation agent)
    - experiment details and run statuses

  - `incident_records` - Tracks incident-related data
    - id, incident_number, node_id, node_status, auto_sage_status
    - source, submitted_date, tenant
    - experiment and test run information

  ### Collaboration Tables
  - `comments` - Comments and notes on nodes
    - id, node_id, user_id, comment_text, created_at, updated_at
    - parent_comment_id for threaded discussions

  - `comment_mentions` - Track @mentions in comments
    - id, comment_id, mentioned_user_id, created_at

  - `activity_logs` - Audit trail of all actions
    - id, user_id, action_type, entity_type, entity_id
    - old_value, new_value, ip_address, user_agent, created_at

  ### Analytics Tables
  - `analytics_snapshots` - Periodic snapshots of system stats
    - id, snapshot_date, total_nodes_in_probation
    - success_rate, failure_rate, avg_age_in_probation
    - nodes_by_status (jsonb), nodes_by_tenant (jsonb)

  ### Personalization Tables
  - `user_preferences` - User settings and preferences
    - user_id, theme, display_density, default_page
    - notification_email_enabled, notification_in_app_enabled
    - auto_refresh_enabled, auto_refresh_interval

  - `saved_filters` - User-saved filter configurations
    - id, user_id, filter_name, filter_config (jsonb)
    - is_default, created_at, updated_at

  - `user_bookmarks` - Favorited nodes
    - id, user_id, node_id, created_at

  - `recent_activity` - User's recent views
    - id, user_id, entity_type, entity_id, viewed_at

  ### Notification Tables
  - `notifications` - System notifications
    - id, user_id, notification_type, title, message
    - entity_type, entity_id, is_read, created_at

  - `shared_links` - Shareable links to views
    - id, created_by_user_id, link_token, entity_type
    - filter_config (jsonb), expires_at, created_at

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Restrict sensitive operations to authorized users

  ## 3. Indexes
  - Add indexes on frequently queried columns for performance
  - Foreign key indexes for joins

  ## 4. Important Notes
  - All timestamps use timestamptz for timezone awareness
  - JSONB used for flexible configuration storage
  - Soft deletes supported via deleted_at columns where needed
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Probation Nodes Table
CREATE TABLE IF NOT EXISTS probation_nodes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id text UNIQUE NOT NULL,
  tenant text NOT NULL,
  is_qualified text DEFAULT 'No',
  source_type text,
  model text,
  generation integer,
  device_type text,
  crc_workload text,
  sku text,
  region text,
  fallback_count_in_probation integer DEFAULT 0,
  age_in_probation integer DEFAULT 0,
  node_status text DEFAULT 'Probation',
  rto_created_date timestamptz,
  rto_tracking_url text,
  crc_status text,
  burnin_status text,
  action_taken text,
  node_state text,
  processed_in_burnin_date timestamptz,
  crc_experiment_start_date timestamptz,
  crc_experiment_end_date timestamptz,
  crc_experiment_name text,
  crc_experiment_id text,
  container_count integer,
  tip_node_session_id text,
  node_availability_state text,
  probation_agent_started timestamptz,
  sent_for_burnin_at timestamptz,
  sent_for_crc_at timestamptz,
  crc_execution_time text,
  burnin_execution_time text,
  crc_run_status text,
  burnin_run_status text,
  node_status_after_burnin_crc text,
  rto_id_for_burnin text,
  rto_id_for_crc text,
  probation_agent_ended timestamptz,
  probation_ai_agent_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Incident Records Table
CREATE TABLE IF NOT EXISTS incident_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number text UNIQUE NOT NULL,
  node_id text NOT NULL,
  node_status text,
  auto_sage_status text,
  source text,
  submitted_date timestamptz,
  tenant text,
  probation_agent_started timestamptz,
  sent_for_burnin_at timestamptz,
  sent_for_crc_at timestamptz,
  crc_execution_time text,
  burnin_execution_time text,
  crc_run_status text,
  burnin_run_status text,
  node_status_after_burnin_crc text,
  rto_id_for_burnin text,
  rto_id_for_crc text,
  crc_experiment_id text,
  crc_experiment_name text,
  probation_agent_ended timestamptz,
  source_type text,
  model text,
  generation integer,
  device_type text,
  sku text,
  region text,
  probation_ai_agent_status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================================
-- COLLABORATION TABLES
-- =============================================================================

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id text NOT NULL,
  user_id uuid NOT NULL,
  comment_text text NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Comment Mentions Table
CREATE TABLE IF NOT EXISTS comment_mentions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Analytics Snapshots Table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_date timestamptz DEFAULT now(),
  total_nodes_in_probation integer DEFAULT 0,
  total_nodes_in_production integer DEFAULT 0,
  total_nodes_ofr integer DEFAULT 0,
  success_rate numeric(5,2),
  failure_rate numeric(5,2),
  avg_age_in_probation numeric(10,2),
  nodes_by_status jsonb,
  nodes_by_tenant jsonb,
  nodes_by_region jsonb,
  test_pass_rate numeric(5,2),
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- PERSONALIZATION TABLES
-- =============================================================================

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY,
  theme text DEFAULT 'system',
  display_density text DEFAULT 'comfortable',
  default_page text DEFAULT '/',
  notification_email_enabled boolean DEFAULT true,
  notification_in_app_enabled boolean DEFAULT true,
  auto_refresh_enabled boolean DEFAULT true,
  auto_refresh_interval integer DEFAULT 30,
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Saved Filters Table
CREATE TABLE IF NOT EXISTS saved_filters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  filter_name text NOT NULL,
  filter_config jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Bookmarks Table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  node_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, node_id)
);

-- Recent Activity Table
CREATE TABLE IF NOT EXISTS recent_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- =============================================================================
-- NOTIFICATION TABLES
-- =============================================================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  entity_type text,
  entity_id text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Shared Links Table
CREATE TABLE IF NOT EXISTS shared_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by_user_id uuid NOT NULL,
  link_token text UNIQUE NOT NULL,
  entity_type text NOT NULL,
  filter_config jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Probation Nodes Indexes
CREATE INDEX IF NOT EXISTS idx_probation_nodes_node_id ON probation_nodes(node_id);
CREATE INDEX IF NOT EXISTS idx_probation_nodes_tenant ON probation_nodes(tenant);
CREATE INDEX IF NOT EXISTS idx_probation_nodes_status ON probation_nodes(node_status);
CREATE INDEX IF NOT EXISTS idx_probation_nodes_region ON probation_nodes(region);
CREATE INDEX IF NOT EXISTS idx_probation_nodes_created_at ON probation_nodes(created_at);

-- Incident Records Indexes
CREATE INDEX IF NOT EXISTS idx_incident_records_incident_number ON incident_records(incident_number);
CREATE INDEX IF NOT EXISTS idx_incident_records_node_id ON incident_records(node_id);

-- Comments Indexes
CREATE INDEX IF NOT EXISTS idx_comments_node_id ON comments(node_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Saved Filters Indexes
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);

-- User Bookmarks Indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);

-- Recent Activity Indexes
CREATE INDEX IF NOT EXISTS idx_recent_activity_user_id ON recent_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_activity_viewed_at ON recent_activity(viewed_at);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE probation_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Probation Nodes Policies (accessible to all authenticated users)
CREATE POLICY "Authenticated users can view probation nodes"
  ON probation_nodes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert probation nodes"
  ON probation_nodes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update probation nodes"
  ON probation_nodes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Incident Records Policies
CREATE POLICY "Authenticated users can view incident records"
  ON incident_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert incident records"
  ON incident_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update incident records"
  ON incident_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments Policies
CREATE POLICY "Authenticated users can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment Mentions Policies
CREATE POLICY "Authenticated users can view mentions"
  ON comment_mentions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert mentions"
  ON comment_mentions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Activity Logs Policies
CREATE POLICY "Authenticated users can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Analytics Snapshots Policies
CREATE POLICY "Authenticated users can view analytics"
  ON analytics_snapshots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert analytics snapshots"
  ON analytics_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User Preferences Policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Saved Filters Policies
CREATE POLICY "Users can view own saved filters"
  ON saved_filters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved filters"
  ON saved_filters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved filters"
  ON saved_filters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved filters"
  ON saved_filters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Bookmarks Policies
CREATE POLICY "Users can view own bookmarks"
  ON user_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON user_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON user_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Recent Activity Policies
CREATE POLICY "Users can view own recent activity"
  ON recent_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recent activity"
  ON recent_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Shared Links Policies
CREATE POLICY "Anyone can view valid shared links"
  ON shared_links FOR SELECT
  TO authenticated
  USING (expires_at IS NULL OR expires_at > now());

CREATE POLICY "Authenticated users can create shared links"
  ON shared_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by_user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_probation_nodes_updated_at
  BEFORE UPDATE ON probation_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_records_updated_at
  BEFORE UPDATE ON incident_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_filters_updated_at
  BEFORE UPDATE ON saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();