import axios from 'axios';

export const api = axios.create({
  baseURL: `https://workzora.com/api`, //`http://localhost:8000`
  timeout: 10000,
  withCredentials: true
});