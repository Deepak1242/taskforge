import { clearToken, getToken } from "../utils/storage";

const DEFAULT_API_BASE = "https://taskforge-2jp5-onl7zev13-demoncommander12-1854s-projects.vercel.app/api/v1";
const API_BASE = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;

export const request = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) clearToken();

    const error = new Error(data.message || "Request failed");
    error.details = data.details || [];
    error.status = response.status;
    throw error;
  }

  return data;
};