import { Router } from "express";

import { searchAllServices } from "../controller/searchServices";
const router = Router();

router.get("/search", searchAllServices);


export default router;