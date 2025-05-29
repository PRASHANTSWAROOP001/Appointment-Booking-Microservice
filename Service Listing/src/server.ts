import express, {Request, Response} from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import logger from "./utils/logger";
import sellerLocation from "./route/sellerLocation"
import sellerShop from "./route/sellerRoute";
import sellerService from "./route/sellerServiceRoute"
import { sellerAuthMiddleware } from "./middleware/authMiddleware";


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

app.use("/api/seller/location",sellerAuthMiddleware, sellerLocation);
app.use("/api/seller/shop", sellerAuthMiddleware,sellerShop)
app.use("/api/seller/service",sellerAuthMiddleware,sellerService)

