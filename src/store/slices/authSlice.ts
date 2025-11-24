// src/store/slices/authSlice.ts
import {
  createSlice,
  createAsyncThunk,
  //   PayloadAction,
  type SerializedError,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  rank?: string;
  unit?: string;
  phone_number?: string;
  avatar?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  re_password: string;
  first_name: string;
  last_name: string;
  rank?: string;
  unit?: string;
  phone_number?: string;
}

interface ApiErrorResponse {
  detail?: string;
  email?: string[];
  password?: string[];
  error?: string;
}

// Load tokens from localStorage
const loadTokens = () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  return { accessToken, refreshToken };
};

const initialState: AuthState = {
  user: null,
  ...loadTokens(),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isLoading: false,
  error: null,
};

// Helper function to extract error message
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;

    if (data?.detail) return data.detail;
    if (data?.email?.[0]) return data.email[0];
    if (data?.password?.[0]) return data.password[0];
    if (data?.error) return data.error;

    return axiosError.message || "An error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/user/auth/jwt/create/`,
        credentials
      );
      const { access, refresh } = response.data;

      // Store tokens
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Get user data
      const userResponse = await axios.get(`${API_URL}/user/profile/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      return {
        accessToken: access,
        refreshToken: refresh,
        user: userResponse.data as User,
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      // Register user
      await axios.post(`${API_URL}/user/auth/users/`, data);

      // Auto-login after registration
      const loginResponse = await axios.post(
        `${API_URL}/user/auth/jwt/create/`,
        {
          email: data.email,
          password: data.password,
        }
      );

      const { access, refresh } = loginResponse.data;

      // Store tokens
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Get user data
      const userResponse = await axios.get(`${API_URL}/user/profile/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      return {
        accessToken: access,
        refreshToken: refresh,
        user: userResponse.data as User,
      };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        return rejectWithValue("No access token found");
      }

      const response = await axios.get(`${API_URL}/user/profile/me/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data as User;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.patch(
        `${API_URL}/user/profile/update_profile/`,
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return response.data as User;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (file: File, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.post(
        `${API_URL}/user/profile/upload_avatar/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data as User;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return rejectWithValue("No refresh token found");
      }

      const response = await axios.post(`${API_URL}/user/auth/jwt/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem("accessToken", access);

      return access;
    } catch (error) {
      const err = error as SerializedError;
      console.log(err);
      // Clear tokens on refresh failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return rejectWithValue("Session expired. Please login again.");
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
      });

    // Update profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // Upload avatar
    builder.addCase(uploadAvatar.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // Refresh token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
