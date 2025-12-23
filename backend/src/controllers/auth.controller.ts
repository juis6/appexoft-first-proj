import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { CookieUtil } from "../utils/cookie.util";
import { IApiResponse } from "../types/interfaces";

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, username } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and password are required",
        } as IApiResponse);
        return;
      }

      const { user, tokens } = await this.authService.register({
        email,
        password,
        username,
      });

      CookieUtil.setTokens(res, tokens.accessToken, tokens.refreshToken);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
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
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and password are required",
        } as IApiResponse);
        return;
      }

      const { user, tokens } = await this.authService.login({
        email,
        password,
      });

      CookieUtil.setTokens(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: "Login successful",
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
      message: "Logout successful",
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

      const tokens = await this.authService.refreshTokens(refreshToken);

      CookieUtil.setTokens(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
      } as IApiResponse);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : "Token refresh failed",
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
        error: error instanceof Error ? error.message : "Failed to get profile",
      } as IApiResponse);
    }
  };
}
