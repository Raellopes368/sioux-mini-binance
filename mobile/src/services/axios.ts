import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { DeviceEventEmitter } from "react-native";

import type { RefreshTokenResponse } from "@/types/auth";

import {
  clearAuthTokens,
  getRefreshToken,
  saveAuthTokens,
} from "./secure-storage";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;

const failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((promise) => {
    if (error || token === null) {
      promise.reject(error);
      return;
    }

    promise.resolve(token);
  });

  failedQueue.length = 0;
}

function shouldSkipRefresh(url?: string): boolean {
  if (!url) {
    return false;
  }

  return ["/login", "/register", "/refresh", "/logout"].some((path) =>
    url.includes(path),
  );
}

async function logout(api: AxiosInstance): Promise<void> {
  await clearAuthTokens();
  delete api.defaults.headers.common.Authorization;
  DeviceEventEmitter.emit("auth:logout");
}

function attachInterceptors(api: AxiosInstance): void {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        shouldSkipRefresh(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          await logout(api);
          return Promise.reject(error);
        }

        const { data } = await api.post<RefreshTokenResponse>("/refresh", {
          refresh_token: refreshToken,
        });

        await saveAuthTokens(data.token, data.refresh_token);

        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        processQueue(null, data.token);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await logout(api);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}

export function getAPIClient(): AxiosInstance {
  const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
  });

  attachInterceptors(api);

  return api;
}
