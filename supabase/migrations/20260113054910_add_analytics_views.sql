/*
  # Add Analytics Views and Functions

  ## Description
  Creates database views and functions for analytics dashboard to track usage statistics,
  model performance, and health trends.

  ## Changes
  
  1. Views
    - `analytics_daily_stats`: Daily aggregated statistics
    - `analytics_condition_frequency`: Most common findings
    - `analytics_model_performance`: Model performance metrics over time
  
  2. Functions
    - `get_usage_statistics()`: Returns overall usage statistics
    - `get_condition_trends()`: Returns trending conditions over time
*/

CREATE OR REPLACE VIEW analytics_daily_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_scans,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_scans,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_scans,
  AVG(confidence_score) FILTER (WHERE status = 'completed') as avg_confidence,
  COUNT(DISTINCT prediction_class) FILTER (WHERE status = 'completed') as unique_conditions
FROM xray_analyses
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW analytics_condition_frequency AS
SELECT
  prediction_class,
  COUNT(*) as frequency,
  AVG(confidence_score) as avg_confidence,
  MIN(confidence_score) as min_confidence,
  MAX(confidence_score) as max_confidence
FROM xray_analyses
WHERE status = 'completed' AND prediction_class IS NOT NULL
GROUP BY prediction_class
ORDER BY frequency DESC;

CREATE OR REPLACE VIEW analytics_model_performance AS
SELECT
  DATE(created_at) as date,
  prediction_class,
  COUNT(*) as count,
  AVG(confidence_score) as avg_confidence,
  STDDEV(confidence_score) as stddev_confidence
FROM xray_analyses
WHERE status = 'completed' AND prediction_class IS NOT NULL
GROUP BY DATE(created_at), prediction_class
ORDER BY date DESC, count DESC;

CREATE OR REPLACE FUNCTION get_usage_statistics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_scans', (SELECT COUNT(*) FROM xray_analyses),
    'completed_scans', (SELECT COUNT(*) FROM xray_analyses WHERE status = 'completed'),
    'failed_scans', (SELECT COUNT(*) FROM xray_analyses WHERE status = 'failed'),
    'pending_scans', (SELECT COUNT(*) FROM xray_analyses WHERE status = 'pending'),
    'avg_confidence', (SELECT AVG(confidence_score) FROM xray_analyses WHERE status = 'completed'),
    'total_shares', (SELECT COUNT(*) FROM xray_analyses WHERE is_public = true),
    'total_views', (SELECT COALESCE(SUM(view_count), 0) FROM xray_analyses),
    'unique_conditions', (SELECT COUNT(DISTINCT prediction_class) FROM xray_analyses WHERE status = 'completed'),
    'scans_today', (SELECT COUNT(*) FROM xray_analyses WHERE DATE(created_at) = CURRENT_DATE),
    'scans_this_week', (SELECT COUNT(*) FROM xray_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'scans_this_month', (SELECT COUNT(*) FROM xray_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_condition_trends(days_back integer DEFAULT 30)
RETURNS TABLE(
  date date,
  condition text,
  count bigint,
  avg_confidence numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    prediction_class as condition,
    COUNT(*) as count,
    AVG(confidence_score) as avg_confidence
  FROM xray_analyses
  WHERE status = 'completed' 
    AND prediction_class IS NOT NULL
    AND created_at >= CURRENT_DATE - days_back
  GROUP BY DATE(created_at), prediction_class
  ORDER BY date DESC, count DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'avg_processing_time', (
      SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))
      FROM xray_analyses
      WHERE status = 'completed'
    ),
    'success_rate', (
      SELECT (COUNT(*) FILTER (WHERE status = 'completed')::float / NULLIF(COUNT(*), 0) * 100)
      FROM xray_analyses
    ),
    'high_confidence_rate', (
      SELECT (COUNT(*) FILTER (WHERE confidence_score >= 80)::float / NULLIF(COUNT(*), 0) * 100)
      FROM xray_analyses
      WHERE status = 'completed'
    ),
    'recent_errors', (
      SELECT COUNT(*)
      FROM xray_analyses
      WHERE status = 'failed' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;