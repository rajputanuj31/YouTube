import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { toggleLikeVideo, getAllLikedVideos } from "../controllers/like.controller.js";
const router = express.Router();

router.use(verifyAccessToken);

router.post("/toggle-like-video/:videoId", toggleLikeVideo);
router.get("/get-all-liked-videos", getAllLikedVideos);

export default router;