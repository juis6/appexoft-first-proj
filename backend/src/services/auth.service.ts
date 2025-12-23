import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { JwtUtil } from "../utils/jwt.util";
import {
  IUser,
  IUserCredentials,
  ITokenPair,
  ITokenPayload,
} from "../types/interfaces";

export class AuthService {
  private static readonly SALT_ROUNDS = 10;

  public async register(
    credentials: IUserCredentials
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const { email, password, username } = credentials;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, AuthService.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        username: username || email.split("@")[0],
        password: hashedPassword,
      },
    });

    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const tokens = JwtUtil.generateTokenPair(tokenPayload);

    const userResponse: IUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userResponse, tokens };
  }

  public async login(
    credentials: IUserCredentials
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const tokens = JwtUtil.generateTokenPair(tokenPayload);

    const userResponse: IUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userResponse, tokens };
  }

  public async refreshTokens(refreshToken: string): Promise<ITokenPair> {
    const payload = JwtUtil.verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
    };

    return JwtUtil.generateTokenPair(tokenPayload);
  }

  public async getProfile(userId: string): Promise<IUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
