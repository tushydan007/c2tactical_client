// src/pages/SettingsPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Lock,
  Eye,
  Shield,
  Trash2,
  AlertCircle,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../store";
import LogoutButton from "../components/LogoutButton";

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [threatAlerts, setThreatAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved");
  };

  const handleSaveAppearance = () => {
    toast.success("Appearance settings saved");
  };

  const handleSaveSecurity = () => {
    toast.success("Security settings updated");
  };

  const handleEnableTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(
      twoFactorEnabled
        ? "Two-factor authentication disabled"
        : "Two-factor authentication enabled"
    );
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic
    toast.error("Account deletion is not available in demo mode");
    setShowDeleteDialog(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 text-sm">
                Manage your account preferences and security
              </p>
            </div>
          </div>
          <LogoutButton variant="danger" confirmLogout={true} />
        </div>

        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                <p className="text-sm text-gray-400">
                  Configure how you receive updates
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">
                    Email Notifications
                  </p>
                  <p className="text-xs text-gray-400">
                    Receive updates via email
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailNotifications ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      emailNotifications ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">
                    Push Notifications
                  </p>
                  <p className="text-xs text-gray-400">
                    Get browser notifications
                  </p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pushNotifications ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      pushNotifications ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">
                    Critical Threat Alerts
                  </p>
                  <p className="text-xs text-gray-400">
                    Instant alerts for critical threats
                  </p>
                </div>
                <button
                  onClick={() => setThreatAlerts(!threatAlerts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    threatAlerts ? "bg-red-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      threatAlerts ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">
                    Weekly Reports
                  </p>
                  <p className="text-xs text-gray-400">
                    Summary of weekly activity
                  </p>
                </div>
                <button
                  onClick={() => setWeeklyReports(!weeklyReports)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    weeklyReports ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      weeklyReports ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={handleSaveNotifications}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Notification Preferences
              </button>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Appearance</h2>
                <p className="text-sm text-gray-400">
                  Customize the look and feel
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setTheme(option.value as "light" | "dark" | "system")
                      }
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                        theme === option.value
                          ? "border-purple-600 bg-purple-500/10"
                          : "border-gray-700 bg-gray-800 hover:border-gray-600"
                      }`}
                    >
                      <option.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-white">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST (Eastern)</option>
                  <option value="PST">PST (Pacific)</option>
                  <option value="GMT">GMT (London)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={handleSaveAppearance}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Appearance Settings
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Security & Privacy
                </h2>
                <p className="text-sm text-gray-400">
                  Manage your account security
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">
                    Two-Factor Authentication
                  </p>
                  <button
                    onClick={handleEnableTwoFactor}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      twoFactorEnabled ? "bg-green-600" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>

              <Link
                to="/change-password"
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Change Password
                    </p>
                    <p className="text-xs text-gray-400">
                      Update your account password
                    </p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </Link>

              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-white mb-2">
                  Active Sessions
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  You are currently signed in on 1 device
                </p>
                <button className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors">
                  Sign out all other sessions
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <button
                onClick={handleSaveSecurity}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Security Settings
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Danger Zone</h2>
                <p className="text-sm text-gray-400">
                  Irreversible account actions
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    Delete Account
                  </p>
                  <p className="text-xs text-gray-400">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap ml-4"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-400">
                  This action is permanent and cannot be undone. All your data,
                  including satellite images, analyses, and threat detections
                  will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-400">
                <strong>Warning:</strong> This will delete all your data
                permanently.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-600/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
