import Redis from "ioredis";
import logger from "./logger";
import {RateLimiterRedis} from "rate-limiter-flexible"
import dotenv from "dotenv"
import { Request, Response, NextFunction } from "express";

dotenv.config()

const RedisUrl:string = process.env.REDIS_URL!


const redisClient:Redis = new Redis(RedisUrl);

// in 10 mins a user can make 5 requests

const rateLimiterConfigStrict:RateLimiterRedis = new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix:"sensitiveEndpoint",
    blockDuration:900,
    points:5,
    duration:600
})


const rateLimiterConfigDDOS:RateLimiterRedis = new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix:"DdosProtection",
    blockDuration:300,
    points:10,
    duration:1
})

const rateLimitMiddleware = (limitConfig:RateLimiterRedis)=>{

    return(req:Request, res:Response, next:NextFunction)=>{

        if(req.ip == undefined){
            res.status(404).json({
                message:"missing ip"
            })
            logger.warn("some how we have case of missing ip")
            return;
        }

        limitConfig.consume(req.ip)
        .then(()=>(next()))
        .catch(()=>{
            logger.warn(`user has made too many requests : ${req.ip}`)
            res.status(429).json({
                success:false,
                message:"Too many request please try again later."
            })
        })

    }

}

export {rateLimiterConfigDDOS, rateLimiterConfigStrict, rateLimitMiddleware}