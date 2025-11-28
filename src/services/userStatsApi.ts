// src/services/userStatsApi.ts
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export interface UserStats {
  images_uploaded: number;
  threats_detected: number;
  analyses_completed: number;
  days_active: number;
  account_age_days: number;
  profile_completion: number;
  recent_activity: RecentActivity[];
}

export interface RecentActivity {
  id: number;
  type: "upload" | "analysis" | "threat" | "verification";
  description: string;
  timestamp: string;
  created_at: string;
}

export interface UserNotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  threat_alerts: boolean;
  weekly_reports: boolean;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: UserNotificationSettings;
}

class UserStatsApi {
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await axios.get<UserStats>(
        `${API_BASE_URL}/user/profile/stats/`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await axios.get<{ results: RecentActivity[] }>(
        `${API_BASE_URL}/user/profile/activity/?limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      return response.data.results || [];
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await axios.get<UserPreferences>(
        `${API_BASE_URL}/user/profile/preferences/`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      throw error;
    }
  }

  async updateUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const response = await axios.patch<UserPreferences>(
        `${API_BASE_URL}/user/profile/preferences/`,
        preferences,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw error;
    }
  }
}

export const userStatsApi = new UserStatsApi();
