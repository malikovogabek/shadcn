import { http, httpPost, httpPatch, httpDelete } from "./client";

export interface CreateUserPayload {
  username: string;
  phoneNumber: string;
  fullName: string;
  password: string;
  role: string;
}

export const usersApi = {
  async list() {
    return await http<unknown[]>("/api/users", { method: "GET" });
  },
  async create(payload: CreateUserPayload) {
    return await httpPost("/api/users", payload);
  },
  async getById(id: string) {
    return await http(`/api/users/${id}`, { method: "GET" });
  },
  async update(id: string, body: Partial<CreateUserPayload>) {
    return await httpPatch(`/api/users/${id}`, body);
  },
  async remove(id: string) {
    return await httpDelete(`/api/users/${id}`);
  },
};


