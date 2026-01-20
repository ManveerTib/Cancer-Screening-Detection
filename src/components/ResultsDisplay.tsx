import { XRayAnalysis } from '../types/analysis';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import EnhancedImageViewer from './EnhancedImageViewer';

interface ResultsDisplayProps {
  analysis: XRayAnalysis | null;
  isProcessing: boolean;
}

export default function ResultsDisplay({ analysis, isProcessing }: ResultsDisplayProps) {
  if (isProcessing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-700">
            Analyzing X-Ray Image...
          </p>
          <p className="text-sm text-gray-500">
            Running ML model inference and generating clinical report
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-dashed border-gray-300">
        <Activity className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          No Analysis Yet
        </p>
        <p className="text-sm text-gray-500">
          Upload an X-ray image to begin analysis
        </p>
      </div>
    );
  }

  if (analysis.status === 'failed') {
    return (
      <div className="bg-red-50 rounded-xl shadow-lg p-8 border-2 border-red-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Analysis Failed
            </h3>
            <p className="text-sm text-red-700">
              {analysis.error_message || 'An unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getSeverityColor = (className: string) => {
    const serious = ['Mass', 'Nodule', 'Pneumonia', 'Cardiomegaly', 'Effusion'];
    if (serious.some(s => className.includes(s))) {
      return 'border-red-300 bg-red-50';
    }
    return 'border-blue-300 bg-blue-50';
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl shadow-lg p-6 border-2 ${getSeverityColor(analysis.prediction_class || '')}`}>
        <div className="flex items-center gap-3 mb-4">
          {analysis.status === 'completed' ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <Clock className="h-8 w-8 text-yellow-600" />
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Primary Finding
            </h3>
            <p className="text-sm text-gray-600">
              {new Date(analysis.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Detected Condition
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {analysis.prediction_class || 'Unknown'}
            </p>
          </div>

          {analysis.confidence_score !== null && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Confidence Score
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${analysis.confidence_score}%` }}
                  ></div>
                </div>
                <span className={`text-lg font-bold px-3 py-1 rounded-full ${getConfidenceColor(analysis.confidence_score)}`}>
                  {analysis.confidence_score.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {analysis.predictions_json && Object.keys(analysis.predictions_json).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            All Predictions
          </h4>
          <div className="space-y-3">
            {Object.entries(analysis.predictions_json)
              .sort(([, a], [, b]) => b - a)
              .map(([condition, probability]) => (
                <div key={condition} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {condition}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${probability}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {probability.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {analysis.image_url && (
        <EnhancedImageViewer
          imageUrl={analysis.image_url}
          heatmapUrl={analysis.heatmap_url || undefined}
          title="Enhanced Image Analysis"
        />
      )}

      {analysis.clinical_report && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Clinical Report
          </h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
              {analysis.clinical_report}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
