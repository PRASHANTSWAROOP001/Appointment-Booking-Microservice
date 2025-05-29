import { Router } from "express";
import { addLocations, deleteShopLocation, getShopLocation, updateLocation } from "../controller/SellerLocation";


const router = Router()

router.post("/add-location", addLocations);
router.delete("/delete-location", deleteShopLocation);
router.get("/get-location/:shopId", getShopLocation);
router.put("/update-location/:locationId", updateLocation)


export default router;