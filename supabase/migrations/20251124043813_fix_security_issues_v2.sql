/*
  # Fix Database Security Issues

  1. Remove Unused Indexes
    - Drop `idx_xray_analyses_status` (not being used in queries)
    - Drop `idx_analysis_metadata_analysis_id` (foreign key already has implicit index)
  
  2. Fix Function Search Path
    - Drop trigger first to avoid cascade issues
    - Recreate `update_updated_at_column` function with immutable search_path
    - Recreate trigger with updated function
    - Set explicit schema qualification to prevent search path attacks
  
  ## Security Notes
  
  - Unused indexes consume storage and slow down write operations
  - Mutable search_path in functions can lead to privilege escalation attacks
  - Functions should use schema-qualified references or have immutable search_path
  
  ## Changes
  
  - Removed 2 unused indexes
  - Fixed function security by setting immutable search_path
  - Trigger recreated to use secure function
*/

-- Step 1: Drop unused indexes to improve write performance
DROP INDEX IF EXISTS idx_xray_analyses_status;
DROP INDEX IF EXISTS idx_analysis_metadata_analysis_id;

-- Step 2: Drop trigger first to allow function modification
DROP TRIGGER IF EXISTS update_xray_analyses_updated_at ON xray_analyses;

-- Step 3: Drop and recreate function with secure search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Step 4: Recreate trigger with the secure function
CREATE TRIGGER update_xray_analyses_updated_at
  BEFORE UPDATE ON public.xray_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 5: Add security documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 
  'Automatically updates the updated_at timestamp on row update. Uses immutable search_path (SET search_path = public) to prevent search path privilege escalation attacks.';