// src/store/slices/satelliteSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface SatelliteImage {
  id: number;
  name: string;
  upload_date: string;
  acquisition_date?: string;
  status: "uploaded" | "processing" | "optimized" | "failed";
  analyzed: boolean;
  analysis_count: number;
  image_url?: string;
  thumbnail_url?: string;
  bounds?: [[number, number], [number, number]];
  resolution?: number;
  file_size?: number;
}

interface SatelliteState {
  images: SatelliteImage[];
  currentImage: SatelliteImage | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

interface ApiErrorResponse {
  detail?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const initialState: SatelliteState = {
  images: [],
  currentImage: null,
  isLoading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
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

// Async thunks
export const fetchSatelliteImages = createAsyncThunk(
  "satellite/fetchImages",
  async (
    params: { status?: string; search?: string; page?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      if (params?.page) queryParams.append("page", params.page.toString());

      const response = await axios.get<
        PaginatedResponse<SatelliteImage> | SatelliteImage[]
      >(`${API_URL}/satellite/images/?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchSatelliteImage = createAsyncThunk(
  "satellite/fetchImage",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get<SatelliteImage>(
        `${API_URL}/satellite/images/${id}/`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const uploadSatelliteImage = createAsyncThunk(
  "satellite/uploadImage",
  async (
    data: {
      file: File;
      name: string;
      description?: string;
      acquisition_date?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("original_image", data.file);
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.acquisition_date)
        formData.append("acquisition_date", data.acquisition_date);

      const response = await axios.post<SatelliteImage>(
        `${API_URL}/satellite/images/`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const analyzeImage = createAsyncThunk(
  "satellite/analyzeImage",
  async (
    { id, analysis_type }: { id: number; analysis_type?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post<{
        message: string;
        analysis_id: number;
        task_id: string;
        status: string;
      }>(
        `${API_URL}/satellite/images/${id}/analyze/`,
        { analysis_type: analysis_type || "threat_detection" },
        { headers: getAuthHeaders() }
      );

      return { ...response.data, imageId: id };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchImageAnalyses = createAsyncThunk(
  "satellite/fetchImageAnalyses",
  async (imageId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/satellite/images/${imageId}/analyses/`,
        { headers: getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Slice
const satelliteSlice = createSlice({
  name: "satellite",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentImage: (state) => {
      state.currentImage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch images
    builder
      .addCase(fetchSatelliteImages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSatelliteImages.fulfilled, (state, action) => {
        state.isLoading = false;

        // Handle both paginated and non-paginated responses
        if (Array.isArray(action.payload)) {
          state.images = action.payload;
          state.pagination = {
            count: action.payload.length,
            next: null,
            previous: null,
          };
        } else {
          state.images = action.payload.results;
          state.pagination = {
            count: action.payload.count,
            next: action.payload.next,
            previous: action.payload.previous,
          };
        }
      })
      .addCase(fetchSatelliteImages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single image
    builder
      .addCase(fetchSatelliteImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSatelliteImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentImage = action.payload;
      })
      .addCase(fetchSatelliteImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload image
    builder
      .addCase(uploadSatelliteImage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadSatelliteImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.images.unshift(action.payload);
      })
      .addCase(uploadSatelliteImage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Analyze image
    builder.addCase(analyzeImage.fulfilled, (state, action) => {
      const imageId = action.payload.imageId;

      // Update the image in the images array
      const imageIndex = state.images.findIndex((img) => img.id === imageId);
      if (imageIndex !== -1) {
        state.images[imageIndex].analyzed = true;
        state.images[imageIndex].analysis_count += 1;
      }

      // Update current image if it matches
      if (state.currentImage?.id === imageId) {
        state.currentImage.analyzed = true;
        state.currentImage.analysis_count += 1;
      }
    });
  },
});

export const { clearError, clearCurrentImage } = satelliteSlice.actions;
export default satelliteSlice.reducer;
