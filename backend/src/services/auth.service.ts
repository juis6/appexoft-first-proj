import bcrypt from "bcrypt";
import { prisma } from "../config/database";
import { JwtUtil } from "../utils/jwt.util";
import { EmailService } from "./email.service";
import { IUser, IUserCredentials, ITokenPair } from "../types/interfaces";

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  public async register(
    data: IUserCredentials
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username || data.email.split("@")[0],
      },
    });

    const tokens = JwtUtil.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    return { user, tokens };
  }

  public async login(
    data: IUserCredentials
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const tokens = JwtUtil.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    return { user, tokens };
  }

  public async refresh(refreshToken: string): Promise<ITokenPair> {
    const payload = JwtUtil.verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return JwtUtil.generateTokenPair({
      userId: user.id,
      email: user.email,
    });
  }

  public async getProfile(userId: string): Promise<IUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return;

    const resetToken = JwtUtil.generateResetToken({ userId: user.id });
    await this.emailService.sendResetPasswordEmail(user.email, resetToken);
  }

  public async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const payload = JwtUtil.verifyResetToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }
}
