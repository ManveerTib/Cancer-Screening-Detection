/*
  # Change JSONB columns to JSON to preserve key order

  1. Changes
    - Alter `filter_providers` column from jsonb to json
    - Alter `full_payload` column from jsonb to json

  2. Reason
    - JSONB type in PostgreSQL does not preserve the order of object keys
    - JSON type preserves the exact text representation including key order
    - This is critical for maintaining the original template structure

  3. Note
    - Existing data will be automatically converted from jsonb to json
    - No data loss will occur during this conversion
*/

-- Change filter_providers from jsonb to json
ALTER TABLE custom_crc_requests
  ALTER COLUMN filter_providers TYPE json USING filter_providers::json;

-- Change full_payload from jsonb to json
ALTER TABLE custom_crc_requests
  ALTER COLUMN full_payload TYPE json USING full_payload::json;

-- Update the default value for filter_providers
ALTER TABLE custom_crc_requests
  ALTER COLUMN filter_providers SET DEFAULT '{}'::json;
