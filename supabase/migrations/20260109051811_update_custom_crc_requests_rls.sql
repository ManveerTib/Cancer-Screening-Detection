/*
  # Update RLS policies for custom_crc_requests table

  1. Changes
    - Drop existing restrictive RLS policies that require authentication
    - Add new permissive policies that allow public access
    - This enables the app to work without authentication

  2. Security Notes
    - These policies allow anyone to read, create, update, and delete templates
    - For production, you should implement proper authentication
    - Current setup is suitable for development/testing
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own custom CRC requests" ON custom_crc_requests;
DROP POLICY IF EXISTS "Users can create custom CRC requests" ON custom_crc_requests;
DROP POLICY IF EXISTS "Users can update own custom CRC requests" ON custom_crc_requests;
DROP POLICY IF EXISTS "Users can delete own custom CRC requests" ON custom_crc_requests;

-- Create new permissive policies
CREATE POLICY "Allow public read access"
  ON custom_crc_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert access"
  ON custom_crc_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON custom_crc_requests
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON custom_crc_requests
  FOR DELETE
  TO anon, authenticated
  USING (true);
