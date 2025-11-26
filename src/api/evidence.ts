import { http, httpPost, httpPatch, httpDelete } from "./client";

export interface CreateEvidencePayload {
  name: string;
  description: string;
  caseNumber: string;
  location: string;
  expiryDate: string; // YYYY-MM-DD
  category: string;
  imageUrl?: string;
  imageUrls?: string[];
  accountFileUrl?: string;
}

export const evidenceApi = {
  async list(query?: { status?: string; investigatorId?: string; search?: string; page?: string; limit?: string }) {
    return await http<{ data?: unknown[]; items?: unknown[] } | unknown[]>("/api/evidence", {
      method: "GET",
      query,
    });
  },
  async expiring(days?: string | number) {
    return await http<{ data?: unknown[] } | unknown[]>("/api/evidence/expiring", {
      method: "GET",
      query: days ? { days: String(days) } : undefined,
    });
  },
  async getById(id: string) {
    return await http<unknown | { data?: unknown }>(`/api/evidence/${id}`, {
      method: "GET",
    });
  },
  async create(payload: CreateEvidencePayload) {
    return await httpPost("/api/evidence", payload);
  },
  async update(id: string, body: Partial<CreateEvidencePayload>) {
    return await httpPatch(`/api/evidence/${id}`, body);
  },
  async remove(id: string) {
    return await httpDelete(`/api/evidence/${id}`);
  },
};


