import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchCurrentUser } from "../store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, accessToken, user, isLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Fetch user data if we have a token but no user data
    if (accessToken && !user && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [accessToken, user, isLoading, dispatch]);

  // Show loading spinner while fetching user data
  if (isLoading || (accessToken && !user)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
