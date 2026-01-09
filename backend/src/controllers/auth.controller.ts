import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { CookieUtil } from "../utils/cookie.util";
import { IApiResponse } from "../types/interfaces";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, tokens } = await this.authService.register(req.body);

      CookieUtil.setTokens(res, tokens.accessToken, tokens.refreshToken);

      res.status(201).json({
        success: true,
        data: { user },
      } as IApiResponse);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      } as IApiResponse);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, tokens } = await this.authService.login(req.body);

      CookieUtil.setTokens(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        data: { user },
      } as IApiResponse);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      } as IApiResponse);
    }
  };

  public logout = async (_req: Request, res: Response): Promise<void> => {
    CookieUtil.clearTokens(res);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    } as IApiResponse);
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = CookieUtil.getRefreshToken(req);

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: "Refresh token not found",
        } as IApiResponse);
        return;
      }

      const tokens = await this.authService.refresh(refreshToken);
      CookieUtil.setTokens(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: "Tokens refreshed",
      } as IApiResponse);
    } catch (error) {
      CookieUtil.clearTokens(res);
      res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      } as IApiResponse);
    }
  };

  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as IApiResponse);
        return;
      }

      const user = await this.authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: { user },
      } as IApiResponse);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: "User not found",
      } as IApiResponse);
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: "Email is required" });
        return;
      }

      await this.authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: "If an account exists, a reset link has been sent",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error processing request",
      });
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        res.status(400).json({ success: false, error: "Missing fields" });
        return;
      }

      await this.authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
  };
}
