import { Router } from "express";
import {createUser, loginUser, logoutUser, generateNewAccessToken} from "../controller/Authcontroller"
const router = Router();

router.post("/create-user", createUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser)
router.post("/generate-token", generateNewAccessToken)


export default router;
