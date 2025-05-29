import { Router } from "express";
import { addService, deleteService, updateService, getOneService, getAllServicesForShopper } from "../controller/SellerService";


const router = Router();


router.post("/add-service", addService);
router.delete("/delete-service", deleteService)
router.get("/get-all",getAllServicesForShopper)
router.get("/get-one/:serviceId", getOneService)
router.put("/update-service/:serviceId", updateService)

export default router;