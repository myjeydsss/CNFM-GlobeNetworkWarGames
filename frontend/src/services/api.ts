import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5266";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});