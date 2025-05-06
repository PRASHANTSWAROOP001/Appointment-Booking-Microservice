import  {createProxyMiddleware,Plugin } from "http-proxy-middleware";
import logger from "./utils/logger";
import { RequestHandler } from "express";
import dotenv from "dotenv"

dotenv.config()

const authTargetUrl:string = process.env.IDENTITY_SERVICE!

console.log(authTargetUrl)

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


export {authServiceProxy}
