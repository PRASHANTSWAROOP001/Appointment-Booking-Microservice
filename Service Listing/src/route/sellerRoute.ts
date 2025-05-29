import { Router } from "express";
import { addShopDetails,getShopDetails,updateShopDetails, deleteShopDetails} from "../controller/SellerController";
const router = Router();


router.post("/create-shop",addShopDetails);
router.get("/get-shop", getShopDetails);
router.put("/update-shop/:id",updateShopDetails)
router.delete("/delete-shop",deleteShopDetails)



export default router;