// src/pages/ProfilePage.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  Shield,
  Calendar,
  ArrowLeft,
  Settings,
  CheckCircle,
  Activity,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useAppSelector } from "../store";

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

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

  // Mock activity data - replace with real data from your API
  const recentActivity = [
    {
      id: 1,
      type: "upload",
      description: "Uploaded satellite image - Region A",
      timestamp: "2 hours ago",
      icon: Activity,
    },
    {
      id: 2,
      type: "threat",
      description: "Acknowledged critical threat detection",
      timestamp: "5 hours ago",
      icon: AlertTriangle,
    },
    {
      id: 3,
      type: "analysis",
      description: "Completed threat analysis report",
      timestamp: "1 day ago",
      icon: FileText,
    },
  ];

  const stats = [
    { label: "Images Uploaded", value: "24", icon: Activity, color: "blue" },
    {
      label: "Threats Detected",
      value: "47",
      icon: AlertTriangle,
      color: "red",
    },
    {
      label: "Analyses Completed",
      value: "18",
      icon: FileText,
      color: "green",
    },
    { label: "Days Active", value: "45", icon: Calendar, color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="text-gray-400 text-sm">
                View your account information and activity
              </p>
            </div>
          </div>
          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar & Basic Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow-lg shadow-red-600/20"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-3xl border-4 border-red-600 shadow-lg shadow-red-600/20">
                      {getUserInitials()}
                    </div>
                  )}
                  {user.is_verified && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                  {user.full_name}
                </h2>
                {user.rank && (
                  <p className="text-red-500 font-semibold mb-2">{user.rank}</p>
                )}
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                {user.unit && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Unit</p>
                      <p className="text-white">{user.unit}</p>
                    </div>
                  </div>
                )}

                {user.phone_number && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="text-white">{user.phone_number}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="text-white truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Member Since</p>
                    <p className="text-white">
                      {new Date(user.date_joined).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Verification</span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      user.is_verified
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {user.is_verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Account Type</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                    {user.is_staff ? "Admin" : "Operator"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      stat.color === "blue"
                        ? "bg-blue-500/10"
                        : stat.color === "red"
                        ? "bg-red-500/10"
                        : stat.color === "green"
                        ? "bg-green-500/10"
                        : "bg-purple-500/10"
                    }`}
                  >
                    <stat.icon
                      className={`w-5 h-5 ${
                        stat.color === "blue"
                          ? "text-blue-500"
                          : stat.color === "red"
                          ? "text-red-500"
                          : stat.color === "green"
                          ? "text-green-500"
                          : "text-purple-500"
                      }`}
                    />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  Recent Activity
                </h3>
                <button className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                      <activity.icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white mb-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio/About Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">About</h3>
              <div className="space-y-4">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Tactical Intelligence Operator specializing in satellite
                  imagery analysis and threat detection. Experienced in
                  real-time monitoring and strategic assessment.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                    Satellite Analysis
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                    Threat Detection
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                    Intelligence
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                    Security
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
