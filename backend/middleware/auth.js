import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies.accessToken

        if (!token) {
            return res.status(401).json({ 
                error: "Access token required" 
            })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                error: "Token expired",
                code: "TOKEN_EXPIRED"
            })
        }
        return res.status(403).json({ 
            error: "Invalid token" 
        })
    }
}

export const optionalAuth = (req, res, next) => {
    try {
        const token = req.cookies.accessToken

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET)
            req.user = decoded
        }
        next()
    } catch (error) {
        next()
    }
}