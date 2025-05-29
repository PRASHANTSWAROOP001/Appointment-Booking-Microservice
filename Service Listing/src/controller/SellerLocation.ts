import {z} from "zod"
import logger from "../utils/logger";
import { Request, Response } from "express";
import validateWithSchema from "../utils/validation";
import { PrismaClient, Prisma } from "../../generated/prisma";


const prisma = new PrismaClient();



const shopLocationSchema = z.object({
    shopId: z.string(),
    address: z.string().min(5),
    city: z.string().min(3),
    zipCode: z.string().min(3),
    state: z.string().min(2),
    country: z.string().min(3),
});

const addLocations = async (req: Request, res: Response) => {
    logger.info("add location end point is hit");
    try {
        const validatedData = validateWithSchema(shopLocationSchema, req.body);

        const addedLocationDetails = await prisma.location.create({
            data: {
                ...validatedData,
            },
        });

        res.json({
            success: true,
            message: "location added successfully",
            data: addedLocationDetails,
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

const getShopLocation = async (req: Request, res: Response) => {
    logger.info("get location end point is hit.");
    try {
        const {shopId} = req.params;

        if (!shopId) {
            res.status(401).json({
                success: false,
                message: "missing shopId.",
            });
            logger.info("get shop location request without shopId");
            return;
        }

        const shopLocationDetails = await prisma.location.findUnique({
            where: {
                shopId: shopId,
            },
        });

        if (!shopLocationDetails) {
            res.status(404).json({
                success: false,
                message: "shop location details could not be found.",
            });
            logger.info("shop details could not be found");
            return;
        }

        res.json({
            success: true,
            data: shopLocationDetails,
        });
    } catch (error: unknown) {
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
};

const deleteShopLocation = async (req: Request, res: Response) => {
    logger.info("delete location end point is hit");
    try {
        const locationId: string | undefined = req.body;

        if (!locationId || typeof locationId != "string") {
            res.status(401).json({
                success: false,
                message: "missing locationId or wrong type of locationId",
            });
            logger.warn("locationId is missing to delete the location details");
            return;
        }

        const deleteLocation = await prisma.location.delete({
            where: { id: locationId },
        });

        if (!locationId) {
            res
                .status(404)
                .json({
                    success: false,
                    message: "location details could not be found to delete",
                });
            logger.info("location detail could not be found");
            return;
        }

        res.json({
            success: true,
            message: "shop location is deleted successfully",
        });
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
};

const updateLocation = async (req:Request, res:Response)=>{
    try {

        const validatedData = validateWithSchema(shopLocationSchema, req.body);
        
        const {locationId} = req.params;

        if(!locationId){
            res.status(403).json({
                success:false,
                message:"Error params is missing locationId"
            })
            logger.warn("missing locationId in params");
            return;
        }

        const locationDetails = await prisma.location.findUnique({
            where:{
                id:locationId
            }
        })

        if(!locationDetails){
            res.status(404).json({
                success:false,
                message:"could not find location details"
            })
            logger.warn("could not find the location details")
            return;
        }

        const updateLocation = await prisma.location.update({
            where:{
                id:locationDetails.id
            },
            data:{
                ...validatedData
            }
        })

        if(!updateLocation){
            res.status(403).json({
                success:false,
                message:"could not update location details"
            })

            return;
         
        }

        res.json({
            success:true,
            data:updateLocation
        })




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

export {addLocations, deleteShopLocation, getShopLocation,updateLocation}