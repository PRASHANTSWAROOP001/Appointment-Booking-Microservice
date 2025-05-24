import { Router } from "express";
import { addShopDetails,getShopDetails, getShopLocation,updateShopDetails} from "../controller/SellerController";
const router = Router();


router.post("/create-shop",addShopDetails);
router.get("/get-shop", getShopDetails);
router.get("/get-shop-location", getShopLocation)
router.put("/update-shop/:id",updateShopDetails)
router.delete("/delete-shop", )
