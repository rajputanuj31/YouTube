import express from "express";
import { localFileUpload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { uploadVideo, deleteVideo, getVideoById, updateVideo, getAllVideos } from "../controllers/video.controller.js";
const router = express.Router();

router.use(verifyAccessToken);

router.post("/upload-video", localFileUpload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }]),
    uploadVideo);
router.delete("/delete-video/:videoId", deleteVideo);
router.get("/get-video/:videoId", getVideoById);
router.patch("/update-video/:videoId", updateVideo);
router.get("/get-all-videos", getAllVideos);

export default router;