import jwt, { JwtPayload } from "jsonwebtoken"
import logger from "../utils/logger"
import { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"


interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload,
}

dotenv.config()

const JWT_SECRET: string = process.env.JWT_SECRET!


const verifyAccessToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) {
            logger.warn("Missing auth token");
            return res.status(401).json({
                success: false,
                message: "Auth token is missing"
            });
        }

        const verifiedToken = jwt.verify(token, JWT_SECRET);
        req.user = verifiedToken;
        next();

    } catch (error: any) {
        logger.error("Token verification failed", error);
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
        });
    }
};

export default verifyAccessToken;