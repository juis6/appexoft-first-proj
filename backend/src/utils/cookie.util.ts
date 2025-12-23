import { Response, Request } from "express";
import { ICookieOptions } from "../types/interfaces";

export class CookieUtil {
  private static readonly ACCESS_TOKEN_COOKIE = "accessToken";
  private static readonly REFRESH_TOKEN_COOKIE = "refreshToken";

  private static readonly baseOptions: ICookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
    maxAge: 0,
  };

  private static getAccessTokenOptions(): ICookieOptions {
    return {
      ...this.baseOptions,
      maxAge: 15 * 60 * 1000,
    };
  }

  private static getRefreshTokenOptions(): ICookieOptions {
    return {
      ...this.baseOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  public static setTokens(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    res.cookie(
      this.ACCESS_TOKEN_COOKIE,
      accessToken,
      this.getAccessTokenOptions()
    );
    res.cookie(
      this.REFRESH_TOKEN_COOKIE,
      refreshToken,
      this.getRefreshTokenOptions()
    );
  }

  public static clearTokens(res: Response): void {
    res.clearCookie(this.ACCESS_TOKEN_COOKIE, this.baseOptions);
    res.clearCookie(this.REFRESH_TOKEN_COOKIE, this.baseOptions);
  }

  public static getAccessToken(req: Request): string | undefined {
    return req.cookies?.[this.ACCESS_TOKEN_COOKIE];
  }

  public static getRefreshToken(req: Request): string | undefined {
    return req.cookies?.[this.REFRESH_TOKEN_COOKIE];
  }
}
