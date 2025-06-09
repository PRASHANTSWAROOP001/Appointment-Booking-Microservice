import { Router } from "express";
import { serviceBooking } from "../controller/bookingService";

const router = Router();

router.post("/book", serviceBooking);

export default router;