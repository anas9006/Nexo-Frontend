/**
 * Backend base URL (no trailing slash).
 * Set VITE_API_URL in client/.env.development or client/.env.production.
 */
const raw = import.meta.env.VITE_API_URL;

function normalizeBaseUrl(url) {
  return String(url).trim().replace(/\/$/, "");
}

export const API_BASE_URL = raw
  ? normalizeBaseUrl(raw)
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://nexo-backend-moof.onrender.com";

/** REST API prefix */
export const API_URL = `${API_BASE_URL}/api`;
