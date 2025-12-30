/* eslint-disable @typescript-eslint/no-empty-object-type */
interface ILoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

interface IRefreshTokenResponse
  extends Pick<ILoginResponse, "accessToken" | "refreshToken"> {}

export type { ILoginResponse, IRefreshTokenResponse };
