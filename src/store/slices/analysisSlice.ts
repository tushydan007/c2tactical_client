// src/store/slices/analysisSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface Analysis {
  id: number;
  satellite_image: number;
  image_name: string;
  analysis_type: string;
  analysis_type_display: string;
  status: "pending" | "processing" | "completed" | "failed";
  status_display: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  summary: string;
  raw_data: Record<string, unknown>;
  confidence_score?: number;
  threat_count: number;
  processing_time?: number | null;
  error_message?: string;
  initiated_by_username: string;
  detections: unknown[];
  logs: unknown[];
}

interface AnalysisState {
  analyses: Analysis[];
  currentAnalysis: Analysis | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiErrorResponse {
  detail?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  results?: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface StatusCheckResponse {
  id: number;
  status: Analysis["status"];
  threat_count: number;
  processing_time: number | null;
  completed_at: string | null;
}

const initialState: AnalysisState = {
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
  error: null,
};

// Helper function to get auth headers
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

// Helper function to extract error message
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return (
      axiosError.response?.data?.detail ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "An error occurred"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const fetchAnalyses = createAsyncThunk(
  "analysis/fetchAnalyses",
  async (
    params: { status?: string; analysis_type?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.analysis_type)
        queryParams.append("analysis_type", params.analysis_type);

      const response = await axios.get<
        PaginatedResponse<Analysis> | Analysis[]
      >(`${API_URL}/satellite/analyses/?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      // Handle both paginated and array responses
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.results || [];
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchAnalysis = createAsyncThunk(
  "analysis/fetchAnalysis",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get<Analysis>(
        `${API_URL}/satellite/analyses/${id}/`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const checkAnalysisStatus = createAsyncThunk(
  "analysis/checkStatus",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get<StatusCheckResponse>(
        `${API_URL}/satellite/analyses/${id}/status_check/`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalyses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analyses = action.payload;
      })
      .addCase(fetchAnalyses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(fetchAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(checkAnalysisStatus.fulfilled, (state, action) => {
      if (
        state.currentAnalysis &&
        state.currentAnalysis.id === action.payload.id
      ) {
        state.currentAnalysis.status = action.payload.status;
        state.currentAnalysis.threat_count = action.payload.threat_count;
        state.currentAnalysis.processing_time = action.payload.processing_time;
        state.currentAnalysis.completed_at =
          action.payload.completed_at ?? undefined;
      }
    });
  },
});

export const { clearError, clearCurrentAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
