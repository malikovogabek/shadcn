import { http, httpPost } from "./client";

export type LoginResponse = {
  access_token?: string;
  user?: unknown;
};

export const authApi = {
  async login(username: string, password: string) {
    return await http<LoginResponse>("/api/auth/login", {
      method: "POST",
      skipAuth: true,
      body: { username, password },
    });
  },
  async me() {
    return await http<{ user?: unknown }>("/api/auth/me", { method: "POST" });
  },
  async logout() {
    await httpPost("/api/auth/logout");
    return true;
  },
};


