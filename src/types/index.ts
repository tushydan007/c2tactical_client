export interface SatelliteImage {
  id: number;
  name: string;
  upload_date: string;
  acquisition_date: string | null;
  bounds: [[number, number], [number, number]];
  image_url: string;
  thumbnail_url: string;
  opacity: number;
  visible: boolean;
  status: "uploaded" | "processing" | "optimized" | "failed";
  analyzed: boolean;
  analysis_count: number;
  resolution: number | null;
  file_size: number | null;
}

export interface ThreatDetection {
  id: number;
  analysis: number;
  satellite_image: number;
  image_name: string;
  threat_type: string;
  threat_type_display: string;
  severity: "low" | "medium" | "high" | "critical";
  severity_display: string;
  location_coords: [number, number];
  confidence: number;
  description: string;
  detected_at: string;
  verified: boolean;
  acknowledged: boolean;
  notes: string;
}

export interface AnalysisResult {
  id: number;
  satellite_image: number;
  image_name: string;
  analysis_type: string;
  analysis_type_display: string;
  status: "pending" | "processing" | "completed" | "failed";
  status_display: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  summary: string;
  raw_data: Record<string, unknown>;
  confidence_score: number | null;
  threat_count: number;
  processing_time: number | null;
  error_message: string;
  initiated_by_username: string | null;
  detections: ThreatDetection[];
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  error?: string;
  message?: string;
}

export interface ThreatSummary {
  total: number;
  by_severity: {
    critical: number;
    high: number;
    low: number;
  };
  by_type: Record<string, number>;
  verified_count: number;
  acknowledged_count: number;
}
