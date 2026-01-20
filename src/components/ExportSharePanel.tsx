import { useState } from 'react';
import { Download, Share2, Copy, Check, Edit3 } from 'lucide-react';
import { XRayAnalysis } from '../types/analysis';
import { supabase } from '../lib/supabase';
import { generatePDFReport } from '../lib/pdfGenerator';

interface ExportSharePanelProps {
  analysis: XRayAnalysis;
  onUpdate: () => void;
}

export default function ExportSharePanel({ analysis, onUpdate }: ExportSharePanelProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [patientName, setPatientName] = useState(analysis.patient_name || '');
  const [patientAge, setPatientAge] = useState(analysis.patient_age?.toString() || '');
  const [notes, setNotes] = useState(analysis.notes || '');

  const handleExportPDF = async () => {
    try {
      await generatePDFReport(analysis);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const handleGenerateShareLink = async () => {
    setIsSharing(true);
    try {
      const { data } = await supabase.rpc('generate_share_token');
      const shareToken = data;

      await supabase
        .from('xray_analyses')
        .update({
          share_token: shareToken,
          is_public: true,
          shared_at: new Date().toISOString(),
        })
        .eq('id', analysis.id);

      onUpdate();
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!analysis.share_token) return;

    const shareUrl = `${window.location.origin}/shared/${analysis.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeShare = async () => {
    try {
      await supabase
        .from('xray_analyses')
        .update({
          is_public: false,
        })
        .eq('id', analysis.id);

      onUpdate();
    } catch (error) {
      console.error('Error revoking share:', error);
      alert('Failed to revoke share link. Please try again.');
    }
  };

  const handleSaveMetadata = async () => {
    try {
      await supabase
        .from('xray_analyses')
        .update({
          patient_name: patientName || null,
          patient_age: patientAge ? parseInt(patientAge) : null,
          notes: notes || null,
        })
        .eq('id', analysis.id);

      setShowMetadataForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Failed to save metadata. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h4 className="text-lg font-bold text-gray-900 mb-4">Export & Share</h4>

      <div className="space-y-4">
        <button
          onClick={handleExportPDF}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <Download className="h-5 w-5" />
          Download PDF Report
        </button>

        <button
          onClick={() => setShowMetadataForm(!showMetadataForm)}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <Edit3 className="h-5 w-5" />
          {analysis.patient_name || analysis.patient_age || analysis.notes
            ? 'Edit Report Metadata'
            : 'Add Report Metadata'}
        </button>

        {showMetadataForm && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name (Optional)
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Age (Optional)
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Enter age"
                min="0"
                max="150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes or observations"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveMetadata}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowMetadataForm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Shareable Link</p>

          {!analysis.share_token ? (
            <button
              onClick={handleGenerateShareLink}
              disabled={isSharing}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-5 w-5" />
              {isSharing ? 'Generating...' : 'Generate Share Link'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/shared/${analysis.share_token}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Status: {analysis.is_public ? (
                    <span className="text-green-600 font-medium">Public</span>
                  ) : (
                    <span className="text-gray-500 font-medium">Private</span>
                  )}
                </span>
                <span className="text-gray-600">
                  Views: {analysis.view_count || 0}
                </span>
              </div>

              {analysis.is_public && (
                <button
                  onClick={handleRevokeShare}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Revoke Public Access
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Share this link to allow others to view the analysis results
          </p>
        </div>
      </div>
    </div>
  );
}
