// src/store/slices/threatSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface Threat {
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

interface ThreatState {
  threats: Threat[];
  currentThreat: Threat | null;
  isLoading: boolean;
  error: string | null;
  summary: {
    total: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
    verified_count: number;
    acknowledged_count: number;
  } | null;
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

const threatInitialState: ThreatState = {
  threats: [],
  currentThreat: null,
  isLoading: false,
  error: null,
  summary: null,
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

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

export const fetchThreats = createAsyncThunk(
  "threat/fetchThreats",
  async (
    params: {
      severity?: string;
      threat_type?: string;
      verified?: boolean;
      min_severity?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.severity) queryParams.append("severity", params.severity);
      if (params.threat_type)
        queryParams.append("threat_type", params.threat_type);
      if (params.verified !== undefined)
        queryParams.append("verified", params.verified.toString());
      if (params.min_severity)
        queryParams.append("min_severity", params.min_severity);

      const response = await axios.get<PaginatedResponse<Threat> | Threat[]>(
        `${API_URL}/satellite/threats/?${queryParams.toString()}`,
        { headers: getAuthHeaders() }
      );

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

export const fetchThreatSummary = createAsyncThunk(
  "threat/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ThreatState["summary"]>(
        `${API_URL}/satellite/threats/summary/`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const verifyThreat = createAsyncThunk(
  "threat/verify",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.post<Threat>(
        `${API_URL}/satellite/threats/${id}/verify/`,
        {},
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const acknowledgeThreat = createAsyncThunk(
  "threat/acknowledge",
  async (
    { id, notes }: { id: number; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<Threat>(
        `${API_URL}/satellite/threats/${id}/acknowledge/`,
        { notes },
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const threatSlice = createSlice({
  name: "threat",
  initialState: threatInitialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchThreats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.threats = action.payload;
      })
      .addCase(fetchThreats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchThreatSummary.fulfilled, (state, action) => {
      state.summary = action.payload;
    });

    builder.addCase(verifyThreat.fulfilled, (state, action) => {
      const index = state.threats.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.threats[index] = action.payload;
      }
    });

    builder.addCase(acknowledgeThreat.fulfilled, (state, action) => {
      const index = state.threats.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.threats[index] = action.payload;
      }
    });
  },
});

export const { clearError: clearThreatError } = threatSlice.actions;
export default threatSlice.reducer;
