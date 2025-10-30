import { http } from "./client";

export const uploadApi = {
  async image(file: File) {
    const form = new FormData();
    form.append("file", file);
    return await http<{ url?: string; path?: string }>("/api/upload/image", {
      method: "POST",
      body: form,
    });
  },
};

// Convenience helper: returns direct URL/path or undefined
export async function uploadImageAndGetUrl(selectedFile: File | null): Promise<string | undefined> {
  if (!selectedFile) return undefined;
  const res = await uploadApi.image(selectedFile);
  const data = (res as unknown as { data?: unknown } | Record<string, unknown>);
  const payload = (data as { data?: unknown }).data ?? data;
  const obj = payload as Record<string, unknown>;
  return (obj.url as string | undefined) ?? (obj.path as string | undefined);
}


