import  {createProxyMiddleware,Plugin } from "http-proxy-middleware";
import logger from "./utils/logger";
import { RequestHandler } from "express";
import dotenv from "dotenv"
import { JwtPayload } from "jsonwebtoken";

interface JwtUserPayload extends JwtPayload {
    userId: string;
    role: string;
    email: string;
}
  
interface AuthenticatedRequest extends Request {
    user?: JwtUserPayload;
}

dotenv.config()

const authTargetUrl:string = process.env.IDENTITY_SERVICE!

const listingTargetUrl:string = process.env.LISTING_SERVICE!

const pinoLogPlugin:Plugin = (proxyServer)=>{
    proxyServer.on('proxyReq',(proxyReq,req, res)=>{
        logger.info(`[PROXY] ${req.method} ${req.url}`);
    })
}


const authServiceProxy:RequestHandler = createProxyMiddleware({
    target: authTargetUrl,
    changeOrigin:true,
    pathRewrite: {
        '^/auth-route': '', 
    },
    plugins:[
        pinoLogPlugin
    ], 
    on: {
        proxyReq: (proxyReq, req, res) => {
          const fullUrl = `${proxyReq.protocol || 'http:'}//${proxyReq.getHeader('host')}${proxyReq.path || ''}`;
          logger.info(`[PROXY] Rewriting and forwarding to: ${fullUrl}`);
        },
        proxyRes: (proxyRes, req, res) => {
            logger.info(`[PROXY] Response status from target: ${proxyRes.statusCode}`);
        }
      },   
})


const listingServiceProxy:RequestHandler = createProxyMiddleware({
    target:listingTargetUrl,
    changeOrigin:true,
    pathRewrite:{
        '^/list-route': '', 
    },
    plugins:[
        pinoLogPlugin
    ],
    on: {
        proxyReq: (proxyReq, req, res) => {
          const fullUrl = `${proxyReq.protocol || 'http:'}//${proxyReq.getHeader('host')}${proxyReq.path || ''}`;
          logger.info(`[PROXY] Rewriting and forwarding to: ${fullUrl}`);

          const user = (req as any).user;

          logger.info(`user data: ${user}`)

          if(user){
            proxyReq.setHeader('x-user-id', user?.userId);
            proxyReq.setHeader('x-user-role', user?.role)
          }

        },
        proxyRes: (proxyRes, req, res) => {
            logger.info(`[PROXY] Response status from target: ${proxyRes.statusCode}`);
        }
      }, 

})



export {authServiceProxy, listingServiceProxy}
