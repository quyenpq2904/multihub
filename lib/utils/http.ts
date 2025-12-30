import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
} from "axios";
import {
  getTokenFromLS,
  removeTokenFromLS,
  setTokenToLS,
} from "./localStorage";
import { IRefreshTokenResponse } from "../../apis/auth/auth-res.type";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const AUTH_URL_REFRESH = "/auth/refresh";
const REQUEST_TIMEOUT = 10000;

class Http {
  private instance: AxiosInstance;
  private refreshTokenRequest: Promise<string | null> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    this.instance.interceptors.request.use(
      this.handleRequestConfig,
      this.handleRequestError
    );

    this.instance.interceptors.response.use(
      this.handleResponseSuccess,
      this.handleResponseError
    );
  }

  /**
   * Request Interceptor: Attaches Authorization header if token exists
   */
  private handleRequestConfig = (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const tokens = getTokenFromLS();
      if (tokens && tokens.accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }
    return config;
  };

  private handleRequestError = (error: AxiosError) => {
    return Promise.reject(error);
  };

  /**
   * Response Interceptor: Returns data directly or full response
   */
  private handleResponseSuccess = (response: AxiosResponse) => {
    return response;
  };

  /**
   * Response Error Interceptor: Handles 401 and Token Refresh logic
   */
  private handleResponseError = async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 Unauthorized and not already retried
    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(AUTH_URL_REFRESH)
    ) {
      originalRequest._retry = true;

      try {
        // Singleton pattern for refresh token request to avoid multiple calls
        if (!this.refreshTokenRequest) {
          this.refreshTokenRequest = this.performRefreshToken();
        }

        const newAccessToken = await this.refreshTokenRequest;

        if (newAccessToken) {
          // Update header with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // Retry original request with new token
          return this.instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, reject appropriately
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  };

  /**
   * Performs the actual token refresh via a separate Axios call
   */
  private performRefreshToken = async (): Promise<string | null> => {
    try {
      // Must check window for safer side-effect handling
      if (typeof window === "undefined") return null;

      const currentTokens = getTokenFromLS();
      if (!currentTokens || !currentTokens.refreshToken) {
        throw new Error("No refresh token available");
      }

      // Direct axios call to bypass interceptors and avoid circular dependency
      const { data } = await axios.post<IRefreshTokenResponse>(
        `${API_BASE_URL}${AUTH_URL_REFRESH}`,
        { refreshToken: currentTokens.refreshToken }
      );

      const { accessToken, refreshToken } = data;

      // Update LocalStorage
      setTokenToLS({ accessToken, refreshToken });

      return accessToken;
    } catch (error) {
      // Handle Refresh Token Failure (e.g., token expired, network issue)
      console.error("RefreshToken failed:", error);
      this.handleLogout();
      return null;
    } finally {
      // Clean up the promise so next 401 triggers a new refresh
      this.refreshTokenRequest = null;
    }
  };

  /**
   * Logout handler to clean state
   */
  private handleLogout() {
    removeTokenFromLS();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:logout"));
    }
  }

  // Wrapper methods for cleaner usage
  public get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.get(url, config);
  }

  public post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.post(url, data, config);
  }

  public put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.delete(url, config);
  }

  public patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R> {
    return this.instance.patch(url, data, config);
  }
}

const http = new Http();
export default http;
