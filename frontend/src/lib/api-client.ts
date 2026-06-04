import axios from "axios";

const _envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
// If an explicit base URL is provided (e.g. https://host/api/v1),
// use it as-is except trimming a trailing slash. Do NOT strip `/api` or `/api/v1`.
let baseURL = _envBase ? _envBase.replace(/\/$/, "") : "/api";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("ai-spend-token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});