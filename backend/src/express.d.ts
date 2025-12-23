import { ITokenPayload } from "./types/interfaces";

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export {};
