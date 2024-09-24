import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";
import { getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, changeUserPassword } from "../controllers/user.controller.js";
import { localFileUpload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { deleteUser } from "../controllers/user.controller.js";
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
router.get("/current-user", verifyAccessToken, getCurrentUser);
router.post("/update-account-details", verifyAccessToken, updateAccountDetails);
router.post("/update-avatar", verifyAccessToken, localFileUpload.single("avatar"), updateAvatar);
router.post("/update-cover-image", verifyAccessToken, localFileUpload.single("coverImage"), updateCoverImage);
router.post("/change-password", verifyAccessToken, changeUserPassword);
router.delete("/delete-user", verifyAccessToken, deleteUser);

router.post("/login", loginUser);

router.post("/logout", verifyAccessToken, logoutUser);
export default router;