import axios from 'axios';

export const api = axios.create({
  baseURL: `http://localhost:8000`, //`https://workzora.com/api`
  timeout: 10000,
  withCredentials: true
});