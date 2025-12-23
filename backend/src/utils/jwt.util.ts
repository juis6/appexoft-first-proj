import jwt from "jsonwebtoken";
import { ITokenPayload, ITokenPair } from "../types/interfaces";

export class JwtUtil {
  private static readonly ACCESS_TOKEN_SECRET =
    process.env.ACCESS_TOKEN_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRY = "15m";
  private static readonly REFRESH_TOKEN_EXPIRY = "7d";

  public static generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  public static generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  public static generateTokenPair(payload: ITokenPayload): ITokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  public static verifyAccessToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as ITokenPayload;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }

  public static verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as ITokenPayload;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }
}
