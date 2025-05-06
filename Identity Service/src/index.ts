import express,{Request, Response} from "express"
import dotenv from "dotenv"
import logger from "./utils/logger"
import cors from "cors"
import router from "./route/authroute"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { rateLimiterConfigDDOS, rateLimiterConfigStrict,rateLimitMiddleware } from "./utils/rateLimit"

dotenv.config()


const PORT = process.env.PORT!


const app = express();

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(cookieParser())



app.listen(PORT,()=>{
    logger.info(`App is running on port ${PORT}`)
})

app.use(rateLimitMiddleware(rateLimiterConfigDDOS))

app.use("/api/auth",rateLimitMiddleware(rateLimiterConfigStrict), router);

app.use("/health", (req:Request,res:Response)=>{

    res.json({
        success:true,
        message:"Alive"
    })

})