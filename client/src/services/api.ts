const configuredApiBase = import.meta.env.VITE_API_BASE_URL;

export const API_BASE = (configuredApiBase || '/api').replace(/\/+$/, '');
export const API_TIMEOUT_MS = 15_000;
