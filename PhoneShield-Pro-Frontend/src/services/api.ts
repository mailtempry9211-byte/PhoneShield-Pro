import axios, { AxiosError, type AxiosInstance } from "axios";

/**
 * Centralized API configuration.
 * Override at build/run time with VITE_API_BASE_URL.
 */
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "https://phoneshield-pro.onrender.com/api";

export const TOKEN_KEY = "phoneshield_token";
export const USER_KEY = "phoneshield_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const onLogin = window.location.pathname === "/";
      clearAuthStorage();
      if (!onLogin) window.location.replace("/");
    }
    return Promise.reject(error);
  },
);

/** Human readable message from any API / network failure. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const err = error as AxiosError<any>;
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    return data.message || data.error || data.msg || fallback;
  }
  if (err?.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (err?.message === "Network Error") return "Cannot reach the server. Check your connection.";
  return (err as any)?.message || fallback;
}

/**
 * Backends differ in envelope shape. Normalise to a plain array / object.
 */
export function unwrap<T = any>(payload: any, key?: string): T {
  if (payload == null) return payload;
  if (key && payload[key] !== undefined) return payload[key];
  if (payload.data !== undefined) return unwrap(payload.data, key);
  if (payload.result !== undefined) return payload.result;
  return payload;
}

export function toList<T = any>(payload: any, key?: string): T[] {
  const value = unwrap<any>(payload, key);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.docs)) return value.docs;
  if (Array.isArray(value?.results)) return value.results;
  if (key && Array.isArray(value?.[key])) return value[key];
  return [];
}
