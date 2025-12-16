import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

const ACCESS_TOKEN_EXPIRY = "30m"
const REFRESH_TOKEN_EXPIRY = "7d"

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

export const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword)
}

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    })
}

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    })
}

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET)
    } catch (error) {
        throw new Error("Invalid refresh token")
    }
}

export const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

export const clearTokenCookies = (res) => {
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
}