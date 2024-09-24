import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { localFileUpload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", localFileUpload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    }
]), registerUser);

router.post("/login", loginUser);
router.post("/logout", verifyAccessToken, logoutUser);
export default router;