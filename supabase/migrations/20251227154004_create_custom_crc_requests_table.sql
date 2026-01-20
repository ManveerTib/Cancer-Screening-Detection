/*
  # Create custom_crc_requests table

  1. New Tables
    - `custom_crc_requests`
      - `id` (uuid, primary key) - Unique identifier for the request
      - `experiment_name` (text) - Name of the experiment
      - `generation` (text) - Generation value (e.g., Gen8, Gen9, Gen10)
      - `filter_providers` (jsonb) - JSON object containing filter provider values
      - `full_payload` (jsonb) - Complete JSON payload based on the template
      - `status` (text) - Request status (draft, submitted, approved, rejected)
      - `created_by` (text) - User who created the request
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update
      - `submitted_at` (timestamptz) - Timestamp of submission
  
  2. Security
    - Enable RLS on `custom_crc_requests` table
    - Add policy for authenticated users to read their own requests
    - Add policy for authenticated users to create requests
    - Add policy for authenticated users to update their own requests
    
  3. Important Notes
    - The `full_payload` column stores the complete JSON template with all auto-filled fields
    - The `filter_providers` column stores user-provided filter values separately for easy querying
*/

CREATE TABLE IF NOT EXISTS custom_crc_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name text NOT NULL,
  generation text NOT NULL,
  filter_providers jsonb DEFAULT '{}'::jsonb,
  full_payload jsonb NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_at timestamptz
);

-- Enable RLS
ALTER TABLE custom_crc_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own requests
CREATE POLICY "Users can read own custom CRC requests"
  ON custom_crc_requests
  FOR SELECT
  TO authenticated
  USING (created_by = current_user);

-- Policy for users to create requests
CREATE POLICY "Users can create custom CRC requests"
  ON custom_crc_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = current_user);

-- Policy for users to update their own requests
CREATE POLICY "Users can update own custom CRC requests"
  ON custom_crc_requests
  FOR UPDATE
  TO authenticated
  USING (created_by = current_user)
  WITH CHECK (created_by = current_user);

-- Policy for users to delete their own requests
CREATE POLICY "Users can delete own custom CRC requests"
  ON custom_crc_requests
  FOR DELETE
  TO authenticated
  USING (created_by = current_user);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_crc_requests_created_by ON custom_crc_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_crc_requests_status ON custom_crc_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_crc_requests_created_at ON custom_crc_requests(created_at DESC);