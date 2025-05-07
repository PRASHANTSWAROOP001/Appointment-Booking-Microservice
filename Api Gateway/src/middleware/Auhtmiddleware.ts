import jwt, { JwtPayload } from "jsonwebtoken"
import logger from "../utils/logger"
import { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"

interface JwtUserPayload extends JwtPayload {
    userId: string;
    role: string;
    email: string;
}
  
interface AuthenticatedRequest extends Request {
    user?: JwtUserPayload;
}


dotenv.config()

const JWT_SECRET: string = process.env.JWT_SECRET!


const verifyAccessToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) {
            logger.warn("Missing auth token");
            res.status(401).json({
                success: false,
                message: "Auth token is missing"
            });
            return;
        }

        const verifiedToken = jwt.verify(token, JWT_SECRET) as JwtUserPayload
        req.user = verifiedToken;
        next();

    } catch (error: any) {
        logger.error("Token verification failed", error);
         res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
        });
        return;
    }
};

export default verifyAccessToken;