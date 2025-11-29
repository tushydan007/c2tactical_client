import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, FileText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchSatelliteImages } from "../store/slices/satelliteSlice";
import ImageSelector from "../components/ImageSelector";
import AnalysisResultsView from "../components/AnalysisResultsView";
import UserMenu from "../components/UserMenu";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import type { AnalysisResult } from "../types";

const AnalysisPage = () => {
  const dispatch = useAppDispatch();
  const { images, isLoading: imagesLoading } = useAppSelector(
    (state) => state.satellite
  );
  const { user } = useAppSelector((state) => state.auth);

  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);

  // Fetch user's images on mount
  useEffect(() => {
    dispatch(fetchSatelliteImages());
  }, [dispatch]);

  // Fetch analyses when image is selected
  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!selectedImageId) {
        setAnalyses([]);
        return;
      }

      try {
        setAnalysesLoading(true);
        const response = await apiClient.getImageAnalyses(selectedImageId);

        // response is already an array
        const analysesArray = Array.isArray(response) ? response : [];
        setAnalyses(analysesArray);
      } catch (error) {
        console.error("Error fetching analyses:", error);
        toast.error("Failed to load analysis results");
        setAnalyses([]);
      } finally {
        setAnalysesLoading(false);
      }
    };

    fetchAnalyses();
  }, [selectedImageId]);

  const handleRefresh = () => {
    dispatch(fetchSatelliteImages());
    if (selectedImageId) {
      // Trigger re-fetch by resetting and setting the ID
      const currentId = selectedImageId;
      setSelectedImageId(null);
      setTimeout(() => setSelectedImageId(currentId), 100);
    }
  };

  const selectedImage = images.find((img) => img.id === selectedImageId);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Analysis Results
                </h1>
                <p className="text-xs text-gray-400">
                  View detailed analysis for your satellite images
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={imagesLoading}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 ${imagesLoading ? "animate-spin" : ""}`}
              />
            </button>
            <div className="border-l border-gray-800 pl-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-6">
              <ImageSelector
                images={images}
                selectedImageId={selectedImageId}
                onImageSelect={setSelectedImageId}
                isLoading={imagesLoading}
              />

              {/* User Info */}
              {user && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-xs text-gray-400 mb-2">
                    Viewing images for:
                  </p>
                  <p className="text-sm font-medium text-white">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )}

              {/* Stats */}
              {selectedImage && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Image Statistics
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Status:</span>
                      <span className="text-xs font-medium text-white capitalize">
                        {selectedImage.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Analyzed:</span>
                      <span className="text-xs font-medium text-white">
                        {selectedImage.analyzed ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">
                        Total Analyses:
                      </span>
                      <span className="text-xs font-medium text-white">
                        {selectedImage.analysis_count}
                      </span>
                    </div>
                    {selectedImage.resolution && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">
                          Resolution:
                        </span>
                        <span className="text-xs font-medium text-white">
                          {selectedImage.resolution.toFixed(2)}m
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <AnalysisResultsView
                analyses={analyses}
                isLoading={analysesLoading}
                selectedImageName={selectedImage?.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
