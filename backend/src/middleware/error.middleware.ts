import { Request, Response, NextFunction } from "express";
import { IApiError, IApiResponse } from "../types/interfaces";

export class ErrorMiddleware {
  public static handle(
    err: IApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

    res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    } as IApiResponse);
  }

  public static notFound(_req: Request, res: Response): void {
    res.status(404).json({
      success: false,
      error: "Endpoint not found",
    } as IApiResponse);
  }
}
