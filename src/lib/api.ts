import type {
  SatelliteImage,
  ThreatDetection,
  AnalysisResult,
  ApiResponse,
  ApiError,
  ThreatSummary,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class ApiClient {
  private baseUrl: string;
  private authToken: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem("auth_token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: "An error occurred",
        }));
        throw new Error(
          error.detail || error.error || error.message || "Request failed"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Satellite Images
  async getSatelliteImages(params?: {
    status?: string;
    analyzed?: boolean;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<SatelliteImage>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/satellite-images/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return this.request<ApiResponse<SatelliteImage>>(endpoint);
  }

  async getSatelliteImage(id: number): Promise<SatelliteImage> {
    return this.request<SatelliteImage>(`/satellite-images/${id}/`);
  }

  async triggerAnalysis(
    imageId: number,
    analysisType: string = "threat_detection"
  ): Promise<{
    message: string;
    analysis_id: number;
    task_id: string;
    status: string;
  }> {
    return this.request(`/satellite-images/${imageId}/analyze/`, {
      method: "POST",
      body: JSON.stringify({ analysis_type: analysisType }),
    });
  }

  async getImageAnalyses(imageId: number): Promise<AnalysisResult[]> {
    return this.request<AnalysisResult[]>(
      `/satellite-images/${imageId}/analyses/`
    );
  }

  // Analysis Results
  async getAnalyses(params?: {
    status?: string;
    analysis_type?: string;
    satellite_image?: number;
  }): Promise<ApiResponse<AnalysisResult>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/analyses/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return this.request<ApiResponse<AnalysisResult>>(endpoint);
  }

  async getAnalysis(id: number): Promise<AnalysisResult> {
    return this.request<AnalysisResult>(`/analyses/${id}/`);
  }

  async checkAnalysisStatus(id: number): Promise<{
    id: number;
    status: string;
    threat_count: number;
    processing_time: number | null;
    completed_at: string | null;
  }> {
    return this.request(`/analyses/${id}/status_check/`);
  }

  // Threat Detections
  async getThreatDetections(params?: {
    severity?: string;
    threat_type?: string;
    verified?: boolean;
    acknowledged?: boolean;
    min_severity?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<ThreatDetection>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/threat-detections/${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return this.request<ApiResponse<ThreatDetection>>(endpoint);
  }

  async getThreatDetection(id: number): Promise<ThreatDetection> {
    return this.request<ThreatDetection>(`/threat-detections/${id}/`);
  }

  async verifyThreat(id: number): Promise<ThreatDetection> {
    return this.request<ThreatDetection>(`/threat-detections/${id}/verify/`, {
      method: "POST",
    });
  }

  async acknowledgeThreat(
    id: number,
    notes?: string
  ): Promise<ThreatDetection> {
    return this.request<ThreatDetection>(
      `/threat-detections/${id}/acknowledge/`,
      {
        method: "POST",
        body: JSON.stringify({ notes: notes || "" }),
      }
    );
  }

  async getThreatSummary(): Promise<ThreatSummary> {
    return this.request<ThreatSummary>("/threat-detections/summary/");
  }

  // Authentication
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem("auth_token", token);
  }

  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem("auth_token");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
