import express from "express";
import { localFileUpload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { uploadVideo, deleteVideo, getVideoById, updateVideo } from "../controllers/video.controller.js";
const router = express.Router();

router.post("/upload-video", verifyAccessToken, localFileUpload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }]),
    uploadVideo);
router.delete("/delete-video/:videoId", verifyAccessToken, deleteVideo);
router.get("/get-video/:videoId", verifyAccessToken, getVideoById);
router.patch("/update-video/:videoId", verifyAccessToken, updateVideo);


export default router;