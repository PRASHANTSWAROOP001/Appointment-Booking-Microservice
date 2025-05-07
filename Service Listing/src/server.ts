import express, {Request, Response} from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import logger from "./utils/logger";


dotenv.config()


const PORT = process.env.PORT!


const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())



app.listen(PORT, ()=>{
    logger.info(`app is started litening on port: ${PORT}`);
})

app.use("/api/seller/check-point", (req:Request, res:Response)=>{
    logger.info("check-point is hit");

    console.log(`Log of entire request.header object ${req.headers["x-user-id"]}`);
    console.log(`Log of entire request.header object ${req.headers["x-user-role"]}`)
    res.json({
        message:"you have hit the end point successfully. bravo touch base success."
    })
})

