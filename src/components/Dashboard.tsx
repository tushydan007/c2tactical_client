import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  useMap,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import {
  Menu,
  X,
  Layers,
  Activity,
  AlertTriangle,
  MapPin,
  Upload,
  BarChart3,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Types
interface SatelliteImage {
  id: number;
  name: string;
  upload_date: string;
  bounds: [[number, number], [number, number]];
  image_url: string;
  thumbnail_url: string;
  opacity: number;
  visible: boolean;
}

interface ThreatDetection {
  id: number;
  image_id: number;
  threat_type: string;
  confidence: number;
  location: [number, number];
  detected_at: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface AnalysisResult {
  id: number;
  image_id: number;
  analysis_type: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at: string | null;
  summary: string;
  threat_count: number;
  detections: ThreatDetection[];
}

interface MapBounds {
  center: [number, number];
  zoom: number;
}

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Custom Hooks
const useApi = () => {
  const fetchWithCache = useCallback(
    async <T,>(url: string, cacheTime = 300000): Promise<T> => {
      const cacheKey = `cache_${url}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < cacheTime) {
          return data as T;
        }
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: Date.now() })
      );
      return data as T;
    },
    []
  );

  return { fetchWithCache };
};

// Map Control Component - FIXED: Added map resize handler
const MapController: React.FC<{ bounds: MapBounds; triggerResize: number }> = ({
  bounds,
  triggerResize,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(bounds.center, bounds.zoom);
  }, [map, bounds]);

  // Invalidate map size when sidebar toggles
  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [map, triggerResize]);

  return null;
};

// Sidebar Components
const SidebarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
      active
        ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

const LayerControl: React.FC<{
  images: SatelliteImage[];
  onToggleVisibility: (id: number) => void;
  onOpacityChange: (id: number, opacity: number) => void;
}> = ({ images, onToggleVisibility, onOpacityChange }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
      Satellite Layers
    </h3>
    {images.length === 0 ? (
      <p className="text-gray-500 text-sm">No satellite imagery available</p>
    ) : (
      images.map((img) => (
        <div
          key={img.id}
          className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white truncate flex-1">
              {img.name}
            </span>
            <button
              onClick={() => onToggleVisibility(img.id)}
              className={`p-1.5 rounded transition-colors ${
                img.visible
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {img.visible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Opacity:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={img.opacity * 100}
              onChange={(e) =>
                onOpacityChange(img.id, parseInt(e.target.value) / 100)
              }
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <span className="text-xs text-gray-400 w-10 text-right">
              {Math.round(img.opacity * 100)}%
            </span>
          </div>
        </div>
      ))
    )}
  </div>
);

const ThreatList: React.FC<{
  threats: ThreatDetection[];
  onThreatClick: (threat: ThreatDetection) => void;
}> = ({ threats, onThreatClick }) => {
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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Detected Threats
      </h3>
      {threats.length === 0 ? (
        <p className="text-gray-500 text-sm">No threats detected</p>
      ) : (
        threats.map((threat) => (
          <div
            key={threat.id}
            onClick={() => onThreatClick(threat)}
            className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-red-600 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-red-600/20"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-white">
                  {threat.threat_type}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${getSeverityColor(
                  threat.severity
                )}`}
              >
                {threat.severity}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{threat.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Confidence: {Math.round(threat.confidence * 100)}%</span>
              <span>{new Date(threat.detected_at).toLocaleString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const AnalysesList: React.FC<{
  analyses: AnalysisResult[];
}> = ({ analyses }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Analysis Results
      </h3>
      {analyses.length === 0 ? (
        <p className="text-gray-500 text-sm">No analyses available</p>
      ) : (
        analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-blue-600 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(analysis.status)}
                <span className="text-sm font-medium text-white">
                  {analysis.analysis_type.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${getStatusColor(
                  analysis.status
                )}`}
              >
                {analysis.status}
              </span>
            </div>
            {analysis.summary && (
              <p className="text-xs text-gray-400 mb-2">{analysis.summary}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Threats: {analysis.threat_count}</span>
              <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Main Dashboard Component
const MilitaryDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<
    "layers" | "threats" | "analytics" | "analyses"
  >("layers");
  const [fullscreen, setFullscreen] = useState(false);
  const [satelliteImages, setSatelliteImages] = useState<SatelliteImage[]>([]);
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapBounds, setMapBounds] = useState<MapBounds>({
    center: [9.082, 8.6753], // Nigeria center
    zoom: 6,
  });
  const [selectedThreat, setSelectedThreat] = useState<ThreatDetection | null>(
    null
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  // FIXED: Add counter to trigger map resize
  const [resizeTrigger, setResizeTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fetchWithCache } = useApi();

  // Fetch satellite images
  const fetchSatelliteImages = useCallback(async () => {
    try {
      const data = await fetchWithCache<SatelliteImage[]>(
        "/satellite-images/",
        60000
      );
      setSatelliteImages(
        data.map((img) => ({ ...img, visible: true, opacity: 0.8 }))
      );
    } catch (error) {
      console.error("Error fetching satellite images:", error);
    }
  }, [fetchWithCache]);

  // Fetch threat detections
  const fetchThreats = useCallback(async () => {
    try {
      const data = await fetchWithCache<ThreatDetection[]>(
        "/threat-detections/",
        30000
      );
      setThreats(data);
    } catch (error) {
      console.error("Error fetching threats:", error);
    }
  }, [fetchWithCache]);

  // Fetch analysis results
  const fetchAnalyses = useCallback(async () => {
    try {
      const data = await fetchWithCache<AnalysisResult[]>("/analyses/", 60000);
      setAnalyses(data);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    }
  }, [fetchWithCache]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSatelliteImages(),
        fetchThreats(),
        fetchAnalyses(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchSatelliteImages, fetchThreats, fetchAnalyses]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchThreats();
    }, 300000);
    return () => clearInterval(interval);
  }, [fetchThreats]);

  // FIXED: Trigger map resize when sidebar toggles
  useEffect(() => {
    setResizeTrigger((prev) => prev + 1);
  }, [sidebarOpen, fullscreen]);

  const handleToggleVisibility = useCallback((id: number) => {
    setSatelliteImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, visible: !img.visible } : img
      )
    );
  }, []);

  const handleOpacityChange = useCallback((id: number, opacity: number) => {
    setSatelliteImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, opacity } : img))
    );
  }, []);

  const handleThreatClick = useCallback((threat: ThreatDetection) => {
    setSelectedThreat(threat);
    setMapBounds({ center: threat.location, zoom: 14 });
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("original_image", file);
      formData.append("name", file.name);

      try {
        const response = await fetch(`${API_BASE_URL}/satellite-images/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
          body: formData,
        });

        if (response.ok) {
          await fetchSatelliteImages();
          setShowUploadModal(false);
          alert("Satellite image uploaded successfully!");
        } else {
          alert("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file");
      }
    },
    [fetchSatelliteImages]
  );

  const handleDownloadReport = useCallback(() => {
    const reportData = {
      generated_at: new Date().toISOString(),
      total_images: satelliteImages.length,
      total_threats: threats.length,
      critical_threats: threats.filter((t) => t.severity === "critical").length,
      high_threats: threats.filter((t) => t.severity === "high").length,
      analyses: analyses.length,
      threats_by_type: threats.reduce((acc, t) => {
        acc[t.threat_type] = (acc[t.threat_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intelligence-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [satelliteImages, threats, analyses]);

  const criticalThreatsCount = useMemo(
    () => threats.filter((t) => t.severity === "critical").length,
    [threats]
  );

  const visibleImages = useMemo(
    () => satelliteImages.filter((img) => img.visible),
    [satelliteImages]
  );

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                TACTICAL INTELLIGENCE SYSTEM
              </h1>
              <p className="text-xs text-gray-400">
                Satellite Monitoring & Threat Analysis
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-xs text-gray-400">Active Threats</span>
            <span className="ml-3 text-lg font-bold text-red-500">
              {criticalThreatsCount}
            </span>
          </div>
          <button
            onClick={handleDownloadReport}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Download Report"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Upload Satellite Image"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            {fullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => {
              fetchSatelliteImages();
              fetchThreats();
              fetchAnalyses();
            }}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - FIXED: Added transition for smooth animation */}
        {sidebarOpen && !fullscreen && (
          <aside className="w-80 bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden transition-all duration-300">
            <div className="p-4 space-y-2 border-b border-gray-800">
              <SidebarButton
                icon={<Layers />}
                label="Imagery Layers"
                active={activePanel === "layers"}
                onClick={() => setActivePanel("layers")}
              />
              <SidebarButton
                icon={<AlertTriangle />}
                label="Threat Alerts"
                active={activePanel === "threats"}
                onClick={() => setActivePanel("threats")}
                badge={criticalThreatsCount}
              />
              <SidebarButton
                icon={<FileText />}
                label="Analyses"
                active={activePanel === "analyses"}
                onClick={() => setActivePanel("analyses")}
              />
              <SidebarButton
                icon={<BarChart3 />}
                label="Analytics"
                active={activePanel === "analytics"}
                onClick={() => setActivePanel("analytics")}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activePanel === "layers" && (
                <LayerControl
                  images={satelliteImages}
                  onToggleVisibility={handleToggleVisibility}
                  onOpacityChange={handleOpacityChange}
                />
              )}
              {activePanel === "threats" && (
                <ThreatList
                  threats={threats}
                  onThreatClick={handleThreatClick}
                />
              )}
              {activePanel === "analyses" && (
                <AnalysesList analyses={analyses} />
              )}
              {activePanel === "analytics" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Analysis Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="text-2xl font-bold text-white">
                        {threats.length}
                      </div>
                      <div className="text-xs text-gray-400">
                        Total Detections
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="text-2xl font-bold text-red-500">
                        {criticalThreatsCount}
                      </div>
                      <div className="text-xs text-gray-400">Critical</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="text-2xl font-bold text-blue-500">
                        {satelliteImages.length}
                      </div>
                      <div className="text-xs text-gray-400">Images</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="text-2xl font-bold text-green-500">
                        {
                          analyses.filter((a) => a.status === "completed")
                            .length
                        }
                      </div>
                      <div className="text-xs text-gray-400">Completed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Map Container - FIXED: Now resizes properly */}
        <main className="flex-1 relative transition-all duration-300">
          {/* Selected Threat Info Panel */}
          {selectedThreat && !fullscreen && (
            <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 z-10 max-w-sm shadow-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <h3 className="text-white font-bold">Selected Threat</h3>
                </div>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Type: </span>
                  <span className="text-white font-medium">
                    {selectedThreat.threat_type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Severity: </span>
                  <span
                    className={`font-bold ${
                      selectedThreat.severity === "critical"
                        ? "text-red-500"
                        : selectedThreat.severity === "high"
                        ? "text-orange-500"
                        : selectedThreat.severity === "medium"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  >
                    {selectedThreat.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Confidence: </span>
                  <span className="text-white">
                    {Math.round(selectedThreat.confidence * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Location: </span>
                  <span className="text-white text-xs">
                    {selectedThreat.location[0].toFixed(4)},{" "}
                    {selectedThreat.location[1].toFixed(4)}
                  </span>
                </div>
                <p className="text-gray-300 text-xs mt-2 pt-2 border-t border-gray-700">
                  {selectedThreat.description}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading intelligence data...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={mapBounds.center}
              zoom={mapBounds.zoom}
              className="w-full h-full"
              zoomControl={true}
            >
              <MapController bounds={mapBounds} triggerResize={resizeTrigger} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {visibleImages.map((img) => (
                <ImageOverlay
                  key={img.id}
                  url={img.image_url}
                  bounds={img.bounds}
                  opacity={img.opacity}
                />
              ))}
              {threats.map((threat) => (
                <Marker
                  key={threat.id}
                  position={threat.location}
                  eventHandlers={{
                    click: () => handleThreatClick(threat),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-bold text-sm mb-1">
                        {threat.threat_type}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {threat.description}
                      </p>
                      <div className="text-xs">
                        <div>
                          Severity:{" "}
                          <span className="font-semibold">
                            {threat.severity}
                          </span>
                        </div>
                        <div>
                          Confidence: {Math.round(threat.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {selectedThreat && (
                <Circle
                  center={selectedThreat.location}
                  radius={500}
                  pathOptions={{
                    color:
                      selectedThreat.severity === "critical"
                        ? "red"
                        : selectedThreat.severity === "high"
                        ? "orange"
                        : selectedThreat.severity === "medium"
                        ? "yellow"
                        : "blue",
                    fillColor:
                      selectedThreat.severity === "critical"
                        ? "red"
                        : selectedThreat.severity === "high"
                        ? "orange"
                        : selectedThreat.severity === "medium"
                        ? "yellow"
                        : "blue",
                    fillOpacity: 0.2,
                  }}
                />
              )}
            </MapContainer>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload Satellite Image
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Upload GeoTIFF satellite imagery for analysis. Supported formats:
              .tif, .tiff, .geotiff
            </p>
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".tif,.tiff,.geotiff"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Select File
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilitaryDashboard;
