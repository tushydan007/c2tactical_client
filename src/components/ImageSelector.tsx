import { Image as ImageIcon, ChevronDown } from "lucide-react";
import type { SatelliteImage } from "../types";

interface ImageSelectorProps {
  images: SatelliteImage[];
  selectedImageId: number | null;
  onImageSelect: (imageId: number | null) => void;
  isLoading?: boolean;
}

const ImageSelector = ({
  images,
  selectedImageId,
  onImageSelect,
  isLoading = false,
}: ImageSelectorProps) => {
  const selectedImage = images.find((img) => img.id === selectedImageId);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Satellite Image
      </label>

      <div className="relative">
        <select
          value={selectedImageId || ""}
          onChange={(e) => {
            const value = e.target.value;
            onImageSelect(value ? parseInt(value) : null);
          }}
          disabled={isLoading || images.length === 0}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {images.length === 0 ? "No images available" : "Select an image..."}
          </option>
          {images.map((image) => (
            <option key={image.id} value={image.id}>
              {image.name} - {new Date(image.upload_date).toLocaleDateString()}
              {image.analyzed ? " ✓" : ""}
            </option>
          ))}
        </select>

        {/* Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ImageIcon className="w-5 h-5 text-gray-500" />
        </div>

        {/* Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Selected Image Info */}
      {selectedImage && (
        <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-start gap-3">
            {selectedImage.thumbnail_url && (
              <img
                src={selectedImage.thumbnail_url}
                alt={selectedImage.name}
                className="w-16 h-16 rounded object-cover border border-gray-600"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {selectedImage.name}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedImage.status === "optimized"
                      ? "bg-green-500/10 text-green-500"
                      : selectedImage.status === "processing"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {selectedImage.status}
                </span>
                {selectedImage.analyzed && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                    {selectedImage.analysis_count}{" "}
                    {selectedImage.analysis_count === 1
                      ? "analysis"
                      : "analyses"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
