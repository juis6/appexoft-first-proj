import { prisma } from "../utils/prisma.js"
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    setTokenCookies,
    clearTokenCookies
} from "../utils/auth.js"

class AuthController {
    async register(req, res) {
        try {
            const { email, password, name } = req.body

            if (!email || !password) {
                return res.status(400).json({
                    error: "Email and password are required"
                })
            }

            const existingUser = await prisma.user.findUnique({
                where: { email }
            })

            if (existingUser) {
                return res.status(409).json({
                    error: "User already exists"
                })
            }

            const hashedPassword = await hashPassword(password)

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || null
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true
                }
            })

            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email
            })
            const refreshToken = generateRefreshToken({
                userId: user.id
            })

            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 днів
                }
            })

            setTokenCookies(res, accessToken, refreshToken)

            res.status(201).json({
                message: "User registered successfully",
                user
            })
        } catch (error) {
            console.error("Register error:", error)
            res.status(500).json({
                error: "Registration failed"
            })
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).json({
                    error: "Email and password are required"
                })
            }

            const user = await prisma.user.findUnique({
                where: { email }
            })

            if (!user) {
                return res.status(401).json({
                    error: "Invalid credentials"
                })
            }

            const isPasswordValid = await comparePassword(password, user.password)

            if (!isPasswordValid) {
                return res.status(401).json({
                    error: "Invalid credentials"
                })
            }

            const accessToken = generateAccessToken({
                userId: user.id,
                email: user.email
            })
            const refreshToken = generateRefreshToken({
                userId: user.id
            })

            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })

            setTokenCookies(res, accessToken, refreshToken)

            res.status(200).json({
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            })
        } catch (error) {
            console.error("Login error:", error)
            res.status(500).json({
                error: "Login failed"
            })
        }
    }

    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken

            if (refreshToken) {
                await prisma.refreshToken.deleteMany({
                    where: { token: refreshToken }
                })
            }

            clearTokenCookies(res)

            res.status(200).json({
                message: "Logout successful"
            })
        } catch (error) {
            console.error("Logout error:", error)
            res.status(500).json({
                error: "Logout failed"
            })
        }
    }

    async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken

            if (!refreshToken) {
                return res.status(401).json({
                    error: "Refresh token required"
                })
            }

            const decoded = verifyRefreshToken(refreshToken)

            const tokenInDb = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true }
            })

            if (!tokenInDb) {
                return res.status(403).json({
                    error: "Invalid refresh token"
                })
            }

            if (new Date() > tokenInDb.expiresAt) {
                await prisma.refreshToken.delete({
                    where: { id: tokenInDb.id }
                })
                return res.status(403).json({
                    error: "Refresh token expired"
                })
            }

            const newAccessToken = generateAccessToken({
                userId: tokenInDb.userId,
                email: tokenInDb.user.email
            })

            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            })

            res.status(200).json({
                message: "Token refreshed successfully"
            })
        } catch (error) {
            console.error("Refresh token error:", error)
            res.status(403).json({
                error: "Invalid refresh token"
            })
        }
    }

    async me(req, res) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true
                }
            })

            if (!user) {
                return res.status(404).json({
                    error: "User not found"
                })
            }

            res.status(200).json({ user })
        } catch (error) {
            console.error("Get user error:", error)
            res.status(500).json({
                error: "Failed to get user"
            })
        }
    }
}

export const authController = new AuthController()