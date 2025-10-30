import { http } from "./client";

export type DashboardStatsResponse = { data?: unknown } | Record<string, unknown>;

export const statisticsApi = {
  async dashboard() {
    return await http<DashboardStatsResponse>("/api/statistics/dashboard", {
      method: "GET",
    });
  },
  async user(id: string) {
    return await http<DashboardStatsResponse>(`/api/statistics/users/${id}`, {
      method: "GET",
    });
  },
  async monthly(year: string, month: string) {
    return await http<DashboardStatsResponse>("/api/statistics/monthly", {
      method: "GET",
      query: { year, month },
    });
  },
};


