import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Users,
  FileCheck,
  AlertCircle,
  Eye,
  Share2,
  Zap,
  Target,
} from 'lucide-react';

interface UsageStats {
  total_scans: number;
  completed_scans: number;
  failed_scans: number;
  pending_scans: number;
  avg_confidence: number;
  total_shares: number;
  total_views: number;
  unique_conditions: number;
  scans_today: number;
  scans_this_week: number;
  scans_this_month: number;
}

interface PerformanceMetrics {
  avg_processing_time: number;
  success_rate: number;
  high_confidence_rate: number;
  recent_errors: number;
}

interface DailyStats {
  date: string;
  total_scans: number;
  completed_scans: number;
  failed_scans: number;
  avg_confidence: number;
}

interface ConditionFrequency {
  prediction_class: string;
  frequency: number;
  avg_confidence: number;
}

export default function AnalyticsDashboard() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [conditionFrequency, setConditionFrequency] = useState<ConditionFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [usageResponse, performanceResponse, dailyResponse, conditionResponse] =
        await Promise.all([
          supabase.rpc('get_usage_statistics'),
          supabase.rpc('get_performance_metrics'),
          supabase.from('analytics_daily_stats').select('*').limit(30),
          supabase.from('analytics_condition_frequency').select('*').limit(10),
        ]);

      if (usageResponse.data) {
        setUsageStats(usageResponse.data);
      }

      if (performanceResponse.data) {
        setPerformanceMetrics(performanceResponse.data);
      }

      if (dailyResponse.data) {
        setDailyStats(dailyResponse.data.reverse());
      }

      if (conditionResponse.data) {
        setConditionFrequency(conditionResponse.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-lg text-gray-600">
              System performance, usage statistics, and health trends
            </p>
          </div>

          {usageStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Total Scans</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{usageStats.total_scans}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {usageStats.scans_today} today, {usageStats.scans_this_week} this week
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileCheck className="h-8 w-8 text-green-600" />
                  <span className="text-sm font-medium text-gray-500">Completed</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{usageStats.completed_scans}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {((usageStats.completed_scans / usageStats.total_scans) * 100).toFixed(1)}%
                  success rate
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-8 w-8 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-500">Avg Confidence</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {usageStats.avg_confidence?.toFixed(1) || 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {usageStats.unique_conditions} unique conditions
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-8 w-8 text-purple-600" />
                  <span className="text-sm font-medium text-gray-500">Total Views</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{usageStats.total_views}</p>
                <p className="text-sm text-gray-600 mt-1">{usageStats.total_shares} shared</p>
              </div>
            </div>
          )}

          {performanceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">Avg Processing</span>
                </div>
                <p className="text-3xl font-bold">
                  {performanceMetrics.avg_processing_time?.toFixed(1) || 0}s
                </p>
                <p className="text-sm opacity-90 mt-1">Per analysis</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">Success Rate</span>
                </div>
                <p className="text-3xl font-bold">
                  {performanceMetrics.success_rate?.toFixed(1) || 0}%
                </p>
                <p className="text-sm opacity-90 mt-1">Overall completion</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">High Confidence</span>
                </div>
                <p className="text-3xl font-bold">
                  {performanceMetrics.high_confidence_rate?.toFixed(1) || 0}%
                </p>
                <p className="text-sm opacity-90 mt-1">Above 80% confidence</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">Recent Errors</span>
                </div>
                <p className="text-3xl font-bold">{performanceMetrics.recent_errors || 0}</p>
                <p className="text-sm opacity-90 mt-1">Last 7 days</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Scan Activity</h2>
              {dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_scans"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Total Scans"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed_scans"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">No data available</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Confidence Score Trend
              </h2>
              {dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avg_confidence"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Avg Confidence %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">No data available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Most Common Findings
              </h2>
              {conditionFrequency.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={conditionFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="prediction_class" angle={-45} textAnchor="end" height={120} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="frequency" fill="#3b82f6" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">No data available</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Condition Distribution
              </h2>
              {conditionFrequency.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={conditionFrequency}
                      dataKey="frequency"
                      nameKey="prediction_class"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry) => entry.prediction_class}
                    >
                      {conditionFrequency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-12">No data available</p>
              )}
            </div>
          </div>

          {conditionFrequency.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Statistics</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Condition
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Frequency
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Avg Confidence
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {conditionFrequency.map((condition, index) => {
                      const total = conditionFrequency.reduce((sum, c) => sum + c.frequency, 0);
                      const percentage = (condition.frequency / total) * 100;
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {condition.prediction_class}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-700">
                            {condition.frequency}
                          </td>
                          <td className="text-right py-3 px-4 text-gray-700">
                            {condition.avg_confidence.toFixed(1)}%
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700 w-12">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
