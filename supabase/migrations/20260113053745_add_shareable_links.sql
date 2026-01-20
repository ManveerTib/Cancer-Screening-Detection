/*
  # Add Shareable Links Support

  ## Description
  Adds support for shareable analysis links with privacy controls and metadata tracking.

  ## Changes
  
  1. New Columns in xray_analyses table
    - `share_token` (text, unique): Unique token for shareable links
    - `is_public` (boolean): Whether the analysis is publicly shareable
    - `shared_at` (timestamptz): When the analysis was first shared
    - `view_count` (integer): Number of times the shared link was viewed
    - `patient_name` (text): Optional patient name for reports
    - `patient_age` (integer): Optional patient age for reports
    - `notes` (text): Optional notes or annotations
  
  2. Security
    - RLS policies updated to allow public access for shared analyses
    - View count tracking for shared links
*/

-- Add new columns to xray_analyses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xray_analyses' AND column_name = 'share_token'
  ) THEN
    ALTER TABLE xray_analyses ADD COLUMN share_token text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xray_analyses' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE xray_analyses ADD COLUMN is_public boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xray_analyses' AND column_name = 'shared_at'
  ) THEN
    ALTER TABLE xray_analyses ADD COLUMN shared_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xray_analyses' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE xray_analyses ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xray_analyses' AND column_name = 'patient_name'
  ) THEN
    ALTER TABLE xray_analyses ADD COLUMN patient_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xray_analyses' AND column_name = 'patient_age'
  ) THEN
    ALTER TABLE xray_analyses ADD COLUMN patient_age integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'xray_analyses' AND column_name = 'notes'
  ) THEN
    ALTER TABLE xray_analyses ADD COLUMN notes text;
  END IF;
END $$;

-- Create index for share_token lookups
CREATE INDEX IF NOT EXISTS idx_xray_analyses_share_token ON xray_analyses(share_token);
CREATE INDEX IF NOT EXISTS idx_xray_analyses_is_public ON xray_analyses(is_public);

-- Add RLS policy for public shared analyses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'xray_analyses' 
    AND policyname = 'Public analyses are viewable by anyone'
  ) THEN
    CREATE POLICY "Public analyses are viewable by anyone"
      ON xray_analyses
      FOR SELECT
      USING (is_public = true AND share_token IS NOT NULL);
  END IF;
END $$;

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  token text;
  exists boolean;
BEGIN
  LOOP
    token := encode(gen_random_bytes(16), 'base64');
    token := replace(replace(replace(token, '+', ''), '/', ''), '=', '');
    
    SELECT EXISTS(SELECT 1 FROM xray_analyses WHERE share_token = token) INTO exists;
    
    IF NOT exists THEN
      RETURN token;
    END IF;
  END LOOP;
END;
$$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(analysis_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE xray_analyses 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = analysis_id;
END;
$$;