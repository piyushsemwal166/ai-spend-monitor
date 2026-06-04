import axios from "axios";

const _envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
let baseURL = _envBase ?? "/api";
if (_envBase) {
  baseURL = baseURL.replace(/\/api(\/v\d+)?\/?$/, "");
  if (!baseURL) baseURL = "/";
}

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