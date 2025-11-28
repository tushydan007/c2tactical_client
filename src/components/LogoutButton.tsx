// src/components/LogoutButton.tsx
import { useState } from "react";
import { LogOut, AlertCircle } from "lucide-react";
import { useLogout } from "../hooks/useLogout";

interface LogoutButtonProps {
  variant?: "default" | "minimal" | "danger";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  confirmLogout?: boolean;
}

const LogoutButton = ({
  variant = "default",
  size = "md",
  showIcon = true,
  showText = true,
  className = "",
  confirmLogout = false,
}: LogoutButtonProps) => {
  const { handleLogout } = useLogout();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClick = (): void => {
    if (confirmLogout) {
      setShowConfirmDialog(true);
    } else {
      handleLogout();
    }
  };

  const confirmAndLogout = (): void => {
    setShowConfirmDialog(false);
    handleLogout();
  };

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-2",
    lg: "px-4 py-3 text-base gap-2",
  };

  // Variant classes
  const variantClasses = {
    default:
      "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700",
    minimal: "text-gray-400 hover:text-white hover:bg-gray-800",
    danger:
      "bg-red-600 hover:bg-red-700 text-white border border-red-500 shadow-lg shadow-red-600/20",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          flex items-center justify-center rounded-lg transition-all duration-200
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        aria-label="Logout"
      >
        {showIcon && <LogOut className={iconSizes[size]} />}
        {showText && <span className="font-medium">Logout</span>}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Confirm Logout
                </h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to logout? You will need to login again
                  to access the system.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndLogout}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-600/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
