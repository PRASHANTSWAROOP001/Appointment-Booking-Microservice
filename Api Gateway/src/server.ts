import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import logger from "./utils/logger";
import { authServiceProxy, listingServiceProxy,userServiceProxy } from "./proxy";
import { rateLimiterConfigDDOS, rateLimitMiddleware } from "./utils/rateLimit";
import verifyAccessToken from "./middleware/Auhtmiddleware";

dotenv.config()

const PORT = process.env.PORT!

const app = express();


app.use(helmet())
app.use(cors())

app.use(rateLimitMiddleware(rateLimiterConfigDDOS))

app.use("/auth-route", authServiceProxy)
app.use("/listing-route", verifyAccessToken,listingServiceProxy)
app.use("/user-route",verifyAccessToken,userServiceProxy)


app.listen(PORT, ()=>{
    logger.info(`Api gateway service is running on port ${PORT}`)
})