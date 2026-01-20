import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { XRayAnalysis } from '../types/analysis';
import { History, ChevronRight, GitCompare, CheckSquare, Square } from 'lucide-react';

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: XRayAnalysis) => void;
  refreshTrigger: number;
}

export default function AnalysisHistory({ onSelectAnalysis, refreshTrigger }: AnalysisHistoryProps) {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<XRayAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadAnalyses();
  }, [refreshTrigger]);

  const loadAnalyses = async (retryCount = 0) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('xray_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading analyses:', error);

      if (retryCount < 3) {
        setTimeout(() => loadAnalyses(retryCount + 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 analyses to compare');
      return;
    }
    navigate(`/compare?ids=${selectedIds.join(',')}`);
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Analyses
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Analyses
        </h3>
        <p className="text-sm text-gray-500 text-center py-8">
          No previous analyses found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Analyses
        </h3>
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedIds([]);
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            compareMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <GitCompare className="h-4 w-4" />
          Compare
        </button>
      </div>

      {compareMode && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 mb-2">
            Select 2 or more analyses to compare
          </p>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Compare Selected ({selectedIds.length})
          </button>
        </div>
      )}

      <div className="space-y-3">
        {analyses.map(analysis => (
          <div
            key={analysis.id}
            onClick={() => {
              if (compareMode) {
                toggleSelection(analysis.id);
              } else {
                onSelectAnalysis(analysis);
              }
            }}
            className={`w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border cursor-pointer group ${
              selectedIds.includes(analysis.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {analysis.image_name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {analysis.prediction_class || 'Processing...'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {analysis.confidence_score && !compareMode && (
                  <span className="text-xs font-semibold text-blue-600">
                    {analysis.confidence_score.toFixed(0)}%
                  </span>
                )}
                {compareMode ? (
                  selectedIds.includes(analysis.id) ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
