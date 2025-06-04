import { Request,Response, NextFunction } from "express";
import logger from "../utils/logger";


interface VerifiedUserRequest extends Request{
    userId?: number,
    role?:string
}


const userAuthMiddleware = (req:VerifiedUserRequest, res:Response, next:NextFunction)=>{
    const userId:string|undefined = req.header("x-user-id")

    const role:string|undefined = req.header('x-user-role')


    if(!userId || !role){
        res.status(400).json({
            success:false,
            message:"Verify User Role or missing the auth details."
        })
        logger.warn("User dont have either privilege to hit this endpoint or missing id.");
        return;
    }
    req.userId = parseInt(userId)
    req.role = role
    next();
}

export { userAuthMiddleware, VerifiedUserRequest}