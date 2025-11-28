import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Phone,
} from "lucide-react";
import { useAppSelector } from "../store";
import { useLogout } from "../hooks/useLogout";

interface UserMenuProps {
  className?: string;
}

const UserMenu = ({ className = "" }: UserMenuProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogoutClick = (): void => {
    setShowConfirmDialog(true);
  };

  const confirmAndLogout = (): void => {
    setShowConfirmDialog(false);
    setIsOpen(false);
    handleLogout();
  };

  if (!user) {
    return null;
  }

  const getUserInitials = (): string => {
    const firstInitial = user.first_name?.charAt(0).toUpperCase() || "";
    const lastInitial = user.last_name?.charAt(0).toUpperCase() || "";
    return (
      `${firstInitial}${lastInitial}` || user.email.charAt(0).toUpperCase()
    );
  };

  return (
    <div className={`relative ${className} z-1001`} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-red-600 transition-colors"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-700 group-hover:border-red-600 transition-colors">
              {getUserInitials()}
            </div>
          )}
          {user.is_verified && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">{user.full_name}</p>
          {user.rank && <p className="text-xs text-gray-400">{user.rank}</p>}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden md:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-9999 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-800 bg-linear-to-br from-gray-900 to-gray-950">
            <div className="flex items-center gap-3 mb-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold border-2 border-red-600">
                  {getUserInitials()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-1">
              {user.rank && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3 h-3" />
                  <span>{user.rank}</span>
                </div>
              )}
              {user.unit && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <User className="w-3 h-3" />
                  <span>{user.unit}</span>
                </div>
              )}
              {user.phone_number && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-3 h-3" />
                  <span>{user.phone_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              <span>View Profile</span>
            </Link>

            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            <div className="border-t border-gray-800 my-2" />

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-yellow-500" />
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
    </div>
  );
};

export default UserMenu;
