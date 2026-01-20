/*
  # Clinical Image Analysis System Schema

  ## New Tables
  
  1. `xray_analyses`
    - `id` (uuid, primary key) - Unique identifier for each analysis
    - `image_url` (text) - URL/path to the uploaded X-ray image
    - `image_name` (text) - Original filename
    - `prediction_class` (text) - Primary predicted condition
    - `confidence_score` (numeric) - Confidence percentage (0-100)
    - `predictions_json` (jsonb) - All prediction probabilities
    - `heatmap_url` (text, nullable) - URL to Grad-CAM heatmap visualization
    - `clinical_report` (text, nullable) - AI-generated clinical summary
    - `status` (text) - Processing status: 'pending', 'completed', 'failed'
    - `error_message` (text, nullable) - Error details if analysis failed
    - `created_at` (timestamptz) - Timestamp of upload
    - `updated_at` (timestamptz) - Last update timestamp
  
  2. `analysis_metadata`
    - `id` (uuid, primary key) - Unique identifier
    - `analysis_id` (uuid, foreign key) - Reference to xray_analyses
    - `model_version` (text) - Version of ML model used
    - `processing_time_ms` (integer) - Time taken for inference
    - `image_dimensions` (jsonb) - Original image size {width, height}
    - `preprocessing_params` (jsonb) - Parameters used for preprocessing
    - `created_at` (timestamptz) - Timestamp
  
  ## Security
  
  - Enable RLS on all tables
  - Public read access for demo purposes (can be restricted later)
  - Authenticated users can create analyses
  
  ## Notes
  
  - Using JSONB for flexible storage of prediction data
  - Timestamps for audit trail
  - Status field for async processing support
  - Metadata table for ML pipeline transparency
*/

-- Create xray_analyses table
CREATE TABLE IF NOT EXISTS xray_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  image_name text NOT NULL,
  prediction_class text,
  confidence_score numeric(5,2),
  predictions_json jsonb,
  heatmap_url text,
  clinical_report text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analysis_metadata table
CREATE TABLE IF NOT EXISTS analysis_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES xray_analyses(id) ON DELETE CASCADE,
  model_version text NOT NULL DEFAULT 'CheXNet-v1.0',
  processing_time_ms integer,
  image_dimensions jsonb,
  preprocessing_params jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_xray_analyses_created_at ON xray_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xray_analyses_status ON xray_analyses(status);
CREATE INDEX IF NOT EXISTS idx_analysis_metadata_analysis_id ON analysis_metadata(analysis_id);

-- Enable Row Level Security
ALTER TABLE xray_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (demo purposes)
CREATE POLICY "Anyone can view analyses"
  ON xray_analyses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create analyses"
  ON xray_analyses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update analyses"
  ON xray_analyses FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view metadata"
  ON analysis_metadata FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create metadata"
  ON analysis_metadata FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_xray_analyses_updated_at ON xray_analyses;
CREATE TRIGGER update_xray_analyses_updated_at
  BEFORE UPDATE ON xray_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();