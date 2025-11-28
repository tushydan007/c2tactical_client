// src/hooks/useLogout.ts
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "../store";
import { logout } from "../store/slices/authSlice";
import {
  clearError as clearSatelliteError,
  clearCurrentImage,
} from "../store/slices/satelliteSlice";
import {
  clearError as clearAnalysisError,
  clearCurrentAnalysis,
} from "../store/slices/analysisSlice";
import { clearThreatError } from "../store/slices/threatSlice";
import { cacheManager } from "../lib/cache";

interface UseLogoutOptions {
  redirectTo?: string;
  showToast?: boolean;
  clearCache?: boolean;
}

interface UseLogoutReturn {
  handleLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

export const useLogout = (options: UseLogoutOptions = {}): UseLogoutReturn => {
  const {
    redirectTo = "/login",
    showToast = true,
    clearCache = true,
  } = options;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      // Clear all Redux state
      dispatch(logout());
      dispatch(clearSatelliteError());
      dispatch(clearAnalysisError());
      dispatch(clearThreatError());
      dispatch(clearCurrentImage());
      dispatch(clearCurrentAnalysis());

      // Clear all cached data
      if (clearCache) {
        cacheManager.invalidate();
        sessionStorage.clear();
      }

      // Clear any other browser storage if needed
      // Note: localStorage is already cleared by the logout action

      // Show success message
      if (showToast) {
        toast.success("Logged out successfully", {
          duration: 3000,
          icon: "👋",
        });
      }

      // Redirect to login page
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      if (showToast) {
        toast.error("An error occurred during logout", {
          duration: 4000,
        });
      }

      // Even if there's an error, still try to clear local state and redirect
      dispatch(logout());
      navigate(redirectTo, { replace: true });
    }
  }, [dispatch, navigate, redirectTo, showToast, clearCache]);

  return {
    handleLogout,
    isLoggingOut: false, // Could be extended with loading state if needed
  };
};
