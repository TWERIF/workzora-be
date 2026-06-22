import { api } from "@/shared/http";
import type { User } from "./types";
export const login = async ({
  password,
  email,
}: {
  password: string;
  email: string;
}) => {
  const res = await api.post("/auth/login", { password, email });
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const verify = async (): Promise<User> => {
  const res = await api.get("/auth/verify");
  return res.data;
};
