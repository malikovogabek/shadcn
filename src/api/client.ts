// Common API client: base URL, token storage, and HTTP helpers

export const BASE_URL = "https://ashyoviy-dalillar-backend-production.up.railway.app";

const ACCESS_TOKEN_KEY = "accessToken";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  skipAuth?: boolean;
  credentials?: RequestCredentials;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
}

export async function http<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers, skipAuth, credentials, query } = options;
  const token = getToken();
  const url = buildUrl(path, query);

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const mergedHeaders: HeadersInit = {
    Accept: "application/json",
    ...((method !== "GET" && body !== undefined && !isFormData) ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  if (!skipAuth && token) {
    (mergedHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: mergedHeaders,
    credentials: credentials ?? "include",
    cache: "no-store",
    body: body !== undefined ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
  });

  if (!res.ok) {
    // 401 bo'lsa: tokenni tozalab, login sahifasiga yo'naltiramiz
    if (res.status === 401) {
      try {
        setToken(null);
        localStorage.removeItem("currentUser");
      } catch {
        /* ignore storage errors */
      }
      if (typeof window !== "undefined") {
        const loginPath = "/login";
        if (!window.location.pathname.includes(loginPath)) {
          window.location.href = loginPath;
        }
      }
    }

    // Qolgan xatolar: xabarni o‘qishga urinamiz, ammo parsing bilan yiqilmaymiz
    try {
      const err = await res.json();
      throw Object.assign(new Error(err?.message || `HTTP ${res.status}`), { status: res.status, data: err });
    } catch (e) {
      throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
    }
  }

  // Some endpoints may return empty body (204)
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  // @ts-expect-error allow unknown non-json
  return (await res.text()) as T;
}

export const httpGet = <T = unknown>(path: string, query?: RequestOptions["query"]) =>
  http<T>(path, { method: "GET", query });

export const httpPost = <T = unknown>(path: string, body?: unknown) =>
  http<T>(path, { method: "POST", body });

export const httpPut = <T = unknown>(path: string, body?: unknown) =>
  http<T>(path, { method: "PUT", body });

export const httpPatch = <T = unknown>(path: string, body?: unknown) =>
  http<T>(path, { method: "PATCH", body });

export const httpDelete = <T = unknown>(path: string) =>
  http<T>(path, { method: "DELETE" });


