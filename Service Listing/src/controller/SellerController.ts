import { Prisma, PrismaClient } from "../../generated/prisma";
import logger from "../utils/logger";
import { Request, Response } from "express";
import validateWithSchema from "../utils/validation";
import z from "zod";
import { VerifiedSellerRequest } from "../middleware/authMiddleware";


const prisma = new PrismaClient();

const sellerDetailsSchema = z.object({
    name: z.string().min(4),
    category: z.string().min(4),
    description: z.string().min(5),
    openTime: z
        .string()
        .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Invalid time format (HH:mm) in 24 hour format"
        ),
    closeTime: z
        .string()
        .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Invalid time format (HH:mm) in 24 hour format"
        ),
});

const addShopDetails = async (
    req: VerifiedSellerRequest,
    res: Response
): Promise<void> => {
    logger.info("addSellerDetails Endpoint is hit.");

    try {
        const userId = req.userId;

        const validatedData = validateWithSchema(sellerDetailsSchema, req.body);

        const verifyUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!verifyUser) {
            res.status(404).json({
                success: false,
                message: "Seller could not be found.",
            });
            logger.info("user does not exit to add account details");
            return;
        }

        const addShopDetails = await prisma.shop.create({
            data: {
                userId: verifyUser.id,
                ...validatedData,
            },
        });

        res.json({
            success: true,
            message: "Shop Details addedd successfully",
            shopName: addShopDetails.name,
            id: addShopDetails.id,
        });
    } catch (error: unknown) {
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

const getShopDetails = async (
    req: VerifiedSellerRequest,
    res: Response
): Promise<void> => {
    logger.info("get shop details end point hit.");
    try {
        const userId = req.userId;

        const getShopDetails = await prisma.shop.findUnique({
            where: {
                userId: userId,
            },
        });

        if (!getShopDetails) {
            res.status(404).json({
                success: false,
                message: "Shop details could not be found.",
            });
            logger.info("could not found the shop detatils");
            return;
        }

        res.json({
            success: true,
            message: "Details found",
            data: getShopDetails,
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

const deleteShopDetails = async (
    req: VerifiedSellerRequest,
    res: Response
): Promise<void> => {
    logger.info("delete Shop Details endpoint hit.");
    try {
        const userId = req.userId;

        const verifyUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!verifyUser) {
            res.status(404).json({
                success: false,
                message: "Seller could not be found.",
            });
            logger.info("user does not exit to add account details");
            return;
        }

        const deletedShopDetails = await prisma.shop.delete({
            where: {
                userId: userId,
            },
        });

        res.json({
            success: true,
            message: "Shop detail deleted successfully",
            data: deletedShopDetails,
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

const updateShopDetails = async (
    req: VerifiedSellerRequest,
    res: Response
): Promise<void> => {
    logger.info("update shop endpoint is hit.");

    try {
        const shopId: string | undefined = req.params.id;

        if (!shopId) {
            res.status(400).json({
                success: false,
                message: "please pass shop id in params",
            });
            logger.warn("user did not provided shopId in paramas as id");
            return;
        }

        const validatedData = validateWithSchema(sellerDetailsSchema, req.body);

        const updatedShopDetails = await prisma.shop.update({
            where: {
                id: shopId,
            },
            data: {
                ...validatedData,
            },
        });

        res.json({
            success: true,
            message: "Success true.",
            data: updatedShopDetails,
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
        const shopId: string | undefined = req.body;

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

export { addLocations, addShopDetails, deleteShopDetails, deleteShopLocation, updateShopDetails, getShopDetails, getShopLocation, }
