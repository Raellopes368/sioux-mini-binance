import type { User } from "@/types/user";

import { AuthSession, LoginPayload, RegisterPayload } from "@/types/auth";
import { api } from "./api";

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>("/login", payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>("/register", payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/me");
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/logout");
  },
};
