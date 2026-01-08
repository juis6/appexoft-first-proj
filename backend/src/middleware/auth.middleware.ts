import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/jwt.util";
import { CookieUtil } from "../utils/cookie.util";
import { IApiResponse } from "../types/interfaces";

export class AuthMiddleware {
  public static authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      const accessToken = CookieUtil.getAccessToken(req);

      if (!accessToken) {
        res.status(401).json({
          success: false,
          error: "Access token not found",
          code: "NO_TOKEN",
        } as IApiResponse);
        return;
      }

      try {
        const payload = JwtUtil.verifyAccessToken(accessToken);
        req.user = payload;
        next();
      } catch (error) {
        res.status(401).json({
          success: false,
          error: "Invalid or expired access token",
          code: "TOKEN_EXPIRED",
        } as IApiResponse);
        return;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
        code: "AUTH_ERROR",
      } as IApiResponse);
    }
  }
}
