const API_URL = (import.meta.env.VITE_API_URL ?? "https://topengmalang.alwaysdata.net/api").replace(/\/$/, "");
const TOKEN_KEY = "tm_token";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage tidak tersedia, abaikan */
  }
};

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// Dipanggil saat server menjawab 401 (token kedaluwarsa / dicabut).
let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  unauthorizedHandler = fn;
};

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown; // dikirim sebagai JSON
  formData?: FormData; // dikirim sebagai multipart (upload file)
  silent401?: boolean; // jangan jalankan unauthorizedHandler
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, formData, silent401 = false } = options;

  // "Accept: application/json" WAJIB agar Laravel membalas JSON (bukan redirect HTML)
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData; // jangan set Content-Type, browser mengisi boundary sendiri
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError("Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.", 0);
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token && !silent401) unauthorizedHandler?.();

    const errors: Record<string, string[]> = data?.errors ?? {};
    const allMessages = Object.values(errors).flat();
    const message =
      allMessages.length > 0
        ? allMessages.join(" ")
        : (data?.message as string | undefined) ?? `Terjadi kesalahan (${res.status}).`;

    throw new ApiError(message, res.status, errors);
  }

  return data as T;
}

export const errorMessage = (e: unknown): string =>
  e instanceof ApiError ? e.message : "Terjadi kesalahan tak terduga. Coba lagi.";
