import http from "../../lib/utils/http";
import {
  ILoginRequest,
  IRefreshTokenRequest,
  ISignUpRequest,
} from "./auth-req.type";
import { ILoginResponse, IRefreshTokenResponse } from "./auth-res.type";

const BaseURL = "auth";

const authApi = {
  login(data: ILoginRequest) {
    return http.post<ILoginResponse>(`${BaseURL}/login`, data);
  },

  signUp(data: ISignUpRequest) {
    return http.post<ILoginResponse>(`${BaseURL}/register`, data);
  },

  refreshToken(data: IRefreshTokenRequest) {
    return http.post<IRefreshTokenResponse>(`${BaseURL}/refresh`, data);
  },
};

export default authApi;
