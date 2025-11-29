import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Activity,
} from "lucide-react";
import type { AnalysisResult } from "../types";

interface AnalysisResultsViewProps {
  analyses: AnalysisResult[];
  isLoading: boolean;
  selectedImageName?: string;
}

const AnalysisResultsView = ({
  analyses,
  isLoading,
  selectedImageName,
}: AnalysisResultsViewProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "processing":
        return "bg-blue-600 text-white";
      case "failed":
        return "bg-red-600 text-white";
      case "pending":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-600 text-white";
      case "medium":
        return "bg-yellow-600 text-white";
      case "low":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">
          {selectedImageName
            ? `No analysis results available for ${selectedImageName}`
            : "Select an image to view its analysis results"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          Analysis Results
          {selectedImageName && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              for {selectedImageName}
            </span>
          )}
        </h3>
        <span className="text-sm text-gray-400">
          {analyses.length} {analyses.length === 1 ? "result" : "results"}
        </span>
      </div>

      <div className="space-y-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-600 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(analysis.status)}
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {analysis.analysis_type_display}
                  </h4>
                  <p className="text-xs text-gray-400">ID: {analysis.id}</p>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${getStatusColor(
                  analysis.status
                )}`}
              >
                {analysis.status_display}
              </span>
            </div>

            {/* Summary */}
            {analysis.summary && (
              <div className="mb-3 p-3 bg-gray-900 rounded border border-gray-700">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-gray-900 rounded p-2">
                <p className="text-xs text-gray-400 mb-1">Threats</p>
                <p className="text-lg font-bold text-white">
                  {analysis.threat_count}
                </p>
              </div>

              {analysis.confidence_score !== null && (
                <div className="bg-gray-900 rounded p-2">
                  <p className="text-xs text-gray-400 mb-1">Confidence</p>
                  <p className="text-lg font-bold text-white">
                    {Math.round(analysis.confidence_score * 100)}%
                  </p>
                </div>
              )}

              {analysis.processing_time !== null && (
                <div className="bg-gray-900 rounded p-2">
                  <p className="text-xs text-gray-400 mb-1">Time</p>
                  <p className="text-lg font-bold text-white">
                    {analysis.processing_time.toFixed(1)}s
                  </p>
                </div>
              )}

              <div className="bg-gray-900 rounded p-2">
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <p className="text-xs font-medium text-white">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Threat Detections */}
            {analysis.detections && analysis.detections.length > 0 && (
              <div className="border-t border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Threat Detections ({analysis.detections.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analysis.detections.map((threat) => (
                    <div
                      key={threat.id}
                      className="bg-gray-900 rounded p-2 border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-white">
                            {threat.threat_type_display}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${getSeverityColor(
                            threat.severity
                          )}`}
                        >
                          {threat.severity_display}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">
                        {threat.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Confidence: {Math.round(threat.confidence * 100)}%
                        </span>
                        <span>
                          {new Date(threat.detected_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {analysis.error_message && (
              <div className="border-t border-gray-700 pt-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                  <p className="text-xs text-red-400">
                    <strong>Error:</strong> {analysis.error_message}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResultsView;
