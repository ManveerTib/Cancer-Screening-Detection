import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { XRayAnalysis } from '../types/analysis';
import { ArrowLeft, GitCompare, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const analysisIds = searchParams.get('ids')?.split(',') || [];
  const [analyses, setAnalyses] = useState<XRayAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  useEffect(() => {
    loadAnalyses();
  }, [analysisIds]);

  const loadAnalyses = async () => {
    if (analysisIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('xray_analyses')
        .select('*')
        .in('id', analysisIds)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAnalyses(data || []);

      if (data && data.length > 0 && data[0].predictions_json) {
        const allConditions = Object.keys(data[0].predictions_json);
        setSelectedConditions(allConditions.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimelineData = () => {
    return analyses.map((analysis, index) => {
      const dataPoint: any = {
        name: `Scan ${index + 1}`,
        date: new Date(analysis.created_at).toLocaleDateString(),
        confidence: analysis.confidence_score,
      };

      selectedConditions.forEach((condition) => {
        if (analysis.predictions_json && analysis.predictions_json[condition]) {
          dataPoint[condition] = analysis.predictions_json[condition];
        }
      });

      return dataPoint;
    });
  };

  const getComparisonData = () => {
    if (analyses.length < 2) return [];

    const firstAnalysis = analyses[0];
    const lastAnalysis = analyses[analyses.length - 1];

    if (!firstAnalysis.predictions_json || !lastAnalysis.predictions_json) return [];

    const allConditions = new Set([
      ...Object.keys(firstAnalysis.predictions_json),
      ...Object.keys(lastAnalysis.predictions_json),
    ]);

    return Array.from(allConditions).map((condition) => ({
      condition,
      first: firstAnalysis.predictions_json![condition] || 0,
      last: lastAnalysis.predictions_json![condition] || 0,
      change:
        (lastAnalysis.predictions_json![condition] || 0) -
        (firstAnalysis.predictions_json![condition] || 0),
    })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading analyses...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <GitCompare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Analyses Selected</h1>
            <p className="text-lg text-gray-600 mb-8">
              Please select at least one analysis from your history to compare.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Scan Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const timelineData = getTimelineData();
  const comparisonData = getComparisonData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Scan Page
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Analysis Comparison
            </h1>
            <p className="text-lg text-gray-600">
              Comparing {analyses.length} scan{analyses.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {analyses.map((analysis, index) => (
              <div key={analysis.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Scan {index + 1}</h3>
                    <span className="text-sm opacity-90">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {analysis.image_url && (
                    <img
                      src={analysis.image_url}
                      alt={`Scan ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 mb-3"
                    />
                  )}

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Image Name</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {analysis.image_name}
                      </p>
                    </div>

                    {analysis.prediction_class && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Primary Finding</p>
                        <p className="text-sm font-semibold text-red-600">
                          {analysis.prediction_class}
                        </p>
                      </div>
                    )}

                    {analysis.confidence_score !== null && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${analysis.confidence_score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {analysis.confidence_score.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {analyses.length > 1 && comparisonData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Analysis (First vs Last)
                </h2>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="condition" angle={-45} textAnchor="end" height={120} />
                  <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="first" fill="#3b82f6" name="First Scan" />
                  <Bar dataKey="last" fill="#10b981" name="Last Scan" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Significant Changes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {comparisonData.slice(0, 6).map((item) => (
                    <div
                      key={item.condition}
                      className={`p-3 rounded-lg border-2 ${
                        item.change > 5
                          ? 'bg-red-50 border-red-200'
                          : item.change < -5
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{item.condition}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600">
                          {item.first.toFixed(1)}% → {item.last.toFixed(1)}%
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            item.change > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {item.change > 0 ? '+' : ''}
                          {item.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {timelineData.length > 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Timeline Visualization</h2>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Select conditions to track:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analyses[0].predictions_json &&
                    Object.keys(analyses[0].predictions_json).map((condition) => (
                      <button
                        key={condition}
                        onClick={() => {
                          if (selectedConditions.includes(condition)) {
                            setSelectedConditions(
                              selectedConditions.filter((c) => c !== condition)
                            );
                          } else {
                            setSelectedConditions([...selectedConditions, condition]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedConditions.includes(condition)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {selectedConditions.map((condition, index) => {
                    const colors = [
                      '#3b82f6',
                      '#10b981',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6',
                      '#ec4899',
                      '#14b8a6',
                    ];
                    return (
                      <Line
                        key={condition}
                        type="monotone"
                        dataKey={condition}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
