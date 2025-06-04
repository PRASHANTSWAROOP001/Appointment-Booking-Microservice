import { Prisma, PrismaClient } from "../../generated/prisma";
import logger from "../utils/logger";
import { Request, Response } from "express";
import validateWithSchema from "../utils/validation";
import z from "zod";
import { VerifiedSellerRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const serviceSchema = z.object({
    shopId:z.string(),
    price:z.number(),
    title:z.string().min(3),
    description:z.string().min(5).optional(),
    duration:z.number()
})

const addService = async(req:Request, res:Response):Promise<void>=>{
    logger.info("add service endpoint is hit.");

    try {

        const serviceData = validateWithSchema(serviceSchema, req.body);

        const savedServiceData = await prisma.service.create({
            data:{
                ...serviceData
            }
        })

        if(savedServiceData){
            res.json({
                success:true,
                data: savedServiceData
            })
        }
        
    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            logger.error(`Prisma error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: "Database error happend. Please Try Again.",
            });
        } else if (error instanceof z.ZodError) {
            logger.error(`Validation error happend: ${error.message}`);
            res.status(400).json({
                success: false,
                message: "Validation error happend.",
                error: error.errors,
            });
        } else {
            logger.error(`Some unknown error happend: ${error}`);
            res.status(500).json({
                success: false,
                message: "Some unknown error happend at our side.",
            });
            return;
        }
        
    }

}

const deleteService = async (req:Request, res:Response):Promise<void>=>{
    logger.info("delete end point is hit")
    try {

        const serviceId = req.body();

        if (!serviceId){
            res.status(402).json({
                success:false,
                message:"service id is not present"
            })
        logger.warn("missing service id in req.body to delete service.");
        return;
        }


        const findNdeleteService = prisma.service.delete({
            where:{
                id:serviceId
            },

        })
        

        if(!findNdeleteService){
            res.status(404).json({
                success:false,
                message:"service could not be found"
            })
            logger.warn("could not find service by given id to del.");
            return;
        }

        res.json({
            success:true,
            message:"data deleted successfully",
            data: findNdeleteService
        })


    } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            logger.error(`Prisma error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: "Database error happend. Please Try Again.",
            });
        } else {
            logger.error(`Some unknown error happend: ${error}`);
            res.status(500).json({
                success: false,
                message: "Some unknown error happend at our side.",
            });
            return;
        }
    }
}

// paginate this

const getAllServicesForShopper = async (req:VerifiedSellerRequest, res:Response)=>{
     logger.info("get all service end point is hit")
    try {
        const userId = req.userId;


        const shop = await prisma.shop.findUnique({
            where:{
                userId:userId
            }
        })

        if(!shop){
            res.status(401).json({
                success:false,
                message:"Could not find the shop"
            })
            logger.warn("Could not find shop attached to userId")
            return;
        }
        
        const shopsAllService = await prisma.service.findMany({
            where:{
                shopId: shop.id
            }
        })

        res.json(shopsAllService);

    } catch (error:unknown) {

         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            logger.error(`Prisma error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: "Database error happend. Please Try Again.",
            });
        } else {
            logger.error(`Some unknown error happend: ${error}`);
            res.status(500).json({
                success: false,
                message: "Some unknown error happend at our side.",
            });
            return;
        }
        
    }
}

const getOneService = async (req:VerifiedSellerRequest, res:Response):Promise<void>=>{
    logger.info("get one service endpoint is hit.")
    try {
        const {serviceId} = req.params
        if(!serviceId){
            res.status(401).json({
                success:false,
                message:"Missing serviceId."
            })
            logger.warn("Missing service id in params")
            return;
        }

        const service = await prisma.service.findUnique({
            where:{
                id:serviceId
            }
        })

        if(!service){
            res.status(404).json({
                success:false,
                message:"could not find the requested service wih given id"
            })
            logger.warn("could not find the requested service wih given id")
            return;
        }

        res.json({
         success:true,
         data:service   
        })


    } catch (error:unknown) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            logger.error(`Prisma error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: "Database error happend. Please Try Again.",
            });
        } else {
            logger.error(`Some unknown error happend: ${error}`);
            res.status(500).json({
                success: false,
                message: "Some unknown error happend at our side.",
            });
            return;
        }
    }
}

const updateService = async (req: VerifiedSellerRequest, res: Response): Promise<void> => {
    logger.info("update service endpoint is hit");
    try {
        const serviceData = validateWithSchema(serviceSchema, req.body);
        const { serviceId } = req.params;
        const userId = req.userId;

        if (!serviceId) {
            res.status(400).json({
                success: false,
                message: "Missing serviceId.",
            });
            logger.warn("Missing service id in params");
            return;
        }

        const shop = await prisma.shop.findUnique({
            where: { userId },
        });

        if (!shop) {
            res.status(404).json({
                success: false,
                message: "Shop not found for user",
            });
            return;
        }

        const existingService = await prisma.service.findFirst({
            where: {
                id: serviceId,
                shopId: shop.id,
            },
        });

        if (!existingService) {
            res.status(404).json({
                success: false,
                message: "Service not found or does not belong to this user",
            });
            return;
        }

        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: serviceData,
        });

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: updatedService,
        });

    } catch (error) {

         if (error instanceof Prisma.PrismaClientKnownRequestError) {
            logger.error(`Prisma error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: "Database error happend. Please Try Again.",
            });
        } else if (error instanceof z.ZodError) {
            logger.error(`Validation error happend: ${error.message}`);
            res.status(400).json({
                success: false,
                message: "Validation error happend.",
                error: error.errors,
            });
        } else {
            logger.error(`Some unknown error happend: ${error}`);
            res.status(500).json({
                success: false,
                message: "Some unknown error happend at our side.",
            });
            return;
        }
   
    }
};

export {addService, deleteService, updateService, getAllServicesForShopper, getOneService} 
