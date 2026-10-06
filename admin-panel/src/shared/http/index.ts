import axios from 'axios';

// VITE_API_URL in .env.local for local development; production API by default
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `https://workzora.com/api`,
  timeout: 10000,
  withCredentials: true
});
