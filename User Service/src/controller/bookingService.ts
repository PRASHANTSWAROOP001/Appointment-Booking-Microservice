import { PrismaClient, Prisma } from "@prisma/client";
import logger from "../utils/logger";
import { Request, Response } from "express";
import validateWithSchema from "../utils/validation";
import z from "zod";

interface VerifiedUserRequest extends Request {
    userId?: number;
    role?: string;
}

const prisma = new PrismaClient();

const serviceBookingSchema = z.object({
    serviceId: z.string(),
    shopId: z.string(),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    appointmentTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

const serviceBooking = async (req: VerifiedUserRequest, res: Response) => {
    logger.info("book service endpoint is hit.");

    try {
        const bookingData = validateWithSchema(serviceBookingSchema, req.body);

        const userId = req.userId;

        if (!userId) {
            logger.warn("missing user id");
            res.status(401).json({
                success: false,
                message: "missing userId",
            });
            return;
        }

        const validatedService = await prisma.service.findFirst({
            where: {
                id: bookingData.serviceId,
                shopId: bookingData.shopId,
            },
            include: {
                Shop: true,
            },
        });

        if (!validatedService) {
            logger.warn("serviceid associated data could not be found to book");
            res.status(404).json({
                success: false,
                message: "Error could not find service to book",
            });
            return;
        }

        const appointmentStart = new Date(
            `${bookingData.appointmentDate}T${bookingData.appointmentTime}:00+05:30`
        );

        const shopOpen = new Date(
            `${bookingData.appointmentDate}T${validatedService.Shop.openTime}:00+05:30`
        );
        const shopClose = new Date(
            `${bookingData.appointmentDate}T${validatedService.Shop.closeTime}:00+05:30`
        );

        if (appointmentStart < shopOpen || appointmentStart >= shopClose) {
            res.status(400).json({
                success: false,
                message: "selected time is outside the booking time",
            });

            return;
        }

        const todaysDate = new Date();

        const dateDifference = appointmentStart.getTime() - todaysDate.getTime();

        const hoursDifference = dateDifference / (1000 * 60 * 60);

        // if (
        //     validatedService.Shop.advanceBooking &&
        //     hoursDifference < validatedService.Shop.advanceBooking
        // ) {
        //     res.status(400).json({
        //         success: false,
        //         message: `booking allowed only before ${validatedService.Shop.advanceBooking} hours`,
        //     });

        //     return;
        // }

        const appointmentEnd = new Date(
            appointmentStart.getTime() + validatedService.duration * 60 * 1000
        );

        const conflict = await prisma.booking.findFirst({
            where: {
                shopId: validatedService.shopId,
                appointmentTime: {
                    lt: appointmentEnd,
                },
                endTime: {
                    gt: appointmentStart,
                },
                status: {
                    in: ["PENDING", "CONFIRMED"],
                },
            },
        });

        if (conflict) {
            res.status(400).json({
                success: false,
                message: "Selected time slot is already booked",
            });
            return;
        }

        const newBooking = await prisma.booking.create({
            data:{
                appointmentTime:appointmentStart,
                endTime:appointmentEnd,
                totalPrice:validatedService.price,
                customerId:userId,
                serviceId:validatedService.id,
                shopId:validatedService.Shop.id,
            }
        })

        const newBookingHistory = await prisma.bookingHistory.create({
            data:{
                changedBy:userId,
                bookingId:newBooking.id,
                status:"PENDING"
            }
        })

        res.json({
            success:true,
            message:"booking intiated successfully",
            bookingHistory:newBookingHistory,
            booking:newBooking
        })

    } catch (error) {
         if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Prisma error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Database error happend. Please Try Again.'
      })
    }
    else if (error instanceof z.ZodError) {
      logger.error(`Validation error happend: ${error.message}`)
      res.status(400).json({
        success: false,
        message: 'Validation error happend.',
        error: error.errors
      })
    }
    else {
      logger.error(`Some unknown error happend: ${error}`)
      res.status(500).json({
        success: false,
        message: "Some unknown error happend at our side."
      })
      return;
    }
    }
};



export {serviceBooking}
