interface ILoginRequest {
  email: string;
  password: string;
}

interface ISignUpRequest {
  fullName: string;
  email: string;
  password: string;
}

interface IRefreshTokenRequest {
  refreshToken: string;
}

export type { ILoginRequest, ISignUpRequest, IRefreshTokenRequest };
