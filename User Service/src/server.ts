import express from "express";
import dotenv from "dotenv"
import helmet from "helmet";
import cors from "cors";
import logger from "./utils/logger";
import searchRouter from "./router/searchRouter"
import { userAuthMiddleware } from "./middleware/authMiddleware";

dotenv.config();

const PORT:string = process.env.PORT!;

const app = express()

app.use(express.json())
app.use(helmet())
app.use(cors())



app.listen(PORT,()=>{

    logger.info(`user services started listening on port ${PORT}`);

})

app.use("/api/user/check-point", (req:express.Request,res:express.Response)=>{

    logger.info("check-point is hit");

    console.log(`Log of entire request.header object ${req.headers["x-user-id"]}`);
    console.log(`Log of entire request.header object ${req.headers["x-user-role"]}`)
    res.json({
        success:true,
        message:"successfully hit the user service"
    })
})

app.use("/api/user",userAuthMiddleware,searchRouter)
