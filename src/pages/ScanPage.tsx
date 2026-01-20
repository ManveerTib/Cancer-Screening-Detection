import { useState } from 'react';
import { Brain, AlertCircle, RotateCcw } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import ResultsDisplay from '../components/ResultsDisplay';
import AnalysisHistory from '../components/AnalysisHistory';
import ExportSharePanel from '../components/ExportSharePanel';
import { XRayAnalysis } from '../types/analysis';
import { supabase } from '../lib/supabase';
import { DEMO_PREDICTIONS, DEMO_CLINICAL_REPORT } from '../lib/demoData';

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<XRayAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [useDemoMode, setUseDemoMode] = useState(false);

  const handleImageSelect = async (file: File, preview: string) => {
    setSelectedFile(file);
    setSelectedPreview(preview);
    setCurrentAnalysis(null);
  };

  const handleSelectFromHistory = (analysis: XRayAnalysis) => {
    setCurrentAnalysis(analysis);
    setSelectedPreview(analysis.image_url);
    setSelectedFile(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedPreview(null);
    setCurrentAnalysis(null);
    setUseDemoMode(false);
  };

  const handleAnalyze = async (retryCount = 0) => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const topPrediction = Object.entries(DEMO_PREDICTIONS).sort(([, a], [, b]) => b - a)[0];

      const { data: newAnalysis, error: insertError } = await supabase
        .from('xray_analyses')
        .insert({
          image_url: selectedPreview,
          image_name: selectedFile.name,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        if (retryCount < 2 && insertError.message.includes('fetch')) {
          console.log(`Retrying connection... (${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return handleAnalyze(retryCount + 1);
        }
        throw insertError;
      }

      setCurrentAnalysis(newAnalysis);

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('analysis_id', newAnalysis.id);

        const { data, error } = await supabase.functions.invoke('xray-predict', {
          body: formData,
        });

        if (error) throw error;

        const { data: updatedAnalysis, error: updateError } = await supabase
          .from('xray_analyses')
          .select()
          .eq('id', newAnalysis.id)
          .single();

        if (updateError) throw updateError;

        setCurrentAnalysis(updatedAnalysis);
        setUseDemoMode(false);
      } catch (backendError) {
        console.warn('Backend not available, using demo mode:', backendError);
        setUseDemoMode(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const updateData = {
          prediction_class: topPrediction[0],
          confidence_score: topPrediction[1],
          predictions_json: DEMO_PREDICTIONS,
          heatmap_url: selectedPreview,
          clinical_report: DEMO_CLINICAL_REPORT,
          status: 'completed',
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from('xray_analyses')
          .update(updateData)
          .eq('id', newAnalysis.id);

        const { data: demoAnalysis } = await supabase
          .from('xray_analyses')
          .select()
          .eq('id', newAnalysis.id)
          .single();

        setCurrentAnalysis(demoAnalysis);
      }

      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');

      if (currentAnalysis) {
        await supabase
          .from('xray_analyses')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Analysis failed',
          })
          .eq('id', currentAnalysis.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered X-Ray Analysis
            </h1>
            <p className="text-xl text-gray-600">
              Upload a chest X-ray for AI-powered cancer detection analysis
            </p>
            {useDemoMode && (
              <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 flex items-start gap-3 max-w-3xl mx-auto">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-left">
                  <p className="font-semibold text-yellow-900">Demo Mode Active</p>
                  <p className="text-yellow-700 mt-1">
                    Backend server not detected. Using simulated predictions for demonstration.
                    To use real ML model, start the FastAPI backend.
                  </p>
                </div>
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Upload X-Ray Image
                  </h2>
                  {(selectedPreview || currentAnalysis) && (
                    <button
                      onClick={handleReset}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  )}
                </div>
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  isProcessing={isProcessing}
                  preview={selectedPreview}
                />

                {selectedFile && !isProcessing && (
                  <button
                    onClick={handleAnalyze}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Brain className="h-5 w-5" />
                    Analyze X-Ray Image
                  </button>
                )}
              </div>

              <ResultsDisplay
                analysis={currentAnalysis}
                isProcessing={isProcessing}
              />

              {currentAnalysis && currentAnalysis.status === 'completed' && (
                <ExportSharePanel
                  analysis={currentAnalysis}
                  onUpdate={() => setRefreshTrigger(prev => prev + 1)}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              <AnalysisHistory
                onSelectAnalysis={handleSelectFromHistory}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            <p className="mb-2">
              For research and demonstration purposes only
            </p>
            <p>
              Not intended for clinical diagnosis. Always consult qualified healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
