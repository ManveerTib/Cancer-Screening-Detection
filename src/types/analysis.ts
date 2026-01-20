export interface XRayAnalysis {
  id: string;
  image_url: string;
  image_name: string;
  prediction_class: string | null;
  confidence_score: number | null;
  predictions_json: Record<string, number> | null;
  heatmap_url: string | null;
  clinical_report: string | null;
  status: 'pending' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
  share_token: string | null;
  is_public: boolean;
  shared_at: string | null;
  view_count: number;
  patient_name: string | null;
  patient_age: number | null;
  notes: string | null;
}

export interface PredictionResult {
  class: string;
  confidence: number;
  all_predictions: Record<string, number>;
  heatmap_base64?: string;
}

export interface ClinicalReport {
  summary: string;
  findings: string[];
  recommendations: string[];
}
