import jwt from "jsonwebtoken";
import { ITokenPayload, ITokenPair } from "../types/interfaces";

export class JwtUtil {
  private static readonly ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET || "access_secret";
  private static readonly REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "refresh_secret";
  private static readonly RESET_SECRET =
    process.env.JWT_RESET_SECRET || "reset_secret";

  public static generateTokenPair(payload: ITokenPayload): ITokenPair {
    const accessToken = jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  public static verifyAccessToken(token: string): ITokenPayload {
    return jwt.verify(token, this.ACCESS_SECRET) as ITokenPayload;
  }

  public static verifyRefreshToken(token: string): ITokenPayload {
    return jwt.verify(token, this.REFRESH_SECRET) as ITokenPayload;
  }

  public static generateResetToken(payload: { userId: string }): string {
    return jwt.sign(payload, this.RESET_SECRET, {
      expiresIn: "15m",
    });
  }

  public static verifyResetToken(token: string): { userId: string } {
    return jwt.verify(token, this.RESET_SECRET) as { userId: string };
  }
}
